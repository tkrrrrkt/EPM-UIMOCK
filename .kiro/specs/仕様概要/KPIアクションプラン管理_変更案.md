# KPIアクションプラン管理 仕様変更案（2026-01-22検討）

## 概要

2026-01-22の検討メモに基づき、KPI管理機能とアクションプラン管理機能の仕様を再整理。
主な変更点は以下の通り：

1. **科目マスタのKPI区分を廃止** - KPI管理マスタを新設
2. **財務/非財務の管理方法を分離** - 財務はフラグ管理、非財務は専用マスタ
3. **予実管理テーブルの分離** - 財務と非財務で別ファクトテーブル
4. **アクションプラン登録時の選択肢拡張** - 財務科目・非財務KPI・指標から選択可能

---

## 1. 従来設計からの主要変更点

### 1.1 科目マスタ（subjects）の変更

#### 従来設計
```
subjects
├── subject_type = 'FIN'  → 財務科目
└── subject_type = 'KPI'  → 非財務KPI科目
```

#### 新設計
```
subjects
└── subject_type = 'FIN' のみ
    └── kpi_managed = true/false  → KPI管理フラグ
```

**変更理由**：
- 非財務KPI項目は科目マスタとは別に管理する
- 財務科目のうち、一部をKPI管理対象にできる柔軟性を持たせる

---

### 1.2 KPI管理マスタの新設

#### 新規エンティティ構成
```
kpi_master_events（年度単位のKPI管理イベント）
    │ 1:N
    └── kpi_master_items（KPI管理項目）
            ├── 財務科目参照（subjects.kpi_managed=true）
            ├── 非財務KPI項目（kpi_definitions）
            └── 指標参照（metrics.kpi_managed=true）
```

**目的**：
- 年度ごとに「この年度はこれらのKPIを管理する」を明確化
- 財務・非財務・指標を統一的に扱える

---

### 1.3 予実管理テーブルの分離

#### 従来設計
```
fact_amounts（財務・KPI共用）
├── scenario_type = 'BUDGET'  → 財務予算
├── scenario_type = 'ACTUAL'  → 財務実績
└── scenario_type でKPI目標・実績も管理
```

#### 新設計
```
fact_amounts（財務専用）
├── scenario_type = 'BUDGET'
├── scenario_type = 'ACTUAL'
└── scenario_type = 'FORECAST'

kpi_fact_amounts（非財務KPI専用）
├── target（目標）
└── actual（実績）
```

**変更理由**：
- 財務科目のKPI管理は、承認済み予算・見込・実績を参照する
- 非財務KPIは、シンプルな目標・実績の入力のみ（レイアウトマスタ不要）
- データ構造を分離して管理負荷を下げる

---

### 1.4 指標マスタ（metrics）の変更

#### 従来設計
```
metrics（財務指標のみ）
└── 売上高利益率、当座比率等
```

#### 新設計
```
metrics
└── kpi_managed = true/false  → KPI管理フラグ
```

**変更理由**：
- 財務指標（営業利益率等）もKPI管理対象にできる
- 指標自体の予実管理はしない（構成要素で自動計算される）

---

## 2. 新規エンティティ詳細

### 2.1 kpi_master_events（KPI管理イベント）

年度単位のKPI管理の枠を定義する。

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

#### 制約
- UNIQUE(tenant_id, company_id, event_code)
- FK(tenant_id, company_id) → companies(tenant_id, id)
- CHECK(status IN ('DRAFT', 'CONFIRMED'))

---

### 2.2 kpi_master_items（KPI管理項目）

KPI管理イベントに紐づく具体的なKPI項目を定義する。

