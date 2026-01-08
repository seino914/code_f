'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * ユーザー情報の型定義
 */
interface UserInfo {
  id: string;
  name: string;
  email: string;
  company: string;
}

/**
 * プロフィールページ
 * ユーザー情報を表示・編集する
 */
export default function ProfilePage() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchUserInfo = async () => {
      setIsLoading(true);
      setError(undefined);

      try {
        const response = await fetch('http://localhost:3001/users/user', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login');
            return;
          }
          setError('ユーザー情報の取得に失敗しました。');
          return;
        }

        const data = await response.json();
        setUserInfo(data);
      } catch (err) {
        console.error('Fetch user info error:', err);
        setError('ユーザー情報の取得に失敗しました。');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* ページタイトル */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8">ユーザー情報</h1>

        {/* メインコンテンツ */}
        <main className="space-y-6">
          {/* ローディング状態 */}
          {isLoading && (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-lg px-6 py-8">
              <p className="text-gray-600">読み込み中...</p>
            </div>
          )}

          {/* エラー状態 */}
          {error && !isLoading && (
            <div className="bg-white border border-red-200 rounded-2xl shadow-lg px-6 py-8">
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {error}
              </div>
            </div>
          )}

          {/* ユーザー情報カード */}
          {userInfo && !isLoading && (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-lg px-6 py-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  基本情報
                </h2>
                <a
                  href="/profile/edit"
                  className="text-sm font-medium text-sky-600 hover:text-sky-700"
                >
                  編集
                </a>
              </div>
              <dl className="space-y-4">
                {/* 名前 */}
                <div>
                  <dt className="text-sm font-medium text-gray-600 mb-1">
                    名前
                  </dt>
                  <dd className="text-base text-gray-900">{userInfo.name}</dd>
                </div>

                {/* 会社名 */}
                <div>
                  <dt className="text-sm font-medium text-gray-600 mb-1">
                    会社名
                  </dt>
                  <dd className="text-base text-gray-900">
                    {userInfo.company}
                  </dd>
                </div>

                {/* メールアドレス */}
                <div>
                  <dt className="text-sm font-medium text-gray-600 mb-1">
                    メールアドレス
                  </dt>
                  <dd className="text-base text-gray-900">{userInfo.email}</dd>
                </div>
              </dl>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

