'use client';

import { useCallback, useState } from 'react';

interface NameInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidationChange: (isValid: boolean) => void;
}

/** 基本の入力フィールドスタイル */
const baseInputClassName =
  'block w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

/**
 * 名前のバリデーション
 */
const validateName = (name: string): string | undefined => {
  if (name.length === 0) {
    return '名前を入力してください';
  }
  if (name.length > 100) {
    return '名前は100文字以内である必要があります';
  }
  return undefined;
};

/**
 * 名前入力コンポーネント
 * バリデーション機能付き
 */
export function NameInput({
  value,
  onChange,
  onValidationChange,
}: NameInputProps) {
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
        const validationError = validateName(newValue);
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
    const validationError = validateName(value);
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
      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
        名前
      </label>
      <input
        id="name"
        name="name"
        type="text"
        required
        autoComplete="name"
        placeholder="山田 太郎"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        className={inputClassName}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? 'name-error' : undefined}
      />
      {error && (
        <p id="name-error" className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
