import {
  User,
  CreateUserInput,
  UpdateUserInput,
} from '../entities/user.entity';

/**
 * ユーザーリポジトリインターフェース
 * ドメイン層で定義し、Infrastructure層で実装
 */
export interface IUserRepository {
  /**
   * IDでユーザーを検索
   * @param id ユーザーID
   * @returns ユーザーまたはundefined
   */
  findById(id: string): Promise<User | undefined>;

  /**
   * メールアドレスでユーザーを検索
   * @param email メールアドレス
   * @returns ユーザーまたはundefined
   */
  findByEmail(email: string): Promise<User | undefined>;

  /**
   * ユーザーを作成
   * @param input 作成用データ
   * @returns 作成されたユーザー
   */
  create(input: CreateUserInput): Promise<User>;

  /**
   * ユーザー情報を更新
   * @param id ユーザーID
   * @param input 更新用データ
   * @returns 更新されたユーザー
   */
  update(id: string, input: UpdateUserInput): Promise<User>;

  /**
   * ログイン試行回数を更新
   * @param id ユーザーID
   * @param failedAttempts 失敗回数
   * @param lockedUntil ロック解除時刻（nullでロック解除）
   * @returns 更新されたユーザー
   */
  updateLoginAttempts(
    id: string,
    failedAttempts: number,
    lockedUntil: Date | null,
  ): Promise<User>;

  /**
   * ログイン成功時のリセット
   * @param id ユーザーID
   * @returns 更新されたユーザー
   */
  resetLoginAttempts(id: string): Promise<User>;
}

/**
 * ユーザーリポジトリのDIトークン
 */
export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
