import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { UpdateUserDto, UpdateUserResponseDto } from './dto/update-user.dto';
import { PrismaService } from '../../database/prisma/prisma.service';
/**
 * ユーザーサービス
 * ユーザー情報の取得・更新を担当
 */
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 現在のユーザー情報を取得
   * @param userId ユーザーID
   * @returns ユーザー情報
   * @throws UnauthorizedException ユーザーが見つからない場合
   */
  async getUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('ユーザーが見つかりません');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      company: user.company,
    };
  }

  /**
   * ユーザー情報を更新
   * @param userId ユーザーID
   * @param updateUserDto 更新情報
   * @returns 更新成功メッセージとユーザー情報
   * @throws UnauthorizedException ユーザーが見つからない場合
   * @throws ConflictException メールアドレスが既に登録されている場合
   */
  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto
  ): Promise<UpdateUserResponseDto> {
    // メールアドレスが変更される場合、重複チェック
    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!currentUser) {
      throw new UnauthorizedException('ユーザーが見つかりません');
    }

    // メールアドレスが変更される場合のみ重複チェック
    if (updateUserDto.email !== currentUser.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('このメールアドレスは既に登録されています');
      }
    }

    // ユーザー情報を更新
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: updateUserDto.name,
        company: updateUserDto.company,
        email: updateUserDto.email,
      },
    });

    this.logger.log(`User updated successfully: ${updatedUser.email}`);

    return {
      message: 'ユーザー情報を更新しました',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        company: updatedUser.company,
      },
    };
  }
}
