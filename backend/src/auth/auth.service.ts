import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, LoginResponseDto } from './dto/login.dto';

/**
 * 認証サービス
 * ユーザーのログイン処理とJWTトークン生成を担当
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly MAX_LOGIN_ATTEMPTS = 5; // 最大ログイン試行回数
  private readonly LOCK_DURATION_MS = 15 * 60 * 1000; // ロック時間（15分）

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
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
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    // ユーザーが存在する場合、アカウントロック状態をチェック
    if (user) {
      // ロックが解除されているかチェック
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        const remainingMinutes = Math.ceil(
          (user.lockedUntil.getTime() - Date.now()) / (60 * 1000),
        );
        throw new ForbiddenException(
          `アカウントがロックされています。${remainingMinutes}分後に再試行してください。`,
        );
      }

      // ロックが解除されている場合は、ロック状態をリセット
      if (user.lockedUntil && user.lockedUntil <= new Date()) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: 0,
            lockedUntil: null,
          },
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
      throw new UnauthorizedException('メールアドレスまたはパスワードが正しくありません');
    }

    // パスワードの検証
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      // ログイン失敗回数を増加
      const newFailedAttempts = user.failedLoginAttempts + 1;
      const shouldLock = newFailedAttempts >= this.MAX_LOGIN_ATTEMPTS;

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: newFailedAttempts,
          lockedUntil: shouldLock
            ? new Date(Date.now() + this.LOCK_DURATION_MS)
            : null,
        },
      });

      if (shouldLock) {
        this.logger.warn(
          `Account locked due to too many failed login attempts: ${user.email}`,
        );
        throw new ForbiddenException(
          `ログイン試行回数が上限に達しました。アカウントは15分間ロックされます。`,
        );
      }

      const remainingAttempts = this.MAX_LOGIN_ATTEMPTS - newFailedAttempts;
      throw new UnauthorizedException(
        `メールアドレスまたはパスワードが正しくありません。残り試行回数: ${remainingAttempts}`,
      );
    }

    // ログイン成功: 失敗回数をリセット
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
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
}

