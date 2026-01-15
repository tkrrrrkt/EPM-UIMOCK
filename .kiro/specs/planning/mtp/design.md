# Design Document: planning/mtp

## Spec Reference（INPUT情報）

本設計を作成するにあたり、以下の情報を確認した：

### Requirements（直接INPUT）
- **参照ファイル**: `.kiro/specs/planning/mtp/requirements.md`
- **要件バージョン**: 2026-01-11

### 仕様概要（確定済み仕様）
- **参照ファイル**: `.kiro/specs/仕様概要/中期経営計画.md`
- **設計に影響する仕様ポイント**:
  - 数値格納: fact_amounts共用（scenario_type = 'MTP'）、dimension_values単位で入力
  - 戦略テーマ: カスケード構造（全社テーマ ↔ 事業部テーマ）
  - グリッド技術: BudgetGrid相当（カスタム実装、SpreadJS不要）
  - タブ構成（詳細画面）: 入力 / 全社俯瞰 / 推移 / 戦略テーマ
  - 入力モード切替: 単一選択モード / 一括入力モード

### エンティティ定義（Data Model 正本）
- **参照ファイル**: `.kiro/specs/entities/01_各種マスタ.md`
- **対象エンティティ**: mtp_events (15.1), mtp_strategy_themes (15.2), mtp_theme_kpis (15.3)
- **参照エンティティ**: fact_amounts, dimensions, dimension_values, subjects, report_layouts

### 仕様検討（経緯・背景）※参考
- **参照ファイル**: `.kiro/specs/仕様検討/20260111_中期経営計画.md`
- **設計判断に影響した経緯**: 組織ディメンション設計、戦略テーマのカスケード構造決定

---

## INPUT整合性チェック

| チェック項目 | 確認結果 |
|-------------|---------|
| requirements.md との整合性 | 設計が全要件（1.1〜11.3）をカバーしている: ✅ |
| 仕様概要との整合性 | 設計が仕様概要と矛盾しない: ✅ |
| エンティティとの整合性 | Data Model がエンティティ定義に準拠: ✅ |
| 仕様検討の背景理解 | 設計判断の背景を確認した: ✅ |

---

## Overview

中期経営計画（MTP）機能は、3〜5年スパンの経営目標値と戦略テーマを一元管理する。本機能は予算ガイドライン・年度予算の上位概念として位置づけられ、PL科目の目標値を組織ディメンション（dimension_values）単位で入力・管理する。

主要な技術的特徴:
- **数値格納**: 既存の fact_amounts テーブルを共用（scenario_type = 'MTP'）
- **戦略テーマ**: 全社テーマ（親）↔ 事業部テーマ（子）のカスケード構造
- **UI**: 一覧画面 + 詳細画面（タブ構成: 入力 / 全社俯瞰 / 推移 / 戦略テーマ）
- **入力モード**: 単一選択モード / 一括入力モード（トグル切替）
- **グリッド**: BudgetGrid相当のカスタム実装（最大250セル程度）

---

## Architecture

### Architecture Pattern & Boundary Map

**Pattern (fixed)**:
- UI（apps/web） → BFF（apps/bff） → Domain API（apps/api） → DB（PostgreSQL + RLS）
- UI直APIは禁止

**Contracts (SSoT)**:
- UI ↔ BFF: `packages/contracts/src/bff/mtp`
- BFF ↔ Domain API: `packages/contracts/src/api/mtp`
- Enum/Error: `packages/contracts/src/shared/enums`, `packages/contracts/src/shared/errors`
- UI は `packages/contracts/src/api` を参照してはならない

**URL Structure**:
```
/planning/mtp                    # 一覧画面 (Req 1.1)
/planning/mtp/:eventId           # 詳細画面 (Req 4.1)
```

---

## Architecture Responsibilities（Mandatory）

### BFF Specification（apps/bff）

**Purpose**
- UI要件に最適化したAPI（Read Model / ViewModel）
- Domain APIのレスポンスを集約・変換（ビジネスルールの正本は持たない）
- ページング正規化（page/pageSize → offset/limit）

