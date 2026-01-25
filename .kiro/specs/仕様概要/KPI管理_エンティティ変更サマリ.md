# KPI管理機能 エンティティ変更サマリ（2026-01-22）

## 概要

2026-01-22の検討メモに基づき、KPI管理機能のエンティティ設計変更をサマリ形式で整理。

---

## 変更サマリ

| # | エンティティ | 変更種別 | 変更内容 | 理由 |
|---|-------------|---------|---------|------|
| 1 | subjects | ALTER | subject_type から 'KPI' 値を廃止 | 非財務KPIは別マスタで管理 |
| 2 | subjects | ADD_COL | kpi_managed フラグ追加 | 財務科目のKPI管理フラグ |
| 3 | metrics | ADD_COL | kpi_managed フラグ追加 | 指標のKPI管理フラグ |
| 4 | kpi_master_events | ADD | 新規エンティティ | 年度単位のKPI管理イベント |
| 5 | kpi_master_items | ADD | 新規エンティティ | KPI管理項目（財務/非財務/指標） |
| 6 | kpi_definitions | ADD | 新規エンティティ | 非財務KPI定義 |
| 7 | kpi_fact_amounts | ADD | 新規エンティティ | 非財務KPI予実管理 |
| 8 | action_plans | ALTER | subject_id を nullable に変更 | 従来の科目紐付けと新方式の共存 |
| 9 | action_plans | ADD_COL | kpi_master_item_id 追加 | 新方式のKPI紐付け |

---

## 1. 既存エンティティの変更

### 1.1 subjects（科目マスタ）

#### 変更内容

| 変更種別 | カラム | 型 | NULL | デフォルト | 補足 |
|---------|--------|---|------|----------|------|
| ALTER | subject_type | varchar(20) | NO | - | 'KPI' 値を廃止、'FIN' のみ使用 |
| ADD_COL | kpi_managed | boolean | NO | false | KPI管理対象フラグ |

#### 制約変更

```sql
-- 旧制約（廃止）
CHECK(subject_type IN ('FIN', 'KPI'))

-- 新制約
CHECK(subject_type = 'FIN')
```

#### 補足
- 既存の subject_type='KPI' データは移行が必要
- kpi_managed=true の科目のみ、KPI管理マスタで選択可能

---

### 1.2 metrics（指標マスタ）

#### 変更内容

| 変更種別 | カラム | 型 | NULL | デフォルト | 補足 |
|---------|--------|---|------|----------|------|
| ADD_COL | kpi_managed | boolean | NO | false | KPI管理対象フラグ |

#### 補足
- kpi_managed=true の指標のみ、KPI管理マスタで選択可能
- 指標自体の予実管理はしない（構成要素で自動計算）

---

### 1.3 action_plans（アクションプラン）

#### 変更内容

| 変更種別 | カラム | 型 | NULL | 補足 |
|---------|--------|---|------|------|
| ALTER | subject_id | uuid | YES | 従来の NOT NULL から nullable に変更 |
| ADD_COL | kpi_master_item_id | uuid | YES | FK to kpi_master_items |

#### 制約変更

```sql
-- 新規制約
CHECK(subject_id IS NOT NULL OR kpi_master_item_id IS NOT NULL)
-- どちらか1つは必須

FK(tenant_id, kpi_master_item_id) → kpi_master_items(tenant_id, id)
```

#### 補足
- 従来の subject_id ベースのプランは互換性維持
- 新規プランは kpi_master_item_id を推奨
- 移行期間中は両方式が混在可能

---

## 2. 新規エンティティ

### 2.1 kpi_master_events（KPI管理イベント）

#### 概要
年度単位のKPI管理の枠を定義する。

#### エンティティ定義

