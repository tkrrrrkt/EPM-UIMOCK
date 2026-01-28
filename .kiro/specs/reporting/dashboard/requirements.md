# Requirements Document

## Introduction

本ドキュメントは、EPM SaaSにおける「ダッシュボード機能」の要件定義書である。
従来の固定レイアウト型レポート（財務指標分析レポート）を補完・将来的に置換する、
柔軟なウィジェット配置型の経営ダッシュボード機能を定義する。

SyncFusionコンポーネント（Dashboard Layout / Charts / DataGrid）を活用し、
CFO・経営企画・FP&A・事業責任者が必要な経営指標を自由に可視化できるプラットフォームを提供する。

---

## Spec Reference（INPUT情報）

本要件を作成するにあたり、以下の情報を確認した：

### 仕様概要（確定済み仕様）
- **参照ファイル**: 前回会話での仕様決定セッション（13項目の決定事項）
- **確認日**: 2026-01-27
- **主要な仕様ポイント**:
  - WYSIWYGエディタ型ダッシュボード（サイドパネルで詳細設定）
  - ハイブリッドフィルター設計（グローバル＋ウィジェット単位オーバーライド）
  - 9種類のウィジェットタイプ（KPIカード、折れ線、棒、円、ゲージ、テーブル、テキスト、スパークライン、複合チャート）
  - 3種類のデータソース（Fact/KPI/Metric）で複数ソース混在可
  - 経営サマリーテンプレートを初期提供

### 仕様検討（経緯・背景）
- **経緯メモ**: 既存の財務指標分析レポートは固定レイアウト・テーブル中心であり、
  グラフ・チャートがなく経営層・FP&A向けの視認性に課題があった。
  汎用ダッシュボード機能により、柔軟な可視化と将来的な既存レポート置換を目指す。

---

## Entity Reference（必須）

本機能で使用するエンティティ定義を以下に記載する：

### 対象エンティティ（新規定義）
- **Dashboard**: ダッシュボード本体（テナント・所有者・グローバルフィルター設定）
- **DashboardWidget**: ダッシュボード内の各ウィジェット（配置・データ設定・表示設定）

### 関連エンティティ（既存参照）
- `.kiro/specs/entities/01_各種マスタ.md`: Organization, Period, Scenario, Subject, Metric
- `.kiro/specs/entities/02_トランザクション・残高.md`: Fact (科目残高)
- `.kiro/specs/entities/02_KPI管理マスタ.md`: KpiDefinition, KpiTargetValue, KpiFactAmount

### エンティティ整合性確認
- [x] 対象エンティティのカラム・型・制約を確認した（新規エンティティはdesign.mdで定義）
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

### Requirement 1: ダッシュボード一覧表示

**Objective:** As a 経営企画担当者, I want ダッシュボードの一覧を確認できる機能, so that 必要なダッシュボードに素早くアクセスできる

#### Acceptance Criteria
1. When ユーザーがダッシュボード一覧画面にアクセスした時, the Dashboard Service shall 閲覧権限のあるダッシュボード一覧を取得して表示する
2. The Dashboard Service shall ダッシュボード名・説明・最終更新日時を一覧に表示する
3. When ユーザーが一覧からダッシュボードを選択した時, the Dashboard Service shall 選択したダッシュボードの表示画面に遷移する
4. The Dashboard Service shall ダッシュボードをソート順（sort_order）に従って表示する
5. If ユーザーにダッシュボード作成権限がある場合, then the Dashboard Service shall 新規作成ボタンを表示する

---

### Requirement 2: ダッシュボード表示（View Mode）

**Objective:** As a CFO/経営層, I want ダッシュボードをリアルタイムデータで閲覧できる機能, so that 経営指標を素早く把握できる