| カラム | 型 | NULL | 例 | 補足 |
|--------|---|------|-----|------|
| id | uuid | NO | | PK |
| tenant_id | uuid | NO | | RLS |
| kpi_event_id | uuid | NO | | FK to kpi_master_events |
| kpi_code | varchar(50) | NO | "KPI_SALES_GROWTH" | イベント内一意 |
| kpi_name | varchar(200) | NO | "売上高成長率" | |
| kpi_type | varchar(20) | NO | "FINANCIAL" | FINANCIAL/NON_FINANCIAL/METRIC |
| ref_subject_id | uuid | YES | | 財務科目参照（kpi_type=FINANCIAL） |
| ref_kpi_definition_id | uuid | YES | | 非財務KPI参照（kpi_type=NON_FINANCIAL） |
| ref_metric_id | uuid | YES | | 指標参照（kpi_type=METRIC） |
| department_stable_id | varchar(50) | YES | | 責任部門（任意） |
| owner_employee_id | uuid | YES | | 責任者（任意） |
| sort_order | int | NO | 1 | 表示順 |
| is_active | boolean | NO | true | |
| created_at | timestamptz | NO | | |
| updated_at | timestamptz | NO | | |

#### 制約
- UNIQUE(tenant_id, kpi_event_id, kpi_code)
- FK(tenant_id, kpi_event_id) → kpi_master_events(tenant_id, id)
- FK(tenant_id, ref_subject_id) → subjects(tenant_id, id)
- FK(tenant_id, ref_kpi_definition_id) → kpi_definitions(tenant_id, id)
- FK(tenant_id, ref_metric_id) → metrics(tenant_id, id)
- FK(tenant_id, owner_employee_id) → employees(tenant_id, id)
- CHECK(kpi_type IN ('FINANCIAL', 'NON_FINANCIAL', 'METRIC'))
- CHECK(
    (kpi_type = 'FINANCIAL' AND ref_subject_id IS NOT NULL AND ref_kpi_definition_id IS NULL AND ref_metric_id IS NULL)
    OR (kpi_type = 'NON_FINANCIAL' AND ref_subject_id IS NULL AND ref_kpi_definition_id IS NOT NULL AND ref_metric_id IS NULL)
    OR (kpi_type = 'METRIC' AND ref_subject_id IS NULL AND ref_kpi_definition_id IS NULL AND ref_metric_id IS NOT NULL)
)

#### 補足
- `kpi_type` に応じて、3つの参照カラムのうち1つのみが NOT NULL になる
- 財務科目の場合、subjects.kpi_managed = true の科目のみ参照可能（UseCase で検証）
- 指標の場合、metrics.kpi_managed = true の指標のみ参照可能（UseCase で検証）

---

### 2.3 kpi_definitions（非財務KPI定義）

非財務のKPI項目を定義する。

| カラム | 型 | NULL | 例 | 補足 |
|--------|---|------|-----|------|
| id | uuid | NO | | PK |
| tenant_id | uuid | NO | | RLS |
| company_id | uuid | NO | | FK to companies |
| kpi_code | varchar(50) | NO | "KPI_CO2_REDUCTION" | 会社内一意 |
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

#### 制約
- UNIQUE(tenant_id, company_id, kpi_code)
- FK(tenant_id, company_id) → companies(tenant_id, id)
- CHECK(aggregation_method IN ('SUM', 'EOP', 'AVG', 'MAX', 'MIN'))
- CHECK(direction IS NULL OR direction IN ('higher_is_better', 'lower_is_better'))

---

### 2.4 kpi_fact_amounts（非財務KPI予実）

非財務KPIの目標・実績を管理する。

