# v0 Prompt: Employee Master with Assignments

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

**employee-master**: Employee Master with Assignment Management

社員マスタ機能は、EPM SaaSにおける社員基本情報（社員コード、氏名、カナ、メール、入社日、退職日、有効フラグ）のCRUD管理機能です。本機能では、社員の基本情報と同時に社員所属情報（employee_assignments）も登録・管理できるUIを提供します。

### Key Requirements

1. **社員一覧画面**: セッションコンテキストから取得した会社の社員一覧を表示、検索・ソート・ページング対応
2. **社員登録/編集モーダル**: 
   - 社員一覧から「新規登録」ボタンまたは既存社員の行をクリックでモーダルを開く
   - モーダル内で社員基本情報と所属履歴（主務・兼務）を登録・編集可能
   - タブまたはセクションで「基本情報」と「所属履歴」を分離
   - 新規登録時: 基本情報と初期所属情報（主務）を同時に登録
   - 編集時: 基本情報の更新と所属履歴の追加・編集・削除が可能
3. **所属履歴管理**: 
   - 主務（primary）は1件のみ、兼務（secondary）は複数可
   - 主務の期間重複チェック
   - 按分率は兼務時のみ表示・入力

---

## Screens to build

* **Employee List Page** (`/master-data/employee-master`):
  - 社員一覧テーブル表示（社員コード、氏名、メール、入社日、有効状態）
  - 検索バー（社員コード・氏名の部分一致検索）
  - 有効フラグフィルタ（全件/有効のみ/無効のみ）
  - ソート機能（社員コード、氏名、入社日で昇順/降順）
  - ページネーション
  - 「新規登録」ボタン（モーダルを開く）
  - テーブル行クリックでモーダルを開く（既存社員の編集）

* **Employee Detail/Edit Dialog** (モーダル):
  - **新規登録時**: 空のフォームでモーダルを開く
  - **既存社員編集時**: 社員IDを指定してモーダルを開き、既存データを読み込む
  - **モーダル内の構成**:
    - **タブまたはセクション1: 基本情報**
      - 社員基本情報フォーム（社員コード*, 氏名*, 氏名カナ, メール, 入社日, 退職日）
      - 有効フラグ表示（編集時のみ、新規登録時は自動的にtrue）
      - 作成日時・更新日時表示（編集時のみ）
    - **タブまたはセクション2: 所属履歴**
      - 所属履歴一覧テーブル（部門名, 主務/兼務, 按分率, 役職, 開始日, 終了日, 有効状態）
      - 「所属を追加」ボタン（インラインフォームまたはサブモーダル）
      - 各所属履歴に「編集」「削除」ボタン
      - 主務（primary）は1件のみ、兼務（secondary）は複数可
  - **モーダルフッター**:
    - 「キャンセル」ボタン
    - 「保存」ボタン（新規登録時は「登録」、編集時は「更新」）
    - 編集時のみ「無効化」/「再有効化」ボタン（フッター右側）
  - **バリデーション**:
    - 必須項目チェック（社員コード*, 氏名*）
    - 日付前後関係チェック（退職日 > 入社日、終了日 > 開始日）
    - 社員コード重複チェック（新規登録時、または社員コード変更時）
    - 主務の期間重複チェック（主務は1件のみ、期間が重複しないこと）
  - **エラー表示**: フィールド単位のインラインエラー + モーダル上部のアラート

* **Employee Assignment Form** (所属履歴追加・編集用、モーダル内またはインライン):
  - 所属情報フォーム（部門選択*, 主務/兼務*, 按分率（兼務時のみ）, 役職, 開始日*, 終了日）
  - 既存所属履歴の編集時は、フォームに既存値をセット
  - バリデーション: 必須項目、日付前後関係、主務の期間重複チェック

---

## BFF Specification (from design.md)

### Endpoints (UI -> BFF)

| Method | Endpoint | Purpose | Request DTO | Response DTO |
|--------|----------|---------|-------------|--------------|
| GET | /api/bff/master-data/employee-master | 社員一覧取得 | BffListEmployeesRequest | BffListEmployeesResponse |
| GET | /api/bff/master-data/employee-master/:id | 社員詳細取得 | - | BffEmployeeDetailResponse |
| POST | /api/bff/master-data/employee-master | 社員新規登録 | BffCreateEmployeeRequest | BffEmployeeDetailResponse |
| PATCH | /api/bff/master-data/employee-master/:id | 社員情報更新 | BffUpdateEmployeeRequest | BffEmployeeDetailResponse |
| POST | /api/bff/master-data/employee-master/:id/deactivate | 社員無効化 | - | BffEmployeeDetailResponse |
| POST | /api/bff/master-data/employee-master/:id/reactivate | 社員再有効化 | - | BffEmployeeDetailResponse |
| GET | /api/bff/master-data/employee-master/:id/assignments | 所属履歴一覧取得 | - | BffListEmployeeAssignmentsResponse |
| POST | /api/bff/master-data/employee-master/:id/assignments | 所属履歴追加 | BffCreateEmployeeAssignmentRequest | BffEmployeeAssignmentResponse |
| PATCH | /api/bff/master-data/employee-master/:id/assignments/:assignmentId | 所属履歴更新 | BffUpdateEmployeeAssignmentRequest | BffEmployeeAssignmentResponse |
| DELETE | /api/bff/master-data/employee-master/:id/assignments/:assignmentId | 所属履歴削除 | - | - |

