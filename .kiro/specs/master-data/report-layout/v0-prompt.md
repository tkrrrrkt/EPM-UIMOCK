# v0 Prompt: Report Layout Master

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

**report-layout**: Report Layout Master Management

レポートレイアウトマスタ機能は、EPM SaaSにおけるPL（損益計算書）、BS（貸借対照表）、KPI（非財務指標）の表示レイアウトを定義・管理する機能です。レイアウトヘッダ（report_layouts）とレイアウト行（report_layout_lines）を管理し、見出し・科目行・注記・空白行を組み合わせて経営管理レポートの表示形式をカスタマイズ可能にします。

### Key Requirements

1. **レイアウト一覧画面**: レイアウトコード、レイアウト名、レイアウト種別（PL/BS/KPI）、会社名、有効状態を表示、検索・フィルタ・ソート・ページング対応
2. **レイアウト詳細画面（1画面統合型）**: レイアウト基本情報と行リストを同じ画面で表示・編集
3. **レイアウト行管理**: 行の追加・編集・削除・並べ替え（ドラッグ＆ドロップ）
4. **科目選択**: account行に紐付ける科目を検索・選択（財務レイアウト/KPIレイアウトでフィルタリング）
5. **会社選択**: 複数社の権限があるユーザーは会社選択DDLで会社を選択し、選択された会社のマスタのみを表示・編集可能

---

## Screens to build

* **Layout List Page** (`/master-data/report-layout`):
  - レイアウト一覧テーブル表示（レイアウトコード、レイアウト名、レイアウト種別、会社名、有効状態、行数）
  - 会社選択DDL（複数社の権限があるユーザーの場合）
  - 検索バー（レイアウトコード・レイアウト名の部分一致検索）
  - レイアウト種別フィルタ（全件/PL/BS/KPI）
  - 有効フラグフィルタ（全件/有効のみ/無効のみ）
  - ソート機能（レイアウトコード、レイアウト名、レイアウト種別で昇順/降順）
  - ページネーション
  - 「新規作成」ボタン
  - テーブル行クリックで詳細画面へ遷移
  - 無効レイアウトのグレーアウト表示

* **Layout Detail Page** (`/master-data/report-layout/[id]`):
  - **1画面統合型**: レイアウト基本情報と行リストを同じ画面で表示
  - **レイアウト基本情報セクション**:
    - レイアウトコード、レイアウト名、レイアウト種別（PL/BS/KPI）、会社名（会社別の場合）、有効状態
    - 編集モード切替ボタン
    - 無効化/再有効化ボタン
    - 複製ボタン
    - 種別変更時の警告ダイアログ（「種別を変更すると既存の行がすべて削除されます。続行しますか？」）
  - **行リストセクション**:
    - 行一覧テーブル（行番号、行種別、表示名、科目名（account行の場合）、インデントレベル、太字設定）
    - 行種別を視覚的に区別（アイコンまたは色分け）
    - インデントレベルに応じた字下げ表示
    - 太字設定がオンの行を太字で表示
    - ドラッグ＆ドロップで行の並べ替え
    - 「行追加」ボタン
    - 各行に編集・削除ボタン
    - 行削除時の確認ダイアログ（account行の場合は「科目「[科目名]」を削除しますか？」、その他の場合は「この行を削除しますか？」）
  - **プレビューセクション**:
    - レイアウト行をレポート形式でプレビュー表示
    - 見出し行（header）を太字・大きめのフォントで表示
    - 科目行（account）を科目名とともにインデント付きで表示
    - 注記行（note）を斜体または小さめのフォントで表示
    - 空白行（blank）を空行として表示
    - 無効化された科目を参照しているaccount行が存在する場合、「無効化された科目が含まれています」というアラートを表示（描画は実行する）

* **Layout Create Dialog**:
  - レイアウト基本情報フォーム（レイアウトコード*、レイアウト名*、レイアウト種別*（PL/BS/KPI）、会社選択（オプション））
  - バリデーション（必須項目チェック、レイアウトコード重複チェック）
  - エラー表示

