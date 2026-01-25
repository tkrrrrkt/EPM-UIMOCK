# KPI管理マスタ エンティティ定義（確定版）

> **策定日**: 2026-01-25
> **関連仕様**: `.kiro/specs/仕様概要/KPI管理マスタ機能仕様_確定版.md`

---

## 概要

年度単位のKPI管理機能を実現するエンティティ群。

### 新規エンティティ
1. kpi_master_events（KPI管理イベント）
2. kpi_master_items（KPI管理項目）
3. kpi_definitions（非財務KPI定義）
4. kpi_fact_amounts（非財務KPI予実）
5. kpi_target_values（指標の目標値）

### 既存エンティティの変更
- subjects: kpi_managed フラグ追加
- metrics: kpi_managed フラグ追加
- action_plans: kpi_master_item_id追加、subject_id を nullable に変更

---

## 1. kpi_master_events（KPI管理イベント）

### 仕様
年度単位のKPI管理の枠を定義する。

### エンティティ

| カラム | 型 | NULL | 例 | 補足 |
|--------|---|------|-----|------|
| id | uuid | NO | | PK |
| tenant_id | uuid | NO | | RLS |
| company_id | uuid | NO | | FK to companies |
| event_code | varchar(50) | NO | "KPI_FY2026" | 会社内一意 |
| event_name | varchar(200) | NO | "2026年度 KPI管理" | |
| fiscal_year | int | NO | 2026 | 会計年度 |
| status | varchar(20) | NO | "DRAFT" | DRAFT/CONFIRMED |
| is_active | boolean | NO | true | |
| created_at | timestamptz | NO | | |
| updated_at | timestamptz | NO | | |
| created_by | uuid | YES | | 監査 |
| updated_by | uuid | YES | | 監査 |

### 制約

```sql
CONSTRAINT kpi_master_events_tenant_code_uk
    UNIQUE(tenant_id, company_id, event_code)

CONSTRAINT kpi_master_events_company_fk
    FOREIGN KEY(tenant_id, company_id)
    REFERENCES companies(tenant_id, id)

CONSTRAINT kpi_master_events_status_ck
    CHECK(status IN ('DRAFT', 'CONFIRMED'))
```

### 補足
- **DRAFT**: 編集可能（KPI項目の追加・編集・削除が自由）
- **CONFIRMED**: 確定（削除不可、追加・編集は可能）
- 年度開始前・途中でも作成可能
- 同一年度で複数イベント作成可能（過去年度の履歴保持）

---

## 2. kpi_master_items（KPI管理項目）

### 仕様
KPI管理イベントに紐づく具体的なKPI項目を定義する。

### エンティティ

| カラム | 型 | NULL | 例 | 補足 |
|--------|---|------|-----|------|
| id | uuid | NO | | PK |
| tenant_id | uuid | NO | | RLS |
| kpi_event_id | uuid | NO | | FK to kpi_master_events |
| parent_kpi_item_id | uuid | YES | | 親KPI項目（階層構造用） |
| kpi_code | varchar(50) | NO | "KPI_SALES" | イベント内一意 |
| kpi_name | varchar(200) | NO | "売上高" | |
| kpi_type | varchar(20) | NO | "FINANCIAL" | FINANCIAL/NON_FINANCIAL/METRIC |
| hierarchy_level | int | NO | 1 | 1:KGI, 2:KPI |
| ref_subject_id | uuid | YES | | 財務科目参照（kpi_type=FINANCIAL） |
| ref_kpi_definition_id | uuid | YES | | 非財務KPI参照（kpi_type=NON_FINANCIAL） |
| ref_metric_id | uuid | YES | | 指標参照（kpi_type=METRIC） |
| department_stable_id | varchar(50) | YES | | 責任部門（任意、NULL=全社） |
| owner_employee_id | uuid | YES | | 責任者（任意） |
| sort_order | int | NO | 1 | 表示順 |
| is_active | boolean | NO | true | |
| created_at | timestamptz | NO | | |
| updated_at | timestamptz | NO | | |

### 制約

