'use client';

import { useCallback, useState } from 'react';

interface CompanyInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidationChange: (isValid: boolean) => void;
}

/** 基本の入力フィールドスタイル */
const baseInputClassName =
  'block w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

/**
 * 会社名のバリデーション
 */
const validateCompany = (company: string): string | undefined => {
  if (company.length === 0) {
    return '会社名を入力してください';
  }
  if (company.length > 100) {
    return '会社名は100文字以内である必要があります';
  }
  return undefined;
};

/**
 * 会社名入力コンポーネント
 * バリデーション機能付き
 */
export function CompanyInput({
  value,
  onChange,
  onValidationChange,
}: CompanyInputProps) {
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
        const validationError = validateCompany(newValue);
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
    const validationError = validateCompany(value);
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
        htmlFor="company"
        className="block text-sm font-medium text-gray-700"
      >
        会社名
      </label>
      <input
        id="company"
        name="company"
        type="text"
        required
        autoComplete="organization"
        placeholder="株式会社サンプル"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        className={inputClassName}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? 'company-error' : undefined}
      />
      {error && (
        <p id="company-error" className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

