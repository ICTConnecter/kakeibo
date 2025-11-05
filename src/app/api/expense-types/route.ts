import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/utils/firebase/admin';
import { ExpenseType } from '@/types/firestore';
import { ApiResponse } from '@/types/api';

// 経費タイプ一覧取得
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const householdId = searchParams.get('householdId');
        const includeDeleted = searchParams.get('includeDeleted') === 'true';

        if (!householdId) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'householdId is required' },
                { status: 400 }
            );
        }

        const db = getAdminDb();
        let query = db.collection('expenseTypes')
            .where('householdId', '==', householdId);

        // 削除済みを含めるかどうか
        if (!includeDeleted) {
            query = query.where('status', '==', 'active');
        }

        const snapshot = await query
            .orderBy('order', 'asc')
            .get();

        const expenseTypes: ExpenseType[] = [];
        snapshot.forEach((doc) => {
            expenseTypes.push({ ...doc.data(), expenseTypeId: doc.id } as ExpenseType);
        });

        return NextResponse.json<ApiResponse<ExpenseType[]>>(
            { success: true, data: expenseTypes },
            { status: 200 }
        );
    } catch (error) {
        console.error('Get expense types error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: '経費タイプの取得に失敗しました' },
            { status: 500 }
        );
    }
}

// 経費タイプ登録
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { householdId, name, icon, color } = body;

        if (!householdId || !name || !icon || !color) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: '必須項目が不足しています' },
                { status: 400 }
            );
        }

        const db = getAdminDb();

        // 最大orderを取得
        const snapshot = await db.collection('expenseTypes')
            .where('householdId', '==', householdId)
            .orderBy('order', 'desc')
            .limit(1)
            .get();

        let maxOrder = 0;
        if (!snapshot.empty) {
            maxOrder = (snapshot.docs[0].data() as ExpenseType).order;
        }

        const newExpenseType: Omit<ExpenseType, 'expenseTypeId'> = {
            householdId,
            name,
            icon,
            color,
            isDefault: false,
            order: maxOrder + 1,
            createdAt: Date.now(),
            status: 'active',
        };

        const docRef = await db.collection('expenseTypes').add(newExpenseType);
        
        const expenseType: ExpenseType = {
            ...newExpenseType,
            expenseTypeId: docRef.id,
        };

        return NextResponse.json<ApiResponse<ExpenseType>>(
            {
                success: true,
                data: expenseType,
                message: '経費タイプを作成しました',
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Create expense type error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: '経費タイプの作成に失敗しました' },
            { status: 500 }
        );
    }
}

