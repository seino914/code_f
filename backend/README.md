# バックエンド アーキテクチャ

## ディレクトリ構成

```
src/
├── main.ts                      # エントリーポイント
├── app.module.ts                # ルートモジュール
│
├── domain/                      # ドメインモジュール（機能単位）
│   ├── auth/                   # 認証モジュール
│   │   ├── controllers/        # コントローラー
│   │   │   └── auth.controller.ts
│   │   ├── services/           # サービス
│   │   │   ├── auth.service.ts
│   │   │   └── token-blacklist.service.ts
│   │   ├── usecase/            # ユースケース（ビジネスロジック）
│   │   │   └── auth.usecase.ts
│   │   ├── repository/         # リポジトリ（データアクセス層）
│   │   ├── dto/                # Data Transfer Objects
│   │   │   ├── login.dto.ts
│   │   │   └── register.dto.ts
│   │   ├── strategies/         # Passport戦略
│   │   │   └── jwt.strategy.ts
│   │   ├── test/               # テストファイル
│   │   │   ├── auth.controller.spec.ts
│   │   │   ├── auth.service.spec.ts
│   │   │   ├── auth.usecase.spec.ts
│   │   │   └── mocks/
│   │   └── auth.module.ts      # モジュール定義
│   │
│   └── users/                  # ユーザーモジュール
│       ├── controllers/        # コントローラー
│       │   └── users.controller.ts
│       ├── services/           # サービス
│       │   └── users.service.ts
│       ├── usecase/            # ユースケース（ビジネスロジック）
│       │   └── users.usecase.ts
│       ├── repository/         # リポジトリ（データアクセス層）
│       │   └── users.repository.ts
│       ├── dto/                # Data Transfer Objects
│       │   └── update-user.dto.ts
│       ├── test/               # テストファイル
│       │   ├── users.controller.spec.ts
│       │   ├── users.service.spec.ts
│       │   ├── users.usecase.spec.ts
│       │   ├── users.repository.spec.ts
│       │   └── mocks/
│       └── users.module.ts     # モジュール定義
│
├── database/                    # データベース関連
│   └── prisma/                 # Prisma ORM
│       ├── prisma.service.ts   # Prismaサービス
│       └── prisma.module.ts    # Prismaモジュール
│
├── common/                      # アプリケーション共通コンポーネント
│   ├── decorators/             # 共通デコレーター
│   │   ├── current-user.decorator.ts
│   │   └── public.decorator.ts
│   ├── guards/                 # 共通ガード
│   │   ├── jwt-auth.guard.ts
│   │   └── custom-throttler.guard.ts
│   ├── filters/                # 例外フィルター
│   │   └── http-exception.filter.ts
│   ├── middleware/             # ミドルウェア
│   │   └── request-id.middleware.ts
│   ├── interceptors/           # インターセプター（将来）
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

- 機能ごとにモジュールを分割（`domain/`配下）
- 各モジュールは独立性を保ち、疎結合を維持
- レイヤー構造: Controller → Service → Usecase → Repository
- ビジネスロジックは Usecase 層に集約

### 2. 責任の分離

- **domain/**: ビジネスロジック・ドメイン固有の処理
  - **controllers/**: HTTPリクエスト/レスポンスの処理
  - **services/**: 薄いラッパー層（Controller と Usecase の橋渡し）
  - **usecase/**: ビジネスロジックの実装
  - **repository/**: データアクセス層（Prisma へのアクセス）
- **common/**: アプリケーション全体で使用する横断的関心事（ガード、デコレータ、フィルターなど）
- **shared/**: 汎用的なユーティリティ・ヘルパー関数
- **database/**: データベース接続管理（Prisma）
- **config/**: 設定管理

### 3. スケーラビリティ

- 新しい機能は`domain/`配下に新しいモジュールとして追加
- 共通処理は`common/`または`shared/`に抽出
- モジュール間の依存は最小限に保つ
- レイヤーごとにサブディレクトリを統一（一貫性のある構造）

## モジュールの追加方法

新しい機能を追加する場合は、以下の構造に従ってください：

```
domain/
└── [feature-name]/
    ├── controllers/            # コントローラー
    │   └── [feature-name].controller.ts
    ├── services/               # サービス
    │   └── [feature-name].service.ts
    ├── usecase/                # ユースケース（ビジネスロジック）
    │   └── [feature-name].usecase.ts
    ├── repository/             # リポジトリ（データアクセス層）
    │   └── [feature-name].repository.ts
    ├── dto/                    # Data Transfer Objects
    │   ├── create-[feature-name].dto.ts
    │   └── update-[feature-name].dto.ts
    ├── test/                   # テストファイル
    │   ├── [feature-name].controller.spec.ts
    │   ├── [feature-name].service.spec.ts
    │   ├── [feature-name].usecase.spec.ts
    │   ├── [feature-name].repository.spec.ts
    │   └── mocks/
    └── [feature-name].module.ts # モジュール定義
```

### 例: 商品管理機能の追加

```
domain/
└── products/
    ├── controllers/
    │   └── products.controller.ts
    ├── services/
    │   └── products.service.ts
    ├── usecase/
    │   └── products.usecase.ts
    ├── repository/
    │   └── products.repository.ts
    ├── dto/
    │   ├── create-product.dto.ts
    │   └── update-product.dto.ts
    ├── test/
    │   ├── products.controller.spec.ts
    │   ├── products.service.spec.ts
    │   ├── products.usecase.spec.ts
    │   ├── products.repository.spec.ts
    │   └── mocks/
    └── products.module.ts
```

## インポートパスの規則

- **絶対パス**は使用せず、相対パスを使用
- モジュール間の依存は`../../`形式で明示
- 共通コンポーネントは`../../../common/`または`../../../shared/`からインポート
- データベースは`../../../database/prisma/`からインポート
- 同じモジュール内では`../`で相対パスを使用

### 例

```typescript
// domain/auth/services/auth.service.ts
import { AuthUsecase } from '../usecase/auth.usecase';
import { LoginDto } from '../dto/login.dto';

// domain/auth/controllers/auth.controller.ts
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

// domain/auth/usecase/auth.usecase.ts
import { UsersRepository } from '../../users/repository/users.repository';
import { checkPasswordStrength } from '../../../shared/utils/password-strength.util';
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

## アーキテクチャの特徴

### レイヤー構造

各ドメインモジュールは以下のレイヤー構造に従います：

1. **Controller層**: HTTPリクエスト/レスポンスの処理、ルーティング
2. **Service層**: Controller と Usecase の橋渡し（薄いラッパー）
3. **Usecase層**: ビジネスロジックの実装（ここに主要な処理を記述）
4. **Repository層**: データアクセス層（Prisma へのアクセス）

### 共通コンポーネント

- **JwtAuthGuard**: `common/guards/jwt-auth.guard.ts` - JWT認証ガード
- **CurrentUser**: `common/decorators/current-user.decorator.ts` - 現在のユーザー情報を取得
- **Public**: `common/decorators/public.decorator.ts` - 公開エンドポイントを示すデコレータ

### リポジトリの統合

- ユーザー関連のデータアクセスは `UsersRepository` に統合
- 認証とユーザー管理の両方で同じリポジトリを使用

## 参考資料

- [NestJS公式ドキュメント](https://docs.nestjs.com/)
- [NestJS Best Practices](https://docs.nestjs.com/fundamentals/testing)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
