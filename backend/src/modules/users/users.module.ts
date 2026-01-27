import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersController } from './users.controller';

// Application層
import {
  GetUserUseCase,
  UpdateUserUseCase,
} from '../../application/usecases/users';

// Domain層
import { USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';

/**
 * ユーザーモジュール
 * ユーザー情報管理機能を提供
 * クリーンアーキテクチャに基づいた依存性注入を設定
 */
@Module({
  imports: [AuthModule], // AuthModuleからリポジトリをインポート
  controllers: [UsersController],
  providers: [
    // ユースケース
    GetUserUseCase,
    UpdateUserUseCase,
  ],
  exports: [GetUserUseCase, UpdateUserUseCase],
})
export class UsersModule {}
