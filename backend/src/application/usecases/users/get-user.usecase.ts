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
 * ユーザー取得入力データ
 */
export interface GetUserInput {
  userId: string;
}

/**
 * ユーザー取得結果タイプ
 */
export type GetUserResult =
  | { success: true; data: UserPublicInfo }
  | { success: false; error: GetUserError };

/**
 * ユーザー取得エラータイプ
 */
export type GetUserError =
  | { type: 'USER_NOT_FOUND'; message: string }
  | { type: 'INTERNAL_ERROR'; message: string };

/**
 * ユーザー情報取得ユースケース
 * ユーザー情報の取得を担当
 */
@Injectable()
export class GetUserUseCase {
  private readonly logger = new Logger(GetUserUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  /**
   * ユーザー情報取得処理を実行
   * @param input ユーザー取得入力データ
   * @returns ユーザー取得結果
   */
  async execute(input: GetUserInput): Promise<GetUserResult> {
    try {
      const user = await this.userRepository.findById(input.userId);

      if (!user) {
        return {
          success: false,
          error: {
            type: 'USER_NOT_FOUND',
            message: 'ユーザーが見つかりません',
          },
        };
      }

      return {
        success: true,
        data: toUserPublicInfo(user),
      };
    } catch (error) {
      this.logger.error(
        `Failed to get user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      return {
        success: false,
        error: {
          type: 'INTERNAL_ERROR',
          message: 'ユーザー情報の取得に失敗しました',
        },
      };
    }
  }
}
