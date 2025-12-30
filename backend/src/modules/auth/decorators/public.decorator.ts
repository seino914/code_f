import { SetMetadata } from '@nestjs/common';

/**
 * 公開エンドポイント用デコレータ
 * このデコレータが付いているエンドポイントは認証不要
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
