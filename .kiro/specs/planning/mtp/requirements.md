# Requirements Document

## Introduction

中期経営計画（MTP: Mid-Term Plan）機能の要件定義書。3〜5年スパンの経営目標と戦略テーマを管理し、予算ガイドライン・年度予算の上位概念として位置づける。PL科目の目標値と事業部別の戦略方針を一元管理する。

---

## Spec Reference（INPUT情報）

本要件を作成するにあたり、以下の情報を確認した：

### 仕様概要（確定済み仕様）
- **参照ファイル**: `.kiro/specs/仕様概要/中期経営計画.md`
- **確認日**: 2026-01-11
- **主要な仕様ポイント**:
  - 対象: PL科目（売上・費用・利益）、計画期間: 3年 or 5年（選択可能）、時間粒度: 年度単位
  - 組織粒度: 組織ディメンション単位（dimension_values）、管理単位: イベント単位（履歴管理なし、上書き更新）
  - 数値格納: fact_amounts共用（scenario_type = 'MTP'）
  - 戦略テーマ: カスケード構造（全社テーマ ↔ 事業部テーマ）、ハイブリッド型（フリーテキスト + 定型属性）

### 仕様検討（経緯・背景）※参考
- **参照ファイル**: `.kiro/specs/仕様検討/20260111_中期経営計画.md`
- **経緯メモ**: 組織ディメンション設計、グリッド技術選定（BudgetGrid相当）、戦略テーマ構造（カスケード）の決定

---

## Entity Reference（必須）

本機能で使用するエンティティ定義を `.kiro/specs/entities/*.md` から確認し、以下を記載する：

### 対象エンティティ
- **mtp_events**: `.kiro/specs/entities/01_各種マスタ.md` セクション 15.1
  - id, tenant_id, company_id, event_code, event_name, plan_years, start_fiscal_year, end_fiscal_year, status, description, is_active
  - ※追加予定: dimension_id, layout_id（組織ディメンション・レイアウト指定用）
- **mtp_strategy_themes**: `.kiro/specs/entities/01_各種マスタ.md` セクション 15.2
  - id, tenant_id, mtp_event_id, parent_theme_id, dimension_value_id, theme_code, theme_name, strategy_category, description, owner_employee_id, target_date
- **mtp_theme_kpis**: `.kiro/specs/entities/01_各種マスタ.md` セクション 15.3
  - id, strategy_theme_id, subject_id, sort_order
- **fact_amounts**: `.kiro/specs/entities/02_トランザクション・残高.md`
  - scenario_type = 'MTP' として格納、dimension_value_id 単位で入力
- **dimensions / dimension_values**: `.kiro/specs/entities/01_各種マスタ.md` セクション 4.1 / 4.2
  - org_purpose = 'MTP' の組織ディメンション

### エンティティ整合性確認
- [x] 対象エンティティのカラム・型・制約を確認した
- [x] エンティティ補足のビジネスルールを要件に反映した
- [x] スコープ外の関連エンティティを Out of Scope に明記した

---

## INPUT整合性チェック

| チェック項目 | 確認結果 |
|-------------|---------|
| 仕様概要との整合性 | 要件が仕様概要の内容と矛盾しない: ✅ |
| エンティティとの整合性 | 要件がエンティティ定義と矛盾しない: ✅ |
| 仕様検討の背景理解 | 必要に応じて経緯を確認した: ✅ |

---

## Requirements

### Requirement 1: 中計イベント一覧表示

**Objective:** As a 経営企画担当者, I want 中計イベントの一覧を確認したい, so that 過去・現在の中期経営計画を把握できる

#### Acceptance Criteria

1.1 When ユーザーが中計一覧画面（/planning/mtp）にアクセスした時, the MTP Module shall 中計イベントの一覧をテーブル形式で表示する

1.2 The MTP Module shall 一覧に以下の項目を表示する: イベントコード、イベント名、開始年度、計画年数、ステータス、更新日時

1.3 When ユーザーがステータスフィルターを選択した時, the MTP Module shall DRAFT / CONFIRMED でフィルタリングした結果を表示する

