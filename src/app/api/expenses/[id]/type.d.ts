import { Expense } from '@/types/firestore';
import { ApiResponse, UpdateExpenseRequest } from '@/types/api';

// リクエスト型（既存のものを再エクスポート）
export type { UpdateExpenseRequest } from '@/types/api';

// レスポンス型
export type GetExpenseResponse = ApiResponse<Expense>;
export type UpdateExpenseResponse = ApiResponse<Expense>;
export type DeleteExpenseResponse = ApiResponse;