```sql
CREATE TABLE kpi_master_events (
    id uuid PRIMARY KEY,
    tenant_id uuid NOT NULL,
    company_id uuid NOT NULL,
    event_code varchar(50) NOT NULL,
    event_name varchar(200) NOT NULL,
    fiscal_year int NOT NULL,
    status varchar(20) NOT NULL DEFAULT 'DRAFT',
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid,
    updated_by uuid,

    CONSTRAINT kpi_master_events_tenant_code_uk
        UNIQUE(tenant_id, company_id, event_code),
    CONSTRAINT kpi_master_events_company_fk
        FOREIGN KEY(tenant_id, company_id)
        REFERENCES companies(tenant_id, id),
    CONSTRAINT kpi_master_events_status_ck
        CHECK(status IN ('DRAFT', 'CONFIRMED'))
);
```

#### 補足
- fiscal_year: 対象会計年度（例: 2026）
- status: DRAFT（編集可）/ CONFIRMED（確定、編集不可）
- 同一年度で複数イベント作成可能（過去年度の履歴保持）

---

### 2.2 kpi_master_items（KPI管理項目）

#### 概要
KPI管理イベントに紐づく具体的なKPI項目を定義。財務科目・非財務KPI・指標の3種類から選択。

#### エンティティ定義

```sql
CREATE TABLE kpi_master_items (
    id uuid PRIMARY KEY,
    tenant_id uuid NOT NULL,
    kpi_event_id uuid NOT NULL,
    kpi_code varchar(50) NOT NULL,
    kpi_name varchar(200) NOT NULL,
    kpi_type varchar(20) NOT NULL,
    ref_subject_id uuid,
    ref_kpi_definition_id uuid,
    ref_metric_id uuid,
    department_stable_id varchar(50),
    owner_employee_id uuid,
    sort_order int NOT NULL DEFAULT 1,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT kpi_master_items_event_code_uk
        UNIQUE(tenant_id, kpi_event_id, kpi_code),
    CONSTRAINT kpi_master_items_event_fk
        FOREIGN KEY(tenant_id, kpi_event_id)
        REFERENCES kpi_master_events(tenant_id, id),
    CONSTRAINT kpi_master_items_subject_fk
        FOREIGN KEY(tenant_id, ref_subject_id)
        REFERENCES subjects(tenant_id, id),
    CONSTRAINT kpi_master_items_definition_fk
        FOREIGN KEY(tenant_id, ref_kpi_definition_id)
        REFERENCES kpi_definitions(tenant_id, id),
    CONSTRAINT kpi_master_items_metric_fk
        FOREIGN KEY(tenant_id, ref_metric_id)
        REFERENCES metrics(tenant_id, id),
    CONSTRAINT kpi_master_items_employee_fk
        FOREIGN KEY(tenant_id, owner_employee_id)
        REFERENCES employees(tenant_id, id),
    CONSTRAINT kpi_master_items_type_ck
        CHECK(kpi_type IN ('FINANCIAL', 'NON_FINANCIAL', 'METRIC')),
    CONSTRAINT kpi_master_items_ref_ck
        CHECK(
            (kpi_type = 'FINANCIAL' AND ref_subject_id IS NOT NULL
                AND ref_kpi_definition_id IS NULL AND ref_metric_id IS NULL)
            OR (kpi_type = 'NON_FINANCIAL' AND ref_subject_id IS NULL
                AND ref_kpi_definition_id IS NOT NULL AND ref_metric_id IS NULL)
            OR (kpi_type = 'METRIC' AND ref_subject_id IS NULL
                AND ref_kpi_definition_id IS NULL AND ref_metric_id IS NOT NULL)
        )
);
```

#### kpi_type 説明

| 値 | 説明 | 参照先 | 予実データソース |
|----|------|-------|----------------|
| FINANCIAL | 財務科目 | ref_subject_id | fact_amounts |
| NON_FINANCIAL | 非財務KPI | ref_kpi_definition_id | kpi_fact_amounts |
| METRIC | 指標 | ref_metric_id | 自動計算（予実管理なし） |

#### 補足
- ref_xxx_id は kpi_type に応じて1つのみ NOT NULL
- department_stable_id: 責任部門（任意、NULL=全社）
- owner_employee_id: 責任者（任意）

