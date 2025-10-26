import { getAdminDb } from '@/utils/firebase/admin';
import { decodeIdToken } from '@/utils/line/decodeIdToken';
import { User } from '@/types/firestore';

export type AuthenticatedUser = {
    userId: string;
    displayName: string;
    householdIds: string[];
};

/**
 * idTokenからユーザー情報を取得する
 * @param idToken - LINE IDトークン
 * @returns 認証されたユーザー情報
 * @throws ユーザーが見つからない場合やトークンが無効な場合はエラーをthrow
 */
export async function authenticateUser(idToken: string): Promise<AuthenticatedUser> {
    // Tokenのdecode
    const tokenDecodeResult = await decodeIdToken(idToken);
    const userId = tokenDecodeResult.sub;

    const db = getAdminDb();

    // ユーザー情報の取得
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
        throw new Error('登録情報が見当たりませんでした。');
    }

    const userData = userDoc.data() as User;

    return {
        userId: userData.userId,
        displayName: userData.displayName,
        householdIds: userData.householdIds || [],
    };
}

