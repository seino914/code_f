import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ForbiddenException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../../database/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { checkPasswordStrength } from '../../shared/utils/password-strength.util';

// モック関数
jest.mock('bcrypt');
jest.mock('../../shared/utils/password-strength.util');

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    password: 'hashedPassword123',
    name: 'Test User',
    company: 'Test Company',
    failedLoginAttempts: 0,
    lockedUntil: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
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

    service = module.get<AuthService>(AuthService);
    prismaService = module.get(PrismaService) as typeof prismaService;
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'Password123',
    };

    describe('正常系', () => {
      it('正しいメールアドレスとパスワードの場合、アクセストークンとユーザー情報が返されること', async () => {
        // Arrange
        prismaService.user.findUnique.mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        prismaService.user.update.mockResolvedValue({
          ...mockUser,
          failedLoginAttempts: 0,
          lockedUntil: null,
        });
        jwtService.sign.mockReturnValue('mock-access-token');

        // Act
        const result = await service.login(loginDto);

        // Assert
        expect(result).toEqual({
          accessToken: 'mock-access-token',
          user: {
            id: mockUser.id,
            name: mockUser.name,
            email: mockUser.email,
            company: mockUser.company,
          },
        });
        expect(prismaService.user.findUnique).toHaveBeenCalledWith({
          where: { email: loginDto.email },
        });
        expect(bcrypt.compare).toHaveBeenCalledWith(
          loginDto.password,
          mockUser.password,
        );
        expect(jwtService.sign).toHaveBeenCalledWith({
          sub: mockUser.id,
          email: mockUser.email,
        });
        expect(prismaService.user.update).toHaveBeenCalledWith({
          where: { id: mockUser.id },
          data: {
            failedLoginAttempts: 0,
            lockedUntil: null,
          },
        });
      });

      it('ロックが解除されている場合、ロック状態がリセットされてログインできること', async () => {
        // Arrange
        const lockedUser = {
          ...mockUser,
          failedLoginAttempts: 5,
          lockedUntil: new Date(Date.now() - 1000), // 1秒前にロック解除
        };
        prismaService.user.findUnique.mockResolvedValue(lockedUser);
        prismaService.user.update
          .mockResolvedValueOnce({
            ...lockedUser,
            failedLoginAttempts: 0,
            lockedUntil: null,
          })
          .mockResolvedValueOnce({
            ...lockedUser,
            failedLoginAttempts: 0,
            lockedUntil: null,
          });
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        jwtService.sign.mockReturnValue('mock-access-token');

        // Act
        const result = await service.login(loginDto);

        // Assert
        expect(result.accessToken).toBe('mock-access-token');
        expect(prismaService.user.update).toHaveBeenCalledTimes(2);
        expect(prismaService.user.update).toHaveBeenNthCalledWith(1, {
          where: { id: lockedUser.id },
          data: {
            failedLoginAttempts: 0,
            lockedUntil: null,
          },
        });
      });
    });

    describe('異常系', () => {
      it('メールアドレスが存在しない場合、UnauthorizedExceptionがスローされること', async () => {
        // Arrange
        prismaService.user.findUnique.mockResolvedValue(null);
        const dummyHash =
          '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);

        // Act & Assert
        await expect(service.login(loginDto)).rejects.toThrow(
          UnauthorizedException,
        );
        await expect(service.login(loginDto)).rejects.toThrow(
          'メールアドレスまたはパスワードが正しくありません',
        );
        expect(bcrypt.compare).toHaveBeenCalledWith(
          loginDto.password,
          dummyHash,
        );
      });

      it('パスワードが設定されていない場合、UnauthorizedExceptionがスローされること', async () => {
        // Arrange
        const userWithoutPassword = { ...mockUser, password: null };
        prismaService.user.findUnique.mockResolvedValue(userWithoutPassword);
        const dummyHash =
          '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);

        // Act & Assert
        await expect(service.login(loginDto)).rejects.toThrow(
          UnauthorizedException,
        );
        expect(bcrypt.compare).toHaveBeenCalledWith(
          loginDto.password,
          dummyHash,
        );
      });

      it('パスワードが間違っている場合、UnauthorizedExceptionがスローされること', async () => {
        // Arrange
        prismaService.user.findUnique.mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);
        prismaService.user.update.mockResolvedValue({
          ...mockUser,
          failedLoginAttempts: 1,
          lockedUntil: null,
        });

        // Act & Assert
        await expect(service.login(loginDto)).rejects.toThrow(
          UnauthorizedException,
        );
        await expect(service.login(loginDto)).rejects.toThrow(
          'メールアドレスまたはパスワードが正しくありません。残り試行回数: 4',
        );
        expect(prismaService.user.update).toHaveBeenCalledWith({
          where: { id: mockUser.id },
          data: {
            failedLoginAttempts: 1,
            lockedUntil: null,
          },
        });
      });

      it('アカウントがロックされている場合、ForbiddenExceptionがスローされること', async () => {
        // Arrange
        const lockedUser = {
          ...mockUser,
          lockedUntil: new Date(Date.now() + 15 * 60 * 1000), // 15分後にロック解除
        };
        prismaService.user.findUnique.mockResolvedValue(lockedUser);

        // Act & Assert
        await expect(service.login(loginDto)).rejects.toThrow(
          ForbiddenException,
        );
        await expect(service.login(loginDto)).rejects.toThrow(
          'アカウントがロックされています',
        );
        expect(bcrypt.compare).not.toHaveBeenCalled();
      });

      it('ログイン試行回数が上限に達した場合、アカウントがロックされてForbiddenExceptionがスローされること', async () => {
        // Arrange
        const userWithMaxAttempts = {
          ...mockUser,
          failedLoginAttempts: 4, // 次で5回目（上限）
        };
        prismaService.user.findUnique.mockResolvedValue(userWithMaxAttempts);
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);
        const lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
        prismaService.user.update.mockResolvedValue({
          ...userWithMaxAttempts,
          failedLoginAttempts: 5,
          lockedUntil,
        });

        // Act & Assert
        await expect(service.login(loginDto)).rejects.toThrow(
          ForbiddenException,
        );
        await expect(service.login(loginDto)).rejects.toThrow(
          'ログイン試行回数が上限に達しました。アカウントは15分間ロックされます。',
        );
        expect(prismaService.user.update).toHaveBeenCalledWith({
          where: { id: userWithMaxAttempts.id },
          data: {
            failedLoginAttempts: 5,
            lockedUntil: expect.any(Date),
          },
        });
      });
    });
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'newuser@example.com',
      password: 'Password123',
      passwordConfirm: 'Password123',
      name: 'New User',
      company: 'New Company',
    };

    describe('正常系', () => {
      it('有効な登録情報の場合、ユーザー情報が返されること', async () => {
        // Arrange
        prismaService.user.findUnique.mockResolvedValue(null);
        (checkPasswordStrength as jest.Mock).mockReturnValue({
          isValid: true,
          errors: [],
        });
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');
        const createdUser = {
          ...mockUser,
          email: registerDto.email,
          name: registerDto.name,
          company: registerDto.company,
        };
        prismaService.user.create.mockResolvedValue(createdUser);

        // Act
        const result = await service.register(registerDto);

        // Assert
        expect(result).toEqual({
          message: 'ユーザー登録が完了しました',
          user: {
            id: createdUser.id,
            name: createdUser.name,
            email: createdUser.email,
            company: createdUser.company,
          },
        });
        expect(prismaService.user.findUnique).toHaveBeenCalledWith({
          where: { email: registerDto.email },
        });
        expect(checkPasswordStrength).toHaveBeenCalledWith(registerDto.password);
        expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
        expect(prismaService.user.create).toHaveBeenCalledWith({
          data: {
            email: registerDto.email,
            password: 'hashedPassword123',
            name: registerDto.name,
            company: registerDto.company,
            failedLoginAttempts: 0,
            lockedUntil: null,
          },
        });
      });
    });

    describe('異常系', () => {
      it('メールアドレスが既に登録されている場合、ConflictExceptionがスローされること', async () => {
        // Arrange
        prismaService.user.findUnique.mockResolvedValue(mockUser);

        // Act & Assert
        await expect(service.register(registerDto)).rejects.toThrow(
          ConflictException,
        );
        await expect(service.register(registerDto)).rejects.toThrow(
          'このメールアドレスは既に登録されています',
        );
        expect(checkPasswordStrength).not.toHaveBeenCalled();
        expect(prismaService.user.create).not.toHaveBeenCalled();
      });

      it('パスワード強度が不足している場合、ConflictExceptionがスローされること', async () => {
        // Arrange
        prismaService.user.findUnique.mockResolvedValue(null);
        (checkPasswordStrength as jest.Mock).mockReturnValue({
          isValid: false,
          errors: ['パスワードは8文字以上である必要があります'],
        });

        // Act & Assert
        await expect(service.register(registerDto)).rejects.toThrow(
          ConflictException,
        );
        await expect(service.register(registerDto)).rejects.toThrow(
          'パスワードの強度が不足しています',
        );
        expect(prismaService.user.create).not.toHaveBeenCalled();
      });
    });
  });
});

