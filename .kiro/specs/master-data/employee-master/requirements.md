# Requirements Document

## Introduction

社員マスタは、EPM SaaSにおける「社員という人を表す不変に近い実体」の基本情報を管理する機能である。

本機能のスコープは社員の基本属性（社員コード、氏名、カナ、メール、入社日、退職日、有効フラグ）に限定し、異動・兼務・役職履歴（employee_assignments）、認証情報（login_accounts）、部門マスタ（departments）は別機能として実装する。

employees.id は上記の別機能から FK 参照されるため、物理削除ではなく無効化（is_active = false）で運用する。

### 対象ユーザー
- 経営企画/管理部門の担当者
- システム管理者

### ビジネス目的
- 社員情報を一元管理し、予算・実績の責任者/担当者として参照可能にする
- 将来の employee_assignments / login_accounts との連携基盤を整備する

---

## Entity Reference（必須）

本機能で使用するエンティティ定義を `.kiro/specs/entities/01_各種マスタ.md` から確認し、以下を記載する：

### 対象エンティティ
- **employees（社員マスタ）**: `.kiro/specs/entities/01_各種マスタ.md` セクション 5.1

### エンティティ整合性確認
- [x] 対象エンティティのカラム・型・制約を確認した
  - id (uuid, PK)
  - tenant_id (uuid, RLS境界)
  - company_id (uuid, 雇用元会社)
  - employee_code (varchar(30), 会社内一意推奨)
  - employee_name (varchar(100))
  - employee_name_kana (varchar(100), 任意)
  - email (varchar(255), 任意)
  - hire_date (date, 任意)
  - leave_date (date, 任意)
  - is_active (boolean, デフォルトtrue)
  - created_at, updated_at (timestamptz)
  - created_by, updated_by (uuid, 監査)
- [x] エンティティ補足のビジネスルールを要件に反映した
  - UNIQUE(tenant_id, company_id, employee_code) 制約
  - FK(tenant_id, company_id) → companies(tenant_id, id)
  - 物理削除禁止（FK参照があるため無効化のみ）
- [x] スコープ外の関連エンティティを Out of Scope に明記した
  - employee_assignments（異動・兼務・役職履歴）
  - login_accounts（認証情報）
  - departments（部門マスタ）

---

## Requirements

### Requirement 1: 社員一覧の検索・表示

**Objective:** As a 経営企画担当者, I want 社員を一覧形式で検索・閲覧できること, so that 必要な社員情報を素早く見つけることができる

#### Acceptance Criteria

1. When ユーザーが社員マスタ画面を開いた時, the Employee Master Service shall セッションコンテキストから取得した会社（company_id）に所属する社員一覧を取得して表示する
2. When ユーザーが検索条件（社員コード、氏名、有効フラグ）を入力して検索を実行した時, the Employee Master Service shall 条件に一致する社員のみをフィルタリングして表示する
3. When ユーザーがソート項目（社員コード、氏名、入社日）を選択した時, the Employee Master Service shall 選択された項目で昇順または降順にソートして表示する
4. While 社員数が多い場合, the Employee Master Service shall ページネーションにより一定件数ずつ表示する
5. The Employee Master Service shall 社員一覧に社員コード、氏名、メール、入社日、有効状態を表示する

---

### Requirement 2: 社員の詳細表示

**Objective:** As a 経営企画担当者, I want 特定の社員の詳細情報を閲覧できること, so that 社員の正確な情報を確認できる

#### Acceptance Criteria

1. When ユーザーが社員一覧から特定の社員を選択した時, the Employee Master Service shall 当該社員の詳細情報（全項目）を表示する
2. The Employee Master Service shall 詳細画面に社員コード、氏名、氏名カナ、メール、入社日、退職日、有効フラグ、作成日時、更新日時を表示する
3. If 指定されたIDの社員が存在しない場合, the Employee Master Service shall 「社員が見つかりません」エラーを返す

---

### Requirement 3: 社員の新規登録

**Objective:** As a システム管理者, I want 新しい社員を登録できること, so that 新規入社者を管理対象に追加できる

#### Acceptance Criteria

1. When ユーザーが必須項目（社員コード、氏名）を入力して登録を実行した時, the Employee Master Service shall セッションコンテキストから取得した会社（company_id）に対して新しい社員レコードを作成する
2. When 社員が正常に登録された時, the Employee Master Service shall 登録された社員の詳細情報を返す
3. If 同一会社内で既に存在する社員コードで登録しようとした場合, the Employee Master Service shall 「社員コードが重複しています」エラーを返す
4. If 必須項目（社員コード、氏名）が入力されていない場合, the Employee Master Service shall バリデーションエラーを返す
5. If セッションコンテキストに会社（company_id）が設定されていない場合, the Employee Master Service shall 「会社が選択されていません」エラーを返す
6. The Employee Master Service shall 新規登録時に is_active を true として初期化する
7. The Employee Master Service shall 登録時に created_by / updated_by に操作ユーザーIDを記録する

---

### Requirement 4: 社員情報の更新

**Objective:** As a システム管理者, I want 既存の社員情報を更新できること, so that 氏名変更やメールアドレス変更などに対応できる

#### Acceptance Criteria

