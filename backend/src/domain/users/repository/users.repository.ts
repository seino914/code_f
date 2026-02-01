import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { User } from '../../../../generated/prisma/client';

/**
 * ユーザー更新データ型
 */
export type UpdateUserData = {
  name?: string;
  company?: string;
  email?: string;
};

/**
 * ユーザーリポジトリ
 * データアクセス層を担当
 */
@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * IDでユーザーを取得
   * @param userId ユーザーID
   * @returns ユーザー情報（存在しない場合はnull）
   */
  async findById(userId: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  /**
   * メールアドレスでユーザーを取得
   * @param email メールアドレス
   * @returns ユーザー情報（存在しない場合はnull）
   */
  async findByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * ユーザー情報を更新
   * @param userId ユーザーID
   * @param data 更新データ
   * @returns 更新後のユーザー情報
   */
  async update(userId: string, data: UpdateUserData): Promise<User> {
    return await this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }
}

