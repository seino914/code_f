# バックエンド アーキテクチャ

## ディレクトリ構成

```
src/
├── main.ts                      # エントリーポイント
├── app.module.ts                # ルートモジュール
│
├── modules/                     # ドメインモジュール（機能単位）
│   └── auth/                   # 認証モジュール
│       ├── decorators/         # 認証固有のデコレーター
│       │   ├── current-user.decorator.ts
│       │   └── public.decorator.ts
│       ├── dto/                # Data Transfer Objects
│       │   └── login.dto.ts
│       ├── guards/             # 認証固有のガード
│       │   └── jwt-auth.guard.ts
│       ├── services/           # サービス
│       │   └── token-blacklist.service.ts
│       ├── strategies/         # Passport戦略
│       │   └── jwt.strategy.ts
│       ├── auth.controller.ts  # コントローラー
│       ├── auth.service.ts     # サービス
│       └── auth.module.ts      # モジュール定義
│
├── database/                    # データベース関連
│   └── prisma/                 # Prisma ORM
│       ├── prisma.service.ts   # Prismaサービス
│       └── prisma.module.ts    # Prismaモジュール
│
├── common/                      # アプリケーション共通コンポーネント
│   ├── filters/                # 例外フィルター
│   │   └── http-exception.filter.ts
│   ├── guards/                 # 共通ガード（将来）
│   ├── interceptors/           # インターセプター（将来）
│   ├── middleware/             # ミドルウェア
│   │   └── request-id.middleware.ts
│   └── pipes/                  # バリデーションパイプ（将来）
│
├── shared/                      # 共有ユーティリティ
│   ├── utils/                  # ユーティリティ関数
│   │   ├── log-mask.util.ts
│   │   └── password-strength.util.ts
│   ├── validators/             # 汎用バリデーター
│   │   └── env.validator.ts
│   ├── constants/              # 定数（将来）
│   ├── types/                  # 型定義（将来）
│   └── interfaces/             # インターフェース（将来）
│
└── config/                      # 設定ファイル（将来）
    ├── app.config.ts           # アプリケーション設定
    └── database.config.ts      # データベース設定
```

## 設計原則

### 1. ドメイン駆動設計（DDD）
- 機能ごとにモジュールを分割（`modules/`配下）
- 各モジュールは独立性を保ち、疎結合を維持
- ビジネスロジックはサービス層に集約

### 2. 責任の分離
- **modules/**: ビジネスロジック・ドメイン固有の処理
- **common/**: アプリケーション全体で使用する横断的関心事
- **shared/**: 汎用的なユーティリティ・ヘルパー関数
- **database/**: データアクセス層
- **config/**: 設定管理

### 3. スケーラビリティ
- 新しい機能は`modules/`配下に新しいモジュールとして追加
- 共通処理は`common/`または`shared/`に抽出
- モジュール間の依存は最小限に保つ

## モジュールの追加方法

新しい機能を追加する場合は、以下の構造に従ってください：

```
modules/
└── [feature-name]/
    ├── dto/                    # Data Transfer Objects
    ├── entities/               # エンティティ（オプション）
    ├── services/               # ビジネスロジック
    ├── [feature-name].controller.ts
    ├── [feature-name].service.ts
    └── [feature-name].module.ts
```

### 例: ユーザー管理機能の追加

```
modules/
└── users/
    ├── dto/
    │   ├── create-user.dto.ts
    │   └── update-user.dto.ts
    ├── users.controller.ts
    ├── users.service.ts
    └── users.module.ts
```

## インポートパスの規則

- **絶対パス**は使用せず、相対パスを使用
- モジュール間の依存は`../../`形式で明示
- 共通コンポーネントは`../../common/`または`../../shared/`からインポート
- データベースは`../../database/prisma/`からインポート

### 例

```typescript
// modules/auth/auth.service.ts
import { PrismaService } from '../../database/prisma/prisma.service';
import { maskSensitiveData } from '../../shared/utils/log-mask.util';
```

## ベストプラクティス

1. **単一責任の原則**: 各クラス・関数は1つの責任のみを持つ
2. **依存性注入**: コンストラクタインジェクションを使用
3. **型安全性**: TypeScriptの型を厳密に使用（`any`を避ける）
4. **エラーハンドリング**: グローバル例外フィルターで統一
5. **バリデーション**: DTOとZodスキーマで入力を検証
6. **セキュリティ**: 認証・認可・レート制限を適切に実装
7. **ログ**: 機密情報をマスクし、リクエストIDで追跡可能に
8. **テスト**: 各モジュールにテストファイルを配置

## 今後の拡張

以下の機能を追加する際の配置場所：

- **ユーザー管理**: `modules/users/`
- **商品管理**: `modules/products/`
- **注文管理**: `modules/orders/`
- **通知機能**: `modules/notifications/`
- **ファイルアップロード**: `common/services/file-upload.service.ts`
- **メール送信**: `common/services/email.service.ts`
- **キャッシュ**: `common/services/cache.service.ts`
- **ロギング**: `common/services/logger.service.ts`

## 参考資料

- [NestJS公式ドキュメント](https://docs.nestjs.com/)
- [NestJS Best Practices](https://docs.nestjs.com/fundamentals/testing)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)

