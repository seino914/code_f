import { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';

/**
 * ログアウトユースケースの結果
 */
export type LogoutUseCaseResult =
  | { success: true }
  | { success: false; error: string };

/**
 * ログアウトユースケース
 * ログアウト処理を担当
 */
export class LogoutUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  /**
   * ログアウトを実行
   * @returns ログアウト結果
   */
  async execute(): Promise<LogoutUseCaseResult> {
    try {
      await this.authRepository.logout();
      return { success: true };
    } catch (error) {
      if (error instanceof Error) {
        return { success: false, error: error.message };
      }
      return { success: false, error: 'ログアウトに失敗しました' };
    }
  }
}
