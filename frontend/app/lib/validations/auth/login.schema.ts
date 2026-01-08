import { z } from 'zod';

/**
 * ログイン用のZodスキーマ
 * バックエンドとフロントエンドで共通のバリデーションルール
 */
export const loginSchema = z.object({
  email: z
    .string('メールアドレスは文字列である必要があります')
    .email('有効なメールアドレスを入力してください')
    .min(1, 'メールアドレスを入力してください'),
  password: z
    .string('パスワードは文字列である必要があります')
    .min(6, 'パスワードは6文字以上である必要があります'),
});

/**
 * ログインスキーマの型
 */
export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * メールアドレスのみのスキーマ
 */
export const emailSchema = z
  .string('メールアドレスは文字列である必要があります')
  .email('有効なメールアドレスを入力してください')
  .min(1, 'メールアドレスを入力してください');

/**
 * パスワードのみのスキーマ
 */
export const passwordSchema = z
  .string('パスワードは文字列である必要があります')
  .min(6, 'パスワードは6文字以上である必要があります');

