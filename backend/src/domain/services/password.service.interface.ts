/**
 * パスワード強度チェック結果
 */
export interface PasswordStrengthResult {
  isValid: boolean;
  errors: string[];
}

/**
 * パスワードサービスインターフェース
 * パスワード関連のビジネスルールを定義
 */
export interface IPasswordService {
  /**
   * パスワードをハッシュ化
   * @param password 平文パスワード
   * @returns ハッシュ化されたパスワード
   */
  hash(password: string): Promise<string>;

  /**
   * パスワードを検証
   * @param password 平文パスワード
   * @param hashedPassword ハッシュ化されたパスワード
   * @returns 一致する場合true
   */
  compare(password: string, hashedPassword: string): Promise<boolean>;

  /**
   * パスワード強度をチェック
   * @param password パスワード
   * @returns 強度チェック結果
   */
  checkStrength(password: string): PasswordStrengthResult;
}

/**
 * パスワードサービスのDIトークン
 */
export const PASSWORD_SERVICE = Symbol('PASSWORD_SERVICE');
