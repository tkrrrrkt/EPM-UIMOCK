<!-- Source of truth: .kiro/steering/v0-workflow.md -->

# v0 Prompt: 労務費予算単価マスタ

Use the EPM Design System from: https://epm-registry-6xtkaywr0-tkoizumi-hira-tjps-projects.vercel.app

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

master-data/labor-cost-rate: 労務費予算算出のための「計画用単価」を管理するCRUD機能。職種・等級・雇用区分別の標準単価を登録・管理し、有効期間（effective_date / expiry_date）による時系列管理と基準日（asOfDate）による有効単価のフィルタリングが特徴。

## Screens to build

* **一覧画面**: 検索パネル（上部）+ テーブル（中央）+ ページネーション（下部）
  - 単価コード、職種、等級、雇用区分、単価種別（月額/時給）、計画単価、有効開始日、有効終了日、有効状態を表示
  - デフォルトで当日時点で有効な単価を表示（基準日=当日）
  - ページネーション（デフォルト20件/ページ）
  - ソート機能（単価コード、職種、等級、有効開始日、計画単価）
  - 検索・フィルタリング（キーワード、等級、雇用区分、単価種別、有効フラグ、基準日）
  - 無効化された単価はグレーアウト表示
  - 新規登録ボタン、各行に詳細/編集/無効化ボタン

* **詳細表示ダイアログ**: 一覧から単価を選択したときに表示
  - 全登録項目、作成日時、更新日時を表示
  - 編集・無効化ボタン

* **登録/編集ダイアログ**: 新規登録または編集時に表示
  - フォーム入力（単価コード、職種、等級、雇用区分、単価種別、計画単価、有効開始日、有効終了日、備考）
  - バリデーション（必須項目、文字数制限、数値制限、日付整合性）
  - エラー表示（フィールド単位、APIエラー）

---

## BFF Specification (from design.md)

### Endpoints (UI -> BFF)

| Method     | Endpoint | Purpose | Request DTO     | Response DTO     |
| ---------- | -------- | ------- | --------------- | ---------------- |
| GET | /api/bff/master-data/labor-cost-rate | 単価一覧取得 | BffListLaborCostRatesRequest | BffListLaborCostRatesResponse |
| GET | /api/bff/master-data/labor-cost-rate/:id | 単価詳細取得 | - | BffLaborCostRateDetailResponse |
| POST | /api/bff/master-data/labor-cost-rate | 単価新規登録 | BffCreateLaborCostRateRequest | BffLaborCostRateDetailResponse |
| PATCH | /api/bff/master-data/labor-cost-rate/:id | 単価情報更新 | BffUpdateLaborCostRateRequest | BffLaborCostRateDetailResponse |
| POST | /api/bff/master-data/labor-cost-rate/:id/deactivate | 単価無効化 | - | BffLaborCostRateDetailResponse |
| POST | /api/bff/master-data/labor-cost-rate/:id/reactivate | 単価再有効化 | - | BffLaborCostRateDetailResponse |

### DTOs to use (contracts/bff)

* Request DTOs:
  - `BffListLaborCostRatesRequest`: 一覧取得（page, pageSize, sortBy, sortOrder, keyword, grade, employmentType, rateType, isActive, asOfDate）
  - `BffCreateLaborCostRateRequest`: 新規登録（rateCode, jobCategory, grade?, employmentType?, rateType, plannedRate, effectiveDate, expiryDate?, notes?）
  - `BffUpdateLaborCostRateRequest`: 更新（全項目オプショナル）

* Response DTOs:
  - `BffListLaborCostRatesResponse`: 一覧レスポンス（items, totalCount, page, pageSize）
  - `BffLaborCostRateSummary`: 一覧項目（id, rateCode, jobCategory, grade, employmentType, rateType, plannedRate, effectiveDate, expiryDate, isActive）
  - `BffLaborCostRateDetailResponse`: 詳細（全項目 + createdAt, updatedAt）

* Errors:
  - `LaborCostRateErrorCode`: LABOR_COST_RATE_NOT_FOUND, RATE_CODE_DUPLICATE, LABOR_COST_RATE_ALREADY_INACTIVE, LABOR_COST_RATE_ALREADY_ACTIVE, INVALID_DATE_RANGE, VALIDATION_ERROR

### DTO import example (MANDATORY)

```ts
import type {
  BffListLaborCostRatesRequest,
  BffListLaborCostRatesResponse,
  BffLaborCostRateSummary,
  BffCreateLaborCostRateRequest,
  BffUpdateLaborCostRateRequest,
  BffLaborCostRateDetailResponse,
} from "@contracts/bff/labor-cost-rate";

import type {
  LaborCostRateErrorCode,
} from "@contracts/bff/labor-cost-rate";
```

