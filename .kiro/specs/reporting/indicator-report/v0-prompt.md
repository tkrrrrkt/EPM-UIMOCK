# v0 Prompt - 財務指標分析レポート

---

## 1. Design System

```
Use the EPM Design System from: https://epm-registry-6xtkaywr0-tkoizumi-hira-tjps-projects.vercel.app

Theme: Deep Teal & Royal Indigo
- Primary: oklch(0.52 0.13 195) - Deep Teal
- Secondary: oklch(0.48 0.15 280) - Royal Indigo
```

---

## 2. Context

```markdown
You are generating UI for an EPM (Enterprise Performance Management) SaaS.

**Boundary Rules (MUST FOLLOW):**
- UI → BFF only（Domain API 直接呼び出し禁止）
- Use `packages/contracts/src/bff` DTOs only（api 参照禁止）
- Components from `@/shared/ui` only（base UI を feature 内に作成禁止）
- No layout.tsx（AppShell 内で描画）
- No raw colors（semantic tokens のみ: bg-primary, text-foreground, etc.）
- Start with MockBffClient → later switch to HttpBffClient
- UI does not compute business rules/aggregations; display BFF-calculated values only
```

---

## 3. Feature

```markdown
**reporting/indicator-report**: 財務指標分析レポート

管理者が定義したレイアウトに従い、財務科目・非財務KPI・指標を混在表示する定型レポート。
Primary（主軸）とCompare（比較軸）を選択し、差分を計算して表示する。

### 主要ユースケース
1. 年度・Primary/Compare・期間・部門を選択してレポートを表示
2. 予算/見込/実績を切り替えて比較分析
3. 部門ツリーから対象部門を選択（単独/配下集約）
4. 月次/四半期/半期/年度の粒度でデータを集計表示
5. レイアウト未設定時はブロック画面を表示
6. 必須項目未選択時はブロック画面を表示
7. 実績は過去年度のみ選択可能
```

---

## 4. Screens

### Screen 1: IndicatorReportPage（メイン画面）

**Purpose**: 財務指標分析レポートを表示し、フィルタで条件を変更してデータを閲覧する

**Layout**:
```
┌──────────────────────────────────────────────────────────────────────────┐
│ [FilterHeader]                                                           │
│ 年度: [▼]  Primary: [▼]  イベント: [▼]  バージョン: [▼]                   │
│ Compare: [なし/▼]  イベント: [▼]  バージョン: [▼]                         │
├──────────────────────────────────────────────────────────────────────────┤
│ [PeriodGranularitySelector]                                              │
│ 期間: [▼開始] 〜 [▼終了]   表示粒度: [月次/四半期/半期/年度 ▼]            │
├─────────────────────────┬────────────────────────────────────────────────┤
│ [DepartmentTreePanel]   │ [ReportHeader]                                 │
│                         │ レポート名 / ヘッダテキスト                     │
│ ▼ 全社                   │ [ReportTable]                                  │
│   ▼ 事業部A             │ 行名              | Primary | Compare | 差分 | 率 │
│     □ 営業部            │ ─────────────────────────────────────────────  │
│     □ 開発部            │ [売上高]            1,000    900    +100  11% │
│   ▼ 事業部B             │   [国内売上]          600    500    +100  20% │
│     □ 製造部            │   [海外売上]          400    400       0   0% │
│                         │ ───────────────── 区切り線 ─────────────────── │
│ ☑ 配下を含む           │ [営業利益]            200    180     +20  11% │
│                         │ [営業利益率]         20.0%  18.0%   +2.0pt  - │
│                         │                                                │
└─────────────────────────┴────────────────────────────────────────────────┘
```

**Components**:
- **FilterHeader**: 年度、Primary/Compare、イベント/バージョン選択
- **PeriodGranularitySelector**: 期間レンジ、表示粒度選択
- **DepartmentTreePanel**: 部門ツリー、単独/配下集約切替
- **ReportHeader**: レポート名/ヘッダテキスト表示
- **ReportTable**: レポート本体（行種別に応じた表示）

