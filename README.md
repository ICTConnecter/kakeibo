# AI家計簿システム - 仕様書・要件定義書

## 1. プロジェクト概要

### 1.1 システム概要
AIを活用した家計簿管理システム。レシートをカメラで撮影するだけで、AI（Google AI Studio）が自動的に会計情報を抽出し、データベースに保存します。複数ユーザーでの共有・共同編集機能により、家族やパートナーとの家計管理を効率化します。

### 1.2 技術スタック
- **フロントエンド**: Next.js
- **バックエンド**: Next.js API Routes
- **データベース**: Firebase Firestore
- **認証**: LINE LIFF（LINE Front-end Framework）
- **AI画像認識**: Google AI Studio（Gemini API）
- **画像ストレージ**: Firebase Storage
- **デプロイ**: Vercel（推奨）

---

## 2. 主要機能一覧

### 2.1 認証機能
- [x] LINE LIFFによるソーシャルログイン
- [x] ユーザー登録・管理
- [ ] セッション管理

### 2.2 レシート読み取り機能
- [ ] カメラ機能によるレシート撮影
- [ ] 画像のアップロード機能
- [ ] Google AI Studioを使用した画像解析
- [ ] レシート情報の自動抽出（店名、日付、金額、商品明細など）

### 2.3 支出登録・編集機能
- [ ] 支出データの登録
- [ ] 支出データの編集・削除
- [ ] 以下の情報を設定可能:
  - 金額
  - 使用日時
  - 店舗名
  - 商品明細
  - 支出カテゴリ（後述）
  - ウォレット（後述）
  - 経費タイプ（後述、null許容）
  - メモ

### 2.4 収入登録・編集機能
- [ ] 収入データの登録
- [ ] 収入データの編集・削除
- [ ] 以下の情報を設定可能:
  - 金額
  - 受取日時
  - 収入源（給与、副業など）
  - 収入カテゴリ（後述）
  - 入金先ウォレット
  - メモ

### 2.5 カテゴリ管理

#### 支出カテゴリ
- [ ] 支出カテゴリの設定
- [ ] デフォルト支出カテゴリ:
  - 食費
  - 家賃
  - 光熱費
  - 交通費
  - 医療費
  - 娯楽費
  - 衣服費
  - 通信費
  - その他
- [ ] カスタム支出カテゴリの追加・編集・削除

#### 収入カテゴリ
- [ ] 収入カテゴリの設定
- [ ] デフォルト収入カテゴリ:
  - 給与
  - ボーナス
  - 副業
  - 投資・配当
  - お小遣い
  - その他収入
- [ ] カスタム収入カテゴリの追加・編集・削除

### 2.6 ウォレット管理
- [ ] 支払い方法・入金先（ウォレット）の管理
- [ ] デフォルトウォレット:
  - 現金
  - クレジットカード
  - デビットカード
  - 電子マネー
  - 銀行口座
- [ ] カスタムウォレットの追加・編集・削除

### 2.7 経費タイプ管理
- [ ] 経費タイプの管理
- [ ] デフォルト経費タイプ:
  - 事業用
  - 接待交際費
  - 交通費（業務用）
  - 消耗品費
  - 通信費（業務用）
  - 広告宣伝費
  - その他経費
- [ ] カスタム経費タイプの追加・編集・削除
- [ ] null許容（経費として計上しない場合はnull）

### 2.8 月次集計・レポート機能
- [ ] 月別の収入・支出一覧表示
- [ ] 収支バランスの表示
- [ ] 収入カテゴリ別集計
- [ ] 支出カテゴリ別集計
- [ ] ウォレット別集計
- [ ] 経費タイプ別集計
- [ ] 月次推移グラフ（収入・支出・収支）
- [ ] グラフ・チャートでの可視化
- [ ] 月次レポートのエクスポート（CSV、PDF）

### 2.9 共有・共同編集機能
- [ ] 他ユーザーへの共有招待（LINE友達から選択）
- [ ] 共有権限の管理（閲覧のみ / 編集可能）
- [ ] 共有メンバーの追加・削除
- [ ] リアルタイム同期

