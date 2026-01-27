/**
 * ユーザーエンティティ
 * ドメイン層のビジネスオブジェクト
 */
export interface User {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly company: string;
  readonly password: string;
  readonly role?: string;
  readonly failedLoginAttempts: number;
  readonly lockedUntil?: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * ユーザー作成用の入力データ
 */
export interface CreateUserInput {
  email: string;
  name: string;
  company: string;
  password: string;
}

/**
 * ユーザー更新用の入力データ
 */
export interface UpdateUserInput {
  name?: string;
  company?: string;
  email?: string;
}

/**
 * ユーザー公開情報（パスワードを除く）
 */
export interface UserPublicInfo {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly company: string;
}

/**
 * ユーザーエンティティからパスワードを除いた公開情報を抽出
 * @param user ユーザーエンティティ
 * @returns ユーザー公開情報
 */
export function toUserPublicInfo(user: User): UserPublicInfo {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    company: user.company,
  };
}
