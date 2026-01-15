# Design Document: Headcount Planning（人員計画登録）

---

**Purpose**: Provide sufficient detail to ensure implementation consistency across different implementers, preventing interpretation drift.

---

## Spec Reference（INPUT情報）

本設計を作成するにあたり、以下の情報を確認した：

### Requirements（直接INPUT）
- **参照ファイル**: `.kiro/specs/planning/headcount-planning/requirements.md`
- **要件バージョン**: 2026-01-13

### 仕様概要（確定済み仕様）
- **参照ファイル**: `.kiro/specs/仕様概要/人員計画登録.md`
- **設計に影響する仕様ポイント**:
  - 2層構造: レイヤー1（職種×等級一括管理）+ レイヤー2（個人別配賦）
  - 単価マスタは社員・外注統一、科目別内訳対応
  - 月別入力（0.01人月単位）
  - 配賦率100%チェック（plan_events.allocation_check_mode で ERROR/WARN 選択）
  - 予算反映は「全削除→再作成」方式

### エンティティ定義（Data Model 正本）
- **参照ファイル**: `.kiro/specs/entities/01_各種マスタ.md`
- **対象エンティティ**:
  - 4.8 labor_cost_rates, 4.9 labor_cost_rate_items
  - 4.10 resource_plans, 4.11 resource_plan_months, 4.12 resource_allocations
  - 4.13 individual_allocations
  - 11.1 plan_events, 12.1 fact_amounts

### 仕様検討（経緯・背景）※参考
- **参照ファイル**: 仕様概要内 QA確定事項
- **設計判断に影響した経緯**:
  - Q4-1: 予算反映方式は「全削除→再作成」に確定
  - allocation_check_mode は companies から plan_events に移動

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

人員計画登録機能は、部門ごとの人員計画（社員・外注）を登録し、労務費予算を自動算出する。2層構造（レイヤー1: 職種×等級一括管理、レイヤー2: 個人別配賦）で運用し、月別人数と配賦率を設定して科目別の予算を fact_amounts に反映する。

本設計では、BFF が UI 向けに最適化した ViewModel を提供し、Domain API がビジネスルール（100%チェック、予算反映ロジック）の正本を持つ。労務費算出は単価内訳（labor_cost_rate_items）を参照し、科目ごとに金額を算出して予算データを生成する。

---

## Architecture

### Architecture Pattern & Boundary Map

**Pattern (fixed)**:
- UI（apps/web） → BFF（apps/bff） → Domain API（apps/api） → DB（PostgreSQL + RLS）
- UI直APIは禁止

**Contracts (SSoT)**:
- UI ↔ BFF: `packages/contracts/src/bff/headcount-planning`
- BFF ↔ Domain API: `packages/contracts/src/api/headcount-planning`
- Enum/Error: 原則 `packages/contracts/src/shared/**`
- UI は `packages/contracts/src/api` を参照してはならない

---

## Architecture Responsibilities（Mandatory）

### BFF Specification（apps/bff）

**Purpose**
- UI要件に最適化したAPI（Read Model / ViewModel）
- Domain APIのレスポンスを集約・変換（ビジネスルールの正本は持たない）

**BFF Endpoints（UIが叩く）**

