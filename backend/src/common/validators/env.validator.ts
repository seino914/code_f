/**
 * 環境変数の起動時検証
 * 必須環境変数が設定されているかチェック
 */
export function validateEnvironmentVariables() {
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
  ];

  const missingVars: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }

  if (missingVars.length > 0) {
    throw new Error(
      `以下の必須環境変数が設定されていません: ${missingVars.join(', ')}\n` +
        'backend/.envファイルに設定してください。',
    );
  }

  // 本番環境では追加の検証
  if (process.env.NODE_ENV === 'production') {
    const productionRequiredVars = ['FRONTEND_URL'];

    for (const envVar of productionRequiredVars) {
      if (!process.env[envVar]) {
        throw new Error(
          `本番環境では以下の環境変数が必須です: ${envVar}\n` +
            'backend/.envファイルに設定してください。',
        );
      }
    }

    // 本番環境ではJWT_SECRETがデフォルト値でないことを確認
    if (process.env.JWT_SECRET === 'your-secret-key-change-in-production') {
      throw new Error(
        '本番環境ではJWT_SECRETをデフォルト値から変更してください。',
      );
    }
  }
}

