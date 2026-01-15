# v0 Prompt: Allocation Master（配賦マスタ）

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

**master-data/allocation-master**: 本社共通費・間接費等を事業部門やセグメントへ按分配賦するためのルール定義機能（Phase 1）。配賦イベント → ステップ → ターゲットの階層構造でCRUDを提供し、配賦ドライバは独立マスタまたはステップ内インラインで定義可能。

### 主要ユースケース
1. 配賦イベント（配賦処理の束）を登録・編集・削除
2. 配賦ステップ（多段階配賦の各段）を定義・順序変更
3. 配賦先（ターゲット）を部門またはディメンション値から選択
4. 配賦ドライバ（按分基準）を独立マスタとして管理
5. 既存イベントをコピーして新規イベントを作成

---

## Screens to build

### Screen 1: 配賦イベント一覧画面
- **Purpose**: 当該会社の配賦イベント一覧を表示し、検索・フィルタ・ページネーション
- **Layout**: 検索パネル + テーブル + ページネーション
- **Main Interactions**:
  - キーワード検索（イベントコード・名前）
  - シナリオタイプフィルタ（ACTUAL/BUDGET/FORECAST）
  - 有効/無効フィルタ
  - ソート（コード、名前、シナリオタイプ、更新日時）
  - 行クリックでイベント詳細画面へ遷移
  - 新規作成ボタンでイベント作成ダイアログを開く
  - 行アクション: コピー、削除

### Screen 2: 配賦イベント詳細画面（階層的一画面構成）
- **Purpose**: イベント基本情報の表示・編集 + 配下ステップ一覧の埋め込み表示
- **Layout**: 上部にイベント基本情報カード、下部にステップ一覧テーブル
- **Main Interactions**:
  - イベント基本情報の編集（コード、名前、シナリオタイプ、有効フラグ、備考）
  - 保存ボタンで更新
  - ステップ一覧テーブル（step_no順）
  - ステップ追加ボタンでステップ作成ダイアログを開く
  - ステップ行クリックでステップ詳細ダイアログを開く
  - ステップ順序変更（ドラッグ＆ドロップ / 上下ボタン）
  - ステップ削除（ターゲット存在時はエラー）

### Screen 3: イベント作成ダイアログ
- **Purpose**: 新しい配賦イベントを登録
- **Trigger**: 一覧画面の「新規作成」ボタン
- **Form Fields**:
  - イベントコード* (required, 1-50文字)
  - イベント名* (required, 1-200文字)
  - シナリオタイプ* (required, Select: ACTUAL/BUDGET/FORECAST)
  - 有効フラグ (Checkbox, default: true)
  - 備考 (Textarea, optional)
- **Actions**: 保存 / キャンセル

### Screen 4: ステップ作成/編集ダイアログ
- **Purpose**: 配賦ステップを作成・編集
- **Trigger**: イベント詳細画面の「ステップ追加」ボタン or ステップ行クリック
- **Form Fields**:
  - ステップ名* (required, 1-200文字)
  - 配賦元科目* (required, Select with search - 科目マスタから選択)
  - 配賦元部門* (required, Select with search - 部門マスタから stable_id で選択)
  - 配賦基準種別* (required, Select: FIXED/HEADCOUNT/SUBJECT_AMOUNT/MEASURE/KPI)
  - 配賦基準参照元* (required, Select: MASTER/FACT/KPI)
  - ドライバ参照 (optional, Select - 登録済みドライバから選択、または空でインライン設定)
  - 備考 (Textarea, optional)
- **Dynamic Fields** (配賦基準種別に応じて表示):
  - SUBJECT_AMOUNT選択時: 参照科目* (required, Select)
  - MEASURE選択時: measure_key* (required, Input: AREA/HOURS/UNITS/TRANSACTIONS等)
  - KPI選択時: KPI科目* (required, Select)
- **Sub-section**: 配賦先（ターゲット）一覧
  - ターゲット追加ボタン
  - ターゲットテーブル（タイプ、名前、配賦先科目、固定比率、アクション）
  - ターゲット削除
