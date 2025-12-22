'use client';

interface GoogleLoginButtonProps {
  onClick: () => void;
}

/**
 * Google ログインボタンコンポーネント
 */
export function GoogleLoginButton({ onClick }: GoogleLoginButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-[4px] border border-gray-200 bg-white shadow-sm">
        <span className="text-[10px] font-bold text-sky-600">G</span>
      </span>
      <span>Google アカウントで続行</span>
    </button>
  );
}

