/** コレクション名：categories
 * * categoryId：カテゴリID
 * * householdId：所属する家計簿ID
 * * type：カテゴリタイプ: "expense" | "income"
 * * name：カテゴリ名
 * * icon：アイコン名
 * * color：カラーコード
 * * order：表示順
 * * createdAt：作成日時
 */
export type CategoryType = 'expense' | 'income';

export type Category = {
    categoryId: string;
    householdId: string; // 所属する家計簿ID
    type: CategoryType; // カテゴリタイプ: "expense" | "income"
    name: string; // カテゴリ名
    icon: string; // アイコン名
    color: string; // カラーコード
    order: number; // 表示順
    createdAt: number;
}

