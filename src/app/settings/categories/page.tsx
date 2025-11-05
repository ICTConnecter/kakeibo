'use client';

import { useState, useContext, useEffect } from 'react';
import { UserAuthComponent, UserAuthContext } from '@/components/context/user';
import { HouseholdContext } from '@/components/context/household';
import Link from 'next/link';
import { Category, CategoryType } from '@/types/firestore/Category.d';

type ModalMode = 'add' | 'edit' | 'delete' | null;

export default function CategoriesPage() {
    const { categories, loading, error, refetch, householdId } = useContext(HouseholdContext);
    const { idToken } = useContext(UserAuthContext);
    const [activeTab, setActiveTab] = useState<CategoryType>('expense');
    const [modalMode, setModalMode] = useState<ModalMode>(null);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        icon: '📁',
        color: '#3B82F6',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showDeleted, setShowDeleted] = useState(false);
    const [allCategories, setAllCategories] = useState<Category[]>([]);

    // 削除済みを含めたカテゴリを取得
    const fetchAllCategories = async () => {
        if (!householdId || !showDeleted) {
            setAllCategories([]);
            return;
        }

        try {
            const response = await fetch(`/api/categories?householdId=${householdId}&includeDeleted=true`, {
                headers: {
                    'Authorization': `Bearer:${idToken}`,
                },
            });

            const result = await response.json();
            if (result.success && result.data) {
                setAllCategories(result.data);
            }
        } catch (err) {
            console.error('Failed to fetch all categories:', err);
        }
    };

    // showDeletedが変更されたときにデータを取得
    useEffect(() => {
        if (showDeleted) {
            fetchAllCategories();
        }
    }, [showDeleted, householdId, idToken]);

    // タブに応じてカテゴリをフィルタリング
    const displayCategories = showDeleted ? allCategories : categories;
    const filteredCategories = displayCategories.filter(cat => cat.type === activeTab);

    // モーダルを開く
    const openAddModal = () => {
        setFormData({ name: '', icon: '📁', color: '#3B82F6' });
        setErrorMessage(null);
        setModalMode('add');
    };

    const openEditModal = (category: Category) => {
        setSelectedCategory(category);
        setFormData({
            name: category.name,
            icon: category.icon,
            color: category.color,
        });
        setErrorMessage(null);
        setModalMode('edit');
    };

    const openDeleteModal = (category: Category) => {
        setSelectedCategory(category);
        setErrorMessage(null);
        setModalMode('delete');
    };

    const closeModal = () => {
        setModalMode(null);
        setSelectedCategory(null);
        setErrorMessage(null);
    };

    // カテゴリ追加
    const handleAdd = async () => {
        if (!householdId || !formData.name.trim()) {
            setErrorMessage('カテゴリ名を入力してください');
            return;
        }

        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            const response = await fetch('/api/categories', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer:${idToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    householdId,
                    type: activeTab,
                    name: formData.name.trim(),
                    icon: formData.icon,
                    color: formData.color,
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || 'カテゴリの追加に失敗しました');
            }

            await refetch();
            if (showDeleted) {
                await fetchAllCategories();
            }
            closeModal();
        } catch (err: any) {
            setErrorMessage(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // カテゴリ編集
    const handleEdit = async () => {
        if (!selectedCategory || !formData.name.trim()) {
            setErrorMessage('カテゴリ名を入力してください');
            return;
        }

        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            const response = await fetch(`/api/categories/${selectedCategory.categoryId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer:${idToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    icon: formData.icon,
                    color: formData.color,
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || 'カテゴリの更新に失敗しました');
            }

            await refetch();
            if (showDeleted) {
                await fetchAllCategories();
            }
            closeModal();
        } catch (err: any) {
            setErrorMessage(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // カテゴリ削除
    const handleDelete = async () => {
        if (!selectedCategory) return;

        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            const response = await fetch(`/api/categories/${selectedCategory.categoryId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer:${idToken}`,
                    'Content-Type': 'application/json',
                },
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || 'カテゴリの削除に失敗しました');
            }

            await refetch();
            if (showDeleted) {
                await fetchAllCategories();
            }
            closeModal();
        } catch (err: any) {
            setErrorMessage(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <UserAuthComponent>
            <div className="min-h-screen bg-gray-50 pb-20">
                {/* ヘッダー */}
                <header className="bg-white shadow-sm p-4 flex items-center">
                    <Link href="/settings" className="mr-4">
                        <span className="text-2xl">←</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-800">カテゴリ管理</h1>
                </header>

                <main className="max-w-7xl mx-auto p-4 space-y-4">
                    {/* タブ */}
                    <div className="bg-white rounded-lg shadow p-2 flex gap-2">
                        <button
                            onClick={() => setActiveTab('expense')}
                            className={`flex-1 py-3 rounded-md font-medium transition-colors ${
                                activeTab === 'expense'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            支出カテゴリ
                        </button>
                        <button
                            onClick={() => setActiveTab('income')}
                            className={`flex-1 py-3 rounded-md font-medium transition-colors ${
                                activeTab === 'income'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            収入カテゴリ
                        </button>
                    </div>

                    {/* 削除済み表示トグル */}
                    <div className="bg-white rounded-lg shadow p-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showDeleted}
                                onChange={(e) => setShowDeleted(e.target.checked)}
                                className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-sm text-gray-700">削除済みアイテムを表示</span>
                        </label>
                    </div>

                    {/* エラー表示 */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    {/* ローディング */}
                    {loading && (
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="mt-2 text-gray-600">読み込み中...</p>
                        </div>
                    )}

                    {/* カテゴリ一覧 */}
                    {!loading && (
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <h2 className="px-6 py-4 font-semibold border-b">
                                {activeTab === 'expense' ? '支出カテゴリ一覧' : '収入カテゴリ一覧'}
                            </h2>
                            <div className="divide-y">
                                {filteredCategories.length === 0 ? (
                                    <div className="px-6 py-8 text-center text-gray-500">
                                        カテゴリがありません
                                    </div>
                                ) : (
                                    filteredCategories
                                        .sort((a, b) => {
                                            // 削除済みを下に表示
                                            if (a.status === 'deleted' && b.status !== 'deleted') return 1;
                                            if (a.status !== 'deleted' && b.status === 'deleted') return -1;
                                            // 同じステータスの場合はorderでソート
                                            return a.order - b.order;
                                        })
                                        .map((category) => {
                                            const isDeleted = category.status === 'deleted';
                                            return (
                                                <div
                                                    key={category.categoryId}
                                                    className={`flex items-center justify-between px-6 py-4 hover:bg-gray-50 ${
                                                        isDeleted ? 'opacity-50 bg-gray-50' : ''
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span
                                                            className="text-2xl w-10 h-10 rounded-full flex items-center justify-center"
                                                            style={{ backgroundColor: `${category.color}20` }}
                                                        >
                                                            {category.icon}
                                                        </span>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className={`font-medium ${isDeleted ? 'line-through' : ''}`}>
                                                                    {category.name}
                                                                </p>
                                                                {isDeleted && (
                                                                    <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded">
                                                                        削除済み
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-gray-500">
                                                                順序: {category.order}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {!isDeleted && (
                                                            <>
                                                                <button
                                                                    onClick={() => openEditModal(category)}
                                                                    className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
                                                                >
                                                                    編集
                                                                </button>
                                                                <button
                                                                    onClick={() => openDeleteModal(category)}
                                                                    className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                                                                >
                                                                    削除
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                )}
                            </div>
                        </div>
                    )}

                    {/* 追加ボタン */}
                    <button
                        onClick={openAddModal}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
                    >
                        <span className="text-xl">+</span>
                        <span>{activeTab === 'expense' ? '支出カテゴリを追加' : '収入カテゴリを追加'}</span>
                    </button>
                </main>

                {/* 追加・編集モーダル */}
                {(modalMode === 'add' || modalMode === 'edit') && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full">
                            <h2 className="text-xl font-bold mb-4">
                                {modalMode === 'add' ? 'カテゴリを追加' : 'カテゴリを編集'}
                            </h2>

                            {errorMessage && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                                    {errorMessage}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        カテゴリ名
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="例: 食費"
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        アイコン
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.icon}
                                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="例: 🍔"
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        カラー
                                    </label>
                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="color"
                                            value={formData.color}
                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                            className="h-10 w-20"
                                            disabled={isSubmitting}
                                        />
                                        <input
                                            type="text"
                                            value={formData.color}
                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="#3B82F6"
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-600">プレビュー:</span>
                                    <span
                                        className="text-2xl w-10 h-10 rounded-full flex items-center justify-center"
                                        style={{ backgroundColor: `${formData.color}20` }}
                                    >
                                        {formData.icon}
                                    </span>
                                    <span className="font-medium">{formData.name || 'カテゴリ名'}</span>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                    disabled={isSubmitting}
                                >
                                    キャンセル
                                </button>
                                <button
                                    onClick={modalMode === 'add' ? handleAdd : handleEdit}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? '処理中...' : modalMode === 'add' ? '追加' : '更新'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 削除確認モーダル */}
                {modalMode === 'delete' && selectedCategory && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full">
                            <h2 className="text-xl font-bold mb-4">カテゴリを削除</h2>

                            {errorMessage && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                                    {errorMessage}
                                </div>
                            )}

                            <p className="text-gray-700 mb-2">
                                以下のカテゴリを削除してもよろしいですか？
                            </p>

                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-6">
                                <span
                                    className="text-2xl w-10 h-10 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: `${selectedCategory.color}20` }}
                                >
                                    {selectedCategory.icon}
                                </span>
                                <span className="font-medium">{selectedCategory.name}</span>
                            </div>

                            <p className="text-sm text-red-600 mb-4">
                                この操作は取り消せません。このカテゴリに紐づく取引データは影響を受ける可能性があります。
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                    disabled={isSubmitting}
                                >
                                    キャンセル
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? '削除中...' : '削除'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

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
                        <Link href="/reports" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
                            <span className="text-2xl">📊</span>
                            <span className="text-xs">レポート</span>
                        </Link>
                        <Link href="/settings" className="flex flex-col items-center text-blue-600">
                            <span className="text-2xl">⚙️</span>
                            <span className="text-xs">設定</span>
                        </Link>
                    </div>
                </nav>
            </div>
        </UserAuthComponent>
    );
}