---

### 2.3 kpi_definitions（非財務KPI定義）

#### 概要
非財務のKPI項目を定義する。

#### エンティティ定義

```sql
CREATE TABLE kpi_definitions (
    id uuid PRIMARY KEY,
    tenant_id uuid NOT NULL,
    company_id uuid NOT NULL,
    kpi_code varchar(50) NOT NULL,
    kpi_name varchar(200) NOT NULL,
    description text,
    unit varchar(30),
    aggregation_method varchar(20) NOT NULL DEFAULT 'SUM',
    direction varchar(20),
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid,
    updated_by uuid,

    CONSTRAINT kpi_definitions_company_code_uk
        UNIQUE(tenant_id, company_id, kpi_code),
    CONSTRAINT kpi_definitions_company_fk
        FOREIGN KEY(tenant_id, company_id)
        REFERENCES companies(tenant_id, id),
    CONSTRAINT kpi_definitions_aggregation_ck
        CHECK(aggregation_method IN ('SUM', 'EOP', 'AVG', 'MAX', 'MIN')),
    CONSTRAINT kpi_definitions_direction_ck
        CHECK(direction IS NULL OR direction IN ('higher_is_better', 'lower_is_better'))
);
```

#### aggregation_method 説明

| 値 | 説明 | 年計の扱い |
|----|------|----------|
| SUM | 合計 | 各期間の合計値 |
| EOP | 期末値 | 最終期間の値 |
| AVG | 平均 | 各期間の平均値 |
| MAX | 最大値 | 年計は非表示 |
| MIN | 最小値 | 年計は非表示 |

#### 補足
- unit: 単位（%, 件, 人, t 等）
- direction: 増減の良し悪し（higher_is_better / lower_is_better）
- レイアウトマスタは使用しない（シンプルな入力画面）

---

### 2.4 kpi_fact_amounts（非財務KPI予実）

#### 概要
非財務KPIの目標・実績を管理する。

#### エンティティ定義

```sql
CREATE TABLE kpi_fact_amounts (
    id uuid PRIMARY KEY,
    tenant_id uuid NOT NULL,
    company_id uuid NOT NULL,
    kpi_event_id uuid NOT NULL,
    kpi_definition_id uuid NOT NULL,
    period_code varchar(32) NOT NULL,
    period_start_date date,
    period_end_date date,
    target_value numeric,
    actual_value numeric,
    department_stable_id varchar(50),
    notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid,
    updated_by uuid,

    CONSTRAINT kpi_fact_amounts_uk
        UNIQUE(tenant_id, kpi_event_id, kpi_definition_id, period_code, department_stable_id),
    CONSTRAINT kpi_fact_amounts_company_fk
        FOREIGN KEY(tenant_id, company_id)
        REFERENCES companies(tenant_id, id),
    CONSTRAINT kpi_fact_amounts_event_fk
        FOREIGN KEY(tenant_id, kpi_event_id)
        REFERENCES kpi_master_events(tenant_id, id),
    CONSTRAINT kpi_fact_amounts_definition_fk
        FOREIGN KEY(tenant_id, kpi_definition_id)
        REFERENCES kpi_definitions(tenant_id, id),
    CONSTRAINT kpi_fact_amounts_period_ck
        CHECK(period_start_date IS NULL OR period_end_date IS NULL
            OR period_start_date <= period_end_date)
);
```

#### 期間管理の考え方

| 期間コード例 | 説明 | period_start_date | period_end_date |
|------------|------|------------------|-----------------|
| 2026-Q1 | 2026年第1四半期 | 2026-04-01 | 2026-06-30 |
| 2026-04 | 2026年4月 | 2026-04-01 | 2026-04-30 |
| 2026-H1 | 2026年上半期 | 2026-04-01 | 2026-09-30 |
| 2026-ANNUAL | 2026年年間 | 2026-04-01 | 2027-03-31 |

