export type ExpenseItem = {
    name: string;
    price: number;
    quantity: number;
}

export type Expense = {
    expenseId: string;
    userId: string; // 作成者のユーザーID
    householdId: string; // 家計簿グループID
    amount: number; // 金額
    date: number; // 使用日時（タイムスタンプ）
    storeName: string; // 店舗名
    categoryId: string; // 支出カテゴリID
    walletId: string; // ウォレットID
    expenseTypeId: string | null; // 経費タイプID（null許容）
    items: ExpenseItem[]; // 商品明細
    memo: string; // メモ
    receiptImageUrl: string; // レシート画像URL（GCP Cloud Storage）
    createdAt: number;
    updatedAt: number;
    createdBy: string; // 作成者ユーザーID
    updatedBy: string; // 最終更新者ユーザーID
}

