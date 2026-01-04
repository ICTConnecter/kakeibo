'use client';

import { useContext, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { UserAuthComponent, UserAuthContext } from '@/components/context/user';
import { LiffContext } from '@/components/context/liff';
import Link from 'next/link';

export default function InvitePage() {
    const searchParams = useSearchParams();
    const householdId = searchParams.get('householdId');
    const { userInfo, idToken } = useContext(UserAuthContext);
    const { liffObject } = useContext(LiffContext);

    const [householdName, setHouseholdName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [alreadyMember, setAlreadyMember] = useState(false);

    // 招待情報を取得
    useEffect(() => {
        const fetchInviteInfo = async () => {
            if (!householdId || !idToken) return;

            try {
                const res = await fetch(`/api/invite?householdId=${householdId}`, {
                    headers: {
                        'Authorization': `Bearer:${idToken}`,
                        'Content-Type': 'application/json',
                    },
                });

                const data = await res.json();

                if (res.ok && data.success) {
                    setHouseholdName(data.data.householdName);
                    setAlreadyMember(data.data.alreadyMember || false);
                } else {
                    setError(data.error || '招待情報の取得に失敗しました');
                }
            } catch (err) {
                console.error('招待情報取得エラー:', err);
                setError('招待情報の取得に失敗しました');
            } finally {
                setLoading(false);
            }
        };

        fetchInviteInfo();
    }, [householdId, idToken]);

    // 家計簿に参加
    const handleJoin = async () => {
        if (!householdId || !idToken) return;

        setJoining(true);
        setError(null);

        try {
            const res = await fetch('/api/invite', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer:${idToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ householdId }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setSuccess(true);
            } else {
                setError(data.error || '参加に失敗しました');
            }
        } catch (err) {
            console.error('参加エラー:', err);
            setError('参加に失敗しました');
        } finally {
            setJoining(false);
        }
    };

    // LIFF閉じる
    const handleClose = () => {
        if (liffObject?.closeWindow) {
            liffObject.closeWindow();
        }
    };

    if (!householdId) {
        return (
            <UserAuthComponent>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow p-6 max-w-md w-full text-center">
                        <div className="text-6xl mb-4">?</div>
                        <h1 className="text-xl font-bold text-gray-800 mb-2">無効な招待リンク</h1>
                        <p className="text-gray-600 mb-4">
                            招待リンクが正しくありません。
                        </p>
                        <Link
                            href="/home"
                            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            ホームへ戻る
                        </Link>
                    </div>
                </div>
            </UserAuthComponent>
        );
    }

    return (
        <UserAuthComponent>
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow p-6 max-w-md w-full">
                    {/* ローディング */}
                    {loading && (
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            <p className="mt-4 text-gray-600">招待情報を確認中...</p>
                        </div>
                    )}

                    {/* エラー */}
                    {!loading && error && !success && (
                        <div className="text-center">
                            <div className="text-6xl mb-4">!</div>
                            <h1 className="text-xl font-bold text-red-600 mb-2">エラー</h1>
                            <p className="text-gray-600 mb-4">{error}</p>
                            <Link
                                href="/home"
                                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                ホームへ戻る
                            </Link>
                        </div>
                    )}

                    {/* 既にメンバー */}
                    {!loading && !error && alreadyMember && !success && (
                        <div className="text-center">
                            <div className="text-6xl mb-4">!</div>
                            <h1 className="text-xl font-bold text-gray-800 mb-2">既に参加しています</h1>
                            <p className="text-gray-600 mb-2">
                                あなたは既に
                            </p>
                            <p className="text-2xl font-bold text-blue-600 mb-4">
                                {householdName}
                            </p>
                            <p className="text-gray-600 mb-6">
                                のメンバーです。
                            </p>
                            <Link
                                href="/home"
                                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                ホームへ戻る
                            </Link>
                        </div>
                    )}

                    {/* 招待確認 */}
                    {!loading && !error && !alreadyMember && !success && (
                        <div className="text-center">
                            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                            </div>
                            <h1 className="text-xl font-bold text-gray-800 mb-2">家計簿への招待</h1>
                            <p className="text-gray-600 mb-2">
                                以下の家計簿に招待されています
                            </p>
                            <p className="text-2xl font-bold text-blue-600 mb-6">
                                {householdName}
                            </p>
                            <button
                                onClick={handleJoin}
                                disabled={joining}
                                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {joining ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        参加中...
                                    </span>
                                ) : (
                                    '参加する'
                                )}
                            </button>
                            <button
                                onClick={handleClose}
                                className="w-full mt-3 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                            >
                                キャンセル
                            </button>
                        </div>
                    )}

                    {/* 成功 */}
                    {success && (
                        <div className="text-center">
                            <div className="text-6xl mb-4">!</div>
                            <h1 className="text-xl font-bold text-green-600 mb-2">参加しました</h1>
                            <p className="text-gray-600 mb-2">
                                家計簿
                            </p>
                            <p className="text-2xl font-bold text-blue-600 mb-4">
                                {householdName}
                            </p>
                            <p className="text-gray-600 mb-6">
                                に参加しました。
                            </p>
                            <Link
                                href="/home"
                                className="inline-block w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                            >
                                ホームへ移動
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </UserAuthComponent>
    );
}
