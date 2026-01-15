# v0 Prompt: Organization Master（組織・部門マスタ）

## Context

You are generating UI for an EPM SaaS. The project uses SDD/CCSDD.
UI must follow boundary rules and must be easy to hand off to Cursor for implementation.

---

## EPM Design System (MANDATORY - READ FIRST)

### Design System Source of Truth

You MUST follow the EPM Design System defined in `.kiro/steering/epm-design-system.md`.

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
- Use CSS variables: `bg-primary`, `text-secondary`, `border-error`
- Use semantic tokens: `bg-background`, `text-foreground`, `border-input`
- NEVER use raw color literals: `bg-[#14b8a6]`, `text-[oklch(...)]`
- NEVER use arbitrary Tailwind colors: `bg-teal-500`, `text-indigo-600`

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
```

**DO NOT use arbitrary values:** `p-[16px]`, `gap-[20px]`

### Available Components by Tier

**Tier 1 (MUST Prefer):**
- Button, Input, Textarea, Label, Checkbox, Switch, Radio Group, Select
- Card, Alert, Badge, Separator, Spinner, Skeleton
- Table, Pagination, Tabs, Dialog, Alert Dialog
- Toast/Toaster/Sonner, Popover, Tooltip
- Dropdown Menu, Scroll Area, Breadcrumb

**Tier 2 (Use When Needed):**
- Calendar, Sheet, Drawer, Command, Sidebar, Progress
- Accordion, Collapsible, Navigation Menu, Menubar
- Form (react-hook-form integration)

**Tier 3 (Avoid):**
- Carousel, Aspect Ratio

**Component Import Rules:**
```typescript
// CORRECT - Use barrel export
import { Button, Table, Card, Dialog, Badge, Input, Select } from '@/shared/ui'

// WRONG - Direct component imports
import { Button } from '@/shared/ui/components/button'
```

---

## Non-Negotiable Rules

* UI must call ONLY BFF endpoints (never call Domain API directly).
* UI must use ONLY `packages/contracts/src/bff` DTOs and errors.
* UI must NOT import or reference `packages/contracts/src/api`.
* Implement UI behavior, state, validation, and UX only. No business rules or domain authority in UI.
* Start with mock data (in the same shape as BFF DTOs). Later we will swap to real BFF calls.

---

## Feature

**組織・部門マスタ（Organization Master）**: EPM SaaSにおける「組織バージョン（organization_versions）」と「部門（departments）」を管理するCRUD機能

### 機能概要
- 組織バージョンの一覧表示・作成・コピー・編集
- 組織バージョンの有効期間管理・as-of検索
- 部門ツリーの階層表示・ドラッグ＆ドロップ移動
- 部門の新規登録・編集・無効化・再有効化
- 部門のフィルタリング・検索
- 循環参照防止チェック

### UI構成
**1画面統合型**を採用：
- **左パネル**: 組織バージョンリスト（縦型リスト）
- **中央パネル**: 部門ツリー（階層表示、D&D対応）
- **右パネル**: 詳細パネル（選択した部門の詳細表示・編集）

---

## Screens to build

* **統合画面（Integrated View）**: 3ペイン構成。左にバージョンリスト、中央に部門ツリー、右に詳細パネル。
* **バージョン作成ダイアログ（Create Version Dialog）**: 新規バージョン作成用ダイアログ。
* **バージョンコピーダイアログ（Copy Version Dialog）**: 既存バージョンからコピー作成用ダイアログ。
* **バージョン編集ダイアログ（Edit Version Dialog）**: バージョン情報編集用ダイアログ。
* **部門作成ダイアログ（Create Department Dialog）**: 新規部門登録用ダイアログ（ツリー上の右クリックから呼び出し）。

---

## BFF Specification (from design.md)

### Endpoints (UI -> BFF)

| Method | Endpoint | Purpose | Request DTO | Response DTO | Notes |
|--------|----------|---------|-------------|--------------|-------|
| GET | /api/bff/master-data/organization-master/versions | バージョン一覧取得 | BffVersionListRequest | BffVersionListResponse | 会社の全バージョン |
| GET | /api/bff/master-data/organization-master/versions/:id | バージョン詳細取得 | - | BffVersionDetailResponse | UUID パス |
| POST | /api/bff/master-data/organization-master/versions | バージョン新規作成 | BffCreateVersionRequest | BffVersionDetailResponse | - |
| POST | /api/bff/master-data/organization-master/versions/:id/copy | バージョンコピー作成 | BffCopyVersionRequest | BffVersionDetailResponse | 部門も全コピー |
| PATCH | /api/bff/master-data/organization-master/versions/:id | バージョン編集 | BffUpdateVersionRequest | BffVersionDetailResponse | 部分更新 |
| GET | /api/bff/master-data/organization-master/versions/:id/as-of | as-of検索 | asOfDate (query) | BffVersionDetailResponse | 日付指定 |
| GET | /api/bff/master-data/organization-master/versions/:versionId/departments/tree | 部門ツリー取得 | BffDepartmentTreeRequest | BffDepartmentTreeResponse | 階層構造 |
| GET | /api/bff/master-data/organization-master/departments/:id | 部門詳細取得 | - | BffDepartmentDetailResponse | UUID パス |
| POST | /api/bff/master-data/organization-master/versions/:versionId/departments | 部門新規登録 | BffCreateDepartmentRequest | BffDepartmentDetailResponse | stable_id自動生成 |
| PATCH | /api/bff/master-data/organization-master/departments/:id | 部門編集 | BffUpdateDepartmentRequest | BffDepartmentDetailResponse | 部分更新 |
| POST | /api/bff/master-data/organization-master/departments/:id/move | 部門移動（D&D） | BffMoveDepartmentRequest | BffDepartmentTreeResponse | parent_id変更 |
| POST | /api/bff/master-data/organization-master/departments/:id/deactivate | 部門無効化 | - | BffDepartmentDetailResponse | is_active → false |
| POST | /api/bff/master-data/organization-master/departments/:id/reactivate | 部門再有効化 | - | BffDepartmentDetailResponse | is_active → true |

### DTOs to use (contracts/bff)

**Request DTOs:**
```typescript
// Version
export interface BffVersionListRequest {
  sortBy?: 'effectiveDate' | 'versionCode' | 'versionName';
  sortOrder?: 'asc' | 'desc';
}