#### Acceptance Criteria
1. When ユーザーがダッシュボード表示画面にアクセスした時, the Dashboard Service shall ダッシュボード設定に基づきウィジェットを配置・表示する
2. When ダッシュボード表示画面がロードされた時, the Dashboard Service shall 全ウィジェットのデータを取得してレンダリングする
3. The Dashboard Service shall グローバルフィルター設定（年度・部門・期間・シナリオ等）を画面上部に表示する
4. When ユーザーがグローバルフィルターを変更した時, the Dashboard Service shall 全ウィジェットのデータを再取得して表示を更新する
5. While ウィジェットのデータ取得中, the Dashboard Service shall ローディングインジケーターを表示する
6. If 特定のウィジェットでデータ取得エラーが発生した場合, then the Dashboard Service shall 該当ウィジェットのみにエラー表示し、他のウィジェットは正常に表示を継続する
7. When ユーザーが手動リフレッシュボタンを押した時, the Dashboard Service shall 全ウィジェットのデータを再取得する
8. Where ユーザーに編集権限がある場合, the Dashboard Service shall 編集モードへ切り替えるボタンを表示する

---

### Requirement 3: ダッシュボード編集（Edit Mode）

**Objective:** As a FP&A担当者, I want ダッシュボードのレイアウトとウィジェットを編集できる機能, so that 必要な経営指標を自由に可視化できる

#### Acceptance Criteria
1. When ユーザーが編集モードに切り替えた時, the Dashboard Service shall ウィジェットのドラッグ&ドロップによる配置変更を有効にする
2. When ユーザーがウィジェットをドラッグした時, the Dashboard Service shall SyncFusion Dashboard Layout によりリアルタイムで配置プレビューを表示する
3. When ユーザーがウィジェットのリサイズハンドルを操作した時, the Dashboard Service shall ウィジェットサイズを変更する
4. When ユーザーが新規ウィジェット追加ボタンを押した時, the Dashboard Service shall ウィジェット種別選択パネルを表示する
5. When ユーザーがウィジェットを選択した時, the Dashboard Service shall サイドパネルに詳細設定を表示する
6. When ユーザーがサイドパネルで設定を変更した時, the Dashboard Service shall リアルタイムでウィジェットプレビューを更新する
7. When ユーザーが保存ボタンを押した時, the Dashboard Service shall ダッシュボード設定をDBに永続化する
8. When ユーザーがキャンセルボタンを押した時, the Dashboard Service shall 未保存の変更を破棄して表示モードに戻る
9. The Dashboard Service shall 編集中もウィジェットに実データプレビューを表示する

---

### Requirement 4: グローバルフィルター設定

**Objective:** As a 経営企画担当者, I want ダッシュボード全体に適用するフィルター条件を設定できる機能, so that 分析対象を一括で切り替えられる

#### Acceptance Criteria
1. The Dashboard Service shall 以下のグローバルフィルター項目を提供する：年度、部門、期間範囲（開始・終了）、表示粒度（月次/四半期/半期/年次）、Primary（シナリオ/イベント/バージョン）、Compare（ON/OFF＋シナリオ/イベント/バージョン）
2. When ユーザーが年度フィルターを変更した時, the Dashboard Service shall 選択年度に対応するデータで全ウィジェットを更新する
3. When ユーザーが部門フィルターを変更した時, the Dashboard Service shall 選択部門（配下含むオプション付き）のデータで全ウィジェットを更新する
4. When Compare設定がONの時, the Dashboard Service shall 比較対象のシナリオ/イベント/バージョン選択を有効にする
5. The Dashboard Service shall グローバルフィルター設定をダッシュボードのデフォルトとしてDBに保存する
6. When Primary シナリオが BUDGET または FORECAST の時, the Dashboard Service shall イベント選択を表示する
7. When Primary シナリオが BUDGET の時, the Dashboard Service shall バージョン選択を表示する

---

### Requirement 5: ウィジェット単位フィルターオーバーライド

**Objective:** As a FP&A担当者, I want 特定のウィジェットだけ異なるフィルター条件を設定できる機能, so that 複数の視点を1つのダッシュボードで比較できる

