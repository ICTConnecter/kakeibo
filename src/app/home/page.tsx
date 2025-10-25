'use client';

import { use, useState, useEffect } from 'react';
import { LiffContext } from '@/components/context/liff';
import { UserAuthComponent } from '@/components/context/user';
import Link from 'next/link';

export default function HomePage() {
    const { decodeResult } = use(LiffContext);
    const [summary, setSummary] = useState({
        income: 0,
        expense: 0,
        balance: 0,
    });
    const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // TODO: 実際のAPIからデータを取得
        // 現在は仮データ
        setSummary({
            income: 250000,
            expense: 180000,
            balance: 70000,
        });
        
        setRecentTransactions([
            { id: '1', type: 'expense', name: 'スーパー', amount: 3580, date: new Date() },
            { id: '2', type: 'income', name: '給与', amount: 250000, date: new Date() },
            { id: '3', type: 'expense', name: 'レストラン', amount: 4500, date: new Date() },
        ]);
        
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>読み込み中...</p>
            </div>
        );
    }

    return (
        <UserAuthComponent>
            <div className="min-h-screen bg-gray-50 pb-20">
                {/* ヘッダー */}
                <header className="bg-white shadow-sm p-4">
                    <div className="flex items-center justify-between max-w-7xl mx-auto">
                        <h1 className="text-2xl font-bold text-gray-800">AI家計簿</h1>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">{decodeResult?.name}</span>
                            {decodeResult?.picture && (
                                <img
                                    src={decodeResult.picture}
                                    alt="プロフィール"
                                    className="w-8 h-8 rounded-full"
                                />
                            )}
                        </div>
                    </div>
                </header>

                {/* メインコンテンツ */}
                <main className="max-w-7xl mx-auto p-4 space-y-6">
                    {/* 収支サマリー */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold mb-4">今月の収支</h2>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">収入</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    ¥{summary.income.toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">支出</p>
                                <p className="text-2xl font-bold text-red-600">
                                    ¥{summary.expense.toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">収支</p>
                                <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    ¥{summary.balance.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 最近の取引 */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">最近の取引</h2>
                            <Link href="/transactions" className="text-blue-600 text-sm hover:underline">
                                すべて表示
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {recentTransactions.map((transaction) => (
                                <div
                                    key={transaction.id}
                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                            transaction.type === 'income' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'
                                        }`}>
                                            {transaction.type === 'income' ? '💰' : '💳'}
                                        </div>
                                        <div>
                                            <p className="font-medium">{transaction.name}</p>
                                            <p className="text-sm text-gray-500">
                                                {transaction.date.toLocaleDateString('ja-JP')}
                                            </p>
                                        </div>
                                    </div>
                                    <p className={`font-bold ${
                                        transaction.type === 'income' ? 'text-blue-600' : 'text-red-600'
                                    }`}>
                                        {transaction.type === 'income' ? '+' : '-'}¥{transaction.amount.toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>

                {/* FABボタン */}
                <div className="fixed bottom-20 right-4 flex flex-col gap-2">
                    <Link
                        href="/data/new"
                        className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition"
                        title="収入追加"
                    >
                        <span className="text-2xl">+💰</span>
                    </Link>
                    <Link
                        href="/receipt/camera"
                        className="w-16 h-16 bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-green-700 transition"
                        title="レシート撮影"
                    >
                        <span className="text-3xl">📷</span>
                    </Link>
                </div>

                {/* ナビゲーションバー */}
                <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
                    <div className="flex justify-around items-center h-16">
                        <Link href="/home" className="flex flex-col items-center text-blue-600">
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
                        <Link href="/settings" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
                            <span className="text-2xl">⚙️</span>
                            <span className="text-xs">設定</span>
                        </Link>
                    </div>
                </nav>
            </div>
        </UserAuthComponent>
    );
}

