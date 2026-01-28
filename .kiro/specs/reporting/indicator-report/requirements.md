# 財務指標分析レポート - Requirements

## Spec Reference

### 必須参照（INPUT）
| 優先度 | 参照先 | 確認内容 |
|-------|-------|---------|
| **必須** | `.kiro/specs/仕様概要/財務指標分析レポート_財務指標分析レポート.md` | 確定済み仕様のサマリ。要件の基盤 |
| **必須** | `.kiro/specs/entities/01_各種マスタ.md` (Section 7.3, 7.4) | indicator_report_layouts, indicator_report_layout_lines 定義 |
| **必須** | `.kiro/specs/entities/01_各種マスタ.md` (companies) | companies.indicator_report_layout_id 定義 |
| **必須** | `.kiro/specs/entities/02_トランザクション・残高.md` | fact_amounts 定義 |
| **必須** | `.kiro/specs/entities/02_KPI管理マスタ.md` | kpi_master_events, kpi_definitions, kpi_fact_amounts 定義 |
| 参考 | `.kiro/specs/entities/01_各種マスタ.md` | subjects, metrics, accounting_periods, plan_events, plan_versions, departments |

---

## 1. 概要

財務科目・非財務KPI・指標（metrics）を混在表示できる**定型レポート**をユーザーに提供する。
管理者がレイアウトを登録し、ユーザーは期間やPrimary/Compareを選択して一覧で閲覧する。

### 対象ユーザー
- 経営層、経営企画、財務/経理、事業部長、部門責任者

---

## 2. User Stories

### 2.1 レポート閲覧（Primary選択）
**Given**: ユーザーが財務指標分析レポート画面にアクセスする
**When**: 年度、Primary（予算/見込/実績）、期間、粒度、部門を選択する
**Then**: レイアウトに定義された行が表示され、各行にPrimary値が表示される

### 2.2 比較表示（Compare選択時）
**Given**: Primaryが選択済みで表示されている
**When**: Compare（予算/見込/実績）を選択する
**Then**: Primary列、Compare列、差分（金額/率）列が表示される

### 2.3 予算イベント/バージョン選択（予算選択時）
**Given**: Primary/CompareとしてBUDGETを選択する
**When**: イベント一覧とバージョン一覧が表示される
**Then**: 選択したイベント+バージョンの予算データが表示される

### 2.4 見込イベント選択（見込選択時）
**Given**: Primary/CompareとしてFORECASTを選択する
**When**: イベント一覧が表示される
**Then**: 選択イベントの最新FIXEDバージョンのデータが表示される
**And**: HARD_CLOSED月は実績値で表示される

### 2.5 実績表示（実績選択時）
**Given**: Primary/CompareとしてACTUALを選択する
**When**: 年度のみ選択
**Then**: 選択年度の実績データが表示される

### 2.6 期間・粒度選択
**Given**: レポートが表示されている
**When**: 期間レンジ（開始月〜終了月）と表示粒度（月次/四半期/半期/年度）を変更する
**Then**: 選択期間・粒度に応じたデータが表示される

### 2.7 部門選択
**Given**: 部門ツリーが表示されている
**When**: 部門を選択し、単独/配下集約を切り替える
**Then**: 選択部門（または配下全体）のデータが表示される

### 2.8 レイアウト未設定時のブロック
**Given**: 会社マスタにindicator_report_layout_idが未設定
**When**: 画面にアクセスする
**Then**: 案内メッセージが表示され、レポート表示はブロックされる

---

## 3. Functional Requirements

### 3.1 レイアウト参照
| ID | 要件 |
|----|------|
| FR-1.1 | companies.indicator_report_layout_id から対象レイアウトを取得する |
| FR-1.2 | レイアウトが未設定の場合、画面をブロックしメッセージを表示する |
| FR-1.3 | indicator_report_layout_lines を line_no 順に表示する |

### 3.2 行種別表示
| ID | 要件 |
|----|------|
| FR-2.1 | header行 - 見出し行（値なし、display_name表示） |
| FR-2.2 | item行 - 数値表示（財務科目/非財務KPI/指標のいずれか） |
| FR-2.3 | divider行 - 区切り線＋任意表示名（合計行等に使用） |
| FR-2.4 | note行 - 注記（値なし） |
| FR-2.5 | blank行 - 空行 |

