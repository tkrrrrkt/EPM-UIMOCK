# レポートレイアウト設定 Design

> **ステータス**: 設計完了（承認待ち）
> **作成日**: 2026-01-27
> **スコープ**: A4（レポートレイアウト設定）

---

## Spec Reference（INPUT情報）

本設計を作成するにあたり、以下の情報を確認した：

### Requirements（直接INPUT）
- **参照ファイル**: `.kiro/specs/meetings/meeting-report-layout/requirements.md`
- **要件バージョン**: 2026-01-27

### 仕様概要（確定済み仕様）
- **参照ファイル**: `.kiro/specs/仕様概要/経営会議レポート機能.md`
- **設計に影響する仕様ポイント**:
  - レポートレイアウト（レイアウト・ページ・コンポーネント）の3階層構造
  - 9種類のコンポーネントタイプ（KPI_CARD/TABLE/CHART等）
  - ページタイプ（FIXED/PER_DEPARTMENT/PER_BU）による展開制御
  - config_json によるコンポーネント固有設定

### エンティティ定義（Data Model 正本）
- **参照ファイル**: `.kiro/specs/仕様検討/20260115_経営会議レポート機能.md`
- **対象エンティティ**: meeting_report_layouts（5.5）、meeting_report_pages（5.6）、meeting_report_components（5.7）

### 仕様検討（経緯・背景）
- **参照ファイル**: `.kiro/specs/仕様検討/20260115_経営会議レポート機能.md`
- **設計判断に影響した経緯**:
  - A3（INPUT側）と A4（OUTPUT側）の明確な分離方針
  - config_json の詳細仕様は「今後の検討事項」から本Specで確定

---

## INPUT整合性チェック

| チェック項目 | 確認結果 |
|-------------|---------|
| requirements.md との整合性 | 設計が全要件（FR-1〜FR-21）をカバーしている: ✅ |
| 仕様概要との整合性 | 設計が仕様概要と矛盾しない: ✅ |
| エンティティとの整合性 | Data Model がエンティティ定義に準拠: ✅ |
| 仕様検討の背景理解 | 設計判断の背景を確認した: ✅ |

---

## Overview

レポートレイアウト設定（A4）は、会議種別ごとに経営層が閲覧する「レポート」の表示構成を定義する管理画面である。

3階層構造で管理：
- **レイアウト**: レポート全体の構成（1会議種別に複数可、デフォルトは1つ）
- **ページ**: タブとして表示される単位（FIXED/PER_DEPARTMENT/PER_BU）
- **コンポーネント**: 表・グラフ・カード等の表示要素（config_jsonで詳細設定）

ドラッグ＆ドロップによる並べ替え機能を提供し、直感的なレイアウト編集を可能にする。

---

## Architecture

### Architecture Pattern & Boundary Map

**Pattern (fixed)**:
- UI（apps/web） → BFF（apps/bff） → Domain API（apps/api） → DB（PostgreSQL + RLS）
- UI直APIは禁止

**Contracts (SSoT)**:
- UI ↔ BFF: `packages/contracts/src/bff/meetings/`
- BFF ↔ Domain API: `packages/contracts/src/api/meetings/`（将来）
- Enum/Error: `packages/contracts/src/shared/enums/meetings/`
- UI は `packages/contracts/src/api` を参照してはならない

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              UI Layer                                    │
│  apps/web/src/features/meetings/meeting-report-layout/                  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ LayoutSettingsPage                                                │   │
│  │ レポートレイアウト設定画面                                        │   │
│  │                                                                   │   │
│  │ ┌─────────────────┐  ┌────────────────────────────────────────┐ │   │
│  │ │ LayoutTree      │  │ DetailPanel                            │ │   │
│  │ │ レイアウト      │  │ レイアウト/ページ/コンポーネント詳細   │ │   │
│  │ │  └─ ページ      │  │                                        │ │   │
│  │ │     └─ コンポ   │  │ ┌────────────────────────────────────┐ │ │   │
│  │ │ (DnD対応)       │  │ │ ComponentConfigPanel               │ │ │   │
│  │ │                 │  │ │ コンポーネントタイプ別設定UI       │ │ │   │
│  │ └─────────────────┘  │ └────────────────────────────────────┘ │ │   │
│  │                      └────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────┬────────────────────────┘   │
│                                             │                            │
│                                       BffClient                          │
│                                             │                            │
└─────────────────────────────────────────────┼────────────────────────────┘
                                              │ HTTP (JSON)
                                              │ /api/bff/meetings/report-layout-*
┌─────────────────────────────────────────────┼────────────────────────────┐
│                                        BFF Layer                         │
│  apps/bff/src/modules/meetings/management-meeting-report/               │
│                                                                          │
│  ManagementMeetingReportController                                       │
│    + ReportLayouts / ReportPages / ReportComponents endpoints           │
│                                                                          │
│  ManagementMeetingReportService                                          │
│    + Layout/Page/Component CRUD                                          │
│    + SortOrder reorder                                                   │
│    + config_json validation                                              │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Architecture Responsibilities（Mandatory）