**Interactions**:
- 年度選択 → イベント/バージョンの選択肢を更新
- Primary/Compareシナリオ選択 → イベント/バージョン表示切替
  - BUDGET: イベント + バージョン両方表示
  - FORECAST: イベントのみ表示（バージョン非表示、最新FIXEDを内部採用）
  - ACTUAL: イベント/バージョン両方非表示（過去年度のみ選択可）
- Compare "なし" 選択 → Compare列/差分列を非表示（Primaryのみ表示）
- レイアウト情報取得 → layoutName/headerText をテーブル上部に表示（headerTextがnullの場合は非表示）
- 部門選択 + 配下集約チェック → データ再取得
- 粒度変更 → 期間レンジ自動スナップ（四半期/半期/年度は固定境界）
- 必須項目（年度/Primary/期間/粒度/部門）が揃うまでレポート領域を非表示にし、ブロックメッセージを表示（フィルタ/部門ツリーは操作可）
- 期間レンジは年度内のみ選択可（年度外は非活性）
- ACTUAL選択時は過去年度のみを候補表示（最新年度は除外。除外できない場合はACTUAL選択を無効化）
- FORECASTでFIXEDが存在しないイベントは選択不可（DDLを空/disabled）

### Screen 2: LayoutNotConfiguredBlock（ブロック画面）

**Purpose**: レイアウト未設定時のブロック表示

**Trigger**: companies.indicator_report_layout_id が未設定の場合

**Layout**:
```
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│                    ⚠️ レイアウトが設定されていません                       │
│                                                                          │
│    財務指標分析レポートを表示するには、管理者がレイアウトを設定する            │
│    必要があります。システム管理者にお問い合わせください。                   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

### Screen 3: RequiredFieldsBlock（レポート領域ブロック）

**Purpose**: 必須項目未選択時にレポート領域のみブロック表示

**Trigger**: 年度/Primary/期間/粒度/部門のいずれか未選択

**Placement**: 右側のレポート領域。FilterHeader/PeriodGranularitySelector/DepartmentTreePanel は操作可能。

**Layout**:
```
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│                 ℹ️ 必須項目を選択してください                             │
│                                                                          │
│   年度 / Primary / 期間 / 粒度 / 部門 が揃うまでレポートは表示されません  │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 5. BFF Contract

### Endpoints

| Method | Endpoint | Purpose | Request DTO | Response DTO |
|--------|----------|---------|-------------|--------------|
| GET | /api/bff/indicator-report/layout | レイアウト情報取得 | - (Header: x-tenant-id) | BffIndicatorReportLayoutResponse |
| GET | /api/bff/indicator-report/selector-options | 選択肢取得 | BffSelectorOptionsRequest | BffSelectorOptionsResponse |
| GET | /api/bff/indicator-report/data | レポートデータ取得 | BffIndicatorReportDataRequest | BffIndicatorReportDataResponse |

### Enums

```typescript
// packages/contracts/src/bff/indicator-report/enums.ts

export const ScenarioType = {
  BUDGET: "BUDGET",
  FORECAST: "FORECAST",
  ACTUAL: "ACTUAL",
} as const;
export type ScenarioType = (typeof ScenarioType)[keyof typeof ScenarioType];

export const DisplayGranularity = {
  MONTHLY: "MONTHLY",
  QUARTERLY: "QUARTERLY",
  HALF_YEARLY: "HALF_YEARLY",
  YEARLY: "YEARLY",
} as const;
export type DisplayGranularity = (typeof DisplayGranularity)[keyof typeof DisplayGranularity];

export const LayoutLineType = {
  HEADER: "header",
  ITEM: "item",
  DIVIDER: "divider",
  NOTE: "note",
  BLANK: "blank",
} as const;
export type LayoutLineType = (typeof LayoutLineType)[keyof typeof LayoutLineType];

export const ItemRefType = {
  FINANCIAL: "FINANCIAL",
  NON_FINANCIAL: "NON_FINANCIAL",
  METRIC: "METRIC",
} as const;
export type ItemRefType = (typeof ItemRefType)[keyof typeof ItemRefType];
```

