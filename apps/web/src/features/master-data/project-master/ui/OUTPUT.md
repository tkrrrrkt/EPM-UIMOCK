# プロジェクトマスタ UI - 出力ドキュメント

## 1. 生成ファイルツリー

```
apps/web/_v0_drop/master-data/project-master/src/
├── OUTPUT.md                     # このファイル
├── types/
│   └── contracts.ts              # BFF契約型定義（移行時に削除）
├── api/
│   ├── BffClient.ts              # BFFクライアントインターフェース
│   ├── MockBffClient.ts          # モック実装
│   ├── HttpBffClient.ts          # HTTP実装（将来用）
│   └── client.ts                 # クライアントシングルトン
├── components/
│   ├── ProjectListTable.tsx      # プロジェクト一覧テーブル
│   ├── ProjectSearchBar.tsx      # 検索バー
│   ├── ProjectFormDialog.tsx     # 登録・編集フォーム
│   ├── ProjectDetailDialog.tsx   # プロジェクト詳細ダイアログ
│   ├── ConfirmDialog.tsx         # 確認ダイアログ
│   └── ErrorAlert.tsx            # エラー表示
└── app/
    └── page.tsx                  # プロジェクトマスタ一覧画面
```

## 2. 主要なインポートと依存関係

### BFF契約型（現在）

```typescript
// v0プレビュー環境用: types/contracts.ts で定義
import type {
  BffListProjectsRequest,
  BffListProjectsResponse,
  BffProjectDetailResponse,
  BffCreateProjectRequest,
  BffUpdateProjectRequest,
  ProjectStatus,
  ProjectMasterError,
  ProjectMasterErrorCode,
} from '../types/contracts';
```

### BFF契約型（Cursor移行後）

```typescript
// Cursor環境では以下に置き換え:
import type {
  BffListProjectsRequest,
  BffListProjectsResponse,
  BffProjectDetailResponse,
  BffCreateProjectRequest,
  BffUpdateProjectRequest,
  ProjectStatus,
  ProjectMasterError,
  ProjectMasterErrorCode,
} from '@epm/contracts/bff/project-master';
```

### UIコンポーネント（現在）

```typescript
// v0プレビュー環境用: @/components/ui から
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
```

### UIコンポーネント（Cursor移行後）

```typescript
// Cursor環境では以下に置き換え:
import { Button, Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input, Label, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Badge, Alert, AlertDescription, AlertTitle, Separator, AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/shared/ui';
```

### BFFクライアント

```typescript
// api/client.ts がシングルトンを提供
import { bffClient } from '../api/client';

// 内部ではMockBffClientを使用（HttpBffClientに切り替え可能）
```

## 3. Missing Shared Component / Pattern（TODO）

### 現在のv0環境

すべての必要なUIコンポーネントは標準のshadcn/uiから利用可能です。

### Cursor環境への移行時

以下を確認・実装する必要があります:

#### 1. `@/shared/ui` バレルエクスポート

`apps/web/src/shared/ui/index.ts` が存在しない場合、作成が必要です:

```typescript
// apps/web/src/shared/ui/index.ts
export * from './components/button';
export * from './components/card';
export * from './components/table';
export * from './components/dialog';
export * from './components/input';
export * from './components/label';
export * from './components/textarea';
export * from './components/select';
export * from './components/badge';
export * from './components/alert';
export * from './components/alert-dialog';
export * from './components/separator';
```

#### 2. EPM Design System トークン

`apps/web/src/shared/ui/tokens/globals.css` でEPMテーマ（Deep Teal & Royal Indigo）が設定されていることを確認してください。

## 4. 移行ノート (_v0_drop → features)

### ステップ1: ファイル移動

```bash
# _v0_drop から features へ移動
mkdir -p apps/web/src/features/master-data/project-master
cp -r apps/web/_v0_drop/master-data/project-master/src/* \
      apps/web/src/features/master-data/project-master/
```

### ステップ2: contracts.ts の削除とインポート置き換え

```bash
# types/contracts.ts を削除
rm apps/web/src/features/master-data/project-master/types/contracts.ts
```

