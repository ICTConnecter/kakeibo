import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/utils/firebase/admin';
import { ExpenseType } from '@/types/firestore';
import { ApiResponse } from '@/types/api';

// 経費タイプ更新
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        
        const db = getAdminDb();
        const docRef = db.collection('expenseTypes').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: '経費タイプが見つかりません' },
                { status: 404 }
            );
        }

        const updateData: Partial<ExpenseType> = {
            ...body,
        };

        Object.keys(updateData).forEach(key => {
            if (updateData[key as keyof ExpenseType] === undefined) {
                delete updateData[key as keyof ExpenseType];
            }
        });

        await docRef.update(updateData);

        const updatedDoc = await docRef.get();
        const expenseType: ExpenseType = {
            ...updatedDoc.data(),
            expenseTypeId: updatedDoc.id,
        } as ExpenseType;

        return NextResponse.json<ApiResponse<ExpenseType>>(
            {
                success: true,
                data: expenseType,
                message: '経費タイプを更新しました',
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Update expense type error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: '経費タイプの更新に失敗しました' },
            { status: 500 }
        );
    }
}

// 経費タイプ削除
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const db = getAdminDb();
        const docRef = db.collection('expenseTypes').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: '経費タイプが見つかりません' },
                { status: 404 }
            );
        }

        const expenseType = doc.data() as ExpenseType;

        if (expenseType.isDefault) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'デフォルト経費タイプは削除できません' },
                { status: 400 }
            );
        }

        await docRef.delete();

        return NextResponse.json<ApiResponse>(
            {
                success: true,
                message: '経費タイプを削除しました',
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Delete expense type error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: '経費タイプの削除に失敗しました' },
            { status: 500 }
        );
    }
}

