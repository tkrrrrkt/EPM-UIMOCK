# Requirements Document

## Introduction

本要件書は、EPM SaaSにおける「データ取込機能（Data Import）」の要件を定義する。

本機能は、外部システム（ERP等）からEPMへ金額データ（予算・見込・実績）およびマスタデータを取り込む**バイパス機能**である。カンパニー別のマッピングテンプレートにより、異なるフォーマットを統一的に処理し、AG-Gridによるプレビュー・編集機能を提供する。

---

## Spec Reference（INPUT情報）

本要件を作成するにあたり、以下の情報を確認した：

### 仕様概要（確定済み仕様）
- **参照ファイル**: `.kiro/specs/仕様概要/データ取込_タグ機能.md`
- **確認日**: 2026-02-06
- **主要な仕様ポイント**:
  - ステージングテーブルを分離したデータ取込アーキテクチャ
  - 予算・見込・実績を同一構造で管理するファクトモデル
  - 仕訳明細の2形式対応（SINGLE/DOUBLE）

### 仕様検討（経緯・背景）
- **参照ファイル**: `.kiro/specs/仕様検討/work/chat1`
- **経緯メモ**: QA壁打ちセッションにより、マッピングテンプレート・AG-Grid・履歴DL等の仕様を確定

---

## Entity Reference（必須）

本機能で使用するエンティティ定義を `.kiro/specs/entities/*.md` から確認し、以下を記載する：

### 対象エンティティ
- **fact_amounts**: `.kiro/specs/entities/02_トランザクション・残高.md` セクション 3.1
- **fact_dimension_links**: `.kiro/specs/entities/02_トランザクション・残高.md` セクション 3.2
- **companies**: `.kiro/specs/entities/01_各種マスタ.md`
- **import_mapping_templates**: 本機能で新規追加
- **import_batches**: 既存拡張（company_id, import_category, original_file_path追加）
- **import_staging_rows**: 既存

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

### Requirement 1: 取込種別・対象選択

**Objective:** As a 経理担当者, I want 取込種別（金額/マスタ）とカンパニー・イベント・バージョンを選択したい, so that 適切なスコープでデータ取込を開始できる

#### Acceptance Criteria

1. When ユーザーがデータ取込画面を開いたとき, the Data Import Service shall 取込カテゴリ選択（金額データ/マスタデータ）を表示する
2. When ユーザーが「金額データ」カテゴリを選択したとき, the Data Import Service shall 取込種別（予算/見込/実績）の選択肢を表示する
3. When ユーザーが取込種別を選択したとき, the Data Import Service shall 権限のあるカンパニーのみを選択肢として表示する
4. When ユーザーが「予算」または「見込」を選択したとき, the Data Import Service shall 計画イベントとバージョンの選択UIを表示する
5. When ユーザーが「実績」を選択したとき, the Data Import Service shall 会計期間の選択UIを表示する
6. If ユーザーに取込権限がない場合, then the Data Import Service shall エラーメッセージを表示し次のステップへ進めない

---

### Requirement 2: ファイルアップロード

**Objective:** As a 経理担当者, I want Excel/CSV/クリップボードからデータを取り込みたい, so that 外部システムのデータをEPMに投入できる

#### Acceptance Criteria

1. The Data Import Service shall ドラッグ＆ドロップによるファイルアップロードを受け付ける
2. The Data Import Service shall ファイル選択ダイアログによるアップロードを受け付ける
3. The Data Import Service shall Excel形式（.xlsx, .xls）およびCSV形式のファイルを処理できる
4. When ユーザーがクリップボードペーストモードを選択したとき, the Data Import Service shall タブ区切り/カンマ区切りデータを受け付ける
5. If 対応していないファイル形式がアップロードされた場合, then the Data Import Service shall エラーメッセージを表示しファイルを拒否する
6. When ファイルアップロードが成功したとき, the Data Import Service shall ファイルのカラムヘッダーを解析しマッピングステップへ遷移する

---

### Requirement 3: マッピング設定

**Objective:** As a 経理担当者, I want 取込ファイルのカラムをEPM標準フィールドにマッピングしたい, so that 異なるフォーマットのデータを統一的に処理できる

#### Acceptance Criteria

