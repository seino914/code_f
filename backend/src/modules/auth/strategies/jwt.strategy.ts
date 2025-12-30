import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { TokenBlacklistService } from '../services/token-blacklist.service';

/**
 * JWTペイロードの型
 */
export interface JwtPayload {
  sub: string; // ユーザーID
  email: string;
}

/**
 * JWT認証ストラテジー
 * Passport JWT Strategyを使用してトークンを検証
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly tokenBlacklistService: TokenBlacklistService,
  ) {
    // super()を呼ぶ前に環境変数を取得
    const secret = configService.get<string>('JWT_SECRET');
    const nodeEnv = configService.get<string>('NODE_ENV');

    if (!secret && nodeEnv === 'production') {
      throw new Error(
        'JWT_SECRET環境変数が設定されていません。本番環境では必須です。',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // クッキーからトークンを取得
        (request: any) => {
          // Expressのrequestオブジェクトからクッキーを取得
          let token: string | null = null;

          if (request?.cookies?.['auth-token']) {
            token = request.cookies['auth-token'];
          } else if (request?.headers?.cookie) {
            // クッキーヘッダーから直接取得（フォールバック）
            const cookies = request.headers.cookie.split(';');
            for (const cookie of cookies) {
              const [name, value] = cookie.trim().split('=');
              if (name === 'auth-token') {
                token = value;
                break;
              }
            }
          }

          // Authorizationヘッダーからも取得可能（オプション）
          if (!token) {
            const authHeader = request?.headers?.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
              token = authHeader.substring(7);
            }
          }

          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: secret || 'your-secret-key-change-in-production',
    });
  }

  /**
   * JWTペイロードを検証し、ユーザー情報を返す
   * @param payload JWTペイロード
   * @returns ユーザー情報
   */
  async validate(payload: JwtPayload) {
    // トークンがブラックリストに含まれているかチェック
    // 注意: この時点ではトークン全体にアクセスできないため、
    // トークンのハッシュまたはjti（JWT ID）を使用する必要がある
    // 現在の実装では、validateメソッド内でトークンにアクセスできないため、
    // ガードレベルでチェックする必要がある

    // ユーザーが存在するか確認
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('ユーザーが見つかりません');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      company: user.company,
    };
  }
}
