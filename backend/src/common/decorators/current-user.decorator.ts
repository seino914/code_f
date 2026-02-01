import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * 現在のユーザー情報を取得するデコレータ
 * JWT認証ガードで検証されたユーザー情報を取得
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  }
);
