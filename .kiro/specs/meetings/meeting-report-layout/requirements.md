# レポートレイアウト設定 Requirements

> **ステータス**: 要件定義中
> **作成日**: 2026-01-27
> **スコープ**: A4（レポートレイアウト設定）
> **対象ユーザー**: システム管理者、経営企画部

---

## Spec Reference

- **仕様概要（SSoT）**: [.kiro/specs/仕様概要/経営会議レポート機能.md](../../仕様概要/経営会議レポート機能.md)
- **仕様検討**: [.kiro/specs/仕様検討/20260115_経営会議レポート機能.md](../../仕様検討/20260115_経営会議レポート機能.md)

---

## Introduction

レポートレイアウト設定（meeting-report-layout）は、経営会議レポート機能における**表示側**の設定画面である。

本機能は、会議種別ごとに経営層が閲覧する「レポート」の表示構成を定義する。レイアウト（全体構成）、ページ（タブ）、コンポーネント（表・グラフ・カード等）を階層構造で管理し、各コンポーネントの設定を行う。

### 位置づけ

- **A3（報告フォーム設定）**: 部門が「何を入力するか」を定義（INPUT側）
- **A4（レポートレイアウト設定）**: 経営層が「何を見るか」を定義（OUTPUT側）

### 対象ユーザー

- システム管理者
- 経営企画部（会議設計担当）

### ビジネス目的

- 会議種別ごとに適切なレポートレイアウトを設計できる
- ページ（タブ）構成を柔軟にカスタマイズできる
- 各種コンポーネント（KPIカード、表、グラフ等）を配置できる
- 標準レイアウト（エグゼクティブサマリー等）を定義・再利用できる

---

## Entity Reference

本機能で使用するエンティティ定義を確認する：

### 対象エンティティ

- **meeting_report_layouts**: `.kiro/specs/仕様検討/20260115_経営会議レポート機能.md` セクション 5.5
- **meeting_report_pages**: `.kiro/specs/仕様検討/20260115_経営会議レポート機能.md` セクション 5.6
- **meeting_report_components**: `.kiro/specs/仕様検討/20260115_経営会議レポート機能.md` セクション 5.7

### 関連エンティティ（参照のみ）

- **meeting_types**: `.kiro/specs/仕様検討/20260115_経営会議レポート機能.md` セクション 5.2（レイアウトの親）
- **dimensions**: 部門/事業部の展開軸として参照

### エンティティ整合性確認

- [x] 対象エンティティのカラム・型・制約を確認した
- [x] エンティティ補足のビジネスルールを要件に反映した
- [x] スコープ外の関連エンティティを Out of Scope に明記した

---

## Functional Requirements

### FR-1: レイアウト一覧表示

**Objective:** As a システム管理者, I want 会議種別のレポートレイアウトを一覧表示できること, so that レイアウト構成を把握できる

#### Acceptance Criteria

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-1.1 | When ユーザーが会議種別を選択した時, the Report Layout Service shall 当該会議種別に属するレイアウト一覧をsort_order順で表示する | P1 |
| FR-1.2 | The Report Layout Service shall 各レイアウトにレイアウトコード、レイアウト名、説明、デフォルトフラグ、ページ数を表示する | P1 |
| FR-1.3 | The Report Layout Service shall デフォルトレイアウト（is_default=true）をバッジで強調表示する | P1 |
| FR-1.4 | The Report Layout Service shall 無効なレイアウト（is_active=false）をグレーアウト表示する | P2 |

---

### FR-2: レイアウト追加

**Objective:** As a システム管理者, I want 新しいレイアウトを追加できること, so that 複数のレイアウトバリエーションを作成できる

