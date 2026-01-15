# Requirements Document

## Introduction

組織マスタ（organization-master）は、EPM SaaSにおける「組織バージョン（organization_versions）」と「部門（departments）」を管理する機能である。

組織は「版（Version）」としてスナップショット管理され、各版に属する部門は階層構造（ツリー）を持つ。部門には版内のID（department_id）と版を跨いだ追跡キー（stable_id）が存在し、Fact/社員所属/時系列比較では stable_id を使用する。

本機能では、組織バージョンの作成・編集・有効期間管理と、版内の部門ツリーの閲覧・編集を提供する。

### 対象ユーザー
- 経営企画/管理部門の担当者
- システム管理者

### ビジネス目的
- 組織改編を版として管理し、過去の組織構造を保持しながら新しい組織を定義できる
- 部門階層を視覚的に把握・編集し、予算・実績の責任単位として活用する
- stable_id により版を跨いだ部門の追跡・比較を可能にする

---

## Entity Reference（必須）

本機能で使用するエンティティ定義を `.kiro/specs/entities/*.md` から確認し、以下を記載する：

### 対象エンティティ
- **organization_versions**: `.kiro/specs/entities/01_各種マスタ.md` セクション 3.1
- **departments**: `.kiro/specs/entities/01_各種マスタ.md` セクション 3.2

### エンティティ整合性確認
- [x] 対象エンティティのカラム・型・制約を確認した
- [x] エンティティ補足のビジネスルールを要件に反映した
- [x] スコープ外の関連エンティティを Out of Scope に明記した

---

## Requirements

### Requirement 1: 組織バージョン一覧の表示

**Objective:** As a 経営企画担当者, I want 組織バージョンを一覧形式で閲覧できること, so that 組織改編の履歴と有効期間を把握できる

#### Acceptance Criteria

1. When ユーザーが組織マスタ画面を開いた時, the Organization Master Service shall 当該会社（company_id）に所属する組織バージョン一覧を取得して表示する
2. The Organization Master Service shall 組織バージョン一覧にバージョンコード、バージョン名、有効開始日、有効終了日、説明を表示する
3. When ユーザーが有効開始日でソートを選択した時, the Organization Master Service shall 選択された項目で昇順または降順にソートして表示する
4. The Organization Master Service shall 現在有効なバージョン（effective_date <= 現在日 AND (expiry_date IS NULL OR expiry_date > 現在日)）を視覚的に区別して表示する

---

### Requirement 2: 組織バージョンの新規作成

**Objective:** As a システム管理者, I want 新しい組織バージョンを作成できること, so that 組織改編を新しい版として管理できる

#### Acceptance Criteria

1. When ユーザーが必須項目（バージョンコード、バージョン名、有効開始日）を入力して登録を実行した時, the Organization Master Service shall 新しい組織バージョンレコードを作成する
2. When 組織バージョンが正常に登録された時, the Organization Master Service shall 登録されたバージョンの詳細情報を返す
3. If 同一会社内で既に存在するバージョンコードで登録しようとした場合, the Organization Master Service shall 「バージョンコードが重複しています」エラーを返す
4. If 有効終了日が有効開始日以前の場合, the Organization Master Service shall 「有効終了日は有効開始日より後である必要があります」エラーを返す
5. The Organization Master Service shall 登録時に created_by / updated_by に操作ユーザーIDを記録する

---

### Requirement 3: 既存バージョンからのコピー作成

**Objective:** As a システム管理者, I want 既存の組織バージョンをコピーして新しいバージョンを作成できること, so that 組織改編時に既存構造を引き継いで効率的に編集できる

#### Acceptance Criteria

