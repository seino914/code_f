import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { UpdateUserInput, UpdateUserResult } from '../../../domain/entities/user.entity';

/**
 * ユーザー更新ユースケースの結果
 */
export type UpdateUserUseCaseResult =
  | { success: true; data: UpdateUserResult }
  | { success: false; error: string };

/**
 * ユーザー更新ユースケース
 * ユーザー情報の更新を担当
 */
export class UpdateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * ユーザー情報を更新
   * @param input 更新情報
   * @returns 更新結果
   */
  async execute(input: UpdateUserInput): Promise<UpdateUserUseCaseResult> {
    try {
      const result = await this.userRepository.updateUser(input);
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof Error) {
        return { success: false, error: error.message };
      }
      return { success: false, error: 'ユーザー情報の更新に失敗しました' };
    }
  }
}
