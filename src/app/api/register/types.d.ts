// 登録レスポンス型
export type RegisterResponse = {
    success: boolean;
    message: string;
    data?: {
        userId: string;
        householdId: string;
    };
    error?: string;
}