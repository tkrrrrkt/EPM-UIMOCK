# v0 Prompt: Group Report Layout Master（連結レポートレイアウトマスタ）

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

**group-report-layout**: Group Report Layout Master Management（連結レポートレイアウトマスタ管理）

連結レポートレイアウトマスタ機能は、EPM SaaSにおける連結PL（連結損益計算書）、連結BS（連結貸借対照表）、連結KPI（グループ非財務指標）の表示レイアウトを定義・管理する機能です。連結レイアウトヘッダ（group_report_layouts）と連結レイアウト行（group_report_layout_lines）を管理し、見出し・科目行・注記・空白行を組み合わせてグループ全体の経営管理レポートの表示形式をカスタマイズ可能にします。

**個社レイアウト（report-layout）との主な違い:**
- **スコープ**: テナント単位（会社別ではない）
- **参照科目**: 連結勘定科目（group_subjects）を使用（個社のsubjectsではない）
- **編集権限**: 親会社のみが編集可能（子会社は参照のみ）
- **会社選択DDL**: 不要（テナント共通のため）
- **デフォルト設定**: レイアウト種別（PL/BS/KPI）ごとに1つのデフォルトを設定可能
- **拡張表示スタイル**: is_bold, is_underline, is_double_underline, bg_highlight

**UIは個社レイアウト（report-layout）と統一感を持たせること**: 操作フロー、画面構成、コンポーネント配置は個社レイアウトと同様にし、ユーザーが直感的に操作できる設計とする。

### Key Requirements

1. **レイアウト一覧画面**: レイアウトコード、レイアウト名、レイアウト種別（PL/BS/KPI）、デフォルトフラグ、有効状態を表示、検索・フィルタ・ソート・ページング対応
2. **レイアウト詳細画面（1画面統合型）**: レイアウト基本情報と行リストを同じ画面で表示・編集
3. **レイアウト行管理**: 行の追加・編集・削除・並べ替え（ドラッグ＆ドロップ）
4. **連結科目選択**: account行に紐付ける連結科目を検索・選択（財務レイアウト/KPIレイアウトでフィルタリング）
5. **親会社権限制御**: 親会社ユーザーのみが編集可能、子会社ユーザーは参照のみ（編集ボタン非表示）
6. **デフォルトレイアウト管理**: レイアウト種別ごとに1つのデフォルトを設定可能

---

## Screens to build

### Screen 1: Layout List Page (`/master-data/group-report-layout`)

**Purpose**: 連結レイアウト一覧の表示・検索・フィルタリング

**Layout**: 個社レイアウト一覧と同様の構成（会社選択DDLは不要）

**Components**:
- 検索バー（レイアウトコード・レイアウト名の部分一致検索）
- レイアウト種別タブ（全件/PL/BS/KPI）
- 有効フラグフィルタ（全件/有効のみ/無効のみ）
- ソート機能（レイアウトコード、レイアウト名で昇順/降順）
- テーブル表示（レイアウトコード、レイアウト名、レイアウト種別、デフォルト、有効状態、行数）
- ページネーション
- 「新規作成」ボタン（親会社のみ表示）
- テーブル行クリックで詳細画面へ遷移

**Visual Distinctions**:
- 無効レイアウト（is_active=false）をグレーアウト表示
- デフォルトレイアウト（is_default=true）に「デフォルト」バッジ表示

**Permission Control**:
- 子会社ユーザーの場合: 「新規作成」ボタンを非表示

---

### Screen 2: Layout Detail Page (`/master-data/group-report-layout/[id]`)

**Purpose**: 連結レイアウトの詳細表示・編集（1画面統合型）

**Layout**: 個社レイアウト詳細と同様の3セクション構成