すべてのファイルで以下の置き換えを実施:

```typescript
// 変更前
import type { ... } from '../types/contracts';
import { ProjectMasterErrorCode } from '../types/contracts';

// 変更後
import type { ... } from '@epm/contracts/bff/project-master';
import { ProjectMasterErrorCode } from '@epm/contracts/bff/project-master';
```

### ステップ3: UIコンポーネントインポートの置き換え

すべてのコンポーネントファイルで以下の置き換えを実施:

```typescript
// 変更前
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
// ... etc

// 変更後
import { Button, Card, ... } from '@/shared/ui';
```

### ステップ4: Next.js App Router統合

```typescript
// apps/web/src/app/master-data/project-master/page.tsx を作成
export { default } from '@/features/master-data/project-master/app/page';
```

### ステップ5: BFFクライアント切り替え（本番準備時）

```typescript
// apps/web/src/features/master-data/project-master/api/client.ts
- export const bffClient: BffClient = new MockBffClient();
+ export const bffClient: BffClient = new HttpBffClient();
```

### インポートパス変更まとめ

| ファイル内の記述 | v0環境 | Cursor環境 |
|------------------|--------|-----------|
| BFF契約型 | `../types/contracts` | `@epm/contracts/bff/project-master` |
| UIコンポーネント | `@/components/ui/*` | `@/shared/ui` |
| BFFクライアント | `../api/client` | `@/features/master-data/project-master/api/client` |
| コンポーネント | `../components/*` | `@/features/master-data/project-master/components/*` |

## 5. 制約コンプライアンスチェックリスト

