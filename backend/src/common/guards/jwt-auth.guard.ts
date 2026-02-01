import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { TokenBlacklistService } from '../../domain/auth/services/token-blacklist.service';

/**
 * JWT認証ガード
 * 保護されたエンドポイントでJWTトークンを検証
 * トークンのブラックリストもチェック
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private tokenBlacklistService: TokenBlacklistService
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 公開エンドポイントの場合は認証をスキップ
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // トークンを取得してブラックリストをチェック
    const request = context.switchToHttp().getRequest();
    let token: string | null = null;

    if (request?.cookies?.['auth-token']) {
      token = request.cookies['auth-token'];
    } else if (request?.headers?.authorization?.startsWith('Bearer ')) {
      token = request.headers.authorization.substring(7);
    }

    if (token && (await this.tokenBlacklistService.isBlacklisted(token))) {
      throw new UnauthorizedException('このトークンは無効化されています');
    }

    return super.canActivate(context) as Promise<boolean>;
  }
}