export interface BffCreateVersionRequest {
  versionCode: string;
  versionName: string;
  effectiveDate: string;      // ISO 8601
  expiryDate?: string;        // ISO 8601, NULL=無期限
  description?: string;
}

export interface BffCopyVersionRequest {
  versionCode: string;
  versionName: string;
  effectiveDate: string;
  expiryDate?: string;
  description?: string;
}

export interface BffUpdateVersionRequest {
  versionCode?: string;
  versionName?: string;
  effectiveDate?: string;
  expiryDate?: string;
  description?: string;
}

// Department
export interface BffDepartmentTreeRequest {
  keyword?: string;
  isActive?: boolean;
  orgUnitType?: string;
}

export interface BffCreateDepartmentRequest {
  departmentCode: string;
  departmentName: string;
  departmentNameShort?: string;
  parentId?: string;           // NULL=ルート部門
  sortOrder?: number;
  orgUnitType?: string;
  responsibilityType?: string;
  externalCenterCode?: string;
  managerId?: string;
  notes?: string;
}

export interface BffUpdateDepartmentRequest {
  departmentCode?: string;
  departmentName?: string;
  departmentNameShort?: string;
  parentId?: string;
  sortOrder?: number;
  orgUnitType?: string;
  responsibilityType?: string;
  externalCenterCode?: string;
  managerId?: string;
  notes?: string;
}

export interface BffMoveDepartmentRequest {
  newParentId: string | null;  // NULL=ルートへ移動
}
```

**Response DTOs:**
```typescript
// Version
export interface BffVersionSummary {
  id: string;
  versionCode: string;
  versionName: string;
  effectiveDate: string;
  expiryDate: string | null;
  isCurrentlyEffective: boolean;
  departmentCount: number;
}

export interface BffVersionListResponse {
  items: BffVersionSummary[];
}

