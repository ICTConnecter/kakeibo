// 認証レスポンス型
export type AuthResponse = {
    userId: string;
    displayName: string;
    pictureUrl: string;
    email: string;
    householdId: string;
    isRegistered: boolean;
    error?: string;
}