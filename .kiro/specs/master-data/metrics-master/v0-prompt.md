# v0 Prompt: Metrics Master

Use the EPM Design System from: https://epm-registry-6xtkaywr0-tkoizumi-hira-tjps-projects.vercel.app

---

## Context

You are generating UI for an EPM SaaS. The project uses SDD/CCSDD.
UI must follow boundary rules and must be easy to hand off to Cursor for implementation.

---

## EPM Design System (MANDATORY - READ FIRST)

### 🎨 Design System Source of Truth

You MUST follow the EPM Design System defined in `.kiro/steering/epm-design-system.md` (973 lines).

**Key Design Principles:**
- **Modern, clean, minimalist** aesthetic
- **Accessibility-first** (WCAG 2.1 AA compliant)
- **Consistent spacing** (0.25rem/4px base unit)
- **Dark mode support** (automatic theme switching)

### Color Palette (MANDATORY)

**Primary - Deep Teal:**
```css
--primary-500: oklch(0.52 0.13 195); /* Main Deep Teal */
```

**Secondary - Royal Indigo:**
```css
--secondary-500: oklch(0.48 0.15 280); /* Main Royal Indigo */
```

**Semantic Colors:**
```css
--success: oklch(0.65 0.18 150);  /* Green for success states */
--warning: oklch(0.75 0.15 70);   /* Amber for warnings */
--error: oklch(0.6 0.22 25);      /* Red for errors */
--info: oklch(0.6 0.15 240);      /* Blue for info */
```

**Color Usage Rules:**
- ✅ Use CSS variables: `bg-primary`, `text-secondary`, `border-error`
- ✅ Use semantic tokens: `bg-background`, `text-foreground`, `border-input`
- ❌ NEVER use raw color literals: `bg-[#14b8a6]`, `text-[oklch(...)]`
- ❌ NEVER use arbitrary Tailwind colors: `bg-teal-500`, `text-indigo-600`

### Typography System

**Font Family:**
- Sans: `Geist`, `Geist Fallback` (default)
- Mono: `Geist Mono`, `Geist Mono Fallback` (code)

**Type Scale:**
```
Heading 1: text-4xl font-bold tracking-tight
Heading 2: text-3xl font-bold tracking-tight
Heading 3: text-2xl font-semibold tracking-tight
Heading 4: text-xl font-semibold
Body:      text-base leading-relaxed
Small:     text-sm leading-relaxed
Muted:     text-sm text-muted-foreground
```

### Spacing System

**Base Unit:** 0.25rem (4px)

**Common Spacing:**
```
gap-2    (8px)   - tight spacing
gap-4    (16px)  - default spacing
gap-6    (24px)  - section spacing
gap-8    (32px)  - major section spacing
gap-12   (48px)  - page section spacing
```

**Padding Scale:**
```
p-2   (8px)   - compact
p-4   (16px)  - default
p-6   (24px)  - comfortable
p-8   (32px)  - spacious
```

**DO NOT use arbitrary values:** `p-[16px]`, `gap-[20px]`

### Border Radius

```
rounded-sm   (0.125rem) - subtle corners
rounded-md   (0.375rem) - default
rounded-lg   (0.5rem)   - cards, panels
rounded-xl   (0.75rem)  - hero sections
```

### Available Components by Tier

**Tier 1 (Standard / MUST Prefer):**
- Button, Input, Textarea, Label, Checkbox, Switch, Radio Group, Select
- Card, Alert, Badge, Separator, Spinner, Skeleton
- Table, Pagination, Tabs, Dialog, Alert Dialog
- Toast/Toaster/Sonner, Popover, Tooltip
- Dropdown Menu, Scroll Area, Breadcrumb

**Tier 2 (Allowed / Use When Needed):**
- Calendar, Sheet, Drawer, Command, Sidebar, Progress
- Accordion, Collapsible, Navigation Menu, Menubar, Context Menu
- Resizable, Slider, Hover Card, Avatar, Input OTP
- **Chart** (for dashboards/reports with approved patterns)
- Button Group, Input Group, Field, Empty State, KBD, Item
- Form (react-hook-form integration)

**Tier 3 (Avoid by Default):**
- Carousel, Aspect Ratio

