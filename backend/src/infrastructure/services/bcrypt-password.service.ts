import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  IPasswordService,
  PasswordStrengthResult,
} from '../../domain/services/password.service.interface';

/**
 * bcryptによるパスワードサービス実装
 * IPasswordServiceの実装
 */
@Injectable()
export class BcryptPasswordService implements IPasswordService {
  private readonly SALT_ROUNDS = 10;
  private readonly MIN_LENGTH = 8;

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  async compare(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  checkStrength(password: string): PasswordStrengthResult {
    const errors: string[] = [];

    // 最低文字数チェック
    if (password.length < this.MIN_LENGTH) {
      errors.push(`パスワードは${this.MIN_LENGTH}文字以上である必要があります`);
    }

    // 大文字チェック
    if (!/[A-Z]/.test(password)) {
      errors.push('パスワードには大文字を含める必要があります');
    }

    // 小文字チェック
    if (!/[a-z]/.test(password)) {
      errors.push('パスワードには小文字を含める必要があります');
    }

    // 数字チェック
    if (!/[0-9]/.test(password)) {
      errors.push('パスワードには数字を含める必要があります');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
