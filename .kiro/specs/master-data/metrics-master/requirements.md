# Requirements Document

## Introduction

指標マスタは、EPM SaaSにおける「財務指標・指標計算（metrics）」の定義を管理する機能である。

本機能のスコープは指標の基本属性（指標コード、指標名、指標タイプ、式、単位、スケール、有効フラグ）に限定し、式の評価・計算機能は別機能（レポート機能等）で行う。

metrics.id は将来のレポート機能やレイアウト機能から参照される可能性があるため、物理削除ではなく無効化（is_active = false）で運用する。

### 対象ユーザー
- 経営企画/管理部門の担当者
- システム管理者

### ビジネス目的
- 指標定義を一元管理し、レポートや分析で参照可能にする
- EBITDA等の例外指標を式として定義し、rollupでは表現できない計算を可能にする
- 将来のレポート機能・レイアウト機能との連携基盤を整備する

---

## Entity Reference（必須）

本機能で使用するエンティティ定義を `.kiro/specs/entities/01_各種マスタ.md` から確認し、以下を記載する：

### 対象エンティティ
- **metrics（指標定義）**: `.kiro/specs/entities/01_各種マスタ.md` セクション 8.1

### エンティティ整合性確認
- [x] 対象エンティティのカラム・型・制約を確認した
  - id (uuid, PK)
  - tenant_id (uuid, RLS境界)
  - company_id (uuid, 会社別管理)
  - metric_code (varchar(50), 会社内一意)
  - metric_name (varchar(200))
  - metric_type (varchar(20), FIN_METRIC/KPI_METRIC)
  - result_measure_kind (varchar(20), AMOUNT)
  - unit (varchar(30), 任意)
  - scale (int)
  - formula_expr (text, 式)
  - description (text, 任意)
  - is_active (boolean, デフォルトtrue)
  - created_at, updated_at (timestamptz)
  - created_by, updated_by (uuid, 監査)
- [x] エンティティ補足のビジネスルールを要件に反映した
  - UNIQUE(tenant_id, company_id, metric_code) 制約
  - FK(tenant_id, company_id) → companies(tenant_id, id)
  - CHECK(metric_type IN ('FIN_METRIC','KPI_METRIC'))
  - 物理削除禁止（参照がある可能性があるため無効化のみ）
- [x] スコープ外の関連エンティティを Out of Scope に明記した
  - 式の評価・計算機能（レポート機能等で実装）
  - レイアウト機能との連携（参照のみ、定義は本機能）

---

## Requirements

### Requirement 1: 指標一覧の検索・表示

**Objective:** As a 経営企画担当者, I want 指標を一覧形式で検索・閲覧できること, so that 必要な指標定義を素早く見つけることができる

#### Acceptance Criteria

1. When ユーザーが指標マスタ画面を開いた時, the Metrics Master Service shall セッションコンテキストから取得した会社（company_id）に所属する指標一覧を取得して表示する
2. When ユーザーが検索条件（指標コード、指標名、指標タイプ、有効フラグ）を入力して検索を実行した時, the Metrics Master Service shall 条件に一致する指標のみをフィルタリングして表示する
3. When ユーザーがソート項目（指標コード、指標名、指標タイプ）を選択した時, the Metrics Master Service shall 選択された項目で昇順または降順にソートして表示する
4. While 指標数が多い場合, the Metrics Master Service shall ページネーションにより一定件数ずつ表示する
5. The Metrics Master Service shall 指標一覧に指標コード、指標名、指標タイプ、単位、有効状態を表示する

---

### Requirement 2: 指標の詳細表示

**Objective:** As a 経営企画担当者, I want 特定の指標の詳細情報を閲覧できること, so that 指標の正確な情報と式の内容を確認できる

#### Acceptance Criteria

1. When ユーザーが指標一覧から特定の指標を選択した時, the Metrics Master Service shall 当該指標の詳細情報（全項目）を表示する
2. The Metrics Master Service shall 詳細画面に指標コード、指標名、指標タイプ、結果測定種別、単位、スケール、式、説明、有効フラグ、作成日時、更新日時を表示する
3. If 指定されたIDの指標が存在しない場合, the Metrics Master Service shall 「指標が見つかりません」エラーを返す

---

### Requirement 3: 指標の新規登録

**Objective:** As a システム管理者, I want 新しい指標を登録できること, so that 新しい財務指標やKPI指標を管理対象に追加できる

