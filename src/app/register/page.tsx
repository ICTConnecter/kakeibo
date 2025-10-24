'use client';

import { use, useState } from 'react';
import { LiffContext } from '@/components/context/liff';
import { DisplayLiffInfo } from '@/components/displayLiffInfo';
import { RegisterResponse } from '../api/register/types';

const Register = () => {
    const liffInfo = use(LiffContext);
    const { decodeResult } = liffInfo;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRegister = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer:' + liffInfo.idToken,
                    'Content-Type': 'application/json',
                },
            });

            const result: RegisterResponse = await response.json();

            if (result.success) {
                console.log('登録成功');
                alert('アカウント登録が完了しました！\n家計簿の記録を始めましょう。');
                window.location.href = '/home';
            } else {
                setError(result.error || '登録に失敗しました');
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError('エラーが発生しました。もう一度お試しください。');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
                {/* アプリロゴ・タイトル */}
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4">💰</div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        AI家計簿
                    </h1>
                    <p className="text-gray-600">アカウント登録</p>
                </div>

                {/* プロフィール情報 */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <p className="text-sm text-gray-600 mb-4">
                        以下の情報でアカウントを作成します
                    </p>
                    
                    <div className="flex items-center gap-4 mb-4">
                        {decodeResult?.picture && (
                            <img
                                src={decodeResult.picture}
                                alt="プロフィール"
                                className="w-16 h-16 rounded-full"
                            />
                        )}
                        <div>
                            <p className="font-semibold text-lg">
                                {decodeResult?.name || '名前未設定'}
                            </p>
                            <p className="text-sm text-gray-600">
                                {decodeResult?.email || 'メールアドレス未設定'}
                            </p>
                        </div>
                    </div>

                    {/* LIFF情報（デバッグ用） */}
                    <details className="mt-4">
                        <summary className="text-xs text-gray-500 cursor-pointer">
                            詳細情報を表示
                        </summary>
                        <div className="mt-2 text-xs">
                            <DisplayLiffInfo />
                        </div>
                    </details>
                </div>

                {/* 登録内容の説明 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-blue-900 mb-2">
                        登録すると自動で作成されるもの
                    </h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>✓ あなた専用の家計簿</li>
                        <li>✓ デフォルトカテゴリ（食費、交通費など）</li>
                        <li>✓ デフォルトウォレット（現金、カードなど）</li>
                        <li>✓ デフォルト経費タイプ</li>
                    </ul>
                </div>

                {/* エラーメッセージ */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {/* 登録ボタン */}
                <button
                    onClick={handleRegister}
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? '登録中...' : '✓ アカウント登録'}
                </button>

                {/* 注意事項 */}
                <p className="text-xs text-gray-500 text-center mt-6">
                    登録することで、利用規約とプライバシーポリシーに同意したものとみなされます。
                </p>
            </div>
        </div>
    );
};

export default Register;