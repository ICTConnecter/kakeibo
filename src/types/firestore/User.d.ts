/** コレクション名：users
 * * userId：LINE User ID
 * * displayName：表示名
 * * householdIds：所属する家計簿ID一覧
 * * createdAt：作成日時
 * * updatedAt：更新日時
 */
export type User = {
    userId: string; // LINE User ID
    displayName: string;
    householdIds: string[]; // 所属する家計簿ID一覧
    createdAt: number;
    updatedAt: number;
}
