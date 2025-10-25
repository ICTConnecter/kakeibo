import { NextResponse, NextRequest } from 'next/server';
import { getAdminDb } from '@/utils/firebase/admin';
import { decodeIdToken } from '@/utils/line/decodeIdToken';
import { AuthResponse } from './types';
import { User, Household } from '@/types/firestore';

export async function GET(req: NextRequest) {
  try {
    // Tokenの取得
    const token = req.headers.get('Authorization')?.split(':')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'Tokenが設定されていません。' },
        { status: 400 }
      );
    }

    console.log("token", token);
    // Tokenのdecode
    const tokenDecodeResult = await decodeIdToken(token);
    const userId = tokenDecodeResult.sub;

    const db = getAdminDb();

    // ユーザー情報の取得
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      // 登録情報が無かった場合
      return NextResponse.json(
        { 
          error: '登録情報が見当たりませんでした。',
          isRegistered: false
        },
        { status: 401 }
      );
    }

    const userData = userDoc.data() as User;

    // ユーザーが所属するすべてのHousehold情報を取得
    const households: Household[] = [];
    
    if (userData.householdIds && userData.householdIds.length > 0) {
      for (const householdId of userData.householdIds) {
        const householdDoc = await db.collection('households').doc(householdId).get();
        
        if (householdDoc.exists) {
          const householdData = householdDoc.data();
          households.push({
            householdId: householdDoc.id,
            name: householdData?.name || '',
            ownerId: householdData?.ownerId || '',
            members: householdData?.members || [],
            createdAt: householdData?.createdAt || 0,
            updatedAt: householdData?.updatedAt || 0,
          } as Household);
        }
      }
    }

    // レスポンスデータ
    const data: AuthResponse = {
      userId: userData.userId,
      displayName: userData.displayName,
      householdIds: households,
      isRegistered: true,
    };

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed', details: JSON.stringify(error) },
      { status: 500 }
    );
  }
}