# Requirements Document

## Introduction

法人マスタは、EPM SaaSにおける「法人（会社）」の基本情報を管理する機能である。

本機能は連結会計における会社階層（親子関係）、連結種別（full/equity/none）、出資比率・議決権比率、通貨設定、決算月等を含む法人の基本属性を一元管理する。companies テーブルは EPM における多くのエンティティ（accounting_periods, organization_versions, subjects, employees, projects 等）から FK 参照される基盤マスタとして位置づけられる。

物理削除は行わず、is_active フラグによる無効化で運用する。

### 対象ユーザー
- 経営企画/管理部門の担当者
- グループ経営管理担当者
- システム管理者

### ビジネス目的
- グループ内の法人を一元管理し、連結会計の基盤を整備する
- 会社ごとの通貨・決算月設定により、正確な会計期間管理を実現する
- 会社階層（親子関係）を管理し、連結処理の基盤を提供する

---

## Entity Reference（必須）

本機能で使用するエンティティ定義を `.kiro/specs/entities/01_各種マスタ.md` から確認し、以下を記載する：

### 対象エンティティ
- **companies**: `.kiro/specs/entities/01_各種マスタ.md` セクション 1.2

### エンティティ整合性確認
- [x] 対象エンティティのカラム・型・制約を確認した
- [x] エンティティ補足のビジネスルールを要件に反映した
- [x] スコープ外の関連エンティティを Out of Scope に明記した

---

## Requirements

### Requirement 1: 法人一覧の検索・表示

**Objective:** As a グループ経営管理担当者, I want 法人を一覧形式で検索・閲覧できること, so that グループ内の法人情報を素早く把握できる

#### Acceptance Criteria

1.1 When ユーザーが法人マスタ画面を開いた時, the Company Master Service shall 当該テナントに所属する法人一覧を取得して表示する

1.2 When ユーザーが検索条件（法人コード、法人名、有効フラグ、連結種別）を入力して検索を実行した時, the Company Master Service shall 条件に一致する法人のみをフィルタリングして表示する

1.3 When ユーザーがソート項目（法人コード、法人名）を選択した時, the Company Master Service shall 選択された項目で昇順または降順にソートして表示する

1.4 While 法人数が多い場合, the Company Master Service shall ページネーションにより一定件数ずつ表示する

1.5 The Company Master Service shall 法人一覧に法人コード、法人名、連結種別、通貨コード、決算月、有効状態を表示する

---

### Requirement 2: 法人の詳細表示

**Objective:** As a グループ経営管理担当者, I want 特定の法人の詳細情報を閲覧できること, so that 法人の正確な情報を確認できる

#### Acceptance Criteria

2.1 When ユーザーが法人一覧から特定の法人を選択した時, the Company Master Service shall 当該法人の詳細情報（全項目）を表示する

2.2 The Company Master Service shall 詳細画面に法人コード、法人名、法人名略称、親法人、連結種別、出資比率、議決権比率、会社通貨、レポート通貨、決算月、タイムゾーン、有効フラグ、作成日時、更新日時を表示する

2.3 If 指定されたIDの法人が存在しない場合, the Company Master Service shall 「法人が見つかりません」エラーを返す

---

### Requirement 3: 法人の新規登録

**Objective:** As a システム管理者, I want 新しい法人を登録できること, so that グループに参画する新会社を管理対象に追加できる

#### Acceptance Criteria

3.1 When ユーザーが必須項目（法人コード、法人名、連結種別、会社通貨、決算月）を入力して登録を実行した時, the Company Master Service shall 新しい法人レコードを作成する

3.2 When 法人が正常に登録された時, the Company Master Service shall 登録された法人の詳細情報を返す

3.3 If 同一テナント内で既に存在する法人コードで登録しようとした場合, the Company Master Service shall 「法人コードが重複しています」エラーを返す

3.4 If 必須項目（法人コード、法人名、連結種別、会社通貨、決算月）が入力されていない場合, the Company Master Service shall バリデーションエラーを返す

3.5 If 連結種別が許可値（full/equity/none）以外の場合, the Company Master Service shall バリデーションエラーを返す

3.6 If 出資比率または議決権比率が 0〜100 の範囲外の場合, the Company Master Service shall バリデーションエラーを返す

3.7 If 決算月が 1〜12 の範囲外の場合, the Company Master Service shall バリデーションエラーを返す

3.8 The Company Master Service shall 新規登録時に is_active を true として初期化する

3.9 The Company Master Service shall 登録時に created_by / updated_by に操作ユーザーIDを記録する

---

### Requirement 4: 法人情報の更新

**Objective:** As a システム管理者, I want 既存の法人情報を更新できること, so that 法人名変更や連結条件変更に対応できる

#### Acceptance Criteria

4.1 When ユーザーが法人情報を編集して更新を実行した時, the Company Master Service shall 対象法人のレコードを更新する

4.2 When 法人情報が正常に更新された時, the Company Master Service shall 更新後の法人詳細情報を返す

4.3 If 更新対象の法人が存在しない場合, the Company Master Service shall 「法人が見つかりません」エラーを返す

4.4 If 法人コードを変更して既存の法人コードと重複する場合, the Company Master Service shall 「法人コードが重複しています」エラーを返す

