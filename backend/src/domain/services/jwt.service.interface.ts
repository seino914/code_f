/**
 * JWTペイロード
 */
export interface JwtPayload {
  sub: string; // ユーザーID
  email: string;
  iat?: number; // 発行日時
  exp?: number; // 有効期限
}

/**
 * JWTサービスインターフェース
 * トークン生成・検証を定義
 */
export interface IJwtService {
  /**
   * JWTトークンを生成
   * @param payload ペイロード
   * @returns JWTトークン
   */
  sign(payload: Omit<JwtPayload, 'iat' | 'exp'>): string;

  /**
   * JWTトークンを検証・デコード
   * @param token JWTトークン
   * @returns デコードされたペイロード
   */
  verify(token: string): JwtPayload;

  /**
   * JWTトークンの有効期限を取得
   * @param token JWTトークン
   * @returns 有効期限（Date）
   */
  getExpiration(token: string): Date;
}

/**
 * JWTサービスのDIトークン
 */
export const JWT_SERVICE = Symbol('JWT_SERVICE');
