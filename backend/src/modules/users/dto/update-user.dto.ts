import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/**
 * ユーザー情報更新リクエストスキーマ
 * パスワードは含まない
 */
const UpdateUserSchema = z.object({
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
 * ユーザー情報更新リクエストDTO（Zodスキーマから生成）
 */
export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}

/**
 * ユーザー情報更新成功レスポンススキーマ
 */
const UpdateUserResponseSchema = z.object({
  message: z.string().describe('更新成功メッセージ'),
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    company: z.string(),
  }),
});

/**
 * ユーザー情報更新成功レスポンスDTO（Zodスキーマから生成）
 */
export class UpdateUserResponseDto extends createZodDto(
  UpdateUserResponseSchema,
) {}