export interface BffVersionDetailResponse {
  id: string;
  versionCode: string;
  versionName: string;
  effectiveDate: string;
  expiryDate: string | null;
  baseVersionId: string | null;
  description: string | null;
  isCurrentlyEffective: boolean;
  createdAt: string;
  updatedAt: string;
}

// Department
export interface BffDepartmentTreeNode {
  id: string;
  departmentCode: string;
  departmentName: string;
  departmentNameShort: string | null;
  orgUnitType: string | null;
  isActive: boolean;
  hierarchyLevel: number;
  children: BffDepartmentTreeNode[];
}

export interface BffDepartmentTreeResponse {
  versionId: string;
  versionCode: string;
  nodes: BffDepartmentTreeNode[];
}

export interface BffDepartmentDetailResponse {
  id: string;
  versionId: string;
  stableId: string;
  departmentCode: string;
  departmentName: string;
  departmentNameShort: string | null;
  parentId: string | null;
  parentDepartmentName: string | null;
  sortOrder: number;
  hierarchyLevel: number;
  hierarchyPath: string | null;
  orgUnitType: string | null;
  responsibilityType: string | null;
  externalCenterCode: string | null;
  managerId: string | null;
  managerName: string | null;
  isActive: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
```

### DTO import example (MANDATORY)

```typescript
import type {
  BffVersionListRequest,
  BffVersionListResponse,
  BffVersionSummary,
  BffVersionDetailResponse,
  BffCreateVersionRequest,
  BffCopyVersionRequest,
  BffUpdateVersionRequest,
  BffDepartmentTreeRequest,
  BffDepartmentTreeResponse,
  BffDepartmentTreeNode,
  BffDepartmentDetailResponse,
  BffCreateDepartmentRequest,
  BffUpdateDepartmentRequest,
  BffMoveDepartmentRequest,
} from '@contracts/bff/organization-master';
```

### Error Codes

| Error Code | 表示メッセージ | 発生場面 |
|------------|---------------|---------|
| VERSION_NOT_FOUND | バージョンが見つかりません | 詳細/更新/コピー |
| VERSION_CODE_DUPLICATE | バージョンコードが重複しています | 登録/更新 |
| INVALID_EFFECTIVE_DATE_RANGE | 有効終了日は有効開始日より後である必要があります | 登録/更新 |
| NO_EFFECTIVE_VERSION_FOUND | 指定日時点で有効なバージョンが見つかりません | as-of検索 |
| DEPARTMENT_NOT_FOUND | 部門が見つかりません | 詳細/更新/移動/無効化/再有効化 |
| DEPARTMENT_CODE_DUPLICATE | 部門コードが重複しています | 登録/更新 |
| DEPARTMENT_ALREADY_INACTIVE | この部門は既に無効化されています | 無効化 |
| DEPARTMENT_ALREADY_ACTIVE | この部門は既に有効です | 再有効化 |
| CIRCULAR_REFERENCE_DETECTED | 循環参照が発生するため、この移動はできません | 移動/親変更 |
| VALIDATION_ERROR | 入力内容に誤りがあります | 全バリデーション |

### Error UI behavior

* Show validation errors inline per field
* Show API/business errors in a top alert panel
* Circular reference error: Show as toast with destructive variant
* Map error codes to user-friendly Japanese messages

---

## UI Specification（詳細）

### 左パネル: バージョンリスト

**表示形式:**
- 縦型リスト（Scroll Area内）
- 各アイテムにバージョンコード、バージョン名、有効開始日、部門数を表示
- 現在有効なバージョン（isCurrentlyEffective=true）にはBadge「有効」を表示

**操作:**
- アイテムクリックで当該バージョンを選択 → 部門ツリー更新
- 「+新規」ボタンで新規バージョン作成ダイアログ
- 「コピー」ボタン（選択中バージョン）でコピーダイアログ
- 「編集」ボタン（選択中バージョン）で編集ダイアログ

**ソート:**
- 有効開始日（デフォルト降順）、バージョンコード、バージョン名

### 中央パネル: 部門ツリー

**表示形式:**
- 階層ツリー（展開/折りたたみ可能）
- 各ノードに部門コード、部門名、組織単位種別（Badge）、有効状態を表示
- 無効部門はグレーアウト（opacity-50）

**操作:**
- ノードクリックで詳細パネル更新
- ノード展開/折りたたみ（ChevronRight/ChevronDown）
- **ドラッグ＆ドロップ**で部門移動
  - ドロップ可能位置を視覚的に表示（border-dashed-primary）
  - 循環参照発生時はエラートースト表示
- **右クリック**でコンテキストメニュー
  - 「子部門を追加」→ 部門作成ダイアログ（parentIdプリセット）
  - 「無効化」/「再有効化」
  - 「編集」

**フィルタ:**
- キーワード検索（部門コード・部門名の部分一致）
- 有効フラグフィルタ（有効/無効/すべて）
- 組織単位種別フィルタ
- フィルタ適用時、該当部門の親ノードを自動展開

**ドラッグ＆ドロップライブラリ:**
- `dnd-kit` を使用

### 右パネル: 詳細パネル

**表示形式:**
- 選択した部門の全属性を表示
- 表示モード / 編集モード の切り替え

**表示項目:**
| 項目 | 表示形式 | 備考 |
|------|---------|------|
| 部門コード | Input（編集時） / Text（表示時） | 必須 |
| 部門名 | Input | 必須 |
| 部門名略称 | Input | 任意 |
| 親部門 | Select（編集時） / Text（表示時） | 同バージョン内の有効部門、自身除外 |
| 表示順 | Input (number) | デフォルト10 |
| 組織単位種別 | Select | 本部/事業部/部/課/係 等 |
| 責任種別 | Select | 利益責任/原価責任/収益責任 等 |
| 外部センターコード | Input | ERP連携用 |
| 責任者 | Select（将来：社員マスタ連携） | 現状はID入力 |
| 備考 | Textarea | 任意 |
| stable_id | Text（読み取り専用） | 版非依存ID |
| 作成日時 | Text（読み取り専用） | - |
| 更新日時 | Text（読み取り専用） | - |

**操作:**
- 「編集」ボタンで編集モードへ
- 「保存」ボタンで更新実行
- 「キャンセル」ボタンで編集モード解除
- 「無効化」/「再有効化」ボタン

**組織単位種別の選択肢:**
| 値 | 表示ラベル |
|----|-----------|
| headquarters | 本部 |
| division | 事業部 |
| dept | 部 |
| section | 課 |
| unit | 係 |
| branch | 支店 |
| factory | 工場 |

**責任種別の選択肢:**
| 値 | 表示ラベル |
|----|-----------|
| profit | 利益責任 |
| cost | 原価責任 |
| revenue | 収益責任 |
| investment | 投資責任 |

### バージョン作成/コピー/編集ダイアログ

**フォーム項目:**
| 項目 | 入力形式 | 必須 | バリデーション | 備考 |
|------|---------|------|---------------|------|
| versionCode | Input | ✅ | 最大20文字 | - |
| versionName | Input | ✅ | 最大200文字 | - |
| effectiveDate | DatePicker | ✅ | - | 有効開始日 |
| expiryDate | DatePicker | - | > effectiveDate | 有効終了日（NULL=無期限） |
| description | Textarea | - | - | 説明 |

**コピーダイアログ追加表示:**
- コピー元バージョン情報（読み取り専用）
- 「部門もコピーされます」の注意書き

### 部門作成ダイアログ

**フォーム項目:**
| 項目 | 入力形式 | 必須 | バリデーション | 備考 |
|------|---------|------|---------------|------|
| departmentCode | Input | ✅ | 最大50文字 | - |
| departmentName | Input | ✅ | 最大200文字 | - |
| departmentNameShort | Input | - | 最大100文字 | - |
| parentId | Select | - | - | 右クリック元部門がプリセット |
| sortOrder | Input (number) | - | 正整数 | デフォルト10 |
| orgUnitType | Select | - | - | - |
| responsibilityType | Select | - | - | - |
| externalCenterCode | Input | - | 最大30文字 | - |
| notes | Textarea | - | - | - |

---

## UI Output Requirements

Generate Next.js (App Router) + TypeScript + Tailwind UI.
Include:

1. Routes/pages for the screens (**page.tsx only; no layout.tsx**)
2. A typed `BffClient` interface (methods correspond to endpoints above)
3. `MockBffClient` returning sample DTO-shaped data
4. `HttpBffClient` with fetch wrappers (unused initially, easy to switch)
5. Data models in UI must be the DTO types from contracts/bff
6. Production-like UI with Japanese labels

---

## Mock Data Requirements

Provide mock data sets that:
* cover empty state, typical state (10-20 departments), and error state
* use realistic Japanese organization names (例: 営業本部、経理部、開発課)
* include hierarchical relationships (本部→部→課)
* include both active and inactive departments
* include 2-3 organization versions (過去版・現行版・将来版)
* strictly match the BFF response DTO shape

**Mock data examples:**

```typescript
// バージョン一覧
const mockVersions: BffVersionSummary[] = [
  {
    id: 'ver-2024-04',
    versionCode: '2024-04',
    versionName: '2024年4月組織改編',
    effectiveDate: '2024-04-01',
    expiryDate: '2025-03-31',
    isCurrentlyEffective: false,
    departmentCount: 15,
  },
  {
    id: 'ver-2025-04',
    versionCode: '2025-04',
    versionName: '2025年4月組織改編',
    effectiveDate: '2025-04-01',
    expiryDate: null,
    isCurrentlyEffective: true,
    departmentCount: 18,
  },
  {
    id: 'ver-2026-04',
    versionCode: '2026-04',
    versionName: '2026年4月組織改編（予定）',
    effectiveDate: '2026-04-01',
    expiryDate: null,
    isCurrentlyEffective: false,
    departmentCount: 20,
  },
];

// 部門ツリー
const mockDepartmentTree: BffDepartmentTreeNode[] = [
  {
    id: 'dept-001',
    departmentCode: 'HQ',
    departmentName: '本社',
    departmentNameShort: '本社',
    orgUnitType: 'headquarters',
    isActive: true,
    hierarchyLevel: 1,
    children: [
      {
        id: 'dept-002',
        departmentCode: 'SALES',
        departmentName: '営業本部',
        departmentNameShort: '営業',
        orgUnitType: 'division',
        isActive: true,
        hierarchyLevel: 2,
        children: [
          {
            id: 'dept-003',
            departmentCode: 'SALES-1',
            departmentName: '第一営業部',
            departmentNameShort: '第一営業',
            orgUnitType: 'dept',
            isActive: true,
            hierarchyLevel: 3,
            children: [],
          },
          {
            id: 'dept-004',
            departmentCode: 'SALES-2',
            departmentName: '第二営業部',
            departmentNameShort: '第二営業',
            orgUnitType: 'dept',
            isActive: true,
            hierarchyLevel: 3,
            children: [],
          },
        ],
      },
      {
        id: 'dept-005',
        departmentCode: 'DEV',
        departmentName: '開発本部',
        departmentNameShort: '開発',
        orgUnitType: 'division',
        isActive: true,
        hierarchyLevel: 2,
        children: [
          {
            id: 'dept-006',
            departmentCode: 'DEV-PROD',
            departmentName: 'プロダクト開発部',
            departmentNameShort: 'プロダクト',
            orgUnitType: 'dept',
            isActive: true,
            hierarchyLevel: 3,
            children: [],
          },
        ],
      },
      {
        id: 'dept-007',
        departmentCode: 'ADMIN',
        departmentName: '管理本部',
        departmentNameShort: '管理',
        orgUnitType: 'division',
        isActive: true,
        hierarchyLevel: 2,
        children: [
          {
            id: 'dept-008',
            departmentCode: 'ADMIN-FIN',
            departmentName: '経理部',
            departmentNameShort: '経理',
            orgUnitType: 'dept',
            isActive: true,
            hierarchyLevel: 3,
            children: [],
          },
          {
            id: 'dept-009',
            departmentCode: 'ADMIN-HR',
            departmentName: '人事部',
            departmentNameShort: '人事',
            orgUnitType: 'dept',
            isActive: true,
            hierarchyLevel: 3,
            children: [],
          },
        ],
      },
    ],
  },
  {
    id: 'dept-010',
    departmentCode: 'OLD-SALES',
    departmentName: '旧営業部（廃止）',
    departmentNameShort: '旧営業',
    orgUnitType: 'dept',
    isActive: false,
    hierarchyLevel: 1,
    children: [],
  },
];

// 部門詳細
const mockDepartmentDetail: BffDepartmentDetailResponse = {
  id: 'dept-003',
  versionId: 'ver-2025-04',
  stableId: 'stable-sales-1',
  departmentCode: 'SALES-1',
  departmentName: '第一営業部',
  departmentNameShort: '第一営業',
  parentId: 'dept-002',
  parentDepartmentName: '営業本部',
  sortOrder: 10,
  hierarchyLevel: 3,
  hierarchyPath: '/HQ/SALES/SALES-1',
  orgUnitType: 'dept',
  responsibilityType: 'profit',
  externalCenterCode: 'CC001',
  managerId: null,
  managerName: null,
  isActive: true,
  notes: '法人営業を担当',
  createdAt: '2025-04-01T00:00:00Z',
  updatedAt: '2025-04-01T00:00:00Z',
};
```

---

## Authentication / Tenant

* UI only attaches auth token to BFF requests.
* UI must not handle tenant_id directly.

---

# REQUIRED: Repository Constraints

## v0 Isolation Output Path (MANDATORY)

* Write all generated code ONLY under:
  * `apps/web/_v0_drop/master-data/organization-master/src`
* Do NOT write to `apps/web/src` directly.
* Do NOT place source files outside the `src/` folder.

**Expected Output Structure:**
```
apps/web/_v0_drop/master-data/organization-master/src/
├── OUTPUT.md
├── page.tsx
├── components/
│   ├── VersionList.tsx
│   ├── DepartmentTree.tsx
│   ├── DepartmentTreeNode.tsx
│   ├── DepartmentDetailPanel.tsx
│   ├── CreateVersionDialog.tsx
│   ├── CopyVersionDialog.tsx
│   ├── EditVersionDialog.tsx
│   ├── CreateDepartmentDialog.tsx
│   └── DepartmentContextMenu.tsx
├── api/
│   ├── BffClient.ts
│   ├── MockBffClient.ts
│   └── HttpBffClient.ts
├── hooks/
│   ├── useVersions.ts
│   ├── useDepartmentTree.ts
│   └── useDepartmentDetail.ts
└── constants/
    └── options.ts (組織単位種別・責任種別の選択肢)
```

## Prohibited Imports / Calls (MANDATORY)

### Imports / Contracts
* UI must NOT import from `packages/contracts/src/api`.
* UI must use `packages/contracts/src/bff` DTOs and errors only.
* Do NOT redefine DTO/Enum/Error types inside feature code.

### Network Access
* UI must NOT call Domain API directly (no `/api/master-data/...` calls).
* Direct `fetch()` is allowed ONLY inside `api/HttpBffClient.ts`.

### App Router / Shell
* Do NOT generate `layout.tsx` anywhere.
* Do NOT create a new sidebar/header/shell layout.
* All screens MUST render inside the existing AppShell.

---

## REQUIRED OUTPUT ARTIFACT: OUTPUT.md

Create `apps/web/_v0_drop/master-data/organization-master/src/OUTPUT.md` with:

### 1) Generated files (tree)
Complete tree of everything generated under `src/`.

### 2) Key imports / dependency notes
- `@/shared/ui` usage (which Tier 1 components used)
- `packages/contracts/src/bff` DTO imports
- `BffClient` / `MockBffClient` / `HttpBffClient` relationships
- `dnd-kit` usage for drag-and-drop

### 3) Missing Shared Component / Pattern (TODO)
- Suggested shared components that don't exist yet
- Include filename, props interface, purpose

### 4) Migration notes (_v0_drop → features)
- Step-by-step migration plan
- Path/import changes needed

### 5) Constraint compliance checklist
- [ ] Code written ONLY under `apps/web/_v0_drop/master-data/organization-master/src`
- [ ] UI components imported ONLY from `@/shared/ui`
- [ ] DTO types imported from `packages/contracts/src/bff` (no UI re-definition)
- [ ] No imports from `packages/contracts/src/api`
- [ ] No Domain API direct calls (/api/)
- [ ] No direct fetch() outside `api/HttpBffClient.ts`
- [ ] No layout.tsx generated
- [ ] No base UI components created under features
- [ ] No raw color literals (bg-[#...], text-[oklch(...)], etc.)
- [ ] No arbitrary Tailwind colors (bg-teal-500, etc.)
- [ ] No new sidebar/header/shell created inside the feature
- [ ] All spacing uses Tailwind scale (no arbitrary values like p-[16px])
- [ ] Dark mode support via semantic tokens (no manual dark: variants)
- [ ] dnd-kit used for drag-and-drop (no other D&D libraries)

---

## Quick Checklist for v0 Execution

Before generating:
- [x] Feature name and description: 組織・部門マスタ（Organization Master）
- [x] BFF endpoints table: 13 endpoints defined
- [x] DTO import paths: `@contracts/bff/organization-master`
- [x] Mock data requirements: バージョン3件、部門10-20件、階層構造、有効/無効
- [x] Output path: `apps/web/_v0_drop/master-data/organization-master/src`

After generating, verify:
- [ ] OUTPUT.md created with all 5 sections
- [ ] No raw color literals
- [ ] No layout.tsx created
- [ ] No base UI components recreated
- [ ] All components imported from `@/shared/ui`
- [ ] All DTOs imported from `@contracts/bff`
- [ ] BffClient interface matches 13 endpoints
- [ ] MockBffClient provides realistic Japanese organization data
- [ ] Dark mode works automatically
- [ ] Spacing uses Tailwind scale
- [ ] Drag & Drop works with dnd-kit
- [ ] Context menu works for department tree nodes

---

## Summary

Use EPM Design System colors and components.
Primary: Deep Teal oklch(0.52 0.13 195)
Secondary: Royal Indigo oklch(0.48 0.15 280)

Feature: Organization Master（組織・部門マスタ）

UI構成: 1画面統合型（3ペイン）
- 左: バージョンリスト
- 中央: 部門ツリー（D&D対応）
- 右: 詳細パネル

BFF Endpoints:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | /api/bff/master-data/organization-master/versions | BffVersionListRequest | BffVersionListResponse |
| GET | /api/bff/master-data/organization-master/versions/:id | - | BffVersionDetailResponse |
| POST | /api/bff/master-data/organization-master/versions | BffCreateVersionRequest | BffVersionDetailResponse |
| POST | /api/bff/master-data/organization-master/versions/:id/copy | BffCopyVersionRequest | BffVersionDetailResponse |
| PATCH | /api/bff/master-data/organization-master/versions/:id | BffUpdateVersionRequest | BffVersionDetailResponse |
| GET | /api/bff/master-data/organization-master/versions/:id/as-of | asOfDate (query) | BffVersionDetailResponse |
| GET | /api/bff/master-data/organization-master/versions/:versionId/departments/tree | BffDepartmentTreeRequest | BffDepartmentTreeResponse |
| GET | /api/bff/master-data/organization-master/departments/:id | - | BffDepartmentDetailResponse |
| POST | /api/bff/master-data/organization-master/versions/:versionId/departments | BffCreateDepartmentRequest | BffDepartmentDetailResponse |
| PATCH | /api/bff/master-data/organization-master/departments/:id | BffUpdateDepartmentRequest | BffDepartmentDetailResponse |
| POST | /api/bff/master-data/organization-master/departments/:id/move | BffMoveDepartmentRequest | BffDepartmentTreeResponse |
| POST | /api/bff/master-data/organization-master/departments/:id/deactivate | - | BffDepartmentDetailResponse |
| POST | /api/bff/master-data/organization-master/departments/:id/reactivate | - | BffDepartmentDetailResponse |

DTOs:
```typescript
import type { ... } from '@contracts/bff/organization-master'
```

Use Tier 1 components: Button, Card, Input, Dialog, Badge, Select, Alert, Label, Scroll Area, Dropdown Menu, Tooltip
Use dnd-kit for drag-and-drop

Output to: apps/web/_v0_drop/master-data/organization-master/src

Include OUTPUT.md with:
1. File tree
2. Import notes
3. Missing components TODO
4. Migration steps
5. Constraint checklist

---

**End of v0 Prompt**