**Component Import Rules:**
```typescript
// ✅ CORRECT - Use barrel export
import { Button, Table, Card, Dialog } from '@/shared/ui'

// ❌ WRONG - Direct component imports
import { Button } from '@/shared/ui/components/button'
import Button from '../../../shared/ui/components/button'
```

### Dark Mode Support

All generated UI must support dark mode automatically:
```typescript
// Tailwind classes automatically adapt
<div className="bg-background text-foreground border-border">
  <Button className="bg-primary text-primary-foreground">
    Primary Action
  </Button>
</div>
```

**DO NOT manually implement dark mode variants.** Use semantic tokens and they will adapt automatically.

---

## Non-Negotiable Rules

* UI must call ONLY BFF endpoints (never call Domain API directly).
* UI must use ONLY `packages/contracts/src/bff` DTOs and errors.
* UI must NOT import or reference `packages/contracts/src/api`.
* Implement UI behavior, state, validation, and UX only. No business rules or domain authority in UI.
* Start with mock data (in the same shape as BFF DTOs). Later we will swap to real BFF calls.

---

## Feature

**metrics-master**: Metrics Master CRUD Management

指標マスタ機能は、EPM SaaSにおける指標定義（metrics）のCRUD管理機能です。EBITDA等の例外指標を rollup ではなく metrics（式）として扱えるようにします。指標は会社別に管理し、formula_expr（式）の構文バリデーションを含みます。

### Key Requirements

1. **指標一覧画面**: セッションコンテキストから取得した会社の指標一覧を表示、検索・ソート・ページング対応
2. **指標登録/編集モーダル**: 
   - 指標一覧から「新規登録」ボタンまたは既存指標の行をクリックでモーダルを開く
   - モーダル内で指標基本情報（指標コード、指標名、指標タイプ、結果測定種別、単位、スケール、式、説明）を登録・編集可能
   - 式（formula_expr）の構文バリデーション（SUB()関数、演算子、括弧のチェック）
   - 式内で参照されている科目コードの存在チェック
3. **指標無効化/再有効化**: 既存指標の無効化・再有効化機能

---

## Screens to build

* **Metrics List Page** (`/master-data/metrics-master`):
  - 指標一覧テーブル表示（指標コード、指標名、指標タイプ、単位、有効状態）
  - 検索バー（指標コード・指標名の部分一致検索）
  - 指標タイプフィルタ（全件/財務指標のみ/KPI指標のみ）
  - 有効フラグフィルタ（全件/有効のみ/無効のみ）
  - ソート機能（指標コード、指標名、指標タイプで昇順/降順）
  - ページネーション
  - 「新規登録」ボタン（モーダルを開く）
  - テーブル行クリックでモーダルを開く（既存指標の編集）

* **Metric Detail/Edit Dialog** (モーダル):
  - **新規登録時**: 空のフォームでモーダルを開く
  - **既存指標編集時**: 指標IDを指定してモーダルを開き、既存データを読み込む
  - **モーダル内の構成**:
    - **フォーム項目**:
      - 指標コード* (Input, required)
      - 指標名* (Input, required)
      - 指標タイプ* (Select: "財務指標" / "KPI指標", required)
      - 結果測定種別* (Input, default: "AMOUNT", required)
      - 単位 (Input, optional, e.g., "JPY")
      - スケール (Number Input, default: 0, required)
      - 式* (Textarea, required, with syntax validation)
        - 式の例: `SUB("OP") + SUB("DA")`
        - 構文ハイライト（任意、モノスペースフォント推奨）
        - 式の構文エラーをインライン表示
      - 説明 (Textarea, optional)
    - **読み取り専用項目**（編集時のみ）:
      - 有効フラグ (Badge)
      - 作成日時
      - 更新日時
  - **モーダルフッター**:
    - 「キャンセル」ボタン
    - 「保存」ボタン（新規登録時は「登録」、編集時は「更新」）
    - 編集時のみ「無効化」/「再有効化」ボタン（フッター右側）
  - **バリデーション**:
    - 必須項目チェック（指標コード*, 指標名*, 指標タイプ*, 結果測定種別*, 式*）
    - 指標コード重複チェック（新規登録時、または指標コード変更時）
    - 式の構文バリデーション:
      - SUB()関数の構文チェック（SUB("科目コード")形式）
      - 演算子のチェック（+, -, *, /, 括弧）
      - 括弧の一致チェック
      - 式内で参照されている科目コードの存在チェック（サーバー側で実施、エラー表示）
  - **エラー表示**: フィールド単位のインラインエラー + モーダル上部のアラート