**BFF Endpoints（UIが叩く）**

| Method | Endpoint | Purpose | Request DTO | Response DTO | Req ID |
| ------ | -------- | ------- | ----------- | ------------ | ------ |
| GET | /api/bff/planning/mtp | イベント一覧取得 | BffListMtpEventsRequest | BffListMtpEventsResponse | 1.1-1.5 |
| GET | /api/bff/planning/mtp/:eventId | イベント詳細取得 | - | BffMtpEventDetailResponse | 4.1-4.5 |
| POST | /api/bff/planning/mtp | イベント作成 | BffCreateMtpEventRequest | BffMtpEventResponse | 2.1-2.6 |
| PUT | /api/bff/planning/mtp/:eventId | イベント更新 | BffUpdateMtpEventRequest | BffMtpEventResponse | 10.1-10.6 |
| POST | /api/bff/planning/mtp/:eventId/duplicate | イベント複製 | BffDuplicateMtpEventRequest | BffMtpEventResponse | 3.1-3.2 |
| DELETE | /api/bff/planning/mtp/:eventId | イベント削除（論理） | - | void | 3.3-3.5 |
| GET | /api/bff/planning/mtp/:eventId/amounts | 数値取得 | BffGetMtpAmountsRequest | BffMtpAmountsResponse | 5.1-5.9, 6.1-6.4 |
| PUT | /api/bff/planning/mtp/:eventId/amounts | 数値保存 | BffSaveMtpAmountsRequest | BffSaveMtpAmountsResponse | 5.7-5.8 |
| GET | /api/bff/planning/mtp/:eventId/themes | 戦略テーマ一覧取得 | - | BffListStrategyThemesResponse | 7.1-7.4 |
| POST | /api/bff/planning/mtp/:eventId/themes | 戦略テーマ作成 | BffCreateStrategyThemeRequest | BffStrategyThemeResponse | 8.1-8.6 |
| PUT | /api/bff/planning/mtp/:eventId/themes/:themeId | 戦略テーマ更新 | BffUpdateStrategyThemeRequest | BffStrategyThemeResponse | 9.1-9.2 |
| DELETE | /api/bff/planning/mtp/:eventId/themes/:themeId | 戦略テーマ削除 | - | void | 9.3-9.5 |

**Naming Convention（必須）**
- DTO / Contracts: camelCase（例: `eventCode`, `eventName`, `planYears`）
- DB columns: snake_case（例: `event_code`, `event_name`, `plan_years`）
- `sortBy` は **DTO側キー**を採用する（例: `eventCode | eventName | startFiscalYear`）
- DB列名（snake_case）を UI/BFF へ露出させない

**Paging / Sorting Normalization（必須・BFF責務）**
- UI/BFF: page / pageSize（page-based）
- Domain API: offset / limit（DB-friendly）
- BFFは必ず以下を実施する（省略禁止）：
  - defaults: page=1, pageSize=50, sortBy=eventCode, sortOrder=asc
  - clamp: pageSize <= 100
  - whitelist: sortBy は `eventCode | eventName | startFiscalYear | status | updatedAt`
  - normalize: keyword trim、空→undefined
  - transform: offset=(page-1)*pageSize, limit=pageSize
- Domain APIに渡すのは offset/limit（page/pageSizeは渡さない）
- BFFレスポンスには page/pageSize を含める（UIへ返すのはBFF側の値）

**Transformation Rules（api DTO → bff DTO）**
- イベント一覧: api.items → bff.items（フィールド名維持、snake_case→camelCase）
- 数値データ: api.amounts → bff.gridData（グリッド表示用に整形）
- 戦略テーマ: api.themes → bff.themes（ツリー構造に整形）

**Error Policy（必須・未記載禁止）**
- 採用方針：**Option A: Pass-through**
- 採用理由：MTP機能はCRUD中心で複雑なエラー整形が不要。Domain APIのエラーをそのままUIに透過することで、シンプルなエラーハンドリングを維持する

