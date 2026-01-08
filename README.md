# code_f

## 概要

- コードFプロジェクトのソースコード
- Next.jsとNestJSを採用したモノレポ構成
- Turborepoを使用したビルドシステム

## クイックスタート

```bash
# 1. 依存関係をインストール
pnpm install

# 2. データベースを起動
docker compose up -d

# 3. マイグレーションを適用
pnpm --filter backend prisma:migrate

# 4. 開発サーバーを起動
pnpm dev
```

## ディレクトリ構成
```
code_f/
├── backend/      # NestJS バックエンド
├── frontend/     # Next.js フロントエンド
└── package.json  # ルート設定
```

## 開発環境のポート

- **フロントエンド**: http://localhost:3000
- **バックエンド**: http://localhost:3001
- **Swagger UI**: http://localhost:3001/api

## 環境構築

### 前提条件

- **Node.js**: v20 以上
- **pnpm**: v9 以上
- **Docker**: Docker Desktopのインストール

### 1. 依存関係のインストール

```bash
pnpm install
```

### 2. データベースの起動（Docker）

```bash
# PostgreSQLコンテナをバックグラウンドで起動
docker compose up -d
```

コンテナが起動すると、以下の設定でPostgreSQLに接続できます：

| 項目 | 値 |
|------|-----|
| ホスト | `localhost:5432` |
| ユーザー | `postgres` |
| パスワード | `postgres` |
| データベース名 | `code_f` |

### 3. 環境変数の設定

`backend/.env` ファイルが存在しない場合は作成してください：

```bash
# backend/.env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/code_f?schema=public"
JWT_SECRET="your-secret-key-change-in-production"
FRONTEND_URL="http://localhost:3000"
PORT=3001
NODE_ENV="development"
```

### 4. データベースのマイグレーション

```bash
# マイグレーションを作成・適用
pnpm --filter backend prisma:migrate

# Prisma Client を生成
pnpm --filter backend prisma:generate
```

### 5. 開発サーバーの起動

```bash
pnpm dev
```

---

## Docker コマンド

### 基本操作

```bash
# コンテナをバックグラウンドで起動
docker compose up -d

# コンテナを停止
docker compose down

# コンテナを停止 + ボリューム（データ）も削除
docker compose down -v

# コンテナの状態を確認
docker compose ps
```

### ログ・デバッグ

```bash
# ログを確認（リアルタイム）
docker compose logs -f

# PostgreSQLのログのみ確認
docker compose logs -f postgres

# コンテナ内でpsqlを実行
docker exec -it code_f_postgres psql -U postgres -d code_f
```

### コンテナ管理

```bash
# コンテナを再起動
docker compose restart

# コンテナを再ビルドして起動
docker compose up -d --build

# 未使用のDockerリソースを削除
docker system prune -f
```

---

## 開発コマンド（ルートで実行）

### 開発サーバーの起動
```bash
# すべてのワークスペースの開発サーバーを起動
pnpm dev
```

### 個別の開発サーバー起動
```bash
# バックエンドのみ起動
# → http://localhost:3001
# → Swagger UI: http://localhost:3001/api
pnpm --filter backend dev

# フロントエンドのみ起動
# → http://localhost:3000
pnpm --filter frontend dev
```

### ビルド
```bash
# すべてのワークスペースをビルド
pnpm build
```

### リント
```bash
# すべてのワークスペースをリント
pnpm lint
```

### テスト
```bash
# すべてのワークスペースのテストを実行
pnpm test
```

### クリーン
```bash
# すべてのワークスペースのビルド成果物を削除
pnpm clean
```

### Prisma マイグレーション（バックエンド）

```bash
# スキーマ変更後にマイグレーションを作成・適用（開発環境）
pnpm --filter backend prisma:migrate

# Prisma Client を生成
pnpm --filter backend prisma:generate

# Prisma Studio を起動（データベースのGUIツール）
pnpm --filter backend prisma:studio

# シードデータの投入（prisma/seed.ts が存在する場合）
pnpm --filter backend prisma:seed
```

**注意**: スキーマ変更後は `prisma:migrate` と `prisma:generate` を実行してください。