#### Acceptance Criteria

1. When ユーザーが必須項目（指標コード、指標名、指標タイプ、結果測定種別、式）を入力して登録を実行した時, the Metrics Master Service shall セッションコンテキストから取得した会社（company_id）に対して新しい指標レコードを作成する
2. When 指標が正常に登録された時, the Metrics Master Service shall 登録された指標の詳細情報を返す
3. If 同一会社内で既に存在する指標コードで登録しようとした場合, the Metrics Master Service shall 「指標コードが重複しています」エラーを返す
4. If 必須項目（指標コード、指標名、指標タイプ、結果測定種別、式）が入力されていない場合, the Metrics Master Service shall バリデーションエラーを返す
5. If セッションコンテキストに会社（company_id）が設定されていない場合, the Metrics Master Service shall 「会社が選択されていません」エラーを返す
6. If 式（formula_expr）の構文が不正な場合, the Metrics Master Service shall 「式の構文が不正です」エラーを返す
7. If 式（formula_expr）内で参照されている科目コードが存在しない場合, the Metrics Master Service shall 「参照されている科目コードが存在しません」エラーを返す
8. The Metrics Master Service shall 新規登録時に is_active を true として初期化する
9. The Metrics Master Service shall 登録時に created_by / updated_by に操作ユーザーIDを記録する

---

### Requirement 4: 指標情報の更新

**Objective:** As a システム管理者, I want 既存の指標情報を更新できること, so that 指標名変更や式の修正などに対応できる

#### Acceptance Criteria

1. When ユーザーが指標情報を編集して更新を実行した時, the Metrics Master Service shall 対象指標のレコードを更新する
2. When 指標情報が正常に更新された時, the Metrics Master Service shall 更新後の指標詳細情報を返す
3. If 更新対象の指標が存在しない場合, the Metrics Master Service shall 「指標が見つかりません」エラーを返す
4. If 指標コードを変更して既存の指標コードと重複する場合, the Metrics Master Service shall 「指標コードが重複しています」エラーを返す
5. If 式（formula_expr）の構文が不正な場合, the Metrics Master Service shall 「式の構文が不正です」エラーを返す
6. If 式（formula_expr）内で参照されている科目コードが存在しない場合, the Metrics Master Service shall 「参照されている科目コードが存在しません」エラーを返す
7. The Metrics Master Service shall 更新時に updated_at / updated_by を記録する

---

### Requirement 5: 指標の無効化

**Objective:** As a システム管理者, I want 指標を無効化できること, so that 不要な指標を一覧から除外しつつ履歴は保持できる

#### Acceptance Criteria

1. When ユーザーが有効な指標に対して無効化を実行した時, the Metrics Master Service shall is_active を false に更新する
2. When 無効化が正常に完了した時, the Metrics Master Service shall 更新後の指標詳細情報を返す
3. If 無効化対象の指標が存在しない場合, the Metrics Master Service shall 「指標が見つかりません」エラーを返す
4. If 既に無効化されている指標を無効化しようとした場合, the Metrics Master Service shall 「この指標は既に無効化されています」エラーを返す
5. The Metrics Master Service shall 無効化時に updated_at / updated_by を記録する

---

### Requirement 6: 指標の再有効化

**Objective:** As a システム管理者, I want 無効化された指標を再有効化できること, so that 一時的に無効化した指標を再び管理対象に戻すことができる

#### Acceptance Criteria

1. When ユーザーが無効な指標に対して再有効化を実行した時, the Metrics Master Service shall is_active を true に更新する
2. When 再有効化が正常に完了した時, the Metrics Master Service shall 更新後の指標詳細情報を返す
3. If 再有効化対象の指標が存在しない場合, the Metrics Master Service shall 「指標が見つかりません」エラーを返す
4. If 既に有効な指標を再有効化しようとした場合, the Metrics Master Service shall 「この指標は既に有効です」エラーを返す
5. The Metrics Master Service shall 再有効化時に updated_at / updated_by を記録する

---

### Requirement 7: マルチテナント・データ分離

**Objective:** As a システム運営者, I want テナント間・会社間のデータが完全に分離されること, so that 情報漏洩リスクを排除できる

#### Acceptance Criteria

