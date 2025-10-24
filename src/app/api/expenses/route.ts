import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/utils/firebase/admin';
import { Expense } from '@/types/firestore';
import { ApiResponse, CreateExpenseRequest, GetExpensesResponse, GetExpensesQuery } from '@/types/api';

// 支出一覧取得
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
        let query = db.collection('expenses')
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

        const expenseTypeId = searchParams.get('expenseTypeId');
        if (expenseTypeId) {
            query = query.where('expenseTypeId', '==', expenseTypeId);
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
        const expenses: Expense[] = [];

        snapshot.forEach((doc) => {
            expenses.push({ ...doc.data(), expenseId: doc.id } as Expense);
        });

        return NextResponse.json<ApiResponse<GetExpensesResponse>>(
            {
                success: true,
                data: {
                    expenses,
                    total: expenses.length,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Get expenses error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: '支出の取得に失敗しました' },
            { status: 500 }
        );
    }
}

// 支出登録
export async function POST(request: NextRequest) {
    try {
        const body: CreateExpenseRequest = await request.json();
        
        const { householdId, amount, date, storeName, categoryId, walletId, expenseTypeId, items, memo, receiptImageUrl } = body;

        // バリデーション
        if (!householdId || !amount || !date || !storeName || !categoryId || !walletId) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: '必須項目が不足しています' },
                { status: 400 }
            );
        }

        const db = getAdminDb();
        const now = Date.now();
        
        // TODO: 認証ユーザー情報を取得（現在は仮のユーザーID）
        const userId = 'temp-user-id';

        const newExpense: Omit<Expense, 'expenseId'> = {
            userId,
            householdId,
            amount,
            date: new Date(date).getTime(),
            storeName,
            categoryId,
            walletId,
            expenseTypeId: expenseTypeId || null,
            items: items || [],
            memo: memo || '',
            receiptImageUrl: receiptImageUrl || '',
            createdAt: now,
            updatedAt: now,
            createdBy: userId,
            updatedBy: userId,
        };

        const docRef = await db.collection('expenses').add(newExpense);
        
        const expense: Expense = {
            ...newExpense,
            expenseId: docRef.id,
        };

        return NextResponse.json<ApiResponse<Expense>>(
            {
                success: true,
                data: expense,
                message: '支出を登録しました',
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Create expense error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: '支出の登録に失敗しました' },
            { status: 500 }
        );
    }
}

