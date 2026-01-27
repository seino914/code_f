import { Injectable, Inject, Logger } from '@nestjs/common';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../domain/repositories/user.repository.interface';
import {
  IPasswordService,
  PASSWORD_SERVICE,
} from '../../../domain/services/password.service.interface';
import {
  IJwtService,
  JWT_SERVICE,
} from '../../../domain/services/jwt.service.interface';
import {
  UserPublicInfo,
  toUserPublicInfo,
} from '../../../domain/entities/user.entity';

/**
 * ログイン入力データ
 */
export interface LoginInput {
  email: string;
  password: string;
}

/**
 * ログイン出力データ
 */
export interface LoginOutput {
  accessToken: string;
  user: UserPublicInfo;
}

/**
 * ログイン結果タイプ
 */
export type LoginResult =
  | { success: true; data: LoginOutput }
  | { success: false; error: LoginError };

/**
 * ログインエラータイプ
 */
export type LoginError =
  | { type: 'INVALID_CREDENTIALS'; message: string; remainingAttempts?: number }
  | { type: 'ACCOUNT_LOCKED'; message: string; remainingMinutes: number };

/**
 * ログインユースケース
 * ユーザー認証とJWTトークン生成を担当
 */
@Injectable()
export class LoginUseCase {
  private readonly logger = new Logger(LoginUseCase.name);
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCK_DURATION_MS = 15 * 60 * 1000; // 15分

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_SERVICE)
    private readonly passwordService: IPasswordService,
    @Inject(JWT_SERVICE)
    private readonly jwtService: IJwtService,
  ) {}

  /**
   * ログイン処理を実行
   * @param input ログイン入力データ
   * @returns ログイン結果
   */
  async execute(input: LoginInput): Promise<LoginResult> {
    // メールアドレスでユーザーを検索
    const user = await this.userRepository.findByEmail(input.email);

    // アカウントロック状態をチェック
    if (user) {
      const lockResult = await this.checkAccountLock(user.id, user.lockedUntil);
      if (!lockResult.success) {
        return lockResult;
      }
    }

    // ユーザーが存在しない、またはパスワードが設定されていない場合
    if (!user || !user.password) {
      // タイミング攻撃対策: ダミーのハッシュで比較を実行
      await this.performDummyPasswordCheck(input.password);
      return {
        success: false,
        error: {
          type: 'INVALID_CREDENTIALS',
          message: 'メールアドレスまたはパスワードが正しくありません',
        },
      };
    }

    // パスワード検証
    const isPasswordValid = await this.passwordService.compare(
      input.password,
      user.password,
    );

    if (!isPasswordValid) {
      return await this.handleFailedLogin(user.id, user.failedLoginAttempts);
    }

    // ログイン成功: 失敗回数をリセット
    await this.userRepository.resetLoginAttempts(user.id);

    // JWTトークンを生成
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    this.logger.log(`User logged in successfully: ${user.email}`);

    return {
      success: true,
      data: {
        accessToken,
        user: toUserPublicInfo(user),
      },
    };
  }

  /**
   * アカウントロック状態をチェック
   */
  private async checkAccountLock(
    userId: string,
    lockedUntil: Date | undefined,
  ): Promise<LoginResult | { success: true }> {
    if (!lockedUntil) {
      return { success: true };
    }

    // ロックが解除されているかチェック
    if (lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil(
        (lockedUntil.getTime() - Date.now()) / (60 * 1000),
      );
      return {
        success: false,
        error: {
          type: 'ACCOUNT_LOCKED',
          message: `アカウントがロックされています。${remainingMinutes}分後に再試行してください。`,
          remainingMinutes,
        },
      };
    }

    // ロックが解除されている場合はリセット
    await this.userRepository.resetLoginAttempts(userId);
    return { success: true };
  }

  /**
   * タイミング攻撃対策のダミーパスワードチェック
   */
  private async performDummyPasswordCheck(password: string): Promise<void> {
    const dummyHash =
      '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
    await this.passwordService.compare(password, dummyHash);
  }

  /**
   * ログイン失敗時の処理
   */
  private async handleFailedLogin(
    userId: string,
    currentFailedAttempts: number,
  ): Promise<LoginResult> {
    const newFailedAttempts = currentFailedAttempts + 1;
    const shouldLock = newFailedAttempts >= this.MAX_LOGIN_ATTEMPTS;

    await this.userRepository.updateLoginAttempts(
      userId,
      newFailedAttempts,
      shouldLock ? new Date(Date.now() + this.LOCK_DURATION_MS) : null,
    );

    if (shouldLock) {
      this.logger.warn(`Account locked due to too many failed login attempts`);
      return {
        success: false,
        error: {
          type: 'ACCOUNT_LOCKED',
          message:
            'ログイン試行回数が上限に達しました。アカウントは15分間ロックされます。',
          remainingMinutes: 15,
        },
      };
    }

    const remainingAttempts = this.MAX_LOGIN_ATTEMPTS - newFailedAttempts;
    return {
      success: false,
      error: {
        type: 'INVALID_CREDENTIALS',
        message: `メールアドレスまたはパスワードが正しくありません。残り試行回数: ${remainingAttempts}`,
        remainingAttempts,
      },
    };
  }
}
