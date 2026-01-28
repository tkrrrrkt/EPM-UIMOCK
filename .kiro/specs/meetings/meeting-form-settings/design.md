# 報告フォーム設定 Design

> **ステータス**: 設計完了（承認待ち）
> **作成日**: 2026-01-26
> **スコープ**: A3（報告フォーム設定）

---

## Spec Reference（INPUT情報）

本設計を作成するにあたり、以下の情報を確認した：

### Requirements（直接INPUT）
- **参照ファイル**: `.kiro/specs/meetings/meeting-form-settings/requirements.md`
- **要件バージョン**: 2026-01-26

### 仕様概要（確定済み仕様）
- **参照ファイル**: `.kiro/specs/仕様概要/経営会議レポート機能.md`
- **設計に影響する仕様ポイント**:
  - 報告フォーム（セクション・項目）の階層構造
  - 8種類の項目タイプ（TEXT/TEXTAREA/NUMBER/SELECT/MULTI_SELECT/DATE/FILE/FORECAST_QUOTE）
  - 入力スコープ（DEPARTMENT/BU/COMPANY）による部門別入力制御

### エンティティ定義（Data Model 正本）
- **参照ファイル**: `.kiro/specs/仕様検討/20260115_経営会議レポート機能.md`
- **対象エンティティ**: meeting_form_sections（5.3）、meeting_form_fields（5.4）

### 仕様検討（経緯・背景）
- **参照ファイル**: `.kiro/specs/仕様検討/20260115_経営会議レポート機能.md`
- **設計判断に影響した経緯**: A3（INPUT側）と A4（OUTPUT側）の明確な分離方針

---

## INPUT整合性チェック

| チェック項目 | 確認結果 |
|-------------|---------|
| requirements.md との整合性 | 設計が全要件をカバーしている: ✅ |
| 仕様概要との整合性 | 設計が仕様概要と矛盾しない: ✅ |
| エンティティとの整合性 | Data Model がエンティティ定義に準拠: ✅ |
| 仕様検討の背景理解 | 設計判断の背景を確認した: ✅ |

---

## Overview

報告フォーム設定（A3）は、会議種別ごとに部門報告のフォーム構造を定義する管理画面である。

システム管理者は、セクション（大項目）と項目（入力フィールド）を階層的に管理し、各項目のタイプ（テキスト、選択肢、ファイル等）や検証ルールを設定できる。設定したフォームはプレビュー機能で確認でき、このプレビューコンポーネントは部門報告登録画面（C1）と共通化される。

ドラッグ＆ドロップによる並べ替え機能を提供し、直感的なフォーム構成編集を可能にする。

---

## Architecture

### Architecture Pattern & Boundary Map

**Pattern (fixed)**:
- UI（apps/web） → BFF（apps/bff） → Domain API（apps/api） → DB（PostgreSQL + RLS）
- UI直APIは禁止

**Contracts (SSoT)**:
- UI ↔ BFF: `packages/contracts/src/bff/meetings/`
- BFF ↔ Domain API: `packages/contracts/src/api/meetings/`（将来）
- Enum/Error: `packages/contracts/src/shared/enums/meetings/`
- UI は `packages/contracts/src/api` を参照してはならない

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              UI Layer                                    │
│  apps/web/src/features/meetings/meeting-form-settings/                  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ FormSettingsPage                                                  │   │
│  │ 報告フォーム設定画面                                             │   │
│  │                                                                   │   │
│  │ ┌─────────────────┐  ┌────────────────────────────────────────┐ │   │
│  │ │ SectionTree     │  │ DetailPanel                            │ │   │
│  │ │ セクション一覧  │  │ セクション/項目詳細                    │ │   │
│  │ │ (DnD対応)       │  │                                        │ │   │
│  │ └─────────────────┘  └────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────┬────────────────────┘   │
│                                                 │                        │
│                                           BffClient                      │
│                                                 │                        │
└─────────────────────────────────────────────────┼────────────────────────┘
                                                  │ HTTP (JSON)
                                                  │ /api/bff/meetings/form-*
