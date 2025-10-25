import { Wallet } from '@/types/firestore';
import { ApiResponse } from '@/types/api';

// リクエスト型
export type UpdateWalletRequest = Partial<Omit<Wallet, 'walletId' | 'householdId' | 'isDefault' | 'createdAt'>>;

// レスポンス型
export type UpdateWalletResponse = ApiResponse<Wallet>;
export type DeleteWalletResponse = ApiResponse;

