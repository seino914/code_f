import { User, UpdateUserInput, UpdateUserResult } from '../entities/user.entity';

/**
 * ユーザーリポジトリインターフェース
 * ユーザー関連のデータ操作を定義
 */
export interface IUserRepository {
  /**
   * 現在のユーザー情報を取得
   * @returns ユーザー情報
   */
  getCurrentUser(): Promise<User>;

  /**
   * ユーザー情報を更新
   * @param input 更新情報
   * @returns 更新結果
   */
  updateUser(input: UpdateUserInput): Promise<UpdateUserResult>;
}
