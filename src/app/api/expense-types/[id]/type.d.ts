import { ExpenseType } from '@/types/firestore';
import { ApiResponse } from '@/types/api';

// リクエスト型
export type UpdateExpenseTypeRequest = Partial<Omit<ExpenseType, 'expenseTypeId' | 'householdId' | 'isDefault' | 'createdAt'>>;

// レスポンス型
export type UpdateExpenseTypeResponse = ApiResponse<ExpenseType>;
export type DeleteExpenseTypeResponse = ApiResponse;