* **Line Create/Edit Dialog**:
  - 行種別選択（header/account/note/blank）
  - 行種別に応じたフォーム項目の出し分け
    - header: 表示名*、インデントレベル、太字設定
    - account: 科目選択*、表示名（手動入力可能）、インデントレベル、符号表示ポリシー、太字設定
    - note: 表示名*、インデントレベル、太字設定
    - blank: インデントレベル、太字設定
  - バリデーション（必須項目チェック）
  - エラー表示

* **Subject Selection Dialog**:
  - 科目検索（科目コード・科目名の部分一致検索）
  - レイアウト種別に応じた科目フィルタリング
    - 財務レイアウト（PL/BS）: 財務科目（subject_type='FIN' かつ subject_fin_attrsが存在）かつ fin_stmt_class = layout_type のみ表示
    - KPIレイアウト: KPI科目（subject_type='KPI'）のみ表示
  - 選択された会社（company_id）の科目のみ表示
  - 有効な科目（is_active=true）のみ表示
  - 科目一覧（科目コード、科目名、科目クラス（BASE/AGGREGATE））
  - ページネーション

---

## BFF Specification (from design.md)

### Endpoints (UI -> BFF)

| Method | Endpoint | Purpose | Request DTO | Response DTO | Notes |
|--------|----------|---------|-------------|--------------|-------|
| GET | /api/bff/master-data/report-layout/layouts | レイアウト一覧取得 | BffLayoutListRequest | BffLayoutListResponse | フィルタ・ソート対応 |
| GET | /api/bff/master-data/report-layout/layouts/:id | レイアウト詳細取得 | - | BffLayoutDetailResponse | UUID パス |
| POST | /api/bff/master-data/report-layout/layouts | レイアウト新規作成 | BffCreateLayoutRequest | BffLayoutDetailResponse | - |
| PATCH | /api/bff/master-data/report-layout/layouts/:id | レイアウト編集 | BffUpdateLayoutRequest | BffLayoutDetailResponse | 部分更新 |
| POST | /api/bff/master-data/report-layout/layouts/:id/deactivate | レイアウト無効化 | - | BffLayoutDetailResponse | is_active → false |
| POST | /api/bff/master-data/report-layout/layouts/:id/reactivate | レイアウト再有効化 | - | BffLayoutDetailResponse | is_active → true |
| POST | /api/bff/master-data/report-layout/layouts/:id/copy | レイアウト複製 | BffCopyLayoutRequest | BffLayoutDetailResponse | 行も全コピー |
| GET | /api/bff/master-data/report-layout/layouts/:layoutId/lines | 行一覧取得 | - | BffLineListResponse | line_no順 |
| GET | /api/bff/master-data/report-layout/lines/:id | 行詳細取得 | - | BffLineDetailResponse | UUID パス |
| POST | /api/bff/master-data/report-layout/layouts/:layoutId/lines | 行追加 | BffCreateLineRequest | BffLineDetailResponse | line_no自動採番 |
| PATCH | /api/bff/master-data/report-layout/lines/:id | 行編集 | BffUpdateLineRequest | BffLineDetailResponse | 部分更新 |
| DELETE | /api/bff/master-data/report-layout/lines/:id | 行削除 | - | - | 物理削除 |
| POST | /api/bff/master-data/report-layout/lines/:id/move | 行移動（D&D） | BffMoveLineRequest | BffLineListResponse | line_no更新 |
| GET | /api/bff/master-data/report-layout/subjects | 科目検索 | BffSubjectSearchRequest | BffSubjectSearchResponse | 科目選択補助 |

**Note**: companyId は会社選択DDLで選択された会社IDを使用します。複数社の権限がないユーザーの場合は、セッションコンテキストから取得します。

### DTOs to use (contracts/bff)

#### Layout DTOs

**Request DTOs**:
- `BffLayoutListRequest`: { page?, pageSize?, sortBy?, sortOrder?, keyword?, layoutType?, isActive? }
- `BffCreateLayoutRequest`: { layoutCode, layoutName, layoutType: 'PL' | 'BS' | 'KPI', companyId? }
- `BffUpdateLayoutRequest`: { layoutCode?, layoutName?, layoutType?: 'PL' | 'BS' | 'KPI', companyId? } (companyIdは変更不可)
- `BffCopyLayoutRequest`: { layoutCode, layoutName }