| Method | Endpoint | Purpose | Request DTO (contracts/bff) | Response DTO (contracts/bff) | Notes |
| ------ | -------- | ------- | --------------------------- | ---------------------------- | ----- |
| GET | /bff/headcount-planning/resource-plans | 人員計画一覧（レイヤー1） | BffListResourcePlansRequest | BffListResourcePlansResponse | フィルタ: event/version/department |
| POST | /bff/headcount-planning/resource-plans | 人員計画新規登録 | BffCreateResourcePlanRequest | BffResourcePlanResponse | 12ヶ月分の months を初期化 |
| GET | /bff/headcount-planning/resource-plans/:id | 人員計画詳細 | - | BffResourcePlanDetailResponse | months, allocations 含む |
| PUT | /bff/headcount-planning/resource-plans/:id | 人員計画更新 | BffUpdateResourcePlanRequest | BffResourcePlanResponse | |
| DELETE | /bff/headcount-planning/resource-plans/:id | 人員計画削除 | - | void | 関連テーブルも削除 |
| PUT | /bff/headcount-planning/resource-plans/:id/months | 月別人数一括更新 | BffUpdateResourcePlanMonthsRequest | BffResourcePlanMonthsResponse | |
| PUT | /bff/headcount-planning/resource-plans/:id/allocations | 配賦設定更新 | BffUpdateResourceAllocationsRequest | BffResourceAllocationsResponse | 100%チェック適用 |
| GET | /bff/headcount-planning/individual-allocations | 個人別配賦一覧（レイヤー2） | BffListIndividualAllocationsRequest | BffListIndividualAllocationsResponse | |
| POST | /bff/headcount-planning/individual-allocations | 個人別配賦登録 | BffCreateIndividualAllocationRequest | BffIndividualAllocationResponse | 複数行（配賦先）一括登録 |
| PUT | /bff/headcount-planning/individual-allocations/:individualKey | 個人別配賦更新 | BffUpdateIndividualAllocationRequest | BffIndividualAllocationResponse | individualKey = employee_stable_id or individual_name hash |
| DELETE | /bff/headcount-planning/individual-allocations/:individualKey | 個人別配賦削除 | - | void | |
| GET | /bff/headcount-planning/summary | 部門集計ビュー | BffHeadcountSummaryRequest | BffHeadcountSummaryResponse | 配賦先視点の集計 |
| POST | /bff/headcount-planning/apply-budget | 予算反映 | BffApplyBudgetRequest | BffApplyBudgetResponse | fact_amounts への書き込み |
| GET | /bff/headcount-planning/context | コンテキスト情報取得 | BffHeadcountContextRequest | BffHeadcountContextResponse | 年度/イベント/バージョン/部門選択肢 |
| GET | /bff/labor-cost-rates | 単価マスタ一覧 | BffListLaborCostRatesRequest | BffListLaborCostRatesResponse | resource_type フィルタ対応 |
| GET | /bff/labor-cost-rates/:id | 単価マスタ詳細 | - | BffLaborCostRateDetailResponse | 科目別内訳含む |

**Naming Convention（必須）**
- DTO / Contracts: camelCase（例: `resourceType`, `jobCategory`, `headcount`）
- DB columns: snake_case（例: `resource_type`, `job_category`, `headcount`）
- `sortBy` は **DTO側キー**を採用する（例: `resourceType | jobCategory | grade`）
- DB列名（snake_case）を UI/BFF へ露出させない

**Paging / Sorting Normalization（必須・BFF責務）**
- UI/BFF: page / pageSize（page-based）
- Domain API: offset / limit（DB-friendly）
- BFFは必ず以下を実施する（省略禁止）：
  - defaults: page=1, pageSize=50, sortBy=resourceType, sortOrder=asc
  - clamp: pageSize <= 200
  - whitelist: sortBy は許可リストのみ
    - resource-plans: `resourceType | jobCategory | grade | headcount | annualAmount`
    - individual-allocations: `individualName | jobCategory | grade | targetDepartment | percentage`
  - normalize: keyword trim、空→undefined
  - transform: offset=(page-1)*pageSize, limit=pageSize
- Domain APIに渡すのは offset/limit（page/pageSizeは渡さない）
- BFFレスポンスには page/pageSize を含める（UIへ返すのはBFF側の値）

**Transformation Rules（api DTO → bff DTO）**

| Domain API Field | BFF Field | Transformation |
|------------------|-----------|----------------|
| resource_type | resourceType | as-is |
| job_category | jobCategory | as-is |
| source_department_stable_id | sourceDepartment | Enrich: { id, code, name } |
| target_department_stable_id | targetDepartment | Enrich: { id, code, name } |
| rate_id | rate | Enrich: { id, code, totalRate, rateType } |
| custom_rate | customRate | as-is |
| months[] | months[] | Map: period_month → periodMonth |
| allocations[] | allocations[] | Enrich target department info |
| labor_cost_rate_items[] | rateItems[] | Map subject info |

**Error Policy（必須）**
- 採用方針：**Option A: Pass-through**
- 採用理由：人員計画のエラー（100%チェック違反、重複など）は Domain API が判断し、BFF はそのまま返す。UI は `contracts/bff/errors` に基づいて表示制御を行う

**In all cases**
- 最終拒否権限（403/404/409/422等）は Domain API が持つ

**Authentication / Tenant Context（tenant_id/user_id伝搬）**
- tenant_id: JWT から BFF で解決、X-Tenant-Id ヘッダーで Domain API へ伝搬
- user_id: JWT から BFF で解決、X-User-Id ヘッダーで Domain API へ伝搬
- company_id: リクエストパラメータで指定、Domain API が tenant との整合性を検証

