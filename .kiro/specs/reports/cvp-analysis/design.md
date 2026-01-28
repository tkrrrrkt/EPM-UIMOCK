# Design Document - CVP損益分岐分析

---

**Purpose**: UI-MOCK先行開発のため、BFFコントラクトとUI設計を中心に記述。Backend実装は基盤テーブル実装後に詳細化する。

---

## Spec Reference（INPUT情報）

本設計を作成するにあたり、以下の情報を確認した：

### Requirements（直接INPUT）
- **参照ファイル**: `.kiro/specs/reports/cvp-analysis/requirements.md`
- **要件バージョン**: 2026-01-26

### 仕様概要（確定済み仕様）
- **参照ファイル**: `.kiro/specs/仕様概要/財務指標分析レポート_CVP損益分岐分析.md`
- **設計に影響する仕様ポイント**:
  - 金額ベースCVP（数量/単価は扱わない）
  - シミュレーションはUI内のみ（保存しない/リロードでリセット）
  - 8つのKPI指標計算ルール
  - CVPレイアウトはcompanies.cvp_report_layout_idで指定

### エンティティ定義（Data Model 正本）
- **参照ファイル**: `.kiro/specs/entities/01_各種マスタ.md`, `.kiro/specs/entities/02_トランザクション・残高.md`
- **対象エンティティ**: fact_amounts, plan_events, plan_versions, accounting_periods, report_layouts, report_layout_lines, subjects, subject_rollup_items, companies

### 仕様検討（経緯・背景）※参考
- **参照ファイル**: なし
- **設計判断に影響した経緯**: 新規機能のため該当なし

---

## INPUT整合性チェック

| チェック項目 | 確認結果 |
|-------------|---------|
| requirements.md との整合性 | 設計が全要件をカバーしている: ✅ |
| 仕様概要との整合性 | 設計が仕様概要と矛盾しない: ✅ |
| エンティティとの整合性 | Data Model がエンティティ定義に準拠: ✅ |
| 仕様検討の背景理解 | 設計判断の背景を確認した: N/A |

---

## Overview

CVP（Cost-Volume-Profit）損益分岐分析機能は、EPMの財務指標分析レポート機能の一部として提供される。本機能は1画面完結型で、フィルター選択（年度/Primary/Compare/期間/粒度/部門）、8つのKPI指標表示、損益分岐チャート、ウォーターフォールチャート、CVPツリー（シミュレーション可能）を提供する。

本設計はUI-MOCK先行アプローチを採用し、MockBffClientでUIを先行開発する。基盤テーブル（fact_amounts, plan_events等）が実装された後にBackend（Domain API / BFF）を実装し、HttpBffClientに切り替える。

---

## Architecture

### Architecture Pattern & Boundary Map

**Pattern (fixed)**:
- UI（apps/web） → BFF（apps/bff） → Domain API（apps/api） → DB（PostgreSQL + RLS）
- UI直APIは禁止

**Contracts (SSoT)**:
- UI ↔ BFF: `packages/contracts/src/bff/cvp-analysis`
- BFF ↔ Domain API: `packages/contracts/src/api/cvp-analysis`（Phase 2で定義）
- Enum/Error: `packages/contracts/src/bff/cvp-analysis`（本機能専用）
- UI は `packages/contracts/src/api` を参照してはならない

---

## Architecture Responsibilities（Mandatory）

### BFF Specification（apps/bff）

**Purpose**
- CVP分析に必要なデータを集約して返却
- fact_amountsのデータ合成（予算/見込/実績）
- KPI指標の計算
- CVPツリーの組み立て

**BFF Endpoints（UIが叩く）**
| Method | Endpoint | Purpose | Request DTO | Response DTO | Notes |
| ------ | -------- | ------- | ----------- | ------------ | ----- |
| GET | /api/bff/cvp-analysis/options | フィルター選択肢取得 | BffCvpOptionsRequest | BffCvpOptionsResponse | 年度/イベント/バージョン/部門の選択肢 |
| POST | /api/bff/cvp-analysis/data | CVP分析データ取得 | BffCvpDataRequest | BffCvpDataResponse | KPI/ツリー/グラフデータ |