**Response DTOs**:
- `BffLayoutListResponse`: { items: BffLayoutSummary[], totalCount, page, pageSize, totalPages }
- `BffLayoutSummary`: { id, layoutCode, layoutName, layoutType: 'PL' | 'BS' | 'KPI', companyId, companyName, isActive, lineCount }
- `BffLayoutDetailResponse`: { id, layoutCode, layoutName, layoutType: 'PL' | 'BS' | 'KPI', companyId, companyName, isActive, createdAt, updatedAt }

#### Line DTOs

**Request DTOs**:
- `BffCreateLineRequest`: { layoutId, lineType: 'header' | 'account' | 'note' | 'blank', displayName?, subjectId?, indentLevel?, signDisplayPolicy?, isBold? }
- `BffUpdateLineRequest`: { displayName?, subjectId?, indentLevel?, signDisplayPolicy?, isBold? }
- `BffMoveLineRequest`: { targetLineNo: number }

**Response DTOs**:
- `BffLineListResponse`: { items: BffLineSummary[] }
- `BffLineSummary`: { id, layoutId, lineNo, lineType, displayName, subjectId, subjectCode, subjectName, indentLevel, signDisplayPolicy, isBold }
- `BffLineDetailResponse`: { id, layoutId, lineNo, lineType, displayName, subjectId, subjectCode, subjectName, indentLevel, signDisplayPolicy, isBold, createdAt, updatedAt }

#### Subject Search DTOs

**Request DTOs**:
- `BffSubjectSearchRequest`: { layoutType: 'PL' | 'BS' | 'KPI', companyId: string, keyword?, page?, pageSize? }

**Response DTOs**:
- `BffSubjectSearchResponse`: { items: BffSubjectSummary[], page, pageSize, totalCount, totalPages }
- `BffSubjectSummary`: { id, subjectCode, subjectName, subjectClass: 'BASE' | 'AGGREGATE' }

**Enums**:
- `LayoutType`: 'PL' | 'BS' | 'KPI'
- `LineType`: 'header' | 'account' | 'note' | 'blank'
- `SignDisplayPolicy`: 'auto' | 'force_plus' | 'force_minus'

**Errors**:
- `LAYOUT_NOT_FOUND`
- `LAYOUT_CODE_DUPLICATE`
- `LAYOUT_ALREADY_INACTIVE`
- `LAYOUT_ALREADY_ACTIVE`
- `LINE_NOT_FOUND`
- `SUBJECT_REQUIRED_FOR_ACCOUNT`
- `SUBJECT_NOT_FOUND`
- `SUBJECT_INACTIVE` (無効化された科目は選択できない)
- `SUBJECT_TYPE_MISMATCH` (レイアウト種別と科目種別の整合性エラー)
- `VALIDATION_ERROR`

### DTO import example (MANDATORY)

```ts
import type {
  BffLayoutListRequest,
  BffLayoutListResponse,
  BffCreateLayoutRequest,
  BffUpdateLayoutRequest,
  BffCopyLayoutRequest,
  BffLayoutSummary,
  BffLayoutDetailResponse,
  BffLineListResponse,
  BffCreateLineRequest,
  BffUpdateLineRequest,
  BffMoveLineRequest,
  BffLineSummary,
  BffLineDetailResponse,
  BffSubjectSearchRequest,
  BffSubjectSearchResponse,
  BffSubjectSummary,
  LayoutType,
  LineType,
  SignDisplayPolicy,
} from "@epm/contracts/bff/report-layout";
```

### Error UI behavior

* Show validation errors inline per field (required fields, format errors)
* Show API/business errors in a top alert panel
* Map error codes to user-friendly messages:
  - `LAYOUT_NOT_FOUND` → "レイアウトが見つかりません"
  - `LAYOUT_CODE_DUPLICATE` → "レイアウトコードが重複しています"
  - `SUBJECT_REQUIRED_FOR_ACCOUNT` → "account行には科目を選択してください"
  - `SUBJECT_INACTIVE` → "無効化された科目は選択できません"
  - `SUBJECT_TYPE_MISMATCH` → "選択した科目はこのレイアウト種別では使用できません"
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