#### Section 1: Layout Info Section（上部）
- Card showing layout basic info (read-only view with "編集" button, or edit mode with form)
- 表示項目: レイアウトコード、レイアウト名、レイアウト名（短縮）、レイアウト種別（PL/BS/KPI）、説明、デフォルト、有効状態
- Action buttons（親会社のみ表示）:
  - 編集モード切替ボタン
  - 無効化/再有効化ボタン
  - デフォルト設定ボタン
  - 複製ボタン
- 種別変更時の警告ダイアログ

#### Section 2: Line List Section（中央）
- 行一覧テーブル（ドラッグ可能な行）
- 表示項目: 行番号、行種別、表示名、連結科目名（account行の場合）、科目クラス（BASE/AGGREGATE）、インデントレベル、表示スタイル（太字・下線・二重下線・ハイライト）
- 行種別を視覚的に区別（アイコンまたは色分け）
- インデントレベルに応じた字下げ表示（0-10）
- 表示スタイル設定の視覚的反映
- 「行追加」ボタン（親会社のみ表示）
- 各行に編集・削除ボタン（親会社のみ表示）
- ドラッグ＆ドロップで行の並べ替え（親会社のみ有効）

**Permission Control**:
- 子会社ユーザーの場合: 編集ボタン、行追加ボタン、行編集・削除ボタン、D&D機能を非表示/無効化

#### Section 3: Preview Section（下部）
- Card showing preview of layout lines formatted as report
- 見出し行（header）を太字・大きめのフォントで表示
- 科目行（account）を連結科目名とともにインデント付きで表示
- AGGREGATE科目の場合は表示スタイル設定に従って表示
- 注記行（note）を斜体または小さめのフォントで表示
- 空白行（blank）を空行として表示
- 表示スタイル（太字・下線・二重下線・ハイライト）をプレビューに反映
- 無効化された連結科目を参照しているaccount行が存在する場合、アラート表示

---

### Screen 3: Layout Create Dialog

**Purpose**: 新規連結レイアウト作成

**Form Fields**:
- レイアウトコード* (required)
- レイアウト名* (required)
- レイアウト名（短縮）(optional)
- レイアウト種別* (required): PL / BS / KPI
- 説明 (optional)

**Validation**:
- 必須項目チェック
- レイアウトコード重複チェック（エラー: LAYOUT_CODE_DUPLICATE）

---

### Screen 4: Line Create/Edit Dialog

**Purpose**: 連結レイアウト行の作成・編集

**Form Fields**（行種別に応じた出し分け）:

| 行種別 | 表示名 | 連結科目選択 | インデントレベル | 符号表示ポリシー | 表示スタイル | 備考 |
|--------|--------|-------------|-----------------|-----------------|--------------|------|
| header | 必須* | - | 0-10 | - | is_bold, is_underline, is_double_underline, bg_highlight | 見出し行 |
| account | 手動入力可 | 必須* | 0-10 | auto/force_plus/force_minus/force_paren | 全て | 科目行 |
| note | 必須* | - | 0-10 | - | is_bold, is_underline, is_double_underline, bg_highlight | 注記行 |
| blank | - | - | 0-10 | - | is_bold, bg_highlight | 空白行 |

**Validation**:
- header: displayName必須
- account: groupSubjectId必須（displayNameは手動入力可能）
- note: displayName必須
- blank: 追加項目不要

---

### Screen 5: Group Subject Selection Dialog

**Purpose**: account行に紐付ける連結科目の検索・選択

**Features**:
- キーワード検索（連結科目コード・連結科目名の部分一致検索）
- レイアウト種別に応じた連結科目フィルタリング
  - 財務レイアウト（PL）: subject_type='FIN' かつ fin_stmt_class='PL' のみ表示
  - 財務レイアウト（BS）: subject_type='FIN' かつ fin_stmt_class='BS' のみ表示
  - KPIレイアウト: subject_type='KPI' のみ表示
- 有効な連結科目（is_active=true）のみ表示
- 連結科目一覧（連結科目コード、連結科目名、科目クラス（BASE/AGGREGATE））
- ページネーション
- 選択ボタン

---

### Screen 6: Copy Layout Dialog

