export type Wallet = {
    walletId: string;
    householdId: string; // 所属する家計簿ID
    name: string; // ウォレット名
    icon: string; // アイコン名
    color: string; // カラーコード
    isDefault: boolean; // デフォルトウォレットか
    order: number; // 表示順
    createdAt: number;
}