### Error UI behavior

* Show validation errors inline per field (required, max length, format)
* Show API/business errors in a top alert panel
* Map error codes to user-friendly messages:
  - `LABOR_COST_RATE_NOT_FOUND`: "指定された単価が見つかりません"
  - `RATE_CODE_DUPLICATE`: "この単価コードは既に使用されています"
  - `LABOR_COST_RATE_ALREADY_INACTIVE`: "この単価は既に無効化されています"
  - `LABOR_COST_RATE_ALREADY_ACTIVE`: "この単価は既に有効です"
  - `INVALID_DATE_RANGE`: "有効終了日は有効開始日より後である必要があります"
  - `VALIDATION_ERROR`: "入力値に誤りがあります"

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
  - rateCode: "SE_G2_REGULAR", "SE_G3_CONTRACT", "SALES_G1_REGULAR", etc.
  - jobCategory: "SE", "営業", "管理", "設計"
  - grade: "G1", "G2", "G3", null
  - employmentType: "REGULAR", "CONTRACT", "PART_TIME", null
  - rateType: "MONTHLY" | "HOURLY"
  - plannedRate: "650000" (月額), "2500" (時給) - string format (Decimal)
  - effectiveDate: "2025-04-01", "2026-04-01"
  - expiryDate: "2026-03-31", null (無期限)
  - isActive: true, false
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
* Select (with Trigger, Value, Content, Item)
* Textarea
* DatePicker (Calendar + Popover)

### UI component import entrypoint (MANDATORY)
* Direct imports from `apps/web/src/shared/ui/components/*` are prohibited.
  If `@/shared/ui` barrel does not exist yet, add a TODO in OUTPUT.md (do NOT bypass via direct imports).

* UI components MUST be imported ONLY from:
  * `@/shared/ui`
* Assume `@/shared/ui` is a barrel entry that re-exports shared UI components.
* If the barrel entry does NOT exist yet:
  * Do NOT create it inside feature folders.
  * Do NOT import directly from `apps/web/src/shared/ui/components/*`.
  * Instead, add a TODO under `Missing Shared Component / Pattern` in OUTPUT.md describing what barrel export is needed.

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

## Dual Output Path (MANDATORY - Two Locations)

You MUST generate the same code in **TWO locations** to enable both local development and v0 preview:

### Location 1: Local Development Isolation Zone
* Write all generated code under:
  * `apps/web/_v0_drop/master-data/labor-cost-rate/src`
* This is the isolation zone for local development and migration.
* Assume this `src/` folder will later be moved to:
  * `apps/web/src/features/master-data/labor-cost-rate/`
* Do NOT write to `apps/web/src` directly.
* Do NOT place source files outside the `src/` folder under `_v0_drop` (src-only).

### Location 2: v0 Project App Directory (for Preview)
* **ALSO** write the same code to v0's project `app/` directory:
  * `app/master-data/labor-cost-rate/page.tsx` (or equivalent route structure)
  * `app/` directory components, if needed
* This enables **immediate preview and iteration** within v0's interface.
* The v0 app directory structure should mirror the isolation zone structure.

### Synchronization Rule (CRITICAL)
* **Both locations MUST contain identical code** at all times.
* When making any changes or adjustments:
  1. Update the code in **both locations simultaneously**
  2. Ensure file structure, imports, and logic remain identical
  3. Test in v0 preview (app directory) before finalizing
* The v0 app directory serves as the **preview/iteration workspace**
* The isolation zone (`_v0_drop`) serves as the **source of truth for migration**

### Why Dual Output?
* **v0 app directory**: Enables real-time preview, quick iterations, and visual feedback within v0
* **Isolation zone**: Maintains clean separation for local development, structure guards, and migration
* **Synchronization**: Ensures what you see in v0 preview matches what will be migrated to the project

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
  * `apps/web/_v0_drop/master-data/labor-cost-rate/src/api/HttpBffClient.ts`

### App Router / Shell

* Do NOT generate `layout.tsx` anywhere under the v0 output.
* Do NOT create a new sidebar/header/shell layout inside the feature.
* All screens MUST render inside the existing AppShell.

### Output Location (Dual Path)

* Write ALL generated code in **BOTH** locations:
  1. **Local Development**: `apps/web/_v0_drop/master-data/labor-cost-rate/src`
  2. **v0 Preview**: `app/master-data/labor-cost-rate/` (or equivalent v0 project structure)