**Purpose**: 既存連結レイアウトの複製

**Form Fields**:
- 新しいレイアウトコード* (required)
- 新しいレイアウト名* (required)

**Note**: 複製元のレイアウト種別は引き継ぐ（変更不可）

---

## BFF Specification (from design.md)

### Context Endpoint（重要: 親会社判定用）

| Method | Endpoint | Purpose | Response DTO |
|--------|----------|---------|--------------|
| GET | /api/bff/master-data/group-report-layout/context | コンテキスト取得 | BffGroupLayoutContextResponse |

**Response**:
```ts
interface BffGroupLayoutContextResponse {
  isParentCompany: boolean;  // 編集権限の有無
  canEdit: boolean;          // isParentCompanyのエイリアス（UI用）
}
```

### Layout Endpoints

| Method | Endpoint | Purpose | Request DTO | Response DTO | Notes |
|--------|----------|---------|-------------|--------------|-------|
| GET | /api/bff/master-data/group-report-layout/layouts | レイアウト一覧取得 | BffGroupLayoutListRequest | BffGroupLayoutListResponse | フィルタ・ソート対応 |
| GET | /api/bff/master-data/group-report-layout/layouts/:id | レイアウト詳細取得 | - | BffGroupLayoutDetailResponse | UUID パス |
| POST | /api/bff/master-data/group-report-layout/layouts | レイアウト新規作成 | BffCreateGroupLayoutRequest | BffGroupLayoutDetailResponse | 親会社のみ |
| PATCH | /api/bff/master-data/group-report-layout/layouts/:id | レイアウト編集 | BffUpdateGroupLayoutRequest | BffGroupLayoutDetailResponse | 親会社のみ |
| POST | /api/bff/master-data/group-report-layout/layouts/:id/deactivate | レイアウト無効化 | - | BffGroupLayoutDetailResponse | 親会社のみ |
| POST | /api/bff/master-data/group-report-layout/layouts/:id/reactivate | レイアウト再有効化 | - | BffGroupLayoutDetailResponse | 親会社のみ |
| POST | /api/bff/master-data/group-report-layout/layouts/:id/set-default | デフォルト設定 | - | BffGroupLayoutDetailResponse | 親会社のみ |
| POST | /api/bff/master-data/group-report-layout/layouts/:id/copy | レイアウト複製 | BffCopyGroupLayoutRequest | BffGroupLayoutDetailResponse | 親会社のみ |

### Line Endpoints

| Method | Endpoint | Purpose | Request DTO | Response DTO | Notes |
|--------|----------|---------|-------------|--------------|-------|
| GET | /api/bff/master-data/group-report-layout/layouts/:layoutId/lines | 行一覧取得 | - | BffGroupLineListResponse | line_no順 |
| GET | /api/bff/master-data/group-report-layout/lines/:id | 行詳細取得 | - | BffGroupLineDetailResponse | UUID パス |
| POST | /api/bff/master-data/group-report-layout/layouts/:layoutId/lines | 行追加 | BffCreateGroupLineRequest | BffGroupLineDetailResponse | 親会社のみ |
| PATCH | /api/bff/master-data/group-report-layout/lines/:id | 行編集 | BffUpdateGroupLineRequest | BffGroupLineDetailResponse | 親会社のみ |
| DELETE | /api/bff/master-data/group-report-layout/lines/:id | 行削除 | - | - | 親会社のみ |
| POST | /api/bff/master-data/group-report-layout/lines/:id/move | 行移動（D&D） | BffMoveGroupLineRequest | BffGroupLineListResponse | 親会社のみ |

### Group Subject Search Endpoint

| Method | Endpoint | Purpose | Request DTO | Response DTO |
|--------|----------|---------|-------------|--------------|
| GET | /api/bff/master-data/group-report-layout/group-subjects | 連結科目検索 | BffGroupSubjectSearchRequest | BffGroupSubjectSearchResponse |

---

