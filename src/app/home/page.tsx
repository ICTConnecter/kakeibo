'use client';

import { useContext, useState, useEffect } from 'react';
import { LiffContext } from '@/components/context/liff';
import { UserAuthContext } from '@/components/context/user';
import Link from 'next/link';
import { HouseholdContext } from '@/components/context/household';

function HomeContent() {
    const { decodeResult } = useContext(LiffContext);
    const { userInfo } = useContext(UserAuthContext);
    const { household, householdId, setHouseholdId, incomes, expenses } = useContext(HouseholdContext);
    const [summary, setSummary] = useState({
        income: 0,
        expense: 0,
        balance: 0,
    });
    const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // 初回レンダリング時に最初のhouseholdを設定
    useEffect(() => {
        if (userInfo?.households && userInfo.households.length > 0 && !householdId) {
            setHouseholdId(userInfo.households[0].householdId);
        }
    }, [userInfo, householdId, setHouseholdId]);

    // 収支サマリーの計算
    useEffect(() => {
        if (!householdId) {
            setLoading(false);
            return;
        }

        // 今月の収入と支出を計算
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const monthlyIncomes = incomes.filter(income => {
            const incomeDate = new Date(income.date);
            return incomeDate.getMonth() === currentMonth && incomeDate.getFullYear() === currentYear;
        });

        const monthlyExpenses = expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
        });

        const totalIncome = monthlyIncomes.reduce((sum, income) => sum + income.amount, 0);
        const totalExpense = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);

        setSummary({
            income: totalIncome,
            expense: totalExpense,
            balance: totalIncome - totalExpense,
        });

        // 最近の取引（収入と支出を合わせて日付順にソート）
        const allTransactions = [
            ...monthlyIncomes.map(income => ({
                id: `income-${income.incomeId}`,
                type: 'income' as const,
                name: income.source,
                amount: income.amount,
                date: new Date(income.date),
            })),
            ...monthlyExpenses.map(expense => ({
                id: `expense-${expense.expenseId}`,
                type: 'expense' as const,
                name: expense.storeName,
                amount: expense.amount,
                date: new Date(expense.date),
            })),
        ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

        setRecentTransactions(allTransactions);
        setLoading(false);
    }, [householdId, incomes, expenses]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>読み込み中...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* ヘッダー */}
            <header className="bg-white shadow-sm p-4">
                <div className="max-w-7xl mx-auto space-y-3">
                    <div className="flex items-center justify-between">
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
                    
                    {/* 家計簿選択 */}
                    {userInfo?.households && userInfo.households.length > 0 && (
                        <div className="flex items-center gap-2">
                            <label htmlFor="household-select" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                                家計簿:
                            </label>
                            <select
                                id="household-select"
                                value={householdId || ''}
                                onChange={(e) => setHouseholdId(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            >
                                {userInfo.households.map((h, index) => (
                                    <option key={`household-${h.householdId}-${index}`} value={h.householdId}>
                                        {h.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
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
                            {recentTransactions.length > 0 ? (
                                recentTransactions.map((transaction) => (
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
                                ))
                            ) : (
                                <p className="text-center text-gray-500 py-8">
                                    今月の取引がありません
                                </p>
                            )}
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
    );
}

export default function HomePage() {
    return <HomeContent />;
}
