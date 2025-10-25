import { Income } from '@/types/firestore';
import { ApiResponse, GetIncomesResponse, CreateIncomeRequest } from '@/types/api';

// リクエスト型（既存のものを再エクスポート）
export type { CreateIncomeRequest } from '@/types/api';

export type GetIncomesQuery = {
    householdId: string;
    categoryId?: string;
    walletId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
};

// レスポンス型（既存のものを再エクスポート）
export type { GetIncomesResponse } from '@/types/api';
export type CreateIncomeResponse = ApiResponse<Income>;

