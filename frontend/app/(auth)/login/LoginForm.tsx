'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EmailLoginForm } from './EmailLoginForm';
import { container } from '../../infrastructure/di/container';

/**
 * ログイン画面コンポーネント
 * メールアドレス/パスワードログインを提供
 * クリーンアーキテクチャに基づき、ユースケースを使用
 */
export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  /**
   * メールアドレスログイン処理
   */
  const handleEmailLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError(undefined);

    try {
      // ユースケースを使用してログイン
      const result = await container.loginUseCase.execute({ email, password });

      if (!result.success) {
        setError(result.error);
        return;
      }

      // ログイン成功
      // クッキーはバックエンドでHttpOnlyとして設定されるため、
      // クライアント側での設定は不要（セキュリティ強化）
      // リダイレクト前に少し待機してクッキーが確実に設定されるようにする
      await new Promise((resolve) => setTimeout(resolve, 100));

      // ページをリロードしてmiddlewareがクッキーを認識できるようにする
      router.refresh();
      router.push('/dashboard');
    } catch (err) {
      // 予期しないエラー
      console.error('Login error:', err);
      setError('ログインに失敗しました。しばらくしてから再度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * パスワード忘れた場合の処理
   */
  const handleForgotPassword = () => {
    console.log('Forgot password clicked');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 px-4">
      <main className="w-full max-w-md">
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-8 shadow-xl sm:px-8 sm:py-10">
          <header className="mb-8 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
              ログイン
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              メールアドレスでサインインしてください
            </p>
          </header>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <EmailLoginForm
              onSubmit={handleEmailLogin}
              onForgotPassword={handleForgotPassword}
              isLoading={isLoading}
            />
          </div>

          <footer className="mt-6 text-center text-sm text-gray-600">
            <p>
              アカウントをお持ちでないですか？{' '}
              <a
                href="/register"
                className="font-medium text-sky-600 hover:text-sky-700"
              >
                登録
              </a>
            </p>
            <p className="mt-4 text-[11px] leading-relaxed text-gray-500">
              ログインすることで、利用規約およびプライバシーポリシーに同意したものとみなされます。
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
