import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../domain/repositories/user.repository.interface';
import {
  ITokenRepository,
  TOKEN_REPOSITORY,
} from '../../../domain/repositories/token.repository.interface';
import { toUserPublicInfo } from '../../../domain/entities/user.entity';

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
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(TOKEN_REPOSITORY)
    private readonly tokenRepository: ITokenRepository,
    private readonly configService: ConfigService,
  ) {
    // super()を呼ぶ前に環境変数を取得
    const secret = configService.get<string>('JWT_SECRET') as string;

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // クッキーからトークンを取得
        (request: {
          cookies?: Record<string, string>;
          headers?: { cookie?: string; authorization?: string };
        }) => {
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
      secretOrKey: secret,
      passReqToCallback: true, // リクエストオブジェクトをコールバックに渡す
    });
  }

  /**
   * JWTペイロードを検証し、ユーザー情報を返す
   * @param request リクエストオブジェクト
   * @param payload JWTペイロード
   * @returns ユーザー情報
   */
  async validate(
    request: {
      cookies?: Record<string, string>;
      headers?: { authorization?: string };
    },
    payload: JwtPayload,
  ) {
    // トークンを取得してブラックリストチェック
    let token: string | undefined;
    if (request?.cookies?.['auth-token']) {
      token = request.cookies['auth-token'];
    } else if (request?.headers?.authorization?.startsWith('Bearer ')) {
      token = request.headers.authorization.substring(7);
    }

    if (token) {
      const isBlacklisted = await this.tokenRepository.isBlacklisted(token);
      if (isBlacklisted) {
        throw new UnauthorizedException('トークンは無効化されています');
      }
    }

    // ユーザーが存在するか確認
    const user = await this.userRepository.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('ユーザーが見つかりません');
    }

    return toUserPublicInfo(user);
  }
}
