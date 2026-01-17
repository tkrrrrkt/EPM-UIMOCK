# Design Document: PJ採算照会（Project Profitability Report）

---

**Purpose**: PJ単位での予算・実績・見込データを照会し、採算状況を可視化するレポート機能の技術設計

---

## Spec Reference（INPUT情報）

### Requirements（直接INPUT）
- **参照ファイル**: `.kiro/specs/reports/project-profitability/requirements.md`
- **要件バージョン**: 2026-01-16

### 仕様概要（確定済み仕様）
- **参照ファイル**: 本機能は新規検討のため仕様概要は未作成
- **設計に影響する仕様ポイント**:
  - 一覧画面（フルワイド）+ 詳細画面（別ページ）の画面構成
  - companies.xxx_subject_idによる主要科目定義

### エンティティ定義（Data Model 正本）
- **参照ファイル**: `.kiro/specs/entities/01_各種マスタ.md`
- **対象エンティティ**: projects, companies, fact_amounts, subjects

### 仕様検討（経緯・背景）※参考
- **参照ファイル**: 会話ログ（2026-01-15〜16）
- **設計判断に影響した経緯**: PJ管理ツールとは別に会計レベルでの予算実績管理に特化

---

## INPUT整合性チェック

| チェック項目 | 確認結果 |
|-------------|---------|
| requirements.md との整合性 | 設計が全要件をカバーしている: ✅ |
| 仕様概要との整合性 | 設計が仕様概要と矛盾しない: ✅ |
| エンティティとの整合性 | Data Model がエンティティ定義に準拠: ✅ |
| 仕様検討の背景理解 | 設計判断の背景を確認した: ✅ |

---

## Overview

PJ採算照会は、プロジェクト単位での予算・実績・見込データを照会し、採算状況（売上進捗・予算消化・粗利率・着地予測）を可視化するレポート機能である。

**一覧画面（フルワイド）+ 詳細画面（別ページ）**の構成を採用する。一覧画面ではPJ一覧をフルワイドのテーブルで表示し、行クリックで詳細画面（`/report/project-profitability/[id]`）へ遷移する。詳細画面では選択PJの基本情報・主要指標・KPI・月別推移を十分なスペースで表示する。主要指標（売上高・売上原価・粗利・営業利益等）は会社マスタに定義された科目IDを使用して集計する。

本機能は照会専用であり、データの入力・編集機能は持たない。

---

## Architecture

### Architecture Pattern & Boundary Map

**Pattern (fixed)**:
- UI（apps/web） → BFF（apps/bff） → Domain API（apps/api） → DB（PostgreSQL + RLS）
- UI直APIは禁止

```mermaid
graph TB
    subgraph UI
        ProjectProfitabilityPage[PJ一覧画面<br/>/report/project-profitability]
        ProjectSearchPanel[検索パネル]
        ProjectList[PJ一覧テーブル]
        ProjectDetailPage[PJ詳細画面<br/>/report/project-profitability/[id]]
    end

    subgraph BFF
        ProjectProfitabilityBFF[ProjectProfitability BFF Controller]
    end

    subgraph DomainAPI
        ProjectProfitabilityAPI[ProjectProfitability API Service]
        ProjectRepository[Project Repository]
        FactAmountRepository[FactAmount Repository]
    end

    subgraph DB
        ProjectsTable[(projects)]
        FactAmountsTable[(fact_amounts)]
        CompaniesTable[(companies)]
        SubjectsTable[(subjects)]
    end

    ProjectProfitabilityPage --> ProjectSearchPanel
    ProjectProfitabilityPage --> ProjectList
    ProjectList -->|行クリック| ProjectDetailPage
    ProjectList --> ProjectProfitabilityBFF
    ProjectDetailPage --> ProjectProfitabilityBFF
    ProjectProfitabilityBFF --> ProjectProfitabilityAPI
    ProjectProfitabilityAPI --> ProjectRepository
    ProjectProfitabilityAPI --> FactAmountRepository
    ProjectRepository --> ProjectsTable
    FactAmountRepository --> FactAmountsTable
    FactAmountRepository --> CompaniesTable
    FactAmountRepository --> SubjectsTable
```

**Contracts (SSoT)**:
- UI ↔ BFF: `packages/contracts/src/bff/project-profitability`
- BFF ↔ Domain API: `packages/contracts/src/api/project-profitability`
- Enum/Error: `packages/contracts/src/bff/project-profitability`
- UI は `packages/contracts/src/api` を参照してはならない

---

## Architecture Responsibilities（Mandatory）

