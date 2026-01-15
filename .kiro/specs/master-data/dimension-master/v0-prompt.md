# v0 Prompt: Dimension Master（ディメンションマスタ）

Use the EPM Design System from: https://epm-registry-6xtkaywr0-tkoizumi-hira-tjps-projects.vercel.app

---

## Context

You are generating UI for an EPM SaaS. The project uses SDD/CCSDD.
UI must follow boundary rules and must be easy to hand off to Cursor for implementation.

---

## Non-Negotiable Rules

* UI must call ONLY BFF endpoints (never call Domain API directly).
* UI must use ONLY `packages/contracts/src/bff` DTOs and errors.
* UI must NOT import or reference `packages/contracts/src/api`.
* Implement UI behavior, state, validation, and UX only. No business rules or domain authority in UI.
* Start with mock data (in the same shape as BFF DTOs). Later we will swap to real BFF calls.

---

## Feature

**master-data/dimension-master**: ディメンション（集計軸）とディメンション値（Group）を統一的に管理するCRUD機能。IRセグメント・製品カテゴリ・得意先グループ・地域など複数の分析軸を統一インターフェースで管理する。

---

## Screens to build

### Screen 1: ディメンション一覧画面
- **Purpose**: テナント内のディメンション（集計軸）を一覧表示・検索・管理
- **Main Interactions**:
  - ディメンション一覧をテーブル形式で表示
  - 検索条件（コード、名前、タイプ、有効フラグ）でフィルタリング
  - ソート（コード、名前、表示順）
  - ページネーション
  - 新規登録ダイアログを開く
  - 行クリックで詳細表示
  - 無効化/再有効化アクション

### Screen 2: ディメンション詳細/編集ダイアログ
- **Purpose**: ディメンションの詳細表示と編集
- **Main Interactions**:
  - 全項目の表示（コード、名前、タイプ、階層有無、必須フラグ、スコープポリシー、表示順、有効フラグ、作成日時、更新日時）
  - 編集モードへの切り替え
  - 更新の保存

### Screen 3: ディメンション新規登録ダイアログ
- **Purpose**: 新しいディメンションを登録
- **Main Interactions**:
  - 必須項目入力（コード、名前、タイプ）
  - オプション項目入力（階層有無、必須フラグ、スコープポリシー、表示順）
  - バリデーションエラー表示
  - 登録実行

### Screen 4: ディメンション値一覧画面
- **Purpose**: 選択されたディメンションに属する値（Group）を一覧表示・検索・管理
- **Main Interactions**:
  - 親ディメンションの情報表示（パンくず形式）
  - 値一覧をテーブル形式で表示（階層構造対応）
  - 検索条件（コード、名前、スコープタイプ、有効フラグ）でフィルタリング
  - ソート（コード、名前、表示順、階層レベル）
  - ページネーション
  - 新規登録ダイアログを開く
  - 行クリックで詳細表示
  - 無効化/再有効化アクション

### Screen 5: ディメンション値詳細/編集ダイアログ
- **Purpose**: ディメンション値の詳細表示と編集
- **Main Interactions**:
  - 全項目の表示（コード、名前、名前（短縮）、スコープタイプ、スコープ会社、親値、階層レベル、階層パス、表示順、有効フラグ、作成日時、更新日時）
  - 編集モードへの切り替え
  - 親値の変更（循環参照防止）
  - 更新の保存

### Screen 6: ディメンション値新規登録ダイアログ
- **Purpose**: 新しいディメンション値を登録
- **Main Interactions**:
  - 必須項目入力（コード、名前、スコープタイプ）
  - スコープタイプ=company時のスコープ会社選択（必須）
  - 親値の選択（階層構造用）
  - オプション項目入力（名前（短縮）、表示順）
  - バリデーションエラー表示
  - 登録実行

---

## BFF Specification (from design.md)

### Endpoints (UI -> BFF) - Dimension

