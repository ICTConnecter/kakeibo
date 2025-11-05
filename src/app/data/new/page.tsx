'use client';

import { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserAuthContext } from '@/components/context/user';
import { HouseholdContext } from '@/components/context/household';

type TransactionType = 'income' | 'expense';

function NewTransactionForm() {
    const router = useRouter();
    const { userInfo } = useContext(UserAuthContext);
    const { categories, wallets, expenseTypes, setHouseholdId, loading: householdLoading, refetch } = useContext(HouseholdContext);
    
    const [loading, setLoading] = useState(false);
    const [transactionType, setTransactionType] = useState<TransactionType>('income');
    
    // ユーザー情報からhouseholdIdを設定
    useEffect(() => {
        if (userInfo?.households && userInfo.households.length > 0) {
            setHouseholdId(userInfo.households[0].householdId);
        }
    }, [userInfo, setHouseholdId]);
    
    // 収入用フォームデータ
    const [incomeFormData, setIncomeFormData] = useState({
        source: '',
        date: new Date().toISOString().slice(0, 16),
        amount: 0,
        categoryId: '',
        walletId: '',
        memo: '',
    });

    // 支出用フォームデータ
    const [expenseFormData, setExpenseFormData] = useState({
        storeName: '',
        date: new Date().toISOString().slice(0, 16),
        amount: 0,
        categoryId: '',
        walletId: '',
        expenseTypeId: '',
        memo: '',
        items: [] as { name: string; price: number; quantity: number }[],
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate items total matches amount for expenses
        if (transactionType === 'expense' && expenseFormData.items.length > 0) {
            const itemsTotal = expenseFormData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            if (itemsTotal !== expenseFormData.amount) {
                alert(`エラー: 金額 (¥${expenseFormData.amount.toLocaleString()}) と商品明細の合計 (¥${itemsTotal.toLocaleString()}) が一致しません。修正してください。`);
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

            let response;
            
            if (transactionType === 'income') {
                response = await fetch('/api/incomes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        householdId,
                        ...incomeFormData,
                    }),
                });
            } else {
                response = await fetch('/api/expenses', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        householdId,
                        ...expenseFormData,
                        expenseTypeId: expenseFormData.expenseTypeId || null,
                    }),
                });
            }

            const result = await response.json();

            if (result.success) {
                const message = transactionType === 'income' ? '収入を登録しました！' : '支出を登録しました！';
                // 最新のデータを取得してから遷移
                await refetch();
                alert(message);
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
                        <h1 className="text-xl font-bold text-gray-800">
                            {transactionType === 'income' ? '収入登録' : '支出登録'}
                        </h1>
                        <div className="w-16"></div>
                    </div>
                </header>

                <main className="max-w-3xl mx-auto p-4">
                    {/* 収入/支出切り替えボタン */}
                    <div className="bg-white rounded-lg shadow mb-4 p-2 flex gap-2">
                        <button
                            type="button"
                            onClick={() => setTransactionType('income')}
                            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
                                transactionType === 'income'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            収入
                        </button>
                        <button
                            type="button"
                            onClick={() => setTransactionType('expense')}
                            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
                                transactionType === 'expense'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            支出
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
                        {/* 日時入力 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {transactionType === 'income' ? '受取日時' : '使用日時'}
                            </label>
                            <input
                                type="datetime-local"
                                value={transactionType === 'income' ? incomeFormData.date : expenseFormData.date}
                                onChange={(e) => {
                                    if (transactionType === 'income') {
                                        setIncomeFormData({ ...incomeFormData, date: e.target.value });
                                    } else {
                                        setExpenseFormData({ ...expenseFormData, date: e.target.value });
                                    }
                                }}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        {/* 収入源 or 店舗名 */}
                        {transactionType === 'income' ? (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    収入源
                                </label>
                                <input
                                    type="text"
                                    value={incomeFormData.source}
                                    onChange={(e) => setIncomeFormData({ ...incomeFormData, source: e.target.value })}
                                    placeholder="例: 給与、副業など"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    店舗名
                                </label>
                                <input
                                    type="text"
                                    value={expenseFormData.storeName}
                                    onChange={(e) => setExpenseFormData({ ...expenseFormData, storeName: e.target.value })}
                                    placeholder="例: コンビニ、スーパーなど"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        )}

                        {/* 金額 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                金額
                            </label>
                            <input
                                type="number"
                                value={transactionType === 'income' ? incomeFormData.amount : expenseFormData.amount}
                                onChange={(e) => {
                                    const amount = Number(e.target.value);
                                    if (transactionType === 'income') {
                                        setIncomeFormData({ ...incomeFormData, amount });
                                    } else {
                                        setExpenseFormData({ ...expenseFormData, amount });
                                    }
                                }}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                                min="0"
                            />
                        </div>

                        {/* カテゴリ */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                カテゴリ
                            </label>
                            <select
                                value={transactionType === 'income' ? incomeFormData.categoryId : expenseFormData.categoryId}
                                onChange={(e) => {
                                    if (transactionType === 'income') {
                                        setIncomeFormData({ ...incomeFormData, categoryId: e.target.value });
                                    } else {
                                        setExpenseFormData({ ...expenseFormData, categoryId: e.target.value });
                                    }
                                }}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                                disabled={householdLoading}
                            >
                                <option value="">選択してください</option>
                                {categories
                                    .filter(cat => cat.type === transactionType)
                                    .map(category => (
                                        <option key={category.categoryId} value={category.categoryId}>
                                            {category.icon} {category.name}
                                        </option>
                                    ))
                                }
                            </select>
                        </div>

                        {/* ウォレット */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {transactionType === 'income' ? '入金先ウォレット' : '支払元ウォレット'}
                            </label>
                            <select
                                value={transactionType === 'income' ? incomeFormData.walletId : expenseFormData.walletId}
                                onChange={(e) => {
                                    if (transactionType === 'income') {
                                        setIncomeFormData({ ...incomeFormData, walletId: e.target.value });
                                    } else {
                                        setExpenseFormData({ ...expenseFormData, walletId: e.target.value });
                                    }
                                }}
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

                        {/* 支出タイプ（支出の場合のみ） */}
                        {transactionType === 'expense' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    経費タイプ（任意）
                                </label>
                                <select
                                    value={expenseFormData.expenseTypeId}
                                    onChange={(e) => setExpenseFormData({ ...expenseFormData, expenseTypeId: e.target.value })}
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
                        )}

                        {/* メモ */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                メモ
                            </label>
                            <textarea
                                value={transactionType === 'income' ? incomeFormData.memo : expenseFormData.memo}
                                onChange={(e) => {
                                    if (transactionType === 'income') {
                                        setIncomeFormData({ ...incomeFormData, memo: e.target.value });
                                    } else {
                                        setExpenseFormData({ ...expenseFormData, memo: e.target.value });
                                    }
                                }}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                rows={3}
                                placeholder="任意のメモを入力"
                            />
                        </div>

                        {/* 商品明細（支出の場合のみ） */}
                        {transactionType === 'expense' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    商品明細（任意）
                                </label>
                                <div className="space-y-3">
                                    {expenseFormData.items.map((item, index) => (
                                        <div key={index} className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg">
                                            <div className="flex-1 space-y-2">
                                                <input
                                                    type="text"
                                                    placeholder="商品名"
                                                    value={item.name}
                                                    onChange={(e) => {
                                                        const newItems = [...expenseFormData.items];
                                                        newItems[index] = { ...newItems[index], name: e.target.value };
                                                        setExpenseFormData({ ...expenseFormData, items: newItems });
                                                    }}
                                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                                />
                                                <div className="flex gap-2">
                                                    <input
                                                        type="number"
                                                        placeholder="単価"
                                                        value={item.price}
                                                        onChange={(e) => {
                                                            const newItems = [...expenseFormData.items];
                                                            newItems[index] = { ...newItems[index], price: Number(e.target.value) };
                                                            setExpenseFormData({ ...expenseFormData, items: newItems });
                                                        }}
                                                        className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <input
                                                        type="number"
                                                        placeholder="数量"
                                                        value={item.quantity}
                                                        onChange={(e) => {
                                                            const newItems = [...expenseFormData.items];
                                                            newItems[index] = { ...newItems[index], quantity: Number(e.target.value) };
                                                            setExpenseFormData({ ...expenseFormData, items: newItems });
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
                                                    const newItems = expenseFormData.items.filter((_, i) => i !== index);
                                                    setExpenseFormData({ ...expenseFormData, items: newItems });
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
                                            setExpenseFormData({
                                                ...expenseFormData,
                                                items: [...expenseFormData.items, { name: '', price: 0, quantity: 1 }]
                                            });
                                        }}
                                        className="w-full py-2 px-4 border border-dashed border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50"
                                    >
                                        + 商品を追加
                                    </button>
                                </div>
                            </div>
                        )}

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
                                className={`flex-1 py-3 px-6 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                                    transactionType === 'income'
                                        ? 'bg-blue-600 hover:bg-blue-700'
                                        : 'bg-red-600 hover:bg-red-700'
                                }`}
                                disabled={loading}
                            >
                                {loading ? '登録中...' : '登録する'}
                            </button>
                        </div>
                    </form>
                </main>
        </div>
    );
}

export default function NewTransactionPage() {
    return <NewTransactionForm />;
}
