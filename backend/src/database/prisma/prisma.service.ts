import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '../../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private logger!: Logger;

  constructor(private readonly configService: ConfigService) {
    // super()を呼ぶ前に環境変数を取得
    const databaseUrl = configService.get<string>('DATABASE_URL');
    
    if (!databaseUrl) {
      throw new Error(
        'DATABASE_URL環境変数が設定されていません。backend/.envファイルにDATABASE_URLを設定してください。',
      );
    }

    // DATABASE_URLの形式を検証
    try {
      const url = new URL(databaseUrl);
      if (url.protocol !== 'postgresql:' && url.protocol !== 'postgres:') {
        throw new Error(`DATABASE_URLのプロトコルが正しくありません: ${url.protocol}`);
      }
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error(
          `DATABASE_URLの形式が正しくありません。形式: postgresql://username:password@host:port/database`,
        );
      }
      throw error;
    }

    try {
      const pool = new Pool({ connectionString: databaseUrl });
      const adapter = new PrismaPg(pool);
      super({ adapter });
      // super()を呼んだ後にloggerを初期化
      this.logger = new Logger(PrismaService.name);
      this.logger.log('PrismaService initialized');
    } catch (error) {
      // super()が呼ばれていない場合、thisにアクセスできないため、console.errorを使用
      console.error('PrismaService initialization failed', error);
      throw error;
    }
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}