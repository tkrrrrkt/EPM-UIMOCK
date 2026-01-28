# Design Document - ROIC分析

---

**Purpose**: UI-MOCK先行開発のため、BFFコントラクトとUI設計を中心に記述。Backend実装は基盤テーブル実装後に詳細化する。

---

## Spec Reference（INPUT情報）

本設計を作成するにあたり、以下の情報を確認した：

### Requirements（直接INPUT）
- **参照ファイル**: `.kiro/specs/reports/roic-analysis/requirements.md`
- **要件バージョン**: 2026-01-27

### 仕様概要（確定済み仕様）
- **参照ファイル**: `.kiro/specs/仕様概要/財務指標分析レポート_ROIC分析.md`
- **設計に影響する仕様ポイント**:
  - UI/選択項目はCVPと共通
  - ROICは金額ベース（NOPAT/投下資本）で算出
  - シミュレーションはUI内のみ（保存しない/リロードでリセット）
  - BSが無い会社は簡易モード（半期・通期のみ、実績のみ）
  - WACCは会社マスタ固定値、ROICスプレッドを表示
  - 11個のKPI指標

### エンティティ定義（Data Model 正本）
- **参照ファイル**: `.kiro/specs/entities/01_各種マスタ.md`, `.kiro/specs/entities/02_トランザクション・残高.md`
- **対象エンティティ**: fact_amounts, plan_events, plan_versions, accounting_periods, report_layouts, report_layout_lines, subjects, subject_rollup_items, companies, departments

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

ROIC（Return on Invested Capital）分析機能は、EPMの財務指標分析レポート機能の一部として提供される。本機能は1画面完結型で、フィルター選択（年度/Primary/Compare/期間/粒度/部門）、11のKPI指標表示、ROIC vs WACCグラフ、ROIC分解バー、ROICツリー（シミュレーション可能）を提供する。

**2つの動作モード**:
1. **標準モード**: 月次BS実績が存在する場合。全粒度・全Primary対応。
2. **簡易モード**: BS未整備の場合。半期/通期のみ、実績のみ、簡易入力パネル対応。

本設計はUI-MOCK先行アプローチを採用し、MockBffClientでUIを先行開発する。基盤テーブル（fact_amounts, plan_events等）が実装された後にBackend（Domain API / BFF）を実装し、HttpBffClientに切り替える。

---

## Architecture

### Architecture Pattern & Boundary Map

**Pattern (fixed)**:
- UI（apps/web） → BFF（apps/bff） → Domain API（apps/api） → DB（PostgreSQL + RLS）
- UI直APIは禁止

**Contracts (SSoT)**:
- UI ↔ BFF: `packages/contracts/src/bff/roic-analysis`
- BFF ↔ Domain API: `packages/contracts/src/api/roic-analysis`（Phase 2で定義）
- Enum/Error: `packages/contracts/src/bff/roic-analysis`（本機能専用）
- UI は `packages/contracts/src/api` を参照してはならない

---

## Architecture Responsibilities（Mandatory）

### BFF Specification（apps/bff）

**Purpose**
- ROIC分析に必要なデータを集約して返却
- fact_amountsのデータ合成（予算/見込/実績 + PL/BS）
- KPI指標の計算
- ROICツリーの組み立て
- モード判定（標準/簡易）

**BFF Endpoints（UIが叩く）**
| Method | Endpoint | Purpose | Request DTO | Response DTO | Notes |
| ------ | -------- | ------- | ----------- | ------------ | ----- |
| GET | /api/bff/roic-analysis/options | フィルター選択肢取得 | BffRoicOptionsRequest | BffRoicOptionsResponse | 年度/イベント/バージョン/部門/モード判定 |
| POST | /api/bff/roic-analysis/data | ROIC分析データ取得 | BffRoicDataRequest | BffRoicDataResponse | KPI/ツリー/グラフデータ |
| GET | /api/bff/roic-analysis/simple-input | 簡易入力データ取得 | BffRoicSimpleInputRequest | BffRoicSimpleInputResponse | 簡易モード用科目一覧 |
| POST | /api/bff/roic-analysis/simple-input | 簡易入力データ保存 | BffRoicSimpleInputSaveRequest | BffRoicSimpleInputSaveResponse | fact_amounts保存 |

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
- 平均投下資本の計算（標準モード: 月末残高平均、簡易モード: 半期値）
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
- fact_amountsからのPL/BSデータ取得
- データ合成ルールの適用（見込=実績+見込）
- BS予算/見込が無い場合の実績代替
- 権限・可視範囲の適用
- ROIC用レイアウトの取得
- 簡易入力データの保存（固定イベント/バージョン）

