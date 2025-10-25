import { ExpenseType } from '@/types/firestore';
import { ApiResponse } from '@/types/api';

// リクエスト型
export type GetExpenseTypesQuery = {
    householdId: string;
};

export type CreateExpenseTypeRequest = {
    householdId: string;
    name: string;
    icon: string;
    color: string;
};

// レスポンス型
export type GetExpenseTypesResponse = ApiResponse<ExpenseType[]>;
export type CreateExpenseTypeResponse = ApiResponse<ExpenseType>;

