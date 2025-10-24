/** コレクション名：users
 * * userId：LINE User ID
 * * displayName：表示名
 * * pictureUrl：プロフィール画像URL
 * * email：メールアドレス
 * * createdAt：作成日時
 * * updatedAt：更新日時
 */
export type User = {
    userId: string; // LINE User ID
    displayName: string;
    pictureUrl: string;
    email: string;
    createdAt: number;
    updatedAt: number;
}
