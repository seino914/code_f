import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import {
  IJwtService,
  JwtPayload,
} from '../../domain/services/jwt.service.interface';

/**
 * NestJS JwtServiceによるJWTサービス実装
 * IJwtServiceの実装
 */
@Injectable()
export class NestJsJwtService implements IJwtService {
  constructor(private readonly jwtService: NestJwtService) {}

  sign(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    return this.jwtService.sign(payload);
  }

  verify(token: string): JwtPayload {
    return this.jwtService.verify<JwtPayload>(token);
  }

  getExpiration(token: string): Date {
    const decoded = this.jwtService.decode<JwtPayload>(token);

    if (!decoded || !decoded.exp) {
      // デフォルトで24時間後
      return new Date(Date.now() + 24 * 60 * 60 * 1000);
    }

    // exp はUNIX秒なのでミリ秒に変換
    return new Date(decoded.exp * 1000);
  }
}
