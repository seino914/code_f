/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { LoginUseCase, LoginInput } from '../login.usecase';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../../domain/repositories/user.repository.interface';
import {
  IPasswordService,
  PASSWORD_SERVICE,
} from '../../../../domain/services/password.service.interface';
import {
  IJwtService,
  JWT_SERVICE,
} from '../../../../domain/services/jwt.service.interface';
import { User } from '../../../../domain/entities/user.entity';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let passwordService: jest.Mocked<IPasswordService>;
  let jwtService: jest.Mocked<IJwtService>;

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
        LoginUseCase,
        {
          provide: USER_REPOSITORY,
          useValue: {
            findByEmail: jest.fn(),
            updateLoginAttempts: jest.fn(),
            resetLoginAttempts: jest.fn(),
          },
        },
        {
          provide: PASSWORD_SERVICE,
          useValue: {
            compare: jest.fn(),
          },
        },
        {
          provide: JWT_SERVICE,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<LoginUseCase>(LoginUseCase);
    userRepository = module.get(USER_REPOSITORY);
    passwordService = module.get(PASSWORD_SERVICE);
    jwtService = module.get(JWT_SERVICE);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const loginInput: LoginInput = {
      email: 'test@example.com',
      password: 'Password123',
    };

    describe('正常系', () => {
      it('正しいメールアドレスとパスワードの場合、アクセストークンとユーザー情報が返されること', async () => {
        // Arrange
        userRepository.findByEmail.mockResolvedValue(mockUser);
        passwordService.compare.mockResolvedValue(true);
        userRepository.resetLoginAttempts.mockResolvedValue(mockUser);
        jwtService.sign.mockReturnValue('mock-access-token');

        // Act
        const result = await useCase.execute(loginInput);

        // Assert
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual({
            accessToken: 'mock-access-token',
            user: {
              id: mockUser.id,
              name: mockUser.name,
              email: mockUser.email,
              company: mockUser.company,
            },
          });
        }
        expect(userRepository.findByEmail).toHaveBeenCalledWith(
          loginInput.email,
        );
        expect(passwordService.compare).toHaveBeenCalledWith(
          loginInput.password,
          mockUser.password,
        );
        expect(jwtService.sign).toHaveBeenCalledWith({
          sub: mockUser.id,
          email: mockUser.email,
        });
      });

      it('ロックが解除されている場合、ロック状態がリセットされてログインできること', async () => {
        // Arrange
        const lockedUser: User = {
          ...mockUser,
          failedLoginAttempts: 5,
          lockedUntil: new Date(Date.now() - 1000), // 1秒前にロック解除
        };
        userRepository.findByEmail.mockResolvedValue(lockedUser);
        userRepository.resetLoginAttempts.mockResolvedValue({
          ...lockedUser,
          failedLoginAttempts: 0,
          lockedUntil: undefined,
        });
        passwordService.compare.mockResolvedValue(true);
        jwtService.sign.mockReturnValue('mock-access-token');

        // Act
        const result = await useCase.execute(loginInput);

        // Assert
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.accessToken).toBe('mock-access-token');
        }
        // ロック解除のためのリセットと、ログイン成功時のリセットで2回呼ばれる
        expect(userRepository.resetLoginAttempts).toHaveBeenCalledWith(
          lockedUser.id,
        );
      });
    });

    describe('異常系', () => {
      it('メールアドレスが存在しない場合、INVALID_CREDENTIALSエラーが返されること', async () => {
        // Arrange
        userRepository.findByEmail.mockResolvedValue(undefined);
        passwordService.compare.mockResolvedValue(false); // ダミーチェック

        // Act
        const result = await useCase.execute(loginInput);

        // Assert
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.type).toBe('INVALID_CREDENTIALS');
          expect(result.error.message).toBe(
            'メールアドレスまたはパスワードが正しくありません',
          );
        }
      });

      it('パスワードが間違っている場合、INVALID_CREDENTIALSエラーが返されること', async () => {
        // Arrange
        userRepository.findByEmail.mockResolvedValue(mockUser);
        passwordService.compare.mockResolvedValue(false);
        userRepository.updateLoginAttempts.mockResolvedValue({
          ...mockUser,
          failedLoginAttempts: 1,
        });

        // Act
        const result = await useCase.execute(loginInput);

        // Assert
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.type).toBe('INVALID_CREDENTIALS');
          expect(result.error.message).toContain('残り試行回数: 4');
        }
      });

      it('アカウントがロックされている場合、ACCOUNT_LOCKEDエラーが返されること', async () => {
        // Arrange
        const lockedUser: User = {
          ...mockUser,
          lockedUntil: new Date(Date.now() + 15 * 60 * 1000), // 15分後にロック解除
        };
        userRepository.findByEmail.mockResolvedValue(lockedUser);

        // Act
        const result = await useCase.execute(loginInput);

        // Assert
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.type).toBe('ACCOUNT_LOCKED');
          expect(result.error.message).toContain(
            'アカウントがロックされています',
          );
        }
        expect(passwordService.compare).not.toHaveBeenCalled();
      });

      it('ログイン試行回数が上限に達した場合、アカウントがロックされてACCOUNT_LOCKEDエラーが返されること', async () => {
        // Arrange
        const userWithMaxAttempts: User = {
          ...mockUser,
          failedLoginAttempts: 4, // 次で5回目（上限）
        };
        userRepository.findByEmail.mockResolvedValue(userWithMaxAttempts);
        passwordService.compare.mockResolvedValue(false);
        userRepository.updateLoginAttempts.mockResolvedValue({
          ...userWithMaxAttempts,
          failedLoginAttempts: 5,
          lockedUntil: new Date(Date.now() + 15 * 60 * 1000),
        });

        // Act
        const result = await useCase.execute(loginInput);

        // Assert
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.type).toBe('ACCOUNT_LOCKED');
          expect(result.error.message).toContain(
            'ログイン試行回数が上限に達しました',
          );
        }
      });
    });
  });
});
