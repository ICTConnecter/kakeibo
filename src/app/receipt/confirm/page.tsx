'use client';

import { useState, useEffect, Suspense, useContext } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserAuthComponent, UserAuthContext } from '@/components/context/user';
import { HouseholdContext } from '@/components/context/household';

function ReceiptConfirmForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { userInfo } = useContext(UserAuthContext);
    const { categories, wallets, expenseTypes, setHouseholdId, loading: householdLoading, refetch } = useContext(HouseholdContext);
    
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
        receiptImageData: '', // Base64画像データ
    });
    
    // ユーザー情報からhouseholdIdを設定
    useEffect(() => {
        if (userInfo?.households && userInfo.households.length > 0) {
            setHouseholdId(userInfo.households[0].householdId);
        }
    }, [userInfo, setHouseholdId]);

    useEffect(() => {
        const dataParam = searchParams.get('data');
        if (dataParam) {
            try {
                const parsedData = JSON.parse(dataParam);
                
                // sessionStorageから画像データを取得
                const receiptImageData = sessionStorage.getItem('receiptImageData') || '';

                // 日付をdatetime-local形式に変換（YYYY-MM-DDThh:mm）
                let formattedDate = new Date().toISOString().slice(0, 16);
                if (parsedData.date) {
                    try {
                        // ISO 8601形式やその他の形式から変換
                        const dateObj = new Date(parsedData.date);
                        if (!isNaN(dateObj.getTime())) {
                            // ローカルタイムゾーンで表示
                            const year = dateObj.getFullYear();
                            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                            const day = String(dateObj.getDate()).padStart(2, '0');
                            const hours = String(dateObj.getHours()).padStart(2, '0');
                            const minutes = String(dateObj.getMinutes()).padStart(2, '0');
                            formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;
                        }
                    } catch (error) {
                        console.error('日付の変換に失敗しました:', error);
                    }
                }
                
                console.log('取得した日付:', parsedData.date);
                console.log('フォーム用に変換した日付:', formattedDate);
                
                setFormData({
                    storeName: parsedData.storeName || '',
                    date: formattedDate,
                    amount: parsedData.totalAmount || 0,
                    categoryId: '',
                    walletId: '',
                    expenseTypeId: '',
                    memo: '',
                    items: parsedData.items || [],
                    receiptImageData, // sessionStorageから取得したBase64データ
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
            // userInfoから実際のhouseholdIdを取得
            const householdId = userInfo?.households?.[0]?.householdId;
            
            if (!householdId) {
                alert('家計簿情報が見つかりません');
                return;
            }

            const response = await fetch('/api/expenses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    householdId,
                    ...formData,
                    expenseTypeId: formData.expenseTypeId || null,
                }),
            });

            const result = await response.json();

            if (result.success) {
                // 登録成功後、sessionStorageをクリア
                sessionStorage.removeItem('receiptImageData');
                
                // データを再取得してからホーム画面に遷移
                await refetch();
                
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
                            onClick={() => {
                                sessionStorage.removeItem('receiptImageData');
                                router.back();
                            }}
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
                    {formData.receiptImageData && (
                        <div className="mb-6">
                            <img
                                src={formData.receiptImageData}
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
                                disabled={householdLoading}
                            >
                                <option value="">選択してください</option>
                                {categories
                                    .filter(cat => cat.type === 'expense')
                                    .map(category => (
                                        <option key={category.categoryId} value={category.categoryId}>
                                            {category.icon} {category.name}
                                        </option>
                                    ))
                                }
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
                                disabled={householdLoading}
                            >
                                <option value="">選択してください</option>
                                {wallets.map(wallet => (
                                    <option key={wallet.walletId} value={wallet.walletId}>
                                        {wallet.icon} {wallet.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 支出タイプ（任意） */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                経費タイプ（任意）
                            </label>
                            <select
                                value={formData.expenseTypeId}
                                onChange={(e) => setFormData({ ...formData, expenseTypeId: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                disabled={householdLoading}
                            >
                                <option value="">なし</option>
                                {expenseTypes.map(expenseType => (
                                    <option key={expenseType.expenseTypeId} value={expenseType.expenseTypeId}>
                                        {expenseType.icon} {expenseType.name}
                                    </option>
                                ))}
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
                                onClick={() => {
                                    sessionStorage.removeItem('receiptImageData');
                                    router.back();
                                }}
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

export default function ReceiptConfirmPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl mb-4">⏳</div>
                    <p className="text-gray-600">読み込み中...</p>
                </div>
            </div>
        }>
            <ReceiptConfirmForm />
        </Suspense>
    );
}