| カラム | 型 | NULL | 例 | 補足 |
|--------|---|------|-----|------|
| id | uuid | NO | | PK |
| tenant_id | uuid | NO | | RLS |
| company_id | uuid | NO | | FK to companies |
| kpi_event_id | uuid | NO | | FK to kpi_master_events |
| kpi_definition_id | uuid | NO | | FK to kpi_definitions |
| period_code | varchar(32) | NO | "2026-Q1" | 期間コード（自由入力） |
| period_start_date | date | YES | | 期間開始日（任意） |
| period_end_date | date | YES | | 期間終了日（任意） |
| target_value | numeric | YES | 100.0 | 目標値 |
| actual_value | numeric | YES | 95.0 | 実績値 |
| department_stable_id | varchar(50) | YES | | 部門別管理（任意） |
| notes | text | YES | | 備考 |
| created_at | timestamptz | NO | | |
| updated_at | timestamptz | NO | | |
| created_by | uuid | YES | | 監査 |
| updated_by | uuid | YES | | 監査 |

#### 制約
- UNIQUE(tenant_id, kpi_event_id, kpi_definition_id, period_code, department_stable_id)
- FK(tenant_id, company_id) → companies(tenant_id, id)
- FK(tenant_id, kpi_event_id) → kpi_master_events(tenant_id, id)
- FK(tenant_id, kpi_definition_id) → kpi_definitions(tenant_id, id)
- CHECK(period_start_date IS NULL OR period_end_date IS NULL OR period_start_date <= period_end_date)

#### 補足
- `period_code` はユーザーが自由に定義可能（"2026-Q1", "2026-04", "2026-H1" 等）
- 期間の軸（月/四半期/半期/年）は固定せず、テキスト入力で柔軟に対応
- 単位マスタは不要（kpi_definitions.unit を参照）
- department_stable_id による部門別管理は任意（NULL = 全社）

---

### 2.5 既存エンティティの変更

#### subjects（科目マスタ）

| 変更種別 | カラム | 型 | NULL | 補足 |
|---------|--------|---|------|------|
| ADD_COL | kpi_managed | boolean | NO | KPI管理フラグ（デフォルト: false） |
| ALTER | subject_type | varchar(20) | NO | 'KPI' 値を廃止、'FIN' のみ使用 |

- subject_type = 'KPI' のデータは kpi_definitions への移行が必要
- 既存の KPI 科目は、kpi_managed = true の財務科目として扱うか、非財務に移行するか判断

#### metrics（指標マスタ）

| 変更種別 | カラム | 型 | NULL | 補足 |
|---------|--------|---|------|------|
| ADD_COL | kpi_managed | boolean | NO | KPI管理フラグ（デフォルト: false） |

- 既存の指標マスタはそのまま残す
- KPI管理対象にする場合のみ kpi_managed = true に設定

#### action_plans（アクションプラン）

| 変更種別 | カラム | 型 | NULL | 補足 |
|---------|--------|---|------|------|
| ALTER | subject_id | uuid | NO → YES | nullable に変更 |
| ADD_COL | kpi_master_item_id | uuid | YES | FK to kpi_master_items |

- `subject_id` と `kpi_master_item_id` のいずれか1つを必須とする（CHECK制約）
- CHECK(subject_id IS NOT NULL OR kpi_master_item_id IS NOT NULL)
- 従来の subject_id ベースのプランは互換性維持
- 新規プランは kpi_master_item_id を推奨

---

## 3. データフロー図

### 3.1 KPI管理マスタの構造

```
kpi_master_events（年度単位のKPI管理）
    │ 1:N
    └── kpi_master_items（KPI項目）
            ├─→ subjects（財務科目、kpi_managed=true）
            ├─→ kpi_definitions（非財務KPI）
            └─→ metrics（指標、kpi_managed=true）
```

### 3.2 予実データの流れ

#### 財務科目のKPI管理
```
subjects (kpi_managed=true)
    ↓ 参照
kpi_master_items (kpi_type='FINANCIAL')
    ↓ 予実データは fact_amounts から取得
fact_amounts
├── scenario_type = 'BUDGET'  → 承認済み予算
├── scenario_type = 'FORECAST' → 見込
└── scenario_type = 'ACTUAL'   → 実績
```

