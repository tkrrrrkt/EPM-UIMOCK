# Requirements Document

## Introduction

プロジェクトマスタは、EPM SaaSにおける「原価・収益を集計する単位としてのプロジェクト」の基本情報を管理する機能である。

本機能のスコープはプロジェクトの基本属性（プロジェクトコード、プロジェクト名、プロジェクト名略称、プロジェクトタイプ、プロジェクトステータス、開始日、終了日、親プロジェクト、責任部門、責任者、外部参照キー、備考、有効フラグ）に限定し、プロジェクト別予算・実績、プロジェクトメンバーは別機能として実装する。

projects.id は上記の別機能から FK 参照されるため、物理削除ではなく無効化（is_active = false）で運用する。

プロジェクトのステータス（project_status）は PLANNED / ACTIVE / ON_HOLD / CLOSED の4状態で管理し、is_active（論理削除フラグ）とは独立して運用する。

### 対象ユーザー
- 経営企画/管理部門の担当者
- プロジェクト管理者
- システム管理者

### ビジネス目的
- プロジェクト情報を一元管理し、予算・実績の配賦先として参照可能にする
- プロジェクトの状態（計画中/実行中/保留中/完了）をステータスで管理する
- 親プロジェクトによる階層構造でプロジェクト群を整理する
- 将来のプロジェクト別損益管理・工数管理との連携基盤を整備する

---

## Requirements

### Requirement 1: プロジェクト一覧の検索・表示

**Objective:** As a 経営企画担当者, I want プロジェクトを一覧形式で検索・閲覧できること, so that 必要なプロジェクト情報を素早く見つけることができる

#### Acceptance Criteria

1. When ユーザーがプロジェクトマスタ画面を開いた時, the Project Master Service shall 当該会社（company_id）に所属するプロジェクト一覧を取得して表示する
2. When ユーザーが検索条件（プロジェクトコード、プロジェクト名、プロジェクトステータス、有効フラグ）を入力して検索を実行した時, the Project Master Service shall 条件に一致するプロジェクトのみをフィルタリングして表示する
3. When ユーザーがソート項目（プロジェクトコード、プロジェクト名、プロジェクトステータス、開始日、終了日）を選択した時, the Project Master Service shall 選択された項目で昇順または降順にソートして表示する
4. While プロジェクト数が多い場合, the Project Master Service shall ページネーションにより一定件数ずつ表示する
5. The Project Master Service shall プロジェクト一覧にプロジェクトコード、プロジェクト名、プロジェクトステータス、開始日、終了日、有効状態を表示する

---

### Requirement 2: プロジェクトの詳細表示

**Objective:** As a 経営企画担当者, I want 特定のプロジェクトの詳細情報を閲覧できること, so that プロジェクトの正確な情報を確認できる

#### Acceptance Criteria

1. When ユーザーがプロジェクト一覧から特定のプロジェクトを選択した時, the Project Master Service shall 当該プロジェクトの詳細情報（全項目）を表示する
2. The Project Master Service shall 詳細画面にプロジェクトコード、プロジェクト名、プロジェクト名略称、プロジェクトタイプ、プロジェクトステータス、開始日、終了日、親プロジェクト、責任部門、責任者、外部参照キー、備考、有効フラグ、作成日時、更新日時を表示する
3. If 指定されたIDのプロジェクトが存在しない場合, the Project Master Service shall 「プロジェクトが見つかりません」エラーを返す

---

### Requirement 3: プロジェクトの新規登録

**Objective:** As a システム管理者, I want 新しいプロジェクトを登録できること, so that 新規プロジェクトを管理対象に追加できる

#### Acceptance Criteria

1. When ユーザーが必須項目（プロジェクトコード、プロジェクト名、プロジェクトステータス）を入力して登録を実行した時, the Project Master Service shall 新しいプロジェクトレコードを作成する
2. When プロジェクトが正常に登録された時, the Project Master Service shall 登録されたプロジェクトの詳細情報を返す
3. If 同一会社内で既に存在するプロジェクトコードで登録しようとした場合, the Project Master Service shall 「プロジェクトコードが重複しています」エラーを返す
4. If 必須項目（プロジェクトコード、プロジェクト名、プロジェクトステータス）が入力されていない場合, the Project Master Service shall バリデーションエラーを返す
5. If プロジェクトステータスが許可値（PLANNED / ACTIVE / ON_HOLD / CLOSED）以外の場合, the Project Master Service shall バリデーションエラーを返す
6. The Project Master Service shall 新規登録時に is_active を true として初期化する
7. The Project Master Service shall 新規登録時に project_status のデフォルト値を PLANNED とする
8. The Project Master Service shall 登録時に created_by / updated_by に操作ユーザーIDを記録する

---

### Requirement 4: プロジェクト情報の更新

**Objective:** As a システム管理者, I want 既存のプロジェクト情報を更新できること, so that プロジェクト名変更や期間変更などに対応できる

#### Acceptance Criteria

