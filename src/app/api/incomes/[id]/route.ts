import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/utils/firebase/admin';
import { Income } from '@/types/firestore';
import { ApiResponse, UpdateIncomeRequest } from '@/types/api';

// 収入詳細取得
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const db = getAdminDb();
        
        const doc = await db.collection('incomes').doc(id).get();

        if (!doc.exists) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: '収入が見つかりません' },
                { status: 404 }
            );
        }

        const income: Income = {
            ...doc.data(),
            incomeId: doc.id,
        } as Income;

        return NextResponse.json<ApiResponse<Income>>(
            { success: true, data: income },
            { status: 200 }
        );
    } catch (error) {
        console.error('Get income error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: '収入の取得に失敗しました' },
            { status: 500 }
        );
    }
}

// 収入更新
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body: UpdateIncomeRequest = await request.json();
        
        const db = getAdminDb();
        const docRef = db.collection('incomes').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: '収入が見つかりません' },
                { status: 404 }
            );
        }

        // TODO: 認証ユーザー情報を取得
        const userId = 'temp-user-id';

        const updateData: Partial<Income> = {
            ...body,
            date: body.date ? new Date(body.date).getTime() : undefined,
            updatedAt: Date.now(),
            updatedBy: userId,
        };

        // undefinedのフィールドを削除
        Object.keys(updateData).forEach(key => {
            if (updateData[key as keyof Income] === undefined) {
                delete updateData[key as keyof Income];
            }
        });

        await docRef.update(updateData);

        const updatedDoc = await docRef.get();
        const income: Income = {
            ...updatedDoc.data(),
            incomeId: updatedDoc.id,
        } as Income;

        return NextResponse.json<ApiResponse<Income>>(
            {
                success: true,
                data: income,
                message: '収入を更新しました',
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Update income error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: '収入の更新に失敗しました' },
            { status: 500 }
        );
    }
}

// 収入削除
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const db = getAdminDb();
        const docRef = db.collection('incomes').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: '収入が見つかりません' },
                { status: 404 }
            );
        }

        await docRef.delete();

        return NextResponse.json<ApiResponse>(
            {
                success: true,
                message: '収入を削除しました',
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Delete income error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: '収入の削除に失敗しました' },
            { status: 500 }
        );
    }
}