### Request DTOs

```typescript
// packages/contracts/src/bff/indicator-report/index.ts

export interface BffSelectorOptionsRequest {
  fiscalYear?: number;
  scenarioType?: ScenarioType;
  planEventId?: string;
}

export interface BffIndicatorReportDataRequest {
  fiscalYear: number;
  primaryScenarioType: ScenarioType;
  primaryPlanEventId?: string;
  primaryPlanVersionId?: string;
  compareScenarioType?: ScenarioType;
  comparePlanEventId?: string;
  comparePlanVersionId?: string;
  startPeriodCode: string;
  endPeriodCode: string;
  displayGranularity: DisplayGranularity;
  departmentStableId: string;
  includeChildren: boolean;
}
```

### Response DTOs

```typescript
// レイアウト情報
export interface BffIndicatorReportLayoutResponse {
  layoutId: string;
  layoutCode: string;
  layoutName: string;
  headerText: string | null;
  lines: BffLayoutLine[];
}

export interface BffLayoutLine {
  lineId: string;
  lineNo: number;
  lineType: LayoutLineType;
  displayName: string | null;
  itemRefType: ItemRefType | null;
  indentLevel: number;
  isBold: boolean;
}

// 選択肢
export interface BffSelectorOptionsResponse {
  fiscalYears: number[];
  planEvents: BffPlanEventOption[];
  planVersions: BffPlanVersionOption[];
  departments: BffDepartmentNode[];
}

export interface BffPlanEventOption {
  id: string;
  eventCode: string;
  eventName: string;
  scenarioType: ScenarioType;
  fiscalYear: number;
}

export interface BffPlanVersionOption {
  id: string;
  versionCode: string;
  versionName: string;
  status: string;
}

export interface BffDepartmentNode {
  stableId: string;
  departmentCode: string;
  departmentName: string;
  level: number;
  hasChildren: boolean;
  children?: BffDepartmentNode[];
}

// レポートデータ
export interface BffIndicatorReportDataResponse {
  fiscalYear: number;
  periodRange: {
    start: string;
    end: string;
    granularity: DisplayGranularity;
  };
  departmentName: string;
  includeChildren: boolean;
  rows: BffReportRow[];
}

export interface BffReportRow {
  lineId: string;
  lineNo: number;
  lineType: LayoutLineType;
  displayName: string | null;
  indentLevel: number;
  isBold: boolean;
  itemRefType: ItemRefType | null;
  primaryValue: number | null;
  compareValue: number | null;
  differenceValue: number | null;
  differenceRate: number | null;
  unit: string | null;
}
```

### Errors → UI Messages

| Error Code | UI Message |
|------------|-----------|
| INDICATOR_REPORT_LAYOUT_NOT_CONFIGURED | 「レイアウトが設定されていません。システム管理者にお問い合わせください。」 |
| INDICATOR_REPORT_LAYOUT_NOT_FOUND | 「指定されたレイアウトが見つかりません」 |
| INDICATOR_REPORT_PLAN_EVENT_NOT_FOUND | 「指定された計画イベントが見つかりません」 |
| INDICATOR_REPORT_PLAN_VERSION_NOT_FOUND | 「指定された計画バージョンが見つかりません」 |
| INDICATOR_REPORT_DEPARTMENT_NOT_FOUND | 「指定された部門が見つかりません」 |
| INDICATOR_REPORT_INVALID_PERIOD_RANGE | 「無効な期間範囲です」 |
| INDICATOR_REPORT_NO_KPI_EVENT_FOUND | 「対象年度のKPIイベントが見つかりません（KPI行は「-」で表示されます）」 |
| INDICATOR_REPORT_METRIC_EVALUATION_ERROR | 「指標の計算でエラーが発生しました」 |
| INDICATOR_REPORT_VALIDATION_ERROR | 「入力内容に誤りがあります」 |