---

## BFF Specification (from design.md)

### Endpoints (UI -> BFF)

| Method | Endpoint | Purpose | Request DTO | Response DTO |
|--------|----------|---------|-------------|--------------|
| GET | /api/bff/master-data/metrics-master | 指標一覧取得 | BffListMetricsRequest | BffListMetricsResponse |
| GET | /api/bff/master-data/metrics-master/:id | 指標詳細取得 | - | BffMetricDetailResponse |
| POST | /api/bff/master-data/metrics-master | 指標新規登録 | BffCreateMetricRequest | BffMetricDetailResponse |
| PATCH | /api/bff/master-data/metrics-master/:id | 指標情報更新 | BffUpdateMetricRequest | BffMetricDetailResponse |
| POST | /api/bff/master-data/metrics-master/:id/deactivate | 指標無効化 | - | BffMetricDetailResponse |
| POST | /api/bff/master-data/metrics-master/:id/reactivate | 指標再有効化 | - | BffMetricDetailResponse |

**Note**: companyId はセッションコンテキストから取得するため、リクエストには含めません。

### DTOs to use (contracts/bff)

#### Request DTOs

**BffListMetricsRequest**:
```typescript
{
  page?: number;           // default: 1
  pageSize?: number;        // default: 50, max: 200
  sortBy?: 'metricCode' | 'metricName' | 'metricType';
  sortOrder?: 'asc' | 'desc';
  keyword?: string;        // 指標コード・指標名部分一致
  metricType?: 'FIN_METRIC' | 'KPI_METRIC';  // 指標タイプフィルタ
  isActive?: boolean;      // 有効フラグフィルタ
}
```

**BffCreateMetricRequest**:
```typescript
{
  metricCode: string;
  metricName: string;
  metricType: 'FIN_METRIC' | 'KPI_METRIC';
  resultMeasureKind: string;  // 通常は 'AMOUNT'
  unit?: string;
  scale?: number;
  formulaExpr: string;      // 式（例: SUB("OP") + SUB("DA")）
  description?: string;
}
```

**BffUpdateMetricRequest**:
```typescript
{
  metricCode?: string;
  metricName?: string;
  metricType?: 'FIN_METRIC' | 'KPI_METRIC';
  resultMeasureKind?: string;
  unit?: string;
  scale?: number;
  formulaExpr?: string;
  description?: string;
}
```

#### Response DTOs

**BffListMetricsResponse**:
```typescript
{
  items: BffMetricSummary[];
  totalCount: number;
  page: number;
  pageSize: number;
}
```

**BffMetricSummary**:
```typescript
{
  id: string;
  metricCode: string;
  metricName: string;
  metricType: 'FIN_METRIC' | 'KPI_METRIC';
  unit: string | null;
  isActive: boolean;
}
```

