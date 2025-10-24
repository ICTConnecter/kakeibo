import { NextResponse, NextRequest } from 'next/server';
import { getAdminDb } from '@/utils/firebase/admin';
import { decodeIdToken } from '@/utils/line/decodeIdToken';
import { AuthResponse } from './types';
import { User } from '@/types/firestore';

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

    // ユーザーが所属するHouseholdを取得
    // ownerIdで検索（初回登録時は必ずownerになる）
    const householdsSnapshot = await db
      .collection('households')
      .where('ownerId', '==', userId)
      .limit(1)
      .get();

    let householdId = '';
    if (!householdsSnapshot.empty) {
      householdId = householdsSnapshot.docs[0].id;
    } else {
      // ownerでない場合はmembersから検索（共有されている場合）
      const allHouseholdsSnapshot = await db.collection('households').get();
      for (const doc of allHouseholdsSnapshot.docs) {
        const household = doc.data();
        if (household.members && Array.isArray(household.members)) {
          const isMember = household.members.some((member: any) => member.userId === userId);
          if (isMember) {
            householdId = doc.id;
            break;
          }
        }
      }
    }

    // レスポンスデータ
    const data: AuthResponse = {
      userId: userData.userId,
      displayName: userData.displayName,
      pictureUrl: userData.pictureUrl,
      email: userData.email,
      householdId: householdId,
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