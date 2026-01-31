import { Test, TestingModule } from '@nestjs/testing';
import { Response, Request } from 'express';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { TokenBlacklistService } from '../services/token-blacklist.service';
import { LoginDto, LoginResponseDto } from '../dto/login.dto';
import { RegisterDto, RegisterResponseDto } from '../dto/register.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;
  let tokenBlacklistService: jest.Mocked<TokenBlacklistService>;

  const mockResponse = {
    cookie: jest.fn().mockReturnThis(),
  } as unknown as Response;

  const mockRequest = {
    cookies: {},
    headers: {},
  } as unknown as Request;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    company: 'Test Company',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            register: jest.fn(),
          },
        },
        {
          provide: TokenBlacklistService,
          useValue: {
            addToBlacklist: jest.fn(),
            isBlacklisted: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
    tokenBlacklistService = module.get(TokenBlacklistService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'Password123',
    };

    const loginResponse: LoginResponseDto = {
      accessToken: 'mock-access-token',
      user: mockUser,
    };

    describe('正常系', () => {
      it('正しい認証情報の場合、アクセストークンとユーザー情報が返され、クッキーが設定されること', async () => {
        // Arrange
        authService.login.mockResolvedValue(loginResponse);
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';

        // Act
        const result = await controller.login(loginDto, mockResponse);

        // Assert
        expect(result).toEqual(loginResponse);
        expect(authService.login).toHaveBeenCalledWith(loginDto);
        expect(mockResponse.cookie).toHaveBeenCalledWith(
          'auth-token',
          loginResponse.accessToken,
          {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000,
            path: '/',
          },
        );

        process.env.NODE_ENV = originalEnv;
      });

      // 本番環境にデプロイ時に再度ここのテストが正しいか確認する
      it('本番環境の場合、クッキーがSecureフラグ付きで設定されること', async () => {
        // Arrange
        authService.login.mockResolvedValue(loginResponse);
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';

        // Act
        await controller.login(loginDto, mockResponse);

        // Assert
        expect(mockResponse.cookie).toHaveBeenCalledWith(
          'auth-token',
          loginResponse.accessToken,
          {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000,
            path: '/',
          },
        );

        process.env.NODE_ENV = originalEnv;
      });
    });

    describe('異常系', () => {
      it('認証に失敗した場合、AuthServiceのエラーがそのままスローされること', async () => {
        // Arrange
        const error = new Error('認証失敗');
        authService.login.mockRejectedValue(error);

        // Act & Assert
        await expect(
          controller.login(loginDto, mockResponse),
        ).rejects.toThrow('認証失敗');
        expect(mockResponse.cookie).not.toHaveBeenCalled();
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

    const registerResponse: RegisterResponseDto = {
      message: 'ユーザー登録が完了しました',
      user: mockUser,
    };

    describe('正常系', () => {
      it('有効な登録情報の場合、ユーザー情報が返されること', async () => {
        // Arrange
        authService.register.mockResolvedValue(registerResponse);

        // Act
        const result = await controller.register(registerDto);

        // Assert
        expect(result).toEqual(registerResponse);
        expect(authService.register).toHaveBeenCalledWith(registerDto);
      });
    });

    describe('異常系', () => {
      it('登録に失敗した場合、AuthServiceのエラーがそのままスローされること', async () => {
        // Arrange
        const error = new Error('登録失敗');
        authService.register.mockRejectedValue(error);

        // Act & Assert
        await expect(controller.register(registerDto)).rejects.toThrow(
          '登録失敗',
        );
      });
    });
  });

  describe('logout', () => {
    const mockUserFromToken = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      company: 'Test Company',
    };

    describe('正常系', () => {
      it('クッキーからトークンを取得できる場合、トークンがブラックリストに追加され、クッキーが削除されること', async () => {
        // Arrange
        const requestWithCookie = {
          ...mockRequest,
          cookies: { 'auth-token': 'mock-token' },
        } as unknown as Request;
        tokenBlacklistService.addToBlacklist.mockResolvedValue(undefined);
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';

        // Act
        const result = await controller.logout(
          mockUserFromToken,
          mockResponse,
          requestWithCookie,
        );

        // Assert
        expect(result).toEqual({ message: 'ログアウトしました' });
        expect(tokenBlacklistService.addToBlacklist).toHaveBeenCalledWith(
          'mock-token',
        );
        expect(mockResponse.cookie).toHaveBeenCalledWith('auth-token', '', {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          maxAge: 0,
          path: '/',
        });

        process.env.NODE_ENV = originalEnv;
      });

      it('Authorizationヘッダーからトークンを取得できる場合、トークンがブラックリストに追加されること', async () => {
        // Arrange
        const requestWithHeader = {
          ...mockRequest,
          headers: { authorization: 'Bearer mock-token' },
        } as unknown as Request;
        tokenBlacklistService.addToBlacklist.mockResolvedValue(undefined);
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';

        // Act
        const result = await controller.logout(
          mockUserFromToken,
          mockResponse,
          requestWithHeader,
        );

        // Assert
        expect(result).toEqual({ message: 'ログアウトしました' });
        expect(tokenBlacklistService.addToBlacklist).toHaveBeenCalledWith(
          'mock-token',
        );
        expect(mockResponse.cookie).toHaveBeenCalledWith('auth-token', '', {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          maxAge: 0,
          path: '/',
        });

        process.env.NODE_ENV = originalEnv;
      });

      it('トークンが存在しない場合でも、クッキーが削除されること', async () => {
        // Arrange
        const requestWithoutToken = {
          ...mockRequest,
          cookies: {},
          headers: {},
        } as unknown as Request;
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';

        // Act
        const result = await controller.logout(
          mockUserFromToken,
          mockResponse,
          requestWithoutToken,
        );

        // Assert
        expect(result).toEqual({ message: 'ログアウトしました' });
        expect(tokenBlacklistService.addToBlacklist).not.toHaveBeenCalled();
        expect(mockResponse.cookie).toHaveBeenCalledWith('auth-token', '', {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          maxAge: 0,
          path: '/',
        });

        process.env.NODE_ENV = originalEnv;
      });

      it('本番環境の場合、クッキーがSecureフラグ付きで削除されること', async () => {
        // Arrange
        const requestWithCookie = {
          ...mockRequest,
          cookies: { 'auth-token': 'mock-token' },
        } as unknown as Request;
        tokenBlacklistService.addToBlacklist.mockResolvedValue(undefined);
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';

        // Act
        await controller.logout(
          mockUserFromToken,
          mockResponse,
          requestWithCookie,
        );

        // Assert
        expect(mockResponse.cookie).toHaveBeenCalledWith('auth-token', '', {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          maxAge: 0,
          path: '/',
        });

        process.env.NODE_ENV = originalEnv;
      });
    });
  });
});

