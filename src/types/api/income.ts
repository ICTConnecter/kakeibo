import { Income } from '../firestore';
import { DateRangeFilter } from './common';

// 収入作成用のリクエストボディ
export type CreateIncomeRequest = {
    householdId: string;
    amount: number;
    date: string; // ISO 8601 format
    source: string;
    categoryId: string;
    walletId: string;
    memo: string;
}

// 収入更新用のリクエストボディ
export type UpdateIncomeRequest = Partial<Omit<CreateIncomeRequest, 'householdId'>>;

// 収入一覧取得用のクエリパラメータ
export type GetIncomesQuery = DateRangeFilter & {
    householdId: string;
    categoryId?: string;
    walletId?: string;
    minAmount?: number;
    maxAmount?: number;
    keyword?: string;
    limit?: number;
    offset?: number;
}

// 収入一覧レスポンス
export type GetIncomesResponse = {
    incomes: Income[];
    total: number;
}