**In all cases**
- 最終拒否権限（403/404/409/422等）は Domain API が持つ

**Authentication / Tenant Context（tenant_id/user_id伝搬）**
- BFFはリクエストヘッダー（`x-tenant-id`, `x-company-id`, `Authorization`）からコンテキストを解決
- Domain API呼び出し時に同一ヘッダーを伝搬
- company_id はイベント作成時に自動設定（ユーザーのselected company）

---

### Service Specification（Domain / apps/api）

**Purpose**
- ビジネスルールの正本
- 権限・状態遷移の最終判断
- 監査ログ・整合性保証

**Domain Services**

| Service | Responsibility | Transaction Boundary |
| ------- | -------------- | -------------------- |
| MtpEventService | イベントCRUD、ステータス管理 | 各メソッド単位 |
| MtpAmountService | 数値入力・取得（fact_amounts操作） | 保存時一括 |
| StrategyThemeService | 戦略テーマCRUD、KPI紐付け | 各メソッド単位 |

**Business Rules（Domain責務）**

| Rule | Description | Req ID |
| ---- | ----------- | ------ |
| EVENT_CODE_UNIQUE | tenant_id + company_id 内でevent_codeは一意 | 2.5 |
| CONFIRMED_IMMUTABLE | status=CONFIRMEDのイベントは数値・テーマ編集不可 | 4.5, 10.4 |
| CONFIRMED_DELETE_DENIED | status=CONFIRMEDのイベントは削除不可 | 3.4 |
| CHILD_THEME_DELETE_DENIED | 子テーマが存在するテーマは削除不可 | 9.4 |
| END_YEAR_CALC | end_fiscal_year = start_fiscal_year + plan_years - 1 | 2.3 |

**Audit Points**
- イベント作成・更新・削除
- ステータス変更（DRAFT → CONFIRMED / CONFIRMED → DRAFT）
- 数値保存
- 戦略テーマ作成・更新・削除

---

### Repository Specification（apps/api）

**Repositories**

| Repository | Entity | Key Methods |
| ---------- | ------ | ----------- |
| MtpEventRepository | mtp_events | findAll, findById, create, update, softDelete |
| MtpAmountRepository | fact_amounts (scenario_type='MTP') | findByEvent, upsertBatch |
| StrategyThemeRepository | mtp_strategy_themes | findByEvent, findById, create, update, delete |
| ThemeKpiRepository | mtp_theme_kpis | findByTheme, syncKpis |

**tenant_id 必須（全メソッド）**
- すべてのRepositoryメソッドは第一引数に `tenantId: string` を受け取る
- where句二重ガード必須（アプリ層 + RLS）

**Example**:
```typescript
async findAll(tenantId: string, companyId: string, params: ListParams): Promise<MtpEvent[]> {
  return this.prisma.mtpEvent.findMany({
    where: {
      tenantId,           // アプリ層ガード
      companyId,
      isActive: true,
      ...params.filters,
    },
    orderBy: { [params.sortBy]: params.sortOrder },
    skip: params.offset,
    take: params.limit,
  });
}
```

---

### Contracts Summary（This Feature）

**BFF Contracts** (`packages/contracts/src/bff/mtp/index.ts`)

