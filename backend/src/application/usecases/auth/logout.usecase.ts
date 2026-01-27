import { Injectable, Inject, Logger } from '@nestjs/common';
import {
  ITokenRepository,
  TOKEN_REPOSITORY,
} from '../../../domain/repositories/token.repository.interface';
import {
  IJwtService,
  JWT_SERVICE,
} from '../../../domain/services/jwt.service.interface';

/**
 * ログアウト入力データ
 */
export interface LogoutInput {
  token: string;
}

/**
 * ログアウト出力データ
 */
export interface LogoutOutput {
  message: string;
}

/**
 * ログアウトユースケース
 * トークンの無効化を担当
 */
@Injectable()
export class LogoutUseCase {
  private readonly logger = new Logger(LogoutUseCase.name);

  constructor(
    @Inject(TOKEN_REPOSITORY)
    private readonly tokenRepository: ITokenRepository,
    @Inject(JWT_SERVICE)
    private readonly jwtService: IJwtService,
  ) {}

  /**
   * ログアウト処理を実行
   * @param input ログアウト入力データ
   * @returns ログアウト結果
   */
  async execute(input: LogoutInput): Promise<LogoutOutput> {
    try {
      // トークンの有効期限を取得
      const expiresAt = this.jwtService.getExpiration(input.token);

      // トークンをブラックリストに追加
      await this.tokenRepository.addToBlacklist({
        token: input.token,
        expiresAt,
      });

      this.logger.log('User logged out successfully');

      return { message: 'ログアウトしました' };
    } catch {
      // トークンのパースに失敗しても、ログアウト自体は成功とみなす
      this.logger.warn('Failed to parse token during logout, but proceeding');
      return { message: 'ログアウトしました' };
    }
  }
}
