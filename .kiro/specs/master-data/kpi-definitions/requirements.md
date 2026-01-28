# Requirements Document

## Introduction

非財務KPI定義マスタは、EPM SaaSにおける「非財務KPI」の定義を管理する機能である。

本機能のスコープは非財務KPI定義の基本属性（KPIコード、KPI名、単位、集計方法、方向性、有効フラグ）に限定し、実績値の入力・集計機能は別機能（KPI管理マスタ等）で行う。

kpi_definitions.id は将来のKPI管理マスタ機能から参照されるため、物理削除ではなく無効化（is_active = false）で運用する。

### 対象ユーザー
- 経営企画/管理部門の担当者
- システム管理者

### ビジネス目的
- 非財務KPI定義を一元管理し、KPI管理機能で参照可能にする
- CO2削減率、顧客満足度、従業員エンゲージメント等の非財務指標を定義する
- 将来のKPI管理機能・ESGレポート機能との連携基盤を整備する

---

## Entity Reference（必須）

本機能で使用するエンティティ定義を `.kiro/specs/entities/01_各種マスタ.md` から確認し、以下を記載する：

### 対象エンティティ
- **kpi_definitions（非財務KPI定義）**: `.kiro/specs/entities/01_各種マスタ.md`

### エンティティ整合性確認
- [x] 対象エンティティのカラム・型・制約を確認した
  - id (uuid, PK)
  - tenant_id (uuid, RLS境界)
  - company_id (uuid, 会社別管理)
  - kpi_code (varchar(50), 会社内一意)
  - kpi_name (varchar(200))
  - description (text, 任意)
  - unit (varchar(30), 任意, 例: %, 件, pt)
  - aggregation_method (enum: SUM/EOP/AVG/MAX/MIN)
  - direction (enum: higher_is_better/lower_is_better, nullable)
  - is_active (boolean, デフォルトtrue)
  - created_at, updated_at (timestamptz)
  - created_by, updated_by (uuid, 監査)
- [x] エンティティ補足のビジネスルールを要件に反映した
  - UNIQUE(tenant_id, company_id, kpi_code) 制約
  - FK(tenant_id, company_id) → companies(tenant_id, id)
  - 物理削除禁止（参照がある可能性があるため無効化のみ）
- [x] スコープ外の関連エンティティを Out of Scope に明記した
  - KPI実績値の入力・集計機能（KPI管理マスタ機能で実装）
  - KPI管理マスタ機能との連携（参照のみ、定義は本機能）

---

## Requirements

### Requirement 1: KPI定義一覧の検索・表示

**Objective:** As a 経営企画担当者, I want KPI定義を一覧形式で検索・閲覧できること, so that 必要なKPI定義を素早く見つけることができる

#### Acceptance Criteria

1. When ユーザーがKPI定義マスタ画面を開いた時, the KPI Definitions Service shall セッションコンテキストから取得した会社（company_id）に所属するKPI定義一覧を取得して表示する
2. When ユーザーが検索条件（KPIコード、KPI名、集計方法、有効フラグ）を入力して検索を実行した時, the KPI Definitions Service shall 条件に一致するKPI定義のみをフィルタリングして表示する
3. When ユーザーがソート項目（KPIコード、KPI名、集計方法）を選択した時, the KPI Definitions Service shall 選択された項目で昇順または降順にソートして表示する
4. While KPI定義数が多い場合, the KPI Definitions Service shall ページネーションにより一定件数ずつ表示する
5. The KPI Definitions Service shall KPI定義一覧にKPIコード、KPI名、単位、集計方法、方向性、有効状態を表示する

---

### Requirement 2: KPI定義の詳細表示

**Objective:** As a 経営企画担当者, I want 特定のKPI定義の詳細情報を閲覧できること, so that KPI定義の正確な情報を確認できる

#### Acceptance Criteria

1. When ユーザーがKPI定義一覧から特定のKPI定義を選択した時, the KPI Definitions Service shall 当該KPI定義の詳細情報（全項目）を表示する
2. The KPI Definitions Service shall 詳細画面にKPIコード、KPI名、説明、単位、集計方法、方向性、有効フラグ、作成日時、更新日時を表示する
3. If 指定されたIDのKPI定義が存在しない場合, the KPI Definitions Service shall 「KPI定義が見つかりません」エラーを返す

---

### Requirement 3: KPI定義の新規登録

**Objective:** As a システム管理者, I want 新しいKPI定義を登録できること, so that 新しい非財務KPIを管理対象に追加できる

#### Acceptance Criteria

1. When ユーザーが必須項目（KPIコード、KPI名、集計方法）を入力して登録を実行した時, the KPI Definitions Service shall セッションコンテキストから取得した会社（company_id）に対して新しいKPI定義レコードを作成する
2. When KPI定義が正常に登録された時, the KPI Definitions Service shall 登録されたKPI定義の詳細情報を返す
3. If 同一会社内で既に存在するKPIコードで登録しようとした場合, the KPI Definitions Service shall 「KPIコードが重複しています」エラーを返す
4. If 必須項目（KPIコード、KPI名、集計方法）が入力されていない場合, the KPI Definitions Service shall バリデーションエラーを返す
5. If セッションコンテキストに会社（company_id）が設定されていない場合, the KPI Definitions Service shall 「会社が選択されていません」エラーを返す
6. The KPI Definitions Service shall 新規登録時に is_active を true として初期化する
7. The KPI Definitions Service shall 登録時に created_by / updated_by に操作ユーザーIDを記録する

