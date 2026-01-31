'use client';

import { usePathname } from 'next/navigation';
import { HamburgerMenu } from './HamburgerMenu';

/**
 * 全ページ共通ヘッダーコンポーネント
 * ログインページ以外で認証済みの場合にハンバーガーメニューを表示
 */
export function HeaderMenu() {
  const pathname = usePathname();

  // ログインページの場合は何も表示しない
  if (pathname === '/') {
    return null;
  }

  // ログインページ以外は認証済み（middlewareで保護されているため）
  // ハンバーガーメニューを表示
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-end">
          <HamburgerMenu />
        </div>
      </div>
    </header>
  );
}
