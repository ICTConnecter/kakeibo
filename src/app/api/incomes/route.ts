import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/utils/firebase/admin';
import { Income } from '@/types/firestore';
import { ApiResponse, CreateIncomeRequest, GetIncomesResponse } from '@/types/api';

// 収入一覧取得
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const householdId = searchParams.get('householdId');

        if (!householdId) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'householdId is required' },
                { status: 400 }
            );
        }

        const db = getAdminDb();
        let query = db.collection('incomes')
            .where('householdId', '==', householdId);

        // フィルタ適用
        const categoryId = searchParams.get('categoryId');
        if (categoryId) {
            query = query.where('categoryId', '==', categoryId);
        }

        const walletId = searchParams.get('walletId');
        if (walletId) {
            query = query.where('walletId', '==', walletId);
        }

        // 日付範囲フィルタ
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        
        if (startDate) {
            query = query.where('date', '>=', new Date(startDate).getTime());
        }
        if (endDate) {
            query = query.where('date', '<=', new Date(endDate).getTime());
        }

        // ソート（新しい順）
        query = query.orderBy('date', 'desc');

        // ページネーション
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');
        
        query = query.limit(limit).offset(offset);

        const snapshot = await query.get();
        const incomes: Income[] = [];

        snapshot.forEach((doc) => {
            incomes.push({ ...doc.data(), incomeId: doc.id } as Income);
        });

        return NextResponse.json<ApiResponse<GetIncomesResponse>>(
            {
                success: true,
                data: {
                    incomes,
                    total: incomes.length,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Get incomes error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: '収入の取得に失敗しました' },
            { status: 500 }
        );
    }
}

// 収入登録
export async function POST(request: NextRequest) {
    try {
        const body: CreateIncomeRequest = await request.json();
        
        const { householdId, amount, date, source, categoryId, walletId, memo } = body;

        // バリデーション
        if (!householdId || !amount || !date || !source || !categoryId || !walletId) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: '必須項目が不足しています' },
                { status: 400 }
            );
        }

        const db = getAdminDb();
        const now = Date.now();
        
        // TODO: 認証ユーザー情報を取得（現在は仮のユーザーID）
        const userId = 'temp-user-id';

        const newIncome: Omit<Income, 'incomeId'> = {
            userId,
            householdId,
            amount,
            date: new Date(date).getTime(),
            source,
            categoryId,
            walletId,
            memo: memo || '',
            createdAt: now,
            updatedAt: now,
            createdBy: userId,
            updatedBy: userId,
        };

        const docRef = await db.collection('incomes').add(newIncome);
        
        const income: Income = {
            ...newIncome,
            incomeId: docRef.id,
        };

        return NextResponse.json<ApiResponse<Income>>(
            {
                success: true,
                data: income,
                message: '収入を登録しました',
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Create income error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: '収入の登録に失敗しました' },
            { status: 500 }
        );
    }
}

