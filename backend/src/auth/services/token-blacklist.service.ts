import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

/**
 * JWTトークンブラックリストサービス
 * ログアウト時にトークンを無効化し、セキュリティを強化
 */
@Injectable()
export class TokenBlacklistService {
  private readonly logger = new Logger(TokenBlacklistService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * トークンをブラックリストに追加
   * @param token JWTトークン
   */
  async addToBlacklist(token: string): Promise<void> {
    try {
      // トークンをデコードして有効期限を取得
      const decoded = this.jwtService.decode(token) as {
        exp?: number;
      } | null;

      if (!decoded || !decoded.exp) {
        this.logger.warn('Invalid token format, cannot add to blacklist');
        return;
      }

      // 有効期限をDateオブジェクトに変換
      const expiresAt = new Date(decoded.exp * 1000);

      // 既にブラックリストに存在する場合はスキップ
      const existing = await this.prisma.blacklistedToken.findUnique({
        where: { token },
      });

      if (existing) {
        return;
      }

      // ブラックリストに追加
      await this.prisma.blacklistedToken.create({
        data: {
          token,
          expiresAt,
        },
      });

      this.logger.log(`Token added to blacklist (expires at: ${expiresAt.toISOString()})`);
    } catch (error) {
      this.logger.error(`Failed to add token to blacklist: ${error}`);
      // エラーが発生しても処理を続行（トークンの無効化は重要だが、アプリケーションを停止させるほどではない）
    }
  }

  /**
   * トークンがブラックリストに存在するかチェック
   * @param token JWTトークン
   * @returns ブラックリストに存在する場合true
   */
  async isBlacklisted(token: string): Promise<boolean> {
    try {
      const blacklisted = await this.prisma.blacklistedToken.findUnique({
        where: { token },
      });

      return !!blacklisted;
    } catch (error) {
      this.logger.error(`Failed to check token blacklist: ${error}`);
      // エラーが発生した場合は、セキュリティのためtrueを返す（トークンを拒否）
      return true;
    }
  }

  /**
   * 期限切れのトークンをブラックリストから削除（クリーンアップ）
   * 定期的に実行することを推奨
   */
  async cleanupExpiredTokens(): Promise<void> {
    try {
      const now = new Date();
      const result = await this.prisma.blacklistedToken.deleteMany({
        where: {
          expiresAt: {
            lt: now,
          },
        },
      });

      if (result.count > 0) {
        this.logger.log(`Cleaned up ${result.count} expired tokens from blacklist`);
      }
    } catch (error) {
      this.logger.error(`Failed to cleanup expired tokens: ${error}`);
    }
  }
}