```sql
CONSTRAINT kpi_master_items_event_code_uk
    UNIQUE(tenant_id, kpi_event_id, kpi_code)

CONSTRAINT kpi_master_items_event_fk
    FOREIGN KEY(tenant_id, kpi_event_id)
    REFERENCES kpi_master_events(tenant_id, id)

CONSTRAINT kpi_master_items_parent_fk
    FOREIGN KEY(tenant_id, parent_kpi_item_id)
    REFERENCES kpi_master_items(tenant_id, id)

CONSTRAINT kpi_master_items_subject_fk
    FOREIGN KEY(tenant_id, ref_subject_id)
    REFERENCES subjects(tenant_id, id)

CONSTRAINT kpi_master_items_definition_fk
    FOREIGN KEY(tenant_id, ref_kpi_definition_id)
    REFERENCES kpi_definitions(tenant_id, id)

CONSTRAINT kpi_master_items_metric_fk
    FOREIGN KEY(tenant_id, ref_metric_id)
    REFERENCES metrics(tenant_id, id)

CONSTRAINT kpi_master_items_employee_fk
    FOREIGN KEY(tenant_id, owner_employee_id)
    REFERENCES employees(tenant_id, id)

CONSTRAINT kpi_master_items_type_ck
    CHECK(kpi_type IN ('FINANCIAL', 'NON_FINANCIAL', 'METRIC'))

CONSTRAINT kpi_master_items_level_ck
    CHECK(hierarchy_level IN (1, 2))

CONSTRAINT kpi_master_items_ref_ck
    CHECK(
        (kpi_type = 'FINANCIAL' AND ref_subject_id IS NOT NULL
            AND ref_kpi_definition_id IS NULL AND ref_metric_id IS NULL)
        OR (kpi_type = 'NON_FINANCIAL' AND ref_subject_id IS NULL
            AND ref_kpi_definition_id IS NOT NULL AND ref_metric_id IS NULL)
        OR (kpi_type = 'METRIC' AND ref_subject_id IS NULL
            AND ref_kpi_definition_id IS NULL AND ref_metric_id IS NOT NULL)
    )
```

### 補足

#### kpi_type の説明

| 値 | 説明 | 参照先 | 予実データソース |
|----|------|-------|----------------|
| FINANCIAL | 財務科目 | ref_subject_id | fact_amounts（承認済み予算・見込・実績） |
| NON_FINANCIAL | 非財務KPI | ref_kpi_definition_id | kpi_fact_amounts（目標・実績） |
| METRIC | 指標 | ref_metric_id | 自動計算（予実管理なし） |

#### hierarchy_level の説明

| 値 | 名称 | 責任範囲 | 例 |
|---|------|---------|-----|
| 1 | KGI | 全社 | 売上高、営業利益率 |
| 2 | KPI | 事業部 | 新規顧客売上、省エネ設備導入率 |

**Level 3（アクションプラン）は action_plans テーブルで管理**

#### ref_xxx_id の制約
- kpi_type に応じて、3つの参照カラムのうち1つのみが NOT NULL になる
- 財務科目の場合、subjects.kpi_managed = true の科目のみ参照可能（UseCase で検証）
- 指標の場合、metrics.kpi_managed = true の指標のみ参照可能（UseCase で検証）

---

## 3. kpi_definitions（非財務KPI定義）

### 仕様
非財務のKPI項目を定義する。

### エンティティ

| カラム | 型 | NULL | 例 | 補足 |
|--------|---|------|-----|------|
| id | uuid | NO | | PK |
| tenant_id | uuid | NO | | RLS |
| company_id | uuid | NO | | FK to companies |
| kpi_code | varchar(50) | NO | "KPI_CO2" | 会社内一意 |
| kpi_name | varchar(200) | NO | "CO2削減率" | |
| description | text | YES | | |
| unit | varchar(30) | YES | "%" | 単位 |
| aggregation_method | varchar(20) | NO | "SUM" | SUM/EOP/AVG/MAX/MIN |
| direction | varchar(20) | YES | "higher_is_better" | 増減の良し悪し |
| is_active | boolean | NO | true | |
| created_at | timestamptz | NO | | |
| updated_at | timestamptz | NO | | |
| created_by | uuid | YES | | 監査 |
| updated_by | uuid | YES | | 監査 |

### 制約