1. The Metrics Master Service shall すべての操作において tenant_id による絞り込みを実施する
2. The Metrics Master Service shall すべての操作において company_id による絞り込みを実施する
3. The Metrics Master Service shall Repository レイヤーで tenant_id と company_id を必須パラメータとして受け取る
4. The Metrics Master Service shall PostgreSQL の Row Level Security (RLS) と併用してデータ分離を担保する（double-guard）
5. If 異なるテナントの指標にアクセスしようとした場合, the Metrics Master Service shall アクセスを拒否する
6. If 異なる会社の指標にアクセスしようとした場合, the Metrics Master Service shall アクセスを拒否する

---

### Requirement 8: 会社単位の一意性制約

**Objective:** As a システム管理者, I want 指標コードが会社内で一意であること, so that 指標を確実に識別できる

#### Acceptance Criteria

1. The Metrics Master Service shall tenant_id + company_id + metric_code の組み合わせで一意性を担保する
2. If 同一会社内で重複する指標コードを登録・更新しようとした場合, the Metrics Master Service shall 重複エラーを返す

---

### Requirement 9: 監査ログ

**Objective:** As a 内部統制担当者, I want 誰がいつ指標情報を変更したかを追跡できること, so that 監査・コンプライアンス要件を満たせる

#### Acceptance Criteria

1. The Metrics Master Service shall 登録・更新・無効化・再有効化のすべての操作において操作ユーザーIDを記録する
2. The Metrics Master Service shall 操作日時（created_at / updated_at）を自動的に記録する
3. The Metrics Master Service shall 操作ユーザー（created_by / updated_by）を自動的に記録する

---

### Requirement 10: 会社選択（ログイン時・セッション管理）

**Objective:** As a システム管理者, I want ログイン時に会社を選択し、セッション中はその会社のデータのみを操作できること, so that 会社をまたいでの誤操作を防止できる

#### Acceptance Criteria

1. When ユーザーがログインした時, the Authentication Service shall ユーザーの権限情報を取得する
2. When ユーザーが複数会社へのアクセス権限を持つ場合, the Authentication UI shall ログイン時に会社選択ドロップダウンを表示し、選択を必須とする
3. When ユーザーが単一会社へのアクセス権限のみを持つ場合, the Authentication UI shall 会社選択UIを表示せず、自動的に当該会社をセッションコンテキストに設定する
4. When ユーザーが会社を選択した時, the Authentication Service shall 選択された会社（company_id）をセッションコンテキストに保存する
5. When ユーザーが指標マスタを含む各機能にアクセスした時, the Metrics Master Service shall セッションコンテキストから取得した会社（company_id）のデータのみを表示・操作する
6. If ユーザーがアクセス権限のない会社を選択しようとした場合, the Authentication Service shall アクセスを拒否する
7. If セッションコンテキストに会社（company_id）が設定されていない場合, the Metrics Master Service shall 「会社が選択されていません」エラーを返す

---

### Requirement 11: 式（formula_expr）の構文バリデーション

**Objective:** As a システム管理者, I want 式の構文が正しいことを保存時に検証できること, so that 不正な式による計算エラーを防止できる

#### Acceptance Criteria

1. When ユーザーが式（formula_expr）を入力した時, the Metrics Master Service shall 式の構文を検証する
2. If 式の構文が不正な場合（括弧の不一致、演算子の誤用等）, the Metrics Master Service shall 「式の構文が不正です」エラーを返す
3. If 式内で参照されている科目コード（SUB("科目コード")形式）が存在しない場合, the Metrics Master Service shall 「参照されている科目コードが存在しません」エラーを返す
4. The Metrics Master Service shall SUB()関数の引数が文字列形式（ダブルクォートで囲まれている）であることを検証する
5. The Metrics Master Service shall サポートする演算子（+, -, *, /）と括弧の使用を検証する
6. The Metrics Master Service shall 式の評価は行わず、構文の妥当性のみを検証する（計算機能は別機能）

---

## Out of Scope（本機能のスコープ外）

以下は別機能として実装予定であり、本機能のスコープには含まない：

- **式の評価・計算機能**: 式を実際に評価して結果を計算する機能（レポート機能等で実装）
- **レイアウト機能との連携**: レイアウト機能で指標を参照する機能（参照のみ、定義は本機能）
- **指標の物理削除**: FK参照がある可能性があるため無効化のみサポート
- **一括インポート／エクスポート機能**
- **式の実行時エラーハンドリング**: 式の評価時のエラー処理（計算機能側で実装）
