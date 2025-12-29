# TodoList App - Cloudflare Workers SPA

better-auth + Drizzle ORM + Cloudflare Workers (D1 + KV) を使用したTodoListアプリケーション

## 技術スタック

- **フレームワーク**: Hono
- **フロントエンド**: React 19
- **認証**: better-auth
- **ORM**: Drizzle ORM
- **データベース**: Cloudflare D1 (SQLite)
- **KV**: Cloudflare Workers KV
- **ビルドツール**: Vite
- **ランタイム**: Bun

## 機能

- ユーザー登録・ログイン（better-auth）
- セッション管理
- Todo CRUD操作（作成・読み取り・更新・削除）
- ユーザーごとのTodo管理

## セットアップ

### 1. 依存関係のインストール

```bash
bun install
```

### 2. データベースのマイグレーション

ローカル開発用:
```bash
bun run db:migrate
```

本番環境用:
```bash
bun run db:migrate:prod
```

### 3. 開発サーバーの起動

```bash
bun run dev
```

ブラウザで http://localhost:5173/ にアクセス

## プロジェクト構造

```
.
├── src/
│   ├── components/        # Reactコンポーネント
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── TodoList.tsx
│   ├── db/
│   │   └── schema.ts      # Drizzle ORMスキーマ
│   ├── lib/
│   │   ├── auth.ts        # better-authサーバー設定
│   │   └── auth-client.ts # better-authクライアント
│   ├── routes/
│   │   └── todos.ts       # Todo API エンドポイント
│   ├── app.tsx            # Reactアプリルーター
│   ├── client.tsx         # クライアントエントリーポイント
│   ├── index.tsx          # Honoアプリ & サーバーエントリーポイント
│   ├── renderer.tsx       # SSRレンダラー
│   └── types.ts           # TypeScript型定義
├── migrations/            # データベースマイグレーション
├── drizzle.config.ts      # Drizzle設定
├── wrangler.jsonc         # Cloudflare Workers設定
└── package.json
```

## API エンドポイント

### 認証
- `POST /api/auth/sign-up/email` - ユーザー登録
- `POST /api/auth/sign-in/email` - ログイン
- `POST /api/auth/sign-out` - ログアウト
- `GET /api/auth/get-session` - セッション取得

### Todo
- `GET /api/todos` - 全Todo取得
- `POST /api/todos` - Todo作成
- `PUT /api/todos/:id` - Todo更新
- `DELETE /api/todos/:id` - Todo削除

## デプロイ

```bash
bun run deploy
```

## 環境設定

### wrangler.jsonc

- `nodejs_compat`: better-authで必要なNode.js互換性フラグ
- `d1_databases`: D1データベース設定
- `kv_namespaces`: KVネームスペース設定

## データベーススキーマ

### user
- id, name, email, emailVerified, image, createdAt, updatedAt

### session
- id, expiresAt, token, userId, ipAddress, userAgent, createdAt, updatedAt

### account
- id, accountId, providerId, userId, password, tokens, createdAt, updatedAt

### todo
- id, title, description, completed, userId, createdAt, updatedAt

### verification
- id, identifier, value, expiresAt, createdAt, updatedAt