**Layout List Page**:
- Company selection DDL at top (if user has multiple company permissions)
- Search bar (keyword input, layoutType filter dropdown, isActive filter dropdown, search button)
- Table with columns: レイアウトコード, レイアウト名, レイアウト種別, 会社名, 有効状態, 行数, 操作（詳細ボタン）
- Pagination at bottom
- "新規作成" button (opens create dialog)
- Inactive layouts displayed in gray

**Layout Detail Page (1画面統合型)**:
- **Layout Info Section** (top):
  - Card showing layout basic info (read-only view with "編集" button, or edit mode with form)
  - Action buttons: 無効化/再有効化, 複製
- **Line List Section** (middle):
  - Table showing lines (draggable rows)
  - "行追加" button
  - Edit/Delete buttons per row
- **Preview Section** (bottom):
  - Card showing preview of layout lines formatted as report
  - Alert for inactive subjects (if any)

**Line Create/Edit Dialog**:
- Line type selector (header/account/note/blank)
- Conditional form fields based on line type
- Subject selection button (for account type)
- Validation and error display

**Subject Selection Dialog**:
- Search input (keyword)
- Filter by layout type (automatically applied based on current layout)
- Subject list table with pagination
- Select button

---

## Mock Data Requirements

Provide mock data sets that:

* cover empty state, typical state, and error state
* use realistic values for EPM domain:
  - Layout codes: "PL_STD", "BS_STD", "KPI_STD", "PL_MGMT"
  - Layout names: "標準PL", "標準BS", "標準KPI", "管理PL"
  - Layout types: "PL", "BS", "KPI"
  - Line types: "header", "account", "note", "blank"
  - Subject codes: "4010", "5010", "6010"
  - Subject names: "売上高", "売上原価", "販管費"
  - Company names: "株式会社サンプル", "サンプル商事株式会社"
* strictly match the BFF response DTO shape

### Sample Mock Data

**Layouts**:
```ts
const mockLayouts: BffLayoutSummary[] = [
  {
    id: "layout-001",
    layoutCode: "PL_STD",
    layoutName: "標準PL",
    layoutType: "PL",
    companyId: "company-001",
    companyName: "株式会社サンプル",
    isActive: true,
    lineCount: 15,
  },
  {
    id: "layout-002",
    layoutCode: "BS_STD",
    layoutName: "標準BS",
    layoutType: "BS",
    companyId: "company-001",
    companyName: "株式会社サンプル",
    isActive: true,
    lineCount: 20,
  },
  {
    id: "layout-003",
    layoutCode: "KPI_STD",
    layoutName: "標準KPI",
    layoutType: "KPI",
    companyId: null,
    companyName: null,
    isActive: true,
    lineCount: 10,
  },
];
```

**Lines**:
```ts
const mockLines: BffLineSummary[] = [
  {
    id: "line-001",
    layoutId: "layout-001",
    lineNo: 10,
    lineType: "header",
    displayName: "売上高",
    subjectId: null,
    subjectCode: null,
    subjectName: null,
    indentLevel: 0,
    signDisplayPolicy: null,
    isBold: true,
  },
  {
    id: "line-002",
    layoutId: "layout-001",
    lineNo: 20,
    lineType: "account",
    displayName: "売上高（表示名）",
    subjectId: "subject-001",
    subjectCode: "4010",
    subjectName: "売上高",
    indentLevel: 1,
    signDisplayPolicy: "auto",
    isBold: false,
  },
  {
    id: "line-003",
    layoutId: "layout-001",
    lineNo: 30,
    lineType: "note",
    displayName: "注記: 売上高は税込金額です",
    subjectId: null,
    subjectCode: null,
    subjectName: null,
    indentLevel: 0,
    signDisplayPolicy: null,
    isBold: false,
  },
  {
    id: "line-004",
    layoutId: "layout-001",
    lineNo: 40,
    lineType: "blank",
    displayName: null,
    subjectId: null,
    subjectCode: null,
    subjectName: null,
    indentLevel: 0,
    signDisplayPolicy: null,
    isBold: false,
  },
];
```

**Subjects**:
```ts
const mockSubjects: BffSubjectSummary[] = [
  {
    id: "subject-001",
    subjectCode: "4010",
    subjectName: "売上高",
    subjectClass: "BASE",
  },
  {
    id: "subject-002",
    subjectCode: "5010",
    subjectName: "売上原価",
    subjectClass: "BASE",
  },
  {
    id: "subject-003",
    subjectCode: "6010",
    subjectName: "販管費",
    subjectClass: "AGGREGATE",
  },
];
```

