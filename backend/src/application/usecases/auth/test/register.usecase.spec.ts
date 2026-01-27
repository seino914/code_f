/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { RegisterUseCase, RegisterInput } from '../register.usecase';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../../domain/repositories/user.repository.interface';
import {
  IPasswordService,
  PASSWORD_SERVICE,
} from '../../../../domain/services/password.service.interface';
import { User } from '../../../../domain/entities/user.entity';

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let passwordService: jest.Mocked<IPasswordService>;

  const mockUser: User = {
    id: 'user-123',
    email: 'newuser@example.com',
    password: 'hashedPassword123',
    name: 'New User',
    company: 'New Company',
    failedLoginAttempts: 0,
    lockedUntil: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUseCase,
        {
          provide: USER_REPOSITORY,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: PASSWORD_SERVICE,
          useValue: {
            hash: jest.fn(),
            checkStrength: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<RegisterUseCase>(RegisterUseCase);
    userRepository = module.get(USER_REPOSITORY);
    passwordService = module.get(PASSWORD_SERVICE);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const registerInput: RegisterInput = {
      email: 'newuser@example.com',
      password: 'Password123',
      name: 'New User',
      company: 'New Company',
    };

    describe('正常系', () => {
      it('有効な登録情報の場合、ユーザー情報が返されること', async () => {
        // Arrange
        userRepository.findByEmail.mockResolvedValue(undefined);
        passwordService.checkStrength.mockReturnValue({
          isValid: true,
          errors: [],
        });
        passwordService.hash.mockResolvedValue('hashedPassword123');
        userRepository.create.mockResolvedValue(mockUser);

        // Act
        const result = await useCase.execute(registerInput);

        // Assert
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual({
            message: 'ユーザー登録が完了しました',
            user: {
              id: mockUser.id,
              name: mockUser.name,
              email: mockUser.email,
              company: mockUser.company,
            },
          });
        }
        expect(userRepository.findByEmail).toHaveBeenCalledWith(
          registerInput.email,
        );
        expect(passwordService.checkStrength).toHaveBeenCalledWith(
          registerInput.password,
        );
        expect(passwordService.hash).toHaveBeenCalledWith(
          registerInput.password,
        );
        expect(userRepository.create).toHaveBeenCalledWith({
          email: registerInput.email,
          password: 'hashedPassword123',
          name: registerInput.name,
          company: registerInput.company,
        });
      });
    });

    describe('異常系', () => {
      it('メールアドレスが既に登録されている場合、EMAIL_ALREADY_EXISTSエラーが返されること', async () => {
        // Arrange
        userRepository.findByEmail.mockResolvedValue(mockUser);

        // Act
        const result = await useCase.execute(registerInput);

        // Assert
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.type).toBe('EMAIL_ALREADY_EXISTS');
          expect(result.error.message).toBe(
            'このメールアドレスは既に登録されています',
          );
        }
        expect(passwordService.checkStrength).not.toHaveBeenCalled();
        expect(userRepository.create).not.toHaveBeenCalled();
      });

      it('パスワード強度が不足している場合、WEAK_PASSWORDエラーが返されること', async () => {
        // Arrange
        userRepository.findByEmail.mockResolvedValue(undefined);
        passwordService.checkStrength.mockReturnValue({
          isValid: false,
          errors: ['パスワードは8文字以上である必要があります'],
        });

        // Act
        const result = await useCase.execute(registerInput);

        // Assert
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.type).toBe('WEAK_PASSWORD');
          expect(result.error.message).toContain(
            'パスワードの強度が不足しています',
          );
        }
        expect(userRepository.create).not.toHaveBeenCalled();
      });
    });
  });
});
