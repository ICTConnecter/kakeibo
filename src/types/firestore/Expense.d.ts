/** 商品明細アイテム
 * * name：商品名
 * * price：単価
 * * quantity：数量
 */
export type ExpenseItem = {
    name: string;
    price: number;
    quantity: number;
}

/** コレクション名：expenses
 * * expenseId：支出ID
 * * userId：作成者のユーザーID
 * * householdId：家計簿グループID
 * * amount：金額
 * * date：使用日時（タイムスタンプ）
 * * storeName：店舗名
 * * categoryId：支出カテゴリID
 * * walletId：ウォレットID
 * * expenseTypeId：経費タイプID（null許容）
 * * items：商品明細
 * * memo：メモ
 * * receiptImageUrl：レシート画像URL（GCP Cloud Storage）
 * * createdAt：作成日時
 * * updatedAt：更新日時
 * * createdBy：作成者ユーザーID
 * * updatedBy：最終更新者ユーザーID
 */
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

