import { z } from 'zod';

/**
 * ユーザー情報更新用のZodスキーマ
 * パスワードは含まない
 */
export const updateUserSchema = z.object({
  name: z
    .string('名前は文字列である必要があります')
    .min(1, '名前を入力してください')
    .max(100, '名前は100文字以内である必要があります'),
  company: z
    .string('会社名は文字列である必要があります')
    .min(1, '会社名を入力してください')
    .max(100, '会社名は100文字以内である必要があります'),
  email: z
    .string('メールアドレスは文字列である必要があります')
    .email('有効なメールアドレスを入力してください')
    .min(1, 'メールアドレスを入力してください'),
});

/**
 * ユーザー情報更新スキーマの型
 */
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
