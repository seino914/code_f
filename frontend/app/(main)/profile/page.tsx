/**
 * プロフィールページ
 * ユーザー情報を表示・編集する
 */
export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* ページタイトル */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8">ユーザー情報</h1>

        {/* メインコンテンツ */}
        <main className="space-y-6">
          {/* ユーザー情報カード（サンプル） */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg px-6 py-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              基本情報
            </h2>
            <p className="text-gray-600">
              ユーザー情報の表示・編集機能は今後実装予定です。
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

