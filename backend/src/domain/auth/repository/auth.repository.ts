import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { User } from '../../../../generated/prisma/client';

/**
 * ユーザー作成データ型
 */
export type CreateUserData = {
  email: string;
  password: string;
  name: string;
  company: string;
  failedLoginAttempts?: number;
  lockedUntil?: Date | null;
};

/**
 * ユーザー更新データ型
 */
export type UpdateUserData = {
  failedLoginAttempts?: number;
  lockedUntil?: Date | null;
};

/**
 * 認証リポジトリ
 * データアクセス層を担当
 */
@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

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
   * ユーザーを作成
   * @param data ユーザー作成データ
   * @returns 作成されたユーザー情報
   */
  async create(data: CreateUserData): Promise<User> {
    return await this.prisma.user.create({
      data,
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

