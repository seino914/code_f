import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TokenBlacklistService } from './services/token-blacklist.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

/**
 * 認証モジュール
 * JWT認証とログイン機能を提供
 */
@Module({
  imports: [
    PrismaModule,
    PassportModule,
    // ConfigServiceを使用してJWT設定を動的に読み込む
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET') as string;

        return {
          secret: secret,
          signOptions: { expiresIn: '24h' },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    TokenBlacklistService,
    JwtAuthGuard, // ガードもプロバイダーとして登録（DIで使用するため）
  ],
  exports: [AuthService, TokenBlacklistService, JwtAuthGuard],
})
export class AuthModule {}