**Naming Convention（必須）**
- DTO / Contracts: camelCase（例: `fiscalYear`, `primaryType`）
- DB columns: snake_case（例: `fiscal_year`, `primary_type`）
- sortBy は不使用（本機能はリスト画面ではないため）

**Paging / Sorting Normalization（必須・BFF責務）**
- 本機能はリスト画面ではないため、ページング・ソートは不使用

**Transformation Rules（api DTO → bff DTO）**
- fact_amountsのamount（DECIMAL）→ number（JavaScriptでの計算用）
- 費用系の符号正規化（負値→正値）
- 期間集計（月次→四半期/半期/年度）
- 実績+見込のデータ合成

**Error Handling（contracts errorに準拠）**

**Error Policy（必須）**
- 採用方針：**Option A: Pass-through**
- 採用理由：読み取り専用機能であり、Domain APIのエラーをそのまま返すことで十分

**Authentication / Tenant Context（tenant_id/user_id伝搬）**
- tenant_id: Clerk認証からBFFで解決し、Domain APIにヘッダーで伝搬
- user_id: 同上（可視範囲制御に使用）

---

### Service Specification（Domain / apps/api）

**Note**: Phase 2で詳細化。UI-MOCK段階ではMockBffClientで代替。

**主要な責務**（概要）
- fact_amountsからのデータ取得
- データ合成ルールの適用（見込=実績+見込）
- 権限・可視範囲の適用
- CVPレイアウトの取得

---

### Repository Specification（apps/api）

**Note**: Phase 2で詳細化。基盤テーブル実装後に定義。

**必須事項**
- tenant_id 必須（全メソッド）
- where句二重ガード必須
- set_config 前提（RLS無効化禁止）

---

### Contracts Summary（This Feature）

**BFF Contracts（packages/contracts/src/bff/cvp-analysis/index.ts）**

