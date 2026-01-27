/**
 * APIエラー
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly errors?: string[],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * APIクライアント設定
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * APIクライアント
 * バックエンドAPIとの通信を担当
 */
export class ApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * GETリクエスト
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
    });
  }

  /**
   * POSTリクエスト
   */
  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PATCHリクエスト
   */
  async patch<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * DELETEリクエスト
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  /**
   * 共通リクエスト処理
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit,
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      // レスポンスが空の場合
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return {} as T;
      }

      return response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      // ネットワークエラー
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new ApiError(
          'バックエンドサーバーに接続できません。サーバーが起動しているか確認してください。',
          0,
        );
      }

      throw new ApiError(
        error instanceof Error ? error.message : '予期しないエラーが発生しました',
        0,
      );
    }
  }

  /**
   * エラーレスポンスを処理
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    let errorData: { message?: string | string[]; error?: string } = {};

    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        errorData = await response.json();
      }
    } catch {
      // JSONパースに失敗した場合は無視
    }

    // ステータスコードに応じたエラーメッセージ
    switch (response.status) {
      case 400: {
        const message = Array.isArray(errorData.message)
          ? errorData.message.join('、')
          : errorData.message || '入力内容に誤りがあります。';
        throw new ApiError(message, 400);
      }
      case 401:
        throw new ApiError(
          typeof errorData.message === 'string'
            ? errorData.message
            : 'メールアドレスまたはパスワードが正しくありません。',
          401,
        );
      case 403:
        throw new ApiError(
          typeof errorData.message === 'string'
            ? errorData.message
            : 'アクセスが拒否されました。',
          403,
        );
      case 409:
        throw new ApiError(
          typeof errorData.message === 'string'
            ? errorData.message
            : 'このメールアドレスは既に登録されています。',
          409,
        );
      case 429:
        throw new ApiError(
          'リクエストが多すぎます。しばらく時間をおいてから再度お試しください。',
          429,
        );
      default:
        throw new ApiError(
          typeof errorData.message === 'string'
            ? errorData.message
            : `サーバーエラーが発生しました（ステータス: ${response.status}）`,
          response.status,
        );
    }
  }
}

/**
 * デフォルトのAPIクライアントインスタンス
 */
export const apiClient = new ApiClient();