---

### Domain API Specification（apps/api）

**Purpose**
- ビジネスルールの正本（100%チェック、予算反映ロジック）
- Transaction boundary / audit points

**API Endpoints（BFF → Domain API）**

| Method | Endpoint | Purpose | Request DTO (contracts/api) | Response DTO (contracts/api) | Transaction | Audit |
| ------ | -------- | ------- | --------------------------- | ---------------------------- | ----------- | ----- |
| GET | /api/resource-plans | 人員計画一覧 | ApiListResourcePlansRequest | ApiListResourcePlansResponse | Read | - |
| POST | /api/resource-plans | 人員計画作成 | ApiCreateResourcePlanRequest | ApiResourcePlanResponse | Write | created_by |
| GET | /api/resource-plans/:id | 人員計画詳細 | - | ApiResourcePlanDetailResponse | Read | - |
| PUT | /api/resource-plans/:id | 人員計画更新 | ApiUpdateResourcePlanRequest | ApiResourcePlanResponse | Write | updated_by |
| DELETE | /api/resource-plans/:id | 人員計画削除 | - | void | Write | - |
| PUT | /api/resource-plans/:id/months | 月別人数更新 | ApiUpdateMonthsRequest | ApiMonthsResponse | Write | - |
| PUT | /api/resource-plans/:id/allocations | 配賦設定更新 | ApiUpdateAllocationsRequest | ApiAllocationsResponse | Write | 100%チェック |
| GET | /api/individual-allocations | 個人別配賦一覧 | ApiListIndividualAllocationsRequest | ApiListIndividualAllocationsResponse | Read | - |
| POST | /api/individual-allocations | 個人別配賦作成 | ApiCreateIndividualAllocationRequest | ApiIndividualAllocationResponse | Write | created_by |
| PUT | /api/individual-allocations/:id | 個人別配賦更新 | ApiUpdateIndividualAllocationRequest | ApiIndividualAllocationResponse | Write | updated_by |
| DELETE | /api/individual-allocations/:id | 個人別配賦削除 | - | void | Write | - |
| POST | /api/headcount-planning/apply-budget | 予算反映 | ApiApplyBudgetRequest | ApiApplyBudgetResponse | Write (Tx) | data_origin=SYSTEM |

**Business Rules（Domain API の責務）**

1. **配賦チェック（resource_allocations）**
   ```
   When allocation_type = 'PERCENTAGE':
     SUM(percentage) for same resource_plan_id must equal 100.00

   When allocation_type = 'HEADCOUNT':
     SUM(headcount_amount) must equal SUM(resource_plan_months.headcount)
     （配賦合計 = 月別人数合計 必須、不一致はエラー）

   Check behavior depends on plan_events.allocation_check_mode:
     - ERROR: Reject with 422 and error details
     - WARN: Return success with warning in response
   ```

2. **配賦率100%チェック（individual_allocations）**
   ```
   For each individual (same employee_stable_id or individual_name):
     SUM(percentage) must equal 100.00

   Individual allocations ALWAYS require 100% (no WARN mode)
   ```

3. **配賦先重複禁止**
   ```
   UNIQUE(resource_plan_id, target_department_stable_id)
   If duplicate detected: Reject with 409 CONFLICT
   ```

4. **予算反映ロジック（apply-budget）**
   ```
   Transaction:
   1. DELETE FROM fact_amounts
      WHERE plan_event_id = :eventId
        AND plan_version_id = :versionId
        AND source_type = 'HEADCOUNT_CALC'

   2. For each resource_plan:
      For each month in resource_plan_months:
        For each allocation in resource_allocations:
          If rate_id is set:
            For each rate_item in labor_cost_rate_items:
              INSERT INTO fact_amounts (subject_id: rate_item.subject_id, ...)
          Else (custom_rate):
            subject_id = companies.default_labor_cost_subject_id
            INSERT INTO fact_amounts (subject_id: default_subject, ...)

          Common fields:
            scenario_type: BUDGET,
            source_type: HEADCOUNT_CALC,
            data_origin: SYSTEM,
            department_stable_id: allocation.target_department_stable_id,
            amount: rate × month.headcount × allocation.percentage / 100

   3. For each individual_allocation:
      Similar calculation with individual rates
      (custom_rate の場合は companies.default_labor_cost_subject_id を使用)

   4. COMMIT or ROLLBACK on error
   ```

