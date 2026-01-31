import { z } from 'zod';

/**
 * 登録用のZodスキーマ
 * バックエンドとフロントエンドで共通のバリデーションルール
 */
export const registerSchema = z
  .object({
    email: z
      .string('メールアドレスは文字列である必要があります')
      .email('有効なメールアドレスを入力してください')
      .min(1, 'メールアドレスを入力してください'),
    password: z
      .string('パスワードは文字列である必要があります')
      .min(8, 'パスワードは8文字以上である必要があります')
      .regex(/[A-Z]/, 'パスワードには大文字を含める必要があります')
      .regex(/[a-z]/, 'パスワードには小文字を含める必要があります')
      .regex(/[0-9]/, 'パスワードには数字を含める必要があります'),
    passwordConfirm: z
      .string('パスワード確認は文字列である必要があります')
      .min(1, 'パスワード確認を入力してください'),
    name: z
      .string('名前は文字列である必要があります')
      .min(1, '名前を入力してください')
      .max(100, '名前は100文字以内である必要があります'),
    company: z
      .string('会社名は文字列である必要があります')
      .min(1, '会社名を入力してください')
      .max(100, '会社名は100文字以内である必要があります'),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'パスワードとパスワード確認が一致しません',
    path: ['passwordConfirm'],
  });

/**
 * 登録スキーマの型
 */
export type RegisterFormData = z.infer<typeof registerSchema>;
