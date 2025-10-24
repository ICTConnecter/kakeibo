# AI家計簿システム - セットアップガイド

## 🔧 必要な準備

### 1. Firebaseプロジェクトの作成

1. **Firebase Consoleにアクセス**
   - https://console.firebase.google.com/ にアクセス
   - 「プロジェクトを追加」をクリック

2. **Firestoreの有効化**
   - 「Firestore Database」を選択
   - 「データベースを作成」
   - 本番モードで開始

3. **Firebase Storageの有効化**
   - 「Storage」を選択
   - 「始める」をクリック
   - セキュリティルールは後で設定

4. **Firebase設定情報の取得**
   - プロジェクト設定（⚙️マーク）
   - 「全般」タブ
   - 「マイアプリ」→ Webアプリを追加
   - 表示される設定情報をコピー

5. **Firebase Admin SDKの設定**
   - プロジェクト設定 → 「サービスアカウント」
   - 「新しい秘密鍵の生成」をクリック
   - JSONファイルをダウンロード

---

### 2. LINE LIFF の作成

1. **LINE Developers Consoleにアクセス**
   - https://developers.line.biz/console/
   - LINEアカウントでログイン

2. **プロバイダーを作成**
   - 「作成」をクリック
   - プロバイダー名を入力

3. **チャネルを作成**
   - 「LINEログイン」を選択
   - チャネル基本設定を入力

4. **LIFFアプリを追加**
   - 「LIFF」タブ
   - 「追加」をクリック
   - LIFF設定:
     - LIFFアプリ名: AI家計簿
     - サイズ: Full
     - エンドポイントURL: http://localhost:3000 (開発時)
     - Scope: profile, openid, email
   - LIFF IDをコピー

---

### 3. Google AI Studio（Gemini API）の設定

1. **Google AI Studioにアクセス**
   - https://aistudio.google.com/
   - Googleアカウントでログイン

2. **APIキーを作成**
   - 「Get API key」をクリック
   - 「Create API key」
   - 既存のGCPプロジェクトを選択または新規作成
   - APIキーをコピー

**料金について:**
- Gemini 1.5 Flashは無料枠があります
- 月60リクエストまで無料
- 詳細: https://ai.google.dev/pricing

---

## 📝 環境変数の設定

プロジェクトルートに `.env.local` ファイルを作成:

```env
# Firebase (Client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# Firebase Admin (Server-side)
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQI...\n-----END PRIVATE KEY-----\n"

# LINE LIFF
NEXT_PUBLIC_LIFF_ID=1234567890-abcdefgh

# Google AI Studio (Gemini API)
GOOGLE_AI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXX
```

**注意点:**
- `FIREBASE_ADMIN_PRIVATE_KEY` は改行を `\n` に置き換えてダブルクォートで囲む
- `.env.local` はGitにコミットしない（.gitignoreに含まれています）

---

## 🔐 Firebase Security Rulesの設定

### Firestore Rules

Firebase Console → Firestore Database → ルール:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザーコレクション
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 支出コレクション
    match /expenses/{expenseId} {
      allow read, write: if request.auth != null;
    }
    
    // 収入コレクション
    match /incomes/{incomeId} {
      allow read, write: if request.auth != null;
    }
    
    // カテゴリ、ウォレット、経費タイプ
    match /{collection}/{docId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

### Storage Rules

Firebase Console → Storage → ルール:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /receipts/{imageId} {
      allow create: if request.auth != null
                    && request.resource.size < 5 * 1024 * 1024
                    && request.resource.contentType.matches('image/.*');
      allow read: if request.auth != null;
      allow delete: if request.auth != null;
    }
  }
}
```

---

## 🚀 アプリケーションの起動

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 にアクセス

### 3. LIFFブラウザでの確認

LINE Developersで設定したLIFF URLにアクセス:
- https://liff.line.me/{YOUR_LIFF_ID}

---

## ✅ 動作確認チェックリスト

- [ ] LIFFログインが正常に動作する
- [ ] ホーム画面が表示される
- [ ] レシート撮影・解析が動作する
- [ ] 支出登録ができる
- [ ] 収入登録ができる
- [ ] 取引一覧が表示される
- [ ] レポート画面が表示される
- [ ] 設定画面が表示される

---

## 🔧 トラブルシューティング

### Firebase接続エラー

```
Error: Firebase: Error (auth/configuration-not-found)
```

**解決策:**
- `.env.local` の環境変数を確認
- Firebase設定が正しいか確認
- 開発サーバーを再起動

### LIFF初期化エラー

```
Error: LIFF ID is not set
```

**解決策:**
- `NEXT_PUBLIC_LIFF_ID` が設定されているか確認
- LIFF IDの形式が正しいか確認（例: 1234567890-abcdefgh）

### レシート解析エラー

```
Error: GOOGLE_AI_API_KEY environment variable is not set
```

**解決策:**
- Google AI StudioのAPIキーを確認
- APIキーが有効か確認
- 無料枠を使い切っていないか確認

---

## 📚 参考リンク

- [Firebase Documentation](https://firebase.google.com/docs)
- [LINE LIFF Documentation](https://developers.line.biz/ja/docs/liff/)
- [Google AI Studio](https://aistudio.google.com/)
- [Next.js Documentation](https://nextjs.org/docs)

---

## 💡 次のステップ

基本機能が動作したら、以下の拡張機能を実装してください:

1. 家計簿グループ（Household）の初期化
2. デフォルトマスタデータの自動作成
3. カテゴリ・ウォレット・経費タイプの管理画面詳細
4. レポート画面のグラフ表示（Chart.js使用）
5. 共有機能の実装

詳細は `README.md` を参照してください。

