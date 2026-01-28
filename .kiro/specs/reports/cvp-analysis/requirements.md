# Requirements Document

## Introduction

CVP（Cost-Volume-Profit）損益分岐分析機能。EPMの財務指標分析レポート機能の一部として、全社/事業部/部門単位で損益構造を把握し、固定費・変動費の影響を可視化する。MVPでは数量/単価の概念は扱わず、金額ベースで分析する。

**対象ユーザー**: 経営層、経営企画、事業部長、部門責任者、経理/管理会計担当

---

## Spec Reference（INPUT情報）

本要件を作成するにあたり、以下の情報を確認した：

### 仕様概要（確定済み仕様）
- **参照ファイル**: `.kiro/specs/仕様概要/財務指標分析レポート_CVP損益分岐分析.md`
- **確認日**: 2026-01-26
- **主要な仕様ポイント**:
  - 金額ベースCVP（数量/単価は扱わない）
  - 分析軸は組織のみ（全社/事業部/部門）
  - シミュレーションはUI内のみ（保存しない/リロードでリセット）
  - 当年度実績は「実績+見込」で表示
  - 8つのKPI指標を表示

### 仕様検討（経緯・背景）※参考
- **参照ファイル**: なし（新規機能）
- **経緯メモ**: 財務指標分析レポートの一環としてCVP分析を提供

---

## Entity Reference（必須）

本機能で使用するエンティティ定義を `.kiro/specs/entities/*.md` から確認し、以下を記載する：

### 対象エンティティ
- `fact_amounts`: `.kiro/specs/entities/02_トランザクション・残高.md` セクション 3.1
- `plan_events`: `.kiro/specs/entities/01_各種マスタ.md` セクション 11.1
- `plan_versions`: `.kiro/specs/entities/01_各種マスタ.md` セクション 11.2
- `accounting_periods`: `.kiro/specs/entities/01_各種マスタ.md` セクション 2.1
- `report_layouts`: `.kiro/specs/entities/01_各種マスタ.md` セクション 7.1
- `report_layout_lines`: `.kiro/specs/entities/01_各種マスタ.md` セクション 7.2
- `subjects`: `.kiro/specs/entities/01_各種マスタ.md` セクション 6.1
- `subject_rollup_items`: `.kiro/specs/entities/01_各種マスタ.md` セクション 6.3
- `companies`: `.kiro/specs/entities/01_各種マスタ.md` セクション 1.2

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
| 仕様検討の背景理解 | 必要に応じて経緯を確認した: N/A |

---

## Requirements

### Requirement 1: フィルター選択機能
**Objective:** As a 経営企画担当者, I want CVP分析の対象期間・データソース・部門を選択できる, so that 分析対象を柔軟に絞り込める

#### Acceptance Criteria
1. When ユーザーがCVP分析画面を開いた時, the CVP分析サービス shall 年度選択ドロップダウンを表示する
2. When ユーザーが年度を選択した時, the CVP分析サービス shall Primary選択（予算/見込/実績）のドロップダウンを有効化する
3. When ユーザーがPrimary=予算を選択した時, the CVP分析サービス shall イベント選択とバージョン選択のドロップダウンを表示する
4. When ユーザーがPrimary=見込を選択した時, the CVP分析サービス shall イベント選択のドロップダウンのみを表示し、FIXEDバージョンが存在するイベントのみを選択肢として表示する
5. When ユーザーがPrimary=実績を選択した時, the CVP分析サービス shall 過去年度のみを選択可能とし、イベント/バージョン選択を非表示にする
6. When ユーザーがCompare選択で「比較あり」を選んだ時, the CVP分析サービス shall 比較対象の年度・データ種別・イベントを選択可能にする
7. When ユーザーが期間レンジを選択した時, the CVP分析サービス shall 年度内の月範囲のみを許可する
8. When ユーザーが表示粒度を選択した時, the CVP分析サービス shall 月次/四半期/半期/年度から選択可能にする
9. While 表示粒度が四半期/半期/年度の時, the CVP分析サービス shall 期間レンジを粒度境界にスナップする
10. The CVP分析サービス shall 調整期（period_kind='ADJ'）を期間選択から除外する