1.4 When ユーザーがカラムヘッダーをクリックした時, the MTP Module shall 該当カラムで昇順/降順ソートを切り替える

1.5 When ユーザーが一覧の行をクリックした時, the MTP Module shall 詳細画面（/planning/mtp/:eventId）に遷移する

---

### Requirement 2: 中計イベント作成

**Objective:** As a 経営企画担当者, I want 新しい中計イベントを作成したい, so that 新たな中期経営計画期間の策定を開始できる

#### Acceptance Criteria

2.1 When ユーザーが「新規作成」ボタンをクリックした時, the MTP Module shall イベント作成ダイアログを表示する

2.2 The MTP Module shall 以下の入力項目を提供する: イベントコード（必須）、イベント名（必須）、計画年数（3年/5年セレクト、必須）、開始年度（セレクト、必須）、組織ディメンション（セレクト、必須）、レイアウト（セレクト、必須）、説明（任意）

2.3 When ユーザーが計画年数と開始年度を選択した時, the MTP Module shall 終了年度を自動計算して表示する（開始年度 + 計画年数 - 1）

2.4 When ユーザーが必須項目を入力して保存ボタンをクリックした時, the MTP Module shall 新しいmtp_eventsレコードをstatus='DRAFT'で作成する

2.5 If イベントコードが既存のイベントと重複している場合, then the MTP Module shall 「イベントコードが既に存在します」エラーを表示する

2.6 When イベント作成に成功した時, the MTP Module shall ダイアログを閉じて一覧を更新し、成功トーストを表示する

---

### Requirement 3: 中計イベント複製・削除

**Objective:** As a 経営企画担当者, I want 既存の中計イベントを複製・削除したい, so that 効率的に中計を管理できる

#### Acceptance Criteria

3.1 When ユーザーが一覧画面で「複製」ボタンをクリックした時, the MTP Module shall 複製ダイアログを表示し、新しいイベントコード・イベント名の入力を求める

3.2 When ユーザーが複製を確定した時, the MTP Module shall 元イベントの設定と数値データをすべてコピーした新しいイベントをstatus='DRAFT'で作成する

3.3 When ユーザーが一覧画面で「削除」ボタンをクリックした時, the MTP Module shall 削除確認ダイアログを表示する

3.4 If 削除対象イベントのステータスがCONFIRMEDの場合, then the MTP Module shall 「確定済みイベントは削除できません」エラーを表示し、削除を拒否する

3.5 When ユーザーがDRAFTイベントの削除を確定した時, the MTP Module shall イベントと関連する戦略テーマ・数値データを削除する（論理削除: is_active=false）

---

### Requirement 4: 中計詳細画面表示

**Objective:** As a 経営企画担当者, I want 中計の詳細画面で数値と戦略テーマを同時に確認したい, so that 戦略と数値の整合性を取りながら計画を策定できる

#### Acceptance Criteria

4.1 When ユーザーが詳細画面（/planning/mtp/:eventId）にアクセスした時, the MTP Module shall 左右スプリットレイアウトで画面を表示する

4.2 The MTP Module shall 左ペインに数値入力グリッドを表示する

4.3 The MTP Module shall 右ペインに戦略テーマパネルを表示する

4.4 The MTP Module shall ヘッダーにイベント情報（イベント名、計画期間、ステータス）を表示する

4.5 While イベントのステータスがCONFIRMEDの場合, the MTP Module shall 数値入力・戦略テーマ編集を読み取り専用モードで表示する

---

### Requirement 5: 数値入力グリッド

**Objective:** As a 経営企画担当者, I want 中計の目標数値を効率的に入力したい, so that 迅速に中期経営計画を策定できる

#### Acceptance Criteria

5.1 The MTP Module shall グリッドの行にレイアウト順で科目を表示する

5.2 The MTP Module shall グリッドの列に開始年度から終了年度までの年度を表示する

5.3 When ユーザーがセルをクリックした時, the MTP Module shall セルを編集モードに切り替える