1. When ファイルが読み込まれたとき, the Data Import Service shall カラム名から自動検出（エイリアス辞書+パターンマッチ）を実行する
2. The Data Import Service shall 自動検出結果を「完全一致」「パターン一致」「要確認」「未マッピング」のステータスで表示する
3. When ユーザーが「保存済みマッピングを使用」を選択したとき, the Data Import Service shall 対象カンパニーのマッピングテンプレート一覧を表示する
4. When ユーザーがマッピングテンプレートを選択したとき, the Data Import Service shall 選択されたテンプレートのマッピング定義を適用する
5. The Data Import Service shall 各カラムに対してドロップダウンでEPM標準フィールドを手動選択できる
6. When ユーザーが「このマッピングを保存」にチェックを入れたとき, the Data Import Service shall テンプレート名の入力を求める
7. When マッピング保存が実行されたとき, the Data Import Service shall カンパニー単位でマッピングテンプレートを保存する

---

### Requirement 4: AG-Gridプレビュー・編集

**Objective:** As a 経理担当者, I want マッピング後のデータをグリッドでプレビュー・編集したい, so that 取込前にデータを確認・修正できる

#### Acceptance Criteria

1. When マッピングが完了したとき, the Data Import Service shall AG-Gridでプレビューデータを表示する
2. The Data Import Service shall 行ごとにチェックボックスで取込対象/除外を切り替えられる
3. The Data Import Service shall セル単位で直接編集できる
4. When ユーザーがCtrl+Vを押したとき, the Data Import Service shall Excelからのクリップボードペーストを受け付ける
5. The Data Import Service shall 「エラーのみ表示」フィルタを提供する
6. The Data Import Service shall 各行の状態（OK/エラー/警告）をステータス列に表示する
7. When エラー行が存在するとき, the Data Import Service shall エラー内容をツールチップまたはインライン表示する

---

### Requirement 5: バリデーション

**Objective:** As a 経理担当者, I want データのバリデーション結果を確認したい, so that エラーを修正してから取込を実行できる

#### Acceptance Criteria

1. When プレビュー画面で「バリデーション」が実行されたとき, the Data Import Service shall 全行に対してバリデーションを実行する
2. The Data Import Service shall 勘定科目コードがマスタに存在するかを検証する
3. The Data Import Service shall 部門コードがマスタに存在するかを検証する
4. The Data Import Service shall 金額フィールドが数値であるかを検証する
5. If 同一キーのデータが既に存在する場合, then the Data Import Service shall 警告（上書きされます）として表示する
6. The Data Import Service shall バリデーション結果サマリ（正常/エラー/警告の件数）を表示する
7. When バリデーションが完了したとき, the Data Import Service shall エラー詳細リストを折畳み可能な形式で表示する

---

### Requirement 6: 取込実行

**Objective:** As a 経理担当者, I want バリデーション通過データを取り込みたい, so that EPMの正本データを更新できる

#### Acceptance Criteria

1. When エラー行が存在するとき, the Data Import Service shall 「エラー行を除外して取込」「キャンセル」の選択肢を提示する
2. When ユーザーが「エラー行を除外して取込」を選択したとき, the Data Import Service shall エラー行を除外した正常行のみを取り込む
3. When 取込が実行されたとき, the Data Import Service shall ステージングテーブル経由でfact_amountsへデータを反映する
4. The Data Import Service shall 取込処理を冪等に実装する（同一バッチの再実行で重複登録しない）
5. When 取込が成功したとき, the Data Import Service shall 取込結果サマリ（成功/除外/合計件数）を表示する
6. The Data Import Service shall 取込結果を監査ログに記録する
7. If 取込処理が失敗した場合, then the Data Import Service shall トランザクションをロールバックしエラーメッセージを表示する

---

### Requirement 7: 取込履歴管理

**Objective:** As a 経理担当者, I want 過去の取込履歴を確認し元ファイルをダウンロードしたい, so that 監査対応や取込内容の確認ができる

#### Acceptance Criteria

