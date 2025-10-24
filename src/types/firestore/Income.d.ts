/** コレクション名：incomes
 * * incomeId：収入ID
 * * userId：作成者のユーザーID
 * * householdId：家計簿グループID
 * * amount：金額
 * * date：受取日時（タイムスタンプ）
 * * source：収入源
 * * categoryId：収入カテゴリID
 * * walletId：入金先ウォレットID
 * * memo：メモ
 * * createdAt：作成日時
 * * updatedAt：更新日時
 * * createdBy：作成者ユーザーID
 * * updatedBy：最終更新者ユーザーID
 */
export type Income = {
    incomeId: string;
    userId: string; // 作成者のユーザーID
    householdId: string; // 家計簿グループID
    amount: number; // 金額
    date: number; // 受取日時（タイムスタンプ）
    source: string; // 収入源
    categoryId: string;  
    walletId: string; // 入金先ウォレットID
    memo: string; // メモ
    createdAt: number;
    updatedAt: number;
    createdBy: string; // 作成者ユーザーID
    updatedBy: string; // 最終更新者ユーザーID
}

