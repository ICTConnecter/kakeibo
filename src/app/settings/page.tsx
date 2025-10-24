'use client';

import { use } from 'react';
import { UserAuthComponent } from '@/components/context/user';
import { LiffContext } from '@/components/context/liff';
import Link from 'next/link';

export default function SettingsPage() {
    const { decodeResult, liff } = use(LiffContext);

    const handleLogout = () => {
        if (liff?.isLoggedIn()) {
            liff.logout();
            window.location.href = '/';
        }
    };

    return (
        <UserAuthComponent>
            <div className="min-h-screen bg-gray-50 pb-20">
                {/* ヘッダー */}
                <header className="bg-white shadow-sm p-4">
                    <h1 className="text-2xl font-bold text-gray-800 text-center">設定</h1>
                </header>

                <main className="max-w-7xl mx-auto p-4 space-y-6">
                    {/* プロフィール */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center gap-4">
                            <img
                                src={decodeResult?.picture || ''}
                                alt="プロフィール"
                                className="w-16 h-16 rounded-full"
                            />
                            <div>
                                <p className="font-semibold text-lg">{decodeResult?.name}</p>
                                <p className="text-sm text-gray-500">{decodeResult?.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* マスタデータ管理 */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <h2 className="px-6 py-4 font-semibold border-b">マスタデータ管理</h2>
                        <div className="divide-y">
                            <Link
                                href="/settings/categories"
                                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">🏷️</span>
                                    <span>カテゴリ管理</span>
                                </div>
                                <span className="text-gray-400">→</span>
                            </Link>
                            <Link
                                href="/settings/wallets"
                                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">💳</span>
                                    <span>ウォレット管理</span>
                                </div>
                                <span className="text-gray-400">→</span>
                            </Link>
                            <Link
                                href="/settings/expense-types"
                                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">💼</span>
                                    <span>経費タイプ管理</span>
                                </div>
                                <span className="text-gray-400">→</span>
                            </Link>
                        </div>
                    </div>

                    {/* 共有設定 */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <h2 className="px-6 py-4 font-semibold border-b">家計簿の共有</h2>
                        <Link
                            href="/settings/sharing"
                            className="flex items-center justify-between px-6 py-4 hover:bg-gray-50"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">👥</span>
                                <span>共有設定</span>
                            </div>
                            <span className="text-gray-400">→</span>
                        </Link>
                    </div>

                    {/* その他 */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <h2 className="px-6 py-4 font-semibold border-b">その他</h2>
                        <div className="divide-y">
                            <button className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">ℹ️</span>
                                    <span>アプリについて</span>
                                </div>
                                <span className="text-gray-400">→</span>
                            </button>
                            <button className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">📄</span>
                                    <span>利用規約</span>
                                </div>
                                <span className="text-gray-400">→</span>
                            </button>
                            <button className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">🔒</span>
                                    <span>プライバシーポリシー</span>
                                </div>
                                <span className="text-gray-400">→</span>
                            </button>
                        </div>
                    </div>

                    {/* ログアウト */}
                    <button
                        onClick={handleLogout}
                        className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                    >
                        ログアウト
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