### BFF Specification（apps/bff）

**Purpose**
- UI要件に最適化した API（レイアウト・ページ・コンポーネントの CRUD + 並べ替え）
- Phase 1（UI-MOCK）では Mock Data を返却
- Phase 2 以降で Domain API 連携

**BFF Endpoints（UIが叩く）**

#### Layout Endpoints

| Method | Endpoint | Purpose | Request DTO | Response DTO |
|--------|----------|---------|-------------|--------------|
| GET | `/bff/meetings/report-layouts/:meetingTypeId` | レイアウト一覧取得 | - | ReportLayoutListDto |
| POST | `/bff/meetings/report-layouts` | レイアウト作成 | CreateReportLayoutDto | ReportLayoutDto |
| PUT | `/bff/meetings/report-layouts/:id` | レイアウト更新 | UpdateReportLayoutDto | ReportLayoutDto |
| DELETE | `/bff/meetings/report-layouts/:id` | レイアウト削除 | - | void |
| PUT | `/bff/meetings/report-layouts/reorder` | レイアウト並べ替え | ReorderLayoutsDto | ReportLayoutListDto |

#### Page Endpoints

| Method | Endpoint | Purpose | Request DTO | Response DTO |
|--------|----------|---------|-------------|--------------|
| GET | `/bff/meetings/report-pages/:layoutId` | ページ一覧取得 | - | ReportPageListDto |
| POST | `/bff/meetings/report-pages` | ページ作成 | CreateReportPageDto | ReportPageDto |
| PUT | `/bff/meetings/report-pages/:id` | ページ更新 | UpdateReportPageDto | ReportPageDto |
| DELETE | `/bff/meetings/report-pages/:id` | ページ削除 | - | void |
| PUT | `/bff/meetings/report-pages/reorder` | ページ並べ替え | ReorderPagesDto | ReportPageListDto |

#### Component Endpoints

| Method | Endpoint | Purpose | Request DTO | Response DTO |
|--------|----------|---------|-------------|--------------|
| GET | `/bff/meetings/report-components/:pageId` | コンポーネント一覧取得 | - | ReportComponentListDto |
| POST | `/bff/meetings/report-components` | コンポーネント作成 | CreateReportComponentDto | ReportComponentDto |
| PUT | `/bff/meetings/report-components/:id` | コンポーネント更新 | UpdateReportComponentDto | ReportComponentDto |
| DELETE | `/bff/meetings/report-components/:id` | コンポーネント削除 | - | void |
| PUT | `/bff/meetings/report-components/reorder` | コンポーネント並べ替え | ReorderComponentsDto | ReportComponentListDto |

#### Template Endpoint

| Method | Endpoint | Purpose | Request DTO | Response DTO |
|--------|----------|---------|-------------|--------------|
| GET | `/bff/meetings/report-layout-templates` | テンプレート一覧取得 | - | LayoutTemplateListDto |
| POST | `/bff/meetings/report-layouts/from-template` | テンプレートからレイアウト作成 | CreateLayoutFromTemplateDto | ReportLayoutDto |

**Template Storage（テンプレート保存場所）**
- **Phase 1（UI-MOCK）**: `MockBffClient` 内で「月次経営会議レイアウト」テンプレートをハードコード定義
- **Phase 2 以降**: システム管理テーブルまたは設定ファイルへの外部化を検討（スコープ外）
- テンプレートはテナント横断の共通定義として扱い、カスタムテンプレート機能は将来検討

**Naming Convention（必須）**
- DTO / Contracts: camelCase（例: `layoutCode`, `pageName`）
- DB columns: snake_case（例: `layout_code`, `page_name`）
- `sortBy` は DTO側キー を採用する

**Paging / Sorting Normalization（必須・BFF責務）**

本 Feature では一覧取得時にページングを使用しない（全件取得）。
並べ替えは sortOrder 昇順固定。

**Transformation Rules（api DTO → bff DTO）**
- Phase 1（Mock）: BFF Service 内で Mock Data を直接返却
- Phase 2 以降: Domain API レスポンスを BFF DTO に変換

**Error Policy（必須）**
- 採用方針：**Option A: Pass-through**
- 採用理由：マスタ CRUD は Domain API のエラーをそのまま返却で十分。特別な UI 整形不要。

**Authentication / Tenant Context（tenant_id/user_id伝搬）**
- tenant_id は認証 Middleware で解決し、Service に伝搬
- Phase 1（Mock）では固定 tenant_id を使用
- Domain API へは header（x-tenant-id）で伝搬

---

### Service Specification（Domain / apps/api）

