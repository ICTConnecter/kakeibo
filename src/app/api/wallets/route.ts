import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/utils/firebase/admin';
import { Wallet } from '@/types/firestore';
import { ApiResponse } from '@/types/api';

// ウォレット一覧取得
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
        const snapshot = await db.collection('wallets')
            .where('householdId', '==', householdId)
            .orderBy('order', 'asc')
            .get();

        const wallets: Wallet[] = [];
        snapshot.forEach((doc) => {
            wallets.push({ ...doc.data(), walletId: doc.id } as Wallet);
        });

        return NextResponse.json<ApiResponse<Wallet[]>>(
            { success: true, data: wallets },
            { status: 200 }
        );
    } catch (error) {
        console.error('Get wallets error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'ウォレットの取得に失敗しました' },
            { status: 500 }
        );
    }
}

// ウォレット登録
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
        const snapshot = await db.collection('wallets')
            .where('householdId', '==', householdId)
            .orderBy('order', 'desc')
            .limit(1)
            .get();

        let maxOrder = 0;
        if (!snapshot.empty) {
            maxOrder = (snapshot.docs[0].data() as Wallet).order;
        }

        const newWallet: Omit<Wallet, 'walletId'> = {
            householdId,
            name,
            icon,
            color,
            isDefault: false,
            order: maxOrder + 1,
            createdAt: Date.now(),
        };

        const docRef = await db.collection('wallets').add(newWallet);
        
        const wallet: Wallet = {
            ...newWallet,
            walletId: docRef.id,
        };

        return NextResponse.json<ApiResponse<Wallet>>(
            {
                success: true,
                data: wallet,
                message: 'ウォレットを作成しました',
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Create wallet error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'ウォレットの作成に失敗しました' },
            { status: 500 }
        );
    }
}

