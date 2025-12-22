'use client';

import { useRouter } from 'next/navigation';

/**
 * ダッシュボードヘッダーコンポーネント
 * ログアウト機能を含む
 */
export function DashboardHeader() {
  const router = useRouter();

  /**
   * ログアウト処理
   * 認証トークンを削除してログインページにリダイレクト
   */
  const handleLogout = () => {
    // クッキーから認証トークンを削除
    document.cookie =
      'auth-token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';

    // ログインページにリダイレクト
    router.push('/');
  };

  return (
    <header className="mb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
        >
          ログアウト
        </button>
      </div>
    </header>
  );
}

