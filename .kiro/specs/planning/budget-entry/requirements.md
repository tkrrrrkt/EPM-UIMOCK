# Requirements Document: Budget Entry（予算入力）

## Introduction

本機能は、EPM SaaSにおける予算入力の中核機能である。
部門責任者またはFP&A担当者が、月次予算を入力・編集できる。

**Phase 1 スコープ**:
- 単一部門・単一シナリオ（当初予算）の入力
- 科目×月の予算入力（拡張期間列：月次+四半期+上期/下期+通期）
- 設定された科目はディメンション別に入力可能
- バージョン比較（同一plan_event内のバージョン間比較）
- 過去実績比較（過去年度の実績との比較）
- 過去実績表示（参照用パネル）
- 科目フィルター
- 入力内容の即時保存

---

## Entity Reference（必須）

本機能で使用するエンティティ定義を `.kiro/specs/entities/*.md` から確認する。

### 対象エンティティ

- fact_amounts: `.kiro/specs/entities/01_各種マスタ.md` セクション 12.1
- fact_dimension_links: `.kiro/specs/entities/01_各種マスタ.md` セクション 12.2
- subjects: `.kiro/specs/entities/01_各種マスタ.md` セクション 6.1
- subject_rollup_items: `.kiro/specs/entities/01_各種マスタ.md` セクション 6.3
- departments: `.kiro/specs/entities/01_各種マスタ.md` セクション 3.2
- dimensions: `.kiro/specs/entities/01_各種マスタ.md` セクション 4.1
- dimension_values: `.kiro/specs/entities/01_各種マスタ.md` セクション 4.2
- plan_events: `.kiro/specs/entities/01_各種マスタ.md` セクション 11.1
- plan_versions: `.kiro/specs/entities/01_各種マスタ.md` セクション 11.2
- accounting_periods: `.kiro/specs/entities/01_各種マスタ.md` セクション 2.1

### 新規エンティティ（本機能で追加）

- budget_input_axis_settings: 科目×部門ごとの入力ディメンション設定

### エンティティ整合性確認

- [x] 対象エンティティのカラム・型・制約を確認した
- [x] エンティティ補足のビジネスルールを要件に反映した
- [x] スコープ外の関連エンティティを Out of Scope に明記した

---

## Requirements

### Requirement 1: 予算データの閲覧

**Objective:** As a 部門責任者/FP&A担当者, I want 対象年度・部門の予算データを科目×月で閲覧したい, so that 予算の全体像を把握できる

#### Acceptance Criteria

1.1 When ユーザーが年度・部門・バージョンを指定する, the システム shall 該当する予算データを科目×期間の形式で表示する

1.2 The システム shall 各科目について以下の19期間列を表示する:
- 月次: 4月, 5月, 6月, 7月, 8月, 9月, 10月, 11月, 12月, 1月, 2月, 3月
- 四半期: 1Q（4-6月計）, 2Q（7-9月計）, 3Q（10-12月計）, 4Q（1-3月計）
- 上下期: 上期（1Q+2Q）, 下期（3Q+4Q）
- 年次: 通期（上期+下期）

1.3 Where 科目が集計科目（subject_class = 'AGGREGATE'）の場合, the システム shall subject_rollup_itemsに基づいて自動計算した値を表示する

1.4 The システム shall 金額を原単位（円）で保持し、表示時には桁区切り（日本語ロケール）でフォーマットする

1.5 The システム shall 集計列（四半期、上下期、通期）を視覚的に区別して表示する（背景色で区別）

---

### Requirement 2: 予算データの入力

**Objective:** As a 部門責任者, I want 科目×月の予算金額を入力・編集したい, so that 予算を策定できる

#### Acceptance Criteria

2.1 When ユーザーが科目×月のセルに金額を入力する, the システム shall 入力値をfact_amountsに保存する

2.2 Where 科目が集計科目（subject_class = 'AGGREGATE'）の場合, the システム shall 入力を受け付けない

2.3 Where 科目のposting_allowed = falseの場合, the システム shall 入力を受け付けない

2.4 Where accounting_periodのclose_status != 'OPEN'の場合, the システム shall 該当月への入力を受け付けない

