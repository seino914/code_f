'use client';

import { useCallback, useState } from 'react';

interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidationChange: (isValid: boolean) => void;
}

/** 基本の入力フィールドスタイル */
const baseInputClassName =
  'block w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

/**
 * メールアドレスのバリデーション
 * RFC 5322 に準拠した基本的な形式チェック
 */
const validateEmail = (email: string): string | undefined => {
  if (!email) {
    return 'メールアドレスを入力してください';
  }

  // 基本的なメールアドレス形式のチェック
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'メールアドレスの形式が正しくありません';
  }

  // より厳密なチェック（連続ドット、先頭/末尾のドットなど）
  if (email.includes('..') || email.startsWith('.') || email.endsWith('.')) {
    return 'メールアドレスの形式が正しくありません';
  }

  return undefined;
};

/**
 * メールアドレス入力コンポーネント
 * バリデーション機能付き
 */
export function EmailInput({
  value,
  onChange,
  onValidationChange,
}: EmailInputProps) {
  const [error, setError] = useState<string | undefined>();

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      onChange(newValue);

      // 入力中はエラーをクリア（フォーカスアウト時に再検証）
      if (error) {
        setError(undefined);
        onValidationChange(true);
      }
    },
    [error, onChange, onValidationChange]
  );

  const handleBlur = useCallback(() => {
    const validationError = validateEmail(value);
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
        htmlFor="email"
        className="block text-sm font-medium text-gray-700"
      >
        メールアドレス
      </label>
      <input
        id="email"
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@example.com"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        className={inputClassName}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? 'email-error' : undefined}
      />
      {error && (
        <p id="email-error" className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

