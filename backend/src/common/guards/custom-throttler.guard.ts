import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModuleOptions } from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';

/**
 * カスタムThrottlerGuard
 * ログイン周り（/auth/login）のみレート制限を適用
 * それ以外のエンドポイントではレート制限をスキップ
 */
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  constructor(
    options: ThrottlerModuleOptions,
    storageService: any,
    reflector: Reflector
  ) {
    super(options, storageService, reflector);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    // リクエストURLを取得（クエリパラメータを除く）
    const url = request.url?.split('?')[0] || '';
    const path = request.path || url;

    // ログイン周りのエンドポイントのみレート制限を適用
    // /auth/login のみチェック
    const isLoginEndpoint =
      path === '/auth/login' || path.startsWith('/auth/login');
    if (!isLoginEndpoint) {
      // ログイン周り以外はレート制限をスキップ
      return true;
    }

    // ログイン周りのエンドポイントのみレート制限を適用
    return super.canActivate(context);
  }
}
