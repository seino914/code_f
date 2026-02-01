import { Injectable } from '@nestjs/common';
import { AuthUsecase } from './usecase/auth.usecase';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { RegisterDto, RegisterResponseDto } from './dto/register.dto';

/**
 * 認証サービス
 * ユーザーのログイン処理とJWTトークン生成を担当
 */
@Injectable()
export class AuthService {
  constructor(private readonly authUsecase: AuthUsecase) {}

  /**
   * メールアドレスとパスワードでログイン
   * セキュリティ強化:
   * - ログイン試行回数の記録
   * - アカウントロック機能
   * - タイミング攻撃対策
   * @param loginDto ログイン情報
   * @returns アクセストークンとユーザー情報
   * @throws UnauthorizedException メールアドレスまたはパスワードが無効な場合
   * @throws ForbiddenException アカウントがロックされている場合
   */
  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    return await this.authUsecase.login(loginDto);
  }

  /**
   * ユーザー登録
   * セキュリティ強化:
   * - パスワード強度チェック
   * - メールアドレスの重複チェック
   * - パスワードのハッシュ化
   * @param registerDto 登録情報
   * @returns 登録成功メッセージとユーザー情報
   * @throws ConflictException メールアドレスが既に登録されている場合
   */
  async register(registerDto: RegisterDto): Promise<RegisterResponseDto> {
    return await this.authUsecase.register(registerDto);
  }
}