2.5 Where plan_versionのstatus = 'FIXED'の場合, the システム shall 該当バージョンへの入力を受け付けない

2.6 The システム shall 入力値を即時に永続化する（デバウンス500ms後）

2.7 The システム shall 保存状態をセル内に視覚的に表示する（保存中: spinner、保存完了: checkマーク、エラー: 赤アイコン+ツールチップ）

2.8 Where 集計列（四半期、上下期、通期）の場合, the システム shall 入力を受け付けない（読み取り専用）

---

### Requirement 3: ディメンション別入力

**Objective:** As a 部門責任者, I want 特定の科目をディメンション別（得意先グループ別等）に入力したい, so that より詳細な予算管理ができる

#### Acceptance Criteria

3.1 Where budget_input_axis_settingsに科目×部門×ディメンションの設定が存在する場合, the システム shall 該当科目をディメンション値別に展開入力可能とする

3.2 When ユーザーがディメンション値別に金額を入力する, the システム shall fact_amountsにfact_dimension_linksを紐付けて保存する

3.3 The システム shall ディメンション値別の入力合計を科目レベルの合計として自動計算する

3.4 Where budget_input_axis_settingsに設定が存在しない場合, the システム shall 科目レベルでの直接入力のみ許可する

3.5 The システム shall 展開可能な科目に展開アイコン（▶/▼）を表示し、クリックで子行の表示/非表示を切り替える

---

### Requirement 4: 集計科目の自動計算

**Objective:** As a ユーザー, I want 売上総利益や営業利益が自動計算されてほしい, so that 手計算なしで正しい集計値を確認できる

#### Acceptance Criteria

4.1 The システム shall subject_class = 'AGGREGATE'の科目について、subject_rollup_itemsの定義に基づき自動計算する

4.2 The システム shall 計算時にcoefficient（係数: +1/-1等）を適用する

4.3 When 構成科目（component_subject）の値が変更される, the システム shall 関連する集計科目を再計算する

4.4 The システム shall AGGREGATE科目を視覚的に区別する（【】で囲む、背景色グレー）

---

### Requirement 5: バージョン比較

**Objective:** As a FP&A担当者, I want 予算バージョン間の比較を確認したい, so that 前回からの変更点を把握できる

#### Acceptance Criteria

5.1 When 同一plan_event内に複数のplan_versionが存在する場合, the システム shall バージョン選択を可能とする

5.2 When ユーザーが比較モードを選択する, the システム shall 比較元バージョンの金額・現行バージョンの金額・差異を表示する

5.3 The システム shall 差異を「現行バージョン - 比較元バージョン」として計算する

5.4 The システム shall 差異の正負を色で区別する（正=緑系、負=赤系）

5.5 The システム shall 期間ごとに「ベース」「現在」「差異」の3列を並べて表示する

---

### Requirement 6: 入力バリデーション

**Objective:** As a システム, I want 不正な入力を防止したい, so that データ品質を担保できる

#### Acceptance Criteria

6.1 The システム shall 金額として数値のみを受け付ける

6.2 Where subject.allow_negative = falseの場合, the システム shall 負の値を拒否する

6.3 When バリデーションエラーが発生する, the システム shall エラー内容をユーザーに通知する（ツールチップ、セル赤枠）

---

### Requirement 7: 対象選択

**Objective:** As a ユーザー, I want 入力対象（年度・部門・バージョン）を選択したい, so that 正しいデータに対して入力できる

#### Acceptance Criteria

7.1 The システム shall 会計年度（fiscal_year）の選択を可能とする

7.2 The システム shall 部門（department）の選択を可能とする

7.3 The システム shall 予算イベント（plan_event）の選択を可能とする（BUDGETシナリオのみ）

7.4 The システム shall バージョン（plan_version）の選択を可能とする

7.5 When ユーザーが対象を変更する, the システム shall 該当する予算データを表示する

---

### Requirement 8: 過去実績表示

**Objective:** As a 部門責任者/FP&A担当者, I want 予算入力時に過去実績を参照したい, so that 実績ベースで予算を策定できる

#### Acceptance Criteria

8.1 The システム shall 「過去実績を表示」トグルを提供する