### DTOs to use (contracts/bff)

#### Context DTOs

```ts
interface BffGroupLayoutContextResponse {
  isParentCompany: boolean;
  canEdit: boolean;
}
```

#### Layout DTOs

**Types**:
```ts
type LayoutType = 'PL' | 'BS' | 'KPI';
type LineType = 'header' | 'account' | 'note' | 'blank';
type SignDisplayPolicy = 'auto' | 'force_plus' | 'force_minus' | 'force_paren';
type SubjectClass = 'BASE' | 'AGGREGATE';
```

**Request DTOs**:
```ts
interface BffGroupLayoutListRequest {
  page?: number;
  pageSize?: number;
  sortBy?: 'layoutCode' | 'layoutName' | 'sortOrder';
  sortOrder?: 'asc' | 'desc';
  keyword?: string;
  layoutType?: LayoutType;
  isActive?: boolean;
}

interface BffCreateGroupLayoutRequest {
  layoutCode: string;
  layoutName: string;
  layoutType: LayoutType;
  layoutNameShort?: string;
  description?: string;
}

interface BffUpdateGroupLayoutRequest {
  layoutCode?: string;
  layoutName?: string;
  layoutNameShort?: string;
  description?: string;
  layoutType?: LayoutType;  // 種別変更時は既存の行がすべて削除される
}

interface BffCopyGroupLayoutRequest {
  layoutCode: string;
  layoutName: string;
}
```

**Response DTOs**:
```ts
interface BffGroupLayoutSummary {
  id: string;
  layoutCode: string;
  layoutName: string;
  layoutNameShort: string | null;
  layoutType: LayoutType;
  isDefault: boolean;
  isActive: boolean;
  lineCount: number;
  sortOrder: number;
}

interface BffGroupLayoutListResponse {
  items: BffGroupLayoutSummary[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

interface BffGroupLayoutDetailResponse {
  id: string;
  layoutCode: string;
  layoutName: string;
  layoutNameShort: string | null;
  layoutType: LayoutType;
  description: string | null;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
```

#### Line DTOs

**Request DTOs**:
```ts
interface BffCreateGroupLineRequest {
  lineType: LineType;
  displayName?: string;
  groupSubjectId?: string;
  indentLevel?: number;
  signDisplayPolicy?: SignDisplayPolicy;
  isBold?: boolean;
  isUnderline?: boolean;
  isDoubleUnderline?: boolean;
  bgHighlight?: boolean;
  notes?: string;
}

interface BffUpdateGroupLineRequest {
  displayName?: string;
  groupSubjectId?: string;
  indentLevel?: number;
  signDisplayPolicy?: SignDisplayPolicy;
  isBold?: boolean;
  isUnderline?: boolean;
  isDoubleUnderline?: boolean;
  bgHighlight?: boolean;
  notes?: string;
}

interface BffMoveGroupLineRequest {
  targetLineNo: number;
}
```

**Response DTOs**:
```ts
interface BffGroupLineSummary {
  id: string;
  lineNo: number;
  lineType: LineType;
  displayName: string | null;
  groupSubjectId: string | null;
  groupSubjectCode: string | null;
  groupSubjectName: string | null;
  subjectClass: SubjectClass | null;
  indentLevel: number;
  signDisplayPolicy: SignDisplayPolicy;
  isBold: boolean;
  isUnderline: boolean;
  isDoubleUnderline: boolean;
  bgHighlight: boolean;
}

interface BffGroupLineListResponse {
  layoutId: string;
  layoutCode: string;
  items: BffGroupLineSummary[];
}

interface BffGroupLineDetailResponse {
  id: string;
  layoutId: string;
  lineNo: number;
  lineType: LineType;
  displayName: string | null;
  groupSubjectId: string | null;
  groupSubjectCode: string | null;
  groupSubjectName: string | null;
  subjectClass: SubjectClass | null;
  indentLevel: number;
  signDisplayPolicy: SignDisplayPolicy;
  isBold: boolean;
  isUnderline: boolean;
  isDoubleUnderline: boolean;
  bgHighlight: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
```

