import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { maskSensitiveData } from '../../shared/utils/log-mask.util';

/**
 * グローバル例外フィルター
 * すべてのHTTP例外をキャッチし、統一された形式でレスポンスを返す
 * 参考: https://docs.nestjs.com/exception-filters
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // 例外の種類に応じてステータスコードとメッセージを決定
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = '内部サーバーエラーが発生しました';
    let error: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as {
          message?: string | string[];
          error?: string;
        };
        message = responseObj.message || message;
        error = responseObj.error;
      }
    } else if (exception instanceof Error) {
      // 予期しないエラーの場合、本番環境では詳細を隠す
      const isProduction = process.env.NODE_ENV === 'production';
      if (!isProduction) {
        message = exception.message;
      }
    }

    // IPアドレスを取得（プロキシ経由の場合も考慮）
    const clientIp =
      (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (request.headers['x-real-ip'] as string) ||
      request.ip ||
      request.socket.remoteAddress ||
      'unknown';

    // リクエストIDを取得
    const requestId =
      (request as Request & { requestId?: string }).requestId ||
      (request.headers['x-request-id'] as string) ||
      'unknown';

    // エラーログを出力（機密情報をマスク、IPアドレスとリクエストIDを含める）
    const errorLog = {
      requestId, // リクエストIDを記録（ログの追跡用）
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      clientIp, // IPアドレスを記録（セキュリティインシデント追跡用）
      userAgent: request.headers['user-agent'],
      message: Array.isArray(message) ? message.join(', ') : message,
      error: exception instanceof Error ? exception.stack : undefined,
      // リクエストボディをマスクして記録（機密情報漏洩防止）
      body: request.body ? maskSensitiveData(request.body) : undefined,
    };

    if (status >= 500) {
      // サーバーエラー（500番台）はエラーログとして記録
      this.logger.error(JSON.stringify(errorLog, null, 2));
    } else {
      // クライアントエラー（400番台）は警告ログとして記録
      this.logger.warn(JSON.stringify(errorLog, null, 2));
    }

    // クライアントに返すレスポンス
    const responseBody: {
      statusCode: number;
      timestamp: string;
      path: string;
      message: string | string[];
      requestId?: string;
      error?: string;
    } = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      requestId: requestId,
    };

    // 開発環境でのみエラー詳細を追加
    if (error && process.env.NODE_ENV !== 'production') {
      responseBody.error = error;
    }

    response.status(status).json(responseBody);
  }
}
