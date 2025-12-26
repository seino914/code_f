'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * カスタム404ページ
 * 未ログインの場合は自動的にログインページにリダイレクト
 * ログイン済みの場合のみ404メッセージを表示
 */
export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // クッキーから認証トークンを確認
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('auth-token='))
      ?.split('=')[1];

    // 未ログインの場合はログインページにリダイレクト
    if (!token) {
      router.replace('/');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            ページが見つかりません
          </h2>
          <p className="text-gray-600">
            お探しのページは存在しないか、移動された可能性があります。
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="rounded-lg bg-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 hover:bg-sky-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
          >
            前のページに戻る
          </button>
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
          >
            ダッシュボードに戻る
          </button>
        </div>
      </div>
    </div>
  );
}

