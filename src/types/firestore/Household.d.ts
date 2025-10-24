export type HouseholdMember = {
    userId: string;
    role: 'owner' | 'editor' | 'viewer';
    joinedAt: number;
}

export type Household = {
    householdId: string;
    name: string; // 家計簿名
    ownerId: string; // オーナーのユーザーID
    members: HouseholdMember[]; // メンバー一覧
    createdAt: number;
    updatedAt: number;
}