#### Acceptance Criteria

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-2.1 | When ユーザーが必須項目（レイアウトコード、レイアウト名）を入力して登録を実行した時, the Report Layout Service shall 新しいレイアウトレコードを作成する | P1 |
| FR-2.2 | The Report Layout Service shall レイアウトコードを会議種別内で一意とする | P1 |
| FR-2.3 | If 同一会議種別内で既に存在するレイアウトコードで登録しようとした場合, the Report Layout Service shall 「レイアウトコードが重複しています」エラーを返す | P1 |
| FR-2.4 | The Report Layout Service shall 新規レイアウトの sort_order を既存レイアウトの最大値 + 10 として初期化する | P1 |
| FR-2.5 | When 会議種別に初めてレイアウトを作成した時, the Report Layout Service shall is_default を true として初期化する | P1 |
| FR-2.6 | The Report Layout Service shall 登録時に is_active を true として初期化する | P1 |

**入力項目**:
- レイアウトコード（layout_code）: 必須、英数字アンダースコア、最大50文字
- レイアウト名（layout_name）: 必須、最大200文字
- 説明（description）: 任意、テキスト
- デフォルトフラグ（is_default）: 任意、デフォルトfalse

---

### FR-3: レイアウト編集

**Objective:** As a システム管理者, I want レイアウト情報を編集できること, so that レイアウト構成を調整できる

#### Acceptance Criteria

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-3.1 | When ユーザーがレイアウト情報を編集して更新を実行した時, the Report Layout Service shall 対象レイアウトのレコードを更新する | P1 |
| FR-3.2 | If 更新対象のレイアウトが存在しない場合, the Report Layout Service shall 「レイアウトが見つかりません」エラーを返す | P1 |
| FR-3.3 | When is_default を true に設定した時, the Report Layout Service shall 同一会議種別の他のレイアウトの is_default を false に更新する | P1 |
| FR-3.4 | The Report Layout Service shall 更新時に updated_at を記録する | P1 |

---

### FR-4: レイアウト削除

**Objective:** As a システム管理者, I want レイアウトを削除できること, so that 不要なレイアウトを除外できる

#### Acceptance Criteria

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-4.1 | When ユーザーがレイアウトの削除ボタンを押した時, the Report Layout UI shall 確認ダイアログを表示する | P1 |
| FR-4.2 | When レイアウトにページが存在する場合, the Report Layout UI shall 「このレイアウトには[N]個のページがあります。レイアウトと関連データをすべて削除しますか？」という警告を表示する | P1 |
| FR-4.3 | When ユーザーが確認ダイアログで「削除」を選択した時, the Report Layout Service shall 対象レイアウト・ページ・コンポーネントをすべて物理削除する | P1 |
| FR-4.4 | If 削除対象がデフォルトレイアウト（is_default=true）の場合, the Report Layout Service shall 「デフォルトレイアウトは削除できません」エラーを返す | P1 |
| FR-4.5 | If 削除対象が会議イベントで使用中の場合, the Report Layout Service shall 「使用中のレイアウトは削除できません」エラーを返す | P1 |

---

### FR-5: ページ一覧表示

**Objective:** As a システム管理者, I want レイアウト内のページ（タブ）を一覧表示できること, so that レポート構成を把握できる

#### Acceptance Criteria

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-5.1 | When ユーザーがレイアウトを選択した時, the Report Layout Service shall 当該レイアウトに属するページ一覧をsort_order順で表示する | P1 |
| FR-5.2 | The Report Layout Service shall 各ページにページコード、ページ名、ページタイプ（FIXED/PER_DEPARTMENT/PER_BU）、コンポーネント数を表示する | P1 |
| FR-5.3 | The Report Layout Service shall ページタイプをバッジで視覚的に表示する | P2 |
| FR-5.4 | The Report Layout Service shall 無効なページ（is_active=false）をグレーアウト表示する | P2 |

---

### FR-6: ページ追加

**Objective:** As a システム管理者, I want レイアウトに新しいページ（タブ）を追加できること, so that レポート構成を拡張できる