**Note**: companyId はセッションコンテキストから取得するため、リクエストには含めません。

### DTOs to use (contracts/bff)

#### Employee Master DTOs

**Request DTOs**:
- `BffListEmployeesRequest`: { page?, pageSize?, sortBy?, sortOrder?, keyword?, isActive? }
- `BffCreateEmployeeRequest`: { employeeCode, employeeName, employeeNameKana?, email?, hireDate?, leaveDate? }
- `BffUpdateEmployeeRequest`: { employeeCode?, employeeName?, employeeNameKana?, email?, hireDate?, leaveDate? }

**Response DTOs**:
- `BffListEmployeesResponse`: { items: BffEmployeeSummary[], totalCount, page, pageSize }
- `BffEmployeeSummary`: { id, employeeCode, employeeName, email, hireDate, isActive }
- `BffEmployeeDetailResponse`: { id, employeeCode, employeeName, employeeNameKana, email, hireDate, leaveDate, isActive, createdAt, updatedAt }

#### Employee Assignment DTOs (to be defined, but use these shapes)

**Request DTOs**:
- `BffCreateEmployeeAssignmentRequest`: { departmentStableId, assignmentType, allocationRatio?, title?, effectiveDate, expiryDate? }
- `BffUpdateEmployeeAssignmentRequest`: { departmentStableId?, assignmentType?, allocationRatio?, title?, effectiveDate?, expiryDate? }

**Response DTOs**:
- `BffListEmployeeAssignmentsResponse`: { items: BffEmployeeAssignmentSummary[] }
- `BffEmployeeAssignmentSummary`: { id, departmentStableId, departmentName, assignmentType, allocationRatio, title, effectiveDate, expiryDate, isActive }
- `BffEmployeeAssignmentResponse`: { id, employeeId, departmentStableId, departmentName, assignmentType, allocationRatio, title, effectiveDate, expiryDate, isActive, createdAt, updatedAt }

**Enums**:
- `AssignmentType`: 'primary' | 'secondary'

**Errors**:
- `EMPLOYEE_NOT_FOUND`
- `EMPLOYEE_CODE_DUPLICATE`
- `EMPLOYEE_ALREADY_INACTIVE`
- `EMPLOYEE_ALREADY_ACTIVE`
- `COMPANY_NOT_SELECTED`
- `VALIDATION_ERROR`
- `ASSIGNMENT_NOT_FOUND`
- `DEPARTMENT_NOT_FOUND`
- `ASSIGNMENT_OVERLAP` (主務の期間重複)

### DTO import example (MANDATORY)

```ts
import type {
  BffListEmployeesRequest,
  BffListEmployeesResponse,
  BffCreateEmployeeRequest,
  BffUpdateEmployeeRequest,
  BffEmployeeSummary,
  BffEmployeeDetailResponse,
} from "@epm/contracts/bff/employee-master";

// Employee Assignment DTOs (assume these will be defined in the same package)
import type {
  BffListEmployeeAssignmentsResponse,
  BffCreateEmployeeAssignmentRequest,
  BffUpdateEmployeeAssignmentRequest,
  BffEmployeeAssignmentSummary,
  BffEmployeeAssignmentResponse,
  AssignmentType,
} from "@epm/contracts/bff/employee-master";
```

### Error UI behavior

* Show validation errors inline per field (required fields, format errors, date range errors)
* Show API/business errors in a top alert panel
* Map error codes to user-friendly messages:
  - `EMPLOYEE_NOT_FOUND` → "社員が見つかりません"
  - `EMPLOYEE_CODE_DUPLICATE` → "社員コードが重複しています"
  - `COMPANY_NOT_SELECTED` → "会社が選択されていません"
  - `VALIDATION_ERROR` → "入力内容に誤りがあります"
  - `ASSIGNMENT_OVERLAP` → "主務の期間が重複しています"

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

**Employee List Page**:
- Search bar at top (keyword input, isActive filter dropdown, search button)
- Table with columns: 社員コード, 氏名, メール, 入社日, 有効状態
- Pagination at bottom
- "新規登録" button (opens Employee Detail/Edit Dialog in create mode)
- Table row click (opens Employee Detail/Edit Dialog in edit mode with employee ID)

**Employee Detail/Edit Dialog** (モーダル):
- **Dialog Header**: 
  - Title: "社員登録" (新規時) / "社員編集" (編集時)
  - Close button (X)
