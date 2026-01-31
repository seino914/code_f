'use client';

import { useCallback, useState } from 'react';
import { passwordSchema } from '../../lib/validations/auth/login.schema';
import Link from 'next/link';

interface PasswordInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onValidationChange?: (isValid: boolean) => void;
}

/** 基本の入力フィールドスタイル */
const baseInputClassName =
  'block w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

/**
 * パスワードのバリデーション（Zodを使用）
 */
const validatePassword = (password: string): string | undefined => {
  const result = passwordSchema.safeParse(password);
  if (!result.success) {
    return result.error.issues[0]?.message;
  }
  return undefined;
};

/**
 * パスワード入力コンポーネント
 */
export function PasswordInput({
  value: controlledValue,
  onChange,
  onValidationChange,
}: PasswordInputProps) {
  const [error, setError] = useState<string | undefined>();
  const [internalValue, setInternalValue] = useState('');

  // 制御された値（親から渡される）または内部の値を使用
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;

      // 親コンポーネントに値を通知
      if (onChange) {
        onChange(newValue);
      } else {
        setInternalValue(newValue);
      }

      // 入力中はエラーをクリア
      if (error) {
        setError(undefined);
      }

      // リアルタイムバリデーション（空でない場合のみ）
      if (newValue.length > 0) {
        const validationError = validatePassword(newValue);
        setError(validationError);
        onValidationChange?.(!validationError);
      } else {
        // 空の場合はバリデーション状態をリセット
        setError(undefined);
        onValidationChange?.(false);
      }
    },
    [error, onChange, onValidationChange]
  );

  const handleBlur = useCallback(() => {
    const validationError = validatePassword(value);
    setError(validationError);
    onValidationChange?.(!validationError);
  }, [value, onValidationChange]);

  const inputClassName = `${baseInputClassName} ${
    error
      ? 'border-red-500 focus-visible:ring-red-500'
      : 'border-gray-300 focus-visible:ring-sky-500'
  }`;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor="password"
        className="block text-sm font-medium text-gray-700"
      >
        パスワード
      </label>
      <input
        id="password"
        name="password"
        type="password"
        required
        minLength={6}
        autoComplete="current-password"
        placeholder="••••••••"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        className={inputClassName}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? 'password-error' : undefined}
      />
      {error && (
        <p
          id="password-error"
          className="mt-1 text-xs text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
      <div className="flex items-center justify-end">
        <Link
          href="/password-reset"
          className="text-xs text-sky-600 hover:text-sky-700 block"
        >
          パスワードをお忘れですか？
        </Link>
      </div>
    </div>
  );
}
