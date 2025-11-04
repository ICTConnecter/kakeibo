'use client';

import { useState, useEffect, useContext, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { UserAuthComponent, UserAuthContext } from '@/components/context/user';
import { HouseholdContext } from '@/components/context/household';
import { Expense, ExpenseItem } from '@/types/firestore/Expense';
import { Income } from '@/types/firestore/Income';

type TransactionType = 'expense' | 'income';

function TransactionDetailForm() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const { userInfo, idToken } = useContext(UserAuthContext);
    const { categories, wallets, expenseTypes, loading: householdLoading, refetch } = useContext(HouseholdContext);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [transactionType, setTransactionType] = useState<TransactionType | null>(null);
    const [transaction, setTransaction] = useState<Expense | Income | null>(null);

    const [formData, setFormData] = useState({
        date: '',
        amount: 0,
        categoryId: '',
        walletId: '',
        expenseTypeId: '',
        memo: '',
        storeName: '',
        items: [] as ExpenseItem[],
        source: '',
    });

    useEffect(() => {
        const fetchTransaction = async () => {
            if (!id || !idToken) return;

            setLoading(true);
            try {
                let type: TransactionType;
                let apiId: string;

                if (id.startsWith('expense-')) {
                    type = 'expense';
                    apiId = id.replace('expense-', '');
                } else if (id.startsWith('income-')) {
                    type = 'income';
                    apiId = id.replace('income-', '');
                } else {
                    type = 'expense';
                    apiId = id;
                }

                setTransactionType(type);

                const endpoint = type === 'expense'
                    ? `/api/expenses/${apiId}`
                    : `/api/incomes/${apiId}`;

                const response = await fetch(endpoint, {
                    headers: {
                        'Authorization': `Bearer:${idToken}`,
                        'Content-Type': 'application/json',
                    },
                });

                const result = await response.json();

                if (result.success && result.data) {
                    setTransaction(result.data);

                    const date = new Date(result.data.date);
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const hours = String(date.getHours()).padStart(2, '0');
                    const minutes = String(date.getMinutes()).padStart(2, '0');
                    const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;

                    if (type === 'expense') {
                        const expense = result.data as Expense;
                        setFormData({
                            date: formattedDate,
                            amount: expense.amount,
                            categoryId: expense.categoryId,
                            walletId: expense.walletId,
                            expenseTypeId: expense.expenseTypeId || '',
                            memo: expense.memo,
                            storeName: expense.storeName,
                            items: expense.items || [],
                            source: '',
                        });
                    } else {
                        const income = result.data as Income;
                        setFormData({
                            date: formattedDate,
                            amount: income.amount,
                            categoryId: income.categoryId,
                            walletId: income.walletId,
                            expenseTypeId: '',
                            memo: income.memo,
                            storeName: '',
                            items: [],
                            source: income.source,
                        });
                    }
                } else {
                    alert(result.error || 'Failed to fetch transaction data');
                    router.push('/transactions');
                }
            } catch (error) {
                console.error('Fetch error:', error);
                alert('An error occurred');
                router.push('/transactions');
            } finally {
                setLoading(false);
            }
        };

        fetchTransaction();
    }, [id, idToken, router]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!transaction || !transactionType) return;

        setSaving(true);
        try {
            const apiId = transactionType === 'expense'
                ? (transaction as Expense).expenseId
                : (transaction as Income).incomeId;

            const endpoint = transactionType === 'expense'
                ? `/api/expenses/${apiId}`
                : `/api/incomes/${apiId}`;

            const requestBody: any = {
                date: formData.date,
                amount: formData.amount,
                categoryId: formData.categoryId,
                walletId: formData.walletId,
                memo: formData.memo,
            };

            if (transactionType === 'expense') {
                requestBody.storeName = formData.storeName;
                requestBody.items = formData.items;
                requestBody.expenseTypeId = formData.expenseTypeId || null;
            } else {
                requestBody.source = formData.source;
            }

            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer:${idToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            const result = await response.json();

            if (result.success) {
                alert(result.message || 'Updated successfully');
                await refetch();
                setIsEditMode(false);
                setTransaction(result.data);
            } else {
                alert(result.error || 'Failed to update');
            }
        } catch (error) {
            console.error('Update error:', error);
            alert('An error occurred');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!transaction || !transactionType) return;

        const confirmMessage = transactionType === 'expense'
            ? 'Delete this expense?'
            : 'Delete this income?';

        if (!confirm(confirmMessage)) return;

        setSaving(true);
        try {
            const apiId = transactionType === 'expense'
                ? (transaction as Expense).expenseId
                : (transaction as Income).incomeId;

            const endpoint = transactionType === 'expense'
                ? `/api/expenses/${apiId}`
                : `/api/incomes/${apiId}`;

            const response = await fetch(endpoint, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer:${idToken}`,
                    'Content-Type': 'application/json',
                },
            });

            const result = await response.json();

            if (result.success) {
                alert(result.message || 'Deleted successfully');
                await refetch();
                router.push('/transactions');
            } else {
                alert(result.error || 'Failed to delete');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('An error occurred');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Loading...</p>
            </div>
        );
    }

    if (!transaction || !transactionType) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Transaction not found</p>
            </div>
        );
    }

    const isExpense = transactionType === 'expense';
    const expense = isExpense ? (transaction as Expense) : null;
    const income = !isExpense ? (transaction as Income) : null;

    const category = categories.find(c => c.categoryId === transaction.categoryId);
    const wallet = wallets.find(w => w.walletId === transaction.walletId);
    const expenseType = expense?.expenseTypeId
        ? expenseTypes.find(et => et.expenseTypeId === expense.expenseTypeId)
        : null;

    return (
        <UserAuthComponent>
            <div className="min-h-screen bg-gray-50 pb-20">
                <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
                    <div className="flex items-center justify-between max-w-7xl mx-auto">
                        <button
                            onClick={() => router.back()}
                            className="text-gray-600 hover:text-gray-800"
                            disabled={saving}
                        >
                            &larr; Back
                        </button>
                        <h1 className="text-xl font-bold text-gray-800">
                            {isExpense ? 'Expense Details' : 'Income Details'}
                        </h1>
                        <div className="w-16">
                            {!isEditMode && (
                                <button
                                    onClick={() => setIsEditMode(true)}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                    disabled={saving}
                                >
                                    Edit
                                </button>
                            )}
                        </div>
                    </div>
                </header>

                <main className="max-w-3xl mx-auto p-4 space-y-4">
                    {expense?.receiptImageUrl && (
                        <div className="bg-white rounded-lg shadow p-4">
                            <h2 className="text-lg font-semibold mb-3">Receipt Image</h2>
                            <img
                                src={expense.receiptImageUrl}
                                alt="Receipt"
                                className="w-full max-w-md mx-auto rounded-lg shadow"
                            />
                        </div>
                    )}

                    {isEditMode ? (
                        <form onSubmit={handleUpdate} className="bg-white rounded-lg shadow p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            {isExpense ? (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Store Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.storeName}
                                        onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Income Source
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.source}
                                        onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Amount
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
                                    Category
                                </label>
                                <select
                                    value={formData.categoryId}
                                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                    disabled={householdLoading}
                                >
                                    <option value="">Select...</option>
                                    {categories
                                        .filter(cat => cat.type === transactionType)
                                        .map(cat => (
                                            <option key={cat.categoryId} value={cat.categoryId}>
                                                {cat.icon} {cat.name}
                                            </option>
                                        ))
                                    }
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Wallet
                                </label>
                                <select
                                    value={formData.walletId}
                                    onChange={(e) => setFormData({ ...formData, walletId: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                    disabled={householdLoading}
                                >
                                    <option value="">Select...</option>
                                    {wallets.map(w => (
                                        <option key={w.walletId} value={w.walletId}>
                                            {w.icon} {w.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {isExpense && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Expense Type (Optional)
                                    </label>
                                    <select
                                        value={formData.expenseTypeId}
                                        onChange={(e) => setFormData({ ...formData, expenseTypeId: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                        disabled={householdLoading}
                                    >
                                        <option value="">None</option>
                                        {expenseTypes.map(et => (
                                            <option key={et.expenseTypeId} value={et.expenseTypeId}>
                                                {et.icon} {et.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Memo
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
                                    onClick={() => setIsEditMode(false)}
                                    className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={saving}
                                >
                                    {saving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <>
                            <div className="bg-white rounded-lg shadow p-6 space-y-4">
                                <div className="border-b pb-3">
                                    <p className="text-sm text-gray-600 mb-1">Date</p>
                                    <p className="text-lg font-medium">
                                        {new Date(transaction.date).toLocaleString('ja-JP', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>

                                {isExpense ? (
                                    <div className="border-b pb-3">
                                        <p className="text-sm text-gray-600 mb-1">Store Name</p>
                                        <p className="text-lg font-medium">{expense?.storeName}</p>
                                    </div>
                                ) : (
                                    <div className="border-b pb-3">
                                        <p className="text-sm text-gray-600 mb-1">Income Source</p>
                                        <p className="text-lg font-medium">{income!.source}</p>
                                    </div>
                                )}

                                <div className="border-b pb-3">
                                    <p className="text-sm text-gray-600 mb-1">Amount</p>
                                    <p className={`text-2xl font-bold ${isExpense ? 'text-red-600' : 'text-blue-600'}`}>
                                        {isExpense ? '-' : '+'}¥{transaction.amount.toLocaleString()}
                                    </p>
                                </div>

                                <div className="border-b pb-3">
                                    <p className="text-sm text-gray-600 mb-1">Category</p>
                                    <p className="text-lg font-medium">
                                        {category ? `${category.icon} ${category.name}` : 'Not set'}
                                    </p>
                                </div>

                                <div className="border-b pb-3">
                                    <p className="text-sm text-gray-600 mb-1">Wallet</p>
                                    <p className="text-lg font-medium">
                                        {wallet ? `${wallet.icon} ${wallet.name}` : 'Not set'}
                                    </p>
                                </div>

                                {isExpense && expenseType && (
                                    <div className="border-b pb-3">
                                        <p className="text-sm text-gray-600 mb-1">Expense Type</p>
                                        <p className="text-lg font-medium">
                                            {expenseType.icon} {expenseType.name}
                                        </p>
                                    </div>
                                )}

                                {transaction.memo && (
                                    <div className="border-b pb-3">
                                        <p className="text-sm text-gray-600 mb-1">Memo</p>
                                        <p className="text-lg">{transaction.memo}</p>
                                    </div>
                                )}

                                {isExpense && expense?.items && expense?.items.length > 0 && (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">Item Details</p>
                                        <div className="space-y-2">
                                            {expense?.items.map((item, index) => (
                                                <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                                                    <div>
                                                        <p className="font-medium">{item.name}</p>
                                                        <p className="text-sm text-gray-600">
                                                            ¥{item.price.toLocaleString()} × {item.quantity}
                                                        </p>
                                                    </div>
                                                    <p className="font-medium">
                                                        ¥{(item.price * item.quantity).toLocaleString()}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleDelete}
                                className="w-full py-3 px-6 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={saving}
                            >
                                {saving ? 'Deleting...' : 'Delete'}
                            </button>
                        </>
                    )}
                </main>
            </div>
        </UserAuthComponent>
    );
}

export default function TransactionDetailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl mb-4">⏳</div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        }>
            <TransactionDetailForm />
        </Suspense>
    );
}