#### 非財務KPIの管理
```
kpi_definitions（非財務KPI定義）
    ↓ 参照
kpi_master_items (kpi_type='NON_FINANCIAL')
    ↓ 予実データは専用テーブル
kpi_fact_amounts
├── target_value  → 目標
└── actual_value  → 実績
```

#### 指標のKPI管理
```
metrics (kpi_managed=true)
    ↓ 参照
kpi_master_items (kpi_type='METRIC')
    ↓ 計算結果を表示（予実管理なし）
構成要素の fact_amounts から自動計算
```

### 3.3 アクションプラン連携

```
kpi_master_items（年度KPI項目）
    ↓ 1:N
action_plans（アクションプラン）
    ↓ 1:N
wbs_items（WBS）
    ↓ 1:N
action_plan_tasks（タスク）
```

---

## 4. UI設計の変更点

### 4.1 KPI管理マスタ登録画面（新規）

#### 画面構成
```
┌─────────────────────────────────────────────────────────────┐
│ KPI管理マスタ登録 - 2026年度                                 │
├─────────────────────────────────────────────────────────────┤
│ [+ KPI項目追加]                                             │
│                                                             │
│ KPI項目一覧                                                 │
│ ┌───────────┬────────┬──────────────┬──────┬─────────┐     │
│ │ KPIコード │ KPI名  │ 種別         │ 参照 │ 責任者  │     │
│ ├───────────┼────────┼──────────────┼──────┼─────────┤     │
│ │ KPI_001   │ 売上高 │ 財務科目     │ 4010 │ 営業部  │     │
│ │ KPI_002   │ CO2削減│ 非財務KPI    │ -    │ 総務部  │     │
│ │ KPI_003   │ 営業利益率│ 指標      │ -    │ 経営企画│     │
│ └───────────┴────────┴──────────────┴──────┴─────────┘     │
└─────────────────────────────────────────────────────────────┘
```

#### KPI項目追加モーダル
```
┌─────────────────────────────────────────────────────────────┐
│ KPI項目追加                                                 │
├─────────────────────────────────────────────────────────────┤
│ KPI種別: ● 財務科目  ○ 非財務KPI  ○ 指標                    │
│                                                             │
│ （財務科目選択時）                                          │
│ 科目コード: [4010           ] [検索]                        │
│ 科目名: 売上高                                              │
│                                                             │
│ 責任部門: [営業部     ▼]                                    │
│ 責任者: [山田太郎   ▼]                                      │
│                                                             │
│                               [キャンセル] [登録]           │
└─────────────────────────────────────────────────────────────┘
```

---

### 4.2 非財務KPI入力画面（新規）

#### 画面構成
```
┌─────────────────────────────────────────────────────────────┐
│ 非財務KPI 目標・実績入力                                     │
├─────────────────────────────────────────────────────────────┤
│ [KPI選択] CO2削減率 ▼   [年度] 2026 ▼                       │
│ [部門] 全社 ▼                                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  期間       単位   目標    実績   達成率                     │
│  ───────────────────────────────────────────────────────    │
│  2026-Q1    %     10.0    9.5     95%                      │
│  2026-Q2    %     12.0    -       -                        │
│  2026-Q3    %     15.0    -       -                        │
│  2026-Q4    %     20.0    -       -                        │
│  ───────────────────────────────────────────────────────    │
│  年計       %     57.0    9.5     17%                      │
│                                                             │
│  [+ 期間追加] （月次、四半期、半期、年次を自由に追加可能）    │
│                                                             │
│                                          [保存]             │
└─────────────────────────────────────────────────────────────┘
```

#### 特徴
- 期間の軸は自由入力（"2026-Q1", "2026-04", "2026-H1" 等）
- レイアウトマスタ不要のシンプルな入力画面
- 集計方法（SUM/AVG/EOP）に応じて年計を自動計算
- 部門別管理は任意（全社集計も可能）

---

### 4.3 アクションプラン登録画面の変更

