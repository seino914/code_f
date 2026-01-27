/**
 * ブラックリストトークンエンティティ
 * ログアウト時に無効化されたJWTトークンを記録
 */
export interface BlacklistedToken {
  readonly id: string;
  readonly token: string;
  readonly expiresAt: Date;
  readonly createdAt: Date;
}

/**
 * ブラックリストトークン作成用の入力データ
 */
export interface CreateBlacklistedTokenInput {
  token: string;
  expiresAt: Date;
}
