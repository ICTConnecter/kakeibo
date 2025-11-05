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
        receiptImagesData: [] as string[], // 複数のBase64画像データ
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

                // sessionStorageから画像データを取得（複数画像対応）
                let receiptImagesData: string[] = [];
                const imagesDataStr = sessionStorage.getItem('receiptImagesData');
                if (imagesDataStr) {
                    try {
                        receiptImagesData = JSON.parse(imagesDataStr);
                    } catch {
                        receiptImagesData = [];
                    }
                } else {
                    // 後方互換性：単一画像の場合
                    const singleImageData = sessionStorage.getItem('receiptImageData');
                    if (singleImageData) {
                        receiptImagesData = [singleImageData];
                    }
                }

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
                    receiptImagesData, // sessionStorageから取得した複数のBase64データ
                });
            } catch (error) {
                console.error('Failed to parse data:', error);
            }
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate items total matches amount if items are provided
        if (formData.items.length > 0) {
            const itemsTotal = formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            if (itemsTotal !== formData.amount) {
                alert(`エラー: 金額 (¥${formData.amount.toLocaleString()}) と商品明細の合計 (¥${itemsTotal.toLocaleString()}) が一致しません。修正してください。`);
                return;
            }
        }

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
                    // 複数画像データを送信
                    receiptImagesData: formData.receiptImagesData,
                }),
            });

            const result = await response.json();

            if (result.success) {
                // 登録成功後、sessionStorageをクリア
                sessionStorage.removeItem('receiptImageData');
                sessionStorage.removeItem('receiptImagesData');

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
                                sessionStorage.removeItem('receiptImagesData');
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
                    {/* レシート画像（複数画像対応） */}
                    {formData.receiptImagesData && formData.receiptImagesData.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-gray-700 mb-3 text-center">
                                レシート画像 ({formData.receiptImagesData.length}枚)
                            </h3>
                            <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                                {formData.receiptImagesData.map((imageData, index) => (
                                    <div key={index} className="relative">
                                        <img
                                            src={imageData}
                                            alt={`レシート ${index + 1}`}
                                            className="w-full rounded-lg shadow"
                                        />
                                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                                            {index + 1}枚目
                                        </div>
                                    </div>
                                ))}
                            </div>
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

                        {/* 商品明細 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                商品明細（任意）
                            </label>
                            <div className="space-y-3">
                                {formData.items.map((item, index) => (
                                    <div key={index} className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg">
                                        <div className="flex-1 space-y-2">
                                            <input
                                                type="text"
                                                placeholder="商品名"
                                                value={item.name}
                                                onChange={(e) => {
                                                    const newItems = [...formData.items];
                                                    newItems[index] = { ...newItems[index], name: e.target.value };
                                                    setFormData({ ...formData, items: newItems });
                                                }}
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                            />
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    placeholder="単価"
                                                    value={item.price}
                                                    onChange={(e) => {
                                                        const newItems = [...formData.items];
                                                        newItems[index] = { ...newItems[index], price: Number(e.target.value) };
                                                        setFormData({ ...formData, items: newItems });
                                                    }}
                                                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="数量"
                                                    value={item.quantity}
                                                    onChange={(e) => {
                                                        const newItems = [...formData.items];
                                                        newItems[index] = { ...newItems[index], quantity: Number(e.target.value) };
                                                        setFormData({ ...formData, items: newItems });
                                                    }}
                                                    className="w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                                />
                                                <div className="px-3 py-2 bg-white border rounded-lg text-sm font-medium whitespace-nowrap">
                                                    ¥{(item.price * item.quantity).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newItems = formData.items.filter((_, i) => i !== index);
                                                setFormData({ ...formData, items: newItems });
                                            }}
                                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFormData({
                                            ...formData,
                                            items: [...formData.items, { name: '', price: 0, quantity: 1 }]
                                        });
                                    }}
                                    className="w-full py-2 px-4 border border-dashed border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50"
                                >
                                    + 商品を追加
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => {
                                    sessionStorage.removeItem('receiptImageData');
                                    sessionStorage.removeItem('receiptImagesData');
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

