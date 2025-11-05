/** コレクション名：wallets
 * * walletId：ウォレットID
 * * householdId：所属する家計簿ID
 * * name：ウォレット名
 * * icon：アイコン名
 * * color：カラーコード
 * * isDefault：デフォルトウォレットか
 * * order：表示順
 * * createdAt：作成日時
 */

export type status = 'active' | 'deleted';
export type Wallet = {
    walletId: string;
    householdId: string; // 所属する家計簿ID
    name: string; // ウォレット名
    icon: string; // アイコン名
    color: string; // カラーコード
    isDefault: boolean; // デフォルトウォレットか
    order: number; // 表示順
    createdAt: number;
    status: status; // ステータス
}