### BFF Specification（apps/bff）

**Purpose**
- PJ採算照会UI向けに最適化したAPI提供
- Domain APIレスポンスの集約・変換
- ページング・フィルタリングの正規化

**BFF Endpoints（UIが叩く）**

| Method | Endpoint | Purpose | Request DTO | Response DTO | Notes |
|--------|----------|---------|-------------|--------------|-------|
| GET | /api/bff/reports/project-profitability | PJ一覧取得 | BffProjectListRequest | BffProjectListResponse | フィルター・ソート・ページング対応 |
| GET | /api/bff/reports/project-profitability/:id | PJ詳細取得 | - | BffProjectDetailResponse | 主要指標・KPI・月別推移 |
| GET | /api/bff/reports/project-profitability/filters | フィルター選択肢取得 | - | BffProjectFiltersResponse | 部門・ステータス選択肢 |

**Naming Convention（必須）**
- DTO / Contracts: camelCase（例: `projectCode`, `projectName`, `grossProfitRate`）
- DB columns: snake_case（例: `project_code`, `project_name`）
- `sortBy` は **DTO側キー**を採用する（例: `projectName | departmentName | revenueBudget | revenueProjection | grossProfitRate`）

**Paging / Sorting Normalization（必須・BFF責務）**
- UI/BFF: page / pageSize（page-based）
- Domain API: offset / limit（DB-friendly）
- BFFは必ず以下を実施する：
  - defaults: page=1, pageSize=20, sortBy=projectName, sortOrder=asc
  - clamp: pageSize <= 100
  - whitelist: sortBy は `projectName | departmentName | revenueBudget | revenueProjection | grossProfitRate` のみ
  - normalize: keyword trim、空→undefined
  - transform: offset=(page-1)*pageSize, limit=pageSize
- BFFレスポンスには page/pageSize を含める

**Transformation Rules（api DTO → bff DTO）**
- Decimal(string) → number 変換
- snake_case → camelCase 変換
- 警告フラグ（isWarning）は算出済みの値をそのまま透過

**Error Policy（必須）**
- 採用方針：**Option A: Pass-through**
- 採用理由：照会専用機能であり、Domain APIのエラーをそのまま返しても問題ない。複雑なエラー整形は不要。

**Authentication / Tenant Context**
- BFFはClerkトークンから tenant_id / user_id を解決
- Domain APIへはHTTPヘッダ（x-tenant-id, x-user-id）で伝搬
- Domain APIでRLSが有効化される

---

### Service Specification（Domain / apps/api）

**Purpose**
- PJ採算データの集計・算出（ビジネスルールの正本）
- 着地予測（実績累計 + 残期間見込）の算出
- 警告判定（粗利マイナス等）

**Domain Services**

| Service | Method | Purpose | Requirements |
|---------|--------|---------|--------------|
| ProjectProfitabilityService | listProjects | PJ一覧取得（サマリ付き） | 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8 |
| ProjectProfitabilityService | getProjectDetail | PJ詳細取得 | 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 3.1, 3.2, 3.3 |
| ProjectProfitabilityService | getMonthlyTrend | 月別推移取得 | 4.1, 4.2 |

**Business Rules（Domain APIの責務）**

1. **着地予測の算出**
   - `着地予測 = 実績累計（ACTUAL） + 残期間見込（FORECAST）`
   - 残期間 = 当期会計年度末まで（PJ終了日は考慮しない初期仕様）
   - 見込がない月は0として扱う

2. **予算差異の算出**
   - `予算差異 = 着地予測 - 予算`
   - マイナス = 予算未達、プラス = 予算超過

3. **KPI算出**
   - 売上進捗率 = 実績売上 / 予算売上 × 100
   - 予算消化率 = 実績コスト / 予算コスト × 100
   - 粗利率 = 粗利 / 売上 × 100
   - 限界利益率 = 限界利益 / 売上 × 100

4. **警告判定**
   - 着地予測粗利 < 0 → isWarning = true
   - 着地予測営業利益 < 0 → isProjectionNegative = true

**Transaction boundary**
- 照会専用のためトランザクションは読み取り専用（READ ONLY）

**Audit points**
- 照会操作はアクセスログに記録（監査対象外だが追跡可能）

---

### Repository Specification（apps/api）

**ProjectProfitabilityRepository**

| Method | Purpose | Parameters |
|--------|---------|------------|
| findProjectsWithSummary | PJ一覧取得（サマリ集計付き） | tenant_id, company_id, filters, offset, limit, sortBy, sortOrder |
| findProjectDetail | PJ詳細取得（指標集計付き） | tenant_id, company_id, project_id |
| findMonthlyAmounts | 月別金額取得 | tenant_id, company_id, project_id, subject_ids, scenario_types |

