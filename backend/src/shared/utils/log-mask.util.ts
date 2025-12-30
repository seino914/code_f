/**
 * ログの機密情報マスキングユーティリティ
 * パスワード、トークンなどの機密情報をログに出力する前にマスク
 */

/**
 * 機密情報を含む可能性のあるフィールド名のリスト
 */
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'authorization',
  'auth-token',
  'jwt',
  'secret',
  'apiKey',
  'apikey',
  'api_key',
  'privateKey',
  'private_key',
  'creditCard',
  'credit_card',
  'cvv',
  'ssn',
  'socialSecurityNumber',
];

/**
 * 機密情報をマスクする
 * @param value マスクする値
 * @returns マスクされた値（例: "****"）
 */
function maskValue(value: unknown): string {
  if (typeof value !== 'string') {
    return '****';
  }

  if (value.length <= 4) {
    return '****';
  }

  // 最初の2文字と最後の2文字を表示、中間をマスク
  return `${value.substring(0, 2)}${'*'.repeat(Math.min(value.length - 4, 20))}${value.substring(value.length - 2)}`;
}

/**
 * オブジェクト内の機密情報をマスク
 * @param obj マスクするオブジェクト
 * @returns マスクされたオブジェクト
 */
export function maskSensitiveData(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => maskSensitiveData(item));
  }

  const masked: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();

    // 機密情報フィールドかチェック
    const isSensitive = SENSITIVE_FIELDS.some((field) =>
      lowerKey.includes(field.toLowerCase()),
    );

    if (isSensitive && typeof value === 'string') {
      masked[key] = maskValue(value);
    } else if (typeof value === 'object' && value !== null) {
      masked[key] = maskSensitiveData(value);
    } else {
      masked[key] = value;
    }
  }

  return masked;
}

/**
 * リクエストボディから機密情報をマスク
 * @param body リクエストボディ
 * @returns マスクされたリクエストボディ
 */
export function maskRequestBody(body: unknown): unknown {
  return maskSensitiveData(body);
}
