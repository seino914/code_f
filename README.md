# code_f

## 概要
- コードFプロジェクトのソースコード
- Next.jsとNestJSを採用したモノレポ構成
- Turborepoを使用したビルドシステム

## ディレクトリ構成
```
code_f/
├── backend/      # NestJS バックエンド
├── frontend/     # Next.js フロントエンド
└── package.json  # ルート設定
```

## 環境構築

### 依存関係のインストール
```bash
pnpm install
```

## 開発コマンド（ルートで実行）

### 開発サーバーの起動
```bash
# すべてのワークスペースの開発サーバーを起動
pnpm dev
```

### 個別の開発サーバー起動
```bash
# バックエンドのみ起動（ポート: 3001）
pnpm --filter backend dev

# フロントエンドのみ起動（ポート: 3000）
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