#### Group Subject Search DTOs

```ts
interface BffGroupSubjectSearchRequest {
  layoutType: LayoutType;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

interface BffGroupSubjectSummary {
  id: string;
  groupSubjectCode: string;
  groupSubjectName: string;
  subjectClass: SubjectClass;
}

interface BffGroupSubjectSearchResponse {
  items: BffGroupSubjectSummary[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
```

### DTO import example (MANDATORY)

```ts
import type {
  // Context
  BffGroupLayoutContextResponse,
  // Layout
  BffGroupLayoutListRequest,
  BffGroupLayoutListResponse,
  BffGroupLayoutSummary,
  BffGroupLayoutDetailResponse,
  BffCreateGroupLayoutRequest,
  BffUpdateGroupLayoutRequest,
  BffCopyGroupLayoutRequest,
  // Line
  BffGroupLineListResponse,
  BffGroupLineSummary,
  BffGroupLineDetailResponse,
  BffCreateGroupLineRequest,
  BffUpdateGroupLineRequest,
  BffMoveGroupLineRequest,
  // Group Subject
  BffGroupSubjectSearchRequest,
  BffGroupSubjectSearchResponse,
  BffGroupSubjectSummary,
  // Types
  LayoutType,
  LineType,
  SignDisplayPolicy,
  SubjectClass,
} from "@epm/contracts/bff/group-report-layout";
```

---

### Error UI behavior

* Show validation errors inline per field (required fields, format errors)
* Show API/business errors in a top alert panel
* Map error codes to user-friendly messages:

| Error Code | UI Message |
|------------|-----------|
| `LAYOUT_NOT_FOUND` | "レイアウトが見つかりません" |
| `LAYOUT_CODE_DUPLICATE` | "レイアウトコードが重複しています" |
| `LAYOUT_ALREADY_INACTIVE` | "このレイアウトは既に無効化されています" |
| `LAYOUT_ALREADY_ACTIVE` | "このレイアウトは既に有効です" |
| `DEFAULT_LAYOUT_CANNOT_DEACTIVATE` | "デフォルトレイアウトは無効化できません。先に別のレイアウトをデフォルトに設定してください" |
| `INACTIVE_LAYOUT_CANNOT_SET_DEFAULT` | "無効なレイアウトはデフォルトに設定できません" |
| `LINE_NOT_FOUND` | "行が見つかりません" |
| `GROUP_SUBJECT_REQUIRED_FOR_ACCOUNT` | "account行には連結科目を選択してください" |
| `GROUP_SUBJECT_NOT_FOUND` | "連結科目が見つかりません" |
| `GROUP_SUBJECT_INACTIVE` | "無効化された連結科目は選択できません" |
| `GROUP_SUBJECT_TYPE_MISMATCH` | "選択した連結科目はこのレイアウト種別では使用できません" |
| `NOT_PARENT_COMPANY` | "連結レイアウトの編集権限がありません" |
| `VALIDATION_ERROR` | "入力内容に誤りがあります" |

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
* use realistic values for EPM domain
* strictly match the BFF response DTO shape

### Sample Mock Data

**Context**:
```ts
const mockContext: BffGroupLayoutContextResponse = {
  isParentCompany: true,
  canEdit: true,
};
```