- **Actions**: 保存 / キャンセル

### Screen 5: ターゲット追加ダイアログ
- **Purpose**: 配賦先を追加
- **Trigger**: ステップダイアログ内の「配賦先追加」ボタン
- **Form Fields**:
  - 配賦先タイプ* (required, Select: DEPARTMENT/DIMENSION_VALUE)
  - 配賦先* (required, Select with search)
    - DEPARTMENT: 部門マスタから選択（stable_id で参照）
    - DIMENSION_VALUE: ディメンション→値の階層選択
  - 配賦先科目 (optional, Select - 空の場合は配賦元科目と同じ)
  - 固定比率 (optional, Number: 0-1, 4桁小数 - FIXED時のみ有効)
  - 表示順 (optional, Number)
  - 有効フラグ (Checkbox, default: true)
- **Actions**: 追加 / キャンセル

### Screen 6: イベントコピーダイアログ
- **Purpose**: 既存イベントをコピーして新規作成
- **Trigger**: 一覧画面の行アクション「コピー」
- **Form Fields**:
  - 新しいイベントコード* (required, 1-50文字)
  - 新しいイベント名* (required, 1-200文字)
- **Actions**: コピー実行 / キャンセル

### Screen 7: 配賦ドライバ一覧画面
- **Purpose**: 配賦ドライバ（按分基準）の独立マスタ管理
- **Layout**: 検索パネル + テーブル + ページネーション
- **Main Interactions**:
  - キーワード検索（ドライバコード・名前）
  - ドライバタイプフィルタ（FIXED/HEADCOUNT/SUBJECT_AMOUNT/MEASURE/KPI）
  - ソート（コード、名前、タイプ、更新日時）
  - 行クリックでドライバ詳細ダイアログを開く
  - 新規作成ボタンでドライバ作成ダイアログを開く
  - 行アクション: 削除（参照ステップ存在時はエラー）

### Screen 8: ドライバ作成/編集ダイアログ
- **Purpose**: 配賦ドライバを作成・編集
- **Trigger**: ドライバ一覧画面の「新規作成」ボタン or ドライバ行クリック
- **Form Fields**:
  - ドライバコード* (required, 1-50文字)
  - ドライバ名* (required, 1-200文字)
  - ドライバタイプ* (required, Select: FIXED/HEADCOUNT/SUBJECT_AMOUNT/MEASURE/KPI)
  - 参照元種別* (required, Select: MASTER/FACT/KPI)
  - 参照科目 (SUBJECT_AMOUNT時必須, Select)
  - measure_key (MEASURE時必須, Input)
  - KPI科目 (KPI時必須, Select)
  - 期間ルール (optional, Input)
  - 備考 (Textarea, optional)
- **Actions**: 保存 / キャンセル

---

## BFF Specification (from design.md)

### Endpoints (UI -> BFF) - Events

| Method | Endpoint | Purpose | Request DTO | Response DTO |
|--------|----------|---------|-------------|--------------|
| GET | /api/bff/master-data/allocation-events | イベント一覧取得 | BffAllocationEventListRequest | BffAllocationEventListResponse |
| POST | /api/bff/master-data/allocation-events | イベント作成 | BffCreateAllocationEventRequest | BffAllocationEventResponse |
| GET | /api/bff/master-data/allocation-events/:id | イベント詳細取得 | - | BffAllocationEventDetailResponse |
| PATCH | /api/bff/master-data/allocation-events/:id | イベント更新 | BffUpdateAllocationEventRequest | BffAllocationEventResponse |
| DELETE | /api/bff/master-data/allocation-events/:id | イベント削除 | - | - |
| POST | /api/bff/master-data/allocation-events/:id/copy | イベントコピー | BffCopyAllocationEventRequest | BffAllocationEventResponse |

### Endpoints (UI -> BFF) - Steps