5. **月別人数の初期化**
   ```
   When creating resource_plan:
     Generate 12 resource_plan_months records with headcount = 0.00
     Period months: 4,5,6,7,8,9,10,11,12,1,2,3 (fiscal year based)
   ```

---

### Repository Specification（apps/api）

**ResourcePlanRepository**
```typescript
interface ResourcePlanRepository {
  // All methods require tenant_id in where clause (double guard)
  findMany(params: {
    tenantId: string
    companyId: string
    planEventId: string
    planVersionId: string
    sourceDepartmentStableId?: string
    offset: number
    limit: number
  }): Promise<ResourcePlan[]>

  findById(tenantId: string, id: string): Promise<ResourcePlan | null>

  create(tenantId: string, data: CreateResourcePlanData): Promise<ResourcePlan>
  // Includes creating 12 resource_plan_months

  update(tenantId: string, id: string, data: UpdateResourcePlanData): Promise<ResourcePlan>

  delete(tenantId: string, id: string): Promise<void>
  // Cascade delete: resource_plan_months, resource_allocations

  updateMonths(tenantId: string, resourcePlanId: string, months: MonthData[]): Promise<void>

  updateAllocations(tenantId: string, resourcePlanId: string, allocations: AllocationData[]): Promise<void>
}
```

**IndividualAllocationRepository**
```typescript
interface IndividualAllocationRepository {
  findMany(params: {
    tenantId: string
    companyId: string
    planEventId: string
    planVersionId: string
    sourceDepartmentStableId?: string
  }): Promise<IndividualAllocation[]>

  findByIndividualKey(tenantId: string, key: IndividualKey): Promise<IndividualAllocation[]>
  // key = { employeeStableId } or { individualName }

  createMany(tenantId: string, allocations: CreateIndividualAllocationData[]): Promise<IndividualAllocation[]>

  updateByIndividualKey(tenantId: string, key: IndividualKey, data: UpdateData): Promise<IndividualAllocation[]>

  deleteByIndividualKey(tenantId: string, key: IndividualKey): Promise<void>
}
```

**FactAmountRepository（予算反映用）**
```typescript
interface FactAmountRepository {
  deleteBySourceType(params: {
    tenantId: string
    companyId: string
    planEventId: string
    planVersionId: string
    sourceType: 'HEADCOUNT_CALC'
  }): Promise<number>

  bulkInsert(tenantId: string, amounts: FactAmountData[]): Promise<void>
}
```

**RLS Policy Enforcement**
- set_config('app.tenant_id', tenantId) を全トランザクション開始時に実行
- where句二重ガード必須
- RLS無効化禁止

---

### Contracts Summary（This Feature）

**New Contracts to Create**

```
packages/contracts/src/bff/headcount-planning/
├── index.ts                 # Main exports
├── resource-plan.ts         # Resource plan DTOs
├── individual-allocation.ts # Individual allocation DTOs
├── summary.ts               # Summary view DTOs
├── apply-budget.ts          # Budget apply DTOs
└── errors.ts                # Error codes

packages/contracts/src/api/headcount-planning/
├── index.ts                 # Main exports
├── resource-plan.ts         # API resource plan DTOs
├── individual-allocation.ts # API individual allocation DTOs
└── apply-budget.ts          # API budget apply DTOs
```

**Shared Enums（既存 + 新規）**

```typescript
// packages/contracts/src/shared/enums/resource-type.ts
export const ResourceType = {
  EMPLOYEE: 'EMPLOYEE',
  CONTRACTOR: 'CONTRACTOR'
} as const

// packages/contracts/src/shared/enums/rate-type.ts
export const RateType = {
  MONTHLY: 'MONTHLY',
  HOURLY: 'HOURLY',
  DAILY: 'DAILY'
} as const

// packages/contracts/src/shared/enums/allocation-type.ts
export const AllocationType = {
  PERCENTAGE: 'PERCENTAGE',
  HEADCOUNT: 'HEADCOUNT'
} as const

// packages/contracts/src/shared/enums/allocation-check-mode.ts
export const AllocationCheckMode = {
  ERROR: 'ERROR',
  WARN: 'WARN'
} as const

// 既存: source_type に HEADCOUNT_CALC を追加
export const SourceType = {
  INPUT: 'INPUT',
  ADJUST: 'ADJUST',
  ALLOC: 'ALLOC',
  PROJECT_ROLLUP: 'PROJECT_ROLLUP',
  HEADCOUNT_CALC: 'HEADCOUNT_CALC'  // 新規追加
} as const
```