#### Acceptance Criteria
1. The Dashboard Service shall 各ウィジェットに「グローバルフィルターを使用」フラグを持たせる
2. When 「グローバルフィルターを使用」がOFFの時, the Dashboard Service shall ウィジェット固有のフィルター設定項目を表示する
3. When ウィジェット固有フィルターが設定されている時, the Dashboard Service shall グローバルフィルターではなくウィジェット固有フィルターでデータを取得する
4. The Dashboard Service shall ウィジェットごとにオーバーライド可能な項目を選択できる（年度、部門、期間、シナリオ等）
5. When グローバルフィルターが変更された時 and ウィジェットが「グローバルフィルターを使用」ONの時, the Dashboard Service shall そのウィジェットのデータを更新する

---

### Requirement 6: KPIカードウィジェット

**Objective:** As a CFO, I want KPI値をカード形式で表示できる機能, so that 重要指標を一目で確認できる

#### Acceptance Criteria
1. The Dashboard Service shall KPIカードウィジェットを提供する
2. The Dashboard Service shall KPIカードに以下を表示する：指標名、現在値、単位、前期比/予実差（Compare ON時）
3. When Compare設定がONの時, the Dashboard Service shall 差異率をパーセンテージで表示し、正/負を色分け（緑/赤）する
4. Where スパークライン表示がONの時, the Dashboard Service shall カード内に推移ミニチャートを埋め込む
5. The Dashboard Service shall データソースとしてFact/KPI/Metricから選択可能とする

---

### Requirement 7: 折れ線チャートウィジェット

**Objective:** As a 経営企画担当者, I want 時系列推移を折れ線グラフで表示できる機能, so that トレンドを視覚的に把握できる

#### Acceptance Criteria
1. The Dashboard Service shall SyncFusion Line Chart を用いた折れ線チャートウィジェットを提供する
2. The Dashboard Service shall 複数系列（複数指標・複数部門）を1つのチャートに描画可能とする
3. When Compare設定がONの時, the Dashboard Service shall 比較対象を別系列として描画する
4. The Dashboard Service shall X軸に期間、Y軸に値を表示する
5. When ユーザーがデータポイントにホバーした時, the Dashboard Service shall ツールチップで詳細値を表示する
6. The Dashboard Service shall 凡例を表示し、系列の表示/非表示を切り替え可能とする

---

### Requirement 8: 棒グラフウィジェット

**Objective:** As a 事業責任者, I want 部門別・項目別比較を棒グラフで表示できる機能, so that 構成比や比較を把握できる

#### Acceptance Criteria
1. The Dashboard Service shall SyncFusion Bar Chart を用いた棒グラフウィジェットを提供する
2. The Dashboard Service shall 縦棒・横棒を設定で切り替え可能とする
3. The Dashboard Service shall 積み上げ棒グラフ表示をオプションとして提供する
4. When Compare設定がONの時, the Dashboard Service shall グループ化した棒グラフで比較表示する
5. The Dashboard Service shall データラベル表示のON/OFFを設定可能とする

---

### Requirement 9: 円グラフウィジェット

**Objective:** As a 経営企画担当者, I want 構成比を円グラフで表示できる機能, so that 全体に占める割合を視覚的に把握できる

#### Acceptance Criteria
1. The Dashboard Service shall SyncFusion Pie Chart を用いた円グラフウィジェットを提供する
2. The Dashboard Service shall ドーナツチャート表示をオプションとして提供する
3. The Dashboard Service shall 各セグメントにラベル（項目名・割合）を表示する
4. When ユーザーがセグメントをクリックした時, the Dashboard Service shall ツールチップで詳細値を表示する

---

### Requirement 10: ゲージウィジェット

**Objective:** As a CFO, I want 目標達成率をゲージで表示できる機能, so that 進捗状況を直感的に把握できる

#### Acceptance Criteria
1. The Dashboard Service shall SyncFusion Circular Gauge を用いたゲージウィジェットを提供する
2. The Dashboard Service shall 現在値・目標値・達成率を表示する
3. The Dashboard Service shall 達成率に応じた色分け（閾値設定可能）を行う
4. The Dashboard Service shall ゲージスタイル（半円・全円）を選択可能とする

---

### Requirement 11: テーブルウィジェット

**Objective:** As a FP&A担当者, I want 詳細数値をテーブル形式で表示できる機能, so that 精緻な分析ができる