### Requirement 2: 部門ツリー選択機能
**Objective:** As a 事業部長, I want 分析対象の部門をツリーから選択できる, so that 担当部門の損益構造を把握できる

#### Acceptance Criteria
1. When ユーザーが部門ツリーを展開した時, the CVP分析サービス shall 組織階層をツリー形式で表示する
2. When ユーザーが部門を選択した時, the CVP分析サービス shall 選択部門のデータでKPIカード・CVPツリー・グラフを更新する
3. When ユーザーが「配下集約」モードを選択した時, the CVP分析サービス shall 選択部門と配下部門の合計値を表示する
4. When ユーザーが「単独」モードを選択した時, the CVP分析サービス shall 選択部門のみの値を表示する
5. The CVP分析サービス shall ユーザーの可視範囲（コントロール部門）内の部門のみを表示する

### Requirement 3: データ取得・合成機能
**Objective:** As a 管理会計担当者, I want 予算/見込/実績のデータが正しく合成される, so that 正確なCVP分析ができる

#### Acceptance Criteria
1. When Primary=予算が選択された時, the CVP分析サービス shall 選択したイベント+バージョンのfact_amountsを取得する
2. When Primary=見込が選択された時, the CVP分析サービス shall 選択イベントの最新FIXEDバージョンを自動採用する
3. While Primary=見込の時, When 対象月がHARD_CLOSEDかつ実績が存在する場合, the CVP分析サービス shall 実績値を使用する
4. While Primary=見込の時, When 対象月に実績が無い場合, the CVP分析サービス shall 見込値を使用する
5. When Primary=実績が選択された時, the CVP分析サービス shall 過去年度の実績データのみを集計する
6. When Compareが選択された時, the CVP分析サービス shall Primaryと同じ月範囲をCompare側の年度/イベントに適用する
7. The CVP分析サービス shall 費用系の値を正値として正規化して計算する

### Requirement 4: KPIカード表示機能
**Objective:** As a 経営層, I want 8つのCVP指標を一覧で確認できる, so that 損益構造を瞬時に把握できる

#### Acceptance Criteria
1. The CVP分析サービス shall 以下の8指標をKPIカードとして表示する：売上、変動費、限界利益、限界利益率、固定費、損益分岐売上、安全余裕額、安全余裕率
2. The CVP分析サービス shall 限界利益を「売上 − 変動費」として計算する
3. The CVP分析サービス shall 限界利益率を「限界利益 / 売上」として計算する
4. The CVP分析サービス shall 損益分岐売上を「固定費 / 限界利益率」として計算する
5. The CVP分析サービス shall 安全余裕額を「売上 − 損益分岐売上」として計算する
6. The CVP分析サービス shall 安全余裕率を「安全余裕額 / 売上」として計算する
7. If 売上=0 または 限界利益率=0 の場合, then the CVP分析サービス shall 損益分岐売上を「-」と表示する
8. The CVP分析サービス shall シミュレーション後の値を主表示し、元値と差分を併記する
9. When Compareが選択されている時, the CVP分析サービス shall シミュ後とCompareの差分を表示する
10. When Compareが未選択の時, the CVP分析サービス shall 差分表示を非表示にする

### Requirement 5: CVPツリー表示・編集機能
**Objective:** As a 経営企画担当者, I want CVPレイアウトに基づくPLツリーを確認・編集できる, so that シミュレーションができる

