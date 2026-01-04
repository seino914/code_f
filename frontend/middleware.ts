import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * 認証ガード用 Middleware
 * ログインしていないユーザーを保護されたページから遮断する
 * 
 * 動作：
 * - 公開ページ（`/` と `/register`）へのアクセス制御
 * - 未ログインで公開ページ以外にアクセス → ログインページにリダイレクト
 * - ログイン済みで公開ページにアクセス → ダッシュボードにリダイレクト
 * - ログイン済みで他のページにアクセス → そのまま通過（存在しないページは404表示）
 */
export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const { pathname } = request.nextUrl;

  // 公開ページ（ログインページと登録ページ）
  const publicPaths = ['/', '/register'];
  const isPublicPath = publicPaths.includes(pathname);

  // 公開ページへのアクセス
  if (isPublicPath) {
    if (token) {
      // ログイン済みならダッシュボードへ
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // 未ログインならそのまま通過
    return NextResponse.next();
  }

  // 公開ページ以外へのアクセス
  if (!token) {
    // 未ログインの場合：ログインページにリダイレクト
    return NextResponse.redirect(new URL('/', request.url));
  }

  // ログイン済みの場合：そのまま通過
  return NextResponse.next();
}

/**
 * Middleware を適用するパスを指定
 * 
 * 対象：
 * - `/` : ログインページ（ログイン済みならダッシュボードへリダイレクト）
 * - `/register` : 登録ページ（ログイン済みならダッシュボードへリダイレクト）
 * - `/dashboard/*` : 保護されたページ（ログイン必須）
 * - その他全てのパス（存在しないパスも含む）: 未ログインならログインページにリダイレクト
 * 
 * 除外：
 * - `/api/*` : APIルート
 * - `/_next/static/*` : 静的ファイル
 * - `/_next/image/*` : 画像最適化ファイル
 * - `favicon.ico` : ファビコン
 * - 画像ファイル (svg, png, jpg, jpeg, gif, webp)
 */
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

