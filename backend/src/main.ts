import { NestFactory } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { validateEnvironmentVariables } from './common/validators/env.validator';

/**
 * アプリケーションの起動処理
 * NestJS公式ドキュメントに基づくセキュリティ設定を適用
 * 参考:
 * - Helmet: https://docs.nestjs.com/security/helmet
 * - CORS: https://docs.nestjs.com/security/cors
 * - Exception Filters: https://docs.nestjs.com/exception-filters
 */
async function bootstrap() {
  // 環境変数の検証（起動前に実行）
  validateEnvironmentVariables();

  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Helmetを最初に適用（セキュリティヘッダー設定）
  // 参考: https://docs.nestjs.com/security/helmet
  // 注意: helmetは他のapp.use()より前に呼ぶ必要がある
  app.use(helmet());

  // リクエストIDミドルウェア（ログの追跡のため）
  app.use((req: Request, res: Response, next: NextFunction) => {
    const requestId =
      (req.headers['x-request-id'] as string) || randomUUID();
    (req as Request & { requestId: string }).requestId = requestId;
    res.setHeader('X-Request-ID', requestId);
    next();
  });

  // クッキーパーサーを有効化（JWT認証でクッキーからトークンを取得するために必要）
  app.use(cookieParser());

  // CORSを有効化（フロントエンドからのリクエストを許可）
  // 参考: https://docs.nestjs.com/security/cors
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const isProduction = process.env.NODE_ENV === 'production';

  app.enableCors({
    origin: isProduction
      ? frontendUrl // 本番環境では環境変数から取得
      : [frontendUrl, 'http://localhost:3000'], // 開発環境では複数オリジンを許可
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Set-Cookie'],
    maxAge: 86400, // 24時間（プリフライトリクエストのキャッシュ時間）
  });

  // リクエストサイズ制限（DoS攻撃対策）
  // Expressのデフォルトは100kb、JSONは50mbに設定
  app.use((req: Request, res: Response, next: NextFunction) => {
    // リクエストボディのサイズ制限（10MB）
    if (req.headers['content-length']) {
      const contentLength = parseInt(req.headers['content-length'], 10);
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (contentLength > maxSize) {
        res.status(413).json({
          statusCode: 413,
          message: 'リクエストサイズが大きすぎます',
        });
        return;
      }
    }
    next();
  });

  // グローバルバリデーションパイプを有効化（Zodを使用）
  app.useGlobalPipes(new ZodValidationPipe());

  // グローバル例外フィルターを適用
  // 参考: https://docs.nestjs.com/exception-filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swaggerの設定（本番環境では無効化）
  // 参考: https://docs.nestjs.com/openapi/introduction
  if (!isProduction) {
    const config = new DocumentBuilder()
      .setTitle('Code_F API Documentation')
      .setDescription('API documentation for the application')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'JWT認証トークン',
          in: 'header',
        },
        'JWT-auth', // この名前は@ApiBearerAuth('JWT-auth')で使用
      )
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
    logger.log('Swagger UI is available at http://localhost:3001/api');
  } else {
    logger.warn('Swagger UI is disabled in production environment');
  }

  const port = process.env.PORT ?? 3001;
  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}
bootstrap();