#### 補足
- period_code: ユーザーが自由に定義可能（テキスト入力）
- period_start_date / period_end_date: 任意（期間の明示が必要な場合のみ）
- department_stable_id: 部門別管理（任意、NULL=全社）
- 一意制約: kpi_event_id + kpi_definition_id + period_code + department_stable_id

---

## 3. エンティティ関連図

### 3.1 全体構造

```
┌──────────────────────────┐
│  kpi_master_events       │  年度単位のKPI管理イベント
│  (FY2026 KPI管理)        │
└──────────────────────────┘
            │ 1:N
            ▼
┌──────────────────────────┐
│   kpi_master_items       │  KPI管理項目
│   (財務/非財務/指標)      │
└──────────────────────────┘
     │         │         │
     │ N:1     │ N:1     │ N:1
     ▼         ▼         ▼
┌────────┐ ┌────────────────┐ ┌────────┐
│subjects│ │kpi_definitions │ │metrics │
│(財務)  │ │(非財務)        │ │(指標)  │
└────────┘ └────────────────┘ └────────┘
     │              │
     │ 予実         │ 予実
     ▼              ▼
┌──────────────┐ ┌─────────────────┐
│fact_amounts  │ │kpi_fact_amounts │
│(財務予実)    │ │(非財務予実)     │
└──────────────┘ └─────────────────┘
```

### 3.2 アクションプラン連携

```
┌──────────────────────────┐
│   kpi_master_items       │
└──────────────────────────┘
            │ 1:N
            ▼
┌──────────────────────────┐
│     action_plans         │  アクションプラン
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

## 4. データ移行方針

### 4.1 subjects.subject_type='KPI' の移行

#### ステップ1: 移行先の判定

```sql
-- 財務科目として扱う場合
SELECT id, subject_code, subject_name
FROM subjects
WHERE subject_type = 'KPI'
  AND [財務科目判定条件];

-- 非財務として扱う場合
SELECT id, subject_code, subject_name
FROM subjects
WHERE subject_type = 'KPI'
  AND [非財務判定条件];
```

#### ステップ2: 財務科目への変換

```sql
UPDATE subjects
SET subject_type = 'FIN',
    kpi_managed = true,
    updated_at = now()
WHERE subject_type = 'KPI'
  AND [財務科目判定条件];
```

#### ステップ3: 非財務KPIへの移行

```sql
INSERT INTO kpi_definitions (
    id, tenant_id, company_id, kpi_code, kpi_name,
    description, unit, aggregation_method, direction,
    is_active, created_at, updated_at
)
SELECT
    gen_random_uuid(),
    tenant_id,
    company_id,
    subject_code,
    subject_name,
    notes,
    unit,
    aggregation_method,
    direction,
    is_active,
    created_at,
    updated_at
FROM subjects
WHERE subject_type = 'KPI'
  AND [非財務判定条件];
```

#### ステップ4: 旧KPI科目の無効化

```sql
UPDATE subjects
SET is_active = false,
    updated_at = now()
WHERE subject_type = 'KPI'
  AND id IN (SELECT id FROM [移行完了したレコード]);
```

---

### 4.2 fact_amounts のKPIデータ移行

#### ステップ1: 移行対象の抽出

```sql
-- 非財務として移行する必要があるデータ
SELECT fa.*
FROM fact_amounts fa
JOIN subjects s ON fa.subject_id = s.id
WHERE s.subject_type = 'KPI'
  AND [非財務判定条件];
```

#### ステップ2: kpi_fact_amounts への移行

```sql
INSERT INTO kpi_fact_amounts (
    id, tenant_id, company_id, kpi_event_id, kpi_definition_id,
    period_code, period_start_date, period_end_date,
    target_value, actual_value, department_stable_id,
    created_at, updated_at, created_by, updated_by
)
SELECT
    gen_random_uuid(),
    fa.tenant_id,
    fa.company_id,
    [KPI管理イベントID],
    kd.id,
    TO_CHAR(ap.period_start_date, 'YYYY-MM'),
    ap.period_start_date,
    ap.period_end_date,
    CASE WHEN fa.scenario_type = 'BUDGET' THEN fa.amount ELSE NULL END,
    CASE WHEN fa.scenario_type = 'ACTUAL' THEN fa.amount ELSE NULL END,
    fa.department_stable_id,
    fa.created_at,
    fa.updated_at,
    fa.created_by,
    fa.updated_by