### DTO Import（MANDATORY）

```typescript
import type {
  ScenarioType,
  DisplayGranularity,
  LayoutLineType,
  ItemRefType,
  BffSelectorOptionsRequest,
  BffIndicatorReportDataRequest,
  BffIndicatorReportLayoutResponse,
  BffLayoutLine,
  BffSelectorOptionsResponse,
  BffPlanEventOption,
  BffPlanVersionOption,
  BffDepartmentNode,
  BffIndicatorReportDataResponse,
  BffReportRow,
} from "@epm/contracts/bff/indicator-report";

import { IndicatorReportErrorCode } from "@epm/contracts/bff/indicator-report";
```

---

## 6. UI Components

### Tier 1（使用必須 - @/shared/ui から）
- Button, Select, Checkbox, Label
- Table, Card, Alert, Badge, Separator
- Toast/Sonner, Tooltip, Skeleton
- Scroll Area

### Tier 2（必要時のみ）
- Collapsible（部門ツリー展開用）
- Tree（部門階層表示用、shared/uiに存在する場合のみ利用。無い場合はOUTPUT.mdにTODO記載）

### Feature-specific Components（v0 が生成）

```
components/
├── IndicatorReportPage.tsx        # メインページ
├── FilterHeader.tsx               # 年度/Primary/Compare/イベント/バージョン選択
├── PeriodGranularitySelector.tsx  # 期間/粒度選択
├── DepartmentTreePanel.tsx        # 部門ツリー（単独/配下集約）
├── ReportHeader.tsx               # レポート名/ヘッダテキスト表示
├── ReportTable.tsx                # レポートテーブル本体
├── ReportRow.tsx                  # 行種別に応じた表示
├── LayoutNotConfiguredBlock.tsx   # レイアウト未設定ブロック
├── RequiredFieldsBlock.tsx        # 必須項目未選択ブロック
└── index.ts                       # barrel export
```

---

## 7. Mock Data

### Sample Data（BFF Response 形状と一致必須）