┌─────────────────────────────────────────────────┼────────────────────────┐
│                                            BFF Layer                     │
│  apps/bff/src/modules/meetings/management-meeting-report/               │
│                                                                          │
│  ManagementMeetingReportController                                       │
│    + FormSections / FormFields endpoints                                 │
│                                                                          │
│  ManagementMeetingReportService                                          │
│    + Section/Field CRUD                                                  │
│    + SortOrder reorder                                                   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Architecture Responsibilities（Mandatory）

### BFF Specification（apps/bff）

**Purpose**
- UI要件に最適化した API（セクション・項目の CRUD + 並べ替え）
- Phase 1（UI-MOCK）では Mock Data を返却
- Phase 2 以降で Domain API 連携

**BFF Endpoints（UIが叩く）**

| Method | Endpoint | Purpose | Request DTO | Response DTO |
|--------|----------|---------|-------------|--------------|
| GET | `/bff/meetings/form-sections/:meetingTypeId` | セクション一覧取得 | - | FormSectionListDto |
| POST | `/bff/meetings/form-sections` | セクション作成 | CreateFormSectionDto | FormSectionDto |
| PUT | `/bff/meetings/form-sections/:id` | セクション更新 | UpdateFormSectionDto | FormSectionDto |
| DELETE | `/bff/meetings/form-sections/:id` | セクション削除 | - | void |
| PUT | `/bff/meetings/form-sections/reorder` | セクション並べ替え | ReorderSectionsDto | FormSectionListDto |
| GET | `/bff/meetings/form-fields/:sectionId` | 項目一覧取得 | - | FormFieldListDto |
| POST | `/bff/meetings/form-fields` | 項目作成 | CreateFormFieldDto | FormFieldDto |
| PUT | `/bff/meetings/form-fields/:id` | 項目更新 | UpdateFormFieldDto | FormFieldDto |
| DELETE | `/bff/meetings/form-fields/:id` | 項目削除 | - | void |
| PUT | `/bff/meetings/form-fields/reorder` | 項目並べ替え | ReorderFieldsDto | FormFieldListDto |

**Naming Convention（必須）**
- DTO / Contracts: camelCase（例: `sectionCode`, `fieldName`）
- DB columns: snake_case（例: `section_code`, `field_name`）
- `sortBy` は DTO側キー を採用する

**Paging / Sorting Normalization（必須・BFF責務）**

本 Feature では一覧取得時にページングを使用しない（全件取得）。
並べ替えは sortOrder 昇順固定。

**Transformation Rules（api DTO → bff DTO）**
- Phase 1（Mock）: BFF Service 内で Mock Data を直接返却
- Phase 2 以降: Domain API レスポンスを BFF DTO に変換

**Error Policy（必須）**
- 採用方針：**Option A: Pass-through**
- 採用理由：マスタ CRUD は Domain API のエラーをそのまま返却で十分。特別な UI 整形不要。

**Authentication / Tenant Context（tenant_id/user_id伝搬）**
- tenant_id は認証 Middleware で解決し、Service に伝搬
- Phase 1（Mock）では固定 tenant_id を使用
- Domain API へは header（x-tenant-id）で伝搬

---

### Service Specification（Domain / apps/api）

**Note**: Phase 1（UI-MOCK）では BFF 内で Mock Data を返却。Domain API 実装は Phase 2 以降。

将来の Domain API 責務：
- セクション・項目の CRUD
- ビジネスルール検証（コード重複チェック、参照整合性）
- トランザクション境界の管理
- 監査ログ記録

---

### Repository Specification（apps/api）

**Note**: Phase 1 では未実装。Phase 2 以降で実装。

将来の Repository 責務：
- tenant_id 必須（全メソッド）
- where句二重ガード必須
- set_config 前提（RLS無効化禁止）

---

### Contracts Summary（This Feature）