**Layouts**:
```ts
const mockLayouts: BffGroupLayoutSummary[] = [
  {
    id: "group-layout-001",
    layoutCode: "GPL_STD",
    layoutName: "標準連結PL",
    layoutNameShort: "連結PL",
    layoutType: "PL",
    isDefault: true,
    isActive: true,
    lineCount: 25,
    sortOrder: 10,
  },
  {
    id: "group-layout-002",
    layoutCode: "GBS_STD",
    layoutName: "標準連結BS",
    layoutNameShort: "連結BS",
    layoutType: "BS",
    isDefault: true,
    isActive: true,
    lineCount: 30,
    sortOrder: 10,
  },
  {
    id: "group-layout-003",
    layoutCode: "GKPI_STD",
    layoutName: "標準連結KPI",
    layoutNameShort: "連結KPI",
    layoutType: "KPI",
    isDefault: true,
    isActive: true,
    lineCount: 15,
    sortOrder: 10,
  },
  {
    id: "group-layout-004",
    layoutCode: "GPL_MGMT",
    layoutName: "管理連結PL",
    layoutNameShort: null,
    layoutType: "PL",
    isDefault: false,
    isActive: true,
    lineCount: 20,
    sortOrder: 20,
  },
  {
    id: "group-layout-005",
    layoutCode: "GPL_OLD",
    layoutName: "旧連結PL（無効）",
    layoutNameShort: null,
    layoutType: "PL",
    isDefault: false,
    isActive: false,
    lineCount: 18,
    sortOrder: 99,
  },
];
```

**Lines**:
```ts
const mockLines: BffGroupLineSummary[] = [
  {
    id: "line-001",
    lineNo: 10,
    lineType: "header",
    displayName: "売上高",
    groupSubjectId: null,
    groupSubjectCode: null,
    groupSubjectName: null,
    subjectClass: null,
    indentLevel: 0,
    signDisplayPolicy: "auto",
    isBold: true,
    isUnderline: false,
    isDoubleUnderline: false,
    bgHighlight: false,
  },
  {
    id: "line-002",
    lineNo: 20,
    lineType: "account",
    displayName: null,
    groupSubjectId: "gsubject-001",
    groupSubjectCode: "G4010",
    groupSubjectName: "連結売上高",
    subjectClass: "AGGREGATE",
    indentLevel: 1,
    signDisplayPolicy: "auto",
    isBold: false,
    isUnderline: false,
    isDoubleUnderline: false,
    bgHighlight: false,
  },
  {
    id: "line-003",
    lineNo: 30,
    lineType: "account",
    displayName: "内部売上高（表示名）",
    groupSubjectId: "gsubject-002",
    groupSubjectCode: "G4020",
    groupSubjectName: "内部売上高",
    subjectClass: "BASE",
    indentLevel: 2,
    signDisplayPolicy: "force_minus",
    isBold: false,
    isUnderline: false,
    isDoubleUnderline: false,
    bgHighlight: false,
  },
  {
    id: "line-004",
    lineNo: 40,
    lineType: "header",
    displayName: "売上総利益",
    groupSubjectId: null,
    groupSubjectCode: null,
    groupSubjectName: null,
    subjectClass: null,
    indentLevel: 0,
    signDisplayPolicy: "auto",
    isBold: true,
    isUnderline: true,
    isDoubleUnderline: false,
    bgHighlight: false,
  },
  {
    id: "line-005",
    lineNo: 50,
    lineType: "account",
    displayName: null,
    groupSubjectId: "gsubject-003",
    groupSubjectCode: "G5000",
    groupSubjectName: "連結売上総利益",
    subjectClass: "AGGREGATE",
    indentLevel: 1,
    signDisplayPolicy: "auto",
    isBold: true,
    isUnderline: false,
    isDoubleUnderline: true,
    bgHighlight: true,
  },
  {
    id: "line-006",
    lineNo: 60,
    lineType: "note",
    displayName: "注記: 連結消去後の金額",
    groupSubjectId: null,
    groupSubjectCode: null,
    groupSubjectName: null,
    subjectClass: null,
    indentLevel: 0,
    signDisplayPolicy: "auto",
    isBold: false,
    isUnderline: false,
    isDoubleUnderline: false,
    bgHighlight: false,
  },
  {
    id: "line-007",
    lineNo: 70,
    lineType: "blank",
    displayName: null,
    groupSubjectId: null,
    groupSubjectCode: null,
    groupSubjectName: null,
    subjectClass: null,
    indentLevel: 0,
    signDisplayPolicy: "auto",
    isBold: false,
    isUnderline: false,
    isDoubleUnderline: false,
    bgHighlight: false,
  },
];
```

