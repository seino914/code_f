import { Injectable, Inject } from '@nestjs/common';
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
export type GetUserError = { type: 'USER_NOT_FOUND'; message: string };

/**
 * ユーザー情報取得ユースケース
 * ユーザー情報の取得を担当
 */
@Injectable()
export class GetUserUseCase {
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
  }
}
