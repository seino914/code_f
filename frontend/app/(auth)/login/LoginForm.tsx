'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EmailLoginForm } from './EmailLoginForm';

/**
 * ログイン成功時の処理
 * 注意: クッキーはバックエンドでHttpOnlyとして設定されるため、
 * クライアント側での設定は不要（セキュリティ強化）
 */

/**
 * ログインAPIレスポンス型
 */
interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    company: string;
  };
}

/**
 * ログイン画面コンポーネント
 * メールアドレス/パスワードログインを提供
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
      const response = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      }).catch((fetchError) => {
        // fetch自体が失敗した場合（ネットワークエラー、CORSエラーなど）
        console.error('Fetch error:', fetchError);
        throw new Error(
          `ネットワークエラー: ${fetchError instanceof Error ? fetchError.message : '接続に失敗しました'}`,
        );
      });

      if (!response.ok) {
        // エラーレスポンスをパース
        let errorData: { message?: string | string[]; error?: string } = {};
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          try {
            errorData = await response.json();
          } catch (parseError) {
            // JSONパースに失敗した場合
            console.error('Failed to parse error response:', parseError);
            setError(`サーバーエラーが発生しました（ステータス: ${response.status}）。`);
            return;
          }
        }
        
        // レート制限エラー（429）の場合
        if (response.status === 429) {
          setError('リクエストが多すぎます。しばらく時間をおいてから再度お試しください。');
          return;
        }
        
        // バリデーションエラー（400）の場合、メッセージ配列を処理
        if (response.status === 400) {
          if (Array.isArray(errorData.message)) {
            const errorMessages = errorData.message.join('、');
            setError(errorMessages);
          } else if (typeof errorData.message === 'string') {
            setError(errorData.message);
          } else if (typeof errorData.error === 'string') {
            setError(errorData.error);
          } else {
            setError('入力内容に誤りがあります。確認してください。');
          }
          return;
        }
        
        // 認証エラー（401）の場合
        if (response.status === 401) {
          setError('メールアドレスまたはパスワードが正しくありません。');
          return;
        }
        
        // その他のエラーの場合
        const errorMessage = 
          (typeof errorData.message === 'string' ? errorData.message : undefined) ||
          (typeof errorData.error === 'string' ? errorData.error : undefined) ||
          `ログインに失敗しました（ステータス: ${response.status}）。しばらくしてから再度お試しください。`;
        setError(errorMessage);
        return;
      }

      // 成功レスポンスをパース
      let data: LoginResponse;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Failed to parse success response:', parseError);
        setError('サーバーからのレスポンスの解析に失敗しました。');
        return;
      }
      
      // レスポンスデータの検証
      if (!data || !data.accessToken || !data.user) {
        setError('ログインに失敗しました。レスポンスデータが不正です。');
        return;
      }
      
      // クッキーはバックエンドでHttpOnlyとして設定されるため、
      // クライアント側での設定は不要（セキュリティ強化）
      // リダイレクト前に少し待機してクッキーが確実に設定されるようにする
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      // ページをリロードしてmiddlewareがクッキーを認識できるようにする
      router.refresh();
      router.push('/dashboard');
    } catch (err) {
      // ネットワークエラーなどの場合
      console.error('Login error:', err);
      
      if (err instanceof Error) {
        // エラーメッセージに基づいて適切なメッセージを表示
        const errorMessage = err.message;
        
        if (
          errorMessage.includes('Failed to fetch') ||
          errorMessage.includes('NetworkError') ||
          errorMessage.includes('ネットワークエラー') ||
          errorMessage.includes('CORS')
        ) {
          setError(
            'バックエンドサーバーに接続できません。サーバーが起動しているか確認してください。',
          );
        } else {
          setError(errorMessage);
        }
      } else {
        setError('ログインに失敗しました。しばらくしてから再度お試しください。');
      }
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