**BffMetricDetailResponse**:
```typescript
{
  id: string;
  metricCode: string;
  metricName: string;
  metricType: 'FIN_METRIC' | 'KPI_METRIC';
  resultMeasureKind: string;
  unit: string | null;
  scale: number;
  formulaExpr: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

**Enums**:
- `MetricType`: 'FIN_METRIC' | 'KPI_METRIC'

**Errors**:
- `METRIC_NOT_FOUND`
- `METRIC_CODE_DUPLICATE`
- `METRIC_ALREADY_INACTIVE`
- `METRIC_ALREADY_ACTIVE`
- `COMPANY_NOT_SELECTED`
- `FORMULA_SYNTAX_ERROR` (式の構文エラー)
- `SUBJECT_CODE_NOT_FOUND` (式内で参照されている科目コードが存在しない)
- `VALIDATION_ERROR`

### DTO import example (MANDATORY)

```ts
import type {
  BffListMetricsRequest,
  BffListMetricsResponse,
  BffCreateMetricRequest,
  BffUpdateMetricRequest,
  BffMetricSummary,
  BffMetricDetailResponse,
} from "@epm/contracts/bff/metrics-master";
```

### Error UI behavior

* Show validation errors inline per field (required fields, format errors, formula syntax errors)
* Show API/business errors in a top alert panel
* Map error codes to user-friendly messages:
  - `METRIC_NOT_FOUND` → "指標が見つかりません"
  - `METRIC_CODE_DUPLICATE` → "指標コードが重複しています"
  - `COMPANY_NOT_SELECTED` → "会社が選択されていません"
  - `FORMULA_SYNTAX_ERROR` → "式の構文が不正です"
  - `SUBJECT_CODE_NOT_FOUND` → "参照されている科目コードが存在しません"
  - `VALIDATION_ERROR` → "入力内容に誤りがあります"

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

### Layout Structure

**Metrics List Page**:
- Search bar at top (keyword input, metricType filter dropdown, isActive filter dropdown, search button)
- Table with columns: 指標コード, 指標名, 指標タイプ, 単位, 有効状態
- Pagination at bottom
- "新規登録" button (opens Metric Detail/Edit Dialog in create mode)
- Table row click (opens Metric Detail/Edit Dialog in edit mode with metric ID)

**Metric Detail/Edit Dialog** (モーダル):
- **Dialog Header**: 
  - Title: "指標登録" (新規時) / "指標編集" (編集時)
  - Close button (X)
- **Dialog Content** (スクロール可能):
  - Form fields:
    - 指標コード* (Input, required)
    - 指標名* (Input, required)
    - 指標タイプ* (Select: "財務指標" (FIN_METRIC) / "KPI指標" (KPI_METRIC), required)
    - 結果測定種別* (Input, default: "AMOUNT", required)
    - 単位 (Input, optional, placeholder: "JPY")
    - スケール (Number Input, default: 0, required)
    - 式* (Textarea, required, with syntax validation)
      - Placeholder: `SUB("OP") + SUB("DA")`
      - Use monospace font for formula input
      - Show inline validation errors
    - 説明 (Textarea, optional)
  - Read-only fields (編集時のみ):
    - 有効フラグ (Badge: "有効" / "無効")
    - 作成日時 (formatted date)
    - 更新日時 (formatted date)
- **Dialog Footer**:
  - Left: "キャンセル" button (outline variant)
  - Right: 
    - "無効化"/"再有効化" button (編集時のみ、destructive/secondary variant)
    - "保存" button (primary variant, "登録" for new, "更新" for edit)
- **Validation**:
  - Required fields marked with *
  - Inline errors per field
  - Top alert for API errors (METRIC_CODE_DUPLICATE, FORMULA_SYNTAX_ERROR, etc.)

---

## Mock Data Requirements

Provide mock data sets that:

* cover empty state, typical state, and error state
* use realistic values for EPM domain:
  - Metric codes: "EBITDA", "ROE", "ROA", "売上高", "営業利益率"
  - Metric names: "EBITDA", "自己資本利益率", "総資産利益率", "売上高", "営業利益率"
  - Metric types: "FIN_METRIC", "KPI_METRIC"
  - Units: "JPY", "%", "回"
  - Formulas: `SUB("OP") + SUB("DA")`, `SUB("NET_INCOME") / SUB("EQUITY") * 100`
  - Dates: ISO 8601 format ("2024-01-01T00:00:00Z")
* strictly match the BFF response DTO shape

### Sample Mock Data

**Metrics**:
```ts
const mockMetrics: BffMetricSummary[] = [
  {
    id: "metric-001",
    metricCode: "EBITDA",
    metricName: "EBITDA",
    metricType: "FIN_METRIC",
    unit: "JPY",
    isActive: true,
  },
  {
    id: "metric-002",
    metricCode: "ROE",
    metricName: "自己資本利益率",
    metricType: "KPI_METRIC",
    unit: "%",
    isActive: true,
  },
  {
    id: "metric-003",
    metricCode: "ROA",
    metricName: "総資産利益率",
    metricType: "KPI_METRIC",
    unit: "%",
    isActive: true,
  },
];