#### 従来設計
```
┌─────────────────────────────────────────────────────────────┐
│ アクションプラン登録                                         │
├─────────────────────────────────────────────────────────────┤
│ KPI科目: [売上高 ▼]  ← subjects (subject_type='KPI') のみ   │
│ ...                                                         │
└─────────────────────────────────────────────────────────────┘
```

#### 新設計
```
┌─────────────────────────────────────────────────────────────┐
│ アクションプラン登録                                         │
├─────────────────────────────────────────────────────────────┤
│ KPI選択                                                     │
│ [年度] 2026 ▼                                               │
│                                                             │
│ KPI項目: [                     ▼]                          │
│          ├ 売上高（財務科目）                               │
│          ├ CO2削減率（非財務KPI）                           │
│          └ 営業利益率（指標）                               │
│                                                             │
│ プラン名: [                                          ]      │
│ 責任部門: [                 ▼]                             │
│ 開始日: [2026-04-01]  終了日: [2026-09-30]                 │
│ ...                                                         │
│                               [キャンセル] [登録]           │
└─────────────────────────────────────────────────────────────┘
```

#### 変更点
- KPI項目選択肢が「財務科目・非財務KPI・指標」の3種類から選択可能
- 年度単位の kpi_master_items から選択する
- 財務科目の場合は fact_amounts の予実を参照
- 非財務KPIの場合は kpi_fact_amounts の目標・実績を参照
- 指標の場合は計算結果のみ表示（予実管理なし）

---

### 4.4 KPI連携ダッシュボードの変更

#### 従来設計
```
┌─────────────────────────────────────────────────────────────┐
│ KPI: 売上高（科目）                                          │
│ 【目標・実績】（fact_amounts から取得）                      │
│ 【アクションプラン】                                        │
└─────────────────────────────────────────────────────────────┘
```

#### 新設計
```
┌─────────────────────────────────────────────────────────────┐
│ KPI: 売上高（財務科目）                                      │
│ 【予算・実績】（fact_amounts から取得、承認済み予算使用）    │
│ 【アクションプラン】                                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ KPI: CO2削減率（非財務KPI）                                  │
│ 【目標・実績】（kpi_fact_amounts から取得）                  │
│ 【アクションプラン】                                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ KPI: 営業利益率（指標）                                      │
│ 【計算結果】（構成要素の fact_amounts から自動計算）         │
│ 【アクションプラン】                                        │
└─────────────────────────────────────────────────────────────┘
```

#### 変更点
- KPI種別（財務/非財務/指標）に応じて表示内容を変更
- 財務科目: 承認済み予算・見込・実績を表示
- 非財務KPI: シンプルな目標・実績を表示
- 指標: 計算結果のみ表示（予実入力不可）

---

## 5. KPI階層管理の考え方

### 5.1 階層構造の必要性

検討メモより：
> - 各部門で　どの部門の人がどれがみれるのか。部門で絞る必要がでてくる。
> - KPIの階層いるかも。階層基本ありに。KGIが全社でKPIが各事業部でアクションプランが部・課で。
> - 階層だけもってつみあげはなしにする？？

#### 提案設計
```
kpi_master_items
├── parent_kpi_item_id（親KPI項目、NULL=最上位）
├── hierarchy_level（階層レベル、1=KGI, 2=KPI, 3=詳細KPI）
└── department_stable_id（責任部門、NULL=全社）
```

| 階層レベル | 名称 | 責任範囲 | 例 |
|-----------|------|---------|-----|
| 1 | KGI | 全社 | 売上高、営業利益率 |
| 2 | KPI | 事業部 | 新規顧客獲得数 |
| 3 | 詳細KPI | 部・課 | 顧客訪問数 |

#### ロールアップ方針
- **Phase 1**: 階層構造のみ持つ、積み上げ集計はなし
- **Phase 2**: 自動積み上げ機能を検討（ただし、性質が異なるKPI間の積み上げは困難）