#### Acceptance Criteria
1. The Dashboard Service shall SyncFusion DataGrid を用いたテーブルウィジェットを提供する
2. The Dashboard Service shall 列ヘッダーによるソートを可能とする
3. When Compare設定がONの時, the Dashboard Service shall 差異列（金額差・率差）を表示する
4. When ユーザーがExcelエクスポートボタンを押した時, the Dashboard Service shall SyncFusion標準機能でExcelファイルをダウンロードする
5. The Dashboard Service shall 数値フォーマット（カンマ区切り・小数桁数）を適用する

---

### Requirement 12: テキストウィジェット

**Objective:** As a 経営企画担当者, I want 説明テキストやメモを表示できる機能, so that ダッシュボードに補足情報を追加できる

#### Acceptance Criteria
1. The Dashboard Service shall テキストウィジェットを提供する
2. The Dashboard Service shall マークダウン形式のテキスト入力を受け付ける
3. The Dashboard Service shall 入力されたマークダウンをレンダリングして表示する

---

### Requirement 13: 複合チャートウィジェット

**Objective:** As a 経営企画担当者, I want 折れ線と棒を組み合わせたチャートを表示できる機能, so that 異なる指標を同一チャートで比較できる

#### Acceptance Criteria
1. The Dashboard Service shall SyncFusion Chart の複合チャート機能を用いたウィジェットを提供する
2. The Dashboard Service shall 1つの系列を折れ線、別の系列を棒として描画する
3. The Dashboard Service shall 主軸・副軸（2軸）表示を設定可能とする
4. The Dashboard Service shall 各系列のチャート種別（折れ線/棒）を個別に設定可能とする

---

### Requirement 14: データソース設定

**Objective:** As a FP&A担当者, I want ウィジェットに表示するデータソースを柔軟に設定できる機能, so that 必要な経営指標を自由に可視化できる

#### Acceptance Criteria
1. The Dashboard Service shall 以下のデータソースタイプを提供する：Fact（勘定科目）、KPI、Metric（指標）
2. The Dashboard Service shall 1つのウィジェットに複数のデータソースを設定可能とする
3. When データソースタイプがFactの時, the Dashboard Service shall 勘定科目選択を表示する
4. When データソースタイプがKPIの時, the Dashboard Service shall KPI定義選択を表示する
5. When データソースタイプがMetricの時, the Dashboard Service shall 指標マスタ選択を表示する
6. The Dashboard Service shall 各データソースに表示ラベル（凡例名）を設定可能とする

---

### Requirement 15: ダッシュボード新規作成

**Objective:** As a FP&A担当者, I want 新規ダッシュボードを作成できる機能, so that 分析目的に応じたダッシュボードを用意できる

#### Acceptance Criteria
1. When ユーザーが新規作成を開始した時, the Dashboard Service shall ダッシュボード名・説明の入力フォームを表示する
2. When ユーザーがテンプレートから作成を選択した時, the Dashboard Service shall 利用可能なテンプレート一覧を表示する
3. When テンプレートが選択された時, the Dashboard Service shall テンプレートのウィジェット構成を複製して新規ダッシュボードを作成する
4. When ユーザーが空白から作成を選択した時, the Dashboard Service shall ウィジェット未配置の空ダッシュボードを作成する
5. The Dashboard Service shall 作成者を owner_id として記録する

---

### Requirement 16: ダッシュボード複製

**Objective:** As a 経営企画担当者, I want 既存ダッシュボードを複製できる機能, so that 類似のダッシュボードを効率的に作成できる

#### Acceptance Criteria
1. When ユーザーがダッシュボード複製を実行した時, the Dashboard Service shall 元ダッシュボードの全設定（ウィジェット含む）をコピーする
2. The Dashboard Service shall 複製されたダッシュボードに「（コピー）」を付与した名前を設定する
3. The Dashboard Service shall 複製先の owner_id を実行ユーザーに設定する

---

### Requirement 17: ダッシュボード削除

**Objective:** As a FP&A担当者, I want 不要なダッシュボードを削除できる機能, so that 一覧を整理できる