1. When ユーザーがプロジェクト情報を編集して更新を実行した時, the Project Master Service shall 対象プロジェクトのレコードを更新する
2. When プロジェクト情報が正常に更新された時, the Project Master Service shall 更新後のプロジェクト詳細情報を返す
3. If 更新対象のプロジェクトが存在しない場合, the Project Master Service shall 「プロジェクトが見つかりません」エラーを返す
4. If プロジェクトコードを変更して既存のプロジェクトコードと重複する場合, the Project Master Service shall 「プロジェクトコードが重複しています」エラーを返す
5. If プロジェクトステータスが許可値（PLANNED / ACTIVE / ON_HOLD / CLOSED）以外の場合, the Project Master Service shall バリデーションエラーを返す
6. The Project Master Service shall 更新時に updated_at / updated_by を記録する

---

### Requirement 5: プロジェクトの無効化

**Objective:** As a システム管理者, I want プロジェクトを無効化できること, so that 終了・中止プロジェクトを一覧から除外しつつ履歴は保持できる

#### Acceptance Criteria

1. When ユーザーが有効なプロジェクトに対して無効化を実行した時, the Project Master Service shall is_active を false に更新する
2. When 無効化が正常に完了した時, the Project Master Service shall 更新後のプロジェクト詳細情報を返す
3. If 無効化対象のプロジェクトが存在しない場合, the Project Master Service shall 「プロジェクトが見つかりません」エラーを返す
4. If 既に無効化されているプロジェクトを無効化しようとした場合, the Project Master Service shall 「このプロジェクトは既に無効化されています」エラーを返す
5. The Project Master Service shall 無効化時に updated_at / updated_by を記録する

---

### Requirement 6: プロジェクトの再有効化

**Objective:** As a システム管理者, I want 無効化されたプロジェクトを再有効化できること, so that 再開プロジェクトを再び管理対象に戻すことができる

#### Acceptance Criteria

1. When ユーザーが無効なプロジェクトに対して再有効化を実行した時, the Project Master Service shall is_active を true に更新する
2. When 再有効化が正常に完了した時, the Project Master Service shall 更新後のプロジェクト詳細情報を返す
3. If 再有効化対象のプロジェクトが存在しない場合, the Project Master Service shall 「プロジェクトが見つかりません」エラーを返す
4. If 既に有効なプロジェクトを再有効化しようとした場合, the Project Master Service shall 「このプロジェクトは既に有効です」エラーを返す
5. The Project Master Service shall 再有効化時に updated_at / updated_by を記録する

---

### Requirement 7: マルチテナント・データ分離

**Objective:** As a システム運営者, I want テナント間のデータが完全に分離されること, so that 情報漏洩リスクを排除できる

#### Acceptance Criteria

1. The Project Master Service shall すべての操作において tenant_id による絞り込みを実施する
2. The Project Master Service shall Repository レイヤーで tenant_id を必須パラメータとして受け取る
3. The Project Master Service shall PostgreSQL の Row Level Security (RLS) と併用してデータ分離を担保する（double-guard）
4. If 異なるテナントのプロジェクトにアクセスしようとした場合, the Project Master Service shall アクセスを拒否する

---

### Requirement 8: 会社単位の一意性制約

**Objective:** As a システム管理者, I want プロジェクトコードが会社内で一意であること, so that プロジェクトを確実に識別できる

#### Acceptance Criteria

1. The Project Master Service shall tenant_id + company_id + project_code の組み合わせで一意性を担保する
2. If 同一会社内で重複するプロジェクトコードを登録・更新しようとした場合, the Project Master Service shall 重複エラーを返す

---

### Requirement 9: 監査ログ

**Objective:** As a 内部統制担当者, I want 誰がいつプロジェクト情報を変更したかを追跡できること, so that 監査・コンプライアンス要件を満たせる

#### Acceptance Criteria

1. The Project Master Service shall 登録・更新・無効化・再有効化のすべての操作において操作ユーザーIDを記録する
2. The Project Master Service shall 操作日時（created_at / updated_at）を自動的に記録する
3. The Project Master Service shall 操作ユーザー（created_by / updated_by）を自動的に記録する

---

### Requirement 10: プロジェクト階層管理

**Objective:** As a 経営企画担当者, I want プロジェクトを親子関係で階層化できること, so that 大規模プロジェクトをサブプロジェクトに分割して管理できる

#### Acceptance Criteria

1. When ユーザーが親プロジェクトを指定してプロジェクトを登録・更新した時, the Project Master Service shall parent_project_id を設定する
2. If 親プロジェクトとして指定されたプロジェクトが存在しない場合, the Project Master Service shall 「親プロジェクトが見つかりません」エラーを返す
3. If 親プロジェクトとして自分自身を指定した場合, the Project Master Service shall 「自分自身を親プロジェクトに設定できません」エラーを返す
4. The Project Master Service shall 親プロジェクトは同一会社内のプロジェクトに限定する

---

## Out of Scope（本機能のスコープ外）

以下は別機能として実装予定であり、本機能のスコープには含まない：

- **project_budgets**: プロジェクト別予算（projects.id を参照）
- **project_actuals**: プロジェクト別実績（projects.id を参照）
- **project_members**: プロジェクトメンバー（projects.id + employees.id を参照）
- **project_group_mappings**: プロジェクト→ディメンション値のグルーピング
- プロジェクトの物理削除（FK参照があるため無効化のみサポート）
- 一括インポート／エクスポート機能
- 責任部門（owner_department_stable_id）・責任者（owner_employee_id）の参照整合性チェック（本機能ではNULL許可のFKとして保持のみ）