---

### Requirement 4: KPI定義情報の更新

**Objective:** As a システム管理者, I want 既存のKPI定義情報を更新できること, so that KPI名変更や単位の修正などに対応できる

#### Acceptance Criteria

1. When ユーザーがKPI定義情報を編集して更新を実行した時, the KPI Definitions Service shall 対象KPI定義のレコードを更新する
2. When KPI定義情報が正常に更新された時, the KPI Definitions Service shall 更新後のKPI定義詳細情報を返す
3. If 更新対象のKPI定義が存在しない場合, the KPI Definitions Service shall 「KPI定義が見つかりません」エラーを返す
4. If KPIコードを変更して既存のKPIコードと重複する場合, the KPI Definitions Service shall 「KPIコードが重複しています」エラーを返す
5. The KPI Definitions Service shall 更新時に updated_at / updated_by を記録する

---

### Requirement 5: KPI定義の無効化

**Objective:** As a システム管理者, I want KPI定義を無効化できること, so that 不要なKPI定義を一覧から除外しつつ履歴は保持できる

#### Acceptance Criteria

1. When ユーザーが有効なKPI定義に対して無効化を実行した時, the KPI Definitions Service shall is_active を false に更新する
2. When 無効化が正常に完了した時, the KPI Definitions Service shall 更新後のKPI定義詳細情報を返す
3. If 無効化対象のKPI定義が存在しない場合, the KPI Definitions Service shall 「KPI定義が見つかりません」エラーを返す
4. If 既に無効化されているKPI定義を無効化しようとした場合, the KPI Definitions Service shall 「このKPI定義は既に無効化されています」エラーを返す
5. The KPI Definitions Service shall 無効化時に updated_at / updated_by を記録する

---

### Requirement 6: KPI定義の再有効化

**Objective:** As a システム管理者, I want 無効化されたKPI定義を再有効化できること, so that 一時的に無効化したKPI定義を再び管理対象に戻すことができる

#### Acceptance Criteria

1. When ユーザーが無効なKPI定義に対して再有効化を実行した時, the KPI Definitions Service shall is_active を true に更新する
2. When 再有効化が正常に完了した時, the KPI Definitions Service shall 更新後のKPI定義詳細情報を返す
3. If 再有効化対象のKPI定義が存在しない場合, the KPI Definitions Service shall 「KPI定義が見つかりません」エラーを返す
4. If 既に有効なKPI定義を再有効化しようとした場合, the KPI Definitions Service shall 「このKPI定義は既に有効です」エラーを返す
5. The KPI Definitions Service shall 再有効化時に updated_at / updated_by を記録する

---

### Requirement 7: マルチテナント・データ分離

**Objective:** As a システム運営者, I want テナント間・会社間のデータが完全に分離されること, so that 情報漏洩リスクを排除できる

#### Acceptance Criteria

1. The KPI Definitions Service shall すべての操作において tenant_id による絞り込みを実施する
2. The KPI Definitions Service shall すべての操作において company_id による絞り込みを実施する
3. The KPI Definitions Service shall Repository レイヤーで tenant_id と company_id を必須パラメータとして受け取る
4. The KPI Definitions Service shall PostgreSQL の Row Level Security (RLS) と併用してデータ分離を担保する（double-guard）
5. If 異なるテナントのKPI定義にアクセスしようとした場合, the KPI Definitions Service shall アクセスを拒否する
6. If 異なる会社のKPI定義にアクセスしようとした場合, the KPI Definitions Service shall アクセスを拒否する

---

### Requirement 8: 会社単位の一意性制約

**Objective:** As a システム管理者, I want KPIコードが会社内で一意であること, so that KPI定義を確実に識別できる

#### Acceptance Criteria

1. The KPI Definitions Service shall tenant_id + company_id + kpi_code の組み合わせで一意性を担保する
2. If 同一会社内で重複するKPIコードを登録・更新しようとした場合, the KPI Definitions Service shall 重複エラーを返す

---

### Requirement 9: 監査ログ

**Objective:** As a 内部統制担当者, I want 誰がいつKPI定義情報を変更したかを追跡できること, so that 監査・コンプライアンス要件を満たせる

#### Acceptance Criteria

1. The KPI Definitions Service shall 登録・更新・無効化・再有効化のすべての操作において操作ユーザーIDを記録する
2. The KPI Definitions Service shall 操作日時（created_at / updated_at）を自動的に記録する
3. The KPI Definitions Service shall 操作ユーザー（created_by / updated_by）を自動的に記録する

---

## Out of Scope（本機能のスコープ外）

以下は別機能として実装予定であり、本機能のスコープには含まない：

- **KPI実績値の入力・集計機能**: 実績値を入力・集計する機能（KPI管理マスタ機能で実装）
- **KPI管理マスタ機能との連携**: KPI管理マスタ機能でKPI定義を参照する機能（参照のみ、定義は本機能）
- **KPI定義の物理削除**: FK参照がある可能性があるため無効化のみサポート
- **一括インポート／エクスポート機能**
- **ESGレポート機能との連携**: 将来的にESGレポート機能でKPI定義を参照する可能性あり
