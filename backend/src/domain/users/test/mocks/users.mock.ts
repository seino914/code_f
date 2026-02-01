import { User } from '../../../../../generated/prisma/client';
import { UpdateUserDto } from '../../dto/update-user.dto';

/**
 * テスト用のモックデータ
 */

/**
 * 完全なUserエンティティのモックデータ
 */
export const mockUserEntity: User = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  company: 'Test Company',
  password: 'hashedPassword123',
  role: null,
  failedLoginAttempts: 0,
  lockedUntil: null,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
};

/**
 * ユーザー情報レスポンスのモックデータ（パスワードなどの機密情報を除外）
 */
export const mockUserResponse = {
  id: mockUserEntity.id,
  email: mockUserEntity.email,
  name: mockUserEntity.name,
  company: mockUserEntity.company,
};

/**
 * JWTトークンから取得されるユーザー情報のモックデータ
 */
export const mockUserFromToken = {
  id: mockUserEntity.id,
  email: mockUserEntity.email,
  name: mockUserEntity.name,
  company: mockUserEntity.company,
};

/**
 * ユーザー更新DTOのモックデータ
 */
export const mockUpdateUserDto: UpdateUserDto = {
  name: 'Updated User',
  company: 'Updated Company',
  email: 'updated@example.com',
};

/**
 * 更新後のユーザーエンティティのモックデータ
 */
export const mockUpdatedUserEntity: User = {
  ...mockUserEntity,
  name: mockUpdateUserDto.name,
  company: mockUpdateUserDto.company,
  email: mockUpdateUserDto.email,
  updatedAt: new Date('2024-01-02T00:00:00.000Z'),
};

/**
 * 更新後のユーザー情報レスポンスのモックデータ
 */
export const mockUpdatedUserResponse = {
  id: mockUpdatedUserEntity.id,
  email: mockUpdatedUserEntity.email,
  name: mockUpdatedUserEntity.name,
  company: mockUpdatedUserEntity.company,
};

/**
 * 更新成功レスポンスのモックデータ
 */
export const mockUpdateUserResponse = {
  message: 'ユーザー情報を更新しました',
  user: mockUpdatedUserResponse,
};

/**
 * 他のユーザーのモックデータ（重複チェック用）
 */
export const mockOtherUserEntity: User = {
  ...mockUserEntity,
  id: 'other-user-id',
  email: mockUpdateUserDto.email,
};
