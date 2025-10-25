import { NextResponse } from 'next/server';
import { getAdminDb } from '@/utils/firebase/admin';
import { decodeIdToken } from '@/utils/line/decodeIdToken';
import { User, Household, Category, Wallet, ExpenseType } from '@/types/firestore';
import { DEFAULT_CATEGORIES, DEFAULT_WALLETS, DEFAULT_EXPENSE_TYPES } from '@/utils/defaults';

export async function POST(request: Request) {
  try {
    // tokenの検証
    const header = request.headers;
    const idToken = header.get('Authorization')?.split(':')[1];
    if (!idToken) {
      return NextResponse.json({ error: 'Authorization header is required' }, { status: 401 });
    }
    const decodeResult = await decodeIdToken(idToken);

    const db = getAdminDb();
    const now = Date.now();
    const userId = decodeResult.sub;

    // 登録済みのデータかどうかの確認
    const userDoc = await db.collection('users').doc(userId).get();
    if (userDoc.exists) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // 1. Householdの作成（個人用家計簿）
    const householdData: Omit<Household, 'householdId'> = {
      name: `${decodeResult.name}の家計簿`,
      ownerId: userId,
      members: [
        {
          userId: userId,
          role: 'owner',
          joinedAt: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    const householdRef = await db.collection('households').add(householdData);
    const householdId = householdRef.id;

    // 2. Userの作成
    const userData: User = {
      userId: userId,
      displayName: decodeResult.name || '',
      householdIds: [householdId],
      createdAt: now,
      updatedAt: now,
    };

    await db.collection('users').doc(userId).set(userData);

    // 3. デフォルトカテゴリの作成
    const categoryPromises = DEFAULT_CATEGORIES.map((category) => {
      const categoryData: Omit<Category, 'categoryId'> = {
        ...category,
        householdId,
        createdAt: now,
      };
      return db.collection('categories').add(categoryData);
    });

    // 4. デフォルトウォレットの作成
    const walletPromises = DEFAULT_WALLETS.map((wallet) => {
      const walletData: Omit<Wallet, 'walletId'> = {
        ...wallet,
        householdId,
        createdAt: now,
      };
      return db.collection('wallets').add(walletData);
    });

    // 5. デフォルト経費タイプの作成
    const expenseTypePromises = DEFAULT_EXPENSE_TYPES.map((expenseType) => {
      const expenseTypeData: Omit<ExpenseType, 'expenseTypeId'> = {
        ...expenseType,
        householdId,
        createdAt: now,
      };
      return db.collection('expenseTypes').add(expenseTypeData);
    });

    // すべてのマスタデータを並列作成
    await Promise.all([
      ...categoryPromises,
      ...walletPromises,
      ...expenseTypePromises,
    ]);

    return NextResponse.json(
      {
        success: true,
        message: 'User registered successfully',
        data: {
          userId,
          householdId,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed', details: JSON.stringify(error) },
      { status: 500 }
    );
  }
}