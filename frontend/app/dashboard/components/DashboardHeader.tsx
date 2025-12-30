'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * ダッシュボードヘッダーコンポーネント
 * ログアウト機能を含む
 */
export function DashboardHeader() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  /**
   * ログアウト処理
   * バックエンドAPIを呼び出してクッキーを削除し、ログインページにリダイレクト
   */
  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      // バックエンドのログアウトエンドポイントを呼び出し
      await fetch('http://localhost:3001/auth/logout', {
        method: 'POST',
        credentials: 'include',
      }).catch(() => {
        // エラーが発生してもクライアント側でクッキーを削除
      });

      // クライアント側でもクッキーを削除（フォールバック）
      document.cookie =
        'auth-token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';

      // ログインページにリダイレクト
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      // エラーが発生してもクッキーを削除してリダイレクト
      document.cookie =
        'auth-token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      router.push('/');
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="mb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoggingOut ? 'ログアウト中...' : 'ログアウト'}
        </button>
      </div>
    </header>
  );
}

