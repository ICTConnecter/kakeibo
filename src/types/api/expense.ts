import { Expense, ExpenseItem } from '../firestore';
import { DateRangeFilter } from './common';

// 支出作成用のリクエストボディ
export type CreateExpenseRequest = {
    householdId: string;
    amount: number;
    date: string; // ISO 8601 format
    storeName: string;
    categoryId: string;
    walletId: string;
    expenseTypeId: string | null;
    items: ExpenseItem[];
    memo: string;
    receiptImageUrl?: string;
}

// 支出更新用のリクエストボディ
export type UpdateExpenseRequest = Partial<Omit<CreateExpenseRequest, 'householdId'>>;

// 支出一覧取得用のクエリパラメータ
export type GetExpensesQuery = DateRangeFilter & {
    householdId: string;
    categoryId?: string;
    walletId?: string;
    expenseTypeId?: string;
    minAmount?: number;
    maxAmount?: number;
    keyword?: string;
    limit?: number;
    offset?: number;
}

// 支出一覧レスポンス
export type GetExpensesResponse = {
    expenses: Expense[];
    total: number;
}