1. When ユーザーがコピー元バージョンを選択してコピー作成を実行した時, the Organization Master Service shall 新しい組織バージョンと、コピー元の全部門をコピーして作成する
2. When コピー作成時, the Organization Master Service shall コピー元部門の stable_id を引き継ぎ、新しい部門レコードを作成する
3. When コピー作成時, the Organization Master Service shall 部門の親子関係（parent_id）を新版内の対応する部門IDに再マッピングする
4. The Organization Master Service shall コピー元バージョンIDを base_version_id として記録する
5. If コピー元バージョンが存在しない場合, the Organization Master Service shall 「コピー元バージョンが見つかりません」エラーを返す

---

### Requirement 4: 組織バージョンの編集

**Objective:** As a システム管理者, I want 組織バージョンの情報を編集できること, so that バージョン名や有効期間を変更できる

#### Acceptance Criteria

1. When ユーザーがバージョン情報を編集して更新を実行した時, the Organization Master Service shall 対象バージョンのレコードを更新する
2. When バージョン情報が正常に更新された時, the Organization Master Service shall 更新後のバージョン詳細情報を返す
3. If 更新対象のバージョンが存在しない場合, the Organization Master Service shall 「バージョンが見つかりません」エラーを返す
4. If バージョンコードを変更して既存のバージョンコードと重複する場合, the Organization Master Service shall 「バージョンコードが重複しています」エラーを返す
5. The Organization Master Service shall 更新時に updated_at / updated_by を記録する

---

### Requirement 5: 部門ツリーの表示

**Objective:** As a 経営企画担当者, I want 選択したバージョンの部門を階層ツリー形式で閲覧できること, so that 組織構造を視覚的に把握できる

#### Acceptance Criteria

1. When ユーザーが組織バージョンを選択した時, the Organization Master Service shall 当該バージョンに属する部門一覧をツリー形式で表示する
2. The Organization Master Service shall parent_id に基づいて親子関係をツリー構造として表示する
3. When ユーザーがツリーノードを展開した時, the Organization Master Service shall 子部門を表示する
4. When ユーザーがツリーノードを折りたたんだ時, the Organization Master Service shall 子部門を非表示にする
5. The Organization Master Service shall 各ノードに部門コード、部門名、組織単位種別（org_unit_type）、有効状態を表示する
6. The Organization Master Service shall ルートレベルに親を持たない部門を表示する

---

### Requirement 6: 部門の詳細表示・編集

**Objective:** As a 経営企画担当者, I want ツリーから選択した部門の詳細情報を閲覧・編集できること, so that 部門属性を正確に管理できる

#### Acceptance Criteria

1. When ユーザーがツリーから部門を選択した時, the Organization Master Service shall 右側の詳細パネルに当該部門の全属性を表示する
2. The Organization Master Service shall 詳細パネルに部門コード、部門名、部門名略称、親部門、表示順、組織単位種別、責任種別、外部センターコード、責任者、備考、stable_id、作成日時、更新日時を表示する
3. When ユーザーが編集モードに切り替えた時, the Organization Master Service shall 編集可能なフィールドを入力可能状態にする
4. When ユーザーが編集内容を保存した時, the Organization Master Service shall 部門レコードを更新する
5. If 部門コードを変更して同一バージョン内の既存の部門コードと重複する場合, the Organization Master Service shall 「部門コードが重複しています」エラーを返す
6. The Organization Master Service shall 更新時に updated_at / updated_by を記録する
7. The Organization Master Service shall 部門の移動（parent_id変更）後に hierarchy_level / hierarchy_path を再計算する

---

### Requirement 7: 部門の新規登録

**Objective:** As a システム管理者, I want 新しい部門を登録できること, so that 組織改編で新設された部門を追加できる

#### Acceptance Criteria

1. When ユーザーが必須項目（部門コード、部門名）を入力して登録を実行した時, the Organization Master Service shall 新しい部門レコードを作成する
2. When 部門が正常に登録された時, the Organization Master Service shall 登録された部門の詳細情報を返す
3. The Organization Master Service shall 新規登録時に新しい stable_id を自動生成する
4. If 同一バージョン内で既に存在する部門コードで登録しようとした場合, the Organization Master Service shall 「部門コードが重複しています」エラーを返す
5. The Organization Master Service shall 新規登録時に is_active を true として初期化する
6. The Organization Master Service shall 登録時に hierarchy_level / hierarchy_path を計算して設定する
7. The Organization Master Service shall 登録時に created_by / updated_by に操作ユーザーIDを記録する