```sql
CONSTRAINT kpi_definitions_company_code_uk
    UNIQUE(tenant_id, company_id, kpi_code)

CONSTRAINT kpi_definitions_company_fk
    FOREIGN KEY(tenant_id, company_id)
    REFERENCES companies(tenant_id, id)

CONSTRAINT kpi_definitions_aggregation_ck
    CHECK(aggregation_method IN ('SUM', 'EOP', 'AVG', 'MAX', 'MIN'))

CONSTRAINT kpi_definitions_direction_ck
    CHECK(direction IS NULL OR direction IN ('higher_is_better', 'lower_is_better'))
```

### 補足

#### aggregation_method の説明

| 値 | 説明 | 年計の扱い |
|----|------|----------|
| SUM | 合計 | 各期間の合計値 |
| EOP | 期末値 | 最終期間の値 |
| AVG | 平均 | 各期間の平均値 |
| MAX | 最大値 | 年計は非表示 |
| MIN | 最小値 | 年計は非表示 |

#### direction の説明

| 値 | 説明 |
|----|------|
| higher_is_better | 値が高いほど良い（例: 売上、顧客満足度） |
| lower_is_better | 値が低いほど良い（例: CO2排出量、不良品率） |

---

## 4. kpi_fact_amounts（非財務KPI予実）

### 仕様
非財務KPIの目標・実績を管理する。

### エンティティ

| カラム | 型 | NULL | 例 | 補足 |
|--------|---|------|-----|------|
| id | uuid | NO | | PK |
| tenant_id | uuid | NO | | RLS |
| company_id | uuid | NO | | FK to companies |
| kpi_event_id | uuid | NO | | FK to kpi_master_events |
| kpi_definition_id | uuid | NO | | FK to kpi_definitions |
| period_code | varchar(32) | NO | "2026-Q1" | 期間コード（自由入力） |
| period_start_date | date | YES | 2026-04-01 | 期間開始日（任意） |
| period_end_date | date | YES | 2026-06-30 | 期間終了日（任意） |
| target_value | numeric | YES | 100.0 | 目標値 |
| actual_value | numeric | YES | 95.0 | 実績値 |
| department_stable_id | varchar(50) | YES | | 部門別管理（任意、NULL=全社） |
| notes | text | YES | | 備考 |
| created_at | timestamptz | NO | | |
| updated_at | timestamptz | NO | | |
| created_by | uuid | YES | | 監査 |
| updated_by | uuid | YES | | 監査 |

### 制約

```sql
CONSTRAINT kpi_fact_amounts_uk
    UNIQUE(tenant_id, kpi_event_id, kpi_definition_id, period_code, department_stable_id)

CONSTRAINT kpi_fact_amounts_company_fk
    FOREIGN KEY(tenant_id, company_id)
    REFERENCES companies(tenant_id, id)

CONSTRAINT kpi_fact_amounts_event_fk
    FOREIGN KEY(tenant_id, kpi_event_id)
    REFERENCES kpi_master_events(tenant_id, id)

CONSTRAINT kpi_fact_amounts_definition_fk
    FOREIGN KEY(tenant_id, kpi_definition_id)
    REFERENCES kpi_definitions(tenant_id, id)

CONSTRAINT kpi_fact_amounts_period_ck
    CHECK(period_start_date IS NULL OR period_end_date IS NULL
        OR period_start_date <= period_end_date)
```

### 補足

#### 期間管理の考え方

| 期間コード例 | 説明 | period_start_date | period_end_date |
|------------|------|------------------|-----------------|
| 2026-Q1 | 2026年第1四半期 | 2026-04-01 | 2026-06-30 |
| 2026-04 | 2026年4月 | 2026-04-01 | 2026-04-30 |
| 2026-H1 | 2026年上半期 | 2026-04-01 | 2026-09-30 |
| 2026-ANNUAL | 2026年年間 | 2026-04-01 | 2027-03-31 |

- period_code: ユーザーが自由に定義可能（テキスト入力）
- period_start_date / period_end_date: 任意（期間の明示が必要な場合のみ）
- department_stable_id: 部門別管理（任意、NULL=全社）
- 一意制約: kpi_event_id + kpi_definition_id + period_code + department_stable_id

---

## 5. kpi_target_values（指標の目標値）

### 仕様
指標（metrics）の期間別目標値を管理する。

### エンティティ