1. The Data Import Service shall 取込履歴一覧を表示する
2. The Data Import Service shall 履歴をカンパニー・種別・期間でフィルタリングできる
3. The Data Import Service shall 履歴に以下の項目を表示する: 取込日時, カンパニー, 取込種別, 対象（イベント/バージョン）, 件数（成功/除外/合計）, 実行者
4. When ユーザーが「ダウンロード」を押したとき, the Data Import Service shall 元ファイル（アップロード時のまま）をダウンロードできる
5. The Data Import Service shall 除外行の詳細もダウンロード可能とする
6. The Data Import Service shall 元ファイルをオブジェクトストレージに保存する（デフォルト保持期間: 1年）

---

### Requirement 8: マッピングテンプレート管理

**Objective:** As a 管理者, I want カンパニー別のマッピングテンプレートを管理したい, so that 定期取込を効率化できる

#### Acceptance Criteria

1. The Data Import Service shall カンパニー別にマッピングテンプレート一覧を表示する
2. The Data Import Service shall テンプレートの新規作成・編集・削除ができる
3. The Data Import Service shall テンプレートに以下の情報を保持する: 名前, ソースシステム名, 取込カテゴリ, 取込種別, カラムマッピング定義
4. When テンプレートを編集したとき, the Data Import Service shall 更新日時と更新者を記録する
5. The Data Import Service shall テンプレートにデフォルトフラグを設定できる（カンパニー単位で1つのみ）

---

### Requirement 9: 権限制御

**Objective:** As a システム管理者, I want 取込機能へのアクセスを権限で制御したい, so that 不正なデータ変更を防止できる

#### Acceptance Criteria

1. The Data Import Service shall 取込実行に`epm.import.execute`権限を必要とする
2. The Data Import Service shall マッピングテンプレート管理に`epm.import.manage-template`権限を必要とする
3. The Data Import Service shall 取込履歴閲覧に`epm.import.read-history`権限を必要とする
4. If ユーザーが必要な権限を持たない場合, then the Data Import Service shall 該当機能を非表示または無効化する
5. The Data Import Service shall カンパニー単位でアクセス制御を適用する（権限のあるカンパニーのみ操作可能）

---

### Requirement 10: 自動検出ロジック（Phase 1）

**Objective:** As a 経理担当者, I want カラム名から自動でマッピングを推測してほしい, so that マッピング設定の手間を削減できる

#### Acceptance Criteria

1. The Data Import Service shall 完全一致でカラム名を検出する（例: `account_code` → `account_code`）
2. The Data Import Service shall エイリアス辞書でカラム名を検出する（例: `GL_CODE`, `勘定科目コード` → `account_code`）
3. The Data Import Service shall パターンマッチでカラム名を検出する（例: `*_AMT`, `*金額` → `amount_*`）
4. The Data Import Service shall 月名パターンで金額カラムを検出する（例: `JAN`, `1月`, `M01` → `amount_m01`）
5. The Data Import Service shall 自動検出の結果に信頼度を付与する（完全一致 > エイリアス > パターン）

---

## Out of Scope

本要件の範囲外とする項目：

1. **マスタデータ取込（Phase 2）**: 勘定科目・部門・セグメント等のマスタ取込は次フェーズで対応
2. **AI支援マッピング（Phase 2）**: LLMによるカラム推測は次フェーズで対応
3. **仕訳明細取込**: fact_journal_linesへの直接取込は別機能として検討
4. **リアルタイム連携**: ERPとのAPI連携・CDC連携は対象外
5. **バルク削除**: 取込済みデータの一括削除機能は対象外

---

## Non-Functional Requirements

### パフォーマンス
- 1,000行以下のデータは5秒以内にプレビュー表示
- 10,000行以下のデータは30秒以内に取込完了

### セキュリティ
- すべてのAPIエンドポイントでtenant_idによるRLSを適用
- アップロードファイルのウィルススキャン（将来対応）

### 監査
- 取込実行は監査ログに記録（誰が、いつ、何を、どれだけ）
- 除外行の理由も記録

---

## Glossary

| 用語 | 説明 |
|------|------|
| マッピングテンプレート | 取込ファイルのカラムとEPM標準フィールドの対応定義 |
| ステージング | 取込データの一時保存領域（バリデーション・変換用） |
| fact_amounts | EPMのファクトテーブル（予算・見込・実績の正本） |
| エイリアス辞書 | カラム名の別名定義（GL_CODE → account_code 等） |