**配置先**: `packages/contracts/src/bff/meetings/`

#### Enums

```typescript
// packages/contracts/src/shared/enums/meetings/FormFieldType.ts
export type FormFieldType =
  | 'TEXT'
  | 'TEXTAREA'
  | 'NUMBER'
  | 'SELECT'
  | 'MULTI_SELECT'
  | 'DATE'
  | 'FILE'
  | 'FORECAST_QUOTE';

// packages/contracts/src/shared/enums/meetings/InputScope.ts
export type InputScope =
  | 'DEPARTMENT'
  | 'BU'
  | 'COMPANY';
```

#### DTOs

| DTO | 用途 | 配置先 |
|-----|------|--------|
| `FormSectionDto` | セクション詳細 | bff/meetings/ |
| `FormSectionListDto` | セクション一覧 | bff/meetings/ |
| `CreateFormSectionDto` | セクション作成リクエスト | bff/meetings/ |
| `UpdateFormSectionDto` | セクション更新リクエスト | bff/meetings/ |
| `ReorderSectionsDto` | セクション並べ替えリクエスト | bff/meetings/ |
| `FormFieldDto` | 項目詳細 | bff/meetings/ |
| `FormFieldListDto` | 項目一覧 | bff/meetings/ |
| `CreateFormFieldDto` | 項目作成リクエスト | bff/meetings/ |
| `UpdateFormFieldDto` | 項目更新リクエスト | bff/meetings/ |
| `ReorderFieldsDto` | 項目並べ替えリクエスト | bff/meetings/ |
| `FieldOptionDto` | 選択肢（options_json の要素） | bff/meetings/ |
| `FieldValidationDto` | 検証ルール（validation_json） | bff/meetings/ |

#### DTO Definitions

```typescript
// FormSectionDto
export interface FormSectionDto {
  id: string;
  meetingTypeId: string;
  sectionCode: string;
  sectionName: string;
  inputScope: InputScope;
  isRequired: boolean;
  sortOrder: number;
  description?: string;
  isActive: boolean;
  fieldCount: number; // 所属項目数
}

// FormSectionListDto
export interface FormSectionListDto {
  items: FormSectionDto[];
  total: number;
}

// CreateFormSectionDto
export interface CreateFormSectionDto {
  meetingTypeId: string;
  sectionCode: string;
  sectionName: string;
  inputScope: InputScope;
  isRequired: boolean;
  description?: string;
}

// UpdateFormSectionDto
export interface UpdateFormSectionDto {
  sectionCode?: string;
  sectionName?: string;
  inputScope?: InputScope;
  isRequired?: boolean;
  description?: string;
  isActive?: boolean;
}

// ReorderSectionsDto
export interface ReorderSectionsDto {
  meetingTypeId: string;
  orderedIds: string[]; // 並べ替え後の ID 配列
}

// FieldOptionDto（選択肢）
export interface FieldOptionDto {
  value: string;
  label: string;
}

// FieldValidationDto（検証ルール）
export interface FieldValidationDto {
  min?: number;           // NUMBER用
  max?: number;           // NUMBER用
  allowedTypes?: string[]; // FILE用（例: ["pdf", "xlsx"]）
  maxSize?: number;        // FILE用（バイト単位）
  pattern?: string;        // TEXT用（正規表現）
}

// FormFieldDto
export interface FormFieldDto {
  id: string;
  sectionId: string;
  fieldCode: string;
  fieldName: string;
  fieldType: FormFieldType;
  isRequired: boolean;
  placeholder?: string;
  options?: FieldOptionDto[];      // SELECT/MULTI_SELECT用
  validation?: FieldValidationDto; // 検証ルール
  defaultValue?: string;
  maxLength?: number;              // TEXT/TEXTAREA用
  helpText?: string;
  sortOrder: number;
  isActive: boolean;
}

// FormFieldListDto
export interface FormFieldListDto {
  items: FormFieldDto[];
  total: number;
}

// CreateFormFieldDto
export interface CreateFormFieldDto {
  sectionId: string;
  fieldCode: string;
  fieldName: string;
  fieldType: FormFieldType;
  isRequired: boolean;
  placeholder?: string;
  options?: FieldOptionDto[];
  validation?: FieldValidationDto;
  defaultValue?: string;
  maxLength?: number;
  helpText?: string;
}

// UpdateFormFieldDto
export interface UpdateFormFieldDto {
  fieldCode?: string;
  fieldName?: string;
  fieldType?: FormFieldType;
  isRequired?: boolean;
  placeholder?: string;
  options?: FieldOptionDto[];
  validation?: FieldValidationDto;
  defaultValue?: string;
  maxLength?: number;
  helpText?: string;
  isActive?: boolean;
}

// ReorderFieldsDto
export interface ReorderFieldsDto {
  sectionId: string;
  orderedIds: string[]; // 並べ替え後の ID 配列
}
```