```typescript
// Mock Layout
const mockLayout: BffIndicatorReportLayoutResponse = {
  layoutId: "layout-001",
  layoutCode: "STANDARD_PL",
  layoutName: "標準損益計算書レポート",
  headerText: "本レポートは経営会議向けの標準損益計算書フォーマットです",
  lines: [
    { lineId: "line-001", lineNo: 1, lineType: "header", displayName: "売上高", itemRefType: null, indentLevel: 0, isBold: true },
    { lineId: "line-002", lineNo: 2, lineType: "item", displayName: "国内売上", itemRefType: "FINANCIAL", indentLevel: 1, isBold: false },
    { lineId: "line-003", lineNo: 3, lineType: "item", displayName: "海外売上", itemRefType: "FINANCIAL", indentLevel: 1, isBold: false },
    { lineId: "line-004", lineNo: 4, lineType: "divider", displayName: "売上高計", itemRefType: null, indentLevel: 0, isBold: true },
    { lineId: "line-005", lineNo: 5, lineType: "blank", displayName: null, itemRefType: null, indentLevel: 0, isBold: false },
    { lineId: "line-006", lineNo: 6, lineType: "header", displayName: "営業費用", itemRefType: null, indentLevel: 0, isBold: true },
    { lineId: "line-007", lineNo: 7, lineType: "item", displayName: "売上原価", itemRefType: "FINANCIAL", indentLevel: 1, isBold: false },
    { lineId: "line-008", lineNo: 8, lineType: "item", displayName: "販管費", itemRefType: "FINANCIAL", indentLevel: 1, isBold: false },
    { lineId: "line-009", lineNo: 9, lineType: "divider", displayName: null, itemRefType: null, indentLevel: 0, isBold: false },
    { lineId: "line-010", lineNo: 10, lineType: "item", displayName: "営業利益", itemRefType: "METRIC", indentLevel: 0, isBold: true },
    { lineId: "line-011", lineNo: 11, lineType: "item", displayName: "営業利益率", itemRefType: "METRIC", indentLevel: 0, isBold: false },
    { lineId: "line-012", lineNo: 12, lineType: "note", displayName: "※ 営業利益率 = 営業利益 / 売上高 × 100", itemRefType: null, indentLevel: 0, isBold: false },
    { lineId: "line-013", lineNo: 13, lineType: "blank", displayName: null, itemRefType: null, indentLevel: 0, isBold: false },
    { lineId: "line-014", lineNo: 14, lineType: "header", displayName: "非財務KPI", itemRefType: null, indentLevel: 0, isBold: true },
    { lineId: "line-015", lineNo: 15, lineType: "item", displayName: "従業員数", itemRefType: "NON_FINANCIAL", indentLevel: 1, isBold: false },
    { lineId: "line-016", lineNo: 16, lineType: "item", displayName: "顧客満足度", itemRefType: "NON_FINANCIAL", indentLevel: 1, isBold: false },
  ],
};

// Mock Selector Options
const mockSelectorOptions: BffSelectorOptionsResponse = {
  fiscalYears: [2026, 2025, 2024],
  planEvents: [
    { id: "event-001", eventCode: "BUD2026", eventName: "2026年度予算", scenarioType: "BUDGET", fiscalYear: 2026 },
    { id: "event-002", eventCode: "FC2026-Q1", eventName: "2026年度Q1見込", scenarioType: "FORECAST", fiscalYear: 2026 },
    { id: "event-003", eventCode: "FC2026-Q2", eventName: "2026年度Q2見込", scenarioType: "FORECAST", fiscalYear: 2026 },
  ],
  planVersions: [
    { id: "ver-001", versionCode: "V1", versionName: "初版", status: "FIXED" },
    { id: "ver-002", versionCode: "V2", versionName: "修正版", status: "DRAFT" },
  ],
  departments: [
    {
      stableId: "dept-root",
      departmentCode: "0000",
      departmentName: "全社",
      level: 0,
      hasChildren: true,
      children: [
        {
          stableId: "dept-div-a",
          departmentCode: "1000",
          departmentName: "事業部A",
          level: 1,
          hasChildren: true,
          children: [
            { stableId: "dept-sales", departmentCode: "1100", departmentName: "営業部", level: 2, hasChildren: false },
            { stableId: "dept-dev", departmentCode: "1200", departmentName: "開発部", level: 2, hasChildren: false },
          ],
        },
        {
          stableId: "dept-div-b",
          departmentCode: "2000",
          departmentName: "事業部B",
          level: 1,
          hasChildren: true,
          children: [
            { stableId: "dept-mfg", departmentCode: "2100", departmentName: "製造部", level: 2, hasChildren: false },
          ],
        },
      ],
    },
  ],
};

// Mock Report Data
const mockReportData: BffIndicatorReportDataResponse = {
  fiscalYear: 2026,
  periodRange: { start: "FY2026-P01", end: "FY2026-P12", granularity: "YEARLY" },
  departmentName: "全社",
  includeChildren: true,
  rows: [
    { lineId: "line-001", lineNo: 1, lineType: "header", displayName: "売上高", indentLevel: 0, isBold: true, itemRefType: null, primaryValue: null, compareValue: null, differenceValue: null, differenceRate: null, unit: null },
    { lineId: "line-002", lineNo: 2, lineType: "item", displayName: "国内売上", indentLevel: 1, isBold: false, itemRefType: "FINANCIAL", primaryValue: 600000000, compareValue: 500000000, differenceValue: 100000000, differenceRate: 20.0, unit: "円" },
    { lineId: "line-003", lineNo: 3, lineType: "item", displayName: "海外売上", indentLevel: 1, isBold: false, itemRefType: "FINANCIAL", primaryValue: 400000000, compareValue: 400000000, differenceValue: 0, differenceRate: 0, unit: "円" },
    { lineId: "line-004", lineNo: 4, lineType: "divider", displayName: "売上高計", indentLevel: 0, isBold: true, itemRefType: null, primaryValue: null, compareValue: null, differenceValue: null, differenceRate: null, unit: null },
    { lineId: "line-005", lineNo: 5, lineType: "blank", displayName: null, indentLevel: 0, isBold: false, itemRefType: null, primaryValue: null, compareValue: null, differenceValue: null, differenceRate: null, unit: null },
    { lineId: "line-006", lineNo: 6, lineType: "header", displayName: "営業費用", indentLevel: 0, isBold: true, itemRefType: null, primaryValue: null, compareValue: null, differenceValue: null, differenceRate: null, unit: null },
    { lineId: "line-007", lineNo: 7, lineType: "item", displayName: "売上原価", indentLevel: 1, isBold: false, itemRefType: "FINANCIAL", primaryValue: 650000000, compareValue: 600000000, differenceValue: 50000000, differenceRate: 8.3, unit: "円" },
    { lineId: "line-008", lineNo: 8, lineType: "item", displayName: "販管費", indentLevel: 1, isBold: false, itemRefType: "FINANCIAL", primaryValue: 150000000, compareValue: 120000000, differenceValue: 30000000, differenceRate: 25.0, unit: "円" },
    { lineId: "line-009", lineNo: 9, lineType: "divider", displayName: null, indentLevel: 0, isBold: false, itemRefType: null, primaryValue: null, compareValue: null, differenceValue: null, differenceRate: null, unit: null },
    { lineId: "line-010", lineNo: 10, lineType: "item", displayName: "営業利益", indentLevel: 0, isBold: true, itemRefType: "METRIC", primaryValue: 200000000, compareValue: 180000000, differenceValue: 20000000, differenceRate: 11.1, unit: "円" },
    { lineId: "line-011", lineNo: 11, lineType: "item", displayName: "営業利益率", indentLevel: 0, isBold: false, itemRefType: "METRIC", primaryValue: 20.0, compareValue: 18.0, differenceValue: 2.0, differenceRate: null, unit: "%" },
    { lineId: "line-012", lineNo: 12, lineType: "note", displayName: "※ 営業利益率 = 営業利益 / 売上高 × 100", indentLevel: 0, isBold: false, itemRefType: null, primaryValue: null, compareValue: null, differenceValue: null, differenceRate: null, unit: null },
    { lineId: "line-013", lineNo: 13, lineType: "blank", displayName: null, indentLevel: 0, isBold: false, itemRefType: null, primaryValue: null, compareValue: null, differenceValue: null, differenceRate: null, unit: null },
    { lineId: "line-014", lineNo: 14, lineType: "header", displayName: "非財務KPI", indentLevel: 0, isBold: true, itemRefType: null, primaryValue: null, compareValue: null, differenceValue: null, differenceRate: null, unit: null },
    { lineId: "line-015", lineNo: 15, lineType: "item", displayName: "従業員数", indentLevel: 1, isBold: false, itemRefType: "NON_FINANCIAL", primaryValue: 1250, compareValue: 1200, differenceValue: 50, differenceRate: 4.2, unit: "人" },
    { lineId: "line-016", lineNo: 16, lineType: "item", displayName: "顧客満足度", indentLevel: 1, isBold: false, itemRefType: "NON_FINANCIAL", primaryValue: 4.5, compareValue: 4.3, differenceValue: 0.2, differenceRate: 4.7, unit: "pt" },
  ],
};

// Mock: 欠損データの例（KPIイベントがない場合）
const mockReportDataWithMissing: BffIndicatorReportDataResponse = {
  ...mockReportData,
  rows: mockReportData.rows.map(row =>
    row.itemRefType === "NON_FINANCIAL"
      ? { ...row, primaryValue: null, compareValue: null, differenceValue: null, differenceRate: null }
      : row
  ),
};
```