---

## Responsibility Clarification（Mandatory）

本Featureにおける責務境界を以下に明記する。
未記載の責務は実装してはならない。

### UIの責務
- 表示制御（enable/disable / 文言切替）
  - バージョンステータスが FIXED の場合、編集ボタンを disable
  - 100%チェック警告の表示（allocation_check_mode=WARN 時）
- フォーム入力制御・UX最適化
  - 月別人数の一括入力機能
  - 配賦先部門の動的追加UI
  - 金額のカンマ区切り表示
- ビジネス判断は禁止
  - 100%チェックの判定は Domain API に委譲
  - 予算反映の可否判断は Domain API に委譲

### BFFの責務
- UI入力の正規化（paging / sorting / filtering）
- Domain API DTO ⇄ UI DTO の変換
  - department_stable_id → { id, code, name } への展開
  - rate_id → { id, code, totalRate, ... } への展開
- ビジネスルールの正本は持たない
  - 100%チェックは Domain API に委譲
  - 予算反映ロジックは Domain API に委譲

### Domain APIの責務
- ビジネスルールの正本
  - 配賦率100%チェック（ERROR/WARN）
  - 配賦先重複チェック
  - 予算反映ロジック（全削除→再作成）
- 権限・状態遷移の最終判断
  - FIXED バージョンへの書き込み拒否
- 監査ログ・整合性保証
  - created_by / updated_by の記録
  - トランザクション境界の管理

---

## Data Model（エンティティ整合性確認必須）

### Entity Reference
- 参照元: `.kiro/specs/entities/01_各種マスタ.md` セクション 4.8-4.13, 11.1, 12.1

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
model LaborCostRate {
  id              String   @id @default(uuid())
  tenantId        String   @map("tenant_id")
  companyId       String   @map("company_id")
  rateCode        String   @map("rate_code")
  resourceType    String   @map("resource_type") // EMPLOYEE | CONTRACTOR
  vendorName      String?  @map("vendor_name")
  jobCategory     String   @map("job_category")
  grade           String?
  employmentType  String?  @map("employment_type")
  rateType        String   @map("rate_type") // MONTHLY | HOURLY | DAILY
  totalRate       Decimal  @map("total_rate")
  effectiveDate   DateTime @map("effective_date") @db.Date
  expiryDate      DateTime? @map("expiry_date") @db.Date
  isActive        Boolean  @default(true) @map("is_active")
  notes           String?
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")
  createdBy       String?  @map("created_by")
  updatedBy       String?  @map("updated_by")

  items           LaborCostRateItem[]
  resourcePlans   ResourcePlan[]
  individualAllocations IndividualAllocation[]

  @@unique([tenantId, companyId, rateCode])
  @@map("labor_cost_rates")
}

model LaborCostRateItem {
  id            String  @id @default(uuid())
  tenantId      String  @map("tenant_id")
  rateId        String  @map("rate_id")
  subjectId     String  @map("subject_id")
  amount        Decimal
  percentage    Decimal? @db.Decimal(5, 2)
  displayOrder  Int     @map("display_order")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  rate          LaborCostRate @relation(fields: [tenantId, rateId], references: [tenantId, id])

  @@unique([rateId, subjectId])
  @@map("labor_cost_rate_items")
}

model ResourcePlan {
  id                        String   @id @default(uuid())
  tenantId                  String   @map("tenant_id")
  companyId                 String   @map("company_id")
  planEventId               String   @map("plan_event_id")
  planVersionId             String   @map("plan_version_id")
  sourceDepartmentStableId  String   @map("source_department_stable_id")
  resourceType              String   @map("resource_type") // EMPLOYEE | CONTRACTOR
  jobCategory               String   @map("job_category")
  grade                     String?
  rateType                  String   @map("rate_type") // MONTHLY | HOURLY | DAILY
  rateId                    String?  @map("rate_id")
  customRate                Decimal? @map("custom_rate")
  notes                     String?
  createdAt                 DateTime @default(now()) @map("created_at")
  updatedAt                 DateTime @updatedAt @map("updated_at")
  createdBy                 String?  @map("created_by")
  updatedBy                 String?  @map("updated_by")

  rate                      LaborCostRate? @relation(fields: [tenantId, rateId], references: [tenantId, id])
  months                    ResourcePlanMonth[]
  allocations               ResourceAllocation[]

  @@map("resource_plans")
}

