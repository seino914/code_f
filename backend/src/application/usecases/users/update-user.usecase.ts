import { Injectable, Inject, Logger } from '@nestjs/common';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../domain/repositories/user.repository.interface';
import {
  UserPublicInfo,
  toUserPublicInfo,
} from '../../../domain/entities/user.entity';

/**
 * ユーザー更新入力データ
 */
export interface UpdateUserInput {
  userId: string;
  name: string;
  company: string;
  email: string;
}

/**
 * ユーザー更新出力データ
 */
export interface UpdateUserOutput {
  message: string;
  user: UserPublicInfo;
}

/**
 * ユーザー更新結果タイプ
 */
export type UpdateUserResult =
  | { success: true; data: UpdateUserOutput }
  | { success: false; error: UpdateUserError };

/**
 * ユーザー更新エラータイプ
 */
export type UpdateUserError =
  | { type: 'USER_NOT_FOUND'; message: string }
  | { type: 'EMAIL_ALREADY_EXISTS'; message: string };

/**
 * ユーザー情報更新ユースケース
 * ユーザー情報の更新を担当
 */
@Injectable()
export class UpdateUserUseCase {
  private readonly logger = new Logger(UpdateUserUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  /**
   * ユーザー情報更新処理を実行
   * @param input ユーザー更新入力データ
   * @returns ユーザー更新結果
   */
  async execute(input: UpdateUserInput): Promise<UpdateUserResult> {
    // 現在のユーザーを取得
    const currentUser = await this.userRepository.findById(input.userId);
    if (!currentUser) {
      return {
        success: false,
        error: {
          type: 'USER_NOT_FOUND',
          message: 'ユーザーが見つかりません',
        },
      };
    }

    // メールアドレスが変更される場合、重複チェック
    if (input.email !== currentUser.email) {
      const existingUser = await this.userRepository.findByEmail(input.email);
      if (existingUser) {
        return {
          success: false,
          error: {
            type: 'EMAIL_ALREADY_EXISTS',
            message: 'このメールアドレスは既に登録されています',
          },
        };
      }
    }

    // ユーザー情報を更新
    try {
      const updatedUser = await this.userRepository.update(input.userId, {
        name: input.name,
        company: input.company,
        email: input.email,
      });

      this.logger.log(`User updated successfully: ${updatedUser.email}`);

      return {
        success: true,
        data: {
          message: 'ユーザー情報を更新しました',
          user: toUserPublicInfo(updatedUser),
        },
      };
    } catch (error) {
      // Prismaのユニーク制約エラーをキャッチ（TOCTOU対策）
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        return {
          success: false,
          error: {
            type: 'EMAIL_ALREADY_EXISTS',
            message: 'このメールアドレスは既に登録されています',
          },
        };
      }

      // その他のエラーは再スロー
      this.logger.error(
        `Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