---

## Responsibility Clarification（Mandatory）

本 Feature における責務境界を以下に明記する。
未記載の責務は実装してはならない。

### UIの責務
- セクション・項目の一覧表示、詳細表示
- フォーム入力制御・UX最適化（動的フォーム切り替え）
- ドラッグ＆ドロップ並べ替え UI
- プレビュー表示（入力フォームの見た目確認）
- 確認ダイアログ表示（削除時）
- ビジネス判断は禁止

### BFFの責務
- UI入力の正規化（options_json / validation_json の検証）
- Mock Data の提供（Phase 1）
- Domain API 呼び出しと DTO 変換（Phase 2 以降）
- ビジネスルールの正本は持たない

### Domain APIの責務（Phase 2 以降）
- ビジネスルールの正本（コード重複チェック、参照整合性）
- トランザクション管理
- 監査ログ記録

---

## Data Model（エンティティ整合性確認必須）

### Entity Reference
- 参照元: `.kiro/specs/仕様検討/20260115_経営会議レポート機能.md` セクション 5.3, 5.4

### エンティティ整合性チェックリスト

| チェック項目 | 確認結果 |
|-------------|---------|
| カラム網羅性 | エンティティ定義の全カラムがDTOに反映されている: ✅ |
| 型の一致 | varchar→string, jsonb→object 等の型変換が正確: ✅ |
| 制約の反映 | UNIQUE制約がアプリ検証に反映: ✅ |
| ビジネスルール | エンティティ補足のルールがServiceに反映: ✅ |
| NULL許可 | NULL/NOT NULLが必須/optional に正しく対応: ✅ |

### Prisma Schema（Phase 2 で追加）

```prisma
model MeetingFormSection {
  id             String   @id @default(uuid())
  tenantId       String   @map("tenant_id")
  meetingTypeId  String   @map("meeting_type_id")
  sectionCode    String   @map("section_code") @db.VarChar(50)
  sectionName    String   @map("section_name") @db.VarChar(200)
  inputScope     String   @map("input_scope") @db.VarChar(20)
  isRequired     Boolean  @map("is_required")
  sortOrder      Int      @map("sort_order")
  description    String?  @db.Text
  isActive       Boolean  @map("is_active") @default(true)
  createdAt      DateTime @map("created_at") @default(now())
  updatedAt      DateTime @map("updated_at") @updatedAt

  meetingType    MeetingType        @relation(fields: [tenantId, meetingTypeId], references: [tenantId, id])
  fields         MeetingFormField[]

  @@unique([tenantId, meetingTypeId, sectionCode])
  @@map("meeting_form_sections")
}

model MeetingFormField {
  id             String   @id @default(uuid())
  tenantId       String   @map("tenant_id")
  sectionId      String   @map("section_id")
  fieldCode      String   @map("field_code") @db.VarChar(50)
  fieldName      String   @map("field_name") @db.VarChar(200)
  fieldType      String   @map("field_type") @db.VarChar(20)
  isRequired     Boolean  @map("is_required")
  placeholder    String?  @db.VarChar(200)
  optionsJson    Json?    @map("options_json")
  validationJson Json?    @map("validation_json")
  defaultValue   String?  @map("default_value") @db.Text
  maxLength      Int?     @map("max_length")
  sortOrder      Int      @map("sort_order")
  helpText       String?  @map("help_text") @db.Text
  isActive       Boolean  @map("is_active") @default(true)
  createdAt      DateTime @map("created_at") @default(now())
  updatedAt      DateTime @map("updated_at") @updatedAt

  section        MeetingFormSection @relation(fields: [tenantId, sectionId], references: [tenantId, id], onDelete: Cascade)

  @@unique([tenantId, sectionId, fieldCode])
  @@map("meeting_form_fields")
}
```

