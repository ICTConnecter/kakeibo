/** コレクション名：expenseTypes
 * * expenseTypeId：経費タイプID
 * * householdId：所属する家計簿ID
 * * name：経費タイプ名
 * * icon：アイコン名
 * * color：カラーコード
 * * isDefault：デフォルト経費タイプか
 * * order：表示順
 * * createdAt：作成日時
 */

export type status = 'active' | 'deleted';
export type ExpenseType = {
    expenseTypeId: string;
    householdId: string; // 所属する家計簿ID
    name: string; // 経費タイプ名
    icon: string; // アイコン名
    color: string; // カラーコード
    isDefault: boolean; // デフォルト経費タイプか
    order: number; // 表示順
    createdAt: number;
    status: status; // ステータス
}