| Method | Endpoint | Purpose | Request DTO | Response DTO |
|--------|----------|---------|-------------|--------------|
| POST | /api/bff/master-data/allocation-events/:eventId/steps | ステップ作成 | BffCreateAllocationStepRequest | BffAllocationStepResponse |
| PATCH | /api/bff/master-data/allocation-events/:eventId/steps/:id | ステップ更新 | BffUpdateAllocationStepRequest | BffAllocationStepResponse |
| DELETE | /api/bff/master-data/allocation-events/:eventId/steps/:id | ステップ削除 | - | - |
| PATCH | /api/bff/master-data/allocation-events/:eventId/steps/reorder | ステップ順序変更 | BffReorderStepsRequest | BffAllocationStepResponse[] |

### Endpoints (UI -> BFF) - Targets

| Method | Endpoint | Purpose | Request DTO | Response DTO |
|--------|----------|---------|-------------|--------------|
| POST | /api/bff/master-data/allocation-events/:eventId/steps/:stepId/targets | ターゲット作成 | BffCreateAllocationTargetRequest | BffAllocationTargetResponse |
| PATCH | /api/bff/master-data/allocation-events/:eventId/steps/:stepId/targets/:id | ターゲット更新 | BffUpdateAllocationTargetRequest | BffAllocationTargetResponse |
| DELETE | /api/bff/master-data/allocation-events/:eventId/steps/:stepId/targets/:id | ターゲット削除 | - | - |

### Endpoints (UI -> BFF) - Drivers

| Method | Endpoint | Purpose | Request DTO | Response DTO |
|--------|----------|---------|-------------|--------------|
| GET | /api/bff/master-data/allocation-drivers | ドライバ一覧取得 | BffAllocationDriverListRequest | BffAllocationDriverListResponse |
| POST | /api/bff/master-data/allocation-drivers | ドライバ作成 | BffCreateAllocationDriverRequest | BffAllocationDriverResponse |
| GET | /api/bff/master-data/allocation-drivers/:id | ドライバ詳細取得 | - | BffAllocationDriverResponse |
| PATCH | /api/bff/master-data/allocation-drivers/:id | ドライバ更新 | BffUpdateAllocationDriverRequest | BffAllocationDriverResponse |
| DELETE | /api/bff/master-data/allocation-drivers/:id | ドライバ削除 | - | - |

### DTOs to use (contracts/bff)

**Enums:**

```typescript
export const ScenarioType = {
  ACTUAL: 'ACTUAL',
  BUDGET: 'BUDGET',
  FORECAST: 'FORECAST',
} as const;
export type ScenarioType = (typeof ScenarioType)[keyof typeof ScenarioType];

export const DriverType = {
  FIXED: 'FIXED',
  HEADCOUNT: 'HEADCOUNT',
  SUBJECT_AMOUNT: 'SUBJECT_AMOUNT',
  MEASURE: 'MEASURE',
  KPI: 'KPI',
} as const;
export type DriverType = (typeof DriverType)[keyof typeof DriverType];

export const DriverSourceType = {
  MASTER: 'MASTER',
  FACT: 'FACT',
  KPI: 'KPI',
} as const;
export type DriverSourceType = (typeof DriverSourceType)[keyof typeof DriverSourceType];

export const TargetType = {
  DEPARTMENT: 'DEPARTMENT',
  DIMENSION_VALUE: 'DIMENSION_VALUE',
} as const;
export type TargetType = (typeof TargetType)[keyof typeof TargetType];
```

**Event DTOs:**