* **CRITICAL**: Both locations must have identical code. Always update both when making changes.
* Do NOT write to `apps/web/src` directly.

---

## 🔻 REQUIRED OUTPUT ARTIFACT (MANDATORY)

You MUST create an `OUTPUT.md` file under:

* apps/web/_v0_drop/master-data/labor-cost-rate/src/OUTPUT.md

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
  * [ ] Code written in BOTH locations: `apps/web/_v0_drop/master-data/labor-cost-rate/src` AND `app/master-data/labor-cost-rate/`
  * [ ] Both locations contain identical code (synchronized)
  * [ ] v0 preview works correctly in v0's app directory
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

## UI Requirements Details

### 一覧画面

* **検索パネル（上部）**:
  - キーワード検索（Input、プレースホルダー: "単価コード・職種で検索"）
  - 等級フィルタ（Select、任意）
  - 雇用区分フィルタ（Select、任意）
  - 単価種別フィルタ（Select: 月額/時給/すべて）
  - 有効フラグフィルタ（Select: 有効/無効/すべて）
  - 基準日フィルタ（DatePicker、デフォルト: 当日）
  - 検索ボタン（Button primary）
  - リセットボタン（Button outline）

* **テーブル（中央）**:
  - カラム: 単価コード、職種、等級、雇用区分、単価種別、計画単価、有効開始日、有効終了日、有効状態、操作
  - 計画単価の表示:
    - 月額: `¥{plannedRate.toLocaleString()}` (例: ¥650,000)
    - 時給: `¥{plannedRate.toLocaleString()}/時` (例: ¥2,500/時)
  - 無効化された単価はグレーアウト表示（opacity-50）
  - 各行に操作ボタン: 詳細、編集、無効化/再有効化
  - ソート可能なカラム: 単価コード、職種、等級、有効開始日、計画単価

* **ページネーション（下部）**:
  - 前へ/次へボタン
  - ページ番号表示
  - 総件数表示

* **新規登録ボタン**: ページ上部右側（Button primary、アイコン: Plus）

### 詳細表示ダイアログ

* **表示項目**:
  - 単価コード、職種、等級、雇用区分、単価種別、計画単価（フォーマット済み）、有効開始日、有効終了日、有効状態、備考、作成日時、更新日時

* **操作ボタン**:
  - 編集（Button outline）
  - 無効化/再有効化（Button destructive / Button secondary）
  - 閉じる（Button ghost）

### 登録/編集ダイアログ

* **フォーム項目**:
  - 単価コード（Input、必須、最大50文字、半角英数字・ハイフン・アンダースコアのみ）
  - 職種（Input、必須、最大50文字）
  - 等級（Input、任意、最大50文字）
  - 雇用区分（Input、任意、最大50文字）
  - 単価種別（Select、必須、MONTHLY/HOURLY）
  - 計画単価（Input type="number"、必須、正の数値、小数点以下2桁まで）
  - 有効開始日（DatePicker、必須）
  - 有効終了日（DatePicker、任意）
  - 備考（Textarea、任意）

* **バリデーション**:
  - 必須項目チェック
  - 文字数制限（最大50文字）
  - 単価コード: 半角英数字・ハイフン・アンダースコアのみ（正規表現: `/^[a-zA-Z0-9_-]+$/`）
  - 計画単価: 正の数値、小数点以下2桁まで
  - 有効終了日: 有効開始日より後（クライアント側チェック）

* **エラー表示**:
  - フィールド単位のエラー（Alert、各フィールド下）
  - APIエラー（Alert、ダイアログ上部）

* **操作ボタン**:
  - 保存（Button primary）
  - キャンセル（Button outline）

---

## Handoff to Cursor

* Keep code modular and easy to migrate into:
  * apps/web/src/features/master-data/labor-cost-rate/
* Add brief migration notes in OUTPUT.md (what to move, what to refactor into shared/ui).
* Ensure all components are self-contained and follow the boundary rules.

## Iteration and Synchronization Workflow

When making adjustments or refinements:

1. **Update both locations simultaneously**:
   - Modify code in `apps/web/_v0_drop/master-data/labor-cost-rate/src`
   - Apply the same changes to `app/master-data/labor-cost-rate/` in v0 project

2. **Preview in v0**:
   - Use v0's preview feature to verify changes visually
   - Test interactions and UI behavior

3. **Verify synchronization**:
   - Ensure both locations remain identical
   - Check that imports and file structure match

4. **Final handoff**:
   - The isolation zone (`_v0_drop`) is the source of truth for migration
   - v0 app directory is for preview/iteration only
   - Migration scripts will use the isolation zone, not v0 app directory