model ResourcePlanMonth {
  id              String   @id @default(uuid())
  tenantId        String   @map("tenant_id")
  resourcePlanId  String   @map("resource_plan_id")
  periodMonth     Int      @map("period_month") // 1-12
  headcount       Decimal  @db.Decimal(10, 2)
  notes           String?
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  resourcePlan    ResourcePlan @relation(fields: [tenantId, resourcePlanId], references: [tenantId, id], onDelete: Cascade)

  @@unique([resourcePlanId, periodMonth])
  @@map("resource_plan_months")
}

model ResourceAllocation {
  id                        String   @id @default(uuid())
  tenantId                  String   @map("tenant_id")
  resourcePlanId            String   @map("resource_plan_id")
  targetDepartmentStableId  String   @map("target_department_stable_id")
  allocationType            String   @map("allocation_type") // PERCENTAGE | HEADCOUNT
  percentage                Decimal? @db.Decimal(5, 2)
  headcountAmount           Decimal? @map("headcount_amount") @db.Decimal(8, 2)
  effectiveMonths           Int[]?   @map("effective_months")
  notes                     String?
  createdAt                 DateTime @default(now()) @map("created_at")
  updatedAt                 DateTime @updatedAt @map("updated_at")

  resourcePlan              ResourcePlan @relation(fields: [tenantId, resourcePlanId], references: [tenantId, id], onDelete: Cascade)

  @@unique([resourcePlanId, targetDepartmentStableId])
  @@map("resource_allocations")
}

model IndividualAllocation {
  id                        String   @id @default(uuid())
  tenantId                  String   @map("tenant_id")
  companyId                 String   @map("company_id")
  planEventId               String   @map("plan_event_id")
  planVersionId             String   @map("plan_version_id")
  employeeStableId          String?  @map("employee_stable_id")
  individualName            String   @map("individual_name")
  sourceDepartmentStableId  String   @map("source_department_stable_id")
  jobCategory               String   @map("job_category")
  grade                     String?
  rateType                  String   @map("rate_type")
  rateId                    String?  @map("rate_id")
  customRate                Decimal? @map("custom_rate")
  targetDepartmentStableId  String   @map("target_department_stable_id")
  allocationType            String   @map("allocation_type")
  percentage                Decimal? @db.Decimal(5, 2)
  headcountAmount           Decimal? @map("headcount_amount") @db.Decimal(8, 2)
  effectiveMonths           Int[]?   @map("effective_months")
  notes                     String?
  createdAt                 DateTime @default(now()) @map("created_at")
  updatedAt                 DateTime @updatedAt @map("updated_at")
  createdBy                 String?  @map("created_by")
  updatedBy                 String?  @map("updated_by")

  rate                      LaborCostRate? @relation(fields: [tenantId, rateId], references: [tenantId, id])

  @@map("individual_allocations")
}
```

### Constraints（エンティティ定義から転記）

**resource_plans**
- PK: id（UUID）
- CHECK: resource_type IN ('EMPLOYEE', 'CONTRACTOR')
- CHECK: rate_type IN ('MONTHLY', 'HOURLY', 'DAILY')
- CHECK: rate_id IS NOT NULL OR custom_rate IS NOT NULL

**resource_plan_months**
- UNIQUE: (resource_plan_id, period_month)
- CHECK: period_month BETWEEN 1 AND 12
- CHECK: headcount >= 0

**resource_allocations**
- UNIQUE: (resource_plan_id, target_department_stable_id) — 配賦先重複禁止
- CHECK: allocation_type IN ('PERCENTAGE', 'HEADCOUNT')

**individual_allocations**
- CHECK: rate_type IN ('MONTHLY', 'HOURLY', 'DAILY')
- CHECK: allocation_type IN ('PERCENTAGE', 'HEADCOUNT')
- CHECK: rate_id IS NOT NULL OR custom_rate IS NOT NULL

**plan_events**
- CHECK: allocation_check_mode IN ('ERROR', 'WARN')

**companies（参照）**
- default_labor_cost_subject_id: custom_rate 使用時のデフォルト人件費科目
- FK: subjects(tenant_id, company_id, id)

### RLS Policy

```sql
ALTER TABLE labor_cost_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON labor_cost_rates
  USING (tenant_id::text = current_setting('app.tenant_id', true));

