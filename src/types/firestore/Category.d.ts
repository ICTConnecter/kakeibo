export type CategoryType = 'expense' | 'income';

export type Category = {
    categoryId: string;
    householdId: string; // 所属する家計簿ID
    type: CategoryType; // カテゴリタイプ: "expense" | "income"
    name: string; // カテゴリ名
    icon: string; // アイコン名
    color: string; // カラーコード
    isDefault: boolean; // デフォルトカテゴリか
    order: number; // 表示順
    createdAt: number;
}

