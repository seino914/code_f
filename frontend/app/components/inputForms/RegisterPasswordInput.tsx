'use client';

import { useCallback, useState } from 'react';

interface RegisterPasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidationChange: (isValid: boolean) => void;
}

/** 基本の入力フィールドスタイル */
const baseInputClassName =
  'block w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

/**
 * 登録用パスワードのバリデーション
 */
const validateRegisterPassword = (password: string): string | undefined => {
  if (password.length === 0) {
    return 'パスワードを入力してください';
  }
  if (password.length < 8) {
    return 'パスワードは8文字以上である必要があります';
  }
  if (!/[A-Z]/.test(password)) {
    return 'パスワードには大文字を含める必要があります';
  }
  if (!/[a-z]/.test(password)) {
    return 'パスワードには小文字を含める必要があります';
  }
  if (!/[0-9]/.test(password)) {
    return 'パスワードには数字を含める必要があります';
  }
  return undefined;
};

/**
 * 登録用パスワード入力コンポーネント
 */
export function RegisterPasswordInput({
  value,
  onChange,
  onValidationChange,
}: RegisterPasswordInputProps) {
  const [error, setError] = useState<string | undefined>();

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      onChange(newValue);

      // 入力中はエラーをクリア
      if (error) {
        setError(undefined);
      }

      // リアルタイムバリデーション（空でない場合のみ）
      if (newValue.length > 0) {
        const validationError = validateRegisterPassword(newValue);
        setError(validationError);
        onValidationChange(!validationError);
      } else {
        // 空の場合はバリデーション状態をリセット
        setError(undefined);
        onValidationChange(false);
      }
    },
    [error, onChange, onValidationChange]
  );

  const handleBlur = useCallback(() => {
    const validationError = validateRegisterPassword(value);
    setError(validationError);
    onValidationChange(!validationError);
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
        minLength={8}
        autoComplete="new-password"
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
      <p className="mt-1 text-xs text-gray-500">
        パスワードは8文字以上で、大文字・小文字・数字を含む必要があります
      </p>
    </div>
  );
}