**Note**: Phase 1（UI-MOCK）では BFF 内で Mock Data を返却。Domain API 実装は Phase 2 以降。

将来の Domain API 責務：
- レイアウト・ページ・コンポーネントの CRUD
- ビジネスルール検証（コード重複チェック、参照整合性、デフォルト制約）
- トランザクション境界の管理
- 監査ログ記録

---

### Repository Specification（apps/api）

**Note**: Phase 1 では未実装。Phase 2 以降で実装。

将来の Repository 責務：
- tenant_id 必須（全メソッド）
- where句二重ガード必須
- set_config 前提（RLS無効化禁止）

---

### Contracts Summary（This Feature）

**配置先**: `packages/contracts/src/bff/meetings/`

#### Enums

```typescript
// packages/contracts/src/shared/enums/meetings/ReportComponentType.ts
export type ReportComponentType =
  | 'KPI_CARD'
  | 'TABLE'
  | 'CHART'
  | 'SUBMISSION_DISPLAY'
  | 'REPORT_LINK'
  | 'ACTION_LIST'
  | 'SNAPSHOT_COMPARE'
  | 'KPI_DASHBOARD'
  | 'AP_PROGRESS';

// packages/contracts/src/shared/enums/meetings/ReportPageType.ts
export type ReportPageType =
  | 'FIXED'
  | 'PER_DEPARTMENT'
  | 'PER_BU';

// packages/contracts/src/shared/enums/meetings/ReportDataSource.ts
export type ReportDataSource =
  | 'FACT'
  | 'KPI'
  | 'SUBMISSION'
  | 'SNAPSHOT'
  | 'EXTERNAL';

// packages/contracts/src/shared/enums/meetings/ComponentWidth.ts
export type ComponentWidth =
  | 'FULL'
  | 'HALF'
  | 'THIRD';

// packages/contracts/src/shared/enums/meetings/ComponentHeight.ts
export type ComponentHeight =
  | 'AUTO'
  | 'SMALL'
  | 'MEDIUM'
  | 'LARGE';
```

#### Errors

**配置先**: `packages/contracts/src/shared/errors/meetings/`

| Error | 用途 | HTTP Status |
|-------|------|-------------|
| `ReportLayoutNotFoundError` | レイアウトが見つからない | 404 |
| `ReportLayoutDuplicateCodeError` | レイアウトコード重複 | 409 |
| `ReportLayoutDefaultDeleteError` | デフォルトレイアウト削除不可 | 422 |
| `ReportLayoutInUseError` | 使用中レイアウト削除不可 | 422 |
| `ReportPageNotFoundError` | ページが見つからない | 404 |
| `ReportPageDuplicateCodeError` | ページコード重複 | 409 |
| `ReportComponentNotFoundError` | コンポーネントが見つからない | 404 |
| `ReportComponentDuplicateCodeError` | コンポーネントコード重複 | 409 |

**Note**: Phase 1（UI-MOCK）では `MockBffClient` 内で上記エラーをシミュレート。Phase 2 以降でDomain APIエラーとして正式実装。

#### DTOs

| DTO | 用途 | 配置先 |
|-----|------|--------|
| `ReportLayoutDto` | レイアウト詳細 | bff/meetings/ |
| `ReportLayoutListDto` | レイアウト一覧 | bff/meetings/ |
| `CreateReportLayoutDto` | レイアウト作成リクエスト | bff/meetings/ |
| `UpdateReportLayoutDto` | レイアウト更新リクエスト | bff/meetings/ |
| `ReorderLayoutsDto` | レイアウト並べ替えリクエスト | bff/meetings/ |
| `ReportPageDto` | ページ詳細 | bff/meetings/ |
| `ReportPageListDto` | ページ一覧 | bff/meetings/ |
| `CreateReportPageDto` | ページ作成リクエスト | bff/meetings/ |
| `UpdateReportPageDto` | ページ更新リクエスト | bff/meetings/ |
| `ReorderPagesDto` | ページ並べ替えリクエスト | bff/meetings/ |
| `ReportComponentDto` | コンポーネント詳細 | bff/meetings/ |
| `ReportComponentListDto` | コンポーネント一覧 | bff/meetings/ |
| `CreateReportComponentDto` | コンポーネント作成リクエスト | bff/meetings/ |
| `UpdateReportComponentDto` | コンポーネント更新リクエスト | bff/meetings/ |
| `ReorderComponentsDto` | コンポーネント並べ替えリクエスト | bff/meetings/ |
| `LayoutTemplateDto` | テンプレート詳細 | bff/meetings/ |
| `LayoutTemplateListDto` | テンプレート一覧 | bff/meetings/ |
| `CreateLayoutFromTemplateDto` | テンプレートからの作成リクエスト | bff/meetings/ |

#### DTO Definitions

