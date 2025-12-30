import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

/**
 * リクエストIDミドルウェア
 * 各リクエストに一意のIDを付与し、ログの追跡を可能にする
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // リクエストIDを生成（既に存在する場合は使用）
    const requestId = (req.headers['x-request-id'] as string) || randomUUID();

    // リクエストオブジェクトに追加
    (req as Request & { requestId: string }).requestId = requestId;

    // レスポンスヘッダーに追加
    res.setHeader('X-Request-ID', requestId);

    next();
  }
}
