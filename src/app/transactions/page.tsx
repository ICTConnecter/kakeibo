'use client';

import { useState, useEffect, useContext, useMemo } from 'react';
import { UserAuthComponent, UserAuthContext } from '@/components/context/user';
import { HouseholdContext } from '@/components/context/household';
import Link from 'next/link';
import { Expense } from '@/types/firestore/Expense';
import { Income } from '@/types/firestore/Income';

type TransactionType = 'all' | 'expense' | 'income';

type Transaction = {
    id: string;
    type: 'expense' | 'income';
    name: string;
    category: string;
    amount: number;
    date: Date;
};

export default function TransactionsPage() {
    const { idToken } = useContext(UserAuthContext);
    const { householdId, categories } = useContext(HouseholdContext);
    
    const [activeTab, setActiveTab] = useState<TransactionType>('all');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
    const [loading, setLoading] = useState(true);
    
    // 現在の年月をデフォルトとする
    const now = new Date();
    const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);

    // 年の選択肢を生成（過去5年から未来1年まで）
    const yearOptions = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = currentYear - 5; i <= currentYear + 1; i++) {
            years.push(i);
        }
        return years;
    }, []);

    // 月の選択肢
    const monthOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    // 選択された年月に基づいて開始日と終了日を計算
    const getDateRange = (year: number, month: number) => {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);
        return { startDate, endDate };
    };

    // APIからデータを取得
    useEffect(() => {
        const fetchData = async () => {
            if (!householdId || !idToken) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const { startDate, endDate } = getDateRange(selectedYear, selectedMonth);
                
                const headers = {
                    'Authorization': `Bearer:${idToken}`,
                    'Content-Type': 'application/json',
                };

                // 収入と支出を並列で取得
                const [expensesRes, incomesRes] = await Promise.all([
                    fetch(`/api/expenses?householdId=${householdId}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, { headers }),
                    fetch(`/api/incomes?householdId=${householdId}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, { headers }),
                ]);

                const expensesData = await expensesRes.json();
                const incomesData = await incomesRes.json();

                // データの変換
                const expenseTransactions: Transaction[] = expensesData.success && expensesData.data?.expenses
                    ? expensesData.data.expenses.map((expense: Expense) => {
                        const category = categories.find(c => c.categoryId === expense.categoryId);
                        return {
                            id: expense.expenseId,
                            type: 'expense' as const,
                            name: expense.storeName,
                            category: category?.name || '未分類',
                            amount: expense.amount,
                            date: new Date(expense.date),
                        };
                    })
                    : [];

                const incomeTransactions: Transaction[] = incomesData.success && incomesData.data?.incomes
                    ? incomesData.data.incomes.map((income: Income) => {
                        const category = categories.find(c => c.categoryId === income.categoryId);
                        return {
                            id: income.incomeId,
                            type: 'income' as const,
                            name: income.source,
                            category: category?.name || '未分類',
                            amount: income.amount,
                            date: new Date(income.date),
                        };
                    })
                    : [];

                // 全ての取引を結合してソート
                const allTransactions = [...expenseTransactions, ...incomeTransactions].sort(
                    (a, b) => b.date.getTime() - a.date.getTime()
                );

                setTransactions(allTransactions);

                // サマリーを計算
                const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
                const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
                setSummary({
                    income: totalIncome,
                    expense: totalExpense,
                    balance: totalIncome - totalExpense,
                });

            } catch (error) {
                console.error('データ取得エラー:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [householdId, idToken, selectedYear, selectedMonth, categories]);

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
                    {/* 年月選択 */}
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center justify-center gap-3">
                            <label className="text-sm text-gray-600">年月:</label>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {yearOptions.map((year) => (
                                    <option key={year} value={year}>
                                        {year}年
                                    </option>
                                ))}
                            </select>
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {monthOptions.map((month) => (
                                    <option key={month} value={month}>
                                        {month}月
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

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
                                href={`/transactions/${transaction.type}-${transaction.id}`}
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

