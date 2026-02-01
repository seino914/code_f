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
  name?: string;
  company?: string;
  email?: string;
  failedLoginAttempts?: number;
  lockedUntil?: Date | null;
};

/**
 * ユーザーリポジトリ
 * データアクセス層を担当
 * 認証とユーザー管理の両方の機能を提供
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