- [x] コードは `apps/web/_v0_drop/master-data/project-master/src` 配下のみに書かれている
- [x] UIコンポーネントは shadcn/ui Tier 1のみ使用（v0: `@/components/ui`, Cursor: `@/shared/ui`）
- [x] DTO型は BFF契約から取得（v0: `types/contracts.ts`, Cursor: `@epm/contracts/bff/project-master`）
- [x] `packages/contracts/src/api` からのインポートなし
- [x] Domain API 直接呼び出しなし（/api/への直接fetch禁止）
- [x] 直接 fetch() は `api/HttpBffClient.ts` 内のみ
- [x] layout.tsx は生成していない
- [x] 基本UIコンポーネント（Button/Input/Table等）をfeatures配下に作成していない
- [x] 生の色リテラル（bg-[#...]等）を使用していない（Tailwindセマンティッククラス使用）
- [x] features内に新しいサイドバー/ヘッダー/シェルレイアウトを作成していない

## 6. 機能概要

### 一覧画面（List）

- プロジェクト一覧表示（テーブル形式）
- キーワード検索（プロジェクトコード・プロジェクト名で部分一致）
- プロジェクトステータスフィルタ（全て/計画中/実行中/保留中/完了）
- 有効状態フィルタ（全て/有効のみ/無効のみ）
- ソート機能（プロジェクトコード/プロジェクト名/ステータス/開始日/終了日、昇順/降順）
- ページネーション（20/50/100件表示切替、前へ/次へナビゲーション）
- 新規登録ボタン → 登録ダイアログ表示

### プロジェクト詳細ダイアログ

- 詳細情報表示：
  - 基本情報：プロジェクトコード、プロジェクト名、プロジェクト名略称
  - ステータス：プロジェクトステータス（計画中/実行中/保留中/完了）、有効状態
  - プロジェクト情報：プロジェクトタイプ、開始日、終了日
  - 関連情報：外部参照キー、親プロジェクトID、責任部門ID、責任者ID
  - 備考、作成日時、更新日時
- アクションボタン:
  - 有効なプロジェクト：編集、無効化
  - 無効なプロジェクト：再有効化

### 登録・編集フォームダイアログ

- 必須項目：
  - プロジェクトコード（編集時は変更不可）
  - プロジェクト名
- 任意項目：
  - プロジェクト名略称
  - プロジェクトタイプ（例: CAPEX, OPEX）
  - プロジェクトステータス（デフォルト: 計画中）
  - 開始日、終了日（日付ピッカー）
  - 外部参照キー
  - 備考（複数行テキスト）
- バリデーション：
  - 必須項目の入力チェック
  - インラインエラー表示
- 送信時エラーハンドリング（重複コードエラー等）

### エラーハンドリング

BFFから返却されるエラーコードを日本語メッセージに変換:

- `PROJECT_NOT_FOUND` → 「プロジェクトが見つかりません」
- `PROJECT_CODE_DUPLICATE` → 「プロジェクトコードが重複しています」
- `PROJECT_ALREADY_INACTIVE` → 「このプロジェクトは既に無効化されています」
- `PROJECT_ALREADY_ACTIVE` → 「このプロジェクトは既に有効です」
- `PARENT_PROJECT_NOT_FOUND` → 「親プロジェクトが見つかりません」
- `INVALID_PARENT_PROJECT` → 「無効な親プロジェクトです」
- `VALIDATION_ERROR` → 「入力内容を確認してください」

エラーはページ上部にアラートとして表示。

## 7. 使用しているDTO・Enum

### ProjectStatus Enum

```typescript
export const ProjectStatus = {
  PLANNED: 'PLANNED',    // 計画中
  ACTIVE: 'ACTIVE',      // 実行中
  ON_HOLD: 'ON_HOLD',    // 保留中
  CLOSED: 'CLOSED',      // 完了
} as const;
```

### Request DTOs

- `BffListProjectsRequest`: 一覧取得リクエスト（ページング、ソート、フィルタ）
- `BffCreateProjectRequest`: プロジェクト新規登録
- `BffUpdateProjectRequest`: プロジェクト更新（部分更新対応）

### Response DTOs

- `BffListProjectsResponse`: 一覧レスポンス（items, totalCount, page, pageSize）
- `BffProjectSummary`: 一覧用プロジェクト要約情報
- `BffProjectDetailResponse`: プロジェクト詳細情報

### Error Types

- `ProjectMasterErrorCode`: エラーコード定義
- `ProjectMasterError`: エラーオブジェクト（code, message, details）

## 8. モックデータ

5件のサンプルプロジェクトを用意:

1. **PRJ001** - 基幹システム刷新プロジェクト (ACTIVE, 有効)
2. **PRJ002** - 新規事業開発プロジェクト (PLANNED, 有効)
3. **PRJ003** - レガシーシステム移行 (CLOSED, 無効)
4. **PRJ004** - DX推進プロジェクト (ON_HOLD, 有効)
5. **PRJ005** - コスト最適化プログラム (ACTIVE, 有効, 親プロジェクト: PRJ001)

すべてのモックデータは日本語の現実的な値を使用しています。

## 9. 次のステップ

### Cursor環境への移行後

1. **BFF実装**: `/api/bff/master-data/project-master` エンドポイントの実装
   - GET `/api/bff/master-data/project-master` - 一覧取得
   - GET `/api/bff/master-data/project-master/:id` - 詳細取得
   - POST `/api/bff/master-data/project-master` - 新規登録
   - PATCH `/api/bff/master-data/project-master/:id` - 更新
   - POST `/api/bff/master-data/project-master/:id/deactivate` - 無効化
   - POST `/api/bff/master-data/project-master/:id/reactivate` - 再有効化

2. **認証統合**: HttpBffClientに認証トークンヘッダー追加

3. **AppShell統合**: メニューにプロジェクトマスタ追加

4. **関連マスタ連携**: 
   - 親プロジェクト選択（プロジェクトマスタから）
   - 責任部門選択（部門マスタから）
   - 責任者選択（従業員マスタから）

5. **E2Eテスト**: Playwrightでフロー全体をテスト

6. **アクセシビリティ**: ARIA属性、キーボードナビゲーションの検証

### v0環境でのテスト

現在の実装は完全に動作するモック実装です。以下をテストできます:

- 一覧表示、検索、フィルタ、ソート、ページネーション
- 新規プロジェクト登録（フォームバリデーション含む）
- プロジェクト詳細表示
- プロジェクト編集
- プロジェクト無効化・再有効化
- エラーハンドリング（重複コードエラー等）
