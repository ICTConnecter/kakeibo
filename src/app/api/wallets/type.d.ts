import { Wallet } from '@/types/firestore';
import { ApiResponse } from '@/types/api';

// リクエスト型
export type GetWalletsQuery = {
    householdId: string;
};

export type CreateWalletRequest = {
    householdId: string;
    name: string;
    icon: string;
    color: string;
};

// レスポンス型
export type GetWalletsResponse = ApiResponse<Wallet[]>;
export type CreateWalletResponse = ApiResponse<Wallet>;

