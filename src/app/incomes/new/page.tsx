'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserAuthComponent } from '@/components/context/user';

export default function NewIncomePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        source: '',
        date: new Date().toISOString().slice(0, 16),
        amount: 0,
        categoryId: '',
        walletId: '',
        memo: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // TODO: 実際のhouseholdIdを取得
            const householdId = 'temp-household-id';

            const response = await fetch('/api/incomes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    householdId,
                    ...formData,
                }),
            });

            const result = await response.json();

            if (result.success) {
                alert('収入を登録しました！');
                router.push('/home');
            } else {
                alert(result.error || '登録に失敗しました');
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('エラーが発生しました');
        } finally {
            setLoading(false);
        }
    };

    return (
        <UserAuthComponent>
            <div className="min-h-screen bg-gray-50">
                {/* ヘッダー */}
                <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
                    <div className="flex items-center justify-between max-w-7xl mx-auto">
                        <button
                            onClick={() => router.back()}
                            className="text-gray-600 hover:text-gray-800"
                        >
                            ← 戻る
                        </button>
                        <h1 className="text-xl font-bold text-gray-800">収入登録</h1>
                        <div className="w-16"></div>
                    </div>
                </header>

                <main className="max-w-3xl mx-auto p-4">
                    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                受取日時
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                収入源
                            </label>
                            <input
                                type="text"
                                value={formData.source}
                                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                placeholder="例: 給与、副業など"
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                金額
                            </label>
                            <input
                                type="number"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                                min="0"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                カテゴリ
                            </label>
                            <select
                                value={formData.categoryId}
                                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">選択してください</option>
                                <option value="salary">給与</option>
                                <option value="bonus">ボーナス</option>
                                <option value="side">副業</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                入金先ウォレット
                            </label>
                            <select
                                value={formData.walletId}
                                onChange={(e) => setFormData({ ...formData, walletId: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">選択してください</option>
                                <option value="bank">銀行口座</option>
                                <option value="cash">現金</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                メモ
                            </label>
                            <textarea
                                value={formData.memo}
                                onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                rows={3}
                                placeholder="任意のメモを入力"
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                disabled={loading}
                            >
                                キャンセル
                            </button>
                            <button
                                type="submit"
                                className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={loading}
                            >
                                {loading ? '登録中...' : '登録する'}
                            </button>
                        </div>
                    </form>
                </main>
            </div>
        </UserAuthComponent>
    );
}

