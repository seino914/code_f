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
  UserPublicInfo,
  toUserPublicInfo,
} from '../../../domain/entities/user.entity';

/**
 * 登録入力データ
 */
export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  company: string;
}

/**
 * 登録出力データ
 */
export interface RegisterOutput {
  message: string;
  user: UserPublicInfo;
}

/**
 * 登録結果タイプ
 */
export type RegisterResult =
  | { success: true; data: RegisterOutput }
  | { success: false; error: RegisterError };

/**
 * 登録エラータイプ
 */
export type RegisterError =
  | { type: 'EMAIL_ALREADY_EXISTS'; message: string }
  | { type: 'WEAK_PASSWORD'; message: string; errors: string[] };

/**
 * ユーザー登録ユースケース
 * 新規ユーザーの作成を担当
 */
@Injectable()
export class RegisterUseCase {
  private readonly logger = new Logger(RegisterUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_SERVICE)
    private readonly passwordService: IPasswordService,
  ) {}

  /**
   * 登録処理を実行
   * @param input 登録入力データ
   * @returns 登録結果
   */
  async execute(input: RegisterInput): Promise<RegisterResult> {
    // メールアドレスの重複チェック
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      return {
        success: false,
        error: {
          type: 'EMAIL_ALREADY_EXISTS',
          message: 'このメールアドレスは既に登録されています',
        },
      };
    }

    // パスワード強度チェック
    const passwordStrength = this.passwordService.checkStrength(input.password);
    if (!passwordStrength.isValid) {
      return {
        success: false,
        error: {
          type: 'WEAK_PASSWORD',
          message: `パスワードの強度が不足しています: ${passwordStrength.errors.join(', ')}`,
          errors: passwordStrength.errors,
        },
      };
    }

    // パスワードをハッシュ化
    const hashedPassword = await this.passwordService.hash(input.password);

    // ユーザーを作成
    const user = await this.userRepository.create({
      email: input.email,
      password: hashedPassword,
      name: input.name,
      company: input.company,
    });

    this.logger.log(`User registered successfully: ${user.email}`);

    return {
      success: true,
      data: {
        message: 'ユーザー登録が完了しました',
        user: toUserPublicInfo(user),
      },
    };
  }
}
