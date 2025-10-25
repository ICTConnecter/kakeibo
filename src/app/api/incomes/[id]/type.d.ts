import { Income } from '@/types/firestore';
import { ApiResponse, UpdateIncomeRequest } from '@/types/api';

// リクエスト型（既存のものを再エクスポート）
export type { UpdateIncomeRequest } from '@/types/api';

// レスポンス型
export type GetIncomeResponse = ApiResponse<Income>;
export type UpdateIncomeResponse = ApiResponse<Income>;
export type DeleteIncomeResponse = ApiResponse;

