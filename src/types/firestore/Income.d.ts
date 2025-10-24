export type Income = {
    incomeId: string;
    userId: string; // 作成者のユーザーID
    householdId: string; // 家計簿グループID
    amount: number; // 金額
    date: number; // 受取日時（タイムスタンプ）
    source: string; // 収入源
    categoryId: string; // 収入カテゴリID
    walletId: string; // 入金先ウォレットID
    memo: string; // メモ
    createdAt: number;
    updatedAt: number;
    createdBy: string; // 作成者ユーザーID
    updatedBy: string; // 最終更新者ユーザーID
}

