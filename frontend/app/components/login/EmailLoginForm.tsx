'use client';

import { useState } from 'react';
import { EmailInput } from './EmailInput';
import { PasswordInput } from './PasswordInput';

interface EmailLoginFormProps {
  onSubmit: (email: string, password: string) => void;
  onForgotPassword?: () => void;
}

/**
 * メールアドレスログインフォームコンポーネント
 */
export function EmailLoginForm({
  onSubmit,
  onForgotPassword,
}: EmailLoginFormProps) {
  const [email, setEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // メールアドレスが有効でない場合は送信しない
    if (!isEmailValid) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const password = formData.get('password') as string;

    onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <EmailInput
        value={email}
        onChange={setEmail}
        onValidationChange={setIsEmailValid}
      />

      <PasswordInput onForgotPassword={onForgotPassword} />

      <button
        type="submit"
        className="w-full rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition-colors hover:bg-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
      >
        メールアドレスでログイン
      </button>
    </form>
  );
}