5.4 When ユーザーがTabキーを押した時, the MTP Module shall 右セルにフォーカスを移動する

5.5 When ユーザーがEnterキーを押した時, the MTP Module shall 下セルにフォーカスを移動する

5.6 When ユーザーが矢印キーを押した時, the MTP Module shall 対応する方向のセルにフォーカスを移動する

5.7 When ユーザーが数値を入力して500ms経過した時, the MTP Module shall 自動保存を実行する（デバウンス）

5.8 The MTP Module shall 入力された数値をfact_amounts（scenario_type='MTP'）に保存する

5.9 While 組織ディメンションが選択されている場合, the MTP Module shall 選択されたディメンション値（事業部等）単位で数値を入力・表示する

---

### Requirement 6: ディメンション別入力切替

**Objective:** As a 経営企画担当者, I want ディメンション値（事業部等）ごとに数値を入力したい, so that 事業部別の中計目標を設定できる

#### Acceptance Criteria

6.1 The MTP Module shall 入力モードとして「単一選択モード」と「一括入力モード」をトグルで切り替え可能にする

6.2 While 単一選択モードの場合, the MTP Module shall グリッド上部にディメンション値セレクターを表示する

6.3 When ユーザーがディメンション値を選択した時（単一選択モード）, the MTP Module shall 選択されたディメンション値の数値をグリッドに表示する

6.4 The MTP Module shall 「全社」オプションを用意し、全ディメンション値の合計を表示する

6.5 While 「全社」が選択されている場合（単一選択モード）, the MTP Module shall グリッドを読み取り専用（集計表示）モードにする

---

### Requirement 6A: 一括入力モード

**Objective:** As a 経営企画担当者, I want 全事業部の数値を一画面で一括入力したい, so that 効率的に中計目標を設定できる

#### Acceptance Criteria

6A.1 When ユーザーが一括入力モードを選択した時, the MTP Module shall 全社合計を最上部に固定表示し、各事業部をアコーディオン形式で縦に並べて表示する

6A.2 The MTP Module shall 全社合計行をフロントエンド側でリアルタイム集計する（計画列のみ、実績列はデータから取得）

6A.3 While 全社合計行は, the MTP Module shall 編集不可（読み取り専用）として表示する

6A.4 The MTP Module shall 各事業部セクションをアコーディオンで折りたたみ可能にする（デフォルト展開）

6A.5 When 列数が画面幅を超える場合, the MTP Module shall 横スクロールで対応する

6A.6 The MTP Module shall 将来的に一括入力モードの使用可否を権限で制御可能な設計とする

---

### Requirement 7: 戦略テーマ一覧表示

**Objective:** As a 経営企画担当者, I want 戦略テーマをツリー形式で確認したい, so that 全社戦略と事業部戦略の関係を把握できる

#### Acceptance Criteria

7.1 The MTP Module shall 右ペインに戦略テーマをツリー形式で表示する

7.2 The MTP Module shall 親テーマ（全社テーマ）を第1階層、子テーマ（事業部テーマ）を第2階層として表示する

7.3 The MTP Module shall 各テーマに以下の情報を表示する: テーマ名、戦略種別、責任者、関連KPI（紐付けがある場合）

7.4 When ユーザーがテーマをクリックした時, the MTP Module shall テーマ詳細ダイアログを表示する

---

### Requirement 8: 戦略テーマ作成

**Objective:** As a 経営企画担当者, I want 新しい戦略テーマを作成したい, so that 中計の戦略方針を定義できる

#### Acceptance Criteria

8.1 When ユーザーが「テーマ追加」ボタンをクリックした時, the MTP Module shall 戦略テーマ作成ダイアログを表示する

8.2 The MTP Module shall 以下の入力項目を提供する: テーマ名（必須）、親テーマ（任意、全社テーマ選択可）、対象ディメンション値（事業部テーマの場合必須）、戦略種別（自由入力、任意）、概要（任意）、責任者（任意）、期限（任意）、関連KPI（マルチセレクト、任意）