---

### Repository Specification（apps/api）

**Note**: Phase 2で詳細化。基盤テーブル実装後に定義。

**必須事項**
- tenant_id 必須（全メソッド）
- where句二重ガード必須
- set_config 前提（RLS無効化禁止）

---

### Contracts Summary（This Feature）

**BFF Contracts（packages/contracts/src/bff/roic-analysis/index.ts）**

```typescript
// ============================================
// Enums
// ============================================

export const RoicPrimaryType = {
  BUDGET: 'BUDGET',
  FORECAST: 'FORECAST',
  ACTUAL: 'ACTUAL',
} as const;
export type RoicPrimaryType = (typeof RoicPrimaryType)[keyof typeof RoicPrimaryType];

export const RoicGranularity = {
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY',
  SEMI_ANNUAL: 'SEMI_ANNUAL',
  ANNUAL: 'ANNUAL',
} as const;
export type RoicGranularity = (typeof RoicGranularity)[keyof typeof RoicGranularity];

export const RoicMode = {
  STANDARD: 'STANDARD',
  SIMPLIFIED: 'SIMPLIFIED',
} as const;
export type RoicMode = (typeof RoicMode)[keyof typeof RoicMode];

export const RoicLineType = {
  HEADER: 'header',
  ACCOUNT: 'account',
  NOTE: 'note',
  BLANK: 'blank',
  ADJUSTMENT: 'adjustment',
} as const;
export type RoicLineType = (typeof RoicLineType)[keyof typeof RoicLineType];

// ============================================
// Options Request/Response
// ============================================

export interface BffRoicOptionsRequest {
  companyId: string;
}

export interface BffRoicFiscalYearOption {
  fiscalYear: number;
  label: string;
}

export interface BffRoicEventOption {
  id: string;
  eventCode: string;
  eventName: string;
  scenarioType: RoicPrimaryType;
  fiscalYear: number;
  hasFixedVersion: boolean;
}

export interface BffRoicVersionOption {
  id: string;
  versionCode: string;
  versionName: string;
  versionNo: number;
  status: 'DRAFT' | 'FIXED';
}

export interface BffRoicDepartmentNode {
  id: string;
  stableId: string;
  name: string;
  code: string;
  level: number;
  hasChildren: boolean;
  children?: BffRoicDepartmentNode[];
}

export interface BffRoicOptionsResponse {
  mode: RoicMode;
  fiscalYears: BffRoicFiscalYearOption[];
  budgetEvents: BffRoicEventOption[];
  forecastEvents: BffRoicEventOption[];
  versions: Record<string, BffRoicVersionOption[]>; // eventId -> versions
  departments: BffRoicDepartmentNode[];
  roicPlLayoutId: string | null;
  roicPlLayoutName: string | null;
  roicBsLayoutId: string | null;
  roicBsLayoutName: string | null;
  waccRate: number | null;
  effectiveTaxRate: number | null;
  isConfigComplete: boolean;
  missingConfigItems: string[];
}

// ============================================
// Data Request/Response
// ============================================

export interface BffRoicDataRequest {
  companyId: string;
  fiscalYear: number;
  primaryType: RoicPrimaryType;
  primaryEventId?: string;
  primaryVersionId?: string;
  compareEnabled: boolean;
  compareFiscalYear?: number;
  compareType?: RoicPrimaryType;
  compareEventId?: string;
  compareVersionId?: string;
  periodFrom: number; // 1-12
  periodTo: number;   // 1-12
  granularity: RoicGranularity;
  departmentStableId: string;
  includeSubDepartments: boolean;
}

// KPI Items (11 indicators)
export interface BffRoicKpiItem {
  id: string;
  name: string;
  originalValue: number | null;
  simulatedValue: number | null;
  compareValue: number | null;
  unit: string;
  isCalculable: boolean;
  format: 'currency' | 'percent' | 'rate';
  displayPriority: number; // 1=Top tier, 2=Middle, 3=Bottom
}

// ROIC Tree
export interface BffRoicTreeLine {
  lineId: string;
  lineNo: number;
  lineType: RoicLineType;
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
  section: 'roic' | 'nopat' | 'invested_capital' | 'decomposition';
}

// Charts
export interface BffRoicChartPoint {
  period: string;
  label: string;
  roicOriginal: number | null;
  roicSimulated: number | null;
  roicCompare: number | null;
  wacc: number | null;
}

export interface BffRoicVsWaccChartData {
  points: BffRoicChartPoint[];
  isSinglePoint: boolean;
  waccRate: number | null;
}

export interface BffRoicDecompositionBar {
  nopatRate: number | null;
  capitalTurnover: number | null;
  roic: number | null;
}

export interface BffRoicDecompositionChartData {
  original: BffRoicDecompositionBar;
  simulated: BffRoicDecompositionBar;
  compare: BffRoicDecompositionBar | null;
}

// Warnings
export interface BffRoicWarning {
  code: string;
  message: string;
}

// Main Response
export interface BffRoicDataResponse {
  mode: RoicMode;
  kpis: BffRoicKpiItem[];
  tree: BffRoicTreeLine[];
  roicVsWaccChart: BffRoicVsWaccChartData;
  decompositionChart: BffRoicDecompositionChartData;
  warnings: BffRoicWarning[];
  bsSubstitutedWithActual: boolean;
}

// ============================================
// Simple Input Request/Response
// ============================================

export interface BffRoicSimpleInputRequest {
  companyId: string;
  fiscalYear: number;
  departmentStableId: string;
}

export interface BffRoicSimpleInputLine {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  indentLevel: number;
  isEditable: boolean; // only BASE + posting_allowed
  isAggregate: boolean;
  parentSubjectId: string | null;
  h1Value: number | null; // period_no=6
  h2Value: number | null; // period_no=12
  annualValue: number | null; // average of h1+h2
}

export interface BffRoicSimpleInputResponse {
  operatingAssets: BffRoicSimpleInputLine[];
  operatingLiabilities: BffRoicSimpleInputLine[];
  eventId: string | null; // null if not yet created
  versionId: string | null;
}

export interface BffRoicSimpleInputSaveItem {
  subjectId: string;
  h1Value: number | null;
  h2Value: number | null;
}

export interface BffRoicSimpleInputSaveRequest {
  companyId: string;
  fiscalYear: number;
  departmentStableId: string;
  operatingAssets: BffRoicSimpleInputSaveItem[];
  operatingLiabilities: BffRoicSimpleInputSaveItem[];
}

export interface BffRoicSimpleInputSaveResponse {
  success: boolean;
  eventId: string;
  versionId: string;
}

// ============================================
// Error Codes
// ============================================

export const RoicAnalysisErrorCode = {
  ROIC_CONFIG_NOT_SET: 'ROIC_CONFIG_NOT_SET',
  PRIMARY_NOT_SELECTED: 'PRIMARY_NOT_SELECTED',
  NO_DATA_FOUND: 'NO_DATA_FOUND',
  NO_BS_DATA: 'NO_BS_DATA',
  DEPARTMENT_NOT_FOUND: 'DEPARTMENT_NOT_FOUND',
  PERIOD_INVALID: 'PERIOD_INVALID',
  EVENT_NOT_FOUND: 'EVENT_NOT_FOUND',
  VERSION_NOT_FOUND: 'VERSION_NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SIMPLE_INPUT_NOT_ALLOWED: 'SIMPLE_INPUT_NOT_ALLOWED',
  NO_SIMPLE_INPUT_SUBJECTS: 'NO_SIMPLE_INPUT_SUBJECTS',
} as const;

export type RoicAnalysisErrorCode = (typeof RoicAnalysisErrorCode)[keyof typeof RoicAnalysisErrorCode];

export interface BffRoicAnalysisError {
  code: RoicAnalysisErrorCode;
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
- モード表示（標準/簡易）
- KPIカードの表示（11指標）
- ROIC vs WACCグラフの描画
- ROIC分解バーの描画
- ROICツリーの表示
- **シミュレーション計算（UI内のみ）**
- シミュレーション値の管理（React state）
- 変更行のハイライト表示
- 全体リセット機能
- 簡易入力パネルの表示/入力/保存呼び出し
- エラーメッセージ・警告バナー表示

### BFFの責務
- フィルター選択肢の取得・集約
- **モード判定（標準/簡易）**
- fact_amountsのデータ取得（PL/BS）
- データ合成（見込=実績+見込）
- BS予算/見込の実績代替判定
- **KPI指標の初期値計算**
- ROICツリーデータの組み立て
- チャート用データの生成
- 簡易入力データの取得・保存

### Domain APIの責務
- fact_amountsのクエリ（PL/BS）
- plan_events/versionsのクエリ
- accounting_periodsの締め状態判定
- report_layouts/linesのクエリ（ROIC用）
- 権限・可視範囲の適用
- 簡易入力用の固定イベント/バージョン管理

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

### 使用エンティティ（Read/Write）

本機能で参照・更新するエンティティ：

**Read Only**
1. **fact_amounts**: 予算/見込/実績の金額データ（PL/BS）
2. **plan_events**: 予算/見込イベント
3. **plan_versions**: イベントのバージョン
4. **accounting_periods**: 会計期間・締め状態
5. **report_layouts**: ROIC用PL/BSレイアウトヘッダ
6. **report_layout_lines**: レイアウト行
7. **subjects**: 科目マスタ
8. **subject_rollup_items**: 科目集計定義
9. **companies**: 会社マスタ（ROIC設定カラム群）
10. **departments**: 部門マスタ

**Write（簡易入力のみ）**
1. **plan_events**: 簡易入力用固定イベント（ROIC_SIMPLE_ACTUAL）の自動生成
2. **plan_versions**: 簡易入力用固定バージョン（FIXED）の自動生成
3. **fact_amounts**: 簡易入力データの保存

### 会社マスタ ROIC設定カラム

```
companies:
  roic_pl_layout_id: uuid | null        -- ROIC用PLレイアウト
  roic_bs_layout_id: uuid | null        -- ROIC用BSレイアウト
  roic_ebit_subject_id: uuid | null     -- EBIT科目
  roic_operating_assets_subject_id: uuid | null      -- 営業資産集計科目
  roic_operating_liabilities_subject_id: uuid | null -- 営業負債集計科目
  effective_tax_rate: decimal(5,4) | null -- 実効税率（0.0000〜1.0000）
  wacc_rate: decimal(5,4) | null        -- WACC（0.0000〜1.0000）
  revenue_subject_id: uuid | null       -- 売上高科目
