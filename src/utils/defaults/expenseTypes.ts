import { ExpenseType } from '@/types/firestore';

// デフォルト経費タイプ
export const DEFAULT_EXPENSE_TYPES: Omit<ExpenseType, 'expenseTypeId' | 'householdId' | 'createdAt'>[] = [
    {
        name: '事業用',
        icon: '💼',
        color: '#3F51B5',
        isDefault: true,
        order: 1,
    },
    {
        name: '接待交際費',
        icon: '🍷',
        color: '#E91E63',
        isDefault: true,
        order: 2,
    },
    {
        name: '交通費（業務用）',
        icon: '🚆',
        color: '#00BCD4',
        isDefault: true,
        order: 3,
    },
    {
        name: '消耗品費',
        icon: '📎',
        color: '#8BC34A',
        isDefault: true,
        order: 4,
    },
    {
        name: '通信費（業務用）',
        icon: '📞',
        color: '#FF5722',
        isDefault: true,
        order: 5,
    },
    {
        name: '広告宣伝費',
        icon: '📢',
        color: '#FFC107',
        isDefault: true,
        order: 6,
    },
    {
        name: 'その他経費',
        icon: '📋',
        color: '#9E9E9E',
        isDefault: true,
        order: 7,
    },
];