#### Acceptance Criteria

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-6.1 | When ユーザーが必須項目（ページコード、ページ名、ページタイプ）を入力して登録を実行した時, the Report Layout Service shall 新しいページレコードを作成する | P1 |
| FR-6.2 | The Report Layout Service shall ページコードをレイアウト内で一意とする | P1 |
| FR-6.3 | If 同一レイアウト内で既に存在するページコードで登録しようとした場合, the Report Layout Service shall 「ページコードが重複しています」エラーを返す | P1 |
| FR-6.4 | When ページタイプが PER_DEPARTMENT または PER_BU の場合, the Report Layout Service shall 展開軸（expand_dimension_id）の入力を任意とする | P2 |
| FR-6.5 | The Report Layout Service shall 新規ページの sort_order を既存ページの最大値 + 10 として初期化する | P1 |
| FR-6.6 | The Report Layout Service shall 登録時に is_active を true として初期化する | P1 |

**入力項目**:
- ページコード（page_code）: 必須、英数字アンダースコア、最大50文字
- ページ名（page_name）: 必須、最大200文字
- ページタイプ（page_type）: 必須、FIXED/PER_DEPARTMENT/PER_BU から選択
- 展開軸（expand_dimension_id）: PER_DEPARTMENT/PER_BU時に任意

**ページタイプ一覧**:

| タイプ | 説明 | 用途 |
|--------|------|------|
| FIXED | 固定1ページ | エグゼクティブサマリー、全社集計 |
| PER_DEPARTMENT | 部門ごとに展開 | 部門別詳細ページ |
| PER_BU | 事業部ごとに展開 | 事業部別詳細ページ |

---

### FR-7: ページ編集

**Objective:** As a システム管理者, I want ページ情報を編集できること, so that レポート構成を調整できる

#### Acceptance Criteria

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-7.1 | When ユーザーがページ情報を編集して更新を実行した時, the Report Layout Service shall 対象ページのレコードを更新する | P1 |
| FR-7.2 | If 更新対象のページが存在しない場合, the Report Layout Service shall 「ページが見つかりません」エラーを返す | P1 |
| FR-7.3 | If ページコードを変更して既存のコードと重複する場合, the Report Layout Service shall 「ページコードが重複しています」エラーを返す | P1 |
| FR-7.4 | The Report Layout Service shall 更新時に updated_at を記録する | P1 |

---

### FR-8: ページ削除

**Objective:** As a システム管理者, I want ページを削除できること, so that 不要なページをレポートから除外できる

#### Acceptance Criteria

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-8.1 | When ユーザーがページの削除ボタンを押した時, the Report Layout UI shall 確認ダイアログを表示する | P1 |
| FR-8.2 | When ページにコンポーネントが存在する場合, the Report Layout UI shall 「このページには[N]個のコンポーネントがあります。ページとコンポーネントをすべて削除しますか？」という警告を表示する | P1 |
| FR-8.3 | When ユーザーが確認ダイアログで「削除」を選択した時, the Report Layout Service shall 対象ページと所属するコンポーネントをすべて物理削除する | P1 |
| FR-8.4 | If 削除対象のページが存在しない場合, the Report Layout Service shall 「ページが見つかりません」エラーを返す | P1 |

---

### FR-9: ページ並べ替え

**Objective:** As a システム管理者, I want ページの順序をドラッグ＆ドロップで変更できること, so that タブ順序を直感的に編集できる

#### Acceptance Criteria

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-9.1 | When ユーザーがページをドラッグして別の位置にドロップした時, the Report Layout Service shall 対象ページの sort_order を更新して順序を変更する | P1 |
| FR-9.2 | The Report Layout UI shall ドラッグ中にドロップ可能な位置を視覚的に示す | P1 |
| FR-9.3 | When 並べ替えが完了した時, the Report Layout Service shall 影響を受けたページの sort_order を再計算する | P1 |

---

### FR-10: コンポーネント一覧表示

**Objective:** As a システム管理者, I want ページ内のコンポーネントを一覧表示できること, so that ページ構成を把握できる

#### Acceptance Criteria

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-10.1 | When ユーザーがページを選択した時, the Report Layout Service shall 当該ページに属するコンポーネント一覧をsort_order順で表示する | P1 |
| FR-10.2 | The Report Layout Service shall 各コンポーネントにコンポーネントコード、コンポーネント名、コンポーネントタイプ、データソース、幅を表示する | P1 |
| FR-10.3 | The Report Layout Service shall コンポーネントタイプをアイコンとバッジで視覚的に表示する | P2 |
| FR-10.4 | The Report Layout Service shall 幅（FULL/HALF/THIRD）を視覚的なプレビューで表示する | P2 |
| FR-10.5 | The Report Layout Service shall 無効なコンポーネント（is_active=false）をグレーアウト表示する | P2 |