ALTER TABLE labor_cost_rate_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON labor_cost_rate_items
  USING (tenant_id::text = current_setting('app.tenant_id', true));

ALTER TABLE resource_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON resource_plans
  USING (tenant_id::text = current_setting('app.tenant_id', true));

ALTER TABLE resource_plan_months ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON resource_plan_months
  USING (tenant_id::text = current_setting('app.tenant_id', true));

ALTER TABLE resource_allocations ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON resource_allocations
  USING (tenant_id::text = current_setting('app.tenant_id', true));

ALTER TABLE individual_allocations ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON individual_allocations
  USING (tenant_id::text = current_setting('app.tenant_id', true));
```

---

## UI Component Design

### 画面構成

```
HeadcountPlanningPage
├── HeadcountPlanningHeader          # 検索条件（年度/イベント/バージョン/部門）
├── HeadcountPlanningTabs            # タブ切り替え（一括管理/個人別管理）
│   ├── BulkManagementTab            # レイヤー1: 一括管理
│   │   ├── ResourcePlanList         # 人員計画一覧テーブル（月別セル内インライン編集対応）
│   │   └── ResourcePlanSummary      # 合計表示
│   └── IndividualManagementTab      # レイヤー2: 個人別管理
│       ├── IndividualAllocationList # 個人別配賦一覧
│       └── IndividualSummary        # 合計表示
├── ResourcePlanDialog               # 人員計画登録/編集ダイアログ
├── ResourcePlanMonthsDialog         # 月別人数編集ダイアログ
├── AllocationSettingsDialog         # 配賦設定ダイアログ（月別モード対応）
├── IndividualAllocationDialog       # 個人別配賦登録/編集ダイアログ
├── DepartmentSummaryPanel           # 部門集計ビュー（オプション表示）
└── ApplyBudgetDialog                # 予算反映確認ダイアログ
```

### 月別セルのインタラクション仕様

ResourcePlanList の月別セル（4月〜3月）は以下のインタラクションをサポートする：

| 操作 | 挙動 |
|------|------|
| シングルクリック | 当該月の配賦設定ダイアログ（AllocationSettingsDialog）を開く |
| ダブルクリック | セル内にテキストボックスを表示し、人月数を直接入力可能とする |

**インライン編集の動作詳細**:
- ダブルクリックでテキストボックス（type=number, step=0.01）が表示される
- Enter キーで確定、Escape キーでキャンセル
- フォーカス喪失（blur）時に自動確定
- シングルクリックとダブルクリックを区別するため、シングルクリックは300ms遅延後に発火

### State Management

```typescript
// Feature-level state (React Query / TanStack Query)
interface HeadcountPlanningState {
  // Context selections
  selectedFiscalYear: number
  selectedPlanEventId: string
  selectedPlanVersionId: string
  selectedDepartmentId: string | null

  // Active tab
  activeTab: 'bulk' | 'individual'

  // Dialog states
  dialogs: {
    resourcePlan: { open: boolean; mode: 'create' | 'edit'; data?: ResourcePlan }
    months: { open: boolean; resourcePlanId?: string }
    allocation: { open: boolean; resourcePlanId?: string }
    individualAllocation: { open: boolean; mode: 'create' | 'edit'; data?: IndividualAllocation }
    applyBudget: { open: boolean }
    departmentSummary: { open: boolean }
  }
}

// Server state queries
const useResourcePlans = (params: ListParams) => useQuery(...)
const useIndividualAllocations = (params: ListParams) => useQuery(...)
const useHeadcountContext = () => useQuery(...)
const useLaborCostRates = (params: ListParams) => useQuery(...)