const mockMetricDetail: BffMetricDetailResponse = {
  id: "metric-001",
  metricCode: "EBITDA",
  metricName: "EBITDA",
  metricType: "FIN_METRIC",
  resultMeasureKind: "AMOUNT",
  unit: "JPY",
  scale: 0,
  formulaExpr: 'SUB("OP") + SUB("DA")',
  description: "営業利益に減価償却費を加算した値",
  isActive: true,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};
```

---

## Authentication / Tenant

* UI only attaches auth token to BFF requests.
* UI must not handle tenant_id directly.
* company_id is obtained from session context (not in request parameters).

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

* `.kiro/steering/epm-design-system.md` (973 lines - complete design system spec)
* `apps/web/src/shared/ui/tokens/globals.css` (CSS variables and theme)
* `apps/web/src/shared/shell/AppShell.tsx` (layout wrapper)
* `apps/web/src/shared/navigation/menu.ts` (navigation structure)
* `apps/web/src/lib/utils.ts` (cn utility for className merging)

---

## Design System Compliance (CRITICAL)

### Tier Policy

**Tier 1 - Base Components (Standard / MUST Prefer)**
- Button, Input, Card, Table, Dialog, Tabs, Badge, Alert, Toast, Pagination, etc.
- **✅ Use these freely in all features**
- **❌ NEVER recreate these in feature folders**
- Full list: See `apps/web/src/shared/ui/README.md` Tier 1 section

**Tier 2 - Allowed Components (Use When Needed)**
- Calendar, Sheet, Drawer, Command, Sidebar, Progress, Accordion, etc.
- **Chart** (for dashboards/reports with approved patterns)
- **⚠️ Use only when feature requirements justify it**
- **⚠️ If you need a Tier 2 component that doesn't exist:**
  - Add it to OUTPUT.md `Missing Shared Component / Pattern` section
  - DO NOT implement it in the feature folder
- Full list: See `apps/web/src/shared/ui/README.md` Tier 2 section

**Tier 3 - Avoid by Default**
- Carousel, Aspect Ratio
- **❌ Avoid unless there is a clear UX benefit and an approved pattern exists**
- Full list: See `apps/web/src/shared/ui/README.md` Tier 3 section

### Component Creation Rules

**✅ ALLOWED in feature folders:**
```typescript
// Feature-specific composites
components/MetricSearchPanel.tsx
components/MetricFormulaEditor.tsx
components/MetricTypeSelector.tsx
```

**❌ PROHIBITED in feature folders:**
```typescript
// Base UI components (use @/shared/ui instead)
components/button.tsx
components/input.tsx
components/table.tsx
components/dialog.tsx
components/card.tsx
```

### Missing Component Protocol

If you need a component that doesn't exist:

1. **Check if it's Tier 1** → Use from `@/shared/ui`
2. **Check if it's Tier 2** → Add to OUTPUT.md TODO
3. **If it's truly feature-specific** → Implement in feature folder

**Example OUTPUT.md entry:**
```markdown
### Missing Shared Component / Pattern (TODO)

- [ ] DataTable wrapper (apps/web/src/shared/ui/components/data-table.tsx)
  - Wraps Table with sorting, pagination, loading states
  - Props: columns, data, onSort, onPageChange, isLoading
- [ ] SearchInput with debounce (apps/web/src/shared/ui/components/search-input.tsx)
  - Wraps Input with 300ms debounce
  - Props: onSearch, placeholder, defaultValue
```

---

## Colors / Spacing (CRITICAL)

### ✅ CORRECT Usage

```typescript
// Semantic tokens
<Card className="bg-card border-border">
  <Button className="bg-primary text-primary-foreground">
    Submit
  </Button>
  <Alert className="border-warning bg-warning/10">
    <AlertTitle className="text-warning">Warning</AlertTitle>
  </Alert>
</Card>

// Tailwind spacing scale
<div className="p-4 gap-4 rounded-lg">
  <div className="space-y-2">
    <Input className="h-9" />
  </div>
</div>
```

### ❌ PROHIBITED Usage

```typescript
// Raw color literals
<div className="bg-[#14b8a6] text-[oklch(0.52 0.13 195)]">

