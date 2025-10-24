// 月次レポートのレスポンス
export type MonthlyReport = {
    month: string; // YYYY-MM format
    totalIncome: number;
    totalExpense: number;
    balance: number; // 収支
    savingsRate: number; // 貯蓄率（%）
}

// カテゴリ別集計
export type CategorySummary = {
    categoryId: string;
    categoryName: string;
    amount: number;
    percentage: number; // 全体に対する割合（%）
    count: number; // 件数
}

// ウォレット別集計
export type WalletSummary = {
    walletId: string;
    walletName: string;
    income: number;
    expense: number;
    balance: number;
}

// 経費タイプ別集計
export type ExpenseTypeSummary = {
    expenseTypeId: string;
    expenseTypeName: string;
    amount: number;
    percentage: number;
    count: number;
}

// 月次推移データ
export type TrendData = {
    month: string; // YYYY-MM
    income: number;
    expense: number;
    balance: number;
}

// 収支バランス
export type BalanceReport = {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    savingsRate: number;
}