```typescript
// ============================================
// Enums
// ============================================
export const MtpEventStatus = {
  DRAFT: 'DRAFT',
  CONFIRMED: 'CONFIRMED',
} as const;
export type MtpEventStatus = (typeof MtpEventStatus)[keyof typeof MtpEventStatus];

export const PlanYears = {
  THREE: 3,
  FIVE: 5,
} as const;
export type PlanYears = (typeof PlanYears)[keyof typeof PlanYears];

// ============================================
// Event DTOs
// ============================================
export interface BffListMtpEventsRequest {
  page?: number;
  pageSize?: number;
  sortBy?: 'eventCode' | 'eventName' | 'startFiscalYear' | 'status' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  status?: MtpEventStatus;
}

export interface BffMtpEventSummary {
  id: string;
  eventCode: string;
  eventName: string;
  planYears: number;
  startFiscalYear: number;
  endFiscalYear: number;
  status: MtpEventStatus;
  updatedAt: string;
}

export interface BffListMtpEventsResponse {
  items: BffMtpEventSummary[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface BffCreateMtpEventRequest {
  eventCode: string;
  eventName: string;
  planYears: PlanYears;
  startFiscalYear: number;
  dimensionId: string;
  layoutId: string;
  description?: string;
}

export interface BffUpdateMtpEventRequest {
  eventName?: string;
  status?: MtpEventStatus;
  description?: string;
}

export interface BffDuplicateMtpEventRequest {
  newEventCode: string;
  newEventName: string;
}

export interface BffMtpEventResponse {
  id: string;
  eventCode: string;
  eventName: string;
  planYears: number;
  startFiscalYear: number;
  endFiscalYear: number;
  dimensionId: string;
  layoutId: string;
  status: MtpEventStatus;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BffMtpEventDetailResponse extends BffMtpEventResponse {
  dimensionName: string;
  layoutName: string;
  dimensionValues: BffDimensionValueSummary[];
}

export interface BffDimensionValueSummary {
  id: string;
  valueCode: string;
  valueName: string;
}

// ============================================
// Amount DTOs
// ============================================
export interface BffGetMtpAmountsRequest {
  dimensionValueId?: string;  // null = 全社合計
}

export interface BffMtpAmountCell {
  subjectId: string;
  fiscalYear: number;
  amount: string;  // Decimal as string
}

export interface BffMtpAmountsResponse {
  subjects: BffSubjectRow[];
  fiscalYears: number[];
  amounts: BffMtpAmountCell[];
  isReadOnly: boolean;  // 全社合計選択時 or CONFIRMED時
}

export interface BffSubjectRow {
  id: string;
  subjectCode: string;
  subjectName: string;
  sortOrder: number;
  isAggregate: boolean;
}

export interface BffSaveMtpAmountsRequest {
  dimensionValueId: string;
  amounts: BffMtpAmountCell[];
}

export interface BffSaveMtpAmountsResponse {
  savedCount: number;
  updatedAt: string;
}

// ============================================
// Strategy Theme DTOs
// ============================================
export interface BffStrategyThemeSummary {
  id: string;
  themeCode: string;
  themeName: string;
  parentThemeId: string | null;
  dimensionValueId: string | null;
  dimensionValueName: string | null;
  strategyCategory: string | null;
  ownerName: string | null;
  targetDate: string | null;
  kpis: BffThemeKpiSummary[];
  children: BffStrategyThemeSummary[];
}

export interface BffThemeKpiSummary {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
}

export interface BffListStrategyThemesResponse {
  themes: BffStrategyThemeSummary[];
}

export interface BffCreateStrategyThemeRequest {
  themeCode: string;
  themeName: string;
  parentThemeId?: string;
  dimensionValueId?: string;
  strategyCategory?: string;
  description?: string;
  ownerEmployeeId?: string;
  targetDate?: string;
  kpiSubjectIds?: string[];
}

export interface BffUpdateStrategyThemeRequest {
  themeName?: string;
  strategyCategory?: string;
  description?: string;
  ownerEmployeeId?: string;
  targetDate?: string;
  kpiSubjectIds?: string[];
}

export interface BffStrategyThemeResponse {
  id: string;
  themeCode: string;
  themeName: string;
  parentThemeId: string | null;
  dimensionValueId: string | null;
  strategyCategory: string | null;
  description: string | null;
  ownerEmployeeId: string | null;
  ownerName: string | null;
  targetDate: string | null;
  kpis: BffThemeKpiSummary[];
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Error Types
// ============================================
export const MtpErrorCode = {
  EVENT_NOT_FOUND: 'MTP_EVENT_NOT_FOUND',
  EVENT_CODE_DUPLICATE: 'MTP_EVENT_CODE_DUPLICATE',
  EVENT_CONFIRMED_IMMUTABLE: 'MTP_EVENT_CONFIRMED_IMMUTABLE',
  EVENT_CONFIRMED_DELETE_DENIED: 'MTP_EVENT_CONFIRMED_DELETE_DENIED',
  THEME_NOT_FOUND: 'MTP_THEME_NOT_FOUND',
  THEME_CODE_DUPLICATE: 'MTP_THEME_CODE_DUPLICATE',
  THEME_HAS_CHILDREN: 'MTP_THEME_HAS_CHILDREN',
  DIMENSION_NOT_FOUND: 'MTP_DIMENSION_NOT_FOUND',
  LAYOUT_NOT_FOUND: 'MTP_LAYOUT_NOT_FOUND',
  DIMENSION_VALUE_REQUIRED: 'MTP_DIMENSION_VALUE_REQUIRED',
  VALIDATION_ERROR: 'MTP_VALIDATION_ERROR',
} as const;

export type MtpErrorCode = (typeof MtpErrorCode)[keyof typeof MtpErrorCode];

export interface MtpError {
  code: MtpErrorCode;
  message: string;
  details?: Record<string, unknown>;
}
```