8.3 When 親テーマが選択されていない場合, the MTP Module shall テーマを全社テーマ（第1階層）として作成する

8.4 When 親テーマが選択されている場合, the MTP Module shall 対象ディメンション値を必須入力とする

8.5 When ユーザーが保存ボタンをクリックした時, the MTP Module shall 新しいmtp_strategy_themesレコードを作成する

8.6 When 関連KPIが選択されている場合, the MTP Module shall mtp_theme_kpisレコードを作成する

---

### Requirement 9: 戦略テーマ編集・削除

**Objective:** As a 経営企画担当者, I want 戦略テーマを編集・削除したい, so that 戦略方針を柔軟に更新できる

#### Acceptance Criteria

9.1 When ユーザーがテーマ詳細ダイアログで「編集」ボタンをクリックした時, the MTP Module shall 編集モードに切り替える

9.2 When ユーザーが変更を保存した時, the MTP Module shall mtp_strategy_themesレコードを更新する

9.3 When ユーザーが「削除」ボタンをクリックした時, the MTP Module shall 削除確認ダイアログを表示する

9.4 If 削除対象テーマに子テーマが存在する場合, then the MTP Module shall 「子テーマが存在するため削除できません」エラーを表示し、削除を拒否する

9.5 When ユーザーが子テーマのないテーマの削除を確定した時, the MTP Module shall テーマと関連するKPI紐付けを削除する

---

### Requirement 10: ステータス管理

**Objective:** As a 経営企画担当者, I want 中計イベントのステータスを管理したい, so that 策定中と確定済みの計画を区別できる

#### Acceptance Criteria

10.1 The MTP Module shall イベントステータスとして DRAFT / CONFIRMED を管理する

10.2 When ユーザーが詳細画面で「確定」ボタンをクリックした時, the MTP Module shall 確定確認ダイアログを表示する

10.3 When ユーザーが確定を承認した時, the MTP Module shall ステータスを CONFIRMED に更新する

10.4 While ステータスがCONFIRMEDの場合, the MTP Module shall 数値入力と戦略テーマ編集を無効化する

10.5 When ユーザーがCONFIRMEDイベントで「確定解除」ボタンをクリックした時, the MTP Module shall 確定解除確認ダイアログを表示する

10.6 When ユーザーが確定解除を承認した時, the MTP Module shall ステータスを DRAFT に戻す

---

### Requirement 11: テナント分離

**Objective:** As a システム, I want データをテナント単位で分離したい, so that マルチテナント環境でデータの安全性を確保できる

#### Acceptance Criteria

11.1 The MTP Module shall すべてのデータアクセスにおいてtenant_idによるフィルタリングを適用する

11.2 The MTP Module shall RLS（Row Level Security）を有効化し、テナント間のデータ漏洩を防止する

11.3 When 異なるテナントのデータにアクセスを試みた場合, the MTP Module shall 空の結果を返却する（エラーではなく）

---

## Out of Scope

本要件に含まれない項目を明記する：

1. **予算ガイドライン機能**: 別Feature（planning/guideline）として実装
2. **予算入力機能**: 別Feature（planning/budget-entry）として実装
3. **承認ワークフロー**: Phase 2 以降で検討（現時点ではステータス管理のみ）
4. **財務インパクト機能**: Phase 2 構想（テーマ → 科目 → 金額の紐付け）
5. **シナリオ分析**: Phase 2 構想（楽観/悲観シナリオ）
6. **戦略種別マスタ**: Phase 2 以降で検討（現時点では自由入力）
7. **予算との比較分析**: 閲覧機能として将来実装予定

---

## 変更履歴

| 日付 | 変更内容 | 担当 |
|------|---------|------|
| 2026-01-11 | 初版作成（EARS形式で11要件を定義） | Claude Code |
| 2026-01-11 | CCSDD準拠: 要件ID形式を X.Y に変更、EARS英語キーワード統一 | Claude Code |
| 2026-01-12 | Requirement 6: 入力モード切替（単一選択/一括入力）を追加、Requirement 6A: 一括入力モード要件を新規追加 | Claude Code |