```typescript
// ============================================
// Enums
// ============================================

export const CvpPrimaryType = {
  BUDGET: 'BUDGET',
  FORECAST: 'FORECAST',
  ACTUAL: 'ACTUAL',
} as const;
export type CvpPrimaryType = (typeof CvpPrimaryType)[keyof typeof CvpPrimaryType];

export const CvpGranularity = {
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY',
  SEMI_ANNUAL: 'SEMI_ANNUAL',
  ANNUAL: 'ANNUAL',
} as const;
export type CvpGranularity = (typeof CvpGranularity)[keyof typeof CvpGranularity];

export const CvpLineType = {
  HEADER: 'header',
  ACCOUNT: 'account',
  NOTE: 'note',
  BLANK: 'blank',
  ADJUSTMENT: 'adjustment',
} as const;
export type CvpLineType = (typeof CvpLineType)[keyof typeof CvpLineType];

// ============================================
// Options Request/Response
// ============================================

export interface BffCvpOptionsRequest {
  companyId: string;
}

export interface BffCvpFiscalYearOption {
  fiscalYear: number;
  label: string;
}

export interface BffCvpEventOption {
  id: string;
  eventCode: string;
  eventName: string;
  scenarioType: CvpPrimaryType;
  fiscalYear: number;
  hasFixedVersion: boolean;
}

export interface BffCvpVersionOption {
  id: string;
  versionCode: string;
  versionName: string;
  versionNo: number;
  status: 'DRAFT' | 'FIXED';
}

export interface BffCvpDepartmentNode {
  id: string;
  stableId: string;
  name: string;
  code: string;
  level: number;
  hasChildren: boolean;
  children?: BffCvpDepartmentNode[];
}

export interface BffCvpOptionsResponse {
  fiscalYears: BffCvpFiscalYearOption[];
  budgetEvents: BffCvpEventOption[];
  forecastEvents: BffCvpEventOption[];
  versions: Record<string, BffCvpVersionOption[]>; // eventId -> versions
  departments: BffCvpDepartmentNode[];
  cvpLayoutId: string | null;
  cvpLayoutName: string | null;
}

// ============================================
// Data Request/Response
// ============================================

export interface BffCvpDataRequest {
  companyId: string;
  fiscalYear: number;
  primaryType: CvpPrimaryType;
  primaryEventId?: string;
  primaryVersionId?: string;
  compareEnabled: boolean;
  compareFiscalYear?: number;
  compareType?: CvpPrimaryType;
  compareEventId?: string;
  compareVersionId?: string;
  periodFrom: number; // 1-12
  periodTo: number;   // 1-12
  granularity: CvpGranularity;
  departmentStableId: string;
  includeSubDepartments: boolean;
}

// KPI
export interface BffCvpKpiItem {
  id: string;
  name: string;
  originalValue: number | null;
  simulatedValue: number | null;
  compareValue: number | null;
  unit: string;
  isCalculable: boolean;
  format: 'currency' | 'percent';
}

// CVP Tree
export interface BffCvpTreeLine {
  lineId: string;
  lineNo: number;
  lineType: CvpLineType;
  displayName: string;
  subjectId: string | null;
  indentLevel: number;
  isEditable: boolean;
  isAdjustment: boolean;
  originalValue: number | null;
  compareValue: number | null;
  parentLineId: string | null;
  childLineIds: string[];
  rollupCoefficient: number;
}

// Charts
export interface BffCvpBreakevenChartPoint {
  x: number;
  y: number;
}

export interface BffCvpBreakevenChartData {
  maxSales: number;
  salesLine: BffCvpBreakevenChartPoint[];
  totalCostLine: BffCvpBreakevenChartPoint[];
  fixedCostLine: BffCvpBreakevenChartPoint[];
  breakevenPoint: BffCvpBreakevenChartPoint | null;
  isCalculable: boolean;
}

export interface BffCvpWaterfallItem {
  id: string;
  name: string;
  value: number;
  type: 'start' | 'increase' | 'decrease' | 'subtotal' | 'end';
}

export interface BffCvpWaterfallData {
  items: BffCvpWaterfallItem[];
}

// Main Response
export interface BffCvpDataResponse {
  kpis: BffCvpKpiItem[];
  tree: BffCvpTreeLine[];
  breakevenChart: BffCvpBreakevenChartData;
  waterfallOriginal: BffCvpWaterfallData;
  waterfallCompare: BffCvpWaterfallData | null;
  layoutId: string;
  layoutName: string;
}

// ============================================
// Error Codes
// ============================================

export const CvpAnalysisErrorCode = {
  CVP_LAYOUT_NOT_SET: 'CVP_LAYOUT_NOT_SET',
  PRIMARY_NOT_SELECTED: 'PRIMARY_NOT_SELECTED',
  NO_DATA_FOUND: 'NO_DATA_FOUND',
  DEPARTMENT_NOT_FOUND: 'DEPARTMENT_NOT_FOUND',
  PERIOD_INVALID: 'PERIOD_INVALID',
  EVENT_NOT_FOUND: 'EVENT_NOT_FOUND',
  VERSION_NOT_FOUND: 'VERSION_NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;

export type CvpAnalysisErrorCode = (typeof CvpAnalysisErrorCode)[keyof typeof CvpAnalysisErrorCode];

export interface BffCvpAnalysisError {
  code: CvpAnalysisErrorCode;
  message: string;
  details?: Record<string, unknown>;
}
```

---

## Responsibility Clarification（Mandatory）

本Featureにおける責務境界を以下に明記する。
未記載の責務は実装してはならない。

### UIの責務
- フィルター選択UI（年度/Primary/Compare/期間/粒度/部門）
- KPIカードの表示（8指標）
- 損益分岐チャートの描画
- ウォーターフォールチャートの描画
- CVPツリーの表示
- **シミュレーション計算（UI内のみ）**
- シミュレーション値の管理（React state）
- 変更行のハイライト表示
- 全体リセット機能
- エラーメッセージ表示

