import { User } from '../../../../../generated/prisma/client';
import { LoginDto } from '../../dto/login.dto';
import { RegisterDto } from '../../dto/register.dto';

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
 * ログインDTOのモックデータ
 */
export const mockLoginDto: LoginDto = {
  email: 'test@example.com',
  password: 'Password123',
};

/**
 * 登録DTOのモックデータ
 */
export const mockRegisterDto: RegisterDto = {
  email: 'newuser@example.com',
  password: 'Password123',
  passwordConfirm: 'Password123',
  name: 'New User',
  company: 'New Company',
};

/**
 * ログイン成功レスポンスのモックデータ
 */
export const mockLoginResponse = {
  accessToken: 'mock-access-token',
  user: {
    id: mockUserEntity.id,
    name: mockUserEntity.name,
    email: mockUserEntity.email,
    company: mockUserEntity.company,
  },
};

/**
 * 登録成功レスポンスのモックデータ
 */
export const mockRegisterResponse = {
  message: 'ユーザー登録が完了しました',
  user: {
    id: mockUserEntity.id,
    name: mockRegisterDto.name,
    email: mockRegisterDto.email,
    company: mockRegisterDto.company,
  },
};

/**
 * ロックされたユーザーのモックデータ
 */
export const mockLockedUserEntity: User = {
  ...mockUserEntity,
  failedLoginAttempts: 5,
  lockedUntil: new Date(Date.now() + 15 * 60 * 1000), // 15分後にロック解除
};

/**
 * ロックが解除されたユーザーのモックデータ
 */
export const mockUnlockedUserEntity: User = {
  ...mockUserEntity,
  failedLoginAttempts: 5,
  lockedUntil: new Date(Date.now() - 1000), // 1秒前にロック解除
};

/**
 * 最大試行回数に達したユーザーのモックデータ
 */
export const mockMaxAttemptsUserEntity: User = {
  ...mockUserEntity,
  failedLoginAttempts: 4, // 次で5回目（上限）
};

/**
 * パスワードなしのユーザーのモックデータ
 */
export const mockUserWithoutPasswordEntity = {
  ...mockUserEntity,
  password: null,
} as unknown as User;