```typescript
export interface BffAllocationEventListRequest {
  keyword?: string;
  scenarioType?: ScenarioType;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: 'eventCode' | 'eventName' | 'scenarioType' | 'isActive' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface BffCreateAllocationEventRequest {
  companyId: string;
  eventCode: string;
  eventName: string;
  scenarioType: ScenarioType;
  isActive?: boolean;
  notes?: string;
}

export interface BffUpdateAllocationEventRequest {
  eventCode?: string;
  eventName?: string;
  scenarioType?: ScenarioType;
  isActive?: boolean;
  notes?: string;
}

export interface BffCopyAllocationEventRequest {
  newEventCode: string;
  newEventName: string;
}

export interface BffAllocationEventResponse {
  id: string;
  companyId: string;
  eventCode: string;
  eventName: string;
  scenarioType: ScenarioType;
  isActive: boolean;
  version: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BffAllocationEventDetailResponse extends BffAllocationEventResponse {
  steps: BffAllocationStepResponse[];
}

export interface BffAllocationEventListResponse {
  items: BffAllocationEventResponse[];
  total: number;
  page: number;
  pageSize: number;
}
```

**Step DTOs:**

```typescript
export interface BffCreateAllocationStepRequest {
  stepName: string;
  fromSubjectId: string;
  fromDepartmentStableId: string;  // 必須
  driverType: DriverType;
  driverSourceType: DriverSourceType;
  driverRefId?: string;
  notes?: string;
}

export interface BffUpdateAllocationStepRequest {
  stepName?: string;
  fromSubjectId?: string;
  fromDepartmentStableId?: string;
  driverType?: DriverType;
  driverSourceType?: DriverSourceType;
  driverRefId?: string;
  notes?: string;
}

export interface BffReorderStepsRequest {
  eventVersion: number;  // 楽観的ロック用
  stepOrders: { id: string; stepNo: number }[];
}

export interface BffAllocationStepResponse {
  id: string;
  stepNo: number;
  stepName: string;
  fromSubjectId: string;
  fromSubjectName: string;
  fromDepartmentStableId: string;
  fromDepartmentName: string;
  driverType: DriverType;
  driverSourceType: DriverSourceType;
  driverRefId: string | null;
  driverName: string | null;
  notes: string | null;
  targets: BffAllocationTargetResponse[];
  createdAt: string;
  updatedAt: string;
}
```

**Target DTOs:**

