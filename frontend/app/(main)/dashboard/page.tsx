/**
 * ダッシュボードページ
 * ログイン後に表示される画面
 */
export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* ページタイトル */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          ダッシュボード
        </h1>

        {/* メインコンテンツ */}
        <main className="space-y-6">
          {/* ウェルカムカード */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg px-6 py-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              ようこそ！
            </h2>
            <p className="text-gray-600">
              ログインに成功しました。ここはダッシュボードページです。
            </p>
          </div>

          {/* 統計カード（サンプル） */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl shadow-md px-6 py-5">
              <div className="text-sm font-medium text-gray-600 mb-1">
                総ユーザー数
              </div>
              <div className="text-3xl font-bold text-gray-900">1,234</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-md px-6 py-5">
              <div className="text-sm font-medium text-gray-600 mb-1">
                アクティブセッション
              </div>
              <div className="text-3xl font-bold text-gray-900">89</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-md px-6 py-5">
              <div className="text-sm font-medium text-gray-600 mb-1">
                今月のアクセス
              </div>
              <div className="text-3xl font-bold text-gray-900">12,345</div>
            </div>
          </div>

          {/* 最近のアクティビティ（サンプル） */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg px-6 py-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              最近のアクティビティ
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="h-2 w-2 rounded-full bg-sky-500" />
                <span className="text-gray-700">
                  新しいユーザーが登録しました
                </span>
                <span className="ml-auto text-gray-500">2分前</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-gray-700">データが更新されました</span>
                <span className="ml-auto text-gray-500">15分前</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                <span className="text-gray-700">レポートが生成されました</span>
                <span className="ml-auto text-gray-500">1時間前</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
