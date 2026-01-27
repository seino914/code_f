import { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import { RegisterInput, RegisterResult } from '../../../domain/entities/user.entity';

/**
 * 登録ユースケースの結果
 */
export type RegisterUseCaseResult =
  | { success: true; data: RegisterResult }
  | { success: false; error: string };

/**
 * 登録ユースケース
 * ユーザー登録を担当
 */
export class RegisterUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  /**
   * 登録を実行
   * @param input 登録情報
   * @returns 登録結果
   */
  async execute(input: RegisterInput): Promise<RegisterUseCaseResult> {
    try {
      const result = await this.authRepository.register(input);
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof Error) {
        return { success: false, error: error.message };
      }
      return { success: false, error: '登録に失敗しました' };
    }
  }
}
