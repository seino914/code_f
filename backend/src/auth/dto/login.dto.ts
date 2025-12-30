import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/**
 * ログインリクエストスキーマ
 */
const LoginSchema = z.object({
  email: z
    .string('メールアドレスは文字列である必要があります')
    .email('有効なメールアドレスを入力してください')
    .min(1, 'メールアドレスを入力してください'),
  password: z
    .string('パスワードは文字列である必要があります')
    .min(6, 'パスワードは6文字以上である必要があります'),
});

/**
 * ログインリクエストDTO（Zodスキーマから生成）
 */
export class LoginDto extends createZodDto(LoginSchema) {}

/**
 * ログイン成功レスポンススキーマ
 */
const LoginResponseSchema = z.object({
  accessToken: z.string().describe('JWT認証トークン'),
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    company: z.string(),
  }),
});

/**
 * ログイン成功レスポンスDTO（Zodスキーマから生成）
 */
export class LoginResponseDto extends createZodDto(LoginResponseSchema) {}

