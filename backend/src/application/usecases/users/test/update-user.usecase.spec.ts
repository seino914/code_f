/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateUserUseCase, UpdateUserInput } from '../update-user.usecase';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../../domain/repositories/user.repository.interface';
import { User } from '../../../../domain/entities/user.entity';

describe('UpdateUserUseCase', () => {
  let useCase: UpdateUserUseCase;
  let userRepository: jest.Mocked<IUserRepository>;

  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    password: 'hashedPassword123',
    name: 'Test User',
    company: 'Test Company',
    failedLoginAttempts: 0,
    lockedUntil: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUserUseCase,
        {
          provide: USER_REPOSITORY,
          useValue: {
            findById: jest.fn(),
            findByEmail: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<UpdateUserUseCase>(UpdateUserUseCase);
    userRepository = module.get(USER_REPOSITORY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const updateInput: UpdateUserInput = {
      userId: 'user-123',
      name: 'Updated User',
      company: 'Updated Company',
      email: 'updated@example.com',
    };

    describe('正常系', () => {
      it('有効な更新情報の場合、ユーザー情報が更新されること', async () => {
        // Arrange
        userRepository.findById.mockResolvedValue(mockUser);
        userRepository.findByEmail.mockResolvedValue(undefined); // メールアドレス重複なし
        const updatedUser: User = {
          ...mockUser,
          name: updateInput.name,
          company: updateInput.company,
          email: updateInput.email,
        };
        userRepository.update.mockResolvedValue(updatedUser);

        // Act
        const result = await useCase.execute(updateInput);

        // Assert
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual({
            message: 'ユーザー情報を更新しました',
            user: {
              id: updatedUser.id,
              name: updatedUser.name,
              email: updatedUser.email,
              company: updatedUser.company,
            },
          });
        }
        expect(userRepository.findById).toHaveBeenCalledWith(
          updateInput.userId,
        );
        expect(userRepository.findByEmail).toHaveBeenCalledWith(
          updateInput.email,
        );
        expect(userRepository.update).toHaveBeenCalledWith(updateInput.userId, {
          name: updateInput.name,
          company: updateInput.company,
          email: updateInput.email,
        });
      });

      it('メールアドレスが変更されない場合、重複チェックが行われないこと', async () => {
        // Arrange
        const updateInputWithoutEmailChange: UpdateUserInput = {
          userId: 'user-123',
          name: 'Updated User',
          company: 'Updated Company',
          email: mockUser.email, // 同じメールアドレス
        };
        userRepository.findById.mockResolvedValue(mockUser);
        const updatedUser: User = {
          ...mockUser,
          name: updateInputWithoutEmailChange.name,
          company: updateInputWithoutEmailChange.company,
        };
        userRepository.update.mockResolvedValue(updatedUser);

        // Act
        const result = await useCase.execute(updateInputWithoutEmailChange);

        // Assert
        expect(result.success).toBe(true);
        // メールアドレスが同じなので、findByEmailは呼ばれない
        expect(userRepository.findByEmail).not.toHaveBeenCalled();
      });
    });

    describe('異常系', () => {
      it('ユーザーが存在しない場合、USER_NOT_FOUNDエラーが返されること', async () => {
        // Arrange
        userRepository.findById.mockResolvedValue(undefined);

        // Act
        const result = await useCase.execute(updateInput);

        // Assert
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.type).toBe('USER_NOT_FOUND');
          expect(result.error.message).toBe('ユーザーが見つかりません');
        }
        expect(userRepository.update).not.toHaveBeenCalled();
      });

      it('メールアドレスが既に登録されている場合、EMAIL_ALREADY_EXISTSエラーが返されること', async () => {
        // Arrange
        const existingUser: User = {
          ...mockUser,
          id: 'other-user-id',
          email: updateInput.email,
        };
        userRepository.findById.mockResolvedValue(mockUser);
        userRepository.findByEmail.mockResolvedValue(existingUser);

        // Act
        const result = await useCase.execute(updateInput);

        // Assert
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.type).toBe('EMAIL_ALREADY_EXISTS');
          expect(result.error.message).toBe(
            'このメールアドレスは既に登録されています',
          );
        }
        expect(userRepository.update).not.toHaveBeenCalled();
      });
    });
  });
});
