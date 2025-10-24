'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserAuthComponent } from '@/components/context/user';

export default function ReceiptConfirmPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        storeName: '',
        date: '',
        amount: 0,
        categoryId: '',
        walletId: '',
        expenseTypeId: '',
        memo: '',
        items: [] as any[],
        receiptImageUrl: '',
    });

    useEffect(() => {
        const dataParam = searchParams.get('data');
        if (dataParam) {
            try {
                const parsedData = JSON.parse(dataParam);
                setFormData({
                    storeName: parsedData.storeName || '',
                    date: parsedData.date || new Date().toISOString().slice(0, 16),
                    amount: parsedData.totalAmount || 0,
                    categoryId: '',
                    walletId: '',
                    expenseTypeId: '',
                    memo: '',
                    items: parsedData.items || [],
                    receiptImageUrl: parsedData.receiptImageUrl || '',
                });
            } catch (error) {
                console.error('Failed to parse data:', error);
            }
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // TODO: 実際のhouseholdIdを取得
            const householdId = 'temp-household-id';

            const response = await fetch('/api/expenses', {
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
                alert('支出を登録しました！');
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
                        <h1 className="text-xl font-bold text-gray-800">支出内容の確認</h1>
                        <div className="w-16"></div>
                    </div>
                </header>

                <main className="max-w-3xl mx-auto p-4">
                    {/* レシート画像 */}
                    {formData.receiptImageUrl && (
                        <div className="mb-6">
                            <img
                                src={formData.receiptImageUrl}
                                alt="レシート"
                                className="w-full max-w-md mx-auto rounded-lg shadow"
                            />
                        </div>
                    )}

                    {/* 編集フォーム */}
                    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                日付
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
                                店名
                            </label>
                            <input
                                type="text"
                                value={formData.storeName}
                                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
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
                                <option value="food">食費</option>
                                <option value="transport">交通費</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                ウォレット
                            </label>
                            <select
                                value={formData.walletId}
                                onChange={(e) => setFormData({ ...formData, walletId: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">選択してください</option>
                                <option value="cash">現金</option>
                                <option value="credit">クレジットカード</option>
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

