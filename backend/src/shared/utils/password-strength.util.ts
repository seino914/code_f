/**
 * パスワード強度チェックユーティリティ
 * セキュリティ強化のため、パスワードの強度を検証
 */

export interface PasswordStrengthResult {
  isValid: boolean;
  errors: string[];
}

/**
 * パスワード強度をチェック
 * 要件:
 * - 8文字以上
 * - 大文字を含む
 * - 小文字を含む
 * - 数字を含む
 * - 記号を含む（オプション、推奨）
 */
export function checkPasswordStrength(
  password: string,
): PasswordStrengthResult {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('パスワードは8文字以上である必要があります');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('パスワードには大文字を含める必要があります');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('パスワードには小文字を含める必要があります');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('パスワードには数字を含める必要があります');
  }

  // 記号は推奨だが必須ではない（ユーザビリティとのバランス）
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    // 警告のみ（エラーにはしない）
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