---

## 6. 移行方針

### 6.1 既存データの移行

#### subjects.subject_type = 'KPI' のデータ

**判定基準**:
1. 財務科目として扱うべきか？
   - Yes → subjects.kpi_managed = true に設定
2. 非財務として扱うべきか？
   - Yes → kpi_definitions に移行

**移行スクリプト方針**:
```sql
-- 1. 財務科目としてKPI管理する場合
UPDATE subjects
SET kpi_managed = true
WHERE subject_type = 'KPI' AND [財務科目判定条件];

-- 2. 非財務KPIとして移行する場合
INSERT INTO kpi_definitions (...)
SELECT ... FROM subjects
WHERE subject_type = 'KPI' AND [非財務判定条件];
```

#### fact_amounts のKPIデータ

**移行方針**:
1. 財務科目として管理する → fact_amounts にそのまま残す
2. 非財務として管理する → kpi_fact_amounts に移行

---

### 6.2 移行順序

1. **Phase 0**: エンティティ設計確定、レビュー
2. **Phase 1**: 新規エンティティ作成（kpi_master_events, kpi_definitions 等）
3. **Phase 2**: 既存データの移行判定・実行
4. **Phase 3**: UI実装（KPI管理マスタ、非財務KPI入力）
5. **Phase 4**: アクションプラン機能の改修
6. **Phase 5**: テスト・検証

---

## 7. 残検討事項

### 7.1 ダッシュボードマスタ

検討メモより：
> - ダッシュボードマスタ　PMを参考にしてもいいかも。基本的なダッシュボードの機能のイメージとしては、カードに何をみせるか（カードでみせたい、グラフでみせたい、○○でみせたい）
> - どの数値をみせるか、部門・科目・予算？実績？　フィルターする？
> - FIN科目数値かKPI科目数値か指標計算の数値か
> - ダッシュボードの構成レイアウトを複数登録できて、一番前にみせるやつはどれか。要検討工数　人それぞれで汎用データ出力のイメージで

**検討方針**:
- Phase 2 以降で設計
- カード型ダッシュボードのレイアウト定義
- 表示対象: 財務科目・非財務KPI・指標・アクションプラン進捗
- フィルタ: 部門・期間・予算/実績

---

### 7.2 進捗の定義

検討メモより：
> - 進捗の定義を整理しておく。

**提案**:

| 対象 | 進捗の定義 |
|------|----------|
| アクションプラン | WBS全体の完了率（手動入力 or 自動計算） |
| WBS項目 | 配下タスクの完了率（自動計算可） |
| タスク | ステータスが is_completed=true の割合 |
| KPI達成率 | （実績 / 目標）× 100% |

---

### 7.3 WBSとかんばんの連携

検討メモより：
> - アクションプラン：ガントチャートとかんばんがつくれるが、それぞれは連携しない
> - WBSとかんばんで登録される数値情報と予実管理や目標・実績管理するために入力される数値情報は関係性をもたない。

**確認事項**:
- WBSとかんばんは独立して管理（データ連携なし）
- WBS進捗率とタスク完了率は独立（自動連携は Phase 2 以降）
- KPI予実とアクションプラン進捗は独立（並べて表示するのみ）

---

## 8. 関連ドキュメント

- `.kiro/specs/仕様検討/20260122_KPIアクションプラン管理機能レビュー・検討` - 今回の検討メモ
- `.kiro/specs/仕様概要/KPIアクションプラン管理.md` - 従来の仕様概要
- `.kiro/specs/仕様概要/KPI管理機能.md` - 従来のKPI管理機能仕様
- `.kiro/specs/entities/01_各種マスタ.md` - エンティティ定義

---

## 9. 変更履歴

| 日付 | 変更内容 | 担当 |
|------|---------|------|
| 2026-01-22 | 初版作成（検討メモに基づく変更案） | Claude Code |
