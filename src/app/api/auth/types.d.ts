import { Household } from '@/types/firestore';

// 認証レスポンス型
export type AuthResponse = {
    userId: string;
    displayName: string;
    households: Household[];
    isRegistered: boolean;
    error?: string;
}