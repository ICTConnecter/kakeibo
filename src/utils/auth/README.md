# 認証モジュール

他のAPIエンドポイントで認証処理を簡単に利用できるようにモジュール化しました。

## 提供する関数

### `authenticateUser(idToken: string): Promise<AuthenticatedUser>`

idTokenからユーザー情報を取得します。

**引数:**
- `idToken`: LINE IDトークン

**返り値:**
```typescript
{
  userId: string;
  displayName: string;
  households: Household[];
  householdIds: string[];
}
```

**エラー:**
- ユーザーが見つからない場合: `'登録情報が見当たりませんでした。'`
- トークンが無効な場合: デコードエラー

### `getTokenFromRequest(request: NextRequest): string`

NextRequestからAuthorizationヘッダーのトークンを取得します。

**引数:**
- `request`: NextRequest オブジェクト

**返り値:**
- トークン文字列

**エラー:**
- トークンが見つからない場合: `'Tokenが設定されていません。'`

## 使用例

### 基本的な使い方

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, getTokenFromRequest } from '@/utils/auth';
import { ApiResponse } from '@/types/api';

export async function GET(request: NextRequest) {
  try {
    // 1. トークン取得
    const token = getTokenFromRequest(request);
    
    // 2. 認証
    const user = await authenticateUser(token);
    
    // 3. ユーザー情報を利用してビジネスロジックを実行
    console.log('User ID:', user.userId);
    console.log('Households:', user.householdIds);
    
    // ...ビジネスロジック...
    
    return NextResponse.json<ApiResponse>(
      { success: true, data: { /* ... */ } },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      // トークンが見つからない
      if (error.message === 'Tokenが設定されていません。') {
        return NextResponse.json<ApiResponse>(
          { success: false, error: error.message },
          { status: 400 }
        );
      }
      
      // ユーザーが見つからない
      if (error.message === '登録情報が見当たりませんでした。') {
        return NextResponse.json<ApiResponse>(
          { success: false, error: error.message },
          { status: 401 }
        );
      }
    }
    
    // その他のエラー
    return NextResponse.json<ApiResponse>(
      { success: false, error: '認証に失敗しました' },
      { status: 500 }
    );
  }
}
```

### POSTリクエストでの使用例

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, getTokenFromRequest } from '@/utils/auth';
import { ApiResponse } from '@/types/api';

export async function POST(request: NextRequest) {
  try {
    // 認証
    const token = getTokenFromRequest(request);
    const user = await authenticateUser(token);
    
    // リクエストボディ取得
    const body = await request.json();
    const { householdId, amount, date } = body;
    
    // householdIdがユーザーの所属する家計簿かチェック
    if (!user.householdIds.includes(householdId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'この家計簿へのアクセス権限がありません' },
        { status: 403 }
      );
    }
    
    // ...データ登録処理...
    
    return NextResponse.json<ApiResponse>(
      { success: true, message: '登録しました' },
      { status: 201 }
    );
  } catch (error) {
    // エラーハンドリング
    // ...
  }
}
```

### 簡潔な書き方

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, getTokenFromRequest } from '@/utils/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateUser(getTokenFromRequest(request));
    
    // user.userId, user.householdIds などを使用
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '認証エラー' },
      { status: 401 }
    );
  }
}
```

## エラーハンドリングのベストプラクティス

エラーメッセージで分岐してステータスコードを返すことを推奨します：

| エラーメッセージ | HTTPステータス | 意味 |
|-----------------|---------------|------|
| `Tokenが設定されていません。` | 400 | トークンがリクエストに含まれていない |
| `登録情報が見当たりませんでした。` | 401 | ユーザーが未登録 |
| その他のデコードエラー | 401 | トークンが無効 |
| その他のエラー | 500 | サーバーエラー |

