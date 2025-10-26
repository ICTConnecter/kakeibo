'use client';

import { useState, useEffect } from 'react';
import { UserAuthComponent } from '@/components/context/user';
import Link from 'next/link';

export default function ReportsPage() {
    const [period, setPeriod] = useState('month');
    const [summary, setSummary] = useState({
        totalIncome: 250000,
        totalExpense: 180000,
        balance: 70000,
        savingsRate: 28,
    });
    const [categoryData, setCategoryData] = useState([
        { category: '食費', amount: 80000, percentage: 44.4 },
        { category: '交通費', amount: 30000, percentage: 16.7 },
        { category: '娯楽費', amount: 40000, percentage: 22.2 },
        { category: 'その他', amount: 30000, percentage: 16.7 },
    ]);

    return (
        <UserAuthComponent>
            <div className="min-h-screen bg-gray-50 pb-20">
                {/* ヘッダー */}
                <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
                    <h1 className="text-2xl font-bold text-gray-800 text-center">レポート</h1>
                </header>

                <main className="max-w-7xl mx-auto p-4 space-y-6">
                    <div className="bg-white rounded-lg shadow p-4 text-center text-lg font-bold">
                        開発中
                    </div>
                    {/* 期間選択 */}
                    <div className="bg-white rounded-lg shadow p-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            期間選択
                        </label>
                        <select
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="month">今月</option>
                            <option value="3months">過去3ヶ月</option>
                            <option value="6months">過去6ヶ月</option>
                            <option value="year">1年</option>
                        </select>
                    </div>

                    {/* 収支サマリーカード */}
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
                        <h2 className="text-lg font-semibold mb-4">収支サマリー</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm opacity-90">総収入</p>
                                <p className="text-2xl font-bold">
                                    ¥{summary.totalIncome.toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm opacity-90">総支出</p>
                                <p className="text-2xl font-bold">
                                    ¥{summary.totalExpense.toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm opacity-90">収支</p>
                                <p className="text-2xl font-bold">
                                    ¥{summary.balance.toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm opacity-90">貯蓄率</p>
                                <p className="text-2xl font-bold">
                                    {summary.savingsRate}%
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* カテゴリ別支出グラフ */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold mb-4">支出カテゴリ別</h2>
                        <div className="space-y-3">
                            {categoryData.map((item, index) => (
                                <div key={index}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium">{item.category}</span>
                                        <span className="text-sm text-gray-600">
                                            ¥{item.amount.toLocaleString()} ({item.percentage}%)
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all"
                                            style={{ width: `${item.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 月次推移グラフ（簡易版） */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold mb-4">月次推移</h2>
                        <div className="text-center text-gray-500 py-8">
                            <p>グラフ表示エリア</p>
                            <p className="text-sm mt-2">Chart.jsなどのライブラリで実装予定</p>
                        </div>
                    </div>

                    {/* エクスポートボタン */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <button className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
                            📥 CSVでエクスポート
                        </button>
                    </div>
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
                        <Link href="/reports" className="flex flex-col items-center text-blue-600">
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