```typescript
// ===========================
// Layout DTOs
// ===========================

// ReportLayoutDto
export interface ReportLayoutDto {
  id: string;
  meetingTypeId: string;
  layoutCode: string;
  layoutName: string;
  description?: string;
  isDefault: boolean;
  sortOrder: number;
  isActive: boolean;
  pageCount: number; // 所属ページ数
}

// ReportLayoutListDto
export interface ReportLayoutListDto {
  items: ReportLayoutDto[];
  total: number;
}

// CreateReportLayoutDto
export interface CreateReportLayoutDto {
  meetingTypeId: string;
  layoutCode: string;
  layoutName: string;
  description?: string;
  isDefault?: boolean;
}

// UpdateReportLayoutDto
export interface UpdateReportLayoutDto {
  layoutCode?: string;
  layoutName?: string;
  description?: string;
  isDefault?: boolean;
  isActive?: boolean;
}

// ReorderLayoutsDto
export interface ReorderLayoutsDto {
  meetingTypeId: string;
  orderedIds: string[];
}

// ===========================
// Page DTOs
// ===========================

// ReportPageDto
export interface ReportPageDto {
  id: string;
  layoutId: string;
  pageCode: string;
  pageName: string;
  pageType: ReportPageType;
  expandDimensionId?: string;
  sortOrder: number;
  isActive: boolean;
  componentCount: number; // 所属コンポーネント数
}

// ReportPageListDto
export interface ReportPageListDto {
  items: ReportPageDto[];
  total: number;
}

// CreateReportPageDto
export interface CreateReportPageDto {
  layoutId: string;
  pageCode: string;
  pageName: string;
  pageType: ReportPageType;
  expandDimensionId?: string;
}

// UpdateReportPageDto
export interface UpdateReportPageDto {
  pageCode?: string;
  pageName?: string;
  pageType?: ReportPageType;
  expandDimensionId?: string | null;
  isActive?: boolean;
}

// ReorderPagesDto
export interface ReorderPagesDto {
  layoutId: string;
  orderedIds: string[];
}

// ===========================
// Component DTOs
// ===========================

// ReportComponentDto
export interface ReportComponentDto {
  id: string;
  pageId: string;
  componentCode: string;
  componentName: string;
  componentType: ReportComponentType;
  dataSource: ReportDataSource;
  width: ComponentWidth;
  height?: ComponentHeight;
  configJson: ComponentConfig; // 型付きconfig
  sortOrder: number;
  isActive: boolean;
}

// ReportComponentListDto
export interface ReportComponentListDto {
  items: ReportComponentDto[];
  total: number;
}

// CreateReportComponentDto
export interface CreateReportComponentDto {
  pageId: string;
  componentCode: string;
  componentName: string;
  componentType: ReportComponentType;
  dataSource: ReportDataSource;
  width: ComponentWidth;
  height?: ComponentHeight;
  configJson?: Partial<ComponentConfig>;
}

// UpdateReportComponentDto
export interface UpdateReportComponentDto {
  componentCode?: string;
  componentName?: string;
  componentType?: ReportComponentType;
  dataSource?: ReportDataSource;
  width?: ComponentWidth;
  height?: ComponentHeight;
  configJson?: Partial<ComponentConfig>;
  isActive?: boolean;
}

// ReorderComponentsDto
export interface ReorderComponentsDto {
  pageId: string;
  orderedIds: string[];
}

// ===========================
// Template DTOs
// ===========================

// LayoutTemplateDto
export interface LayoutTemplateDto {
  id: string;
  templateCode: string;
  templateName: string;
  description: string;
  pageCount: number;
  componentCount: number;
}

// LayoutTemplateListDto
export interface LayoutTemplateListDto {
  items: LayoutTemplateDto[];
  total: number;
}

// CreateLayoutFromTemplateDto
export interface CreateLayoutFromTemplateDto {
  meetingTypeId: string;
  templateId: string;
  layoutCode: string;
  layoutName: string;
}
```

#### config_json Type Definitions

