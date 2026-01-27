import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import {
  User,
  UpdateUserInput,
  UpdateUserResult,
} from '../../domain/entities/user.entity';
import { ApiClient, apiClient } from '../api/api-client';

/**
 * ユーザーリポジトリ実装
 * バックエンドAPIとの通信を担当
 */
export class UserRepository implements IUserRepository {
  constructor(private readonly api: ApiClient = apiClient) {}

  async getCurrentUser(): Promise<User> {
    return this.api.get<User>('/users/user');
  }

  async updateUser(input: UpdateUserInput): Promise<UpdateUserResult> {
    return this.api.patch<UpdateUserResult>('/users/update', input);
  }
}

/**
 * デフォルトのユーザーリポジトリインスタンス
 */
export const userRepository = new UserRepository();
