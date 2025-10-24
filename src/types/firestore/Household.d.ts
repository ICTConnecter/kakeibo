/** 家計簿メンバー情報
 * * userId：ユーザーID
 * * role：役割（owner：オーナー、editor：編集者、viewer：閲覧者）
 * * joinedAt：参加日時
 */
export type HouseholdMember = {
    userId: string;
    role: 'owner' | 'editor' | 'viewer';
    joinedAt: number;
}

/** コレクション名：households
 * * householdId：家計簿ID
 * * name：家計簿名
 * * ownerId：オーナーのユーザーID
 * * members：メンバー一覧
 * * createdAt：作成日時
 * * updatedAt：更新日時
 */
export type Household = {
    householdId: string;
    name: string; // 家計簿名
    ownerId: string; // オーナーのユーザーID
    members: HouseholdMember[]; // メンバー一覧
    createdAt: number;
    updatedAt: number;
}

