'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { NameInput, CompanyInput, EmailInput } from '../../components/inputForms';
import { RegisterPasswordInput } from '../../components/inputForms/RegisterPasswordInput';
import { PasswordConfirmInput } from '../../components/inputForms/PasswordConfirmInput';
import { registerSchema } from '../../lib/validations/auth/register.schema';
import { container } from '../../infrastructure/di/container';

/**
 * 登録画面コンポーネント
 * メールアドレス/パスワード登録を提供
 * クリーンアーキテクチャに基づき、ユースケースを使用
 */
export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  // フォームの状態
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [formError, setFormError] = useState<string | undefined>();

  /**
   * 登録処理
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(undefined);
    setError(undefined);

    // Zodスキーマでフォーム全体をバリデーション
    const validationResult = registerSchema.safeParse({
      email,
      password,
      passwordConfirm,
      name,
      company,
    });

    if (!validationResult.success) {
      // 最初のエラーメッセージを表示
      const firstError = validationResult.error.issues[0];
      setFormError(firstError?.message);
      return;
    }

    setIsLoading(true);

    try {
      // ユースケースを使用して登録
      const result = await container.registerUseCase.execute({
        email: validationResult.data.email,
        password: validationResult.data.password,
        passwordConfirm: validationResult.data.passwordConfirm,
        name: validationResult.data.name,
        company: validationResult.data.company,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      // 登録成功時のトーストを表示
      toast.success('登録が完了しました', {
        description: 'アカウントの作成が成功しました。',
      });

      // 少し待ってからログインページにリダイレクト
      setTimeout(() => {
        router.push('/login');
      }, 500);
    } catch (err) {
      // 予期しないエラー
      console.error('Register error:', err);
      setError('登録に失敗しました。しばらくしてから再度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 px-4">
      <main className="w-full max-w-md">
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-8 shadow-xl sm:px-8 sm:py-10">
          <header className="mb-8 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
              ユーザー登録
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              アカウントを作成してください
            </p>
          </header>

          {(error || formError) && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error || formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <NameInput
              value={name}
              onChange={setName}
              onValidationChange={() => {}}
            />

            <CompanyInput
              value={company}
              onChange={setCompany}
              onValidationChange={() => {}}
            />

            <EmailInput
              value={email}
              onChange={setEmail}
              onValidationChange={() => {}}
            />

            <RegisterPasswordInput
              value={password}
              onChange={setPassword}
              onValidationChange={() => {}}
            />

            <PasswordConfirmInput
              value={passwordConfirm}
              password={password}
              onChange={setPasswordConfirm}
              onValidationChange={() => {}}
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition-colors hover:bg-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? '登録中...' : 'アカウントを作成'}
            </button>
          </form>

          <footer className="mt-6 text-center text-sm text-gray-600">
            <p>
              既にアカウントをお持ちですか？{' '}
              <a
                href="/login"
                className="font-medium text-sky-600 hover:text-sky-700"
              >
                ログイン
              </a>
            </p>
            <p className="mt-4 text-[11px] leading-relaxed text-gray-500">
              登録することで、利用規約およびプライバシーポリシーに同意したものとみなされます。
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