---

### FR-11: コンポーネント追加

**Objective:** As a システム管理者, I want ページに新しいコンポーネントを追加できること, so that レポート表示内容を拡張できる

#### Acceptance Criteria

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-11.1 | When ユーザーが必須項目（コンポーネントコード、コンポーネント名、コンポーネントタイプ、データソース）を入力して登録を実行した時, the Report Layout Service shall 新しいコンポーネントレコードを作成する | P1 |
| FR-11.2 | The Report Layout Service shall コンポーネントコードをページ内で一意とする | P1 |
| FR-11.3 | If 同一ページ内で既に存在するコンポーネントコードで登録しようとした場合, the Report Layout Service shall 「コンポーネントコードが重複しています」エラーを返す | P1 |
| FR-11.4 | The Report Layout Service shall 新規コンポーネントの sort_order を既存コンポーネントの最大値 + 10 として初期化する | P1 |
| FR-11.5 | The Report Layout Service shall 登録時に is_active を true として初期化する | P1 |
| FR-11.6 | The Report Layout Service shall config_json のデフォルト値をコンポーネントタイプに応じて初期化する | P2 |

**入力項目**:
- コンポーネントコード（component_code）: 必須、英数字アンダースコア、最大50文字
- コンポーネント名（component_name）: 必須、最大200文字
- コンポーネントタイプ（component_type）: 必須、後述の一覧から選択
- データソース（data_source）: 必須、FACT/KPI/SUBMISSION/SNAPSHOT/EXTERNAL から選択
- 幅（width）: 必須、FULL/HALF/THIRD から選択、デフォルトFULL
- 高さ（height）: 任意、AUTO/SMALL/MEDIUM/LARGE から選択
- 設定（config_json）: コンポーネントタイプに応じた設定

---

### FR-12: コンポーネントタイプ設定

**Objective:** As a システム管理者, I want コンポーネントタイプに応じた詳細設定ができること, so that 適切な表示を構成できる

#### Acceptance Criteria

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-12.1 | When コンポーネントタイプが KPI_CARD の場合, the Report Layout UI shall KPIカード固有の設定UIを表示する | P1 |
| FR-12.2 | When コンポーネントタイプが TABLE の場合, the Report Layout UI shall テーブル固有の設定UIを表示する | P1 |
| FR-12.3 | When コンポーネントタイプが CHART の場合, the Report Layout UI shall チャート固有の設定UIを表示する | P1 |
| FR-12.4 | When コンポーネントタイプが SUBMISSION_DISPLAY の場合, the Report Layout UI shall 部門報告表示固有の設定UIを表示する | P1 |
| FR-12.5 | When コンポーネントタイプが REPORT_LINK の場合, the Report Layout UI shall リンク設定UIを表示する | P2 |
| FR-12.6 | When コンポーネントタイプが ACTION_LIST の場合, the Report Layout UI shall アクション一覧固有の設定UIを表示する | P2 |
| FR-12.7 | When コンポーネントタイプが SNAPSHOT_COMPARE の場合, the Report Layout UI shall 比較設定UIを表示する | P2 |
| FR-12.8 | When コンポーネントタイプが KPI_DASHBOARD の場合, the Report Layout UI shall KPIダッシュボード固有の設定UIを表示する | P2 |
| FR-12.9 | When コンポーネントタイプが AP_PROGRESS の場合, the Report Layout UI shall AP進捗固有の設定UIを表示する | P2 |

**コンポーネントタイプ一覧**:

| タイプ | 説明 | データソース | 用途 |
|--------|------|--------------|------|
| KPI_CARD | 主要指標カード | FACT | 売上・利益等のKPI表示 |
| TABLE | データ表 | FACT | 予実対比表等 |
| CHART | グラフ | FACT | ウォーターフォール、棒、折れ線等 |
| SUBMISSION_DISPLAY | 部門報告表示 | SUBMISSION | 部門からの報告内容表示 |
| REPORT_LINK | 既存レポートリンク | EXTERNAL | 予実レポート等へのリンク |
| ACTION_LIST | アクション一覧 | EXTERNAL | 会議アクション表示 |
| SNAPSHOT_COMPARE | 前回比較 | SNAPSHOT | 前回会議との差分表示 |
| KPI_DASHBOARD | KPI一覧 | KPI | KPI一覧ダッシュボード |
| AP_PROGRESS | AP進捗 | EXTERNAL | アクションプラン進捗表示 |

---

### FR-13: config_json 設定（共通）

**Objective:** As a システム管理者, I want コンポーネントの詳細設定をJSON形式で管理できること, so that 柔軟な表示設定が可能になる

#### Acceptance Criteria

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-13.1 | The Report Layout Service shall config_json をJSONB形式で保存する | P1 |
| FR-13.2 | The Report Layout Service shall 全コンポーネント共通の設定項目（title, showHeader, collapsible, defaultCollapsed, hideWhenEmpty）をサポートする | P1 |
| FR-13.3 | The Report Layout UI shall コンポーネントタイプに応じた設定フォームを表示する | P1 |
| FR-13.4 | The Report Layout UI shall 設定変更時にリアルタイムでプレビューを更新する | P2 |

**共通config_json設定**:
```json
{
  "title": "カスタムタイトル",
  "showHeader": true,
  "collapsible": false,
  "defaultCollapsed": false,
  "hideWhenEmpty": false,
  "emptyMessage": "データがありません"
}
```

---

### FR-14: KPI_CARD設定

**Objective:** As a システム管理者, I want KPIカードの表示設定ができること, so that 主要指標を効果的に表示できる

#### Acceptance Criteria

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-14.1 | The Report Layout UI shall 表示するKPI科目を選択可能とする | P1 |
| FR-14.2 | The Report Layout UI shall レイアウト形式（grid/list）を選択可能とする | P1 |
| FR-14.3 | The Report Layout UI shall グリッド列数（2/3/4）を選択可能とする | P1 |
| FR-14.4 | The Report Layout UI shall 表示項目（目標値、差異、トレンド、スパークライン）のON/OFFを設定可能とする | P2 |
| FR-14.5 | The Report Layout UI shall 閾値による色分け（danger/warning）を設定可能とする | P2 |

---

### FR-15: TABLE設定

**Objective:** As a システム管理者, I want テーブルの表示設定ができること, so that 予実対比等を効果的に表示できる

#### Acceptance Criteria

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-15.1 | The Report Layout UI shall 行軸（organization/subject/period）を選択可能とする | P1 |
| FR-15.2 | The Report Layout UI shall 比較モード（BUDGET_VS_ACTUAL, BUDGET_VS_ACTUAL_FORECAST等）を選択可能とする | P1 |
| FR-15.3 | The Report Layout UI shall 表示列（budget, actual, forecast, variance, varianceRate）を選択可能とする | P1 |
| FR-15.4 | The Report Layout UI shall 合計行・小計行の表示ON/OFFを設定可能とする | P2 |
| FR-15.5 | The Report Layout UI shall 差異ハイライトのON/OFFを設定可能とする | P2 |

---

### FR-16: CHART設定

**Objective:** As a システム管理者, I want チャートの表示設定ができること, so that グラフを効果的に表示できる

#### Acceptance Criteria

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-16.1 | The Report Layout UI shall チャートタイプ（waterfall/bar/line/area/pie/donut）を選択可能とする | P1 |
| FR-16.2 | The Report Layout UI shall X軸（period/organization/subject）を選択可能とする | P1 |
| FR-16.3 | The Report Layout UI shall 凡例・データラベル・グリッド線の表示ON/OFFを設定可能とする | P2 |
| FR-16.4 | When チャートタイプが waterfall の場合, the Report Layout UI shall 開始/終了ラベルと色設定を入力可能とする | P2 |

---

### FR-17: コンポーネント編集

