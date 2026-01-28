# Requirements Document

## Introduction

ROIC（Return on Invested Capital：投下資本利益率）分析機能。EPMの財務指標分析レポート機能の一部として、全社/事業部/部門単位で資本効率を把握し、収益性と資本回転の要因分解を行う。

**対象ユーザー**: 経営層、経営企画、事業部長、部門責任者、経理/管理会計担当

---

## Spec Reference（INPUT情報）

本要件を作成するにあたり、以下の情報を確認した：

### 仕様概要（確定済み仕様）
- **参照ファイル**: `.kiro/specs/仕様概要/財務指標分析レポート_ROIC分析.md`
- **確認日**: 2026-01-27
- **主要な仕様ポイント**:
  - UI/選択項目はCVPと共通（年度/Primary/Compare/期間レンジ/粒度/部門）
  - ROICは金額ベース（NOPAT/投下資本）で算出
  - シミュレーションはUI内のみ（保存しない/リロードでリセット）
  - BSが無い会社は簡易モード（半期・通期のみ、実績のみ）
  - WACCは会社マスタ固定値、ROICスプレッドを表示
  - 11個のKPI指標

### 関連仕様
- **参照ファイル**: `.kiro/specs/仕様概要/財務指標分析レポート_CVP損益分岐分析.md`
- **関連性**: フィルターUI、部門ツリー、グラフ表示などの共通コンポーネント

### 仕様検討（経緯・背景）※参考
- **参照ファイル**: なし（新規機能）
- **経緯メモ**: 財務指標分析レポートの一環としてROIC分析を提供

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

### 会社マスタ設定（ROIC専用）
- `companies.roic_pl_layout_id`: ROIC用PLレイアウト
- `companies.roic_bs_layout_id`: ROIC用BSレイアウト
- `companies.roic_ebit_subject_id`: EBIT科目
- `companies.roic_operating_assets_subject_id`: 営業資産集計科目
- `companies.roic_operating_liabilities_subject_id`: 営業負債集計科目
- `companies.effective_tax_rate`: 実効税率（%）
- `companies.wacc_rate`: WACC（%）
- `companies.revenue_subject_id`: 売上高科目

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
**Objective:** As a 経営企画担当者, I want ROIC分析の対象期間・データソース・部門を選択できる, so that 分析対象を柔軟に絞り込める

#### Acceptance Criteria
1. When ユーザーがROIC分析画面を開いた時, the ROIC分析サービス shall 年度選択ドロップダウンを表示する
2. When ユーザーが年度を選択した時, the ROIC分析サービス shall Primary選択（予算/見込/実績）のドロップダウンを有効化する
3. When ユーザーがPrimary=予算を選択した時, the ROIC分析サービス shall イベント選択とバージョン選択のドロップダウンを表示する
4. When ユーザーがPrimary=見込を選択した時, the ROIC分析サービス shall イベント選択のドロップダウンのみを表示し、最新FIXEDバージョンを自動採用する
5. When ユーザーがPrimary=実績を選択した時, the ROIC分析サービス shall 年度のみ選択可能とし、イベント/バージョン選択を非表示にする
6. When ユーザーがCompare選択で比較対象を選んだ時, the ROIC分析サービス shall 比較対象の年度・データ種別・イベントを選択可能にする
7. When ユーザーが期間レンジを選択した時, the ROIC分析サービス shall 年度内の月範囲のみを許可する
8. When ユーザーが表示粒度を選択した時, the ROIC分析サービス shall 月次/四半期/半期/年度から選択可能にする
9. The ROIC分析サービス shall 調整期（period_kind='ADJ'）を期間選択から除外する
10. The ROIC分析サービス shall 「前回見込」の概念を持たず、CompareはPrimaryと独立して選択可能にする

### Requirement 2: 部門ツリー選択機能
**Objective:** As a 事業部長, I want 分析対象の部門をツリーから選択できる, so that 担当部門の資本効率を把握できる

#### Acceptance Criteria
1. When ユーザーが部門ツリーを展開した時, the ROIC分析サービス shall 組織階層をツリー形式で表示する
2. When ユーザーが部門を選択した時, the ROIC分析サービス shall 選択部門のデータでKPIカード・ROICツリー・グラフを更新する
3. When ユーザーが「配下集約」モードを選択した時, the ROIC分析サービス shall 選択部門と配下部門の合計値を表示する
4. When ユーザーが「単独」モードを選択した時, the ROIC分析サービス shall 選択部門のみの値を表示する
5. The ROIC分析サービス shall ユーザーの可視範囲（コントロール部門）内の部門のみを表示する

### Requirement 3: モード判定機能（標準/簡易）
**Objective:** As a システム, I want BS実績の有無に応じて適切なモードを提供できる, so that どの会社でもROIC分析が利用できる

