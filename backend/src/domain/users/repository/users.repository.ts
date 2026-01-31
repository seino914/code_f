import { PrismaService } from '../../../database/prisma/prisma.service';
import { UnauthorizedException } from '@nestjs/common';

  /**
   * 現在のユーザー情報を取得
   * @param userId ユーザーID
   * @returns ユーザー情報
   * @throws UnauthorizedException ユーザーが見つからない場合
   */
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

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
}