**Objective:** As a システム管理者, I want コンポーネント情報を編集できること, so that 表示内容を調整できる

#### Acceptance Criteria

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-17.1 | When ユーザーがコンポーネント情報を編集して更新を実行した時, the Report Layout Service shall 対象コンポーネントのレコードを更新する | P1 |
| FR-17.2 | If 更新対象のコンポーネントが存在しない場合, the Report Layout Service shall 「コンポーネントが見つかりません」エラーを返す | P1 |
| FR-17.3 | When コンポーネントタイプを変更した時, the Report Layout Service shall config_json をリセットする | P2 |
| FR-17.4 | The Report Layout Service shall 更新時に updated_at を記録する | P1 |

---

### FR-18: コンポーネント削除

**Objective:** As a システム管理者, I want コンポーネントを削除できること, so that 不要なコンポーネントを除外できる

#### Acceptance Criteria

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-18.1 | When ユーザーがコンポーネントの削除ボタンを押した時, the Report Layout UI shall 確認ダイアログを表示する | P1 |
| FR-18.2 | When ユーザーが確認ダイアログで「削除」を選択した時, the Report Layout Service shall 対象コンポーネントのレコードを物理削除する | P1 |
| FR-18.3 | If 削除対象のコンポーネントが存在しない場合, the Report Layout Service shall 「コンポーネントが見つかりません」エラーを返す | P1 |

---

### FR-19: コンポーネント並べ替え

**Objective:** As a システム管理者, I want コンポーネントの順序をドラッグ＆ドロップで変更できること, so that 表示順序を直感的に編集できる

#### Acceptance Criteria

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-19.1 | When ユーザーがコンポーネントをドラッグして別の位置にドロップした時, the Report Layout Service shall 対象コンポーネントの sort_order を更新して順序を変更する | P1 |
| FR-19.2 | The Report Layout UI shall ドラッグ中にドロップ可能な位置を視覚的に示す | P1 |
| FR-19.3 | When 並べ替えが完了した時, the Report Layout Service shall 影響を受けたコンポーネントの sort_order を再計算する | P1 |
| FR-19.4 | The Report Layout Service shall ページ間でのコンポーネント移動は不可とする（同一ページ内のみ） | P1 |

---

### FR-20: レイアウトプレビュー

**Objective:** As a システム管理者, I want 設定したレイアウトをプレビューできること, so that 実際の表示イメージを確認できる

#### Acceptance Criteria

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-20.1 | When ユーザーがプレビュー表示を実行した時, the Report Layout UI shall レイアウトを実際のレポート画面と同じ構成で表示する | P1 |
| FR-20.2 | The Report Layout UI shall ページ（タブ）切り替えをプレビュー内で動作させる | P1 |
| FR-20.3 | The Report Layout UI shall 各コンポーネントをサンプルデータで表示する | P1 |
| FR-20.4 | The Report Layout UI shall コンポーネントの幅（FULL/HALF/THIRD）を実際のレイアウトで表示する | P1 |
| FR-20.5 | When プレビューモードの場合, the Report Layout UI shall モックデータを使用する（実データは使用しない） | P1 |

---

### FR-21: 標準テンプレート

**Objective:** As a システム管理者, I want 標準テンプレートからレイアウトを初期化できること, so that 一般的なレイアウト構成を効率的に作成できる

#### Acceptance Criteria

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-21.1 | When 会議種別にレイアウトが未定義の場合, the Report Layout UI shall 「テンプレートから作成」ボタンを表示する | P2 |
| FR-21.2 | When ユーザーがテンプレート選択を実行した時, the Report Layout UI shall 利用可能なテンプレート一覧を表示する | P2 |
| FR-21.3 | When ユーザーがテンプレートを選択した時, the Report Layout Service shall テンプレートのレイアウト・ページ・コンポーネントを複製して作成する | P2 |
| FR-21.4 | The Report Layout Service shall 「月次経営会議レイアウト」標準テンプレートを提供する | P2 |

**月次経営会議レイアウトテンプレート構成**:

| ページ | コンポーネント | タイプ | 幅 |
|--------|--------------|--------|-----|
| エグゼクティブサマリー | 主要KPI | KPI_CARD | FULL |
| | 損益ウォーターフォール | CHART | FULL |
| | 部門別予実対比 | TABLE | FULL |
| 詳細分析 | 分析レポートリンク | REPORT_LINK | FULL |
| 部門報告 | 部門報告一覧 | SUBMISSION_DISPLAY | FULL |
| KPI・アクション | KPI一覧 | KPI_DASHBOARD | HALF |
| | AP進捗 | AP_PROGRESS | HALF |
| アクション管理 | アクション一覧 | ACTION_LIST | FULL |
| 前回比較 | スナップショット比較 | SNAPSHOT_COMPARE | FULL |

---

## Non-Functional Requirements

### NFR-1: セキュリティ

| ID | 要件 |
|----|------|
| NFR-1.1 | UIはBFF経由でのみデータを取得する（Domain API直接アクセス禁止） |
| NFR-1.2 | tenant_idによるマルチテナント分離を行う |
| NFR-1.3 | 認証されたユーザーのみアクセス可能とする |
| NFR-1.4 | レイアウト設定操作はシステム管理者権限を要する |

### NFR-2: UI/UX

| ID | 要件 |
|----|------|
| NFR-2.1 | デザインシステム（epm-design-system.md）に準拠する |
| NFR-2.2 | ドラッグ＆ドロップ操作は直感的でスムーズに動作する |
| NFR-2.3 | レスポンシブ対応（デスクトップ優先） |
| NFR-2.4 | ローディング状態を表示する |
| NFR-2.5 | エラー時はトースト通知を表示する |
| NFR-2.6 | プレビュー表示は別画面またはサイドパネルで実行する |
| NFR-2.7 | コンポーネント設定は選択したタイプに応じた適切なUIを表示する |

### NFR-3: 開発ガイドライン

| ID | 要件 |
|----|------|
| NFR-3.1 | CCSDD（Contracts-first）に準拠する |
| NFR-3.2 | v0生成UIは `_v0_drop` に隔離する |
| NFR-3.3 | Structure Guardをパスしてから本番移行する |
| NFR-3.4 | BffClientパターンを使用する（fetch直書き禁止） |
| NFR-3.5 | プレビューコンポーネントは再利用可能な設計とする |
| NFR-3.6 | config_json の型定義をTypeScriptで厳密に管理する |

---

## Out of Scope（本Spec対象外）

以下は別Specで管理：

| 機能 | 対象Spec |
|------|----------|
| 会議種別一覧・設定（A1, A2） | 実装済み（meeting-type-master） |
| 報告フォーム設定（A3） | `meeting-form-settings/`（実装済み） |
| 部門報告登録（C1, C2, C3） | `department-submission/` |
| 会議イベント管理（B1-B5） | `meeting-event-management/` |
| レポート閲覧（D1-D8） | `meeting-report-view/` |
| config_jsonで参照するデータの取得ロジック | Domain API / BFF |

---

## Glossary

| 用語 | 説明 |
|------|------|
| レイアウト | レポートの全体構成（meeting_report_layouts） |
| ページ | レイアウト内のタブ（meeting_report_pages） |
| コンポーネント | ページ内の表示要素（meeting_report_components） |
| コンポーネントタイプ | KPI_CARD/TABLE/CHART/SUBMISSION_DISPLAY/REPORT_LINK/ACTION_LIST/SNAPSHOT_COMPARE/KPI_DASHBOARD/AP_PROGRESS |
| ページタイプ | FIXED（固定）/PER_DEPARTMENT（部門展開）/PER_BU（事業部展開） |
| データソース | FACT/KPI/SUBMISSION/SNAPSHOT/EXTERNAL |
| config_json | コンポーネントの詳細設定を格納するJSON |
| プレビュー | 設定したレイアウトの表示確認機能 |
| テンプレート | 標準レイアウト構成のプリセット |

---

## 変更履歴

| 日付 | 変更内容 |
|------|----------|
| 2026-01-27 | 初版作成 |
