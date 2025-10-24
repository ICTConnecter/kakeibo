'use client';

import { useState, useEffect } from 'react';
import { UserAuthComponent } from '@/components/context/user';
import Link from 'next/link';

type TransactionType = 'all' | 'expense' | 'income';

export default function TransactionsPage() {
    const [activeTab, setActiveTab] = useState<TransactionType>('all');
    const [transactions, setTransactions] = useState<any[]>([]);
    const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // TODO: 実際のAPIからデータを取得
        setSummary({
            income: 250000,
            expense: 180000,
            balance: 70000,
        });

        setTransactions([
            { id: '1', type: 'expense', name: 'スーパー', category: '食費', amount: 3580, date: new Date() },
            { id: '2', type: 'income', name: '給与', category: '給与', amount: 250000, date: new Date() },
            { id: '3', type: 'expense', name: 'レストラン', category: '食費', amount: 4500, date: new Date() },
            { id: '4', type: 'expense', name: '電車', category: '交通費', amount: 340, date: new Date() },
            { id: '5', type: 'income', name: '副業', category: '副業', amount: 15000, date: new Date() },
        ]);

        setLoading(false);
    }, []);

    const filteredTransactions = transactions.filter(t => {
        if (activeTab === 'all') return true;
        return t.type === activeTab;
    });

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
                <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
                    <h1 className="text-2xl font-bold text-gray-800 text-center">取引一覧</h1>
                </header>

                <main className="max-w-7xl mx-auto p-4 space-y-4">
                    {/* タブ */}
                    <div className="bg-white rounded-lg shadow p-1 flex gap-1">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`flex-1 py-2 rounded-lg transition ${
                                activeTab === 'all' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            すべて
                        </button>
                        <button
                            onClick={() => setActiveTab('expense')}
                            className={`flex-1 py-2 rounded-lg transition ${
                                activeTab === 'expense' ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            支出
                        </button>
                        <button
                            onClick={() => setActiveTab('income')}
                            className={`flex-1 py-2 rounded-lg transition ${
                                activeTab === 'income' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            収入
                        </button>
                    </div>

                    {/* 収支サマリー */}
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-xs text-gray-600">収入</p>
                                <p className="text-lg font-bold text-blue-600">
                                    ¥{summary.income.toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">支出</p>
                                <p className="text-lg font-bold text-red-600">
                                    ¥{summary.expense.toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">収支</p>
                                <p className={`text-lg font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    ¥{summary.balance.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 取引リスト */}
                    <div className="space-y-2">
                        {filteredTransactions.map((transaction) => (
                            <Link
                                key={transaction.id}
                                href={`/${transaction.type === 'expense' ? 'expenses' : 'incomes'}/${transaction.id}`}
                                className="block bg-white rounded-lg shadow p-4 hover:shadow-md transition"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                            transaction.type === 'income' ? 'bg-blue-100' : 'bg-red-100'
                                        }`}>
                                            <span className="text-xl">
                                                {transaction.type === 'income' ? '💰' : '💳'}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium">{transaction.name}</p>
                                            <p className="text-sm text-gray-500">{transaction.category}</p>
                                            <p className="text-xs text-gray-400">
                                                {transaction.date.toLocaleDateString('ja-JP')}
                                            </p>
                                        </div>
                                    </div>
                                    <p className={`font-bold text-lg ${
                                        transaction.type === 'income' ? 'text-blue-600' : 'text-red-600'
                                    }`}>
                                        {transaction.type === 'income' ? '+' : '-'}¥{transaction.amount.toLocaleString()}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </main>

                {/* ナビゲーションバー */}
                <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
                    <div className="flex justify-around items-center h-16">
                        <Link href="/home" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
                            <span className="text-2xl">🏠</span>
                            <span className="text-xs">ホーム</span>
                        </Link>
                        <Link href="/transactions" className="flex flex-col items-center text-blue-600">
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