---

## Authentication / Tenant

* UI only attaches auth token to BFF requests.
* UI must not handle tenant_id directly.
* company_id is obtained from company selection DDL (if user has multiple company permissions) or session context.

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
* Select (with Trigger, Content, Item, Value, Group, Label, Separator)

### UI component import entrypoint (MANDATORY)
* UI components MUST be imported ONLY from:
  * `@/shared/ui`
* Assume `@/shared/ui` is a barrel entry that re-exports shared UI components.
* If the barrel entry does NOT exist yet:
  * Do NOT create it inside feature folders.
  * Do NOT import directly from `apps/web/src/shared/ui/components/*`.
  * Instead, add a TODO under `Missing Shared Component / Pattern` in OUTPUT.md.

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
  * apps/web/_v0_drop/master-data/report-layout/src
* Assume this `src/` folder will later be moved to:
  * apps/web/src/features/master-data/report-layout/
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
  * `apps/web/_v0_drop/master-data/report-layout/src/api/HttpBffClient.ts`

### App Router / Shell
* Do NOT generate `layout.tsx` anywhere under the v0 output.
* Do NOT create a new sidebar/header/shell layout inside the feature.
* All screens MUST render inside the existing AppShell.

### Output Location
* Write ALL generated code ONLY under:
  * `apps/web/_v0_drop/master-data/report-layout/src`
* Do NOT write to `apps/web/src` directly.

---

## 🔻 REQUIRED OUTPUT ARTIFACT (MANDATORY)

You MUST create an `OUTPUT.md` file under:
* apps/web/_v0_drop/master-data/report-layout/src/OUTPUT.md

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
  * [ ] Code written ONLY under `apps/web/_v0_drop/master-data/report-layout/src`
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

## Special Requirements for Report Layout

### Drag & Drop for Line Reordering
* Use `dnd-kit` library for drag and drop functionality
* Implement draggable rows in the line list table
* Show drop indicators during drag
* Call `POST /api/bff/master-data/report-layout/lines/:id/move` with `targetLineNo` after drop

### Company Selection DDL
* Display company selection dropdown at the top of the layout list page
* Only show if user has multiple company permissions
* Filter layouts by selected company
* Pass selected `companyId` to BFF requests

### Layout Type Change Warning
* When user tries to change layout type (PL/BS/KPI), show warning dialog:
  "種別を変更すると既存の行がすべて削除されます。続行しますか？"
* If user confirms, proceed with type change (BFF will handle line deletion)
* If user cancels, revert to original layout type

### Subject Selection Filtering
* For financial layouts (PL/BS): Show only financial subjects (subject_type='FIN' with subject_fin_attrs) matching fin_stmt_class
* For KPI layouts: Show only KPI subjects (subject_type='KPI')
* Filter by selected company (companyId)
* Show only active subjects (is_active=true)
* Display subject code, name, and class (BASE/AGGREGATE)

### Line Type Visual Distinction
* Use icons or color coding to distinguish line types:
  - header: Bold icon or primary color
  - account: Subject icon or secondary color
  - note: Note icon or muted color
  - blank: Empty/minimal styling

### Indent Level Display
* Apply visual indentation based on `indentLevel` (0-5)
* Use left padding: `pl-{indentLevel * 4}` (e.g., `pl-4` for level 1, `pl-8` for level 2)

### Preview Display
* Format lines as a report preview:
  - header: Bold, larger font (`font-bold text-lg`)
  - account: Indented with subject name
  - note: Italic or smaller font (`italic text-sm`)
  - blank: Empty line with spacing
* Show alert if any account lines reference inactive subjects

### Inactive Subject Alert
* When displaying layout with inactive subjects:
  - Show alert: "無効化された科目が含まれています"
  - Still render the layout (but don't show values for inactive subjects)
  - Alert should be dismissible

---

## Handoff to Cursor

* Keep code modular and easy to migrate into:
  * apps/web/src/features/master-data/report-layout/
* Add brief migration notes in OUTPUT.md (what to move, what to refactor into shared/ui).
* Ensure all components are self-contained and follow the boundary rules.