// Arbitrary Tailwind colors
<Button className="bg-teal-500 hover:bg-indigo-600">

// Arbitrary spacing values
<div className="p-[16px] gap-[20px] rounded-[12px]">
```

---

## App Shell / Layout (MANDATORY)

* The screens must render inside the App Shell layout.
* Do NOT create a new sidebar/header layout inside the feature.
* Feature UI should be only the content area (cards/tables/forms/etc).

**Correct Structure:**
```
apps/web/src/app/<context>/<feature>/page.tsx  (imports Feature component)
       ↓
apps/web/src/features/<context>/<feature>/page.tsx  (Feature component)
       ↓ (renders inside AppShell automatically)
```

---

## Dual Output Path (MANDATORY - Two Locations)

You MUST generate the same code in **TWO locations** to enable both local development and v0 preview:

### Location 1: Local Development Isolation Zone
* Write all generated code under:
  * `apps/web/_v0_drop/master-data/metrics-master/src`
* This is the isolation zone for local development and migration.
* Assume this `src/` folder will later be moved to:
  * `apps/web/src/features/master-data/metrics-master/`
* Do NOT write to `apps/web/src` directly.
* Do NOT place source files outside the `src/` folder under `_v0_drop` (src-only).

### Location 2: v0 Project App Directory (for Preview)
* **ALSO** write the same code to v0's project `app/` directory:
  * `app/master-data/metrics-master/page.tsx` (or equivalent route structure)
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

**Example Output Structure (Both Locations):**

**Location 1 - Isolation Zone:**
```
apps/web/_v0_drop/master-data/metrics-master/src/
├── OUTPUT.md
├── page.tsx
├── components/
│   ├── MetricsList.tsx
│   ├── MetricCreateDialog.tsx
│   ├── MetricEditDialog.tsx
│   └── MetricFormulaEditor.tsx
├── api/
│   ├── BffClient.ts
│   ├── MockBffClient.ts
│   └── HttpBffClient.ts
└── types/
    └── index.ts (optional, prefer @contracts/bff)
```

**Location 2 - v0 App Directory (Mirror Structure):**
```
app/master-data/metrics-master/
├── page.tsx (same as above)
└── components/ (same structure as above)
```

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
  * `apps/web/_v0_drop/master-data/metrics-master/src/api/HttpBffClient.ts`

### App Router / Shell

* Do NOT generate `layout.tsx` anywhere under the v0 output.
* Do NOT create a new sidebar/header/shell layout inside the feature.
* All screens MUST render inside the existing AppShell.

### Output Location (Dual Path)

* Write ALL generated code in **BOTH** locations:

  1. **Local Development**: `apps/web/_v0_drop/master-data/metrics-master/src`
  2. **v0 Preview**: `app/master-data/metrics-master/` (or equivalent v0 project structure)

* **CRITICAL**: Both locations must have identical code. Always update both when making changes.
* Do NOT write to `apps/web/src` directly.

---

## 🔻 REQUIRED OUTPUT ARTIFACT (MANDATORY)

You MUST create an `OUTPUT.md` file under:

* `apps/web/_v0_drop/master-data/metrics-master/src/OUTPUT.md`

`OUTPUT.md` MUST include the following sections:

### 1) Generated files (tree)

* Provide a complete tree of everything you generated under the `src/` folder.

### 2) Key imports / dependency notes

* List important imports and where they come from:
  * `@/shared/ui` usage (which Tier 1 components used)
  * `packages/contracts/src/bff` DTO imports
  * `BffClient` / `MockBffClient` / `HttpBffClient` relationships

### 3) Missing Shared Component / Pattern (TODO)

* A TODO list of any shared UI components/patterns you wanted but did not exist.
* Include suggested filenames and where they should live (shared/ui side).
* Include suggested props interface and purpose.
* Do NOT implement them in the feature.

**Example:**
```markdown
### Missing Shared Component / Pattern (TODO)

- [ ] DataTable wrapper (apps/web/src/shared/ui/components/data-table.tsx)
  - Purpose: Reusable table with sorting, pagination, loading
  - Props: columns, data, onSort, onPageChange, isLoading, pageSize
  - Based on: Tier 1 Table component

