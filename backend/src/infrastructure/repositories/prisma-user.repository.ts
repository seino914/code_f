import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import {
  User,
  CreateUserInput,
  UpdateUserInput,
} from '../../domain/entities/user.entity';

/**
 * PrismaによるユーザーリポジトリInterface
 * IUserRepositoryの実装
 */
@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Prismaのユーザーデータをドメインエンティティにマッピング
   */
  private toEntity(prismaUser: {
    id: string;
    email: string;
    name: string;
    company: string;
    password: string;
    role: string | null;
    failedLoginAttempts: number;
    lockedUntil: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return {
      id: prismaUser.id,
      email: prismaUser.email,
      name: prismaUser.name,
      company: prismaUser.company,
      password: prismaUser.password,
      role: prismaUser.role ?? undefined,
      failedLoginAttempts: prismaUser.failedLoginAttempts,
      lockedUntil: prismaUser.lockedUntil ?? undefined,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    };
  }

  async findById(id: string): Promise<User | undefined> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return undefined;
    }

    return this.toEntity(user);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return undefined;
    }

    return this.toEntity(user);
  }

  async create(input: CreateUserInput): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        email: input.email,
        password: input.password,
        name: input.name,
        company: input.company,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    return this.toEntity(user);
  }

  async update(id: string, input: UpdateUserInput): Promise<User> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          name: input.name,
          company: input.company,
          email: input.email,
        },
      });

      return this.toEntity(user);
    } catch (error) {
      // Prismaの「レコードが見つからない」エラーをキャッチ
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'P2025'
      ) {
        throw new Error('ユーザーが見つかりません');
      }
      throw error;
    }
  }

  async updateLoginAttempts(
    id: string,
    failedAttempts: number,
    lockedUntil: Date | null,
  ): Promise<User> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          failedLoginAttempts: failedAttempts,
          lockedUntil,
        },
      });

      return this.toEntity(user);
    } catch (error) {
      // Prismaの「レコードが見つからない」エラーをキャッチ
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'P2025'
      ) {
        throw new Error('ユーザーが見つかりません');
      }
      throw error;
    }
  }

  async resetLoginAttempts(id: string): Promise<User> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      });

      return this.toEntity(user);
    } catch (error) {
      // Prismaの「レコードが見つからない」エラーをキャッチ
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'P2025'
      ) {
        throw new Error('ユーザーが見つかりません');
      }
      throw error;
    }
  }
}