```

---

## UI Design

### Screen Layout

```
┌──────────────────────────────────────────────────────────────────────────┐
│ ROIC分析                                               [標準モード]      │
├──────────────────────────────────────────────────────────────────────────┤
│ 年度: [▼2025]  Primary: [▼実績]  Compare: [▼予算]                      │
│ イベント: [▼当初予算]  バージョン: [▼V1]                                │
├──────────────────────────────────────────────────────────────────────────┤
│ 期間: [▼4月] 〜 [▼3月]  表示粒度: [▼年度]                              │
├──────────────────┬───────────────────────────────────────────────────────┤
│ [単独/配下集約]  │  ⚠️ BS予算が無いため、BSは実績で代替表示しています    │
│                  │  ┌─────────────────────────────────────────────────┐  │
│ 部門ツリー       │  │ KPIカード（11指標）                              │  │
│ ├ 全社           │  │ [Tier 1] ROIC | WACC | スプレッド | NOPAT        │  │
│ │├ 事業部A       │  │ [Tier 2] NOPAT率 | 回転率 | 投下資本 | EBIT     │  │
│ ││├ 営業1課      │  │ [Tier 3] 営業資産 | 営業負債 | 税率              │  │
│ ││└ 営業2課      │  └─────────────────────────────────────────────────┘  │
│ │└ 事業部B       │  ┌───────────────────┬─────────────────────────────┐  │
│ └ 管理本部       │  │ ROIC vs WACC     │ ROIC分解バー               │  │
│                  │  │                   │                             │  │
│ [簡易入力]       │  │  ━━ ROIC(シミュ)  │ [NOPAT率][回転率] = ROIC   │  │
│ (簡易モード時)   │  │  ── ROIC(元値)    │                             │  │
│                  │  │  ‥‥ WACC         │                             │  │
│                  │  └───────────────────┴─────────────────────────────┘  │
│                  │  ┌─────────────────────────────────────────────────┐  │
│                  │  │ ROICツリー（編集可能）         [全体リセット]   │  │
│                  │  │                                                  │  │
│                  │  │    科目            │ 元値     │ シミュ後        │  │
│                  │  │ ROIC               │ 8.5%     │ 8.5%            │  │
│                  │  │ ├ NOPAT            │ 85,000   │ 85,000          │  │
│                  │  │ │├ EBIT            │ 100,000  │ 100,000         │  │
│                  │  │ │└ (1-税率)        │ 0.85     │ 0.85            │  │
│                  │  │ └ 投下資本         │ 1,000,000│ 1,000,000       │  │
│                  │  │   ├ 営業資産       │ 1,500,000│ 1,500,000       │  │
│                  │  │   └ 営業負債       │ 500,000  │ 500,000         │  │
│                  │  │────────────────────────────────────────────────│  │
│                  │  │ [分解表示]                                      │  │
│                  │  │ NOPAT率 = NOPAT/売上高     │ 8.5%   │ 8.5%     │  │
│                  │  │ 回転率 = 売上高/投下資本   │ 1.0回  │ 1.0回    │  │
│                  │  └─────────────────────────────────────────────────┘  │
└──────────────────┴───────────────────────────────────────────────────────┘
```

### Simplified Mode Layout

```
┌──────────────────────────────────────────────────────────────────────────┐
│ ROIC分析                                               [簡易モード]      │
├──────────────────────────────────────────────────────────────────────────┤
│ 年度: [▼2025]  Primary: [▼実績] (固定)  Compare: [▼なし]               │
├──────────────────────────────────────────────────────────────────────────┤
│ 期間: 通期 (固定)  表示粒度: [▼半期/▼年度]                             │
├──────────────────┬───────────────────────────────────────────────────────┤
│ [単独/配下集約]  │                                                        │
│                  │  [... Same as Standard Mode ...]                      │
│ 部門ツリー       │                                                        │
│                  │                                                        │
│ [簡易入力]       │                                                        │
│  └─ Click to    │                                                        │
│     open panel  │                                                        │
└──────────────────┴───────────────────────────────────────────────────────┘

                    ┌─────────────────────────────────────────────────────┐
                    │ 簡易入力パネル（スライドイン）             [×]     │
                    ├─────────────────────────────────────────────────────┤
                    │ 2025年度 営業資産・営業負債                          │
                    │                                                      │
                    │ 科目                │ 上期(H1) │ 下期(H2) │ 通期   │
                    │────────────────────────────────────────────────────│
                    │ 営業資産計 (見出し)  │ 500,000  │ 550,000  │ 525,000│
                    │  └ 売掛金           │ [入力]   │ [入力]   │ (平均) │
                    │  └ 棚卸資産         │ [入力]   │ [入力]   │ (平均) │
                    │  └ 前払費用         │ [入力]   │ [入力]   │ (平均) │
                    │────────────────────────────────────────────────────│
                    │ 営業負債計 (見出し)  │ 200,000  │ 220,000  │ 210,000│
                    │  └ 買掛金           │ [入力]   │ [入力]   │ (平均) │
                    │  └ 未払費用         │ [入力]   │ [入力]   │ (平均) │
                    │────────────────────────────────────────────────────│
                    │                                         [保存]     │
                    └─────────────────────────────────────────────────────┘