---

### Requirement 8: ドラッグ＆ドロップによる部門移動

**Objective:** As a 経営企画担当者, I want ツリー上でドラッグ＆ドロップで部門を移動できること, so that 直感的に組織構造を編集できる

#### Acceptance Criteria

1. When ユーザーが部門ノードをドラッグして別の部門にドロップした時, the Organization Master Service shall 移動元部門の parent_id を移動先部門のIDに更新する
2. When ユーザーが部門ノードをルートレベルにドロップした時, the Organization Master Service shall 移動元部門の parent_id を NULL に更新する
3. The Organization Master Service shall 移動後に hierarchy_level / hierarchy_path を再計算する
4. The Organization Master Service shall ドラッグ中にドロップ可能な位置を視覚的に示す
5. If 移動により循環参照が発生する場合, the Organization Master Service shall 「循環参照が発生するため、この移動はできません」エラーを表示してロールバックする

---

### Requirement 9: 部門の無効化

**Objective:** As a システム管理者, I want 部門を無効化できること, so that 使用しなくなった部門を一覧から除外しつつ履歴は保持できる

#### Acceptance Criteria

1. When ユーザーが有効な部門に対して無効化を実行した時, the Organization Master Service shall is_active を false に更新する
2. When 無効化が正常に完了した時, the Organization Master Service shall 更新後の部門詳細情報を返す
3. If 無効化対象の部門が存在しない場合, the Organization Master Service shall 「部門が見つかりません」エラーを返す
4. If 既に無効化されている部門を無効化しようとした場合, the Organization Master Service shall 「この部門は既に無効化されています」エラーを返す
5. The Organization Master Service shall 無効化時に updated_at / updated_by を記録する

---

### Requirement 10: 部門の再有効化

**Objective:** As a システム管理者, I want 無効化された部門を再有効化できること, so that 再び使用する部門を管理対象に戻すことができる

#### Acceptance Criteria

1. When ユーザーが無効な部門に対して再有効化を実行した時, the Organization Master Service shall is_active を true に更新する
2. When 再有効化が正常に完了した時, the Organization Master Service shall 更新後の部門詳細情報を返す
3. If 再有効化対象の部門が存在しない場合, the Organization Master Service shall 「部門が見つかりません」エラーを返す
4. If 既に有効な部門を再有効化しようとした場合, the Organization Master Service shall 「この部門は既に有効です」エラーを返す
5. The Organization Master Service shall 再有効化時に updated_at / updated_by を記録する

---

### Requirement 11: 部門のフィルタリング・検索

**Objective:** As a 経営企画担当者, I want 部門をフィルタリング・検索できること, so that 大量の部門から必要なものを素早く見つけられる

#### Acceptance Criteria

1. When ユーザーが検索キーワードを入力した時, the Organization Master Service shall 部門コードまたは部門名に部分一致する部門をハイライト表示する
2. When ユーザーが有効フラグでフィルタリングした時, the Organization Master Service shall 有効または無効の部門のみを表示する
3. When ユーザーが組織単位種別（org_unit_type）でフィルタリングした時, the Organization Master Service shall 該当する部門のみを表示する
4. The Organization Master Service shall 複数のフィルタ条件を AND 結合で適用する
5. When フィルタ適用時に該当部門が階層の途中にある場合, the Organization Master Service shall 親ノードを自動展開して該当部門を表示する

---

### Requirement 12: 循環参照の防止

**Objective:** As a システム管理者, I want 部門階層に循環参照が発生しないこと, so that 無限ループによるシステム障害を防止できる

#### Acceptance Criteria

