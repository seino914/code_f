import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Res,
  Req,
  UseGuards,
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import type { Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { RegisterDto, RegisterResponseDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import {
  LoginUseCase,
  RegisterUseCase,
  LogoutUseCase,
} from '../../application/usecases/auth';

/**
 * 認証コントローラー
 * ログインなどの認証関連のエンドポイントを提供
 * ユースケースに処理を委譲し、HTTPレスポンスの変換を担当
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  /**
   * ユーザー登録
   * セキュリティ強化:
   * - レート制限: 1分間に3回まで（スパム登録対策）
   */
  @Post('register')
  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'ユーザー登録' })
  @ApiResponse({
    status: 201,
    description: '登録成功',
    type: RegisterResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'バリデーションエラー',
  })
  @ApiResponse({
    status: 409,
    description: 'メールアドレスが既に登録されている',
  })
  @ApiResponse({
    status: 429,
    description: 'リクエストが多すぎます（レート制限）',
  })
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<RegisterResponseDto> {
    const result = await this.registerUseCase.execute({
      email: registerDto.email,
      password: registerDto.password,
      name: registerDto.name,
      company: registerDto.company,
    });

    if (!result.success) {
      // エラータイプに応じて適切な例外をスロー
      switch (result.error.type) {
        case 'EMAIL_ALREADY_EXISTS':
          throw new ConflictException(result.error.message);
        case 'WEAK_PASSWORD':
          throw new ConflictException(result.error.message);
      }
    }

    return result.data;
  }

  /**
   * メールアドレスとパスワードでログイン
   * セキュリティ強化:
   * - クッキーをHttpOnly、Secure、SameSiteで設定
   * - レート制限: 1分間に5回まで（ブルートフォース攻撃対策）
   */
  @Post('login')
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'メールアドレスとパスワードでログイン' })
  @ApiResponse({
    status: 200,
    description: 'ログイン成功',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: '認証失敗（メールアドレスまたはパスワードが無効）',
  })
  @ApiResponse({
    status: 429,
    description: 'リクエストが多すぎます（レート制限）',
  })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginResponseDto> {
    const result = await this.loginUseCase.execute({
      email: loginDto.email,
      password: loginDto.password,
    });

    if (!result.success) {
      // エラータイプに応じて適切な例外をスロー
      switch (result.error.type) {
        case 'INVALID_CREDENTIALS':
          throw new UnauthorizedException(result.error.message);
        case 'ACCOUNT_LOCKED':
          throw new ForbiddenException(result.error.message);
      }
    }

    // セキュリティ強化: クッキーをHttpOnly、Secure、SameSiteで設定
    const isProduction = process.env.NODE_ENV === 'production';
    response.cookie('auth-token', result.data.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24時間
      path: '/',
    });

    return result.data;
  }

  /**
   * ログアウト
   * 認証トークンをブラックリストに追加し、クッキーを削除
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ログアウト' })
  @ApiResponse({
    status: 200,
    description: 'ログアウト成功',
  })
  @ApiResponse({
    status: 401,
    description: '認証が必要です',
  })
  async logout(
    @CurrentUser() _user: { id: string; email: string },
    @Res({ passthrough: true }) response: Response,
    @Req()
    request: {
      cookies?: Record<string, string>;
      headers?: { authorization?: string };
    },
  ) {
    // トークンを取得（クッキーまたはAuthorizationヘッダーから）
    let token: string | undefined;
    if (request?.cookies?.['auth-token']) {
      token = request.cookies['auth-token'];
    } else if (request?.headers?.authorization?.startsWith('Bearer ')) {
      token = request.headers.authorization.substring(7);
    }

    // トークンをブラックリストに追加（無効化）
    if (token) {
      await this.logoutUseCase.execute({ token });
    }

    // クッキーを削除
    const isProduction = process.env.NODE_ENV === 'production';
    response.cookie('auth-token', '', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 0, // 即座に期限切れ
      path: '/',
    });

    return { message: 'ログアウトしました' };
  }
}