**集計クエリ例（findProjectsWithSummary）**

```sql
WITH project_amounts AS (
  SELECT
    fa.project_id,
    fa.scenario_type,
    SUM(CASE WHEN fa.subject_id = c.revenue_subject_id THEN fa.amount ELSE 0 END) as revenue,
    SUM(CASE WHEN fa.subject_id = c.gross_profit_subject_id THEN fa.amount ELSE 0 END) as gross_profit
  FROM fact_amounts fa
  JOIN companies c ON c.tenant_id = fa.tenant_id AND c.id = fa.company_id
  WHERE fa.tenant_id = $1 AND fa.company_id = $2 AND fa.project_id IS NOT NULL
  GROUP BY fa.project_id, fa.scenario_type
)
SELECT
  p.*,
  COALESCE(budget.revenue, 0) as revenue_budget,
  COALESCE(actual.revenue, 0) + COALESCE(forecast_remaining.revenue, 0) as revenue_projection,
  ...
FROM projects p
LEFT JOIN project_amounts budget ON budget.project_id = p.id AND budget.scenario_type = 'BUDGET'
LEFT JOIN project_amounts actual ON actual.project_id = p.id AND actual.scenario_type = 'ACTUAL'
...
WHERE p.tenant_id = $1 AND p.company_id = $2
```

**RLS前提**
- tenant_id 必須（全メソッド）
- where句二重ガード必須
- set_config 前提（RLS無効化禁止）

---

### Contracts Summary（This Feature）

**BFF Contracts（packages/contracts/src/bff/project-profitability/index.ts）**

```typescript
// ============================================================================
// Enums
// ============================================================================

export type ProjectStatus = 'PLANNED' | 'ACTIVE' | 'ON_HOLD' | 'CLOSED'

// ============================================================================
// Request DTOs
// ============================================================================

export interface BffProjectListRequest {
  page?: number              // default: 1
  pageSize?: number          // default: 20, max: 100
  sortBy?: 'projectName' | 'departmentName' | 'revenueBudget' | 'revenueProjection' | 'grossProfitRate'
  sortOrder?: 'asc' | 'desc'
  keyword?: string           // PJコード・PJ名部分一致
  departmentStableId?: string
  status?: ProjectStatus
}

// ============================================================================
// Response DTOs
// ============================================================================

export interface BffProjectListResponse {
  items: BffProjectSummary[]
  page: number
  pageSize: number
  totalCount: number
}

export interface BffProjectSummary {
  id: string
  projectCode: string
  projectName: string
  departmentStableId: string
  departmentName: string
  status: ProjectStatus
  revenueBudget: number         // 売上予算
  revenueProjection: number     // 売上着地予測
  grossProfitRate: number       // 粗利率（%）
  isWarning: boolean            // 警告フラグ（粗利マイナス等）
}

export interface BffProjectDetailResponse {
  // 基本情報
  id: string
  projectCode: string
  projectName: string
  projectNameShort: string | null
  departmentStableId: string
  departmentName: string
  ownerEmployeeId: string | null
  ownerEmployeeName: string | null
  startDate: string | null
  endDate: string | null
  status: ProjectStatus

  // 主要指標（全部原価計算）
  metrics: BffProjectMetrics

  // 直接原価計算指標（オプション）
  directCostingMetrics: BffDirectCostingMetrics | null

  // KPI
  kpis: BffProjectKpis

  // 警告
  isWarning: boolean
  isProjectionNegative: boolean
}

export interface BffProjectMetrics {
  // 売上高
  revenueBudget: number
  revenueActual: number
  revenueForecast: number
  revenueProjection: number    // 着地予測
  revenueVariance: number      // 予算差異

  // 売上原価
  cogsBudget: number
  cogsActual: number
  cogsForecast: number
  cogsProjection: number
  cogsVariance: number

  // 粗利
  grossProfitBudget: number
  grossProfitActual: number
  grossProfitForecast: number
  grossProfitProjection: number
  grossProfitVariance: number

  // 営業利益
  operatingProfitBudget: number
  operatingProfitActual: number
  operatingProfitForecast: number
  operatingProfitProjection: number
  operatingProfitVariance: number
}

export interface BffDirectCostingMetrics {
  // 変動費
  variableCostBudget: number
  variableCostActual: number
  variableCostProjection: number

  // 限界利益
  marginalProfitBudget: number
  marginalProfitActual: number
  marginalProfitProjection: number

  // 固定費
  fixedCostBudget: number
  fixedCostActual: number
  fixedCostProjection: number

  // 貢献利益
  contributionProfitBudget: number
  contributionProfitActual: number
  contributionProfitProjection: number
}

export interface BffProjectKpis {
  revenueProgressRate: number    // 売上進捗率（%）
  costConsumptionRate: number    // 予算消化率（%）
  grossProfitRate: number        // 粗利率（%）
  marginalProfitRate: number | null  // 限界利益率（%）※直接原価有効時のみ
}

export interface BffProjectFiltersResponse {
  departments: BffDepartmentOption[]
  statuses: BffStatusOption[]
}

export interface BffDepartmentOption {
  stableId: string
  name: string
}

export interface BffStatusOption {
  value: ProjectStatus
  label: string
}

// 月別推移
export interface BffProjectMonthlyTrendResponse {
  months: string[]  // ["2025-04", "2025-05", ...]
  revenue: BffMonthlyValues
  cogs: BffMonthlyValues
  grossProfit: BffMonthlyValues
  operatingProfit: BffMonthlyValues
}

export interface BffMonthlyValues {
  budget: number[]
  actual: number[]
  forecast: number[]
}

// ============================================================================
// Error Codes
// ============================================================================

export const ProjectProfitabilityErrorCode = {
  PROJECT_NOT_FOUND: 'PROJECT_NOT_FOUND',
  NO_DATA_FOUND: 'NO_DATA_FOUND',
  INVALID_FILTER: 'INVALID_FILTER',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
} as const

export type ProjectProfitabilityErrorCode =
  (typeof ProjectProfitabilityErrorCode)[keyof typeof ProjectProfitabilityErrorCode]

export interface ProjectProfitabilityError {
  code: ProjectProfitabilityErrorCode
  message: string
  details?: Record<string, unknown>
}
```