```

### Component Structure

```
apps/web/src/features/report/roic-analysis/
├── api/
│   ├── BffClient.ts          # Interface
│   ├── MockBffClient.ts      # Phase 1
│   └── HttpBffClient.ts      # Phase 2
├── components/
│   ├── RoicDashboard.tsx     # Main container
│   ├── RoicFilters.tsx       # Filter controls (with mode awareness)
│   ├── RoicKpiCards.tsx      # 11 KPI cards (3 tiers)
│   ├── RoicVsWaccChart.tsx   # ROIC vs WACC chart
│   ├── RoicDecompositionBar.tsx # ROIC decomposition visualization
│   ├── RoicTree.tsx          # Editable ROIC tree
│   ├── DepartmentTree.tsx    # Department selector (shared with CVP)
│   ├── SimpleInputPanel.tsx  # Simplified mode input panel
│   ├── WarningBanner.tsx     # BS substitution warning
│   └── ConfigErrorBlock.tsx  # Configuration error display
├── hooks/
│   ├── useRoicOptions.ts     # Options fetching
│   ├── useRoicData.ts        # Data fetching
│   ├── useRoicSimulation.ts  # Simulation state management
│   └── useSimpleInput.ts     # Simple input panel state
├── lib/
│   ├── roic-calculator.ts    # ROIC/KPI calculation logic
│   └── tree-utils.ts         # Tree manipulation
└── page.tsx                  # Page entry
```

---

## Simulation Logic（UI責務）

### KPI計算式

```typescript
// ROIC KPI Calculator
interface RoicValues {
  ebit: number;           // EBIT（利払前・税引前利益）
  effectiveTaxRate: number; // 実効税率（0.0〜1.0）
  revenue: number;        // 売上高
  operatingAssets: number; // 営業資産
  operatingLiabilities: number; // 営業負債
  waccRate: number | null; // WACC（0.0〜1.0）
}