8.2 When トグルがONの場合, the システム shall 対象年度の過去3年分（-1年、-2年、-3年）の実績を表示する

8.3 The システム shall 過去実績を年度ごとのアコーディオン形式で表示する（デフォルト展開）

8.4 The システム shall 過去実績パネルの期間列を予算グリッドと揃える（同じ19期間列）

8.5 The システム shall 科目フィルターを過去実績パネルにも適用する

8.6 The システム shall 比較モード（過去実績比較、バージョン比較）がONの場合でも、トグルがONなら過去実績パネルを表示する

---

### Requirement 9: 過去実績比較

**Objective:** As a FP&A担当者, I want 予算と過去実績を並べて比較したい, so that 予算の妥当性を検証できる

#### Acceptance Criteria

9.1 The システム shall 「過去実績比較」モードを提供する（タブ切り替え）

9.2 When 過去実績比較モードが選択された場合, the システム shall 比較対象年度（-1年、-2年、-3年）の選択を可能とする

9.3 The システム shall 期間ごとに「予算」「実績」「差異」の3列を並べて表示する

9.4 The システム shall 差異を「予算 - 実績」として計算し、正負を色で区別する

9.5 The システム shall 月次だけでなく四半期・上下期・通期の比較も表示する

---

### Requirement 10: 科目フィルター

**Objective:** As a ユーザー, I want 特定の科目だけを表示したい, so that 必要な情報に集中できる

#### Acceptance Criteria

10.1 The システム shall 科目フィルターを提供する（マルチセレクト）

10.2 When 科目が選択された場合, the システム shall 選択された科目とその子行（ディメンション展開行）のみを表示する

10.3 The システム shall 科目フィルターを予算グリッドと過去実績パネルの両方に適用する

10.4 When フィルターがクリアされた場合, the システム shall 全科目を表示する

---

### Requirement 11: グリッド操作

**Objective:** As a ユーザー, I want Excelライクな操作で効率的に入力したい, so that 慣れた操作感で予算を策定できる

#### Acceptance Criteria

11.1 The システム shall セルクリックで編集モードに入る

11.2 The システム shall Tab/Shift+Tabで左右のセル移動を可能とする

11.3 The システム shall Enter/Shift+Enterで上下のセル移動を可能とする

11.4 The システム shall 矢印キーでセル移動を可能とする（カーソル位置に応じて）

11.5 The システム shall Escapeで編集キャンセルを可能とする

11.6 The システム shall 科目列を固定表示する（sticky column）

---

## Out of Scope（Phase 1 対象外）

- 複数部門の一括入力・閲覧
- 配賦入力（source_type = 'ALLOC'）
- 調整入力（source_type = 'ADJUST'）
- KPI科目（subject_type = 'KPI'）の入力
- コメント・仮説の入力
- インポート/エクスポート機能
- 予算承認ワークフロー
- budget_input_axis_settingsのCRUD画面（シードデータで運用）
- 権限による部門制限（将来実装）
- PJ別モード（仕様概要では言及あり、Phase 2で実装）
- 見込（FORECAST）入力（仕様概要では言及あり、Phase 2で実装）

---

## 用語定義

| 用語 | 定義 |
|------|------|
| BASE科目 | 直接入力可能な科目（subject_class = 'BASE'）|
| AGGREGATE科目 | 集計科目（subject_class = 'AGGREGATE'）。自動計算され入力不可 |
| plan_event | 予算の枠（当初予算、修正予算等）|
| plan_version | 予算の版（第1回、第2回、FIXED等）|
| ディメンション展開 | 科目をディメンション値別に分解して入力すること |
| 比較モード | 過去実績比較またはバージョン比較の表示モード |
| 期間列 | 月次(12)+四半期(4)+上下期(2)+通期(1)の計19期間 |
| PeriodType | 期間の種別（MONTH, QUARTER, HALF, ANNUAL）|

---

## 変更履歴

| 日付 | 変更内容 | 担当 |
|------|---------|------|
| 2026-01-09 | 初版作成 | Claude Code |
| 2026-01-12 | 実装に基づき大幅更新：拡張期間列(19列)、過去実績表示・比較、科目フィルター、グリッド操作を追加 | Claude Code |