---

## Responsibility Clarification（Mandatory）

本Featureにおける責務境界を以下に明記する。
未記載の責務は実装してはならない。

### UIの責務
- 一覧画面: テーブル表示、フィルター/ソートUI、行クリック遷移
- 詳細画面: 左右スプリットレイアウト、グリッドUI、テーマツリー表示
- グリッド操作: セル編集、キーボードナビゲーション、デバウンス自動保存
- ダイアログ: イベント作成/複製、テーマ作成/編集
- 表示制御: CONFIRMED時のreadOnly化、全社選択時のreadOnly化
- ビジネス判断は禁止

### BFFの責務
- UI入力の正規化（paging / sorting / filtering）
- Domain API DTO ⇄ UI DTO の変換
- 戦略テーマのツリー構造整形（フラット → 階層）
- 数値データのグリッド表示用整形
- ビジネスルールの正本は持たない

### Domain APIの責務
- ビジネスルールの正本（一意制約、状態遷移制御）
- 権限・状態遷移の最終判断（CONFIRMED不変性など）
- 監査ログ・整合性保証
- RLSによるテナント分離

---

## Data Model（エンティティ整合性確認必須）

### Entity Reference
- 参照元: `.kiro/specs/entities/01_各種マスタ.md` セクション 15.1, 15.2, 15.3

### エンティティ整合性チェックリスト

| チェック項目 | 確認結果 |
|-------------|---------|
| カラム網羅性 | エンティティ定義の全カラムがDTO/Prismaに反映されている: ✅ |
| 型の一致 | varchar→String, numeric→Decimal 等の型変換が正確: ✅ |
| 制約の反映 | UNIQUE/CHECK制約がPrisma/アプリ検証に反映: ✅ |
| ビジネスルール | エンティティ補足のルールがServiceに反映: ✅ |
| NULL許可 | NULL/NOT NULLがPrisma?/必須に正しく対応: ✅ |

### Prisma Schema