1. When ユーザーが社員情報を編集して更新を実行した時, the Employee Master Service shall 対象社員のレコードを更新する
2. When 社員情報が正常に更新された時, the Employee Master Service shall 更新後の社員詳細情報を返す
3. If 更新対象の社員が存在しない場合, the Employee Master Service shall 「社員が見つかりません」エラーを返す
4. If 社員コードを変更して既存の社員コードと重複する場合, the Employee Master Service shall 「社員コードが重複しています」エラーを返す
5. The Employee Master Service shall 更新時に updated_at / updated_by を記録する

---

### Requirement 5: 社員の無効化

**Objective:** As a システム管理者, I want 社員を無効化できること, so that 退職者等を一覧から除外しつつ履歴は保持できる

#### Acceptance Criteria

1. When ユーザーが有効な社員に対して無効化を実行した時, the Employee Master Service shall is_active を false に更新する
2. When 無効化が正常に完了した時, the Employee Master Service shall 更新後の社員詳細情報を返す
3. If 無効化対象の社員が存在しない場合, the Employee Master Service shall 「社員が見つかりません」エラーを返す
4. If 既に無効化されている社員を無効化しようとした場合, the Employee Master Service shall 「この社員は既に無効化されています」エラーを返す
5. The Employee Master Service shall 無効化時に updated_at / updated_by を記録する

---

### Requirement 6: 社員の再有効化

**Objective:** As a システム管理者, I want 無効化された社員を再有効化できること, so that 復職者等を再び管理対象に戻すことができる

#### Acceptance Criteria

1. When ユーザーが無効な社員に対して再有効化を実行した時, the Employee Master Service shall is_active を true に更新する
2. When 再有効化が正常に完了した時, the Employee Master Service shall 更新後の社員詳細情報を返す
3. If 再有効化対象の社員が存在しない場合, the Employee Master Service shall 「社員が見つかりません」エラーを返す
4. If 既に有効な社員を再有効化しようとした場合, the Employee Master Service shall 「この社員は既に有効です」エラーを返す
5. The Employee Master Service shall 再有効化時に updated_at / updated_by を記録する

---

### Requirement 7: マルチテナント・データ分離

**Objective:** As a システム運営者, I want テナント間のデータが完全に分離されること, so that 情報漏洩リスクを排除できる

#### Acceptance Criteria

1. The Employee Master Service shall すべての操作において tenant_id による絞り込みを実施する
2. The Employee Master Service shall Repository レイヤーで tenant_id を必須パラメータとして受け取る
3. The Employee Master Service shall PostgreSQL の Row Level Security (RLS) と併用してデータ分離を担保する（double-guard）
4. If 異なるテナントの社員にアクセスしようとした場合, the Employee Master Service shall アクセスを拒否する

---

### Requirement 10: 会社選択（ログイン時・セッション管理）

**Objective:** As a システム管理者, I want ログイン時に会社を選択し、セッション中はその会社のデータのみを操作できること, so that 会社をまたいでの誤操作を防止できる

#### Acceptance Criteria

1. When ユーザーがログインした時, the Authentication Service shall ユーザーの権限情報を取得する
2. When ユーザーが複数会社へのアクセス権限を持つ場合, the Authentication UI shall ログイン時に会社選択ドロップダウンを表示し、選択を必須とする
3. When ユーザーが単一会社へのアクセス権限のみを持つ場合, the Authentication UI shall 会社選択UIを表示せず、自動的に当該会社をセッションコンテキストに設定する
4. When ユーザーが会社を選択した時, the Authentication Service shall 選択された会社（company_id）をセッションコンテキストに保存する
5. When ユーザーが社員マスタを含む各機能にアクセスした時, the Employee Master Service shall セッションコンテキストから取得した会社（company_id）のデータのみを表示・操作する
6. If ユーザーがアクセス権限のない会社を選択しようとした場合, the Authentication Service shall アクセスを拒否する
7. If セッションコンテキストに会社（company_id）が設定されていない場合, the Employee Master Service shall 「会社が選択されていません」エラーを返す

---

### Requirement 8: 会社単位の一意性制約

**Objective:** As a システム管理者, I want 社員コードが会社内で一意であること, so that 社員を確実に識別できる

#### Acceptance Criteria

1. The Employee Master Service shall tenant_id + company_id + employee_code の組み合わせで一意性を担保する
2. If 同一会社内で重複する社員コードを登録・更新しようとした場合, the Employee Master Service shall 重複エラーを返す

---

### Requirement 9: 監査ログ

**Objective:** As a 内部統制担当者, I want 誰がいつ社員情報を変更したかを追跡できること, so that 監査・コンプライアンス要件を満たせる

#### Acceptance Criteria

1. The Employee Master Service shall 登録・更新・無効化・再有効化のすべての操作において操作ユーザーIDを記録する
2. The Employee Master Service shall 操作日時（created_at / updated_at）を自動的に記録する
3. The Employee Master Service shall 操作ユーザー（created_by / updated_by）を自動的に記録する

---

## Out of Scope（本機能のスコープ外）

以下は別機能として実装予定であり、本機能のスコープには含まない：

- **employee_assignments**: 異動・兼務・役職履歴（employees.id を参照）
- **login_accounts**: 認証情報（employees.id を参照、1社員:0-1アカウント）
- **departments**: 部門マスタ（employee_assignments が stable_id で参照）
- 社員の物理削除（FK参照があるため無効化のみサポート）
- 一括インポート／エクスポート機能
