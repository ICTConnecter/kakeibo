import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/utils/firebase/admin';
import { Expense } from '@/types/firestore';
import { ApiResponse, UpdateExpenseRequest } from '@/types/api';
import { deleteReceiptImage } from '@/utils/storage/cloudStorage';

// 支出詳細取得
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const db = getAdminDb();
        
        const doc = await db.collection('expenses').doc(id).get();

        if (!doc.exists) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: '支出が見つかりません' },
                { status: 404 }
            );
        }

        const expense: Expense = {
            ...doc.data(),
            expenseId: doc.id,
        } as Expense;

        return NextResponse.json<ApiResponse<Expense>>(
            { success: true, data: expense },
            { status: 200 }
        );
    } catch (error) {
        console.error('Get expense error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: '支出の取得に失敗しました' },
            { status: 500 }
        );
    }
}

// 支出更新
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body: UpdateExpenseRequest = await request.json();

        const db = getAdminDb();
        const docRef = db.collection('expenses').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: '支出が見つかりません' },
                { status: 404 }
            );
        }

        // Validate items total matches amount if items are provided
        if (body.items && body.items.length > 0 && body.amount !== undefined) {
            const itemsTotal = body.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            if (itemsTotal !== body.amount) {
                return NextResponse.json<ApiResponse>(
                    { success: false, error: `金額の不一致: 合計金額 (¥${body.amount}) が商品明細の合計 (¥${itemsTotal}) と一致しません` },
                    { status: 400 }
                );
            }
        }

        // TODO: 認証ユーザー情報を取得
        const userId = 'temp-user-id';

        // receiptImageUrlを除外してupdateDataを作成
        const { receiptImageUrl: _, receiptImageData: __, ...bodyWithoutImages } = body;

        const updateData: Partial<Expense> = {
            ...bodyWithoutImages,
            date: body.date ? new Date(body.date).getTime() : undefined,
            updatedAt: Date.now(),
            updatedBy: userId,
        };

        // receiptImageUrlがstringの場合は配列に変換（後方互換性のため）
        if (body.receiptImageUrl && typeof body.receiptImageUrl === 'string') {
            updateData.receiptImageUrl = [body.receiptImageUrl];
        }

        // undefinedのフィールドを削除
        Object.keys(updateData).forEach(key => {
            if (updateData[key as keyof Expense] === undefined) {
                delete updateData[key as keyof Expense];
            }
        });

        await docRef.update(updateData);

        const updatedDoc = await docRef.get();
        const expense: Expense = {
            ...updatedDoc.data(),
            expenseId: updatedDoc.id,
        } as Expense;

        return NextResponse.json<ApiResponse<Expense>>(
            {
                success: true,
                data: expense,
                message: '支出を更新しました',
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Update expense error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: '支出の更新に失敗しました' },
            { status: 500 }
        );
    }
}

// 支出削除
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const db = getAdminDb();
        const docRef = db.collection('expenses').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: '支出が見つかりません' },
                { status: 404 }
            );
        }

        const expense = doc.data() as Expense;

        // レシート画像を削除（複数画像対応）
        if (expense.receiptImageUrl && expense.receiptImageUrl.length > 0) {
            console.log(`Deleting ${expense.receiptImageUrl.length} receipt images for expense ${id}`);
            for (const imageUrl of expense.receiptImageUrl) {
                console.log('Deleting image URL:', imageUrl);
                await deleteReceiptImage(imageUrl);
            }
        } else {
            console.log('No receipt images to delete for expense', id);
        }

        // Firestoreから削除
        await docRef.delete();

        return NextResponse.json<ApiResponse>(
            {
                success: true,
                message: '支出を削除しました',
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Delete expense error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: '支出の削除に失敗しました' },
            { status: 500 }
        );
    }
}