```prisma
model MtpEvent {
  id               String   @id @default(uuid())
  tenantId         String   @map("tenant_id")
  companyId        String   @map("company_id")
  eventCode        String   @map("event_code")
  eventName        String   @map("event_name")
  planYears        Int      @map("plan_years")
  startFiscalYear  Int      @map("start_fiscal_year")
  endFiscalYear    Int      @map("end_fiscal_year")
  dimensionId      String   @map("dimension_id")
  layoutId         String   @map("layout_id")
  status           String   @default("DRAFT")
  description      String?
  isActive         Boolean  @default(true) @map("is_active")
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")
  createdBy        String   @map("created_by")
  updatedBy        String   @map("updated_by")

  themes           MtpStrategyTheme[]
  dimension        Dimension @relation(fields: [dimensionId], references: [id])
  layout           ReportLayout @relation(fields: [layoutId], references: [id])
  company          Company @relation(fields: [companyId], references: [id])

  @@unique([tenantId, companyId, eventCode])
  @@map("mtp_events")
}

model MtpStrategyTheme {
  id               String   @id @default(uuid())
  tenantId         String   @map("tenant_id")
  mtpEventId       String   @map("mtp_event_id")
  parentThemeId    String?  @map("parent_theme_id")
  dimensionValueId String?  @map("dimension_value_id")
  themeCode        String   @map("theme_code")
  themeName        String   @map("theme_name")
  strategyCategory String?  @map("strategy_category")
  description      String?
  ownerEmployeeId  String?  @map("owner_employee_id")
  targetDate       DateTime? @map("target_date")
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")
  createdBy        String   @map("created_by")
  updatedBy        String   @map("updated_by")

  event            MtpEvent @relation(fields: [mtpEventId], references: [id])
  parentTheme      MtpStrategyTheme? @relation("ThemeHierarchy", fields: [parentThemeId], references: [id])
  childThemes      MtpStrategyTheme[] @relation("ThemeHierarchy")
  dimensionValue   DimensionValue? @relation(fields: [dimensionValueId], references: [id])
  ownerEmployee    Employee? @relation(fields: [ownerEmployeeId], references: [id])
  kpis             MtpThemeKpi[]

  @@unique([tenantId, mtpEventId, themeCode])
  @@map("mtp_strategy_themes")
}

model MtpThemeKpi {
  id               String   @id @default(uuid())
  tenantId         String   @map("tenant_id")
  strategyThemeId  String   @map("strategy_theme_id")
  subjectId        String   @map("subject_id")
  sortOrder        Int      @default(0) @map("sort_order")
  createdAt        DateTime @default(now()) @map("created_at")

  theme            MtpStrategyTheme @relation(fields: [strategyThemeId], references: [id], onDelete: Cascade)
  subject          Subject @relation(fields: [subjectId], references: [id])

  @@unique([tenantId, strategyThemeId, subjectId])
  @@map("mtp_theme_kpis")
}
```

### Constraints（エンティティ定義から転記）
- PK: id（UUID）
- UNIQUE(mtp_events): tenant_id, company_id, event_code
- UNIQUE(mtp_strategy_themes): tenant_id, mtp_event_id, theme_code
- UNIQUE(mtp_theme_kpis): tenant_id, strategy_theme_id, subject_id
- CHECK: plan_years IN (3, 5)（アプリケーション層で検証）
- CHECK: status IN ('DRAFT', 'CONFIRMED')（アプリケーション層で検証）

### RLS Policy

```sql
ALTER TABLE mtp_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON mtp_events
  USING (tenant_id::text = current_setting('app.tenant_id', true));

ALTER TABLE mtp_strategy_themes ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON mtp_strategy_themes
  USING (tenant_id::text = current_setting('app.tenant_id', true));

ALTER TABLE mtp_theme_kpis ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON mtp_theme_kpis
  USING (tenant_id::text = current_setting('app.tenant_id', true));
```

---

## Requirements Traceability

| Req ID | Design Coverage |
| ------ | --------------- |
| 1.1-1.5 | BFF: GET /api/bff/planning/mtp, UI: MtpEventListPage |
| 2.1-2.6 | BFF: POST /api/bff/planning/mtp, UI: CreateEventDialog |
| 3.1-3.5 | BFF: POST/DELETE /api/bff/planning/mtp/:eventId, Service: CONFIRMED_DELETE_DENIED |
| 4.1-4.5 | BFF: GET /api/bff/planning/mtp/:eventId, UI: MtpEventDetailPage (split layout) |
| 5.1-5.9 | BFF: GET/PUT amounts, UI: MtpAmountGrid |
| 6.1-6.4 | BFF: dimensionValueId param, UI: DimensionValueSelector |
| 7.1-7.4 | BFF: GET themes, UI: StrategyThemeTree |
| 8.1-8.6 | BFF: POST themes, UI: CreateThemeDialog |
| 9.1-9.5 | BFF: PUT/DELETE themes, Service: CHILD_THEME_DELETE_DENIED |
| 10.1-10.6 | BFF: PUT event, Service: status transition |
| 11.1-11.3 | Repository: tenantId guard, RLS Policy |

