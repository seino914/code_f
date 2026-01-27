import { IAuthRepository } from '../../domain/repositories/auth.repository.interface';
import {
  LoginCredentials,
  LoginResult,
  RegisterInput,
  RegisterResult,
} from '../../domain/entities/user.entity';
import { ApiClient, apiClient } from '../api/api-client';

/**
 * 認証リポジトリ実装
 * バックエンドAPIとの通信を担当
 */
export class AuthRepository implements IAuthRepository {
  constructor(private readonly api: ApiClient = apiClient) {}

  async login(credentials: LoginCredentials): Promise<LoginResult> {
    return this.api.post<LoginResult>('/auth/login', credentials);
  }

  async register(input: RegisterInput): Promise<RegisterResult> {
    return this.api.post<RegisterResult>('/auth/register', input);
  }

  async logout(): Promise<void> {
    await this.api.post<void>('/auth/logout');
  }
}

/**
 * デフォルトの認証リポジトリインスタンス
 */
export const authRepository = new AuthRepository();
