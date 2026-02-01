import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from '../../users/repository/users.repository';
import { LoginDto, LoginResponseDto } from '../dto/login.dto';
import { RegisterDto, RegisterResponseDto } from '../dto/register.dto';
import { checkPasswordStrength } from '../../../shared/utils/password-strength.util';

/**
 * 認証用ユースケース
 * ビジネスロジック層を担当
 */
@Injectable()
export class AuthUsecase {
  private readonly logger = new Logger(AuthUsecase.name);
  private readonly MAX_LOGIN_ATTEMPTS = 5; // 最大ログイン試行回数
  private readonly LOCK_DURATION_MS = 15 * 60 * 1000; // ロック時間（15分）

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService
  ) {}

  /**
   * メールアドレスとパスワードでログイン
   * セキュリティ強化:
   * - ログイン試行回数の記録
   * - アカウントロック機能
   * - タイミング攻撃対策
   * @param loginDto ログイン情報
   * @returns アクセストークンとユーザー情報
   * @throws UnauthorizedException メールアドレスまたはパスワードが無効な場合
   * @throws ForbiddenException アカウントがロックされている場合
   */
  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    // メールアドレスでユーザーを検索
    const user = await this.usersRepository.findByEmail(loginDto.email);

    // ユーザーが存在する場合、アカウントロック状態をチェック
    if (user) {
      // ロックが解除されているかチェック
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        const remainingMinutes = Math.ceil(
          (user.lockedUntil.getTime() - Date.now()) / (60 * 1000)
        );
        throw new ForbiddenException(
          `アカウントがロックされています。${remainingMinutes}分後に再試行してください。`
        );
      }

      // ロックが解除されている場合は、ロック状態をリセット
      if (user.lockedUntil && user.lockedUntil <= new Date()) {
        await this.usersRepository.update(user.id, {
          failedLoginAttempts: 0,
          lockedUntil: null,
        });
      }
    }

    // ユーザーが存在しない、またはパスワードが設定されていない場合はエラー
    if (!user || !user.password) {
      // タイミング攻撃対策: ユーザーが存在しない場合でも、ダミーのハッシュでbcrypt.compareを実行
      // これにより、ユーザーの存在有無による応答時間の差をなくす
      const dummyHash =
        '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
      await bcrypt.compare(loginDto.password, dummyHash);
      throw new UnauthorizedException(
        'メールアドレスまたはパスワードが正しくありません'
      );
    }

    // パスワードの検証
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password
    );

    if (!isPasswordValid) {
      // ログイン失敗回数を増加
      const newFailedAttempts = user.failedLoginAttempts + 1;
      const shouldLock = newFailedAttempts >= this.MAX_LOGIN_ATTEMPTS;

      await this.usersRepository.update(user.id, {
        failedLoginAttempts: newFailedAttempts,
        lockedUntil: shouldLock
          ? new Date(Date.now() + this.LOCK_DURATION_MS)
          : null,
      });

      if (shouldLock) {
        this.logger.warn(
          `Account locked due to too many failed login attempts: ${user.email}`
        );
        throw new ForbiddenException(
          `ログイン試行回数が上限に達しました。アカウントは15分間ロックされます。`
        );
      }

      const remainingAttempts = this.MAX_LOGIN_ATTEMPTS - newFailedAttempts;
      throw new UnauthorizedException(
        `メールアドレスまたはパスワードが正しくありません。残り試行回数: ${remainingAttempts}`
      );
    }

    // ログイン成功: 失敗回数をリセット
    await this.usersRepository.update(user.id, {
      failedLoginAttempts: 0,
      lockedUntil: null,
    });

    // JWTトークンを生成
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    this.logger.log(`User logged in successfully: ${user.email}`);

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        company: user.company,
      },
    };
  }

  /**
   * ユーザー登録
   * セキュリティ強化:
   * - パスワード強度チェック
   * - メールアドレスの重複チェック
   * - パスワードのハッシュ化
   * @param registerDto 登録情報
   * @returns 登録成功メッセージとユーザー情報
   * @throws ConflictException メールアドレスが既に登録されている場合
   */
  async register(registerDto: RegisterDto): Promise<RegisterResponseDto> {
    // メールアドレスの重複チェック
    const existingUser = await this.usersRepository.findByEmail(
      registerDto.email
    );

    if (existingUser) {
      throw new ConflictException('このメールアドレスは既に登録されています');
    }

    // パスワード強度チェック
    const passwordStrength = checkPasswordStrength(registerDto.password);
    if (!passwordStrength.isValid) {
      throw new ConflictException(
        `パスワードの強度が不足しています: ${passwordStrength.errors.join(', ')}`
      );
    }

    // パスワードをハッシュ化
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

    // ユーザーを作成
    const user = await this.usersRepository.create({
      email: registerDto.email,
      password: hashedPassword,
      name: registerDto.name,
      company: registerDto.company,
      failedLoginAttempts: 0,
      lockedUntil: null,
    });

    this.logger.log(`User registered successfully: ${user.email}`);

    return {
      message: 'ユーザー登録が完了しました',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        company: user.company,
      },
    };
  }
}