---

## UI Component Structure

```
apps/web/src/features/planning/mtp/
├── components/
│   ├── mtp-event-list.tsx            # イベント一覧テーブル
│   ├── mtp-event-header.tsx          # 詳細画面ヘッダー
│   ├── mtp-amount-grid.tsx           # 数値入力グリッド（単一選択モード用）
│   ├── mtp-bulk-amount-grid.tsx      # 一括入力グリッド（一括入力モード用）
│   ├── dimension-value-selector.tsx  # ディメンション値セレクター
│   ├── strategy-theme-tree.tsx       # テーマツリー表示
│   ├── mtp-overview-grid.tsx         # 全社俯瞰グリッド
│   ├── mtp-trend-chart.tsx           # 推移グラフ
│   ├── tabs/
│   │   ├── mtp-input-tab.tsx         # 入力タブ（入力モード切替含む）
│   │   ├── mtp-overview-tab.tsx      # 全社俯瞰タブ
│   │   ├── mtp-trend-tab.tsx         # 推移タブ
│   │   └── mtp-theme-tab.tsx         # 戦略テーマタブ
│   └── dialogs/
│       ├── CreateEventDialog.tsx     # イベント作成ダイアログ
│       ├── DuplicateEventDialog.tsx  # イベント複製ダイアログ
│       ├── CreateThemeDialog.tsx     # テーマ作成ダイアログ
│       ├── EditThemeDialog.tsx       # テーマ編集ダイアログ
│       └── ConfirmStatusDialog.tsx   # ステータス変更確認ダイアログ
├── api/
│   ├── BffClient.ts                  # インターフェース
│   ├── mock-bff-client.ts            # モック実装（getBulkAmounts含む）
│   └── HttpBffClient.ts              # 実装
├── hooks/
│   ├── useMtpEvents.ts               # イベント一覧取得
│   ├── useMtpEventDetail.ts          # イベント詳細取得
│   ├── useMtpAmounts.ts              # 数値取得・保存
│   └── useStrategyThemes.ts          # 戦略テーマCRUD
├── utils/
│   └── format.ts                     # 金額フォーマット・パース
└── validators/
    ├── eventSchema.ts                # イベント入力バリデーション
    └── themeSchema.ts                # テーマ入力バリデーション
```

### 入力タブのモード切替設計

```
┌─────────────────────────────────────────────────────────┐
│ 入力モード: [単一選択] [一括入力]  ← ToggleGroup      │
├─────────────────────────────────────────────────────────┤
│ ■ 単一選択モード:                                      │
│   - DimensionValueSelector で事業部を選択             │
│   - MtpAmountGrid で選択した事業部の数値を入力        │
├─────────────────────────────────────────────────────────┤
│ ■ 一括入力モード:                                      │
│   - MtpBulkAmountGrid で全事業部を縦に表示            │
│   - 全社合計: 固定表示、フロントエンド側リアルタイム集計│
│   - 各事業部: Accordion で折りたたみ可能               │
│   - 横スクロール対応                                   │
└─────────────────────────────────────────────────────────┘
```

---

## 変更履歴

| 日付 | 変更内容 | 担当 |
|------|---------|------|
| 2026-01-11 | 初版作成（CCSDD準拠） | Claude Code |
| 2026-01-12 | UI構造更新: スプリットレイアウト→タブ構成、入力モード切替（単一選択/一括入力）追加、MtpBulkAmountGridコンポーネント追加、タブ別コンポーネント構成に変更 | Claude Code |