#### Acceptance Criteria
1. The CVP分析サービス shall companies.cvp_report_layout_idで指定されたPLレイアウトをツリー表示する
2. The CVP分析サービス shall 2列構成（元値 / シミュ後）で金額を表示する
3. The CVP分析サービス shall 費用を正値表示・正値入力で統一する
4. When line_type='account'の行が編集された時, the CVP分析サービス shall シミュ後の値を更新する
5. When 集計科目が直接編集された時, the CVP分析サービス shall 配下末尾に「調整差分」行を自動生成する
6. The CVP分析サービス shall 調整差分を「集計値 − 配下合計」として計算する
7. The CVP分析サービス shall 調整差分行を読み取り専用とする
8. When 配下科目または調整差分が変更された時, the CVP分析サービス shall 親科目を「配下 + 調整差分の合計」で再計算する
9. When 値が変更された行がある時, the CVP分析サービス shall 変更行をハイライト表示する
10. When ユーザーが「全体リセット」ボタンをクリックした時, the CVP分析サービス shall 全てのシミュレーション値を元値にリセットする
11. The CVP分析サービス shall ページリロード時に全シミュレーション値をリセットする

### Requirement 6: グラフ表示機能
**Objective:** As a 経営層, I want 損益分岐点とコスト構造を視覚的に把握したい, so that 意思決定の材料にできる

#### Acceptance Criteria
1. The CVP分析サービス shall 損益分岐チャートを表示する（横軸: 売上高、縦軸: 金額）
2. The CVP分析サービス shall 損益分岐チャートに売上線・総費用線・固定費線を表示する
3. The CVP分析サービス shall 損益分岐点を強調表示する
4. When シミュレーション後の値がある時, the CVP分析サービス shall シミュ後を太線、元値を細線で表示する
5. When Compareが選択されている時, the CVP分析サービス shall Compareを点線で表示する
6. If 限界利益率=0 または 売上=0 の場合, then the CVP分析サービス shall 「計算不可」と表示する
7. The CVP分析サービス shall 損益構造ウォーターフォールチャートを表示する
8. The CVP分析サービス shall ウォーターフォールに売上→変動費→固定費→利益の流れを表示する
9. The CVP分析サービス shall ウォーターフォールで元値/シミュ後を左右に並列表示する

### Requirement 7: エラーハンドリング・データ不足時の表示
**Objective:** As a ユーザー, I want データ不足時に適切な案内を受けたい, so that 何をすべきか理解できる

#### Acceptance Criteria
1. If companies.cvp_report_layout_idが未設定の場合, then the CVP分析サービス shall 「CVPレイアウトが未設定です」と案内メッセージを表示し、画面全体をブロックする
2. If 必須項目（年度/Primary/部門/期間/粒度）が未選択の場合, then the CVP分析サービス shall 「必須項目を選択してください」と案内メッセージを表示する
3. If Primaryデータが0件の場合, then the CVP分析サービス shall 「データが見つかりません」と案内メッセージを表示する
4. If 見込イベントにFIXEDバージョンが存在しない場合, then the CVP分析サービス shall そのイベントを選択不可とする

---

## Out of Scope

以下は本機能のスコープ外とする（MVP外）：

1. 数量/単価ベースのCVP分析
2. 他ディメンション（IRセグメント、プロジェクト等）のフィルター
3. シミュレーションの保存/共有
4. 年度跨ぎの期間指定
5. 部門横断サマリー一覧画面
6. 他レポートへの導線

---

## Glossary

| 用語 | 説明 |
|------|------|
| CVP | Cost-Volume-Profit（費用-売上高-利益）分析 |
| Primary | 分析対象のメインデータソース（予算/見込/実績） |
| Compare | 比較対象のデータソース（任意） |
| 限界利益 | 売上高 − 変動費 |
| 限界利益率 | 限界利益 / 売上高 |
| 損益分岐売上 | 利益がゼロになる売上高（固定費 / 限界利益率） |
| 安全余裕額 | 現在の売上高と損益分岐売上の差 |
| 安全余裕率 | 安全余裕額 / 売上高 |
| FIXED | 確定済みバージョン |
| HARD_CLOSED | 完全に締めた会計期間 |
