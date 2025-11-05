import { Wallet } from '@/types/firestore';

// デフォルトウォレット
export const DEFAULT_WALLETS: Omit<Wallet, 'walletId' | 'householdId' | 'createdAt'>[] = [
    {
        name: '現金',
        icon: '💵',
        color: '#4CAF50',
        isDefault: true,
        order: 1,
        status: 'active',
    },
    {
        name: 'クレジットカード',
        icon: '💳',
        color: '#2196F3',
        isDefault: true,
        order: 2,
        status: 'active',
    },
    {
        name: 'デビットカード',
        icon: '💳',
        color: '#FF9800',
        isDefault: true,
        order: 3,
        status: 'active',
    },
    {
        name: '電子マネー',
        icon: '📱',
        color: '#9C27B0',
        isDefault: true,
        order: 4,
        status: 'active',
    },
    {
        name: '銀行口座',
        icon: '🏦',
        color: '#607D8B',
        isDefault: true,
        order: 5,
        status: 'active',
    },
];

