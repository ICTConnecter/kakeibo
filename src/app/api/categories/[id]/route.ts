import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/utils/firebase/admin';
import { Category } from '@/types/firestore';
import { ApiResponse } from '@/types/api';

// カテゴリ更新
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        
        const db = getAdminDb();
        const docRef = db.collection('categories').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'カテゴリが見つかりません' },
                { status: 404 }
            );
        }

        const updateData: Partial<Category> = {
            ...body,
        };

        // undefinedのフィールドを削除
        Object.keys(updateData).forEach(key => {
            if (updateData[key as keyof Category] === undefined) {
                delete updateData[key as keyof Category];
            }
        });

        await docRef.update(updateData);

        const updatedDoc = await docRef.get();
        const category: Category = {
            ...updatedDoc.data(),
            categoryId: updatedDoc.id,
        } as Category;

        return NextResponse.json<ApiResponse<Category>>(
            {
                success: true,
                data: category,
                message: 'カテゴリを更新しました',
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Update category error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'カテゴリの更新に失敗しました' },
            { status: 500 }
        );
    }
}

// カテゴリ削除（論理削除）
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const db = getAdminDb();
        const docRef = db.collection('categories').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'カテゴリが見つかりません' },
                { status: 404 }
            );
        }

        const category = doc.data() as Category;

        // 論理削除: statusを'deleted'に変更
        await docRef.update({ status: 'deleted' });

        return NextResponse.json<ApiResponse>(
            {
                success: true,
                message: 'カテゴリを削除しました',
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Delete category error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'カテゴリの削除に失敗しました' },
            { status: 500 }
        );
    }
}