### 2.10 検索・フィルター機能
- [ ] 収入・支出の切り替え表示
- [ ] 日付範囲での検索
- [ ] カテゴリでのフィルタ
- [ ] ウォレットでのフィルタ
- [ ] 経費タイプでのフィルタ（支出のみ）
- [ ] 金額範囲での検索
- [ ] キーワード検索（店名、収入源、メモなど）

---

## 3. データベース設計（Firestore）

### 3.1 コレクション構造

#### users コレクション
```
users/{userId}
  - userId: string (LINE User ID)
  - displayName: string
  - pictureUrl: string
  - email: string
  - createdAt: timestamp
  - updatedAt: timestamp
```

#### expenses コレクション（支出）
```
expenses/{expenseId}
  - expenseId: string (自動生成)
  - userId: string (作成者のユーザーID)
  - householdId: string (家計簿グループID)
  - amount: number (金額)
  - date: timestamp (使用日時)
  - storeName: string (店舗名)
  - categoryId: string (支出カテゴリID)
  - walletId: string (ウォレットID)
  - expenseTypeId: string | null (経費タイプID、null許容)
  - items: array (商品明細)
    - name: string
    - price: number
    - quantity: number
  - memo: string
  - receiptImageUrl: string (Firebase Storage URL)
  - createdAt: timestamp
  - updatedAt: timestamp
  - createdBy: string (作成者ユーザーID)
  - updatedBy: string (最終更新者ユーザーID)
```

#### incomes コレクション（収入）
```
incomes/{incomeId}
  - incomeId: string (自動生成)
  - userId: string (作成者のユーザーID)
  - householdId: string (家計簿グループID)
  - amount: number (金額)
  - date: timestamp (受取日時)
  - source: string (収入源)
  - categoryId: string (収入カテゴリID)
  - walletId: string (入金先ウォレットID)
  - memo: string
  - createdAt: timestamp
  - updatedAt: timestamp
  - createdBy: string (作成者ユーザーID)
  - updatedBy: string (最終更新者ユーザーID)
```

#### households コレクション（家計簿グループ）
```
households/{householdId}
  - householdId: string (自動生成)
  - name: string (家計簿名)
  - ownerId: string (オーナーのユーザーID)
  - members: array (メンバー一覧)
    - userId: string
    - role: string (owner / editor / viewer)
    - joinedAt: timestamp
  - createdAt: timestamp
  - updatedAt: timestamp
```

#### categories コレクション
```
categories/{categoryId}
  - categoryId: string (自動生成)
  - householdId: string (所属する家計簿ID)
  - type: string (カテゴリタイプ: "expense" | "income")
  - name: string (カテゴリ名)
  - icon: string (アイコン名)
  - color: string (カラーコード)
  - order: number (表示順)
  - createdAt: timestamp
```

#### wallets コレクション
```
wallets/{walletId}
  - walletId: string (自動生成)
  - householdId: string (所属する家計簿ID)
  - name: string (ウォレット名)
  - icon: string (アイコン名)
  - color: string (カラーコード)
  - isDefault: boolean (デフォルトウォレットか)
  - order: number (表示順)
  - createdAt: timestamp
```

#### expenseTypes コレクション（経費タイプ）
```
expenseTypes/{expenseTypeId}
  - expenseTypeId: string (自動生成)
  - householdId: string (所属する家計簿ID)
  - name: string (経費タイプ名)
  - icon: string (アイコン名)
  - color: string (カラーコード)
  - isDefault: boolean (デフォルト経費タイプか)
  - order: number (表示順)
  - createdAt: timestamp
```

---

## 4. API設計

### 4.1 認証API
- `POST /api/auth` - LIFF認証・ユーザー登録
- `GET /api/auth/me` - ログイン中のユーザー情報取得