#### Acceptance Criteria
1. When 月次BS実績が存在する場合, the ROIC分析サービス shall 標準モードで動作する
2. While 標準モードの時, the ROIC分析サービス shall 粒度として月次/四半期/半期/年度を選択可能にする
3. While 標準モードの時, the ROIC分析サービス shall Primaryとして予算/見込/実績すべてを選択可能にする
4. When 月次BS実績が存在しない場合, the ROIC分析サービス shall 簡易モードで動作する
5. While 簡易モードの時, the ROIC分析サービス shall 粒度として半期/通期のみを選択可能にする
6. While 簡易モードの時, the ROIC分析サービス shall Primaryとして実績のみを選択可能にする
7. While 簡易モードの時, the ROIC分析サービス shall 簡易入力パネルを使用可能にする

### Requirement 4: 簡易入力パネル機能
**Objective:** As a 経理担当者, I want BS未整備でも半期/通期の営業資産・営業負債を入力できる, so that ROIC分析が実施できる

#### Acceptance Criteria
1. When ユーザーが「簡易入力」ボタンをクリックした時, the ROIC分析サービス shall 右スライドで簡易入力パネルを表示する
2. The ROIC分析サービス shall 簡易入力パネルに営業資産配下科目と営業負債配下科目をツリー表示する
3. The ROIC分析サービス shall 集計科目は見出しとして読取専用で表示する
4. The ROIC分析サービス shall subject_class='BASE' かつ posting_allowed=true の科目のみ編集可能にする
5. The ROIC分析サービス shall 入力列として上期（period_no=6）と下期（period_no=12）を表示する
6. The ROIC分析サービス shall 通期を上期・下期の平均として表示のみ（読取専用）とする
7. When ユーザーが配下集約ONの場合, the ROIC分析サービス shall 入力を不可とし案内メッセージを表示する
8. When ユーザーが保存ボタンをクリックした時, the ROIC分析サービス shall 固定イベント/固定バージョンでfact_amountsに保存する
9. The ROIC分析サービス shall 表示順をroic_bs_layout_idのline_no順、なければsubject_rollup_items.sort_order順、なければsubject_code昇順とする
10. When 会社×年度の初回入力時, the ROIC分析サービス shall 固定イベント（ROIC_SIMPLE_ACTUAL）と固定バージョン（FIXED）を自動生成する

### Requirement 5: データ取得・合成機能
**Objective:** As a 管理会計担当者, I want PL/BSのデータが正しく合成される, so that 正確なROIC分析ができる

#### Acceptance Criteria
1. The ROIC分析サービス shall EBITをroic_ebit_subject_idのPL値として取得する
2. The ROIC分析サービス shall NOPATを「EBIT × (1 - effective_tax_rate)」として計算する
3. The ROIC分析サービス shall 売上高をrevenue_subject_idから取得する
4. The ROIC分析サービス shall 投下資本を「営業資産 − 営業負債」として計算する
5. The ROIC分析サービス shall 営業資産をroic_operating_assets_subject_idから取得する
6. The ROIC分析サービス shall 営業負債をroic_operating_liabilities_subject_idから取得する
7. While 標準モードの時, the ROIC分析サービス shall 投下資本を月末残高の平均として計算する
8. When Primary=予算/見込でBS予算/見込が無い場合, the ROIC分析サービス shall 実績BSで代替し警告を表示する
9. When 実績BS自体が無い場合, the ROIC分析サービス shall 画面をブロックする
10. While 簡易モードの時, the ROIC分析サービス shall 半期値を平均投下資本として使用する

### Requirement 6: KPIカード表示機能
**Objective:** As a 経営層, I want 11のROIC指標を一覧で確認できる, so that 資本効率を瞬時に把握できる

#### Acceptance Criteria
1. The ROIC分析サービス shall 以下の11指標をKPIカードとして表示する：ROIC、NOPAT、EBIT、税率、投下資本、営業資産、営業負債、NOPAT率、資本回転率、WACC、ROICスプレッド
2. The ROIC分析サービス shall ROICを「NOPAT / 投下資本」として計算する
3. The ROIC分析サービス shall NOPAT率を「NOPAT / 売上高」として計算する
4. The ROIC分析サービス shall 資本回転率を「売上高 / 投下資本」として計算する
5. The ROIC分析サービス shall ROICスプレッドを「ROIC − WACC」として計算する
6. If 投下資本=0 の場合, then the ROIC分析サービス shall ROIC/NOPAT率/資本回転率を「-」と表示する
7. If WACC未設定の場合, then the ROIC分析サービス shall WACCとROICスプレッドを「-」と表示する
8. The ROIC分析サービス shall シミュレーション後の値を主表示し、元値と差分を併記する
9. When Compareが選択されている時, the ROIC分析サービス shall シミュ後とCompareの差分を表示する
10. The ROIC分析サービス shall KPIカードを表示優先順（ROIC/WACC/スプレッド/NOPAT → NOPAT率/回転率/投下資本/EBIT → 営業資産/営業負債/税率）で配置する

### Requirement 7: ROICツリー表示・編集機能
**Objective:** As a 経営企画担当者, I want ROICツリーを確認・編集できる, so that シミュレーションができる

