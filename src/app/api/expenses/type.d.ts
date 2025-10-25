import { Expense } from '@/types/firestore';
import { ApiResponse, CreateExpenseRequest, GetExpensesResponse } from '@/types/api';

// リクエスト型（既存のものを再エクスポート）
export type { CreateExpenseRequest } from '@/types/api';

export type GetExpensesQuery = {
    householdId: string;
    categoryId?: string;
    walletId?: string;
    expenseTypeId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
};

// レスポンス型（既存のものを再エクスポート）
export type { GetExpensesResponse } from '@/types/api';
export type CreateExpenseResponse = ApiResponse<Expense>;