#### Acceptance Criteria
1. When ユーザーがダッシュボード削除を実行した時, the Dashboard Service shall 確認ダイアログを表示する
2. When ユーザーが削除を確認した時, the Dashboard Service shall ダッシュボードと関連ウィジェットを論理削除する
3. If ダッシュボードがシステムテンプレートの場合, then the Dashboard Service shall 削除を禁止しエラーメッセージを表示する

---

### Requirement 18: PDFエクスポート

**Objective:** As a CFO, I want ダッシュボード全体をPDFで出力できる機能, so that 経営会議資料として利用できる

#### Acceptance Criteria
1. When ユーザーがPDFエクスポートを実行した時, the Dashboard Service shall ダッシュボード表示画面をキャプチャしてPDFを生成する
2. The Dashboard Service shall html2canvas + jsPDF を用いてPDF生成を行う
3. The Dashboard Service shall エクスポート時のタイムスタンプをPDFに含める
4. While PDFエクスポート処理中, the Dashboard Service shall 進捗インジケーターを表示する

---

### Requirement 19: 初期テンプレート「経営サマリー」

**Objective:** As a 導入担当者, I want 初期テンプレートが提供されている機能, so that すぐにダッシュボード機能を活用できる

#### Acceptance Criteria
1. The Dashboard Service shall 「経営サマリー」テンプレートを初期提供する
2. The Dashboard Service shall テンプレートに以下のウィジェットを含める：KPIカード4枚（売上高、営業利益、営業利益率、ROE）、売上推移折れ線チャート、部門別売上棒グラフ、主要指標テーブル
3. The Dashboard Service shall テンプレートを owner_type=SYSTEM として登録する
4. The Dashboard Service shall テンプレートは削除不可とする

---

### Requirement 20: 権限制御

**Objective:** As a システム管理者, I want ダッシュボードの閲覧・編集権限を制御できる機能, so that 適切なユーザーのみがアクセスできる

#### Acceptance Criteria
1. The Dashboard Service shall `epm.dashboard.read` 権限でダッシュボード閲覧を制御する
2. The Dashboard Service shall `epm.dashboard.edit` 権限でダッシュボード編集・作成・削除を制御する
3. If ユーザーに `epm.dashboard.read` 権限がない場合, then the Dashboard Service shall ダッシュボード一覧・表示画面へのアクセスを拒否する
4. If ユーザーに `epm.dashboard.edit` 権限がない場合, then the Dashboard Service shall 編集モード・新規作成・削除ボタンを非表示にする
5. The Dashboard Service shall 権限チェックをUI/BFF/APIで一貫して実行する

---

## Out of Scope

以下は本要件のスコープ外とする：

1. **ウォーターフォールチャート**: データ構造設計が複雑なため、別Feature として後日検討
2. **リアルタイム自動更新（WebSocket）**: 手動リフレッシュのみ提供
3. **ダッシュボード共有・公開設定**: 権限は共通設定で制御し、ダッシュボード単位の共有設定は対象外
4. **AIによるインサイト自動生成**: フェーズ1では対象外（将来の拡張候補）
5. **既存財務指標分析レポートの削除**: 本機能リリース後、段階的に移行・廃止を検討

---

## Non-Functional Requirements

### 性能要件
- ダッシュボード表示画面の初期ロードは5秒以内を目標とする
- ウィジェット単位でのデータ取得により、部分的なローディングを実現する

### 運用要件
- ダッシュボード設定変更は監査ログに記録する
- テナント間のデータ分離をRLSで保証する

### UI/UX要件
- SyncFusion Dashboard Layout によるレスポンシブなグリッドレイアウト
- ダークモード対応は既存Design Systemに準拠

---

## Migration Strategy（既存レポートからの移行）

本ダッシュボード機能は、既存の「財務指標分析レポート」を段階的に置換する：

1. **Phase 1**: ダッシュボード機能をリリース、既存レポートは並存
2. **Phase 2**: ダッシュボードに「財務指標分析」テンプレートを追加
3. **Phase 3**: 既存レポート利用状況を確認し、段階的に廃止

移行期間中、既存レポートへのナビゲーションは維持する。