### 4.2 レシートAPI
- `POST /api/receipts/analyze` - レシート画像をAIで解析
- `POST /api/receipts/upload` - レシート画像のアップロード

### 4.3 支出API
- `GET /api/expenses` - 支出一覧取得（クエリパラメータでフィルタ）
- `POST /api/expenses` - 支出登録
- `GET /api/expenses/{expenseId}` - 支出詳細取得
- `PUT /api/expenses/{expenseId}` - 支出更新
- `DELETE /api/expenses/{expenseId}` - 支出削除

### 4.4 収入API
- `GET /api/incomes` - 収入一覧取得（クエリパラメータでフィルタ）
- `POST /api/incomes` - 収入登録
- `GET /api/incomes/{incomeId}` - 収入詳細取得
- `PUT /api/incomes/{incomeId}` - 収入更新
- `DELETE /api/incomes/{incomeId}` - 収入削除

### 4.5 カテゴリAPI
- `GET /api/categories` - カテゴリ一覧取得（type=expense|incomeでフィルタ可能）
- `POST /api/categories` - カテゴリ作成
- `PUT /api/categories/{categoryId}` - カテゴリ更新
- `DELETE /api/categories/{categoryId}` - カテゴリ削除

### 4.6 ウォレットAPI
- `GET /api/wallets` - ウォレット一覧取得
- `POST /api/wallets` - ウォレット作成
- `PUT /api/wallets/{walletId}` - ウォレット更新
- `DELETE /api/wallets/{walletId}` - ウォレット削除

### 4.7 経費タイプAPI
- `GET /api/expense-types` - 経費タイプ一覧取得
- `POST /api/expense-types` - 経費タイプ作成
- `PUT /api/expense-types/{expenseTypeId}` - 経費タイプ更新
- `DELETE /api/expense-types/{expenseTypeId}` - 経費タイプ削除

### 4.8 家計簿グループAPI
- `GET /api/households` - 所属家計簿一覧取得
- `POST /api/households` - 家計簿グループ作成
- `GET /api/households/{householdId}` - 家計簿グループ詳細取得
- `PUT /api/households/{householdId}` - 家計簿グループ更新
- `POST /api/households/{householdId}/members` - メンバー追加
- `DELETE /api/households/{householdId}/members/{userId}` - メンバー削除

### 4.9 レポートAPI
- `GET /api/reports/monthly` - 月次レポート取得（収入・支出・収支）
- `GET /api/reports/balance` - 収支バランス取得
- `GET /api/reports/income-category` - 収入カテゴリ別集計
- `GET /api/reports/expense-category` - 支出カテゴリ別集計
- `GET /api/reports/wallet` - ウォレット別集計
- `GET /api/reports/expense-type` - 経費タイプ別集計
- `GET /api/reports/trend` - 月次推移（収入・支出・収支）
- `GET /api/reports/export` - レポートエクスポート

---

## 5. 画面構成

### 5.1 画面一覧

#### 1. ログイン画面 (`/`)
- LIFFログインボタン
- アプリの説明

#### 2. ホーム画面 (`/home`)
- 今月の収支サマリー表示
  - 収入合計
  - 支出合計
  - 収支（差額）
- 支出カテゴリ別円グラフ
- 最近の取引一覧（収入・支出混在、直近5件）
- レシート撮影ボタン（FAB）
- 収入追加ボタン
- ナビゲーションバー

#### 3. レシート撮影画面 (`/receipt/camera`)
- カメラプレビュー
- シャッターボタン
- ギャラリーから選択ボタン
- 撮影ガイド表示

#### 4. レシート確認・編集画面 (`/receipt/confirm`)
- レシート画像プレビュー
- AI抽出結果表示
- 編集フォーム:
  - 日付
  - 店名
  - 金額
  - カテゴリ選択
  - ウォレット選択
  - 経費タイプ選択（null許容、「なし」も選択可能）
  - メモ
  - 商品明細（追加・編集・削除）
- 保存ボタン
- キャンセルボタン