---

## Responsibility Clarification（Mandatory）

### UIの責務
- 一覧画面：フルワイドテーブルレイアウト、行クリックで詳細画面へ遷移
- 詳細画面：独立ページとして基本情報・指標・KPI・月別推移を表示
- フィルター・ソートのUI操作
- 警告アイコン・赤字表示の条件分岐（isWarning等のフラグに基づく）
- 月別推移テーブルの展開/折りたたみ
- ビジネス判断は禁止

### BFFの責務
- page/pageSize → offset/limit 変換
- sortBy whitelist検証
- keyword正規化（trim、空→undefined）
- api DTO → bff DTO 変換（snake_case→camelCase、Decimal→number）
- ビジネスルールの正本は持たない

### Domain APIの責務
- 着地予測・予算差異の算出（ビジネスルール）
- KPIの算出（売上進捗率・予算消化率・粗利率等）
- 警告判定（isWarning, isProjectionNegative）
- RLSによるテナント分離
- 監査ログ（アクセスログ）

---

## Data Model（エンティティ整合性確認必須）

### Entity Reference
- 参照元: `.kiro/specs/entities/01_各種マスタ.md`
- 対象: projects (4.7), companies (4.1), fact_amounts (12.1), subjects (5.1)

### エンティティ整合性チェックリスト

| チェック項目 | 確認結果 |
|-------------|---------|
| カラム網羅性 | エンティティ定義の全カラムがDTO/Prismaに反映されている: ✅ |
| 型の一致 | varchar→String, numeric→Decimal 等の型変換が正確: ✅ |
| 制約の反映 | UNIQUE/CHECK制約がPrisma/アプリ検証に反映: ✅ |
| ビジネスルール | エンティティ補足のルールがServiceに反映: ✅ |
| NULL許可 | NULL/NOT NULLがPrisma?/必須に正しく対応: ✅ |

### 使用テーブル・カラム

**projects（参照）**
- id, tenant_id, company_id, project_code, project_name, project_name_short
- project_status, start_date, end_date
- owner_department_stable_id, owner_employee_id, is_active

**companies（参照：主要科目ID）**
- revenue_subject_id, cogs_subject_id, gross_profit_subject_id, operating_profit_subject_id
- variable_cost_subject_id, marginal_profit_subject_id, fixed_cost_subject_id, contribution_profit_subject_id

**fact_amounts（集計対象）**
- tenant_id, company_id, project_id, subject_id
- scenario_type (BUDGET/ACTUAL/FORECAST), year_month, amount

### RLS Policy
```sql
-- fact_amounts, projects, companies は既存RLS有効
-- 本機能追加による新規テーブルなし
```