### BFFの責務
- フィルター選択肢の取得・集約
- fact_amountsのデータ取得
- データ合成（見込=実績+見込）
- **KPI指標の初期値計算**
- CVPツリーデータの組み立て
- チャート用データの生成

### Domain APIの責務
- fact_amountsのクエリ
- plan_events/versionsのクエリ
- accounting_periodsの締め状態判定
- report_layouts/linesのクエリ
- 権限・可視範囲の適用

---

## Data Model（エンティティ整合性確認必須）

### Entity Reference
- 参照元: `.kiro/specs/entities/01_各種マスタ.md`, `.kiro/specs/entities/02_トランザクション・残高.md`

### エンティティ整合性チェックリスト

| チェック項目 | 確認結果 |
|-------------|---------|
| カラム網羅性 | エンティティ定義の全カラムがDTO/Prismaに反映されている: ✅ |
| 型の一致 | varchar→String, numeric→Decimal 等の型変換が正確: ✅ |
| 制約の反映 | UNIQUE/CHECK制約がPrisma/アプリ検証に反映: N/A（Phase 2） |
| ビジネスルール | エンティティ補足のルールがServiceに反映: N/A（Phase 2） |
| NULL許可 | NULL/NOT NULLがPrisma?/必須に正しく対応: ✅ |

### 使用エンティティ（Read Only）

本機能は読み取り専用であり、以下のエンティティを参照する：

1. **fact_amounts**: 予算/見込/実績の金額データ
2. **plan_events**: 予算/見込イベント
3. **plan_versions**: イベントのバージョン
4. **accounting_periods**: 会計期間・締め状態
5. **report_layouts**: CVPレイアウトヘッダ
6. **report_layout_lines**: CVPレイアウト行
7. **subjects**: 科目マスタ
8. **subject_rollup_items**: 科目集計定義
9. **companies**: 会社マスタ（cvp_report_layout_id）
10. **departments**: 部門マスタ

---

## UI Design

### Screen Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ CVP損益分岐分析                                                   │
├──────────────────────────────────────────────────────────────────┤
│ 年度: [▼2025]  Primary: [▼予算]  Compare: [▼なし]               │
│ イベント: [▼当初予算]  バージョン: [▼V1]                         │
├──────────────────────────────────────────────────────────────────┤
│ 期間: [▼4月] 〜 [▼3月]  表示粒度: [▼年度]                       │
├──────────────────┬───────────────────────────────────────────────┤
│ [単独/配下集約]  │  ┌─────────────────────────────────────────┐  │
│                  │  │ KPIカード（8指標）                       │  │
│ 部門ツリー       │  │ 売上 | 変動費 | 限界利益 | 限界利益率    │  │
│ ├ 全社           │  │ 固定費 | 損益分岐売上 | 安全余裕額/率   │  │
│ │├ 事業部A       │  └─────────────────────────────────────────┘  │
│ ││├ 営業1課      │  ┌─────────────────────────────────────────┐  │
│ ││└ 営業2課      │  │ 損益分岐チャート     ウォーターフォール │  │
│ │└ 事業部B       │  │                                          │  │
│ └ 管理本部       │  └─────────────────────────────────────────┘  │
│                  │  ┌─────────────────────────────────────────┐  │
│                  │  │ CVPツリー（編集可能）  [全体リセット]   │  │
│                  │  │       科目        │ 元値    │ シミュ後 │  │
│                  │  │ 売上高            │ 100,000 │ 100,000  │  │
│                  │  │ 変動費計          │  40,000 │  40,000  │  │
│                  │  │   └ 材料費        │  25,000 │  25,000  │  │
│                  │  │   └ 外注費        │  15,000 │  15,000  │  │
│                  │  │ 固定費計          │  30,000 │  30,000  │  │
│                  │  │   └ 人件費        │  20,000 │  20,000  │  │
│                  │  │   └ 減価償却費    │  10,000 │  10,000  │  │
│                  │  └─────────────────────────────────────────┘  │
└──────────────────┴───────────────────────────────────────────────┘
```

### Component Structure

```
apps/web/src/features/report/cvp-analysis/
├── api/
│   ├── BffClient.ts          # Interface
│   ├── MockBffClient.ts      # Phase 1
│   └── HttpBffClient.ts      # Phase 2
├── components/
│   ├── CvpDashboard.tsx      # Main container
│   ├── CvpFilters.tsx        # Filter controls
│   ├── CvpKpiCards.tsx       # 8 KPI cards
│   ├── CvpBreakevenChart.tsx # Break-even chart
│   ├── CvpWaterfallChart.tsx # Waterfall chart
│   ├── CvpTree.tsx           # Editable tree
│   └── DepartmentTree.tsx    # Department selector
├── hooks/
│   ├── useCvpOptions.ts      # Options fetching
│   ├── useCvpData.ts         # Data fetching
│   └── useCvpSimulation.ts   # Simulation state management
├── lib/
│   ├── cvp-calculator.ts     # KPI calculation logic
│   └── tree-utils.ts         # Tree manipulation
└── page.tsx                  # Page entry
```

---

## Simulation Logic（UI責務）

### KPI計算式
```typescript
// CVP KPI Calculator
interface CvpValues {
  revenue: number;       // 売上
  variableCost: number;  // 変動費
  fixedCost: number;     // 固定費
}

