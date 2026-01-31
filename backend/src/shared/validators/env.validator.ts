/**
 * 環境変数の起動時検証
 * 必須環境変数が設定されているかチェック
 */
export function validateEnvironmentVariables() {
  const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];

  const missingVars: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }

  if (missingVars.length > 0) {
    throw new Error(
      `以下の必須環境変数が設定されていません: ${missingVars.join(', ')}\n` +
        'backend/.envファイルに設定してください。'
    );
  }
}