```typescript
// packages/contracts/src/bff/meetings/ComponentConfig.ts

// ===========================
// Base Config（全コンポーネント共通）
// ===========================
export interface BaseConfig {
  title?: string;
  showHeader?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  hideWhenEmpty?: boolean;
  emptyMessage?: string;
}

// ===========================
// KPI_CARD Config
// ===========================
export interface KpiCardConfig extends BaseConfig {
  subjectIds: string[];
  layout: 'grid' | 'list';
  columns?: 2 | 3 | 4;
  showTarget?: boolean;
  showVariance?: boolean;
  showTrend?: boolean;
  showSparkline?: boolean;
  thresholds?: {
    danger?: number;
    warning?: number;
  };
}

// ===========================
// TABLE Config
// ===========================
export interface TableConfig extends BaseConfig {
  rowAxis: 'organization' | 'subject' | 'period';
  compareMode:
    | 'BUDGET_VS_ACTUAL'
    | 'BUDGET_VS_ACTUAL_FORECAST'
    | 'YOY'
    | 'MOM';
  columns: ('budget' | 'actual' | 'forecast' | 'variance' | 'varianceRate')[];
  showTotal?: boolean;
  showSubtotal?: boolean;
  highlightVariance?: boolean;
  subjectIds?: string[];
  organizationIds?: string[];
  periods?: {
    start: string;
    end: string;
  };
}

// ===========================
// CHART Config
// ===========================
export interface ChartConfig extends BaseConfig {
  chartType: 'waterfall' | 'bar' | 'line' | 'area' | 'pie' | 'donut';
  xAxis: 'period' | 'organization' | 'subject';
  series: {
    dataKey: string;
    name: string;
    color?: string;
  }[];
  showLegend?: boolean;
  showDataLabels?: boolean;
  showGrid?: boolean;
  waterfallConfig?: {
    startLabel?: string;
    endLabel?: string;
    positiveColor?: string;
    negativeColor?: string;
    totalColor?: string;
  };
}

// ===========================
// SUBMISSION_DISPLAY Config
// ===========================
export interface SubmissionDisplayConfig extends BaseConfig {
  displayMode: 'tree' | 'flat' | 'card';
  sectionIds?: string[];
  showOrganizationHierarchy?: boolean;
  showSubmissionStatus?: boolean;
  expandByDefault?: boolean;
  groupBy?: 'section' | 'organization';
}

// ===========================
// REPORT_LINK Config
// ===========================
export interface ReportLinkConfig extends BaseConfig {
  links: {
    id: string;
    label: string;
    url: string;
    description?: string;
    icon?: string;
    category?: string;
  }[];
  layout: 'grid' | 'list';
  columns?: 2 | 3 | 4;
}

// ===========================
// ACTION_LIST Config
// ===========================
export interface ActionListConfig extends BaseConfig {
  filterStatus?: ('NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED')[];
  filterPriority?: ('HIGH' | 'MEDIUM' | 'LOW')[];
  showAssignee?: boolean;
  showDueDate?: boolean;
  showStatus?: boolean;
  allowStatusChange?: boolean;
  sortBy?: 'dueDate' | 'priority' | 'status' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// ===========================
// SNAPSHOT_COMPARE Config
// ===========================
export interface SnapshotCompareConfig extends BaseConfig {
  compareTarget: 'previous_meeting' | 'specific_snapshot';
  specificSnapshotId?: string;
  metrics: string[];
  highlightChanges?: boolean;
  thresholds?: {
    significantChange?: number;
    majorChange?: number;
  };
  showDirection?: boolean;
  showPercentage?: boolean;
}

// ===========================
// KPI_DASHBOARD Config
// ===========================
export interface KpiDashboardConfig extends BaseConfig {
  kpiDefinitionIds?: string[];
  layout: 'grid' | 'list';
  columns?: 2 | 3 | 4;
  showChart?: boolean;
  chartPeriods?: number;
  showActions?: boolean;
  filterByStatus?: ('ON_TRACK' | 'AT_RISK' | 'OFF_TRACK')[];
}

// ===========================
// AP_PROGRESS Config
// ===========================
export interface ApProgressConfig extends BaseConfig {
  actionPlanIds?: string[];
  showGantt?: boolean;
  showKanban?: boolean;
  showProgress?: boolean;
  showMilestones?: boolean;
  filterByStatus?: ('NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED')[];
  groupBy?: 'kpi' | 'assignee' | 'status';
}

// ===========================
// Union Type
// ===========================
export type ComponentConfig =
  | KpiCardConfig
  | TableConfig
  | ChartConfig
  | SubmissionDisplayConfig
  | ReportLinkConfig
  | ActionListConfig
  | SnapshotCompareConfig
  | KpiDashboardConfig
  | ApProgressConfig;

// Type Guard Functions
export function isKpiCardConfig(config: ComponentConfig): config is KpiCardConfig {
  return 'subjectIds' in config && 'layout' in config;
}

export function isTableConfig(config: ComponentConfig): config is TableConfig {
  return 'rowAxis' in config && 'compareMode' in config;
}

export function isChartConfig(config: ComponentConfig): config is ChartConfig {
  return 'chartType' in config && 'xAxis' in config;
}

// ... 他のType Guardも同様に定義
```

---

## Responsibility Clarification（Mandatory）

本 Feature における責務境界を以下に明記する。
未記載の責務は実装してはならない。

### UIの責務
- レイアウト・ページ・コンポーネントの一覧表示、詳細表示
- 階層構造のツリー表示
- フォーム入力制御・UX最適化（コンポーネントタイプ別設定UI）
- ドラッグ＆ドロップ並べ替え UI
- プレビュー表示（レイアウトの見た目確認）
- 確認ダイアログ表示（削除時）
- ビジネス判断は禁止