4.5 If 連結種別・出資比率・議決権比率・決算月のバリデーションに違反した場合, the Company Master Service shall バリデーションエラーを返す

4.6 The Company Master Service shall 更新時に updated_at / updated_by を記録する

---

### Requirement 5: 法人の無効化

**Objective:** As a システム管理者, I want 法人を無効化できること, so that 連結対象外となった法人を一覧から除外しつつ履歴は保持できる

#### Acceptance Criteria

5.1 When ユーザーが有効な法人に対して無効化を実行した時, the Company Master Service shall is_active を false に更新する

5.2 When 無効化が正常に完了した時, the Company Master Service shall 更新後の法人詳細情報を返す

5.3 If 無効化対象の法人が存在しない場合, the Company Master Service shall 「法人が見つかりません」エラーを返す

5.4 If 既に無効化されている法人を無効化しようとした場合, the Company Master Service shall 「この法人は既に無効化されています」エラーを返す

5.5 The Company Master Service shall 無効化時に updated_at / updated_by を記録する

---

### Requirement 6: 法人の再有効化

**Objective:** As a システム管理者, I want 無効化された法人を再有効化できること, so that 連結対象に復帰する法人を再び管理対象に戻すことができる

#### Acceptance Criteria

6.1 When ユーザーが無効な法人に対して再有効化を実行した時, the Company Master Service shall is_active を true に更新する

6.2 When 再有効化が正常に完了した時, the Company Master Service shall 更新後の法人詳細情報を返す

6.3 If 再有効化対象の法人が存在しない場合, the Company Master Service shall 「法人が見つかりません」エラーを返す

6.4 If 既に有効な法人を再有効化しようとした場合, the Company Master Service shall 「この法人は既に有効です」エラーを返す

6.5 The Company Master Service shall 再有効化時に updated_at / updated_by を記録する

---

### Requirement 7: 会社階層（連結親子関係）の管理

**Objective:** As a グループ経営管理担当者, I want 法人間の親子関係を設定・参照できること, so that 連結会計の階層構造を正確に管理できる

#### Acceptance Criteria

7.1 When ユーザーが法人登録・更新時に親法人を指定した時, the Company Master Service shall parent_company_id を設定する

7.2 The Company Master Service shall 親法人は同一テナント内の法人のみ設定可能とする

7.3 If 親法人として存在しない法人IDを指定した場合, the Company Master Service shall 「親法人が見つかりません」エラーを返す

7.4 If 自分自身を親法人として設定しようとした場合, the Company Master Service shall 「自身を親法人に設定することはできません」エラーを返す

7.5 The Company Master Service shall 法人詳細画面に親法人名を表示する

7.6 When ユーザーが連結階層ツリー表示を要求した時, the Company Master Service shall 親子関係に基づくツリー構造を返す

---

### Requirement 8: マルチテナント・データ分離

**Objective:** As a システム運営者, I want テナント間のデータが完全に分離されること, so that 情報漏洩リスクを排除できる

#### Acceptance Criteria

8.1 The Company Master Service shall すべての操作において tenant_id による絞り込みを実施する

8.2 The Company Master Service shall Repository レイヤーで tenant_id を必須パラメータとして受け取る

8.3 The Company Master Service shall PostgreSQL の Row Level Security (RLS) と併用してデータ分離を担保する（double-guard）

8.4 If 異なるテナントの法人にアクセスしようとした場合, the Company Master Service shall アクセスを拒否する

---

### Requirement 9: テナント内の一意性制約

**Objective:** As a システム管理者, I want 法人コードがテナント内で一意であること, so that 法人を確実に識別できる

#### Acceptance Criteria

9.1 The Company Master Service shall tenant_id + company_code の組み合わせで一意性を担保する

9.2 If 同一テナント内で重複する法人コードを登録・更新しようとした場合, the Company Master Service shall 重複エラーを返す

---

### Requirement 10: 監査ログ

**Objective:** As a 内部統制担当者, I want 誰がいつ法人情報を変更したかを追跡できること, so that 監査・コンプライアンス要件を満たせる

#### Acceptance Criteria

10.1 The Company Master Service shall 登録・更新・無効化・再有効化のすべての操作において操作ユーザーIDを記録する

10.2 The Company Master Service shall 操作日時（created_at / updated_at）を自動的に記録する

10.3 The Company Master Service shall 操作ユーザー（created_by / updated_by）を自動的に記録する

---

## Out of Scope（本機能のスコープ外）

以下は別機能として実装予定であり、本機能のスコープには含まない：

- **accounting_periods**: 会計期間マスタ（companies.id を参照）
- **organization_versions**: 組織バージョン（companies.id を参照）
- **subjects**: 科目マスタ（companies.id を参照、会社COA）
- **employees**: 社員マスタ（companies.id を参照）
- **projects**: プロジェクトマスタ（companies.id を参照）
- **tenants**: テナントマスタ（法人の上位概念、別管理）
- 法人の物理削除（FK参照があるため無効化のみサポート）
- 一括インポート／エクスポート機能
- 連結仕訳・連結消去の実行（連結COAマッピングとは別機能）
- 循環参照チェック（親子階層の循環検出は UseCase で担保、初期実装では自己参照禁止のみ）
