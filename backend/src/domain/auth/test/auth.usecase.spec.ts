import { Test, TestingModule } from '@nestjs/testing';
import {
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthUsecase } from '../usecase/auth.usecase';
import { UsersRepository } from '../../users/repository/users.repository';
import {
  mockUserEntity,
  mockLoginDto,
  mockRegisterDto,
  mockLoginResponse,
  mockRegisterResponse,
  mockLockedUserEntity,
  mockUnlockedUserEntity,
  mockMaxAttemptsUserEntity,
  mockUserWithoutPasswordEntity,
} from './mocks/auth.mock';
import { checkPasswordStrength } from '../../../shared/utils/password-strength.util';

// モック関数
jest.mock('bcrypt');
jest.mock('../../../shared/utils/password-strength.util');

describe('AuthUsecase', () => {
  let usecase: AuthUsecase;
  let repository: jest.Mocked<UsersRepository>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthUsecase,
        {
          provide: UsersRepository,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    usecase = module.get<AuthUsecase>(AuthUsecase);
    repository = module.get(UsersRepository);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    describe('正常系', () => {
      it('正しいメールアドレスとパスワードの場合、アクセストークンとユーザー情報が返されること', async () => {
        // Arrange
        repository.findByEmail.mockResolvedValue(mockUserEntity);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        repository.update.mockResolvedValue({
          ...mockUserEntity,
          failedLoginAttempts: 0,
          lockedUntil: null,
        });
        jwtService.sign.mockReturnValue('mock-access-token');

        // Act
        const result = await usecase.login(mockLoginDto);

        // Assert
        expect(result).toEqual(mockLoginResponse);
        expect(repository.findByEmail).toHaveBeenCalledWith(mockLoginDto.email);
        expect(bcrypt.compare).toHaveBeenCalledWith(
          mockLoginDto.password,
          mockUserEntity.password
        );
        expect(jwtService.sign).toHaveBeenCalledWith({
          sub: mockUserEntity.id,
          email: mockUserEntity.email,
        });
        expect(repository.update).toHaveBeenCalledWith(mockUserEntity.id, {
          failedLoginAttempts: 0,
          lockedUntil: null,
        });
      });

      it('ロックが解除されている場合、ロック状態がリセットされてログインできること', async () => {
        // Arrange
        repository.findByEmail.mockResolvedValue(mockUnlockedUserEntity);
        repository.update
          .mockResolvedValueOnce({
            ...mockUnlockedUserEntity,
            failedLoginAttempts: 0,
            lockedUntil: null,
          })
          .mockResolvedValueOnce({
            ...mockUnlockedUserEntity,
            failedLoginAttempts: 0,
            lockedUntil: null,
          });
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        jwtService.sign.mockReturnValue('mock-access-token');

        // Act
        const result = await usecase.login(mockLoginDto);

        // Assert
        expect(result.accessToken).toBe('mock-access-token');
        expect(repository.update).toHaveBeenCalledTimes(2);
        expect(repository.update).toHaveBeenNthCalledWith(1, mockUnlockedUserEntity.id, {
          failedLoginAttempts: 0,
          lockedUntil: null,
        });
      });
    });

    describe('異常系', () => {
      it('メールアドレスが存在しない場合、UnauthorizedExceptionがスローされること', async () => {
        // Arrange
        repository.findByEmail.mockResolvedValue(null);
        const dummyHash =
          '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);

        // Act & Assert
        await expect(usecase.login(mockLoginDto)).rejects.toThrow(
          UnauthorizedException
        );
        await expect(usecase.login(mockLoginDto)).rejects.toThrow(
          'メールアドレスまたはパスワードが正しくありません'
        );
        expect(bcrypt.compare).toHaveBeenCalledWith(
          mockLoginDto.password,
          dummyHash
        );
      });

      it('パスワードが設定されていない場合、UnauthorizedExceptionがスローされること', async () => {
        // Arrange
        repository.findByEmail.mockResolvedValue(mockUserWithoutPasswordEntity);
        const dummyHash =
          '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);

        // Act & Assert
        await expect(usecase.login(mockLoginDto)).rejects.toThrow(
          UnauthorizedException
        );
        expect(bcrypt.compare).toHaveBeenCalledWith(
          mockLoginDto.password,
          dummyHash
        );
      });

      it('パスワードが間違っている場合、UnauthorizedExceptionがスローされること', async () => {
        // Arrange
        repository.findByEmail.mockResolvedValue(mockUserEntity);
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);
        repository.update.mockResolvedValue({
          ...mockUserEntity,
          failedLoginAttempts: 1,
          lockedUntil: null,
        });

        // Act & Assert
        await expect(usecase.login(mockLoginDto)).rejects.toThrow(
          UnauthorizedException
        );
        await expect(usecase.login(mockLoginDto)).rejects.toThrow(
          'メールアドレスまたはパスワードが正しくありません。残り試行回数: 4'
        );
        expect(repository.update).toHaveBeenCalledWith(mockUserEntity.id, {
          failedLoginAttempts: 1,
          lockedUntil: null,
        });
      });

      it('アカウントがロックされている場合、ForbiddenExceptionがスローされること', async () => {
        // Arrange
        repository.findByEmail.mockResolvedValue(mockLockedUserEntity);

        // Act & Assert
        await expect(usecase.login(mockLoginDto)).rejects.toThrow(
          ForbiddenException
        );
        await expect(usecase.login(mockLoginDto)).rejects.toThrow(
          'アカウントがロックされています'
        );
        expect(bcrypt.compare).not.toHaveBeenCalled();
      });

      it('ログイン試行回数が上限に達した場合、アカウントがロックされてForbiddenExceptionがスローされること', async () => {
        // Arrange
        repository.findByEmail.mockResolvedValue(mockMaxAttemptsUserEntity);
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);
        const lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
        repository.update.mockResolvedValue({
          ...mockMaxAttemptsUserEntity,
          failedLoginAttempts: 5,
          lockedUntil,
        });

        // Act & Assert
        await expect(usecase.login(mockLoginDto)).rejects.toThrow(
          ForbiddenException
        );
        await expect(usecase.login(mockLoginDto)).rejects.toThrow(
          'ログイン試行回数が上限に達しました。アカウントは15分間ロックされます。'
        );
        expect(repository.update).toHaveBeenCalledWith(mockMaxAttemptsUserEntity.id, {
          failedLoginAttempts: 5,
          lockedUntil: expect.any(Date),
        });
      });
    });
  });

  describe('register', () => {
    describe('正常系', () => {
      it('有効な登録情報の場合、ユーザー情報が返されること', async () => {
        // Arrange
        repository.findByEmail.mockResolvedValue(null);
        (checkPasswordStrength as jest.Mock).mockReturnValue({
          isValid: true,
          errors: [],
        });
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');
        const createdUser = {
          ...mockUserEntity,
          email: mockRegisterDto.email,
          name: mockRegisterDto.name,
          company: mockRegisterDto.company,
        };
        repository.create.mockResolvedValue(createdUser);

        // Act
        const result = await usecase.register(mockRegisterDto);

        // Assert
        expect(result).toEqual(mockRegisterResponse);
        expect(repository.findByEmail).toHaveBeenCalledWith(mockRegisterDto.email);
        expect(checkPasswordStrength).toHaveBeenCalledWith(mockRegisterDto.password);
        expect(bcrypt.hash).toHaveBeenCalledWith(mockRegisterDto.password, 10);
        expect(repository.create).toHaveBeenCalledWith({
          email: mockRegisterDto.email,
          password: 'hashedPassword123',
          name: mockRegisterDto.name,
          company: mockRegisterDto.company,
          failedLoginAttempts: 0,
          lockedUntil: null,
        });
      });
    });

    describe('異常系', () => {
      it('メールアドレスが既に登録されている場合、ConflictExceptionがスローされること', async () => {
        // Arrange
        repository.findByEmail.mockResolvedValue(mockUserEntity);

        // Act & Assert
        await expect(usecase.register(mockRegisterDto)).rejects.toThrow(
          ConflictException
        );
        await expect(usecase.register(mockRegisterDto)).rejects.toThrow(
          'このメールアドレスは既に登録されています'
        );
        expect(checkPasswordStrength).not.toHaveBeenCalled();
        expect(repository.create).not.toHaveBeenCalled();
      });

      it('パスワード強度が不足している場合、ConflictExceptionがスローされること', async () => {
        // Arrange
        repository.findByEmail.mockResolvedValue(null);
        (checkPasswordStrength as jest.Mock).mockReturnValue({
          isValid: false,
          errors: ['パスワードは8文字以上である必要があります'],
        });

        // Act & Assert
        await expect(usecase.register(mockRegisterDto)).rejects.toThrow(
          ConflictException
        );
        await expect(usecase.register(mockRegisterDto)).rejects.toThrow(
          'パスワードの強度が不足しています'
        );
        expect(repository.create).not.toHaveBeenCalled();
      });
    });
  });
});