- [ ] @/shared/ui barrel export (apps/web/src/shared/ui/index.ts)
  - Export all Tier 1 components for easy importing
```

### 4) Migration notes (_v0_drop → features)

* Step-by-step migration plan:
  * what folder to move
  * what paths/imports will change
  * what should be refactored into shared/ui (if any)

### 5) Constraint compliance checklist

* Check all items explicitly:
  * [ ] Code written in BOTH locations: `apps/web/_v0_drop/master-data/metrics-master/src` AND `app/master-data/metrics-master/`
  * [ ] Both locations contain identical code (synchronized)
  * [ ] v0 preview works correctly in v0's app directory
  * [ ] UI components imported ONLY from `@/shared/ui`
  * [ ] DTO types imported from `packages/contracts/src/bff` (no UI re-definition)
  * [ ] No imports from `packages/contracts/src/api`
  * [ ] No Domain API direct calls (/api/)
  * [ ] No direct fetch() outside `api/HttpBffClient.ts`
  * [ ] No layout.tsx generated
  * [ ] No base UI components created under features
  * [ ] No raw color literals (bg-[#...], text-[oklch(...)], etc.)
  * [ ] No arbitrary Tailwind colors (bg-teal-500, etc.)
  * [ ] No new sidebar/header/shell created inside the feature
  * [ ] All spacing uses Tailwind scale (no arbitrary values like p-[16px])
  * [ ] Dark mode support via semantic tokens (no manual dark: variants)

---

## Special Requirements for Formula Expression

### Formula Input Field

* Use Textarea component for formula input
* Use monospace font (e.g., `font-mono`) for better readability
* Placeholder example: `SUB("OP") + SUB("DA")`
* Show inline validation errors below the textarea
* Formula syntax validation is performed on the server side, but UI should show client-side basic checks (e.g., non-empty)

### Formula Syntax

* Formula format: `SUB("科目コード")` + operators (+, -, *, /) + parentheses
* Example formulas:
  - `SUB("OP") + SUB("DA")` - EBITDA
  - `SUB("SALES") - SUB("COGS")` - 売上総利益
  - `(SUB("OP") + SUB("DA")) / SUB("SALES") * 100` - 複雑な計算

### Error Handling for Formula

* Show `FORMULA_SYNTAX_ERROR` in alert panel at top of dialog
* Show `SUBJECT_CODE_NOT_FOUND` in alert panel with details (which subject code is missing)
* Inline validation errors for formula field (if client-side validation is possible)

---

## Handoff to Cursor

* Keep code modular and easy to migrate into:
  * `apps/web/src/features/master-data/metrics-master/`
* Add brief migration notes in OUTPUT.md (what to move, what to refactor into shared/ui).
* Ensure all imports use path aliases (`@/`, `@contracts/`) for easy refactoring.
* Ensure all components are self-contained and follow the boundary rules.

## Iteration and Synchronization Workflow

When making adjustments or refinements:

1. **Update both locations simultaneously**:
   - Modify code in `apps/web/_v0_drop/master-data/metrics-master/src`
   - Apply the same changes to `app/master-data/metrics-master/` in v0 project

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

---

## 📋 Quick Checklist for v0 Execution

Before generating, ensure you have:

- [ ] Feature name and description filled in
- [ ] BFF endpoints table completed
- [ ] DTO import paths specified
- [ ] Mock data requirements understood
- [ ] Output paths confirmed: BOTH `apps/web/_v0_drop/master-data/metrics-master/src` AND `app/master-data/metrics-master/`

After generating, verify:

- [ ] OUTPUT.md created with all 5 sections
- [ ] No raw color literals (`bg-[#...]`)
- [ ] No layout.tsx created
- [ ] No base UI components recreated
- [ ] All components imported from `@/shared/ui`
- [ ] All DTOs imported from `@contracts/bff`
- [ ] BffClient interface matches endpoints
- [ ] MockBffClient provides realistic data
- [ ] Dark mode works automatically (semantic tokens only)
- [ ] Spacing uses Tailwind scale (no arbitrary values)

---

**End of Prompt**