function calculateRoicKpis(values: RoicValues) {
  const {
    ebit,
    effectiveTaxRate,
    revenue,
    operatingAssets,
    operatingLiabilities,
    waccRate,
  } = values;

  // NOPAT = EBIT × (1 - 実効税率)
  const nopat = ebit * (1 - effectiveTaxRate);

  // 投下資本 = 営業資産 - 営業負債
  const investedCapital = operatingAssets - operatingLiabilities;

  // ROIC = NOPAT / 投下資本
  const roic = investedCapital === 0 ? null : nopat / investedCapital;

  // NOPAT率 = NOPAT / 売上高
  const nopatRate = revenue === 0 ? null : nopat / revenue;

  // 資本回転率 = 売上高 / 投下資本
  const capitalTurnover = investedCapital === 0 ? null : revenue / investedCapital;

  // ROICスプレッド = ROIC - WACC
  const roicSpread =
    roic === null || waccRate === null ? null : roic - waccRate;

  return {
    roic,
    nopat,
    ebit,
    effectiveTaxRate,
    investedCapital,
    operatingAssets,
    operatingLiabilities,
    nopatRate,
    capitalTurnover,
    waccRate,
    roicSpread,
  };
}
```

### 調整差分行の計算（CVPと共通）

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

### 平均投下資本の計算

```typescript
// 標準モード: 月末残高の平均
function calculateAverageInvestedCapital(
  monthlyBalances: { periodNo: number; amount: number }[],
  periodFrom: number,
  periodTo: number
): number {
  const relevantBalances = monthlyBalances.filter(
    (b) => b.periodNo >= periodFrom && b.periodNo <= periodTo
  );
  if (relevantBalances.length === 0) return 0;
  const sum = relevantBalances.reduce((acc, b) => acc + b.amount, 0);
  return sum / relevantBalances.length;
}