| Method | Endpoint | Purpose | Request DTO | Response DTO |
|--------|----------|---------|-------------|--------------|
| GET | /api/bff/master-data/dimensions | ディメンション一覧取得 | BffListDimensionsRequest | BffListDimensionsResponse |
| GET | /api/bff/master-data/dimensions/:id | ディメンション詳細取得 | - | BffDimensionDetailResponse |
| POST | /api/bff/master-data/dimensions | ディメンション新規登録 | BffCreateDimensionRequest | BffDimensionDetailResponse |
| PATCH | /api/bff/master-data/dimensions/:id | ディメンション更新 | BffUpdateDimensionRequest | BffDimensionDetailResponse |
| POST | /api/bff/master-data/dimensions/:id/deactivate | ディメンション無効化 | - | BffDimensionDetailResponse |
| POST | /api/bff/master-data/dimensions/:id/reactivate | ディメンション再有効化 | - | BffDimensionDetailResponse |

### Endpoints (UI -> BFF) - Dimension Value

| Method | Endpoint | Purpose | Request DTO | Response DTO |
|--------|----------|---------|-------------|--------------|
| GET | /api/bff/master-data/dimensions/:dimensionId/values | 値一覧取得 | BffListDimensionValuesRequest | BffListDimensionValuesResponse |
| GET | /api/bff/master-data/dimensions/:dimensionId/values/:id | 値詳細取得 | - | BffDimensionValueDetailResponse |
| POST | /api/bff/master-data/dimensions/:dimensionId/values | 値新規登録 | BffCreateDimensionValueRequest | BffDimensionValueDetailResponse |
| PATCH | /api/bff/master-data/dimensions/:dimensionId/values/:id | 値更新 | BffUpdateDimensionValueRequest | BffDimensionValueDetailResponse |
| POST | /api/bff/master-data/dimensions/:dimensionId/values/:id/deactivate | 値無効化 | - | BffDimensionValueDetailResponse |
| POST | /api/bff/master-data/dimensions/:dimensionId/values/:id/reactivate | 値再有効化 | - | BffDimensionValueDetailResponse |

### DTOs to use (contracts/bff)

**Dimension DTOs:**

```typescript
// Request DTOs
export interface BffListDimensionsRequest {
  page?: number;           // default: 1
  pageSize?: number;       // default: 50, max: 200
  sortBy?: 'dimensionCode' | 'dimensionName' | 'sortOrder';
  sortOrder?: 'asc' | 'desc';
  keyword?: string;        // コード・名前部分一致
  dimensionType?: string;  // タイプフィルタ
  isActive?: boolean;      // 有効フラグフィルタ
}

export interface BffCreateDimensionRequest {
  dimensionCode: string;
  dimensionName: string;
  dimensionType: string;
  isHierarchical?: boolean;  // default: false
  isRequired?: boolean;      // default: false
  scopePolicy?: 'tenant' | 'company';  // default: 'tenant'
  sortOrder?: number;        // default: 0
}

export interface BffUpdateDimensionRequest {
  dimensionCode?: string;
  dimensionName?: string;
  dimensionType?: string;
  isHierarchical?: boolean;
  isRequired?: boolean;
  scopePolicy?: 'tenant' | 'company';
  sortOrder?: number;
}

// Response DTOs
export interface BffDimensionSummary {
  id: string;
  dimensionCode: string;
  dimensionName: string;
  dimensionType: string;
  isHierarchical: boolean;
  scopePolicy: 'tenant' | 'company';
  sortOrder: number;
  isActive: boolean;
}

export interface BffListDimensionsResponse {
  items: BffDimensionSummary[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface BffDimensionDetailResponse {
  id: string;
  dimensionCode: string;
  dimensionName: string;
  dimensionType: string;
  isHierarchical: boolean;
  isRequired: boolean;
  scopePolicy: 'tenant' | 'company';
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

**Dimension Value DTOs:**

```typescript
// Request DTOs
export interface BffListDimensionValuesRequest {
  page?: number;           // default: 1
  pageSize?: number;       // default: 50, max: 200
  sortBy?: 'valueCode' | 'valueName' | 'sortOrder' | 'hierarchyLevel';
  sortOrder?: 'asc' | 'desc';
  keyword?: string;        // コード・名前部分一致
  scopeType?: 'tenant' | 'company';
  scopeCompanyId?: string;
  isActive?: boolean;      // 有効フラグフィルタ
}

export interface BffCreateDimensionValueRequest {
  valueCode: string;
  valueName: string;
  valueNameShort?: string;
  scopeType: 'tenant' | 'company';
  scopeCompanyId?: string;  // scopeType='company' 時必須
  parentId?: string;        // 親値ID（階層構造用）
  sortOrder?: number;       // default: 0
}