### Constraints（エンティティ定義から転記）
- **meeting_form_sections**:
  - PK: id（UUID）
  - UNIQUE: (tenant_id, meeting_type_id, section_code)
  - FK: (tenant_id, meeting_type_id) → meeting_types
  - CHECK: input_scope IN ('DEPARTMENT', 'BU', 'COMPANY')

- **meeting_form_fields**:
  - PK: id（UUID）
  - UNIQUE: (tenant_id, section_id, field_code)
  - FK: (tenant_id, section_id) → meeting_form_sections (CASCADE DELETE)
  - CHECK: field_type IN ('TEXT', 'TEXTAREA', 'NUMBER', 'SELECT', 'MULTI_SELECT', 'DATE', 'FILE', 'FORECAST_QUOTE')

### RLS Policy
```sql
ALTER TABLE meeting_form_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_form_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON meeting_form_sections
  USING (tenant_id::text = current_setting('app.tenant_id', true));

CREATE POLICY tenant_isolation ON meeting_form_fields
  USING (tenant_id::text = current_setting('app.tenant_id', true));
```

---

## UI Implementation

### ディレクトリ構成

```
apps/web/src/features/meetings/meeting-form-settings/
├── components/
│   ├── form-settings-page.tsx       # メインページ
│   ├── section-tree.tsx             # セクション一覧（左ペイン）
│   ├── section-item.tsx             # セクションアイテム（DnD対応）
│   ├── field-item.tsx               # フィールドアイテム（DnD対応）
│   ├── section-detail-panel.tsx     # セクション詳細（右ペイン）
│   ├── field-detail-panel.tsx       # 項目詳細（右ペイン）
│   ├── dialogs/
│   │   ├── create-section-dialog.tsx
│   │   ├── create-field-dialog.tsx
│   │   └── delete-confirm-dialog.tsx
│   └── shared/
│       ├── options-editor.tsx       # 選択肢編集コンポーネント
│       └── validation-editor.tsx    # 検証ルール編集コンポーネント
├── api/
│   ├── bff-client.ts                # BffClient Interface
│   ├── mock-bff-client.ts           # MockBffClient
│   └── http-bff-client.ts           # HttpBffClient
├── hooks/
│   └── use-form-settings.ts         # セクション・項目の状態管理
└── index.ts
```

### UIパターン適用

| 画面 | パターン | 参照 |
|------|----------|------|
| A3 | 設定パターン（2カラム構成） | 独自パターン |

### 画面レイアウト（ワイヤーフレーム）