---

## Requirements Traceability

| Requirement | Summary | Components | Interfaces | Flows |
|-------------|---------|------------|------------|-------|
| 1.1 | PJ一覧表示 | ProjectProfitabilityPage, ProjectList | BffProjectListRequest/Response | 一覧取得フロー |
| 1.2 | サマリ情報表示 | ProjectList | BffProjectSummary | - |
| 1.3 | 部門フィルター | ProjectSearchPanel | departmentStableId filter | - |
| 1.4 | ステータスフィルター | ProjectSearchPanel | status filter | - |
| 1.5 | キーワード検索 | ProjectSearchPanel | keyword filter | - |
| 1.6 | ソート | ProjectList | sortBy/sortOrder | - |
| 1.7 | 警告アイコン | ProjectList | isWarning flag | - |
| 1.8 | ページネーション | ProjectList | page/pageSize | - |
| 2.1 | PJ詳細表示（別ページ遷移） | ProjectDetailPage | BffProjectDetailResponse | 詳細取得フロー |
| 2.2 | 基本情報表示 | ProjectDetailPanel | 基本情報フィールド | - |
| 2.3 | 主要指標サマリ | ProjectMetricsTable | BffProjectMetrics | - |
| 2.4 | 着地予測算出 | ProjectProfitabilityService | revenueProjection等 | Domain API |
| 2.5 | 予算差異算出 | ProjectProfitabilityService | revenueVariance等 | Domain API |
| 2.6 | KPI表示 | ProjectKpiCards | BffProjectKpis | - |
| 2.7 | 赤字警告 | ProjectDetailPanel | isProjectionNegative | - |
| 3.1 | 直接原価計算表示判定 | ProjectDetailPanel | directCostingMetrics | - |
| 3.2 | 直接原価指標表示 | DirectCostingMetricsTable | BffDirectCostingMetrics | - |
| 3.3 | 限界利益率表示 | ProjectKpiCards | marginalProfitRate | - |
| 4.1 | 月別推移表示 | MonthlyTrendTable | BffProjectMonthlyTrendResponse | - |
| 4.2 | テーブル形式表示 | MonthlyTrendTable | months/values配列 | - |
| 5.1-5.3 | 性能要件 | 全体 | - | インデックス最適化 |
| 6.1-6.4 | 権限制御 | 全体 | tenant_id/permission | RLS |

---

## UI Component Structure

```mermaid
graph TB
    subgraph ListPage[一覧画面 /report/project-profitability]
        ProjectProfitabilityPage
        ProjectSearchPanel[検索パネル]
        ProjectList[PJ一覧テーブル<br/>フルワイド]
    end

    subgraph DetailPage[詳細画面 /report/project-profitability/[id]]
        ProjectDetailPage
        ProjectBasicInfo[基本情報カード]
        ProjectKpiCards[KPIカード]
        ProjectMetricsTable[主要指標テーブル]
        DirectCostingMetricsTable[直接原価指標テーブル]
        MonthlyTrendTable[月別推移テーブル]
    end

    ProjectProfitabilityPage --> ProjectSearchPanel
    ProjectProfitabilityPage --> ProjectList
    ProjectList -->|行クリック| ProjectDetailPage
    ProjectDetailPage --> ProjectBasicInfo
    ProjectDetailPage --> ProjectKpiCards
    ProjectDetailPage --> ProjectMetricsTable
    ProjectDetailPage --> DirectCostingMetricsTable
    ProjectDetailPage --> MonthlyTrendTable
```

### ルーティング構成
- `/report/project-profitability` - 一覧画面（ProjectProfitabilityPage）
- `/report/project-profitability/[id]` - 詳細画面（ProjectDetailPage）

---

## Performance Considerations

### インデックス（既存確認・追加不要想定）
- fact_amounts: (tenant_id, company_id, project_id, scenario_type, year_month)
- projects: (tenant_id, company_id, is_active)

### 一覧クエリ最適化
- PJ一覧の集計は1クエリで完結（N+1回避）
- ページング（LIMIT/OFFSET）適用
- 不要なカラムは除外（SELECT最適化）

### 詳細クエリ最適化
- 主要指標・KPI・月別推移を1リクエストで取得
- 直接原価計算指標は会社設定に応じてオプション取得

---

## Change History

| 日付 | 変更内容 | 変更者 |
|------|----------|--------|
| 2026-01-16 | 初版作成 | Claude Code |
| 2026-01-16 | UI構成をSplit View形式から「一覧画面+詳細別画面」形式に変更 | Claude Code |
