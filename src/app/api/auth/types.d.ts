// 認証レスポンス型
export type AuthResponse = {
    userId: string;
    displayName: string;
    householdIds: Household[];
    isRegistered: boolean;
    error?: string;
}