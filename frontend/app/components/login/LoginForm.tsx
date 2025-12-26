'use client';

import { useRouter } from 'next/navigation';
import { FormDivider } from '../ui/FormDivider';
import { EmailLoginForm } from './EmailLoginForm';
import { GoogleLoginButton } from './GoogleLoginButton';

/**
 * ログイン成功時に認証トークンをクッキーに保存
 * TODO: 実際はバックエンドから受け取ったJWTトークンを保存する
 */
const setAuthToken = (token: string) => {
  document.cookie = `auth-token=${token}; path=/; max-age=86400; SameSite=Lax`;
};

/**
 * ログイン画面コンポーネント
 * Google ログイン + メールアドレス/パスワードログインの両方を提供
 */
export function LoginForm() {
  const router = useRouter();

  /**
   * Google ログイン処理
   * TODO: ログイン処理の実装はバックエンド/API連携時に追加する
   */
  const handleGoogleLogin = () => {
    console.log('Google login clicked');

    // 仮のログイン成功処理（実際はバックエンドAPIのレスポンスを待つ）
    const dummyToken = `google-${Date.now()}`;
    setAuthToken(dummyToken);

    router.push('/dashboard');
  };

  /**
   * メールアドレスログイン処理
   */
  const handleEmailLogin = (email: string, password: string) => {
    console.log('Email login', { email, password });

    // 仮のログイン成功処理（実際はバックエンドAPIのレスポンスを待つ）
    const dummyToken = `email-${Date.now()}`;
    setAuthToken(dummyToken);

    router.push('/dashboard');
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
              Google またはメールアドレスでサインインしてください
            </p>
          </header>

          <div className="space-y-6">
            <GoogleLoginButton onClick={handleGoogleLogin} />
            <FormDivider />
            <EmailLoginForm
              onSubmit={handleEmailLogin}
              onForgotPassword={handleForgotPassword}
            />
          </div>

          <footer className="mt-6 text-center text-[11px] leading-relaxed text-gray-500">
            ログインすることで、利用規約およびプライバシーポリシーに同意したものとみなされます。
          </footer>
        </div>
      </main>
    </div>
  );
}