### BFFの責務
- UI入力の正規化（config_json の検証）
- Mock Data の提供（Phase 1）
- Domain API 呼び出しと DTO 変換（Phase 2 以降）
- ビジネスルールの正本は持たない

### Domain APIの責務（Phase 2 以降）
- ビジネスルールの正本（コード重複チェック、参照整合性、デフォルト制約）
- トランザクション管理
- カスケード削除の実行
- 監査ログ記録

---

## Data Model（エンティティ整合性確認必須）

### Entity Reference
- 参照元: `.kiro/specs/仕様検討/20260115_経営会議レポート機能.md` セクション 5.5, 5.6, 5.7

### エンティティ整合性チェックリスト

| チェック項目 | 確認結果 |
|-------------|---------|
| カラム網羅性 | エンティティ定義の全カラムがDTOに反映されている: ✅ |
| 型の一致 | varchar→string, jsonb→object 等の型変換が正確: ✅ |
| 制約の反映 | UNIQUE制約がアプリ検証に反映: ✅ |
| ビジネスルール | エンティティ補足のルールがServiceに反映: ✅ |
| NULL許可 | NULL/NOT NULLが必須/optional に正しく対応: ✅ |

### Prisma Schema（Phase 2 で追加）

```prisma
model MeetingReportLayout {
  id             String   @id @default(uuid())
  tenantId       String   @map("tenant_id")
  meetingTypeId  String   @map("meeting_type_id")
  layoutCode     String   @map("layout_code") @db.VarChar(50)
  layoutName     String   @map("layout_name") @db.VarChar(200)
  description    String?  @db.Text
  isDefault      Boolean  @map("is_default") @default(false)
  sortOrder      Int      @map("sort_order")
  isActive       Boolean  @map("is_active") @default(true)
  createdAt      DateTime @map("created_at") @default(now())
  updatedAt      DateTime @map("updated_at") @updatedAt
  createdBy      String?  @map("created_by")
  updatedBy      String?  @map("updated_by")

  meetingType    MeetingType          @relation(fields: [tenantId, meetingTypeId], references: [tenantId, id])
  pages          MeetingReportPage[]

  @@unique([tenantId, meetingTypeId, layoutCode])
  @@map("meeting_report_layouts")
}

model MeetingReportPage {
  id                 String   @id @default(uuid())
  tenantId           String   @map("tenant_id")
  layoutId           String   @map("layout_id")
  pageCode           String   @map("page_code") @db.VarChar(50)
  pageName           String   @map("page_name") @db.VarChar(200)
  pageType           String   @map("page_type") @db.VarChar(20)
  expandDimensionId  String?  @map("expand_dimension_id")
  sortOrder          Int      @map("sort_order")
  isActive           Boolean  @map("is_active") @default(true)
  createdAt          DateTime @map("created_at") @default(now())
  updatedAt          DateTime @map("updated_at") @updatedAt

  layout             MeetingReportLayout     @relation(fields: [tenantId, layoutId], references: [tenantId, id], onDelete: Cascade)
  components         MeetingReportComponent[]

  @@unique([tenantId, layoutId, pageCode])
  @@map("meeting_report_pages")
}

model MeetingReportComponent {
  id             String   @id @default(uuid())
  tenantId       String   @map("tenant_id")
  pageId         String   @map("page_id")
  componentCode  String   @map("component_code") @db.VarChar(50)
  componentName  String   @map("component_name") @db.VarChar(200)
  componentType  String   @map("component_type") @db.VarChar(30)
  dataSource     String   @map("data_source") @db.VarChar(20)
  width          String   @map("width") @db.VarChar(10) @default("FULL")
  height         String?  @map("height") @db.VarChar(10)
  configJson     Json     @map("config_json") @default("{}")
  sortOrder      Int      @map("sort_order")
  isActive       Boolean  @map("is_active") @default(true)
  createdAt      DateTime @map("created_at") @default(now())
  updatedAt      DateTime @map("updated_at") @updatedAt

  page           MeetingReportPage @relation(fields: [tenantId, pageId], references: [tenantId, id], onDelete: Cascade)

  @@unique([tenantId, pageId, componentCode])
  @@map("meeting_report_components")
}
```

### Constraints（エンティティ定義から転記）

- **meeting_report_layouts**:
  - PK: id（UUID）
  - UNIQUE: (tenant_id, meeting_type_id, layout_code)
  - FK: (tenant_id, meeting_type_id) → meeting_types
  - 制約: 同一会議種別で is_default=true は1件のみ

- **meeting_report_pages**:
  - PK: id（UUID）
  - UNIQUE: (tenant_id, layout_id, page_code)
  - FK: (tenant_id, layout_id) → meeting_report_layouts (CASCADE DELETE)
  - CHECK: page_type IN ('FIXED', 'PER_DEPARTMENT', 'PER_BU')

