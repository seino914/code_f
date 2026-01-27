import {
  LoginCredentials,
  LoginResult,
  RegisterInput,
  RegisterResult,
} from '../entities/user.entity';

/**
 * 認証リポジトリインターフェース
 * 認証関連のデータ操作を定義
 */
export interface IAuthRepository {
  /**
   * ログイン
   * @param credentials ログイン情報
   * @returns ログイン結果
   */
  login(credentials: LoginCredentials): Promise<LoginResult>;

  /**
   * ユーザー登録
   * @param input 登録情報
   * @returns 登録結果
   */
  register(input: RegisterInput): Promise<RegisterResult>;

  /**
   * ログアウト
   */
  logout(): Promise<void>;
}