```typescript
export interface BffCreateAllocationTargetRequest {
  targetType: TargetType;
  targetId: string;  // DEPARTMENT: stable_id, DIMENSION_VALUE: dimension_values.id
  toSubjectId?: string;  // 配賦先科目（NULL=配賦元科目と同じ）
  fixedRatio?: string;  // Decimal型（"0.25" 等）
  sortOrder?: number;
  isActive?: boolean;
}

export interface BffUpdateAllocationTargetRequest {
  targetType?: TargetType;
  targetId?: string;
  toSubjectId?: string | null;
  fixedRatio?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export interface BffAllocationTargetResponse {
  id: string;
  targetType: TargetType;
  targetId: string;
  targetName: string;
  toSubjectId: string | null;
  toSubjectName: string | null;
  fixedRatio: string | null;
  sortOrder: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

**Driver DTOs:**

```typescript
export interface BffAllocationDriverListRequest {
  keyword?: string;
  driverType?: DriverType;
  page?: number;
  pageSize?: number;
  sortBy?: 'driverCode' | 'driverName' | 'driverType' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface BffCreateAllocationDriverRequest {
  companyId: string;
  driverCode: string;
  driverName: string;
  driverType: DriverType;
  sourceType: DriverSourceType;
  driverSubjectId?: string;
  measureKey?: string;
  kpiSubjectId?: string;
  periodRule?: string;
  notes?: string;
}

export interface BffUpdateAllocationDriverRequest {
  driverCode?: string;
  driverName?: string;
  driverType?: DriverType;
  sourceType?: DriverSourceType;
  driverSubjectId?: string;
  measureKey?: string;
  kpiSubjectId?: string;
  periodRule?: string;
  notes?: string;
}

export interface BffAllocationDriverResponse {
  id: string;
  companyId: string;
  driverCode: string;
  driverName: string;
  driverType: DriverType;
  sourceType: DriverSourceType;
  driverSubjectId: string | null;
  driverSubjectName: string | null;
  measureKey: string | null;
  kpiSubjectId: string | null;
  kpiSubjectName: string | null;
  periodRule: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BffAllocationDriverListResponse {
  items: BffAllocationDriverResponse[];
  total: number;
  page: number;
  pageSize: number;
}
```

**Errors:**

```typescript
export const AllocationMasterErrorCode = {
  // Event errors
  EVENT_NOT_FOUND: 'EVENT_NOT_FOUND',
  EVENT_CODE_DUPLICATE: 'EVENT_CODE_DUPLICATE',
  EVENT_HAS_STEPS: 'EVENT_HAS_STEPS',
  EVENT_VERSION_CONFLICT: 'EVENT_VERSION_CONFLICT',
  // Step errors
  STEP_NOT_FOUND: 'STEP_NOT_FOUND',
  STEP_HAS_TARGETS: 'STEP_HAS_TARGETS',
  // Target errors
  TARGET_NOT_FOUND: 'TARGET_NOT_FOUND',
  TARGET_DUPLICATE: 'TARGET_DUPLICATE',
  TARGET_REF_NOT_FOUND: 'TARGET_REF_NOT_FOUND',
  // Driver errors
  DRIVER_NOT_FOUND: 'DRIVER_NOT_FOUND',
  DRIVER_CODE_DUPLICATE: 'DRIVER_CODE_DUPLICATE',
  DRIVER_IN_USE: 'DRIVER_IN_USE',
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_DRIVER_CONFIG: 'INVALID_DRIVER_CONFIG',
  INVALID_FIXED_RATIO: 'INVALID_FIXED_RATIO',
} as const;
```

### DTO import example (MANDATORY)

```ts
import type {
  BffAllocationEventListRequest,
  BffAllocationEventListResponse,
  BffAllocationEventResponse,
  BffAllocationEventDetailResponse,
  BffCreateAllocationEventRequest,
  BffUpdateAllocationEventRequest,
  BffCopyAllocationEventRequest,
  BffAllocationStepResponse,
  BffCreateAllocationStepRequest,
  BffUpdateAllocationStepRequest,
  BffReorderStepsRequest,
  BffAllocationTargetResponse,
  BffCreateAllocationTargetRequest,
  BffUpdateAllocationTargetRequest,
  BffAllocationDriverListRequest,
  BffAllocationDriverListResponse,
  BffAllocationDriverResponse,
  BffCreateAllocationDriverRequest,
  BffUpdateAllocationDriverRequest,
  ScenarioType,
  DriverType,
  DriverSourceType,
  TargetType,
  AllocationMasterErrorCode,
} from "packages/contracts/src/bff/allocation-master";
```

### Error UI behavior

* Show validation errors inline per field
* Show API/business errors in a top alert panel
* Map error codes to user-friendly messages:
  - EVENT_NOT_FOUND → 「配賦イベントが見つかりません」
  - EVENT_CODE_DUPLICATE → 「イベントコードが重複しています」
  - EVENT_HAS_STEPS → 「配下にステップが存在するため削除できません」
  - EVENT_VERSION_CONFLICT → 「他のユーザーが変更しました。最新データを取得してください」
  - STEP_NOT_FOUND → 「ステップが見つかりません」
  - STEP_HAS_TARGETS → 「配下にターゲットが存在するため削除できません」
  - TARGET_NOT_FOUND → 「配賦先が見つかりません」
  - TARGET_DUPLICATE → 「同じ配賦先が既に登録されています」
  - TARGET_REF_NOT_FOUND → 「配賦先の参照先が見つかりません」
  - DRIVER_NOT_FOUND → 「ドライバが見つかりません」
  - DRIVER_CODE_DUPLICATE → 「ドライバコードが重複しています」
  - DRIVER_IN_USE → 「このドライバは使用中のため削除できません」
  - VALIDATION_ERROR → フィールド別にインラインエラー表示
  - INVALID_DRIVER_CONFIG → 「ドライバ設定が不正です」
  - INVALID_FIXED_RATIO → 「固定比率は0〜1の範囲で入力してください」

---

## UI Output Requirements

Generate Next.js (App Router) + TypeScript + Tailwind UI.
Include:

1. Routes/pages for the screens (**page.tsx only; see "No layout.tsx" rule below**)
2. A typed `BffClient` interface (methods correspond to endpoints above)
3. `MockBffClient` returning sample DTO-shaped data
4. `HttpBffClient` with fetch wrappers (but keep it unused initially, easy to switch)
5. Data models in UI must be the DTO types from contracts/bff
6. Minimal but production-like UI (tables, forms, dialogs)

---

## Mock Data Requirements

Provide mock data sets that:

* cover empty state, typical state, and error state
* use realistic values for EPM domain:
  - シナリオタイプ: ACTUAL（実績）, BUDGET（予算）, FORECAST（見込）
  - ドライバタイプ: FIXED（固定比率）, HEADCOUNT（人員比）, SUBJECT_AMOUNT（科目金額比）, MEASURE（物量比）, KPI（KPI比）
  - イベントコード例: ALLOC-001, ALLOC-002, ALLOC-003
  - イベント名例: 本社経費配賦（実績）, 間接費配賦（予算）, IT費用配賦
  - ステップ例:
    - Step 1: 本社経費 → 各事業部（人員比）
    - Step 2: 事業部経費 → 各部門（固定比率）
  - ドライバ例:
    - DRV-001: 人員比ドライバ（HEADCOUNT, MASTER）
    - DRV-002: 売上高比ドライバ（SUBJECT_AMOUNT, FACT, 売上高科目）
    - DRV-003: 面積比ドライバ（MEASURE, MASTER, AREA）
* strictly match the BFF response DTO shape

### Sample Mock Data

```typescript
const mockEvents: BffAllocationEventResponse[] = [
  {
    id: "evt-001",
    companyId: "company-001",
    eventCode: "ALLOC-001",
    eventName: "本社経費配賦（実績）",
    scenarioType: "ACTUAL",
    isActive: true,
    version: 1,
    notes: "月次配賦処理用",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-06T10:00:00Z",
  },
  {
    id: "evt-002",
    companyId: "company-001",
    eventCode: "ALLOC-002",
    eventName: "間接費配賦（予算）",
    scenarioType: "BUDGET",
    isActive: true,
    version: 1,
    notes: null,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-05T15:00:00Z",
  },
];

const mockSteps: BffAllocationStepResponse[] = [
  {
    id: "step-001",
    stepNo: 1,
    stepName: "本社経費 → 各事業部",
    fromSubjectId: "sub-001",
    fromSubjectName: "本社共通費",
    fromDepartmentStableId: "S-HQ-001",
    fromDepartmentName: "本社管理部門",
    driverType: "HEADCOUNT",
    driverSourceType: "MASTER",
    driverRefId: "drv-001",
    driverName: "人員比ドライバ",
    notes: null,
    targets: [
      {
        id: "tgt-001",
        targetType: "DEPARTMENT",
        targetId: "S-BU-001",
        targetName: "事業部A",
        toSubjectId: null,
        toSubjectName: null,
        fixedRatio: null,
        sortOrder: 1,
        isActive: true,
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
      },
      {
        id: "tgt-002",
        targetType: "DEPARTMENT",
        targetId: "S-BU-002",
        targetName: "事業部B",
        toSubjectId: null,
        toSubjectName: null,
        fixedRatio: null,
        sortOrder: 2,
        isActive: true,
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
      },
    ],
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "step-002",
    stepNo: 2,
    stepName: "事業部経費 → 各部門",
    fromSubjectId: "sub-002",
    fromSubjectName: "事業部経費",
    fromDepartmentStableId: "S-BU-001",
    fromDepartmentName: "事業部A",
    driverType: "FIXED",
    driverSourceType: "MASTER",
    driverRefId: null,
    driverName: null,
    notes: "固定比率で配賦",
    targets: [
      {
        id: "tgt-003",
        targetType: "DEPARTMENT",
        targetId: "S-DEPT-001",
        targetName: "営業部",
        toSubjectId: "sub-003",
        toSubjectName: "配賦経費",
        fixedRatio: "0.6000",
        sortOrder: 1,
        isActive: true,
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
      },
      {
        id: "tgt-004",
        targetType: "DEPARTMENT",
        targetId: "S-DEPT-002",
        targetName: "開発部",
        toSubjectId: "sub-003",
        toSubjectName: "配賦経費",
        fixedRatio: "0.4000",
        sortOrder: 2,
        isActive: true,
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
      },
    ],
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
];

const mockDrivers: BffAllocationDriverResponse[] = [
  {
    id: "drv-001",
    companyId: "company-001",
    driverCode: "DRV-001",
    driverName: "人員比ドライバ",
    driverType: "HEADCOUNT",
    sourceType: "MASTER",
    driverSubjectId: null,
    driverSubjectName: null,
    measureKey: null,
    kpiSubjectId: null,
    kpiSubjectName: null,
    periodRule: null,
    notes: "組織マスタの社員数を使用",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "drv-002",
    companyId: "company-001",
    driverCode: "DRV-002",
    driverName: "売上高比ドライバ",
    driverType: "SUBJECT_AMOUNT",
    sourceType: "FACT",
    driverSubjectId: "sub-sales",
    driverSubjectName: "売上高",
    measureKey: null,
    kpiSubjectId: null,
    kpiSubjectName: null,
    periodRule: "CURRENT_MONTH",
    notes: "当月売上高を基準に配賦",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
];
```

---

## Authentication / Tenant

* UI only attaches auth token to BFF requests.
* UI must not handle tenant_id directly.

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

## v0 二重出力（プレビュー用 + 移植用）（MANDATORY）

v0 は以下の **2箇所に同じ内容を出力** すること：

### 1. プレビュー用（v0 内で動作確認）

v0 プロジェクトの `app/` に配置（プレビュー・調整用）:

```
app/master-data/allocation-master/
├── page.tsx
└── components/
    ├── AllocationEventList.tsx
    ├── AllocationEventDetail.tsx
    ├── AllocationEventDialog.tsx
    ├── AllocationStepDialog.tsx
    ├── AllocationTargetDialog.tsx
    ├── AllocationDriverList.tsx
    ├── AllocationDriverDialog.tsx
    ├── CopyEventDialog.tsx
    └── api/
        ├── BffClient.ts
        ├── MockBffClient.ts
        └── HttpBffClient.ts
```

### 2. 移植用モジュール（DL して本番環境へ移植）

v0 プロジェクトの `_v0_drop/` に配置（移植用、プレビュー用と完全同期）:

```
_v0_drop/master-data/allocation-master/src/
├── app/
│   └── page.tsx
├── components/
│   ├── AllocationEventList.tsx
│   ├── AllocationEventDetail.tsx
│   ├── AllocationEventDialog.tsx
│   ├── AllocationStepDialog.tsx
│   ├── AllocationTargetDialog.tsx
│   ├── AllocationDriverList.tsx
│   ├── AllocationDriverDialog.tsx
│   ├── CopyEventDialog.tsx
│   └── index.ts              # barrel export
├── api/
│   ├── BffClient.ts          # interface
│   ├── MockBffClient.ts      # mock implementation
│   ├── HttpBffClient.ts      # HTTP implementation
│   └── index.ts              # barrel export + factory
├── lib/
│   └── error-messages.ts     # エラーコード → UIメッセージ
├── types/
│   └── index.ts              # 型定義（contracts からの re-export）
└── OUTPUT.md                 # 移植手順・チェックリスト
```

### 同期ルール（MUST）

1. プレビュー用（`app/`）と移植用（`_v0_drop/`）のコンポーネント実装は **完全に同一**
2. 移植用には以下を追加：
   - `index.ts`（barrel export）
   - `lib/error-messages.ts`（エラーマッピング）
   - `OUTPUT.md`（移植手順）
3. コンポーネントを変更したら、**両方を同時に更新**すること
4. 移植用のインポートパスは本番環境を想定（`@/shared/ui`, `@epm/contracts/bff/allocation-master`）

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
  * `apps/web/_v0_drop/master-data/allocation-master/src/api/HttpBffClient.ts`

### App Router / Shell

* Do NOT generate `layout.tsx` anywhere under the v0 output.
* Do NOT create a new sidebar/header/shell layout inside the feature.
* All screens MUST render inside the existing AppShell.

### Output Location（二重出力）

* プレビュー用: `app/master-data/allocation-master/` に配置
* 移植用: `_v0_drop/master-data/allocation-master/src/` に配置（同一内容）
* Do NOT write to `apps/web/src` directly.

---

## REQUIRED OUTPUT ARTIFACT (MANDATORY)

You MUST create an `OUTPUT.md` file under:

* `_v0_drop/master-data/allocation-master/src/OUTPUT.md`

`OUTPUT.md` MUST include the following sections:

### 1) Generated files (tree)

* Provide a complete tree of everything you generated:
  * プレビュー用（`app/master-data/allocation-master/`）
  * 移植用（`_v0_drop/master-data/allocation-master/src/`）

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
  * コピー先: `apps/web/src/features/master-data/allocation-master/ui/`
  * what paths/imports will change
  * what should be refactored into shared/ui (if any)
  * page.tsx 接続方法

### 5) Constraint compliance checklist

* Check all items explicitly:
  * [ ] プレビュー用（`app/`）と移植用（`_v0_drop/`）が同期している
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
  * apps/web/src/features/master-data/allocation-master/
* Add brief migration notes in OUTPUT.md (what to move, what to refactor into shared/ui).

---

## UI Design Notes (EPM Domain Specific)

### イベント一覧画面
- 検索パネル: キーワード入力 + シナリオタイプ Select + 有効フラグ Select
- テーブル列: コード、名前、シナリオタイプ（Badge）、有効/無効（Badge）、更新日時、アクション
- シナリオタイプ Badge:
  - ACTUAL: primary（Deep Teal）
  - BUDGET: secondary（Royal Indigo）
  - FORECAST: outline
- 有効状態 Badge:
  - 有効: default（緑系）
  - 無効: destructive

### イベント詳細画面
- 上部: Card でイベント基本情報表示/編集
- 下部: ステップ一覧 Table
  - 列: No, ステップ名, 配賦元科目, 配賦元部門, 配賦基準, ターゲット数, アクション
  - ドラッグハンドル（順序変更用）
  - ドライバタイプ Badge で表示

### ステップダイアログ
- 2カラムグリッドでフォーム配置
- 配賦基準種別選択時に動的フィールド表示
- 下部にターゲット一覧 Table を埋め込み
- ターゲット追加ボタン

### ターゲット追加ダイアログ
- 配賦先タイプ Select で切り替え
- DEPARTMENT: 部門検索 Select（インクリメンタルサーチ）
- DIMENSION_VALUE: ディメンション Select → 値 Select（2段階選択）
- 固定比率: Number Input（FIXED時のみ enabled）

### 固定比率合計チェック
- FIXED 配賦時、全ターゲットの固定比率合計を計算
- 合計が1.0でない場合: Alert（warning）で警告表示
- 保存は許可（警告のみ）

### ドライバ一覧画面
- 検索パネル: キーワード入力 + ドライバタイプ Select
- テーブル列: コード、名前、タイプ（Badge）、参照元、更新日時、アクション

### 色とバッジ
- ドライバタイプ Badge:
  - FIXED: outline
  - HEADCOUNT: default
  - SUBJECT_AMOUNT: primary
  - MEASURE: secondary
  - KPI: destructive
- ターゲットタイプ Badge:
  - DEPARTMENT: default
  - DIMENSION_VALUE: secondary
