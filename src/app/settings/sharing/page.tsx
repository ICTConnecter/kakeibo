'use client';

import { useContext, useState, useMemo } from 'react';
import { UserAuthComponent, UserAuthContext } from '@/components/context/user';
import { HouseholdContext } from '@/components/context/household';
import { LiffContext } from '@/components/context/liff';
import Link from 'next/link';
import { Household } from '@/types/firestore/Household';

export default function SharingPage() {
    const { household, loading, error, setHouseholdId } = useContext(HouseholdContext);
    const { userInfo } = useContext(UserAuthContext);
    const { liffObject } = useContext(LiffContext);
    const [inviteLoading, setInviteLoading] = useState(false);
    const [inviteError, setInviteError] = useState<string | null>(null);
    const [inviteSuccess, setInviteSuccess] = useState(false);

    // オーナー権限を持つ家計簿のみフィルタリング
    const ownedHouseholds = useMemo(() => {
        if (!userInfo?.households) return [];
        return userInfo.households.filter((h: Household) => h.ownerId === userInfo.userId);
    }, [userInfo]);

    // 現在選択中の家計簿がオーナー権限かどうか
    const isOwner = useMemo(() => {
        if (!household || !userInfo) return false;
        return household.ownerId === userInfo.userId;
    }, [household, userInfo]);

    // ロールの日本語表示
    const getRoleLabel = (role: 'owner' | 'editor' | 'viewer') => {
        switch (role) {
            case 'owner':
                return 'オーナー';
            case 'editor':
                return '編集者';
            case 'viewer':
                return '閲覧者';
            default:
                return role;
        }
    };

    // ロールの色
    const getRoleColor = (role: 'owner' | 'editor' | 'viewer') => {
        switch (role) {
            case 'owner':
                return 'bg-purple-100 text-purple-700';
            case 'editor':
                return 'bg-blue-100 text-blue-700';
            case 'viewer':
                return 'bg-gray-100 text-gray-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    // LINE招待メッセージを送信
    const handleInvite = async () => {
        if (!liffObject || !household) return;

        // shareTargetPickerが利用可能か確認
        if (!liffObject.isApiAvailable('shareTargetPicker')) {
            setInviteError('この端末ではLINE招待機能を利用できません');
            return;
        }

        setInviteLoading(true);
        setInviteError(null);
        setInviteSuccess(false);

        try {
            // 招待用URLを生成（LIFF URL形式）
            const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
            const inviteUrl = liffId
                ? `https://liff.line.me/${liffId}/invite?householdId=${household.householdId}`
                : `${window.location.origin}/invite?householdId=${household.householdId}`;

            // LINEの友達選択画面を表示してメッセージを送信
            const result = await liffObject.shareTargetPicker([
                {
                    type: 'flex',
                    altText: `${userInfo?.displayName || 'ユーザー'}さんから「${household.name}」への招待が届きました`,
                    contents: {
                        type: 'bubble',
                        hero: {
                            type: 'box',
                            layout: 'vertical',
                            contents: [
                                {
                                    type: 'text',
                                    text: '家計簿への招待',
                                    weight: 'bold',
                                    size: 'xl',
                                    color: '#ffffff',
                                    align: 'center',
                                },
                            ],
                            backgroundColor: '#4F46E5',
                            paddingAll: '20px',
                        },
                        body: {
                            type: 'box',
                            layout: 'vertical',
                            contents: [
                                {
                                    type: 'text',
                                    text: `${userInfo?.displayName || 'ユーザー'}さんから`,
                                    size: 'sm',
                                    color: '#666666',
                                    align: 'center',
                                },
                                {
                                    type: 'text',
                                    text: `「${household.name}」`,
                                    weight: 'bold',
                                    size: 'lg',
                                    align: 'center',
                                    margin: 'md',
                                },
                                {
                                    type: 'text',
                                    text: 'への招待が届きました',
                                    size: 'sm',
                                    color: '#666666',
                                    align: 'center',
                                    margin: 'sm',
                                },
                                {
                                    type: 'separator',
                                    margin: 'lg',
                                },
                                {
                                    type: 'text',
                                    text: '下のボタンをタップして参加できます',
                                    size: 'xs',
                                    color: '#999999',
                                    align: 'center',
                                    margin: 'lg',
                                    wrap: true,
                                },
                            ],
                            paddingAll: '20px',
                        },
                        footer: {
                            type: 'box',
                            layout: 'vertical',
                            contents: [
                                {
                                    type: 'button',
                                    action: {
                                        type: 'uri',
                                        label: '招待を確認する',
                                        uri: inviteUrl,
                                    },
                                    style: 'primary',
                                    color: '#4F46E5',
                                },
                            ],
                            paddingAll: '12px',
                        },
                    },
                },
            ]);

            if (result) {
                setInviteSuccess(true);
                setTimeout(() => setInviteSuccess(false), 3000);
            }
        } catch (err) {
            console.error('招待の送信に失敗しました:', err);
            setInviteError('招待の送信に失敗しました');
        } finally {
            setInviteLoading(false);
        }
    };

    return (
        <UserAuthComponent>
            <div className="min-h-screen bg-gray-50 pb-20">
                {/* ヘッダー */}
                <header className="bg-white shadow-sm p-4 flex items-center">
                    <Link href="/settings" className="mr-4">
                        <span className="text-2xl">←</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-800">共有設定</h1>
                </header>

                <main className="max-w-7xl mx-auto p-4 space-y-4">
                    {/* 家計簿選択プルダウン */}
                    {ownedHouseholds.length > 0 && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold mb-3">家計簿を選択</h2>
                            <select
                                value={household?.householdId || ''}
                                onChange={(e) => setHouseholdId(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="" disabled>家計簿を選択してください</option>
                                {ownedHouseholds.map((h: Household) => (
                                    <option key={h.householdId} value={h.householdId}>
                                        {h.name}
                                    </option>
                                ))}
                            </select>
                            {!isOwner && household && (
                                <p className="mt-2 text-sm text-amber-600">
                                    ※ この家計簿のオーナーではないため、招待機能は使用できません
                                </p>
                            )}
                        </div>
                    )}

                    {/* 招待エラー表示 */}
                    {inviteError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {inviteError}
                        </div>
                    )}

                    {/* 招待成功表示 */}
                    {inviteSuccess && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                            招待メッセージを送信しました
                        </div>
                    )}

                    {/* エラー表示 */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    {/* ローディング */}
                    {loading && (
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="mt-2 text-gray-600">読み込み中...</p>
                        </div>
                    )}

                    {/* 家計簿情報 */}
                    {!loading && household && (
                        <>
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-lg font-semibold mb-2">家計簿名</h2>
                                <p className="text-2xl font-bold text-blue-600">{household.name}</p>
                                {isOwner && (
                                    <span className="inline-block mt-2 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                                        オーナー
                                    </span>
                                )}
                            </div>

                            {/* メンバー一覧 */}
                            <div className="bg-white rounded-lg shadow overflow-hidden">
                                <div className="px-6 py-4 border-b flex items-center justify-between">
                                    <h2 className="font-semibold">メンバー一覧</h2>
                                    <span className="text-sm text-gray-500">
                                        {household.members.length} 人
                                    </span>
                                </div>
                                <div className="divide-y">
                                    {household.members.length === 0 ? (
                                        <div className="px-6 py-8 text-center text-gray-500">
                                            メンバーがいません
                                        </div>
                                    ) : (
                                        household.members.map((member) => (
                                            <div
                                                key={member.userId}
                                                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50"
                                            >
                                                <div className="flex items-center gap-3">
                                                    {/* アバター（仮） */}
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                                                        {member.userId.slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">ユーザーID: {member.userId}</p>
                                                        <p className="text-sm text-gray-500">
                                                            参加日: {new Date(member.joinedAt).toLocaleDateString('ja-JP')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-3 py-1 text-sm rounded-full ${getRoleColor(member.role)}`}>
                                                        {getRoleLabel(member.role)}
                                                    </span>
                                                    {member.role !== 'owner' && (
                                                        <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">
                                                            •••
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* 説明 */}
                            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
                                <p className="text-sm">
                                    <strong>権限について:</strong><br />
                                    • オーナー: すべての操作が可能<br />
                                    • 編集者: 収支の追加・編集・削除が可能<br />
                                    • 閲覧者: 収支の閲覧のみ可能
                                </p>
                            </div>
                        </>
                    )}

                    {/* メンバー招待ボタン（オーナーのみ表示） */}
                    {isOwner && household && (
                        <button
                            onClick={handleInvite}
                            disabled={inviteLoading}
                            className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {inviteLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    <span>送信中...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.348 0-.63-.285-.63-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.193 0-.378-.09-.497-.254l-1.74-2.409v2.036c0 .345-.282.63-.63.63-.345 0-.627-.285-.627-.63V8.108c0-.27.174-.51.432-.596.064-.021.133-.031.199-.031.193 0 .378.09.497.254l1.74 2.409V8.108c0-.345.282-.63.63-.63.346 0 .627.285.627.63v4.771zm-5.741 0c0 .345-.282.63-.63.63-.345 0-.627-.285-.627-.63V8.108c0-.345.282-.63.627-.63.348 0 .63.285.63.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                                    </svg>
                                    <span>LINEでメンバーを招待</span>
                                </>
                            )}
                        </button>
                    )}
                </main>

                {/* ナビゲーションバー */}
                <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
                    <div className="flex justify-around items-center h-16">
                        <Link href="/home" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
                            <span className="text-2xl">🏠</span>
                            <span className="text-xs">ホーム</span>
                        </Link>
                        <Link href="/transactions" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
                            <span className="text-2xl">📋</span>
                            <span className="text-xs">取引</span>
                        </Link>
                        <Link href="/reports" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
                            <span className="text-2xl">📊</span>
                            <span className="text-xs">レポート</span>
                        </Link>
                        <Link href="/settings" className="flex flex-col items-center text-blue-600">
                            <span className="text-2xl">⚙️</span>
                            <span className="text-xs">設定</span>
                        </Link>
                    </div>
                </nav>
            </div>
        </UserAuthComponent>
    );
}