- **meeting_report_components**:
  - PK: id（UUID）
  - UNIQUE: (tenant_id, page_id, component_code)
  - FK: (tenant_id, page_id) → meeting_report_pages (CASCADE DELETE)
  - CHECK: component_type IN ('KPI_CARD', 'TABLE', 'CHART', 'SUBMISSION_DISPLAY', 'REPORT_LINK', 'ACTION_LIST', 'SNAPSHOT_COMPARE', 'KPI_DASHBOARD', 'AP_PROGRESS')
  - CHECK: data_source IN ('FACT', 'KPI', 'SUBMISSION', 'SNAPSHOT', 'EXTERNAL')
  - CHECK: width IN ('FULL', 'HALF', 'THIRD')

### RLS Policy
```sql
ALTER TABLE meeting_report_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_report_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_report_components ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON meeting_report_layouts
  USING (tenant_id::text = current_setting('app.tenant_id', true));

CREATE POLICY tenant_isolation ON meeting_report_pages
  USING (tenant_id::text = current_setting('app.tenant_id', true));

CREATE POLICY tenant_isolation ON meeting_report_components
  USING (tenant_id::text = current_setting('app.tenant_id', true));
```

---

## UI Implementation

### ディレクトリ構成

```
apps/web/src/features/meetings/meeting-report-layout/
├── components/
│   ├── layout-settings-page.tsx          # メインページ
│   ├── layout-tree.tsx                   # 階層構造ツリー（左ペイン）
│   ├── layout-item.tsx                   # レイアウトアイテム
│   ├── page-item.tsx                     # ページアイテム（DnD対応）
│   ├── component-item.tsx                # コンポーネントアイテム（DnD対応）
│   ├── layout-detail-panel.tsx           # レイアウト詳細（右ペイン）
│   ├── page-detail-panel.tsx             # ページ詳細（右ペイン）
│   ├── component-detail-panel.tsx        # コンポーネント詳細（右ペイン）
│   ├── component-config-panels/
│   │   ├── kpi-card-config.tsx           # KPI_CARD設定UI
│   │   ├── table-config.tsx              # TABLE設定UI
│   │   ├── chart-config.tsx              # CHART設定UI
│   │   ├── submission-display-config.tsx # SUBMISSION_DISPLAY設定UI
│   │   ├── report-link-config.tsx        # REPORT_LINK設定UI
│   │   ├── action-list-config.tsx        # ACTION_LIST設定UI
│   │   ├── snapshot-compare-config.tsx   # SNAPSHOT_COMPARE設定UI
│   │   ├── kpi-dashboard-config.tsx      # KPI_DASHBOARD設定UI
│   │   └── ap-progress-config.tsx        # AP_PROGRESS設定UI
│   ├── dialogs/
│   │   ├── create-layout-dialog.tsx
│   │   ├── create-page-dialog.tsx
│   │   ├── create-component-dialog.tsx
│   │   ├── template-select-dialog.tsx
│   │   └── delete-confirm-dialog.tsx
│   └── preview/
│       └── layout-preview.tsx            # レイアウトプレビュー
├── api/
│   ├── bff-client.ts                     # BffClient Interface
│   ├── mock-bff-client.ts                # MockBffClient
│   └── http-bff-client.ts                # HttpBffClient
├── hooks/
│   └── use-layout-settings.ts            # 階層データの状態管理
└── index.ts
```

### UIパターン適用

| 画面 | パターン | 参照 |
|------|----------|------|
| A4 | 設定パターン（2カラム構成） | A3と同様 |

### 画面レイアウト（ワイヤーフレーム）