#### 5. 取引一覧画面 (`/transactions`)
- タブ切り替え（すべて / 支出 / 収入）
- 月選択（前月・次月ボタン）
- 今月の収支サマリー
  - 収入合計
  - 支出合計
  - 収支
- フィルタボタン
- 取引リスト（日付降順）
  - 日付
  - 店名 / 収入源
  - カテゴリアイコン
  - 金額（支出は赤、収入は青）
- 各アイテムタップで詳細画面へ

#### 6. 支出詳細画面 (`/expenses/{expenseId}`)
- レシート画像
- 詳細情報表示
- 編集ボタン
- 削除ボタン
- 戻るボタン

#### 6-2. 収入詳細画面 (`/incomes/{incomeId}`)
- 詳細情報表示
  - 金額
  - 受取日
  - 収入源
  - カテゴリ
  - 入金先ウォレット
  - メモ
- 編集ボタン
- 削除ボタン
- 戻るボタン

#### 7. レポート画面 (`/reports`)
- 月選択
- 期間選択（月/3ヶ月/6ヶ月/年）
- 収支サマリーカード
  - 総収入
  - 総支出
  - 収支
  - 貯蓄率
- 月次推移グラフ（折れ線：収入・支出・収支）
- 収入カテゴリ別円グラフ
- 支出カテゴリ別円グラフ
- ウォレット別棒グラフ
- 経費タイプ別グラフ
- エクスポートボタン

#### 7-2. 収入登録画面 (`/incomes/new`)
- 入力フォーム:
  - 金額
  - 受取日
  - 収入源
  - 収入カテゴリ選択
  - 入金先ウォレット選択
  - メモ
- 保存ボタン
- キャンセルボタン

#### 8. カテゴリ管理画面 (`/settings/categories`)
- タブ切り替え（支出カテゴリ / 収入カテゴリ）
- カテゴリ一覧
- 各カテゴリの編集・削除
- カテゴリ追加ボタン

#### 9. ウォレット管理画面 (`/settings/wallets`)
- ウォレット一覧
- 各ウォレットの編集・削除
- ウォレット追加ボタン

#### 10. 経費タイプ管理画面 (`/settings/expense-types`)
- 経費タイプ一覧
- 各経費タイプの編集・削除
- 経費タイプ追加ボタン

#### 11. 共有設定画面 (`/settings/sharing`)
- 現在の家計簿グループ名
- メンバー一覧（アバター、名前、権限）
- メンバー招待ボタン
- 権限変更・削除機能

#### 12. 設定画面 (`/settings`)
- カテゴリ管理へのリンク
- ウォレット管理へのリンク
- 経費タイプ管理へのリンク
- 共有設定へのリンク
- プロフィール設定
- ログアウト

### 5.2 画面遷移図
```
/ (ログイン)
  ↓
/home (ホーム)
  ├→ /receipt/camera (レシート撮影)
  │    ↓
  │  /receipt/confirm (確認・編集)
  │    ↓
  │  /home (保存後)
  │
  ├→ /incomes/new (収入登録)
  │    ↓
  │  /home (保存後)
  │
  ├→ /transactions (取引一覧)
  │    ├→ /expenses/{id} (支出詳細)
  │    │    ↓
  │    │  /receipt/confirm?id={id} (編集)
  │    │
  │    └→ /incomes/{id} (収入詳細)
  │         ↓
  │       /incomes/edit/{id} (編集)
  │
  ├→ /reports (レポート)
  │
  └→ /settings (設定)
       ├→ /settings/categories (カテゴリ管理)
       ├→ /settings/wallets (ウォレット管理)
       ├→ /settings/expense-types (経費タイプ管理)
       └→ /settings/sharing (共有設定)
```

### 5.3 ナビゲーションバー構成
- ホーム（アイコン）
- 取引一覧（アイコン）
- 追加ボタン（中央・大きめのFAB）
  - タップで選択メニュー表示
    - レシート撮影
    - 収入登録
    - 手動で支出登録
- レポート（アイコン）
- 設定（アイコン）

