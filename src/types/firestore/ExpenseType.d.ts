export type ExpenseType = {
    expenseTypeId: string;
    householdId: string; // 所属する家計簿ID
    name: string; // 経費タイプ名
    icon: string; // アイコン名
    color: string; // カラーコード
    isDefault: boolean; // デフォルト経費タイプか
    order: number; // 表示順
    createdAt: number;
}