1. When 部門の親を変更する時, the Organization Master Service shall 循環参照チェックを実行する
2. If 循環参照が検出された場合, the Organization Master Service shall 「循環参照が発生するため、この設定はできません」エラーを返す
3. The Organization Master Service shall ドラッグ＆ドロップ操作時にも循環参照チェックを実行する
4. The Organization Master Service shall 循環参照チェックはグラフ探索アルゴリズム（DFS/BFS）で実装する
5. If 循環参照チェックでエラーが発生した場合, the Organization Master Service shall 操作をロールバックしてデータ整合性を保つ

---

### Requirement 13: マルチテナント・データ分離

**Objective:** As a システム運営者, I want テナント間のデータが完全に分離されること, so that 情報漏洩リスクを排除できる

#### Acceptance Criteria

1. The Organization Master Service shall すべての操作において tenant_id による絞り込みを実施する
2. The Organization Master Service shall Repository レイヤーで tenant_id を必須パラメータとして受け取る
3. The Organization Master Service shall PostgreSQL の Row Level Security (RLS) と併用してデータ分離を担保する（double-guard）
4. If 異なるテナントのデータにアクセスしようとした場合, the Organization Master Service shall アクセスを拒否する

---

### Requirement 14: 会社・バージョン単位の一意性制約

**Objective:** As a システム管理者, I want バージョンコード・部門コードが適切な範囲で一意であること, so that データを確実に識別できる

#### Acceptance Criteria

1. The Organization Master Service shall tenant_id + company_id + version_code の組み合わせで組織バージョンの一意性を担保する
2. The Organization Master Service shall tenant_id + version_id + department_code の組み合わせで部門の一意性を担保する
3. The Organization Master Service shall tenant_id + stable_id の組み合わせで stable_id のテナント内一意性を担保する
4. If 重複するコードを登録・更新しようとした場合, the Organization Master Service shall 重複エラーを返す

---

### Requirement 15: 監査ログ

**Objective:** As a 内部統制担当者, I want 誰がいつ組織・部門情報を変更したかを追跡できること, so that 監査・コンプライアンス要件を満たせる

#### Acceptance Criteria

1. The Organization Master Service shall 登録・更新・無効化・再有効化のすべての操作において操作ユーザーIDを記録する
2. The Organization Master Service shall 操作日時（created_at / updated_at）を自動的に記録する
3. The Organization Master Service shall 操作ユーザー（created_by / updated_by）を自動的に記録する

---

### Requirement 16: as-of 検索（日付指定による有効バージョン取得）

**Objective:** As a 経営企画担当者, I want 指定した日付時点で有効な組織バージョンを取得できること, so that 過去の組織構造を参照したり時点比較ができる

#### Acceptance Criteria

1. When ユーザーが対象日（as-of date）を指定して検索した時, the Organization Master Service shall effective_date <= 対象日 AND (expiry_date IS NULL OR expiry_date > 対象日) を満たすバージョンを返す
2. If 対象日に有効なバージョンが複数存在する場合, the Organization Master Service shall effective_date が最も新しいバージョンを返す
3. If 対象日に有効なバージョンが存在しない場合, the Organization Master Service shall 「指定日時点で有効なバージョンが見つかりません」メッセージを返す

---

## Out of Scope（本機能のスコープ外）

以下は別機能として実装予定であり、本機能のスコープには含まない：

- **employee_assignments**: 社員所属履歴（departments.stable_id を参照）
- **department_dimension_mappings**: 部門→ディメンション割当/配賦
- **fact_amounts**: 実績・予算データ（department_stable_id を参照）
- 組織バージョンの物理削除（部門が存在する場合は無効化のみ）
- 部門の物理削除（FK参照があるため無効化のみサポート）
- 一括インポート／エクスポート機能
- 複数会社間での組織バージョン・部門コピー機能
- 組織バージョンの承認ワークフロー（設計上「承認ステータス無し方針」）
