import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { ITokenRepository } from '../../domain/repositories/token.repository.interface';
import {
  BlacklistedToken,
  CreateBlacklistedTokenInput,
} from '../../domain/entities/blacklisted-token.entity';

/**
 * PrismaによるトークンリポジトリInterface
 * ITokenRepositoryの実装
 */
@Injectable()
export class PrismaTokenRepository implements ITokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Prismaのトークンデータをドメインエンティティにマッピング
   */
  private toEntity(prismaToken: {
    id: string;
    token: string;
    expiresAt: Date;
    createdAt: Date;
  }): BlacklistedToken {
    return {
      id: prismaToken.id,
      token: prismaToken.token,
      expiresAt: prismaToken.expiresAt,
      createdAt: prismaToken.createdAt,
    };
  }

  async addToBlacklist(
    input: CreateBlacklistedTokenInput,
  ): Promise<BlacklistedToken> {
    // 重複を許容するため、upsertを使用してidempotentに処理
    const token = await this.prisma.blacklistedToken.upsert({
      where: { token: input.token },
      create: {
        token: input.token,
        expiresAt: input.expiresAt,
      },
      update: {
        expiresAt: input.expiresAt,
      },
    });

    return this.toEntity(token);
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const blacklistedToken = await this.prisma.blacklistedToken.findUnique({
      where: { token },
    });

    return blacklistedToken !== null;
  }

  async cleanupExpired(): Promise<number> {
    const result = await this.prisma.blacklistedToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return result.count;
  }
}