// Mutations
const useCreateResourcePlan = () => useMutation(...)
const useUpdateResourcePlan = () => useMutation(...)
const useDeleteResourcePlan = () => useMutation(...)
const useUpdateResourcePlanMonths = () => useMutation(...)
const useUpdateResourceAllocations = () => useMutation(...)
const useApplyBudget = () => useMutation(...)
```

---

## Error Handling

### Error Codes（contracts/bff/headcount-planning/errors.ts）

```typescript
export const HeadcountPlanningErrorCode = {
  // Resource Plan errors
  RESOURCE_PLAN_NOT_FOUND: 'RESOURCE_PLAN_NOT_FOUND',
  RESOURCE_PLAN_DUPLICATE: 'RESOURCE_PLAN_DUPLICATE',

  // Allocation errors
  ALLOCATION_TOTAL_NOT_100: 'ALLOCATION_TOTAL_NOT_100',
  ALLOCATION_TARGET_DUPLICATE: 'ALLOCATION_TARGET_DUPLICATE',

  // Individual Allocation errors
  INDIVIDUAL_ALLOCATION_NOT_FOUND: 'INDIVIDUAL_ALLOCATION_NOT_FOUND',
  INDIVIDUAL_TOTAL_NOT_100: 'INDIVIDUAL_TOTAL_NOT_100',

  // Rate errors
  LABOR_COST_RATE_NOT_FOUND: 'LABOR_COST_RATE_NOT_FOUND',
  RATE_NOT_SPECIFIED: 'RATE_NOT_SPECIFIED',

  // Budget apply errors
  HEADCOUNT_CALC_DATA_EXISTS: 'HEADCOUNT_CALC_DATA_EXISTS',
  VERSION_IS_FIXED: 'VERSION_IS_FIXED',
  APPLY_BUDGET_FAILED: 'APPLY_BUDGET_FAILED',

  // Validation errors
  INVALID_HEADCOUNT: 'INVALID_HEADCOUNT',
  INVALID_PERCENTAGE: 'INVALID_PERCENTAGE',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const

export type HeadcountPlanningErrorCode =
  (typeof HeadcountPlanningErrorCode)[keyof typeof HeadcountPlanningErrorCode]

export interface HeadcountPlanningError {
  code: HeadcountPlanningErrorCode
  message: string
  details?: {
    currentTotal?: number      // 現在の合計（100%チェック時）
    expectedTotal?: number     // 期待値（100）
    duplicateTarget?: string   // 重複した配賦先
    warningOnly?: boolean      // WARN モードの場合 true
  }
}
```

### UI Error Display Rules

| Error Code | UI Display | Action |
|------------|-----------|--------|
| ALLOCATION_TOTAL_NOT_100 (ERROR mode) | トースト + フォーム下部エラー | 保存ボタン disabled |
| ALLOCATION_TOTAL_NOT_100 (WARN mode) | 警告バナー表示 | 保存可能、確認促す |
| ALLOCATION_TARGET_DUPLICATE | インライン警告 | 重複行をハイライト |
| VERSION_IS_FIXED | トースト通知 | 編集UI全体 disabled |
| HEADCOUNT_CALC_DATA_EXISTS | 確認ダイアログ | ユーザーに上書き確認 |

---

## Performance Considerations

### Query Optimization

1. **人員計画一覧**: plan_event_id, plan_version_id でフィルタ → インデックス活用
2. **予算反映**: bulk INSERT を使用、1000件ごとにバッチ処理
3. **部門集計**: target_department_stable_id でのグループ化 → インデックス必要

### Recommended Indexes

```sql
CREATE INDEX idx_resource_plans_event_version
  ON resource_plans(tenant_id, plan_event_id, plan_version_id);

CREATE INDEX idx_resource_allocations_target
  ON resource_allocations(tenant_id, target_department_stable_id);

CREATE INDEX idx_individual_allocations_event_version
  ON individual_allocations(tenant_id, plan_event_id, plan_version_id);

-- 個人別100%チェック用（employee_stable_id or individual_name でグループ化）
CREATE INDEX idx_individual_allocations_employee
  ON individual_allocations(tenant_id, plan_event_id, plan_version_id, employee_stable_id)
  WHERE employee_stable_id IS NOT NULL;

CREATE INDEX idx_individual_allocations_name
  ON individual_allocations(tenant_id, plan_event_id, plan_version_id, individual_name)
  WHERE employee_stable_id IS NULL;

CREATE INDEX idx_fact_amounts_source_type
  ON fact_amounts(tenant_id, plan_event_id, plan_version_id, source_type);
```

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-13 | Initial design document created | Claude Code |
| 2026-01-13 | Design review対応: custom_rateデフォルト科目、HEADCOUNT検証ルール、インデックス追加 | Claude Code |
