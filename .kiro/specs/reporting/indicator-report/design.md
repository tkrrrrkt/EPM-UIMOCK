# 財務指標分析レポート - Design

## Spec Reference

### INPUT確認（必須）
| 優先度 | 参照先 | 確認内容 |
|-------|-------|---------|
| **必須** | `.kiro/specs/reporting/indicator-report/requirements.md` | 本Featureの要件定義 |
| **必須** | `.kiro/specs/仕様概要/財務指標分析レポート_財務指標分析レポート.md` | 確定済み仕様 |
| **必須** | `.kiro/specs/entities/01_各種マスタ.md` | indicator_report_layouts, companies 等 |
| **必須** | `.kiro/specs/entities/02_トランザクション・残高.md` | fact_amounts |
| **必須** | `.kiro/specs/entities/02_KPI管理マスタ.md` | kpi_master_events, kpi_fact_amounts |

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                            UI (apps/web)                             │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  IndicatorReportPage                                          │  │
│  │  ├── FilterHeader (年度/Primary/Compare)                      │  │
│  │  ├── PeriodGranularitySelector (期間レンジ/粒度)               │  │
│  │  ├── DepartmentTreePanel (部門選択)                           │  │
│  │  └── ReportTable (Primary/Compare/差分列)                     │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                │                                     │
│                      BffClient (HttpBffClient)                       │
└────────────────────────────────┼─────────────────────────────────────┘
                                 │ /api/bff/indicator-report/*
┌────────────────────────────────┼─────────────────────────────────────┐
│                            BFF (apps/bff)                            │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  IndicatorReportController                                    │  │
│  │  ├── GET /layout                                              │  │
│  │  ├── GET /selector-options                                    │  │
│  │  └── GET /data                                                │  │
│  │                                                               │  │
│  │  IndicatorReportService → IndicatorReportMapper               │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                │                                     │
│                    API Client (Internal HTTP)                        │
└────────────────────────────────┼─────────────────────────────────────┘
                                 │ /api/indicator-report/*
┌────────────────────────────────┼─────────────────────────────────────┐
│                         Domain API (apps/api)                        │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  IndicatorReportController                                    │  │
│  │  IndicatorReportService                                       │  │
│  │  ├── LayoutService (レイアウト取得)                           │  │
│  │  ├── FactAmountSynthesisService (財務科目データ)              │  │
│  │  ├── KpiFactAmountSynthesisService (非財務KPIデータ)          │  │
│  │  ├── MetricEvaluationService (指標計算)                       │  │
│  │  └── DataSynthesisService (合成・集計)                        │  │
│  │                                                               │  │
│  │  Repositories                                                 │  │
│  │  ├── IndicatorReportLayoutRepository                          │  │
│  │  ├── FactAmountRepository                                     │  │
│  │  ├── KpiFactAmountRepository                                  │  │
│  │  └── (Subject/Metric/KpiDefinition は既存利用)                │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                │                                     │
│                           Prisma ORM                                 │
└────────────────────────────────┼─────────────────────────────────────┘
                                 │
                        PostgreSQL + RLS
```

---

## 2. Architecture Responsibilities

### 2.1 BFF Specification

#### Endpoints

| Method | Endpoint | Purpose | Request DTO | Response DTO |
|--------|----------|---------|-------------|--------------|
| GET | /api/bff/indicator-report/layout | レイアウト情報取得 | - (Header: x-tenant-id) | BffIndicatorReportLayoutResponse |
| GET | /api/bff/indicator-report/selector-options | 選択肢取得 | BffSelectorOptionsRequest | BffSelectorOptionsResponse |
| GET | /api/bff/indicator-report/data | レポートデータ取得 | BffIndicatorReportDataRequest | BffIndicatorReportDataResponse |

#### Paging / Sorting Normalization（BFF責務）
- **Paging**: 本機能ではページングなし（レイアウト行数は限定的、通常100行以下）
- **部門ツリー**: ネスト構造で一括返却（階層構造のため分割不可）

#### Error Policy
- **Option A: Pass-through** を選択
- 理由: 照会専用機能であり、Domain APIエラーをそのまま透過することで実装がシンプル
- UI側でエラーコードからユーザー向けメッセージに変換

### 2.2 Service Specification

#### Transaction境界
- 全エンドポイントは**読み取り専用**（トランザクション不要）

#### 監査ポイント
- 読み取り専用のため監査ログは不要
- アクセスログはインフラレベルで記録

### 2.3 Repository Specification

#### tenant_id double-guard
- 全クエリで `tenant_id` を WHERE 条件に含める
- RLS ポリシーと併用（アプリ層 + DB層の二重防御）

---

## 3. Contracts Summary

### 3.1 BFF Contracts

#### Enums

```typescript
// packages/contracts/src/bff/indicator-report/enums.ts

// シナリオタイプ（既存 shared/enums を参照、なければ定義）
export const ScenarioType = {
  BUDGET: "BUDGET",
  FORECAST: "FORECAST",
  ACTUAL: "ACTUAL",
} as const;
export type ScenarioType = (typeof ScenarioType)[keyof typeof ScenarioType];

// 表示粒度
export const DisplayGranularity = {
  MONTHLY: "MONTHLY",
  QUARTERLY: "QUARTERLY",
  HALF_YEARLY: "HALF_YEARLY",
  YEARLY: "YEARLY",
} as const;
export type DisplayGranularity = (typeof DisplayGranularity)[keyof typeof DisplayGranularity];

// 行種別
export const LayoutLineType = {
  HEADER: "header",
  ITEM: "item",
  DIVIDER: "divider",
  NOTE: "note",
  BLANK: "blank",
} as const;
export type LayoutLineType = (typeof LayoutLineType)[keyof typeof LayoutLineType];

// item行の参照種別
export const ItemRefType = {
  FINANCIAL: "FINANCIAL",        // ref_subject_id
  NON_FINANCIAL: "NON_FINANCIAL", // ref_kpi_definition_id
  METRIC: "METRIC",              // ref_metric_id
} as const;
export type ItemRefType = (typeof ItemRefType)[keyof typeof ItemRefType];
```

#### Request DTOs

```typescript
// packages/contracts/src/bff/indicator-report/index.ts

// 選択肢取得リクエスト
export interface BffSelectorOptionsRequest {
  fiscalYear?: number;           // 年度（イベント/バージョン絞り込み用）
  scenarioType?: ScenarioType;   // シナリオタイプ（イベント絞り込み用）
  planEventId?: string;          // イベントID（バージョン絞り込み用）
}

// レポートデータ取得リクエスト
export interface BffIndicatorReportDataRequest {
  fiscalYear: number;

  // Primary（必須）
  primaryScenarioType: ScenarioType;
  primaryPlanEventId?: string;      // BUDGET/FORECAST時必須
  primaryPlanVersionId?: string;    // BUDGET時必須

  // Compare（任意）
  compareScenarioType?: ScenarioType;
  comparePlanEventId?: string;
  comparePlanVersionId?: string;

  // 期間
  startPeriodCode: string;          // 例: "FY2026-P01"
  endPeriodCode: string;            // 例: "FY2026-P12"
  displayGranularity: DisplayGranularity;

  // 部門
  departmentStableId: string;
  includeChildren: boolean;         // 配下集約フラグ
}
```

#### Response DTOs

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
  itemRefType: ItemRefType | null; // item行のみ設定
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

  // item行のみ設定
  itemRefType: ItemRefType | null;
  primaryValue: number | null;      // null = 欠損（「-」表示）
  compareValue: number | null;
  differenceValue: number | null;   // Primary - Compare
  differenceRate: number | null;    // パーセント（小数）
  unit: string | null;
}
```

#### Error Contracts

```typescript
// packages/contracts/src/bff/indicator-report/errors.ts

export const IndicatorReportErrorCode = {
  LAYOUT_NOT_CONFIGURED: "INDICATOR_REPORT_LAYOUT_NOT_CONFIGURED",
  LAYOUT_NOT_FOUND: "INDICATOR_REPORT_LAYOUT_NOT_FOUND",
  PLAN_EVENT_NOT_FOUND: "INDICATOR_REPORT_PLAN_EVENT_NOT_FOUND",
  PLAN_VERSION_NOT_FOUND: "INDICATOR_REPORT_PLAN_VERSION_NOT_FOUND",
  DEPARTMENT_NOT_FOUND: "INDICATOR_REPORT_DEPARTMENT_NOT_FOUND",
  INVALID_PERIOD_RANGE: "INDICATOR_REPORT_INVALID_PERIOD_RANGE",
  NO_KPI_EVENT_FOUND: "INDICATOR_REPORT_NO_KPI_EVENT_FOUND",
  METRIC_EVALUATION_ERROR: "INDICATOR_REPORT_METRIC_EVALUATION_ERROR",
  VALIDATION_ERROR: "INDICATOR_REPORT_VALIDATION_ERROR",
} as const;

export type IndicatorReportErrorCode =
  (typeof IndicatorReportErrorCode)[keyof typeof IndicatorReportErrorCode];

export interface IndicatorReportError {
  code: IndicatorReportErrorCode;
  message: string;
  details?: Record<string, unknown>;
}
```

### 3.2 API Contracts

```typescript
// packages/contracts/src/api/indicator-report/index.ts

// API Request（BFF → Domain API）
export interface ApiIndicatorReportLayoutRequest {
  tenantId: string;
  companyId: string;
}

export interface ApiIndicatorReportDataRequest {
  tenantId: string;
  companyId: string;
  layoutId: string;
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

// API Response
export interface ApiIndicatorReportLayoutResponse {
  layout: ApiLayout;
  lines: ApiLayoutLine[];
}

export interface ApiLayout {
  id: string;
  layoutCode: string;
  layoutName: string;
  headerText: string | null;
}

export interface ApiLayoutLine {
  id: string;
  lineNo: number;
  lineType: LayoutLineType;
  displayName: string | null;
  refSubjectId: string | null;
  refKpiDefinitionId: string | null;
  refMetricId: string | null;
  indentLevel: number;
  isBold: boolean;
}

export interface ApiIndicatorReportDataResponse {
  rows: ApiReportRow[];
}

export interface ApiReportRow {
  lineId: string;
  lineNo: number;
  lineType: LayoutLineType;
  displayName: string | null;
  indentLevel: number;
  isBold: boolean;
  itemRefType: ItemRefType | null;
  refId: string | null;
  primaryValue: number | null;
  compareValue: number | null;
  unit: string | null;
}
```

---

## 4. Data Model（エンティティ整合性確認済み）

### 4.1 参照エンティティ

| エンティティ | Prismaモデル | 用途 |
|------------|-------------|------|
| companies | Company | indicator_report_layout_id 取得 |
| indicator_report_layouts | IndicatorReportLayout | レイアウトヘッダ |
| indicator_report_layout_lines | IndicatorReportLayoutLine | レイアウト行 |
| fact_amounts | FactAmount | 財務科目データ |
| subjects | Subject | 科目マスタ（aggregation_method参照） |
| kpi_master_events | KpiMasterEvent | 非財務KPIイベント |
| kpi_definitions | KpiDefinition | 非財務KPI定義 |
| kpi_fact_amounts | KpiFactAmount | 非財務KPIデータ |
| metrics | Metric | 指標定義（formula_expr） |
| plan_events | PlanEvent | 計画イベント |
| plan_versions | PlanVersion | 計画バージョン |
| accounting_periods | AccountingPeriod | 会計期間 |
| departments | Department | 部門 |
| organization_versions | OrganizationVersion | 組織版 |

### 4.2 DTO-DB カラムマッピング

| DTO (camelCase) | DB Column (snake_case) | 型変換 |
|-----------------|------------------------|--------|
| layoutId | id | UUID → String |
| layoutCode | layout_code | varchar(50) → String |
| layoutName | layout_name | varchar(200) → String |
| headerText | header_text | text → String \| null |
| lineNo | line_no | int → number |
| lineType | line_type | varchar(20) → LayoutLineType |
| displayName | display_name | varchar(200) → String \| null |
| refSubjectId | ref_subject_id | uuid → String \| null |
| refKpiDefinitionId | ref_kpi_definition_id | uuid → String \| null |
| refMetricId | ref_metric_id | uuid → String \| null |
| indentLevel | indent_level | int → number |
| isBold | is_bold | boolean → boolean |
| primaryValue | - | numeric(20,4) → number \| null |
| differenceRate | - | 計算値 → number \| null |

### 4.3 エンティティ整合性確認結果

| チェック項目 | 確認結果 |
|-------------|---------|
| カラム網羅性 | indicator_report_layouts, indicator_report_layout_lines の全カラムをDTO/Prismaに反映 |
| 型の一致 | varchar → String, int → number, uuid → String, boolean → boolean で変換 |
| 制約の反映 | UNIQUE(tenant_id, layout_code) をアプリ検証で対応 |
| ビジネスルール | item行は ref_subject_id / ref_kpi_definition_id / ref_metric_id のいずれか1つのみ設定 |
| NULL許可 | header_text, display_name, ref_* は NULL許可 |

---

## 5. データ合成ロジック

### 5.1 財務科目（fact_amounts）

```sql
-- 財務科目データ取得
SELECT
  fa.subject_id,
  SUM(fa.amount) as total_amount
FROM fact_amounts fa
WHERE fa.tenant_id = :tenantId
  AND fa.company_id = :companyId
  AND fa.subject_id = :subjectId
  AND fa.scenario_type = :scenarioType
  AND fa.plan_event_id = :planEventId
  AND fa.plan_version_id = :planVersionId
  AND fa.accounting_period_id IN (
    SELECT id FROM accounting_periods
    WHERE period_code BETWEEN :startPeriodCode AND :endPeriodCode
  )
  AND fa.department_stable_id IN (:departmentStableIds)
GROUP BY fa.subject_id
```

**集計方法**（subjects.aggregation_method）:
| Method | ロジック |
|--------|---------|
| SUM | 期間内の合計 |
| EOP | 最終期間の値（End of Period） |
| AVG | 期間内の平均 |
| MAX | 期間内の最大値 |
| MIN | 期間内の最小値 |

### 5.2 非財務KPI（kpi_fact_amounts）

```sql
-- 最新CONFIRMED イベント取得
SELECT kme.id
FROM kpi_master_events kme
WHERE kme.tenant_id = :tenantId
  AND kme.company_id = :companyId
  AND kme.fiscal_year = :fiscalYear
  AND kme.status = 'CONFIRMED'
ORDER BY kme.created_at DESC
LIMIT 1;

-- KPIデータ取得
SELECT
  kfa.kpi_definition_id,
  CASE
    WHEN :scenarioType = 'ACTUAL' THEN kfa.actual_value
    ELSE kfa.target_value
  END as value
FROM kpi_fact_amounts kfa
WHERE kfa.tenant_id = :tenantId
  AND kfa.kpi_event_id = :kpiEventId
  AND kfa.kpi_definition_id = :kpiDefinitionId
  AND kfa.period_code IN (:periodCodes)
  AND (kfa.department_stable_id IS NULL
       OR kfa.department_stable_id IN (:departmentStableIds));
```

**期間コード変換**:
| 粒度 | period_code 形式 |
|------|-----------------|
| 月次 | FY2026-P01 〜 FY2026-P12 |
| 四半期 | FY2026-Q1 〜 FY2026-Q4 |
| 半期 | FY2026-H1, FY2026-H2 |
| 年度 | FY2026 |

### 5.3 指標（metrics.formula_expr）

```typescript
// formula_expr 例: SUB("OP") + SUB("DA")
// SUB(code) → 対応する subject の fact_amounts 値を取得

interface FormulaContext {
  SUB: (subjectCode: string) => number | null;
  MET: (metricCode: string) => number | null;
}

function evaluateFormula(
  formulaExpr: string,
  context: FormulaContext
): number | null {
  // 1. 式をパース（SUB("xxx"), MET("xxx") を識別）
  // 2. 各参照を context から値取得
  // 3. 四則演算を評価
  // 4. いずれかがnullなら結果もnull
}
```

**注意**: formula_expr の評価には安全なパーサーを使用（eval禁止）

### 5.4 差分計算（BFF責務）

```typescript
function calculateDifference(primary: number | null, compare: number | null): {
  differenceValue: number | null;
  differenceRate: number | null;
} {
  if (primary === null || compare === null) {
    return { differenceValue: null, differenceRate: null };
  }

  const diff = primary - compare;
  const rate = compare !== 0 ? (diff / compare) * 100 : null;

  return {
    differenceValue: diff,
    differenceRate: rate,
  };
}
```

---

## 6. Requirements Traceability

| Requirement ID | Design Section |
|----------------|----------------|
| FR-1.1, FR-1.2, FR-1.3 | Section 3.1 BFF Contracts (Layout) |
| FR-2.1 〜 FR-2.5 | Section 3.1 LayoutLineType Enum |
| FR-3.1 | Section 5.1 財務科目 |
| FR-3.2 | Section 5.2 非財務KPI |
| FR-3.3 | Section 5.3 指標 |
| FR-3.4 | Section 5.1 集計方法 |
| FR-4.1 〜 FR-4.4 | Section 3.1 Request DTOs |
| FR-5.1 〜 FR-5.3 | Section 5.2 非財務KPI |
| FR-6.1 〜 FR-6.4 | Section 5.2 期間コード変換 |
| FR-7.1, FR-7.2 | Section 5.4 差分計算 |
| FR-8.1 | Section 3.1 Response DTOs (null = 欠損) |
| NFR-2 | Section 2.3 Repository Specification |
| NFR-3, NFR-4 | BFF Controller で権限チェック |

---

## 変更履歴

| 日付 | 変更内容 | 担当 |
|------|---------|------|
| 2026-01-26 | 初版作成 | Claude Code |