### States to Cover
- 通常状態（データあり、Primary + Compare）
- Compare未選択状態（Compare列/差分列を非表示）
- 欠損データ状態（一部行が「-」表示）
- レイアウト未設定状態（ブロック画面表示）
- 必須項目未選択状態（ブロック画面表示）
- ローディング状態（Skeleton表示）
- エラー状態（Toast/Alert表示）

---

## 8. Output Structure（二重出力：プレビュー用 + 移植用）

### 重要：2つの出力先に同期して生成すること（MANDATORY）

v0 は以下の **2箇所に同じ内容を出力** すること：

---

### 1. プレビュー用（v0 内で動作確認）

v0 プロジェクトの `app/` に配置（プレビュー・調整用）:

```
app/reporting/indicator-report/
├── page.tsx
└── components/
    ├── IndicatorReportPage.tsx
    ├── FilterHeader.tsx
    ├── PeriodGranularitySelector.tsx
    ├── DepartmentTreePanel.tsx
    ├── ReportHeader.tsx
    ├── ReportTable.tsx
    ├── ReportRow.tsx
    ├── LayoutNotConfiguredBlock.tsx
    ├── RequiredFieldsBlock.tsx
    └── api/
        ├── BffClient.ts
        ├── MockBffClient.ts
        └── HttpBffClient.ts
```

