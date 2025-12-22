import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * 認証ガード用 Middleware
 * ログインしていないユーザーを保護されたページから遮断する
 * 
 * 動作：
 * - ログインページ（`/`）以外の全てのパスで認証チェック
 * - 存在しないパス（404になるURL）でも未ログインならログインページにリダイレクト
 * - ログイン済みでログインページにアクセスした場合はダッシュボードにリダイレクト
 */
export function middleware(request: NextRequest) {
  // 認証トークン（仮実装：実際はJWTなどを使用）
  const token = request.cookies.get('auth-token')?.value;

  const { pathname } = request.nextUrl;

  // ログインページ（ルート）へのアクセスは常に許可
  if (pathname === '/') {
    // すでにログイン済みの場合はダッシュボードにリダイレクト
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // それ以外の全てのページ（存在しないパスも含む）はログインが必要
  if (!token) {
    // ログインしていない場合は404ページではなくログインページにリダイレクト
    return NextResponse.redirect(new URL('/', request.url));
  }

  // ログイン済みの場合は次に進む（存在しないパスは404ページへ）
  return NextResponse.next();
}

/**
 * Middleware を適用するパスを指定
 * 
 * 対象：
 * - `/` : ログインページ（ログイン済みならダッシュボードへリダイレクト）
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

