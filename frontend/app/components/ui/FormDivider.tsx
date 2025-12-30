interface FormDividerProps {
  text?: string;
}

/**
 * フォーム区切り線コンポーネント
 * 「または」などのテキストを中央に配置した区切り線
 */
export function FormDivider({ text = 'または' }: FormDividerProps) {
  return (
    <div className="flex items-center gap-3 text-xs text-gray-500">
      <div className="h-px flex-1 bg-gray-300" />
      <span>{text}</span>
      <div className="h-px flex-1 bg-gray-300" />
    </div>
  );
}

