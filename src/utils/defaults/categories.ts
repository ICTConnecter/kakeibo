import { Category, CategoryType } from '@/types/firestore';

// デフォルト支出カテゴリ
export const DEFAULT_EXPENSE_CATEGORIES: Omit<Category, 'categoryId' | 'householdId' | 'createdAt'>[] = [
    {
        type: 'expense',
        name: '食費',
        icon: '🍽️',
        color: '#FF6B6B',
        order: 1,
    },
    {
        type: 'expense',
        name: '家賃',
        icon: '🏠',
        color: '#4ECDC4',
        order: 2,
    },
    {
        type: 'expense',
        name: '光熱費',
        icon: '💡',
        color: '#FFE66D',
        order: 3,
    },
    {
        type: 'expense',
        name: '交通費',
        icon: '🚗',
        color: '#95E1D3',
        order: 4,
    },
    {
        type: 'expense',
        name: '医療費',
        icon: '💊',
        color: '#F38181',
        order: 5,
    },
    {
        type: 'expense',
        name: '娯楽費',
        icon: '🎮',
        color: '#AA96DA',
        order: 6,
    },
    {
        type: 'expense',
        name: '衣服費',
        icon: '👔',
        color: '#FCBAD3',
        order: 7,
    },
    {
        type: 'expense',
        name: '通信費',
        icon: '📱',
        color: '#A8D8EA',
        order: 8,
    },
    {
        type: 'expense',
        name: 'その他',
        icon: '📦',
        color: '#D3D3D3',
        order: 9,
    },
];

// デフォルト収入カテゴリ
export const DEFAULT_INCOME_CATEGORIES: Omit<Category, 'categoryId' | 'householdId' | 'createdAt'>[] = [
    {
        type: 'income',
        name: '給与',
        icon: '💰',
        color: '#6BCF7F',
        order: 1,
    },
    {
        type: 'income',
        name: 'ボーナス',
        icon: '💎',
        color: '#4A90E2',
        order: 2,
    },
    {
        type: 'income',
        name: '副業',
        icon: '💼',
        color: '#F5A623',
        order: 3,
    },
    {
        type: 'income',
        name: '投資・配当',
        icon: '📈',
        color: '#7ED321',
        order: 4,
    },
    {
        type: 'income',
        name: 'お小遣い',
        icon: '🎁',
        color: '#FFB6C1',
        order: 5,
    },
    {
        type: 'income',
        name: 'その他収入',
        icon: '💵',
        color: '#B8E986',
        order: 6,
    },
];

// すべてのデフォルトカテゴリ
export const DEFAULT_CATEGORIES = [
    ...DEFAULT_EXPENSE_CATEGORIES,
    ...DEFAULT_INCOME_CATEGORIES,
];

