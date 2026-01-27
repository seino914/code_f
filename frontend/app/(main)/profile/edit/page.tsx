'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { NameInput, CompanyInput, EmailInput } from '../../../components/inputForms';
import { updateUserSchema } from '../../../lib/validations/profile/update-user.schema';
import { container } from '../../../infrastructure/di/container';
import type { User } from '../../../domain/entities/user.entity';

/**
 * プロフィール編集ページ
 * ユーザー情報を編集する
 * クリーンアーキテクチャに基づき、ユースケースを使用
 */
export default function ProfileEditPage() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<User | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  // フォームの状態
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState<string | undefined>();

  useEffect(() => {
    const fetchUserInfo = async () => {
      setIsLoading(true);
      setError(undefined);

      try {
        // ユースケースを使用してユーザー情報を取得
        const result = await container.getUserUseCase.execute();

        if (!result.success) {
          // 認証エラーの場合はログインページにリダイレクト
          if (result.error.includes('認証') || result.error.includes('401')) {
            router.push('/login');
            return;
          }
          setError(result.error);
          return;
        }

        setUserInfo(result.data);
        setName(result.data.name);
        setCompany(result.data.company);
        setEmail(result.data.email);
      } catch (err) {
        console.error('Fetch user info error:', err);
        setError('ユーザー情報の取得に失敗しました。');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, [router]);

  /**
   * 更新処理
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(undefined);
    setError(undefined);

    // Zodスキーマでフォーム全体をバリデーション
    const validationResult = updateUserSchema.safeParse({
      name,
      company,
      email,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      setFormError(firstError?.message);
      return;
    }

    setIsSaving(true);

    try {
      // ユースケースを使用してユーザー情報を更新
      const result = await container.updateUserUseCase.execute({
        name: validationResult.data.name,
        company: validationResult.data.company,
        email: validationResult.data.email,
      });

      if (!result.success) {
        // 認証エラーの場合はログインページにリダイレクト
        if (result.error.includes('認証') || result.error.includes('401')) {
          router.push('/login');
          return;
        }
        setError(result.error);
        return;
      }

      toast.success('更新が完了しました', {
        description: 'ユーザー情報を更新しました。',
      });

      // プロフィールページにリダイレクト
      router.push('/profile');
    } catch (err) {
      console.error('Update user error:', err);
      setError('ユーザー情報の更新に失敗しました。');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            ユーザー情報編集
          </h1>
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg px-6 py-8">
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !userInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            ユーザー情報編集
          </h1>
          <div className="bg-white border border-red-200 rounded-2xl shadow-lg px-6 py-8">
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          ユーザー情報編集
        </h1>

        <main className="space-y-6">
          {(error || formError) && (
            <div className="bg-white border border-red-200 rounded-2xl shadow-lg px-6 py-8">
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {error || formError}
              </div>
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg px-6 py-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <NameInput
                value={name}
                onChange={setName}
                onValidationChange={() => {}}
              />

              <CompanyInput
                value={company}
                onChange={setCompany}
                onValidationChange={() => {}}
              />

              <EmailInput
                value={email}
                onChange={setEmail}
                onValidationChange={() => {}}
              />

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition-colors hover:bg-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSaving ? '更新中...' : '更新する'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/profile')}
                  disabled={isSaving}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
