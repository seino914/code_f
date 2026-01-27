import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { User } from '../../../domain/entities/user.entity';

/**
 * ユーザー取得ユースケースの結果
 */
export type GetUserUseCaseResult =
  | { success: true; data: User }
  | { success: false; error: string };

/**
 * ユーザー取得ユースケース
 * 現在のユーザー情報の取得を担当
 */
export class GetUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * ユーザー情報を取得
   * @returns ユーザー情報
   */
  async execute(): Promise<GetUserUseCaseResult> {
    try {
      const user = await this.userRepository.getCurrentUser();
      return { success: true, data: user };
    } catch (error) {
      if (error instanceof Error) {
        return { success: false, error: error.message };
      }
      return { success: false, error: 'ユーザー情報の取得に失敗しました' };
    }
  }
}