- **Dialog Content** (スクロール可能):
  - **Tabs Component** (2 tabs):
    - Tab 1: "基本情報"
    - Tab 2: "所属履歴"
  - **Tab 1: 基本情報**:
    - Form fields: 社員コード*, 氏名*, 氏名カナ, メール, 入社日, 退職日
    - Read-only fields (編集時のみ): 有効フラグ, 作成日時, 更新日時
    - Inline validation errors per field
  - **Tab 2: 所属履歴**:
    - Table showing assignments (部門名, 主務/兼務, 按分率, 役職, 開始日, 終了日, 有効状態, 操作)
    - "所属を追加" button (opens inline form or sub-dialog)
    - Edit/Delete buttons per row
    - Inline form or sub-dialog for adding/editing assignments:
      - 部門選択* (Select)
      - 主務/兼務* (Radio: "主務" / "兼務")
      - 按分率 (Number, 0.00-100.00, shown only when 兼務 selected)
      - 役職 (Input)
      - 開始日* (Date Picker)
      - 終了日 (Date Picker, optional)
- **Dialog Footer**:
  - Left: "キャンセル" button (outline variant)
  - Right: 
    - "無効化"/"再有効化" button (編集時のみ、destructive/secondary variant)
    - "保存" button (primary variant, "登録" for new, "更新" for edit)
- **Validation**:
  - Required fields marked with *
  - Date validation: leaveDate > hireDate, expiryDate > effectiveDate
  - Inline errors per field
  - Top alert for API errors (EMPLOYEE_CODE_DUPLICATE, etc.)

**Assignment Form** (インラインフォームまたはサブモーダル):
- Shown when "所属を追加" or "編集" button clicked
- Form fields: 部門選択*, 主務/兼務*, 按分率, 役職, 開始日*, 終了日
- "キャンセル" and "保存" buttons
- Validation: required fields, date range, primary assignment overlap check

---

## Mock Data Requirements

Provide mock data sets that:

* cover empty state, typical state, and error state
* use realistic values for EPM domain:
  - Employee codes: "A00123", "B00456", "C00789"
  - Employee names: "山田 太郎", "佐藤 花子", "鈴木 一郎"
  - Departments: "営業部", "開発部", "経理部", "人事部"
  - Dates: ISO 8601 format ("2020-04-01", "2025-10-01")
* strictly match the BFF response DTO shape

### Sample Mock Data

**Employees**:
```ts
const mockEmployees: BffEmployeeSummary[] = [
  {
    id: "emp-001",
    employeeCode: "A00123",
    employeeName: "山田 太郎",
    email: "yamada@example.com",
    hireDate: "2020-04-01",
    isActive: true,
  },
  {
    id: "emp-002",
    employeeCode: "B00456",
    employeeName: "佐藤 花子",
    email: "sato@example.com",
    hireDate: "2021-07-01",
    isActive: true,
  },
];
```

**Assignments**:
```ts
const mockAssignments: BffEmployeeAssignmentSummary[] = [
  {
    id: "assign-001",
    departmentStableId: "dept-sales-001",
    departmentName: "営業部",
    assignmentType: "primary",
    allocationRatio: 100.00,
    title: "課長",
    effectiveDate: "2020-04-01",
    expiryDate: null,
    isActive: true,
  },
];
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
  * apps/web/_v0_drop/master-data/employee-master/src
* Assume this `src/` folder will later be moved to:
  * apps/web/src/features/master-data/employee-master/
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
  * `apps/web/_v0_drop/master-data/employee-master/src/api/HttpBffClient.ts`

### App Router / Shell
* Do NOT generate `layout.tsx` anywhere under the v0 output.
* Do NOT create a new sidebar/header/shell layout inside the feature.
* All screens MUST render inside the existing AppShell.

### Output Location
* Write ALL generated code ONLY under:
  * `apps/web/_v0_drop/master-data/employee-master/src`
* Do NOT write to `apps/web/src` directly.

---

## 🔻 REQUIRED OUTPUT ARTIFACT (MANDATORY)

You MUST create an `OUTPUT.md` file under:
* apps/web/_v0_drop/master-data/employee-master/src/OUTPUT.md

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
  * [ ] Code written ONLY under `apps/web/_v0_drop/master-data/employee-master/src`
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

## Special Requirements for Employee Assignment

### Department Selection
* Use a Select component for department selection
* For now, use mock department data (will be replaced with real department master API later)
* Mock departments should include: stableId, name (e.g., "営業部", "開発部", "経理部")

### Assignment Type
* Use Radio buttons or Select for assignmentType: "primary" (主務) or "secondary" (兼務)
* Default to "primary"

### Date Validation
* effectiveDate must be >= hireDate (if hireDate is set)
* expiryDate must be > effectiveDate (if both are set)
* Show inline validation errors

### Allocation Ratio
* Only show allocationRatio field when assignmentType is "secondary"
* Range: 0.00 to 100.00
* Use number input with 2 decimal places

### Assignment List Display
* Show assignments in a table with columns:
  - 部門名
  - 主務/兼務 (Badge: primary=Deep Teal, secondary=Royal Indigo)
  - 按分率 (only for secondary, show as percentage)
  - 役職
  - 開始日
  - 終了日 (or "無期限" if null)
  - 有効状態 (Badge)
  - 操作 (Edit, Delete buttons)

---

## Handoff to Cursor

* Keep code modular and easy to migrate into:
  * apps/web/src/features/master-data/employee-master/
* Add brief migration notes in OUTPUT.md (what to move, what to refactor into shared/ui).
* Ensure all components are self-contained and follow the boundary rules.