| カラム | 型 | NULL | 例 | 補足 |
|--------|---|------|-----|------|
| id | uuid | NO | | PK |
| tenant_id | uuid | NO | | RLS |
| kpi_master_item_id | uuid | NO | | FK to kpi_master_items |
| period_code | varchar(32) | NO | "2026-Q1" | 期間コード |
| target_value | numeric | NO | 10.0 | 目標値 |
| created_at | timestamptz | NO | | |
| updated_at | timestamptz | NO | | |

### 制約

```sql
CONSTRAINT kpi_target_values_uk
    UNIQUE(tenant_id, kpi_master_item_id, period_code)

CONSTRAINT kpi_target_values_item_fk
    FOREIGN KEY(tenant_id, kpi_master_item_id)
    REFERENCES kpi_master_items(tenant_id, id)
```

### 補足
- 指標（kpi_type='METRIC'）の期間ごとの目標値を管理
- 実績値は構成要素から自動計算されるため、目標値のみ登録
- period_code は kpi_fact_amounts と同様に自由入力

---

## 6. 既存エンティティの変更

### 6.1 subjects（科目マスタ）

#### 変更内容

| 変更種別 | カラム | 型 | NULL | デフォルト | 補足 |
|---------|--------|---|------|----------|------|
| ADD_COL | kpi_managed | boolean | NO | false | KPI管理対象フラグ |

#### 補足
- kpi_managed=true の財務科目のみ、KPI管理マスタで選択可能
- 既存の subject_type='KPI' のデータは、kpi_managed=true の財務科目 or 非財務KPIへ移行

---

### 6.2 metrics（指標マスタ）

#### 変更内容

| 変更種別 | カラム | 型 | NULL | デフォルト | 補足 |
|---------|--------|---|------|----------|------|
| ADD_COL | kpi_managed | boolean | NO | false | KPI管理対象フラグ |

#### 補足
- kpi_managed=true の指標のみ、KPI管理マスタで選択可能
- 既存の指標マスタはそのまま残す

---

### 6.3 action_plans（アクションプラン）

#### 変更内容

| 変更種別 | カラム | 型 | NULL | 補足 |
|---------|--------|---|------|------|
| ALTER | subject_id | uuid | YES | nullable に変更 |
| ADD_COL | kpi_master_item_id | uuid | YES | FK to kpi_master_items |

#### 制約変更

```sql
-- 新規制約
CONSTRAINT action_plans_kpi_ref_ck
    CHECK(subject_id IS NOT NULL OR kpi_master_item_id IS NOT NULL)
-- どちらか1つは必須

CONSTRAINT action_plans_kpi_master_item_fk
    FOREIGN KEY(tenant_id, kpi_master_item_id)
    REFERENCES kpi_master_items(tenant_id, id)
```

#### 補足
- 従来の subject_id ベースのプランは互換性維持
- 新規プランは kpi_master_item_id を推奨
- Level 3（アクションプラン）は action_plans で管理
- kpi_master_item_id で Level 2（KPI）に紐付け

---

## 7. データ関連図

### 7.1 全体構造

```
┌──────────────────────────┐
│  kpi_master_events       │  年度単位のKPI管理イベント
│  (FY2026 KPI管理)        │
└──────────────────────────┘
            │ 1:N
            ▼
┌──────────────────────────┐
│   kpi_master_items       │  KPI管理項目
│   Level 1: KGI           │  (財務/非財務/指標)
│   Level 2: KPI           │
└──────────────────────────┘
     │         │         │
     │ N:1     │ N:1     │ N:1
     ▼         ▼         ▼
┌────────┐ ┌────────────────┐ ┌────────┐
│subjects│ │kpi_definitions │ │metrics │
│(財務)  │ │(非財務)        │ │(指標)  │
│kpi_    │ │                │ │kpi_    │
│managed │ │                │ │managed │
│=true   │ │                │ │=true   │
└────────┘ └────────────────┘ └────────┘
     │              │              │
     │ 予実         │ 予実         │ 目標
     ▼              ▼              ▼
┌──────────────┐ ┌─────────────────┐ ┌──────────────┐
│fact_amounts  │ │kpi_fact_amounts │ │kpi_target_   │
│(財務予実)    │ │(非財務予実)     │ │values        │
│              │ │                 │ │(指標目標)    │
└──────────────┘ └─────────────────┘ └──────────────┘
```

### 7.2 階層構造

