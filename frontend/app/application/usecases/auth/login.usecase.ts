import { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import { LoginCredentials, LoginResult } from '../../../domain/entities/user.entity';

/**
 * ログインユースケースの結果
 */
export type LoginUseCaseResult =
  | { success: true; data: LoginResult }
  | { success: false; error: string };

/**
 * ログインユースケース
 * ユーザー認証を担当
 */
export class LoginUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  /**
   * ログインを実行
   * @param credentials ログイン情報
   * @returns ログイン結果
   */
  async execute(credentials: LoginCredentials): Promise<LoginUseCaseResult> {
    try {
      const result = await this.authRepository.login(credentials);
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof Error) {
        return { success: false, error: error.message };
      }
      return { success: false, error: 'ログインに失敗しました' };
    }
  }
}
