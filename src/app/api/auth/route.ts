import { NextResponse, NextRequest } from 'next/server';
import { AuthResponse } from './types';
import { authenticateUser, getTokenFromRequest } from '@/utils/auth';
import { Household } from '@/types/firestore';
import { getAdminDb } from '@/utils/firebase/admin';

export async function GET(req: NextRequest) {
  try {
    // Tokenの取得
    const token = getTokenFromRequest(req);
    console.log("token", token);
    
    // 認証処理（モジュール化）
    const user = await authenticateUser(token);

    const households: Household[] = [];
    for (const householdId of user.householdIds) {
      const household = await getAdminDb().collection('households').doc(householdId).get();
      if (household.exists) {
        households.push(household.data() as Household);
      }
    }

    // レスポンスデータ
    const data: AuthResponse = {
      userId: user.userId,
      displayName: user.displayName,
      households: households,
      isRegistered: true,
    };

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Auth error:', error);
    
    // トークンが見つからない場合
    if (error instanceof Error && error.message === 'Tokenが設定されていません。') {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    // ユーザーが見つからない場合
    if (error instanceof Error && error.message === '登録情報が見当たりませんでした。') {
      return NextResponse.json(
        { 
          error: error.message,
          isRegistered: false
        },
        { status: 401 }
      );
    }
    
    // その他のエラー
    return NextResponse.json(
      { error: 'Authentication failed', details: JSON.stringify(error) },
      { status: 500 }
    );
  }
}