/**
 * 設定ページ
 * アプリケーションの各種設定を管理する
 */
export default function SettingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* ページタイトル */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8">設定</h1>

        {/* メインコンテンツ */}
        <main className="space-y-6">
          {/* 設定カード（サンプル） */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg px-6 py-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              アカウント設定
            </h2>
            <p className="text-gray-600">
              アカウント設定の機能は今後実装予定です。
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg px-6 py-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              通知設定
            </h2>
            <p className="text-gray-600">通知設定の機能は今後実装予定です。</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg px-6 py-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              プライバシー設定
            </h2>
            <p className="text-gray-600">
              プライバシー設定の機能は今後実装予定です。
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
