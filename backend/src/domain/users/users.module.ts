import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { UsersUsecase } from './usecase/users.usecase';
import { UsersRepository } from './repository/users.repository';

/**
 * ユーザーモジュール
 * ユーザー情報管理機能を提供
 */
@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [UsersController],
  providers: [UsersRepository, UsersUsecase, UsersService],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