### 3.3 データ取得・合成
| ID | 要件 |
|----|------|
| FR-3.1 | 財務科目（ref_subject_id）→ fact_amounts から取得 |
| FR-3.2 | 非財務KPI（ref_kpi_definition_id）→ kpi_fact_amounts から取得 |
| FR-3.3 | 指標（ref_metric_id）→ metrics.formula_expr を評価して算出 |
| FR-3.4 | 集計は各エンティティの aggregation_method に従う（SUM/EOP/AVG/MAX/MIN） |

### 3.4 Primary/Compare選択
| ID | 要件 |
|----|------|
| FR-4.1 | 予算選択時 → イベント＋バージョンを選択 |
| FR-4.2 | 見込選択時 → イベント選択のみ（最新FIXEDを内部採用） |
| FR-4.3 | 実績選択時 → 年度のみ（イベント/バージョンなし） |
| FR-4.4 | Compare未選択可能（差分列非表示） |

### 3.5 非財務KPIデータ
| ID | 要件 |
|----|------|
| FR-5.1 | 予算/見込 → target_value を参照 |
| FR-5.2 | 実績 → actual_value を参照 |
| FR-5.3 | kpi_master_events の最新CONFIRMED（年度一致）を自動採用 |

### 3.6 期間コード対応（KPI）
| ID | 要件 |
|----|------|
| FR-6.1 | 月次 → accounting_periods.period_code と照合 |
| FR-6.2 | 四半期 → FY{年度}-Q{1..4} |
| FR-6.3 | 半期 → FY{年度}-H{1\|2} |
| FR-6.4 | 年度 → FY{年度} |

### 3.7 差分計算
| ID | 要件 |
|----|------|
| FR-7.1 | 差分 = Primary - Compare |
| FR-7.2 | 差分率 = 差分 / Compare（Compareが0/NULLの場合は「-」） |

### 3.8 欠損表示
| ID | 要件 |
|----|------|
| FR-8.1 | 値が存在しない場合は「-」を表示 |

---

## 4. Non-Functional Requirements

| ID | 要件 |
|----|------|
| NFR-1 | 大量行（100行以上）でも3秒以内に表示 |
| NFR-2 | tenant_id によるRLS境界を遵守 |
| NFR-3 | 権限は機能単位のロール権限で制御（本機能では閲覧のみ） |
| NFR-4 | 可視範囲は employees.control_department_stable_ids で制御 |

---

## 5. Out of Scope

- 指標値の編集・シミュレーション（MVP外）
- 追加の分析グラフ
- 他ディメンション（IRセグメント、プロジェクト等）のフィルター
- レイアウトの作成・編集（管理者向け別機能として別途実装）

---

## 6. エンティティ整合性確認

### 6.1 indicator_report_layouts（仕様概要 Section 7.3）
- layout_code: VARCHAR(50) - レイアウトコード
- layout_name: VARCHAR(200) - レイアウト名
- header_text: TEXT - 画面上部の説明文
- UNIQUE(tenant_id, layout_code)

### 6.2 indicator_report_layout_lines（仕様概要 Section 7.4）
- line_no: INT - 表示順
- line_type: ENUM - header/item/divider/note/blank
- display_name: VARCHAR(200) - 行表示名
- ref_subject_id: UUID - 財務科目参照（item行のみ）
- ref_kpi_definition_id: UUID - 非財務KPI参照（item行のみ）
- ref_metric_id: UUID - 指標参照（item行のみ）
- indent_level: INT - インデント階層
- is_bold: BOOLEAN - 太字フラグ

### 6.3 companies.indicator_report_layout_id
- 会社マスタに財務指標分析レポートで使用するレイアウトIDを設定
- 未設定の場合は画面をブロック

---

## 変更履歴

| 日付 | 変更内容 | 担当 |
|------|---------|------|
| 2026-01-26 | 初版作成 | Claude Code |