#### Acceptance Criteria
1. The ROIC分析サービス shall ROICツリーを以下の構成で表示する：ROIC → NOPAT → EBIT、ROIC → 投下資本 → 営業資産/営業負債
2. The ROIC分析サービス shall 収益率×回転率の分解を表示する：NOPAT率 = NOPAT/売上高、資本回転率 = 売上高/投下資本
3. The ROIC分析サービス shall 2列構成（元値/シミュ後）で金額を表示する
4. When line_type='account'の行が編集された時, the ROIC分析サービス shall シミュ後の値を更新する
5. When 集計科目が直接編集された時, the ROIC分析サービス shall 配下末尾に「調整差分」行を自動生成する
6. The ROIC分析サービス shall 調整差分を「集計値 − 配下合計」として計算する
7. The ROIC分析サービス shall 調整差分行を読み取り専用とする
8. When 配下科目または調整差分が変更された時, the ROIC分析サービス shall 親科目を「配下 + 調整差分の合計」で再計算する
9. When 値が変更された行がある時, the ROIC分析サービス shall 変更行をハイライト表示する
10. When ユーザーが「全体リセット」ボタンをクリックした時, the ROIC分析サービス shall 全てのシミュレーション値を元値にリセットする
11. The ROIC分析サービス shall ページリロード時に全シミュレーション値をリセットする

### Requirement 8: グラフ表示機能
**Objective:** As a 経営層, I want ROICとWACCの推移、ROIC分解を視覚的に把握したい, so that 意思決定の材料にできる

#### Acceptance Criteria
1. The ROIC分析サービス shall ROIC vs WACCグラフを表示する
2. When 複数期間がある場合, the ROIC分析サービス shall 折れ線グラフでROICとWACCを表示する
3. When 単一点の場合, the ROIC分析サービス shall バレットチャート（ROIC値 + WACC基準線）で表示する
4. The ROIC分析サービス shall シミュ後を太線、元値を細線、Compareを点線で表示する
5. The ROIC分析サービス shall ROIC分解バーを表示する（NOPAT率と資本回転率を横並び）
6. The ROIC分析サービス shall ROIC分解バーにROIC値をラベルで併記する
7. The ROIC分析サービス shall 元値/シミュ後を並列表示する

### Requirement 9: エラーハンドリング・データ不足時の表示
**Objective:** As a ユーザー, I want データ不足時に適切な案内を受けたい, so that 何をすべきか理解できる

#### Acceptance Criteria
1. If 会社マスタ設定（PL/BSレイアウト、EBIT/営業資産/営業負債科目、税率）が未設定の場合, then the ROIC分析サービス shall 「ROIC設定が未完了です」と案内メッセージを表示し、画面全体をブロックする
2. If 必須項目（年度/Primary/部門/期間/粒度）が未選択の場合, then the ROIC分析サービス shall 「必須項目を選択してください」と案内メッセージを表示する
3. If PLまたはBSの実績データが0件の場合, then the ROIC分析サービス shall 「データが見つかりません」と案内メッセージを表示し、画面をブロックする
4. If 簡易モードで配下科目が存在しない場合, then the ROIC分析サービス shall 「簡易入力の対象科目がありません」と案内メッセージを表示し、画面をブロックする
5. When Primaryが予算/見込でBSが実績代替となる場合, the ROIC分析サービス shall KPIカード直上に警告バナーを表示する
6. The ROIC分析サービス shall 警告バナーを閉じないよう固定表示する

---

## Out of Scope

以下は本機能のスコープ外とする（MVP外）：

1. ROICのシナリオ保存/共有
2. 年度跨ぎの期間指定
3. 他ディメンション（IRセグメント、プロジェクト等）のフィルター
4. レポート出力/配信
5. 「前回見込」との自動比較

---

## Glossary

| 用語 | 説明 |
|------|------|
| ROIC | Return on Invested Capital（投下資本利益率）= NOPAT / 投下資本 |
| NOPAT | Net Operating Profit After Tax（税引後営業利益）= EBIT × (1 - 実効税率) |
| EBIT | Earnings Before Interest and Taxes（利払前・税引前利益） |
| 投下資本 | Invested Capital = 営業資産 − 営業負債 |
| 営業資産 | Operating Assets（事業運営に必要な資産） |
| 営業負債 | Operating Liabilities（事業運営に伴う負債） |
| WACC | Weighted Average Cost of Capital（加重平均資本コスト） |
| ROICスプレッド | ROIC − WACC（価値創造の指標、正なら価値創造） |
| NOPAT率 | NOPAT / 売上高（収益性指標） |
| 資本回転率 | 売上高 / 投下資本（効率性指標） |
| 標準モード | 月次BS実績が存在する場合のモード（全粒度・全Primary対応） |
| 簡易モード | BS未整備の場合のモード（半期/通期のみ、実績のみ、簡易入力対応） |
| Primary | 分析対象のメインデータソース（予算/見込/実績） |
| Compare | 比較対象のデータソース（任意） |
| FIXED | 確定済みバージョン |
| HARD_CLOSED | 完全に締めた会計期間 |

---

## 変更履歴

| 日付 | 変更内容 | 担当 |
|------|---------|------|
| 2026-01-27 | 初版作成 | Claude Code |