FROM fact_amounts fa
JOIN subjects s ON fa.subject_id = s.id
JOIN kpi_definitions kd ON kd.kpi_code = s.subject_code
JOIN accounting_periods ap ON fa.accounting_period_id = ap.id
WHERE s.subject_type = 'KPI'
  AND [非財務判定条件];
```

---

### 4.3 action_plans の移行

#### ステップ1: kpi_master_items の作成

```sql
-- 既存のアクションプランが参照しているKPI科目から
-- kpi_master_items を自動生成
INSERT INTO kpi_master_items (
    id, tenant_id, kpi_event_id, kpi_code, kpi_name,
    kpi_type, ref_subject_id, sort_order
)
SELECT DISTINCT
    gen_random_uuid(),
    s.tenant_id,
    [年度のKPI管理イベントID],
    s.subject_code,
    s.subject_name,
    'FINANCIAL',
    s.id,
    row_number() OVER (PARTITION BY s.tenant_id ORDER BY s.subject_code)
FROM action_plans ap
JOIN subjects s ON ap.subject_id = s.id
WHERE s.kpi_managed = true;
```

#### ステップ2: action_plans の更新

```sql
-- kpi_master_item_id を設定
UPDATE action_plans ap
SET kpi_master_item_id = kmi.id,
    updated_at = now()
FROM kpi_master_items kmi
WHERE ap.subject_id = kmi.ref_subject_id
  AND ap.tenant_id = kmi.tenant_id;
```

---

## 5. 実装順序

### Phase 1: エンティティ作成
1. kpi_definitions テーブル作成
2. kpi_master_events テーブル作成
3. kpi_master_items テーブル作成
4. kpi_fact_amounts テーブル作成

### Phase 2: 既存エンティティ変更
1. subjects に kpi_managed カラム追加
2. metrics に kpi_managed カラム追加
3. action_plans に kpi_master_item_id カラム追加
4. action_plans の subject_id を nullable に変更

### Phase 3: データ移行
1. subjects.subject_type='KPI' の判定・移行
2. fact_amounts のKPIデータ移行
3. action_plans の kpi_master_item_id 設定

### Phase 4: UseCase/Repository実装
1. KPI管理マスタ CRUD
2. 非財務KPI予実入力
3. アクションプラン登録の改修

### Phase 5: UI実装
1. KPI管理マスタ登録画面
2. 非財務KPI入力画面
3. アクションプラン登録画面の改修
4. KPI連携ダッシュボードの改修

---

## 6. 注意事項

### 6.1 互換性維持

- 既存の action_plans.subject_id は当面維持
- 新規アクションプランは kpi_master_item_id を推奨
- 移行期間中は両方式が混在可能

### 6.2 制約の厳格化

- subjects.subject_type は 'FIN' のみ許可
- kpi_master_items の ref_xxx_id は排他的（1つのみ NOT NULL）
- action_plans は subject_id または kpi_master_item_id のいずれか必須

### 6.3 データ整合性

- kpi_managed=true の科目・指標のみ、KPI管理マスタで選択可能
- 財務科目のKPI予実は fact_amounts を参照
- 非財務KPIの予実は kpi_fact_amounts を参照
- 指標は予実管理なし（自動計算のみ）

---

## 7. 関連ドキュメント

- [KPIアクションプラン管理_変更案.md](KPIアクションプラン管理_変更案.md) - 仕様変更案の全体像
- `.kiro/specs/仕様検討/20260122_KPIアクションプラン管理機能レビュー・検討` - 検討メモ
- `.kiro/specs/entities/01_各種マスタ.md` - 既存エンティティ定義