function calculateCvpKpis(values: CvpValues) {
  const { revenue, variableCost, fixedCost } = values;

  // 限界利益 = 売上 - 変動費
  const marginalProfit = revenue - variableCost;

  // 限界利益率 = 限界利益 / 売上
  const marginalProfitRate = revenue === 0 ? null : marginalProfit / revenue;

  // 損益分岐売上 = 固定費 / 限界利益率
  const breakevenRevenue =
    marginalProfitRate === null || marginalProfitRate === 0
      ? null
      : fixedCost / marginalProfitRate;

  // 安全余裕額 = 売上 - 損益分岐売上
  const safetyMargin = breakevenRevenue === null ? null : revenue - breakevenRevenue;

  // 安全余裕率 = 安全余裕額 / 売上
  const safetyMarginRate =
    safetyMargin === null || revenue === 0
      ? null
      : safetyMargin / revenue;

  return {
    revenue,
    variableCost,
    marginalProfit,
    marginalProfitRate,
    fixedCost,
    breakevenRevenue,
    safetyMargin,
    safetyMarginRate,
  };
}
```

### 調整差分行の計算
```typescript
// 集計科目を直接編集した場合
function calculateAdjustment(
  aggregateValue: number,  // 編集後の集計値
  childrenSum: number      // 配下の合計
): number {
  return aggregateValue - childrenSum;
}

// 親科目の再計算
function recalculateParent(
  childrenSum: number,
  adjustmentValue: number
): number {
  return childrenSum + adjustmentValue;
}
```

---

## Phase 1 Implementation Scope

### Included in Phase 1 (UI-MOCK)
1. BFF Contracts定義
2. MockBffClient実装
3. 全UIコンポーネント
4. シミュレーションロジック
5. structure-guards検証

### Deferred to Phase 2 (Backend)
1. Domain API実装
2. BFF実装
3. HttpBffClient切り替え
4. E2Eテスト

---

## Traceability Matrix

| Requirement | Design Section | Component |
|-------------|----------------|-----------|
| Req1: フィルター選択 | UI Design, BFF Endpoints | CvpFilters.tsx |
| Req2: 部門ツリー | UI Design | DepartmentTree.tsx |
| Req3: データ合成 | BFF Specification | BFF Service (Phase 2) |
| Req4: KPIカード | Simulation Logic | CvpKpiCards.tsx, cvp-calculator.ts |
| Req5: CVPツリー | Simulation Logic | CvpTree.tsx, tree-utils.ts |
| Req6: グラフ | UI Design | CvpBreakevenChart.tsx, CvpWaterfallChart.tsx |
| Req7: エラー | Contracts Summary | Error handling in components |