---

## 6. AI画像認識仕様

### 6.1 使用API
Google AI Studio（Gemini API）の画像解析機能を使用

### 6.2 抽出項目
レシート画像から以下の情報を抽出:
- 店舗名
- 購入日時
- 合計金額
- 商品明細
  - 商品名
  - 単価
  - 数量
  - 小計
- 消費税額

### 6.3 レスポンス形式
```json
{
  "storeName": "○○スーパー",
  "date": "2025-10-24T15:30:00",
  "totalAmount": 3580,
  "tax": 258,
  "items": [
    {
      "name": "牛乳",
      "price": 198,
      "quantity": 1
    },
    {
      "name": "食パン",
      "price": 128,
      "quantity": 2
    }
  ]
}
```

### 6.4 エラーハンドリング
- 画像が不鮮明な場合: ユーザーに再撮影を促す
- レシートが検出できない場合: 手動入力モードを提供
- API呼び出し失敗: リトライ機能

---

## 7. セキュリティ・権限管理

### 7.1 認証
- LINE LIFFによるOAuth認証
- セッショントークンの有効期限管理

### 7.2 データアクセス制御
- Firestore Security Rulesによるアクセス制御
- ユーザーは自分が所属する家計簿グループのデータのみアクセス可能
- 権限に応じた操作制限（viewer は閲覧のみ）

### 7.3 画像ストレージ
- Firebase Storage使用
- ストレージパス: `receipts/{timestamp}-{filename}`
- アップロードサイズ制限（5MB）
- ダウンロードURLによる安全なアクセス
- Firebase Security Rulesによるアクセス制御
- 自動バックアップ設定

---

## 8. 開発環境セットアップ

### 8.1 必要な環境変数
`.env.local` ファイルを作成し、以下を設定:
```
# Firebase (Client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (Server-side)
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# LINE LIFF
NEXT_PUBLIC_LIFF_ID=

# Google AI Studio (Gemini API)
GOOGLE_AI_API_KEY=
```

### 8.2 インストール
```bash
npm install
```

### 8.3 必要なパッケージ
```bash
npm i @line/liff firebase @google/generative-ai firebase-admin
npm i -D @types/node typescript
```

### 8.4 開発サーバー起動
```bash
npm run dev
```

---

## 9. 今後の拡張機能（Phase 2以降）

### 9.1 予算管理機能
- カテゴリ別予算設定
- 予算超過アラート
- 予算達成率の可視化

### 9.2 定期支出管理
- 家賃、サブスクリプションなどの定期支出登録
- 自動入力機能

### 9.3 通知機能
- LINE通知連携
- 支出登録時の通知
- 月次レポート自動送信

### 9.4 AIアシスタント
- 支出傾向の分析
- 節約アドバイス
- カテゴリの自動推薦

### 9.5 多通貨対応
- 海外旅行での支出管理
- 為替レート自動変換

### 9.6 定期取引の自動登録
- 定期的な収入（給与など）の自動登録
- 定期的な支出（サブスクなど）の自動登録

---

## 10. 開発ロードマップ

### Phase 1: 基本機能（MVP）
- [ ] 認証機能
- [ ] レシート撮影・AI解析
- [ ] 支出登録・編集・削除
- [ ] 収入登録・編集・削除
- [ ] カテゴリ・ウォレット管理
- [ ] 取引一覧表示（収入・支出）
- [ ] 収支バランス表示

### Phase 2: 集計・共有機能
- [ ] レポート機能
- [ ] グラフ・チャート
- [ ] 共有・共同編集機能

### Phase 3: UX向上
- [ ] 検索・フィルター機能
- [ ] エクスポート機能
- [ ] パフォーマンス最適化

### Phase 4: 拡張機能
- [ ] 予算管理
- [ ] 定期支出管理
- [ ] 通知機能

---

## 11. ライセンス

MIT License

---

## 12. 連絡先・サポート

プロジェクトに関する質問や問題がある場合は、Issueを作成してください。