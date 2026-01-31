import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UpdateUserDto, UpdateUserResponseDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  GetUserUseCase,
  UpdateUserUseCase,
} from '../../application/usecases/users';

/**
 * ユーザーコントローラー
 * ユーザー情報管理のエンドポイントを提供
 * ユースケースに処理を委譲し、HTTPレスポンスの変換を担当
 */
@ApiTags('users')
@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(
    private readonly getUserUseCase: GetUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
  ) {}

  /**
   * 現在のユーザー情報を取得
   * JWTトークンからユーザー情報を取得
   */
  @Get('user')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '現在のユーザー情報を取得' })
  @ApiResponse({
    status: 200,
    description: 'ユーザー情報取得成功',
  })
  @ApiResponse({
    status: 401,
    description: '認証が必要です',
  })
  async getUser(@CurrentUser() user: { id: string; email: string }) {
    const result = await this.getUserUseCase.execute({ userId: user.id });

    if (!result.success) {
      throw new UnauthorizedException(result.error.message);
    }

    return result.data;
  }

  /**
   * ユーザー情報を更新
   */
  @Patch('update')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ユーザー情報を更新' })
  @ApiResponse({
    status: 200,
    description: '更新成功',
    type: UpdateUserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'バリデーションエラー',
  })
  @ApiResponse({
    status: 401,
    description: '認証が必要です',
  })
  @ApiResponse({
    status: 409,
    description: 'メールアドレスが既に登録されている',
  })
  async updateUser(
    @CurrentUser() user: { id: string; email: string },
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UpdateUserResponseDto> {
    const result = await this.updateUserUseCase.execute({
      userId: user.id,
      name: updateUserDto.name,
      company: updateUserDto.company,
      email: updateUserDto.email,
    });

    if (!result.success) {
      switch (result.error.type) {
        case 'USER_NOT_FOUND':
          throw new UnauthorizedException(result.error.message);
        case 'EMAIL_ALREADY_EXISTS':
          throw new ConflictException(result.error.message);
        default: {
          this.logger.error('Unexpected error type in updateUser', result.error);
          const error = result.error as { message?: string };
          throw new InternalServerErrorException(
            error.message || 'ユーザー情報の更新に失敗しました',
          );
        }
      }
    }

    return result.data;
  }
}