```
┌──────────────────────────┐
│   kpi_master_items       │
│   Level 1/2              │
└──────────────────────────┘
            │ 1:N
            ▼
┌──────────────────────────┐
│     action_plans         │  Level 3相当
│  (kpi_master_item_id)    │
└──────────────────────────┘
            │ 1:N
            ▼
┌──────────────────────────┐
│       wbs_items          │  WBS項目
└──────────────────────────┘
            │ 1:N
            ▼
┌──────────────────────────┐
│   action_plan_tasks      │  タスク
└──────────────────────────┘
```

---

## 8. インデックス推奨

### 8.1 kpi_master_items

```sql
CREATE INDEX idx_kpi_master_items_event ON kpi_master_items(tenant_id, kpi_event_id);
CREATE INDEX idx_kpi_master_items_parent ON kpi_master_items(tenant_id, parent_kpi_item_id);
CREATE INDEX idx_kpi_master_items_dept ON kpi_master_items(tenant_id, department_stable_id);
```

### 8.2 kpi_fact_amounts

```sql
CREATE INDEX idx_kpi_fact_amounts_event_def ON kpi_fact_amounts(tenant_id, kpi_event_id, kpi_definition_id);
CREATE INDEX idx_kpi_fact_amounts_dept ON kpi_fact_amounts(tenant_id, department_stable_id);
```

### 8.3 action_plans

```sql
CREATE INDEX idx_action_plans_kpi_item ON action_plans(tenant_id, kpi_master_item_id);
-- 既存の subject_id インデックスは維持
```

---

## 9. 移行方針

### 9.1 subjects.subject_type='KPI' の移行

#### ステップ1: 財務科目への変換

```sql
UPDATE subjects
SET subject_type = 'FIN',
    kpi_managed = true,
    updated_at = now()
WHERE subject_type = 'KPI'
  AND [財務科目判定条件];
```

#### ステップ2: 非財務KPIへの移行

```sql
INSERT INTO kpi_definitions (
    id, tenant_id, company_id, kpi_code, kpi_name,
    description, unit, aggregation_method,
    is_active, created_at, updated_at
)
SELECT
    gen_random_uuid(),
    tenant_id, company_id, subject_code, subject_name,
    notes, unit, aggregation_method,
    is_active, created_at, updated_at
FROM subjects
WHERE subject_type = 'KPI'
  AND [非財務判定条件];
```

#### ステップ3: 旧KPI科目の無効化

```sql
UPDATE subjects
SET is_active = false,
    updated_at = now()
WHERE subject_type = 'KPI';
```

### 9.2 action_plans の移行

#### kpi_master_items の作成（既存APが参照しているKPI科目から）

```sql
INSERT INTO kpi_master_items (
    id, tenant_id, kpi_event_id, kpi_code, kpi_name,
    kpi_type, ref_subject_id, hierarchy_level, sort_order
)
SELECT DISTINCT
    gen_random_uuid(),
    s.tenant_id,
    [年度のKPI管理イベントID],
    s.subject_code,
    s.subject_name,
    'FINANCIAL',
    s.id,
    2, -- Level 2（KPI）
    row_number() OVER (PARTITION BY s.tenant_id ORDER BY s.subject_code)
FROM action_plans ap
JOIN subjects s ON ap.subject_id = s.id
WHERE s.kpi_managed = true;
```

#### action_plans の更新

```sql
UPDATE action_plans ap
SET kpi_master_item_id = kmi.id,
    updated_at = now()
FROM kpi_master_items kmi
WHERE ap.subject_id = kmi.ref_subject_id
  AND ap.tenant_id = kmi.tenant_id;
```

---

## 10. 関連ドキュメント

- `.kiro/specs/仕様概要/KPI管理マスタ機能仕様_確定版.md` - 機能仕様
- `.kiro/specs/仕様検討/20260125_KPI管理マスタ仕様検討.md` - 検討記録
- `.kiro/specs/仕様概要/KPIアクションプラン管理_変更案.md` - 全体変更案
- `.kiro/specs/仕様概要/KPI管理_エンティティ変更サマリ.md` - エンティティ変更詳細

---

## 11. 変更履歴

| 日付 | 変更内容 | 担当 |
|------|---------|------|
| 2026-01-25 | 初版作成（壁打ち検討結果を反映） | Claude Code |
