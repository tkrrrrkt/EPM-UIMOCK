# Requirements Document

## Introduction

本ドキュメントは、統一イベント管理機能（Unified Events）の要件を定義する。
EPMシステム内の各種イベント（予算・見込・会議・MTP・ガイドライン）を統一的なインターフェースで一覧・管理し、
部門別の登録状況を横断的に確認できる機能を提供する。

---

## Spec Reference（INPUT情報）

本要件を作成するにあたり、以下の情報を確認した：

### 仕様概要（確定済み仕様）
- **参照ファイル**: `.kiro/specs/仕様概要/統一イベント管理.md`
- **確認日**: 2026-02-06
- **主要な仕様ポイント**:
  - イベント種別（BUDGET/FORECAST/MEETING/MTP/GUIDELINE）を統一一覧で表示
  - 登録状況管理は予算・見込・会議のみ対象（部門入力があるイベント）
  - Phase 1 ではモックデータ動作、既存画面への遷移は後回し

### 仕様検討（経緯・背景）※参考
- **参照ファイル**: なし（新規機能）
- **経緯メモ**: イベント種別ごとに別画面で管理していたが、管理者が複数画面を行き来する課題を解決するため統一管理画面を新設

---

## Entity Reference（必須）

本機能で使用するエンティティ定義を `.kiro/specs/entities/*.md` から確認し、以下を記載する：

### 対象エンティティ

| エンティティ | 参照先 | 用途 |
|-------------|--------|------|
| plan_events | `01_各種マスタ.md` セクション 13 | 予算・見込イベント |
| plan_versions | `01_各種マスタ.md` セクション 13 | 予算・見込バージョン |
| mtp_events | `01_各種マスタ.md` セクション MTP | 中期経営計画イベント |
| guideline_events | `01_各種マスタ.md` セクション ガイドライン | 予算ガイドラインイベント |
| meeting_events | `仕様概要/経営会議レポート機能.md` | 会議イベント |
| meeting_submissions | `仕様概要/経営会議レポート機能.md` | 会議の部門報告 |
| department_approval_status | `03_承認ワークフロー.md` | 予算・見込の部門承認状態 |
| departments | `01_各種マスタ.md` セクション 3 | 部門マスタ |

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
| 仕様検討の背景理解 | 必要に応じて経緯を確認した: N/A（新規機能） |

---

## Requirements

### Requirement 1: イベント一覧表示

**Objective:** As a 経営企画担当者, I want 全イベント種別を横断的に一覧で確認できる機能, so that 複数画面を行き来せずにイベント状況を把握できる

#### Acceptance Criteria

1. When ユーザーがイベント管理画面にアクセスする, the BFF shall 全イベント種別（BUDGET/FORECAST/MEETING/MTP/GUIDELINE）のイベントを統一形式で返却する
2. The 統一イベント一覧 shall 以下の情報を各イベントについて表示する：イベント種別、イベント名、対象期間、ステータス、進捗率（登録状況対象イベントのみ）
3. When ユーザーが種別フィルタを選択する, the 画面 shall 選択された種別のイベントのみを表示する
4. When ユーザーが年度フィルタを選択する, the 画面 shall 選択された年度に該当するイベントのみを表示する
5. When ユーザーがステータスフィルタを選択する, the 画面 shall 選択されたステータスのイベントのみを表示する
6. The 一覧 shall イベントをページネーション（1ページ20件）で表示する

### Requirement 2: イベント詳細表示

**Objective:** As a 経営企画担当者, I want 個別イベントの詳細情報を確認できる, so that イベントの状態と関連情報を把握できる

#### Acceptance Criteria

1. When ユーザーがイベント一覧から特定のイベントを選択する, the 画面 shall イベント詳細画面に遷移する
2. The イベント詳細画面 shall 以下の基本情報を表示する：イベント名、種別、対象期間、締切日、ステータス、作成日
3. The イベント詳細画面 shall タブ形式で「概要」「登録状況」「履歴」を切り替え可能とする
4. Where イベントが登録状況管理対象（BUDGET/FORECAST/MEETING）である, the 詳細画面 shall 「登録状況」タブを有効にする
5. Where イベントが登録状況管理対象外（MTP/GUIDELINE）である, the 詳細画面 shall 「登録状況」タブを非表示または無効にする

### Requirement 3: 登録状況サマリー表示

**Objective:** As a 経営企画担当者, I want 部門の登録状況を集計サマリーで確認したい, so that 全体の進捗を素早く把握できる

#### Acceptance Criteria

1. When ユーザーが登録状況タブを選択する, the 画面 shall 登録状況サマリーを表示する
2. The サマリー shall 以下のステータス別件数を表示する：未着手、入力中、提出済、承認済、差戻し
3. The サマリー shall 全体進捗率（提出済以上の割合）をパーセンテージとプログレスバーで表示する
4. Where イベントに締切日が設定されている, the サマリー shall 締切までの残日数を表示する
5. If 締切日を過ぎている and 未提出の部門が存在する, then the サマリー shall 「期限超過」ステータスの件数を表示する

### Requirement 4: 部門別登録状況一覧

**Objective:** As a 経営企画担当者, I want 部門ごとの登録状況を一覧で確認したい, so that 未提出部門への催促や進捗管理ができる

#### Acceptance Criteria