**Group Subjects**:
```ts
const mockGroupSubjects: BffGroupSubjectSummary[] = [
  {
    id: "gsubject-001",
    groupSubjectCode: "G4010",
    groupSubjectName: "連結売上高",
    subjectClass: "AGGREGATE",
  },
  {
    id: "gsubject-002",
    groupSubjectCode: "G4020",
    groupSubjectName: "内部売上高",
    subjectClass: "BASE",
  },
  {
    id: "gsubject-003",
    groupSubjectCode: "G5000",
    groupSubjectName: "連結売上総利益",
    subjectClass: "AGGREGATE",
  },
  {
    id: "gsubject-004",
    groupSubjectCode: "G5010",
    groupSubjectName: "連結売上原価",
    subjectClass: "AGGREGATE",
  },
  {
    id: "gsubject-005",
    groupSubjectCode: "G6000",
    groupSubjectName: "連結販管費",
    subjectClass: "AGGREGATE",
  },
];
```

---

## Authentication / Tenant

* UI only attaches auth token to BFF requests.
* UI must not handle tenant_id directly.
* **親会社判定**: UI起動時に `/api/bff/master-data/group-report-layout/context` を呼び出し、`canEdit` フラグを取得して編集可否を制御

---

# REQUIRED: Design System & Repository Constraints (DO NOT REMOVE)

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
  * apps/web/_v0_drop/master-data/group-report-layout/src
* Assume this `src/` folder will later be moved to:
  * apps/web/src/features/master-data/group-report-layout/
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
  * `apps/web/_v0_drop/master-data/group-report-layout/src/api/HttpBffClient.ts`

### App Router / Shell
* Do NOT generate `layout.tsx` anywhere under the v0 output.
* Do NOT create a new sidebar/header/shell layout inside the feature.
* All screens MUST render inside the existing AppShell.

### Output Location
* Write ALL generated code ONLY under:
  * `apps/web/_v0_drop/master-data/group-report-layout/src`
* Do NOT write to `apps/web/src` directly.

---

## REQUIRED OUTPUT ARTIFACT (MANDATORY)

You MUST create an `OUTPUT.md` file under:
* apps/web/_v0_drop/master-data/group-report-layout/src/OUTPUT.md

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
  * [ ] Code written ONLY under `apps/web/_v0_drop/master-data/group-report-layout/src`
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

## Special Requirements for Group Report Layout

### Drag & Drop for Line Reordering
* Use `dnd-kit` library for drag and drop functionality
* Implement draggable rows in the line list table
* Show drop indicators during drag
* Call `POST /api/bff/master-data/group-report-layout/lines/:id/move` with `targetLineNo` after drop
* **D&D機能は親会社ユーザーのみ有効化**（子会社ユーザーは無効）

### Parent Company Permission Control（重要: 個社レイアウトとの主要な違い）
* UI起動時に Context API を呼び出して `canEdit` フラグを取得
* `canEdit: false` の場合（子会社ユーザー）:
  - 「新規作成」ボタンを非表示
  - 編集モード切替ボタンを非表示
  - 無効化/再有効化/デフォルト設定/複製ボタンを非表示
  - 「行追加」ボタンを非表示
  - 各行の編集・削除ボタンを非表示
  - D&D機能を無効化
  - 読み取り専用表示モードのみ

### Default Layout Management（個社レイアウトにはない機能）
* デフォルトレイアウト（is_default=true）に「デフォルト」バッジを表示
* 「デフォルトに設定」ボタンを詳細画面に配置
* デフォルト設定時: 同一種別の既存デフォルトは自動的に解除される
* 無効レイアウトはデフォルト設定不可
* デフォルトレイアウトは無効化不可（先にデフォルトを外す必要あり）

