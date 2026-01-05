import { NextResponse } from 'next/server';
import { getAdminDb } from '@/utils/firebase/admin';
import { decodeIdToken } from '@/utils/line/decodeIdToken';
import { Household } from '@/types/firestore';

// 招待情報を取得
export async function GET(request: Request) {
    try {
        // tokenの検証
        const header = request.headers;
        const idToken = header.get('Authorization')?.split(':')[1];
        if (!idToken) {
            return NextResponse.json({ error: 'Authorization header is required' }, { status: 401 });
        }
        const decodeResult = await decodeIdToken(idToken);
        const userId = decodeResult.sub;

        // クエリパラメータからhouseholdIdを取得
        const { searchParams } = new URL(request.url);
        const householdId = searchParams.get('householdId');

        if (!householdId) {
            return NextResponse.json({ error: 'householdId is required' }, { status: 400 });
        }

        const db = getAdminDb();

        // 家計簿情報を取得
        const householdDoc = await db.collection('households').doc(householdId).get();
        if (!householdDoc.exists) {
            return NextResponse.json({ error: '家計簿が見つかりません' }, { status: 404 });
        }

        const householdData = householdDoc.data() as Omit<Household, 'householdId'>;

        // ユーザーが登録済みか確認
        const userDoc = await db.collection('users').doc(userId).get();
        const needsRegistration = !userDoc.exists;

        // 既にメンバーかどうかを確認
        const alreadyMember = !needsRegistration && householdData.members.some(member => member.userId === userId);

        return NextResponse.json({
            success: true,
            data: {
                householdName: householdData.name,
                alreadyMember,
                needsRegistration,
            },
        });
    } catch (error) {
        console.error('招待情報取得エラー:', error);
        return NextResponse.json(
            { error: '招待情報の取得に失敗しました' },
            { status: 500 }
        );
    }
}

// 家計簿に参加
export async function POST(request: Request) {
    try {
        // tokenの検証
        const header = request.headers;
        const idToken = header.get('Authorization')?.split(':')[1];
        if (!idToken) {
            return NextResponse.json({ error: 'Authorization header is required' }, { status: 401 });
        }
        const decodeResult = await decodeIdToken(idToken);
        const userId = decodeResult.sub;

        // リクエストボディからhouseholdIdを取得
        const body = await request.json();
        const { householdId } = body;

        if (!householdId) {
            return NextResponse.json({ error: 'householdId is required' }, { status: 400 });
        }

        const db = getAdminDb();
        const now = Date.now();

        // 家計簿情報を取得
        const householdRef = db.collection('households').doc(householdId);
        const householdDoc = await householdRef.get();
        if (!householdDoc.exists) {
            return NextResponse.json({ error: '家計簿が見つかりません' }, { status: 404 });
        }

        const householdData = householdDoc.data() as Omit<Household, 'householdId'>;

        // 既にメンバーかどうかを確認
        if (householdData.members.some(member => member.userId === userId)) {
            return NextResponse.json({ error: '既にこの家計簿のメンバーです' }, { status: 400 });
        }

        // ユーザー情報を取得
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 });
        }

        // トランザクションで更新
        await db.runTransaction(async (transaction) => {
            // 家計簿にメンバーを追加
            const updatedMembers = [
                ...householdData.members,
                {
                    userId,
                    role: 'editor' as const,
                    joinedAt: now,
                },
            ];
            transaction.update(householdRef, {
                members: updatedMembers,
                updatedAt: now,
            });

            // ユーザーのhouseholdIdsに追加
            const userData = userDoc.data();
            const currentHouseholdIds = userData?.householdIds || [];
            if (!currentHouseholdIds.includes(householdId)) {
                transaction.update(userRef, {
                    householdIds: [...currentHouseholdIds, householdId],
                    updatedAt: now,
                });
            }
        });

        return NextResponse.json({
            success: true,
            message: '家計簿に参加しました',
            data: {
                householdId,
                householdName: householdData.name,
            },
        });
    } catch (error) {
        console.error('参加エラー:', error);
        return NextResponse.json(
            { error: '参加に失敗しました' },
            { status: 500 }
        );
    }
}
