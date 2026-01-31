import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

// Domain層
import { USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';
import { TOKEN_REPOSITORY } from '../../domain/repositories/token.repository.interface';
import { PASSWORD_SERVICE } from '../../domain/services/password.service.interface';
import { JWT_SERVICE } from '../../domain/services/jwt.service.interface';

// Infrastructure層
import { PrismaUserRepository } from '../../infrastructure/repositories/prisma-user.repository';
import { PrismaTokenRepository } from '../../infrastructure/repositories/prisma-token.repository';
import { BcryptPasswordService } from '../../infrastructure/services/bcrypt-password.service';
import { NestJsJwtService } from '../../infrastructure/services/nestjs-jwt.service';

// Application層
import {
  LoginUseCase,
  RegisterUseCase,
  LogoutUseCase,
} from '../../application/usecases/auth';

/**
 * 認証モジュール
 * JWT認証とログイン機能を提供
 * クリーンアーキテクチャに基づいた依存性注入を設定
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
    // リポジトリの実装をインターフェースにバインド
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    {
      provide: TOKEN_REPOSITORY,
      useClass: PrismaTokenRepository,
    },
    // サービスの実装をインターフェースにバインド
    {
      provide: PASSWORD_SERVICE,
      useClass: BcryptPasswordService,
    },
    {
      provide: JWT_SERVICE,
      useClass: NestJsJwtService,
    },
    // ユースケース
    LoginUseCase,
    RegisterUseCase,
    LogoutUseCase,
    // 認証関連
    JwtStrategy,
    JwtAuthGuard,
  ],
  exports: [
    // JwtAuthGuardのみエクスポート（他モジュールで使用可能に）
    JwtAuthGuard,
  ],
})
export class AuthModule {}
