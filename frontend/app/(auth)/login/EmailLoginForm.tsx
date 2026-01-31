'use client';

import { useState } from 'react';
import { EmailInput } from '../../components/inputForms';
import { PasswordInput } from '../../components/inputForms/PasswordInput';
import {
  loginSchema,
  type LoginFormData,
} from '../../lib/validations/auth/login.schema';

interface EmailLoginFormProps {
  onSubmit: (email: string, password: string) => void | Promise<void>;
  onForgotPassword?: () => void;
  isLoading?: boolean;
}

/**
 * メールアドレスログインフォームコンポーネント
 * Zodスキーマを使用してバリデーション
 */
export function EmailLoginForm({
  onSubmit,
  onForgotPassword,
  isLoading = false,
}: EmailLoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [formError, setFormError] = useState<string | undefined>();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(undefined);

    // Zodスキーマでフォーム全体をバリデーション
    const result = loginSchema.safeParse({ email, password });

    if (!result.success) {
      // 最初のエラーメッセージを表示
      const firstError = result.error.issues[0];
      setFormError(firstError?.message);

      // バリデーション状態を更新
      const emailError = result.error.issues.find(
        (issue) => issue.path[0] === 'email'
      );
      const passwordError = result.error.issues.find(
        (issue) => issue.path[0] === 'password'
      );

      setIsEmailValid(!emailError);
      setIsPasswordValid(!passwordError);
      return;
    }

    // バリデーション成功時は送信
    try {
      await onSubmit(result.data.email, result.data.password);
    } catch (err) {
      // エラーは親コンポーネントで処理されるため、ここでは何もしない
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    // 入力中はフォームエラーをクリア
    if (formError) {
      setFormError(undefined);
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    // 入力中はフォームエラーをクリア
    if (formError) {
      setFormError(undefined);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {formError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {formError}
        </div>
      )}

      <EmailInput
        value={email}
        onChange={handleEmailChange}
        onValidationChange={setIsEmailValid}
      />

      <PasswordInput
        value={password}
        onChange={handlePasswordChange}
        onValidationChange={setIsPasswordValid}
      />

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition-colors hover:bg-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? 'ログイン中...' : 'メールアドレスでログイン'}
      </button>
    </form>
  );
}
