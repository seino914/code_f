import { SetMetadata } from '@nestjs/common';

/**
 * 公開エンドポイントを示すデコレータ
 * JWT認証ガードで認証をスキップするために使用
 */
export const Public = () => SetMetadata('isPublic', true);
