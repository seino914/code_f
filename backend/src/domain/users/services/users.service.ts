import { Injectable } from '@nestjs/common';
import { UsersUsecase } from '../usecase/users.usecase';
import { UpdateUserDto, UpdateUserResponseDto } from '../dto/update-user.dto';

/**
 * ユーザーサービス
 * ユーザー情報の取得・更新を担当
 */
@Injectable()
export class UsersService {
  constructor(private readonly usersUsecase: UsersUsecase) {}

  /**
   * 現在のユーザー情報を取得
   * @param userId ユーザーID
   * @returns ユーザー情報
   * @throws UnauthorizedException ユーザーが見つからない場合
   */
  async getUser(userId: string) {
    return await this.usersUsecase.getUser(userId);
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
    return await this.usersUsecase.updateUser(userId, updateUserDto);
  }
}