---

### 2. 移植用モジュール（DL して本番環境へ移植）

v0 プロジェクトの `_v0_drop/` に配置（移植用、プレビュー用と同期）:

```
_v0_drop/reporting/indicator-report/src/
├── app/
│   └── page.tsx
├── components/
│   ├── IndicatorReportPage.tsx
│   ├── FilterHeader.tsx
│   ├── PeriodGranularitySelector.tsx
│   ├── DepartmentTreePanel.tsx
│   ├── ReportHeader.tsx
│   ├── ReportTable.tsx
│   ├── ReportRow.tsx
│   ├── LayoutNotConfiguredBlock.tsx
│   ├── RequiredFieldsBlock.tsx
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

---

### 同期ルール（MUST）

1. プレビュー用と移植用のコンポーネント実装は **完全に同一**
2. 移植用は以下を追加：
   - `index.ts`（barrel export）
   - `lib/error-messages.ts`（エラーマッピング）
   - `OUTPUT.md`（移植手順）
3. 移植用のインポートパスは本番環境を想定：
   - `@/shared/ui` → `@/shared/ui`（そのまま）
   - `@epm/contracts/bff/indicator-report` → `@epm/contracts/bff/indicator-report`（そのまま）

---

### OUTPUT.md（必須生成 - _v0_drop 内）

v0 は `_v0_drop/reporting/indicator-report/src/OUTPUT.md` に以下を含めること:

1. **Generated Files Tree** - 生成したファイル一覧
2. **Imports Used** - @/shared/ui から使用したコンポーネント、DTO インポート
3. **Missing Components (TODO)** - 不足している shared component があれば記載
4. **Migration Steps** - 移植手順:
   - コピー先: `apps/web/src/features/reporting/indicator-report/ui/`
   - インポートパス変更（必要な場合）
   - page.tsx 接続方法
5. **Compliance Checklist**:
   - [ ] Components from @/shared/ui only
   - [ ] DTOs from @epm/contracts/bff only
   - [ ] No raw colors (bg-[#...]) - semantic tokens only
   - [ ] No layout.tsx
   - [ ] No base UI recreated in feature
   - [ ] MockBffClient returns DTO-shaped data
   - [ ] Error codes mapped to user messages
   - [ ] _v0_drop と app が同期している

---

## 9. 表示ルール詳細

### 9.1 行種別ごとの表示

| lineType | 表示ルール | primaryValue | 数値列表示 |
|----------|-----------|--------------|-----------|
| header | 見出し行（太字背景色あり）、indentLevelによるインデント | 常にnull | 非表示 |
| item | 指標行、indentLevelによるインデント、isBoldで太字 | 数値 or null | 表示（nullは「-」） |
| divider | 区切り線、displayNameがあれば表示（合計行等） | 常にnull | 非表示 |
| note | 注記行（小さめフォント、グレー色） | 常にnull | 非表示 |
| blank | 空行（1行分のスペース） | 常にnull | 非表示 |

補足:
- itemRefType=METRIC は FIN_METRIC のみ対象（KPI_METRICはMVP外）
- KPIイベント未存在の場合、NON_FINANCIAL行は null 表示（「-」）で継続し、画面はブロックしない

### 9.2 数値フォーマット

- 金額（unit: "円"）: 3桁カンマ区切り（例: 1,000,000）
- パーセント（unit: "%"）: 小数点1桁（例: 20.0%）
- 人数（unit: "人"）: 3桁カンマ区切り（例: 1,250）
- その他: 小数点2桁

### 9.3 差分表示

- **差分値/差分率**: BFFで計算済み（UIはフォーマットのみ）
- **差分（金額/値）**: +/- 符号付き、3桁カンマ区切り
- **差分率**: differenceRate をパーセント表示（小数点1桁）、differenceRate が null の場合は「-」
- **色分け**:
  - 正（プラス）: text-success（緑）
  - 負（マイナス）: text-destructive（赤）
  - ゼロ/欠損: text-muted-foreground（グレー）

### 9.4 インデント

- indentLevel 0: 左端
- indentLevel 1: pl-4（16px）
- indentLevel 2: pl-8（32px）
- indentLevel 3: pl-12（48px）

### 9.5 データ合成ルール（BFF側、UIは表示のみ）

- FORECAST: 選択イベントの最新FIXEDを使用し、HARD_CLOSED月は実績値を優先
- KPI: kpi_master_events の最新CONFIRMED（年度一致）を自動採用
- 差分値/差分率はBFFで計算済み（UIはフォーマットのみ）

---

## 10. 禁止事項（v0 への最終リマインダー）

```markdown
❌ PROHIBITED:
- `packages/contracts/src/api` からのインポート
- Domain API 直接呼び出し（/api/domain/...）
- fetch() を HttpBffClient 外で使用
- layout.tsx の生成
- base UI コンポーネント（button.tsx, input.tsx 等）の作成
- 生カラー（bg-[#14b8a6], bg-teal-500 等）
- 任意スペーシング（p-[16px], gap-[20px] 等）
- Sidebar/Header/Shell の独自作成
- eval() による formula_expr 評価（UI側では行わない）

✅ REQUIRED:
- @/shared/ui からコンポーネント使用
- @epm/contracts/bff/indicator-report から DTO 使用
- semantic tokens（bg-primary, text-foreground, border-input 等）
- Tailwind scale（p-4, gap-4, rounded-lg 等）
- MockBffClient でモックデータ提供
- OUTPUT.md 生成
- 数値欠損時は「-」（ハイフン）表示
- Compare未選択時はCompare列/差分列を完全に非表示
```

---

## 11. 実装優先順位

1. **IndicatorReportPage.tsx** - メインコンテナ、状態管理
2. **LayoutNotConfiguredBlock.tsx** - レイアウト未設定時のブロック
3. **RequiredFieldsBlock.tsx** - 必須項目未選択ブロック
4. **ReportHeader.tsx** - レポート名/ヘッダテキスト
5. **FilterHeader.tsx** - 年度/Primary/Compare選択
6. **PeriodGranularitySelector.tsx** - 期間/粒度選択
7. **DepartmentTreePanel.tsx** - 部門ツリー
8. **ReportTable.tsx** + **ReportRow.tsx** - レポート表示
9. **api/MockBffClient.ts** - モックデータ提供
10. **api/BffClient.ts** + **api/HttpBffClient.ts** - インターフェース定義

---

# Template End
