'use client';

import { useContext } from 'react';
import { UserAuthComponent } from '@/components/context/user';
import { HouseholdContext } from '@/components/context/household';
import Link from 'next/link';

export default function SharingPage() {
    const { household, loading, error } = useContext(HouseholdContext);

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

                    {/* メンバー招待ボタン */}
                    <button className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2">
                        <span className="text-xl">+</span>
                        <span>メンバーを招待</span>
                    </button>
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