### Layout Type Change Warning（個社レイアウトと同様）
* When user tries to change layout type (PL/BS/KPI), show warning dialog:
  "種別を変更すると既存の行がすべて削除されます。続行しますか？"
* If user confirms, proceed with type change (BFF will handle line deletion)
* If user cancels, revert to original layout type

### Extended Display Styles（個社レイアウトより拡張）
* **is_bold**: 太字表示
* **is_underline**: 下線表示
* **is_double_underline**: 二重下線表示
* **bg_highlight**: 背景ハイライト表示
* 行リストとプレビューで上記スタイルを視覚的に反映

### Group Subject Selection Filtering
* For financial layouts (PL): Show only financial subjects (subject_type='FIN') with fin_stmt_class='PL'
* For financial layouts (BS): Show only financial subjects (subject_type='FIN') with fin_stmt_class='BS'
* For KPI layouts: Show only KPI subjects (subject_type='KPI')
* Show only active subjects (is_active=true)
* Display subject code, name, and class (BASE/AGGREGATE)
* **会社選択DDLは不要**（連結科目はテナント共通のため）

### Line Type Visual Distinction（個社レイアウトと同様）
* Use icons or color coding to distinguish line types:
  - header: Bold icon or primary color
  - account: Subject icon or secondary color
  - note: Note icon or muted color
  - blank: Empty/minimal styling

### Indent Level Display（個社レイアウトより拡張: 0-10）
* Apply visual indentation based on `indentLevel` (0-10)
* Use left padding: `pl-{indentLevel * 4}` (e.g., `pl-4` for level 1, `pl-8` for level 2)
* 個社レイアウトは0-5、連結レイアウトは0-10まで対応

### Preview Display（表示スタイル拡張版）
* Format lines as a report preview:
  - header: Bold, larger font (`font-bold text-lg`)
  - account: Indented with group subject name
  - note: Italic or smaller font (`italic text-sm`)
  - blank: Empty line with spacing
* Apply display styles:
  - is_bold: `font-bold`
  - is_underline: `underline`
  - is_double_underline: `underline decoration-double` or custom CSS
  - bg_highlight: `bg-accent` or highlight background
* Show alert if any account lines reference inactive group subjects

### Inactive Group Subject Alert
* When displaying layout with inactive group subjects:
  - Show alert: "無効化された連結科目が含まれています"
  - Still render the layout (but don't show values for inactive subjects)
  - Alert should be dismissible

---

## UI Unity with Individual Layout（重要: 個社レイアウトとのUI統一）

このUIは個社レイアウト（report-layout）と統一感を持たせること:

### 共通化する要素
* 画面構成: レイアウト一覧 → レイアウト詳細（1画面統合型）
* 操作フロー: 一覧選択 → 詳細表示 → 行編集 → プレビュー確認
* コンポーネント配置: 上部=基本情報、中央=行リスト、下部=プレビュー
* 行編集UI: 行種別選択、フォーム項目の出し分け、D&D操作
* テーブル構造: 同様のカラム構成（行番号、行種別、表示名、科目、インデント、スタイル）
* ダイアログデザイン: 同様のフォームレイアウト

### 連結固有の要素（個別対応）
* **会社選択DDLなし**: テナント共通のため不要
* **親会社権限制御**: canEditフラグによる編集ボタン制御
* **デフォルト設定**: バッジ表示、デフォルト設定ボタン
* **参照科目**: group_subjects（連結科目）の検索・選択
* **拡張表示スタイル**: is_underline, is_double_underline, bg_highlight
* **拡張インデント**: 0-10（個社は0-5）
* **符号表示ポリシー**: force_paren追加

---

## Handoff to Cursor

* Keep code modular and easy to migrate into:
  * apps/web/src/features/master-data/group-report-layout/
* Add brief migration notes in OUTPUT.md (what to move, what to refactor into shared/ui).
* Ensure all components are self-contained and follow the boundary rules.