export interface BffUpdateDimensionValueRequest {
  valueCode?: string;
  valueName?: string;
  valueNameShort?: string;
  scopeType?: 'tenant' | 'company';
  scopeCompanyId?: string;
  parentId?: string | null;  // null で親なしに変更可
  sortOrder?: number;
}

// Response DTOs
export interface BffDimensionValueSummary {
  id: string;
  valueCode: string;
  valueName: string;
  valueNameShort: string | null;
  scopeType: 'tenant' | 'company';
  parentId: string | null;
  hierarchyLevel: number;
  sortOrder: number;
  isActive: boolean;
}

export interface BffListDimensionValuesResponse {
  items: BffDimensionValueSummary[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface BffDimensionValueDetailResponse {
  id: string;
  dimensionId: string;
  valueCode: string;
  valueName: string;
  valueNameShort: string | null;
  scopeType: 'tenant' | 'company';
  scopeCompanyId: string | null;
  parentId: string | null;
  hierarchyLevel: number;
  hierarchyPath: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

**Errors:**

```typescript
export const DimensionMasterErrorCode = {
  DIMENSION_NOT_FOUND: 'DIMENSION_NOT_FOUND',
  DIMENSION_CODE_DUPLICATE: 'DIMENSION_CODE_DUPLICATE',
  DIMENSION_ALREADY_INACTIVE: 'DIMENSION_ALREADY_INACTIVE',
  DIMENSION_ALREADY_ACTIVE: 'DIMENSION_ALREADY_ACTIVE',
  DIMENSION_VALUE_NOT_FOUND: 'DIMENSION_VALUE_NOT_FOUND',
  VALUE_CODE_DUPLICATE: 'VALUE_CODE_DUPLICATE',
  DIMENSION_VALUE_ALREADY_INACTIVE: 'DIMENSION_VALUE_ALREADY_INACTIVE',
  DIMENSION_VALUE_ALREADY_ACTIVE: 'DIMENSION_VALUE_ALREADY_ACTIVE',
  CIRCULAR_REFERENCE_DETECTED: 'CIRCULAR_REFERENCE_DETECTED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;
```

### DTO import example (MANDATORY)

```ts
import type {
  BffListDimensionsRequest,
  BffListDimensionsResponse,
  BffDimensionDetailResponse,
  BffCreateDimensionRequest,
  BffUpdateDimensionRequest,
  BffListDimensionValuesRequest,
  BffListDimensionValuesResponse,
  BffDimensionValueDetailResponse,
  BffCreateDimensionValueRequest,
  BffUpdateDimensionValueRequest,
} from "packages/contracts/src/bff/dimension-master";
```

### Error UI behavior

* Show validation errors inline per field
* Show API/business errors in a top alert panel
* Map error codes to user-friendly messages:
  - DIMENSION_NOT_FOUND → 「ディメンションが見つかりません」
  - DIMENSION_CODE_DUPLICATE → 「ディメンションコードが重複しています」
  - DIMENSION_ALREADY_INACTIVE → 「このディメンションは既に無効化されています」
  - DIMENSION_ALREADY_ACTIVE → 「このディメンションは既に有効です」
  - DIMENSION_VALUE_NOT_FOUND → 「ディメンション値が見つかりません」
  - VALUE_CODE_DUPLICATE → 「値コードが重複しています」
  - DIMENSION_VALUE_ALREADY_INACTIVE → 「このディメンション値は既に無効化されています」
  - DIMENSION_VALUE_ALREADY_ACTIVE → 「このディメンション値は既に有効です」
  - CIRCULAR_REFERENCE_DETECTED → 「循環参照が発生するため更新できません」
  - VALIDATION_ERROR → フィールド別にインラインエラー表示

---

## UI Output Requirements

Generate Next.js (App Router) + TypeScript + Tailwind UI.
Include:

1. Routes/pages for the screens (**page.tsx only; see "No layout.tsx" rule below**)
2. A typed `BffClient` interface (methods correspond to endpoints above)
3. `MockBffClient` returning sample DTO-shaped data
4. `HttpBffClient` with fetch wrappers (but keep it unused initially, easy to switch)
5. Data models in UI must be the DTO types from contracts/bff
6. Minimal but production-like UI (tables, forms, search, pagination if needed)

---

## Mock Data Requirements

Provide mock data sets that:

* cover empty state, typical state, and error state
* use realistic values for EPM domain:
  - Dimension types: IR_SEGMENT, PRODUCT_CATEGORY, CUSTOMER_GROUP, REGION, CHANNEL
  - Dimension codes: SEG_IR, CAT_PROD, GRP_CUST, DIM_REGION, DIM_CHANNEL
  - Value examples: 国内事業, 海外事業, 製品A群, 製品B群, 関東エリア, 関西エリア
* strictly match the BFF response DTO shape

---

## Authentication / Tenant

* UI only attaches auth token to BFF requests.
* UI must not handle tenant_id directly.

---

# 🔒 REQUIRED: Design System & Repository Constraints (DO NOT REMOVE)

## EPM Design System Registry

You MUST use the EPM Design System from the custom registry:

* Registry URL: https://epm-registry-6xtkaywr0-tkoizumi-hira-tjps-projects.vercel.app
* Theme: EPM Theme - Deep Teal & Royal Indigo
* Primary Color: Deep Teal (oklch(0.52 0.13 195))
* Secondary Color: Royal Indigo (oklch(0.48 0.15 280))

---

## Source of Truth (SSoT)

You MUST follow these SSoT documents and files:

* apps/web/src/shared/ui/README.md
* apps/web/src/shared/ui/tokens/globals.css
* apps/web/src/shared/shell/AppShell.tsx (and related providers)
* apps/web/src/shared/navigation/menu.ts

---

## Design System Compliance

* Do NOT invent new base UI components (Button/Input/Table/Dialog/Tabs/etc).
* You MUST use Tier policy defined in:
  * apps/web/src/shared/ui/README.md (Tier 1/2/3)
  * apps/web/src/shared/ui/components/*
* v0 MUST use Tier 1 components by default.
  Use Tier 2/3 ONLY when explicitly instructed in the prompt.
* Do NOT create new "base UI" components under `apps/web/src/features/**`
  (e.g., button.tsx, input.tsx, table.tsx, dialog.tsx, tabs.tsx, badge.tsx).

### Available Tier 1 Components (EPM Registry)
* Button (primary=Deep Teal, secondary=Royal Indigo, destructive, outline, ghost, link)
* Table (with Header, Body, Row, Cell, Caption)
* Card (with Header, Title, Description, Content, Footer)
* Input (text, email, password, number, etc.)
* Dialog (with Trigger, Content, Header, Footer, Title, Description)
* Tabs (with List, Trigger, Content)
* Badge (default, secondary, destructive, outline)
* Alert (default, destructive with AlertTitle, AlertDescription)
* Separator (horizontal, vertical)
* Pagination (with Previous, Next, Item, Ellipsis)

### UI component import entrypoint (MANDATORY)
* Direct imports from `apps/web/src/shared/ui/components/*` are prohibited.
  If `@/shared/ui` barrel does not exist yet, add a TODO in OUTPUT.md (do NOT bypass via direct imports).
* UI components MUST be imported ONLY from:
  * `@/shared/ui`

### Missing Shared Component / Pattern policy

* If a needed component/pattern does not exist yet:
  * Do NOT implement it inside feature folders.
  * Instead, add a TODO list titled `Missing Shared Component / Pattern` in OUTPUT.md.

### Colors / spacing

* Do NOT hardcode colors (no `bg-[#...]`, no arbitrary color values).
* Use tokens / CSS variables / existing Tailwind semantic classes.
* Keep spacing and radius consistent:
  * use Tailwind scale (p-4, gap-4, rounded-lg, etc.)
  * avoid arbitrary values like `p-[16px]`.

---

## App Shell / Layout (MANDATORY)

* The screens must render inside the App Shell layout.
* Do NOT create a new sidebar/header layout inside the feature.
* Feature UI should be only the content area (cards/tables/forms/etc).

---

## v0 Isolation Output Path (MANDATORY)

* Write all generated code ONLY under:
  * apps/web/_v0_drop/master-data/dimension-master/src
* Assume this `src/` folder will later be moved to:
  * apps/web/src/features/master-data/dimension-master/
* Do NOT write to apps/web/src directly.
* Do NOT place source files outside the `src/` folder under `_v0_drop` (src-only).

---

## Prohibited Imports / Calls (MANDATORY)

### Imports / Contracts

* UI must NOT import from `packages/contracts/src/api`.
* UI must use `packages/contracts/src/bff` DTOs and errors only.
* Do NOT redefine DTO/Enum/Error types inside feature code (contracts are SSoT).

### Network Access

* UI must NOT call Domain API directly (no `/api/...` calls).
* UI must NOT create direct `fetch()` calls outside HttpBffClient wrapper.
* Direct `fetch()` is allowed ONLY inside:
  * `apps/web/_v0_drop/master-data/dimension-master/src/api/HttpBffClient.ts`

### App Router / Shell

* Do NOT generate `layout.tsx` anywhere under the v0 output.
* Do NOT create a new sidebar/header/shell layout inside the feature.
* All screens MUST render inside the existing AppShell.

### Output Location

* Write ALL generated code ONLY under:
  * `apps/web/_v0_drop/master-data/dimension-master/src`
* Do NOT write to `apps/web/src` directly.

---

## 🔻 REQUIRED OUTPUT ARTIFACT (MANDATORY)

You MUST create an `OUTPUT.md` file under:

* apps/web/_v0_drop/master-data/dimension-master/src/OUTPUT.md

`OUTPUT.md` MUST include the following sections:

### 1) Generated files (tree)

* Provide a complete tree of everything you generated under the `src/` folder.

### 2) Key imports / dependency notes

* List important imports and where they come from:
  * `@/shared/ui` usage
  * `packages/contracts/src/bff` DTO imports
  * `BffClient` / `MockBffClient` / `HttpBffClient` relationships

### 3) Missing Shared Component / Pattern (TODO)

* A TODO list of any shared UI components/patterns you wanted but did not exist.
* Include suggested filenames and where they should live (shared/ui side).
* Do NOT implement them in the feature.

### 4) Migration notes (_v0_drop → features)

* Step-by-step migration plan:
  * what folder to move
  * what paths/imports will change
  * what should be refactored into shared/ui (if any)

### 5) Constraint compliance checklist

* Check all items explicitly:
  * [ ] Code written ONLY under `apps/web/_v0_drop/master-data/dimension-master/src`
  * [ ] UI components imported ONLY from `@/shared/ui`
  * [ ] DTO types imported from `packages/contracts/src/bff` (no UI re-definition)
  * [ ] No imports from `packages/contracts/src/api`
  * [ ] No Domain API direct calls (/api/)
  * [ ] No direct fetch() outside `api/HttpBffClient.ts`
  * [ ] No layout.tsx generated
  * [ ] No base UI components created under features
  * [ ] No raw color literals (bg-[#...], etc.)
  * [ ] No new sidebar/header/shell created inside the feature

---

## Handoff to Cursor

* Keep code modular and easy to migrate into:
  * apps/web/src/features/master-data/dimension-master/
* Add brief migration notes in OUTPUT.md (what to move, what to refactor into shared/ui).

---

## UI Design Notes (EPM Domain Specific)

### ディメンション一覧画面
- dimensionType を Badge で視覚的に区別（例: IR_SEGMENT=primary, PRODUCT_CATEGORY=secondary）
- isHierarchical を階層アイコン（TreeIcon）で表示
- isActive を Badge（有効=success, 無効=secondary）で表示
- scopePolicy を小さなラベル（T=tenant, C=company）で表示

### ディメンション値一覧画面
- hierarchyLevel に応じたインデント表示（level * 16px padding-left）
- 親値名を表示（parentId がある場合）
- scopeType を Badge で表示（tenant=outline, company=secondary）
- 階層構造の視覚化（TreeView または階層パス表示）

### フォーム
- dimensionType は Select で選択（候補: IR_SEGMENT, PRODUCT_CATEGORY, CUSTOMER_GROUP, REGION, CHANNEL）
- scopePolicy / scopeType は RadioGroup または Select
- scopeType=company 時のみ scopeCompanyId の Select を表示（条件付き表示）
- parentId は同一ディメンション内の値から選択（自身と子孫は除外）
