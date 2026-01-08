import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './database/prisma/prisma.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { CustomThrottlerGuard } from './common/guards/custom-throttler.guard';

/**
 * アプリケーションモジュール
 * レート制限をグローバルに適用（認証済みエンドポイントではスキップ）
 */
@Module({
  imports: [
    // 環境変数の設定（.envファイルを自動的に読み込む）
    ConfigModule.forRoot({
      isGlobal: true, // グローバルモジュールとして設定（全モジュールで使用可能）
      envFilePath: '.env', // .envファイルのパス
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    // レート制限の設定
    // デフォルト: 1分間に60リクエストまで
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000, // 1分（ミリ秒）
        limit: 60, // 60リクエストまで
      },
      // ログインエンドポイント用の厳しい制限
      {
        name: 'login',
        ttl: 60000, // 1分（ミリ秒）
        limit: 5, // 5リクエストまで（ブルートフォース攻撃対策）
      },
    ]),
  ],
  controllers: [],
  providers: [
    // グローバルガードとしてレート制限を適用
    // 認証済みエンドポイントではレート制限をスキップ（ログイン周りのみ適用）
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
    // グローバルガードとしてJWT認証を適用（@Public()デコレータでスキップ可能）
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
