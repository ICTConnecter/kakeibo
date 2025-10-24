import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/utils/firebase/admin';
import { Category, CategoryType } from '@/types/firestore';
import { ApiResponse } from '@/types/api';

// カテゴリ一覧取得
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const householdId = searchParams.get('householdId');
        const type = searchParams.get('type') as CategoryType | null;

        if (!householdId) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'householdId is required' },
                { status: 400 }
            );
        }

        const db = getAdminDb();
        let query = db.collection('categories')
            .where('householdId', '==', householdId);

        // タイプフィルタ
        if (type) {
            query = query.where('type', '==', type);
        }

        // 表示順でソート
        query = query.orderBy('order', 'asc');

        const snapshot = await query.get();
        const categories: Category[] = [];

        snapshot.forEach((doc) => {
            categories.push({ ...doc.data(), categoryId: doc.id } as Category);
        });

        return NextResponse.json<ApiResponse<Category[]>>(
            { success: true, data: categories },
            { status: 200 }
        );
    } catch (error) {
        console.error('Get categories error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'カテゴリの取得に失敗しました' },
            { status: 500 }
        );
    }
}

// カテゴリ登録
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { householdId, type, name, icon, color } = body;

        if (!householdId || !type || !name || !icon || !color) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: '必須項目が不足しています' },
                { status: 400 }
            );
        }

        const db = getAdminDb();
        
        // 最大orderを取得
        const snapshot = await db.collection('categories')
            .where('householdId', '==', householdId)
            .where('type', '==', type)
            .orderBy('order', 'desc')
            .limit(1)
            .get();

        let maxOrder = 0;
        if (!snapshot.empty) {
            maxOrder = (snapshot.docs[0].data() as Category).order;
        }

        const newCategory: Omit<Category, 'categoryId'> = {
            householdId,
            type,
            name,
            icon,
            color,
            isDefault: false,
            order: maxOrder + 1,
            createdAt: Date.now(),
        };

        const docRef = await db.collection('categories').add(newCategory);
        
        const category: Category = {
            ...newCategory,
            categoryId: docRef.id,
        };

        return NextResponse.json<ApiResponse<Category>>(
            {
                success: true,
                data: category,
                message: 'カテゴリを作成しました',
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Create category error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'カテゴリの作成に失敗しました' },
            { status: 500 }
        );
    }
}

