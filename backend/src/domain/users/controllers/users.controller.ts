import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { UpdateUserDto, UpdateUserResponseDto } from '../dto/update-user.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

/**
 * ユーザーコントローラー
 * ユーザー情報管理のエンドポイントを提供
 */
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
  async getUser(@CurrentUser() user: any) {
    return await this.usersService.getUser(user.id);
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
    @CurrentUser() user: any,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<UpdateUserResponseDto> {
    return await this.usersService.updateUser(user.id, updateUserDto);
  }
}

