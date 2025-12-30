import {
  Body,
  Controller,
  Post,
  Get,
  HttpCode,
  HttpStatus,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { TokenBlacklistService } from './services/token-blacklist.service';

/**
 * 認証コントローラー
 * ログインなどの認証関連のエンドポイントを提供
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenBlacklistService: TokenBlacklistService,
  ) {}

  /**
   * メールアドレスとパスワードでログイン
   * セキュリティ強化:
   * - クッキーをHttpOnly、Secure、SameSiteで設定
   * - レート制限: 1分間に5回まで（ブルートフォース攻撃対策）
   */
  @Post('login')
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 1分間に5回まで（ブルートフォース攻撃対策）
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
    const result = await this.authService.login(loginDto);

    // セキュリティ強化: クッキーをHttpOnly、Secure、SameSiteで設定
    // HttpOnly: JavaScriptからアクセス不可（XSS攻撃対策）
    // Secure: HTTPS接続時のみ送信（本番環境で必須）
    // SameSite=Lax: CSRF攻撃対策
    const isProduction = process.env.NODE_ENV === 'production';
    response.cookie('auth-token', result.accessToken, {
      httpOnly: true, // JavaScriptからアクセス不可（XSS攻撃対策）
      secure: isProduction, // 本番環境ではHTTPS必須
      sameSite: 'lax', // CSRF攻撃対策
      maxAge: 24 * 60 * 60 * 1000, // 24時間
      path: '/',
    });

    return result;
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
    @CurrentUser() user: any,
    @Res({ passthrough: true }) response: Response,
    @Req() request: any,
  ) {
    // トークンを取得（クッキーまたはAuthorizationヘッダーから）
    let token: string | null = null;
    if (request?.cookies?.['auth-token']) {
      token = request.cookies['auth-token'];
    } else if (request?.headers?.authorization?.startsWith('Bearer ')) {
      token = request.headers.authorization.substring(7);
    }

    // トークンをブラックリストに追加（無効化）
    if (token) {
      await this.tokenBlacklistService.addToBlacklist(token);
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

  /**
   * 現在のユーザー情報を取得
   * JWTトークンからユーザー情報を取得
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '現在のユーザー情報を取得' })
  @ApiResponse({
    status: 200,
    description: 'ユーザー情報取得成功',
  })
  @ApiResponse({
    status: 401,
    description: '認証が必要です',
  })
  async getMe(@CurrentUser() user: any) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      company: user.company,
    };
  }
}
