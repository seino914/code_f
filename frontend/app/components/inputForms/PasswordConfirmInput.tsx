'use client';

import { useCallback, useState } from 'react';

interface PasswordConfirmInputProps {
  value: string;
  password: string;
  onChange: (value: string) => void;
  onValidationChange: (isValid: boolean) => void;
}

/** 基本の入力フィールドスタイル */
const baseInputClassName =
  'block w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

/**
 * パスワード確認のバリデーション
 */
const validatePasswordConfirm = (
  passwordConfirm: string,
  password: string
): string | undefined => {
  if (passwordConfirm.length === 0) {
    return 'パスワード確認を入力してください';
  }
  if (passwordConfirm !== password) {
    return 'パスワードとパスワード確認が一致しません';
  }
  return undefined;
};

/**
 * パスワード確認入力コンポーネント
 */
export function PasswordConfirmInput({
  value,
  password,
  onChange,
  onValidationChange,
}: PasswordConfirmInputProps) {
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
        const validationError = validatePasswordConfirm(newValue, password);
        setError(validationError);
        onValidationChange(!validationError);
      } else {
        // 空の場合はバリデーション状態をリセット
        setError(undefined);
        onValidationChange(false);
      }
    },
    [error, onChange, onValidationChange, password]
  );

  const handleBlur = useCallback(() => {
    const validationError = validatePasswordConfirm(value, password);
    setError(validationError);
    onValidationChange(!validationError);
  }, [value, password, onValidationChange]);

  const inputClassName = `${baseInputClassName} ${
    error
      ? 'border-red-500 focus-visible:ring-red-500'
      : 'border-gray-300 focus-visible:ring-sky-500'
  }`;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor="passwordConfirm"
        className="block text-sm font-medium text-gray-700"
      >
        パスワード確認
      </label>
      <input
        id="passwordConfirm"
        name="passwordConfirm"
        type="password"
        required
        autoComplete="new-password"
        placeholder="••••••••"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        className={inputClassName}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? 'password-confirm-error' : undefined}
      />
      {error && (
        <p
          id="password-confirm-error"
          className="mt-1 text-xs text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
