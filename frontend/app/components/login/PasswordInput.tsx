'use client';

interface PasswordInputProps {
  showForgotPassword?: boolean;
  onForgotPassword?: () => void;
}

/** 共通の入力フィールドスタイル */
const inputClassName =
  'block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2';

/**
 * パスワード入力コンポーネント
 */
export function PasswordInput({
  showForgotPassword = true,
  onForgotPassword,
}: PasswordInputProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          パスワード
        </label>
        {showForgotPassword && (
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-xs text-sky-600 hover:text-sky-700"
          >
            パスワードをお忘れですか？
          </button>
        )}
      </div>
      <input
        id="password"
        name="password"
        type="password"
        required
        autoComplete="current-password"
        placeholder="••••••••"
        className={inputClassName}
      />
    </div>
  );
}

