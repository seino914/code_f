import {
  BlacklistedToken,
  CreateBlacklistedTokenInput,
} from '../entities/blacklisted-token.entity';

/**
 * トークンリポジトリインターフェース
 * JWTトークンのブラックリスト管理
 */
export interface ITokenRepository {
  /**
   * トークンをブラックリストに追加
   * @param input 作成用データ
   * @returns 作成されたブラックリストトークン
   */
  addToBlacklist(input: CreateBlacklistedTokenInput): Promise<BlacklistedToken>;

  /**
   * トークンがブラックリストに存在するか確認
   * @param token トークン
   * @returns 存在する場合true
   */
  isBlacklisted(token: string): Promise<boolean>;

  /**
   * 期限切れのトークンを削除
   * @returns 削除された件数
   */
  cleanupExpired(): Promise<number>;
}

/**
 * トークンリポジトリのDIトークン
 */
export const TOKEN_REPOSITORY = Symbol('TOKEN_REPOSITORY');
