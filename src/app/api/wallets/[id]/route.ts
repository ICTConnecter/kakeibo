import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/utils/firebase/admin';
import { Wallet } from '@/types/firestore';
import { ApiResponse } from '@/types/api';

// ウォレット更新
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        
        const db = getAdminDb();
        const docRef = db.collection('wallets').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'ウォレットが見つかりません' },
                { status: 404 }
            );
        }

        const updateData: Partial<Wallet> = {
            ...body,
        };

        Object.keys(updateData).forEach(key => {
            if (updateData[key as keyof Wallet] === undefined) {
                delete updateData[key as keyof Wallet];
            }
        });

        await docRef.update(updateData);

        const updatedDoc = await docRef.get();
        const wallet: Wallet = {
            ...updatedDoc.data(),
            walletId: updatedDoc.id,
        } as Wallet;

        return NextResponse.json<ApiResponse<Wallet>>(
            {
                success: true,
                data: wallet,
                message: 'ウォレットを更新しました',
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Update wallet error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'ウォレットの更新に失敗しました' },
            { status: 500 }
        );
    }
}

// ウォレット削除
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const db = getAdminDb();
        const docRef = db.collection('wallets').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'ウォレットが見つかりません' },
                { status: 404 }
            );
        }

        const wallet = doc.data() as Wallet;

        if (wallet.isDefault) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'デフォルトウォレットは削除できません' },
                { status: 400 }
            );
        }

        await docRef.delete();

        return NextResponse.json<ApiResponse>(
            {
                success: true,
                message: 'ウォレットを削除しました',
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Delete wallet error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'ウォレットの削除に失敗しました' },
            { status: 500 }
        );
    }
}