// 簡易モード: 半期値をそのまま使用
function getSimplifiedInvestedCapital(
  h1Value: number | null,
  h2Value: number | null,
  granularity: 'SEMI_ANNUAL' | 'ANNUAL',
  period: 'H1' | 'H2' | 'ANNUAL'
): number | null {
  if (granularity === 'ANNUAL') {
    // 通期 = 上期・下期の平均
    if (h1Value === null || h2Value === null) return null;
    return (h1Value + h2Value) / 2;
  }
  return period === 'H1' ? h1Value : h2Value;
}
```

---

## Phase 1 Implementation Scope

### Included in Phase 1 (UI-MOCK)
1. BFF Contracts定義
2. MockBffClient実装
3. 全UIコンポーネント
4. シミュレーションロジック
5. 簡易入力パネル（保存はMock）
6. structure-guards検証

### Deferred to Phase 2 (Backend)
1. Domain API実装
2. BFF実装
3. HttpBffClient切り替え
4. 簡易入力の実際の保存
5. E2Eテスト

---

## Traceability Matrix

| Requirement | Design Section | Component |
|-------------|----------------|-----------|
| Req1: フィルター選択 | UI Design, BFF Endpoints | RoicFilters.tsx |
| Req2: 部門ツリー | UI Design | DepartmentTree.tsx |
| Req3: モード判定 | BFF Specification, Contracts | useRoicOptions.ts |
| Req4: 簡易入力 | UI Design, Contracts | SimpleInputPanel.tsx |
| Req5: データ合成 | BFF Specification | BFF Service (Phase 2) |
| Req6: KPIカード | Simulation Logic | RoicKpiCards.tsx, roic-calculator.ts |
| Req7: ROICツリー | Simulation Logic | RoicTree.tsx, tree-utils.ts |
| Req8: グラフ | UI Design | RoicVsWaccChart.tsx, RoicDecompositionBar.tsx |
| Req9: エラー | Contracts Summary | ConfigErrorBlock.tsx, WarningBanner.tsx |

---

## 変更履歴

| 日付 | 変更内容 | 担当 |
|------|---------|------|
| 2026-01-27 | 初版作成 | Claude Code |