```
┌────────────────────────────────────────────────────────────────────────────┐
│ [← 戻る] レポートレイアウト設定                              [プレビュー] │
│ 月次経営会議 のレポートレイアウトを設定してください                       │
├─────────────────────────────┬──────────────────────────────────────────────┤
│ レイアウト構造              │ 詳細設定                                     │
│                             │                                              │
│ ┌─────────────────────────┐ │ ┌──────────────────────────────────────────┐ │
│ │ 📋 月次標準レイアウト ★ │ │ │ [Card: コンポーネント設定]               │ │
│ │   ├─ 📄 サマリー (4)    │ │ │                                          │ │
│ │   │   ├─ □ 主要KPI      │ │ │ コンポーネントコード *                   │ │
│ │   │   ├─ □ ウォーター... │ │ │ [KPI_CARDS              ]               │ │
│ │   │   ├─ □ 予実対比表   │ │ │                                          │ │
│ │   │   └─ □ 差異コメント │ │ │ コンポーネント名 *                       │ │
│ │   ├─ 📄 部門報告 (1)    │ │ │ [主要KPIカード          ]               │ │
│ │   │   └─ □ 報告一覧     │ │ │                                          │ │
│ │   ├─ 📄 KPI (2)         │ │ │ コンポーネントタイプ *                   │ │
│ │   │   ├─ □ KPI一覧      │ │ │ [v] KPI_CARD                             │ │
│ │   │   └─ □ AP進捗       │ │ │                                          │ │
│ │   └─ 📄 アクション (1)  │ │ │ データソース *                           │ │
│ │       └─ □ アクション   │ │ │ [v] FACT                                 │ │
│ │                         │ │ │                                          │ │
│ │ 📋 簡易レイアウト       │ │ │ 幅 *                                     │ │
│ │   └─ ...                │ │ │ (●) FULL  ( ) HALF  ( ) THIRD           │ │
│ └─────────────────────────┘ │ │                                          │ │
│                             │ │ ────────────────────────────────         │ │
│ [+ レイアウト追加]          │ │ [KPI_CARD固有設定]                       │ │
│ [テンプレートから作成]      │ │                                          │ │
│                             │ │ 表示科目                                 │ │
│                             │ │ [売上高] [x] [営業利益] [x] ...          │ │
│                             │ │                                          │ │
│                             │ │ レイアウト                               │ │
│                             │ │ (●) グリッド  ( ) リスト                │ │
│                             │ │                                          │ │
│                             │ │ グリッド列数                             │ │
│                             │ │ ( ) 2列  (●) 3列  ( ) 4列               │ │
│                             │ │                                          │ │
│                             │ │ 表示オプション                           │ │
│                             │ │ [x] 目標値  [x] 差異  [ ] トレンド      │ │
│                             │ │                                          │ │
│                             │ │           [保存] [キャンセル] [削除]     │ │
│                             │ └──────────────────────────────────────────┘ │
└─────────────────────────────┴──────────────────────────────────────────────┘
```

### プレビュー画面（別ルート）

```
/meetings/report-layout/:meetingTypeId/preview/:layoutId
```

プレビューではモックデータを使用してレポートの見た目を確認する。

### ドラッグ＆ドロップ実装

**採用ライブラリ**: @dnd-kit/core + @dnd-kit/sortable

```typescript
// 使用例
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';

// ページ・コンポーネントの並べ替えに使用
// レイアウト間・ページ間の移動は不可（同一親内のみ）
```

---

## Requirements Traceability

| 要件ID | 要件 | 設計セクション | 実装責務 |
|--------|------|----------------|----------|
| FR-1.1-1.4 | レイアウト一覧表示 | UI layout-tree.tsx | UI |
| FR-2.1-2.6 | レイアウト追加 | BFF POST /report-layouts | BFF + UI |
| FR-3.1-3.4 | レイアウト編集 | BFF PUT /report-layouts/:id | BFF + UI |
| FR-4.1-4.5 | レイアウト削除 | BFF DELETE /report-layouts/:id | BFF + UI |
| FR-5.1-5.4 | ページ一覧表示 | UI layout-tree.tsx | UI |
| FR-6.1-6.6 | ページ追加 | BFF POST /report-pages | BFF + UI |
| FR-7.1-7.4 | ページ編集 | BFF PUT /report-pages/:id | BFF + UI |
| FR-8.1-8.4 | ページ削除 | BFF DELETE /report-pages/:id | BFF + UI |
| FR-9.1-9.3 | ページ並べ替え | BFF PUT /report-pages/reorder | BFF + UI |
| FR-10.1-10.5 | コンポーネント一覧表示 | UI layout-tree.tsx | UI |
| FR-11.1-11.6 | コンポーネント追加 | BFF POST /report-components | BFF + UI |
| FR-12.1-12.9 | コンポーネントタイプ設定 | UI component-config-panels/ | UI |
| FR-13.1-13.4 | config_json設定 | UI + ComponentConfig types | UI |
| FR-14.1-14.5 | KPI_CARD設定 | UI kpi-card-config.tsx | UI |
| FR-15.1-15.5 | TABLE設定 | UI table-config.tsx | UI |
| FR-16.1-16.4 | CHART設定 | UI chart-config.tsx | UI |
| FR-17.1-17.4 | コンポーネント編集 | BFF PUT /report-components/:id | BFF + UI |
| FR-18.1-18.3 | コンポーネント削除 | BFF DELETE /report-components/:id | BFF + UI |
| FR-19.1-19.4 | コンポーネント並べ替え | BFF PUT /report-components/reorder | BFF + UI |
| FR-20.1-20.5 | レイアウトプレビュー | UI layout-preview.tsx | UI |
| FR-21.1-21.4 | 標準テンプレート | BFF /report-layout-templates | BFF + UI |

---

## 変更履歴

| 日付 | 変更内容 |
|------|----------|
| 2026-01-27 | 初版作成 |