1. The 登録状況タブ shall 部門一覧を階層構造（ツリー形式）で表示する
2. The 部門一覧 shall 各部門について以下の情報を表示する：部門名、ステータス、最終更新日時、担当者名
3. Where イベントが承認ワークフロー対象（BUDGET/FORECAST）である, the 部門一覧 shall 承認段階（現在/最大）を表示する
4. When ユーザーがステータスフィルタを選択する, the 部門一覧 shall 選択されたステータスの部門のみを表示する
5. When ユーザーが部門フィルタを選択する, the 部門一覧 shall 選択された部門配下の部門のみを表示する
6. The 部門一覧 shall ステータスに応じたアイコン・色分けで視覚的に状態を識別可能とする

### Requirement 5: 催促機能

**Objective:** As a 経営企画担当者, I want 未提出部門に催促を送りたい, so that 期限内の提出を促進できる

#### Acceptance Criteria

1. When ユーザーが未提出/入力中の部門を選択して「催促」ボタンを押す, the 画面 shall 催促確認ダイアログを表示する
2. The 催促ダイアログ shall 選択された部門の一覧とメッセージ入力欄を表示する
3. When ユーザーが催促を確定する, the BFF shall 催促リクエストを受け付ける（Phase 1 ではメール送信は未実装）
4. If 既に提出済または承認済の部門が選択されている, then the 画面 shall 催促対象から除外し警告メッセージを表示する

### Requirement 6: ステータスマッピング

**Objective:** As a システム, I want 各イベント種別のステータスを統一形式に変換したい, so that 一貫した表示を提供できる

#### Acceptance Criteria

1. The BFF shall 各イベント種別の元ステータスを統一表示ラベルにマッピングする
2. The BUDGET/FORECAST イベント shall 以下のマッピングを適用する：DRAFT→下書き、SUBMITTED→受付中、APPROVED→承認済、FIXED→確定済
3. The MEETING イベント shall 以下のマッピングを適用する：DRAFT→下書き、OPEN→受付開始、COLLECTING→受付中、HELD→開催済、CLOSED→完了
4. The MTP イベント shall 以下のマッピングを適用する：DRAFT→下書き、CONFIRMED→確定済
5. The GUIDELINE イベント shall 以下のマッピングを適用する：DRAFT→下書き、DISTRIBUTED→配布済、CLOSED→完了

### Requirement 7: 登録状況ステータスマッピング

**Objective:** As a システム, I want 部門の登録状況を統一ステータスに変換したい, so that イベント種別を問わず一貫した表示を提供できる

#### Acceptance Criteria

1. The BFF shall 各イベント種別の登録状況を以下の統一ステータスにマッピングする：NOT_STARTED、IN_PROGRESS、SUBMITTED、APPROVED、REJECTED、OVERDUE
2. When BUDGET/FORECASTイベントで department_approval_status が存在しない or status=DRAFT and updated_at がない, the BFF shall NOT_STARTED としてマッピングする
3. When BUDGET/FORECASTイベントで status=DRAFT and updated_at がある, the BFF shall IN_PROGRESS としてマッピングする
4. When BUDGET/FORECASTイベントで status=PENDING, the BFF shall SUBMITTED としてマッピングする
5. When MEETINGイベントで meeting_submissions が存在しない, the BFF shall NOT_STARTED としてマッピングする
6. When MEETINGイベントで submission.status=DRAFT, the BFF shall IN_PROGRESS としてマッピングする
7. When MEETINGイベントで submission.status=SUBMITTED, the BFF shall SUBMITTED としてマッピングする
8. If 締切日が過ぎている and 統一ステータスが NOT_STARTED または IN_PROGRESS である, then the BFF shall OVERDUE としてマッピングする

### Requirement 8: モックデータ対応（Phase 1）

**Objective:** As a 開発者, I want モックデータで画面動作を確認したい, so that BFF/API実装前にUI検証ができる

#### Acceptance Criteria

1. The MockBffClient shall イベント一覧のモックデータを返却する
2. The MockBffClient shall イベント詳細のモックデータを返却する
3. The MockBffClient shall 登録状況一覧のモックデータを返却する
4. The モックデータ shall 全イベント種別（BUDGET/FORECAST/MEETING/MTP/GUIDELINE）のサンプルを含む
5. The モックデータ shall 複数の登録ステータス（未着手/入力中/提出済/承認済/差戻し）のサンプルを含む
6. The モックデータ shall 部門階層（親部門-子部門）を持つサンプルを含む

---

## Out of Scope（Phase 1）

以下は本要件のスコープ外とし、Phase 2 以降で検討する：

| 項目 | 理由 |
|------|------|
| 既存画面への遷移リンク | イベント詳細から予算入力画面等への遷移は後回し |
| イベント作成・編集機能 | 統一画面からのイベント作成は将来機能 |
| Domain API 実装 | Phase 1 は BFF + Mock のみ |
| 催促メール送信の実処理 | Phase 1 はダイアログ表示まで |
| CSV出力機能 | 将来機能 |
| 履歴タブの実装 | 将来機能 |
| KPI_MASTER イベント | 登録状況管理の対象外 |

---

## 変更履歴

| 日付 | 変更内容 | 担当 |
|------|---------|------|
| 2026-02-06 | 初版作成 | Claude Code |
