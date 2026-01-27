/**
 * ユーザーエンティティ
 * ドメイン層のビジネスオブジェクト
 */
export interface User {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly company: string;
}

/**
 * ログイン入力データ
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * ログイン結果
 */
export interface LoginResult {
  accessToken: string;
  user: User;
}

/**
 * 登録入力データ
 */
export interface RegisterInput {
  email: string;
  password: string;
  passwordConfirm: string;
  name: string;
  company: string;
}

/**
 * 登録結果
 */
export interface RegisterResult {
  message: string;
  user: User;
}

/**
 * ユーザー更新入力データ
 */
export interface UpdateUserInput {
  name: string;
  company: string;
  email: string;
}

/**
 * ユーザー更新結果
 */
export interface UpdateUserResult {
  message: string;
  user: User;
}