```
┌────────────────────────────────────────────────────────────────────────────┐
│ [← 戻る] 報告フォーム設定                                    [プレビュー] │
│ 月次経営会議 のフォーム構成を設定してください                             │
├─────────────────────────────┬──────────────────────────────────────────────┤
│ セクション一覧              │ 詳細設定                                     │
│                             │                                              │
│ ┌─────────────────────────┐ │ ┌──────────────────────────────────────────┐ │
│ │ ☰ 業績サマリー (3)      │ │ │ [Card: セクション設定]                   │ │
│ │   └ 売上見通し          │ │ │                                          │ │
│ │   └ 利益見通し          │ │ │ セクションコード *                       │ │
│ │   └ サマリーコメント    │ │ │ [SALES_REPORT          ]                │ │
│ ├─────────────────────────┤ │ │                                          │ │
│ │ ☰ 差異要因 (3)          │ │ │ セクション名 *                           │ │
│ │   └ 売上差異の主要因    │ │ │ [業績サマリー          ]                │ │
│ │   └ 粗利差異の主要因    │ │ │                                          │ │
│ │   └ 販管費差異の主要因  │ │ │ 入力スコープ *                           │ │
│ ├─────────────────────────┤ │ │ [v] 部門ごとに入力                       │ │
│ │ ☰ リスク・課題 (2)      │ │ │                                          │ │
│ │   └ 主要リスク          │ │ │ [ ] 必須セクション                       │ │
│ │   └ 対応状況            │ │ │                                          │ │
│ ├─────────────────────────┤ │ │ 説明                                     │ │
│ │ ☰ アクション (2)        │ │ │ [                      ]                │ │
│ │   └ 今月の重点施策      │ │ │                                          │ │
│ │   └ 経営への要請事項    │ │ │           [保存] [キャンセル] [削除]     │ │
│ ├─────────────────────────┤ │ └──────────────────────────────────────────┘ │
│ │ ☰ 添付資料 (1)          │ │                                              │
│ │   └ 補足資料            │ │                                              │
│ └─────────────────────────┘ │                                              │
│                             │                                              │
│ [+ セクション追加]          │                                              │
└─────────────────────────────┴──────────────────────────────────────────────┘
```

### プレビュー画面（別ルート）

```
/meetings/meeting-form-settings/:meetingTypeId/preview
```

プレビューコンポーネントは `shared/components/form-preview.tsx` として共通化し、
C1（部門報告登録）でも使用する。

### ドラッグ＆ドロップ実装

**採用ライブラリ**: @dnd-kit/core + @dnd-kit/sortable

```typescript
// 使用例
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
```

---

## Requirements Traceability

| 要件ID | 要件 | 設計セクション | 実装責務 |
|--------|------|----------------|----------|
| 1.1 | セクション一覧表示 | UI section-tree.tsx | UI |
| 1.2 | セクション詳細表示 | UI section-tree.tsx | UI |
| 1.4 | セクション展開・項目表示 | UI section-tree.tsx | UI |
| 2.1 | セクション作成 | BFF POST /form-sections | BFF + UI |
| 2.2 | セクションコード一意性 | BFF Validation | BFF |
| 3.1 | セクション更新 | BFF PUT /form-sections/:id | BFF + UI |
| 4.1-4.4 | セクション削除 | BFF DELETE /form-sections/:id | BFF + UI |
| 5.1-5.3 | セクション並べ替え | BFF PUT /form-sections/reorder | BFF + UI |
| 6.1-6.4 | 項目一覧表示 | UI section-tree.tsx | UI |
| 7.1-7.6 | 項目作成 | BFF POST /form-fields | BFF + UI |
| 8.1-8.8 | 項目タイプ設定 | UI field-detail-panel.tsx | UI |
| 9.1-9.6 | 選択肢設定 | UI options-editor.tsx | UI |
| 10.1-10.4 | 検証ルール設定 | UI validation-editor.tsx | UI |
| 11.1-11.5 | 項目更新 | BFF PUT /form-fields/:id | BFF + UI |
| 12.1-12.3 | 項目削除 | BFF DELETE /form-fields/:id | BFF + UI |
| 13.1-13.4 | 項目並べ替え | BFF PUT /form-fields/reorder | BFF + UI |
| 14.1-14.8 | フォームプレビュー | UI form-preview.tsx (shared) | UI |
| 15.1-15.4 | 標準テンプレート | BFF + UI | BFF + UI |

---

## 変更履歴

| 日付 | 変更内容 |
|------|----------|
| 2026-01-26 | 初版作成 |
