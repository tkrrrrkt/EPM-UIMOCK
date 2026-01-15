# Requirements Document

## Introduction

権限設定は、EPM SaaSにおける「機能ベースの権限管理」を実現する機能である。

本機能では、会社単位でロールを定義し、ロールごとに各機能（メニュー）へのアクセスレベル（A/B/C）とデータスコープ（ALL/HIERARCHY/ASSIGNED）を設定する。社員にロールを割り当てることでアクセス制御を実現する。

基本方針として、1社員1会社・1社員1ロールを原則とし、親会社・子会社間でのデータアクセスは完全分離する。連結関係の機能は主会社（tenants.primary_company_id）に所属する社員のみがアクセス可能とする。

### 対象ユーザー
- システム管理者
- 経営企画/管理部門の担当者

### ビジネス目的
- 会社単位で独立した権限管理を実現する
- 機能（メニュー）ごとのアクセス制御を可能にする
- データスコープによる参照範囲の制限を実現する
- 連結機能を主会社に限定し、ガバナンスを担保する

---

## Spec Reference（INPUT情報）

本要件を作成するにあたり、以下の情報を確認した：

### 仕様概要（確定済み仕様）
- **参照ファイル**: `.kiro/specs/仕様概要/権限設定.md`
- **確認日**: 2026-01-13
- **主要な仕様ポイント**:
  - 会社単位の権限管理（1社員1会社、1社員1ロール）
  - アクセスレベル3段階（A/B/C）とデータスコープ3種類（ALL/HIERARCHY/ASSIGNED）
  - 連結機能は主会社のみ使用可能（tenants.primary_company_id）
  - ASSIGNED時のinclude_childrenオプションで配下部門を含めるか選択可能

### 仕様検討（経緯・背景）※参考
- **参照ファイル**: `.kiro/specs/仕様検討/20260113_権限設定.md`
- **経緯メモ**: QA壁打ちにより、会社スコープ・権限モデル・アクセスレベル・データスコープ・複数ロール割当の方針を決定

---

## Entity Reference（必須）

本機能で使用するエンティティ定義を `.kiro/specs/entities/*.md` から確認し、以下を記載する：

### 対象エンティティ
- tenants: `.kiro/specs/entities/01_各種マスタ.md` セクション 1.1（primary_company_id追加）
- menus: `.kiro/specs/entities/01_各種マスタ.md` セクション 5.5
- roles: `.kiro/specs/entities/01_各種マスタ.md` セクション 5.4
- role_menu_permissions: `.kiro/specs/entities/01_各種マスタ.md` セクション 5.6
- role_menu_department_assignments: `.kiro/specs/entities/01_各種マスタ.md` セクション 5.7
- employee_roles: `.kiro/specs/entities/01_各種マスタ.md` セクション 5.4

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

### Requirement 1: ロール一覧の表示

**Objective:** As a システム管理者, I want 会社に所属するロールの一覧を閲覧できること, so that 権限管理の現状を把握できる

#### Acceptance Criteria

1. When ユーザーがロール管理画面を開いた時, the Permission Settings Service shall 当該会社（company_id）に所属するロール一覧を表示する
2. The Permission Settings Service shall 各ロールについてロールコード、ロール名、説明、割当社員数、有効状態を表示する
3. When ユーザーがキーワードで検索した時, the Permission Settings Service shall ロールコードまたはロール名に部分一致するロールを表示する
4. When ユーザーが有効/無効でフィルタリングした時, the Permission Settings Service shall 該当する有効状態のロールのみを表示する

---

### Requirement 2: ロールの新規登録

**Objective:** As a システム管理者, I want 新しいロールを登録できること, so that 業務に応じた権限グループを作成できる

#### Acceptance Criteria

1. When ユーザーが「新規ロール」を実行した時, the Permission Settings Service shall 新規作成フォームを表示する
2. When ユーザーが必須項目（ロールコード、ロール名）を入力して登録を実行した時, the Permission Settings Service shall 新しいロールレコードを作成する
3. The Permission Settings Service shall 新規登録時に is_active を true として初期化する
4. If 同一会社内で既に存在するロールコードで登録しようとした場合, the Permission Settings Service shall 「ロールコードが重複しています」エラーを返す
5. If 必須項目が入力されていない場合, the Permission Settings Service shall バリデーションエラーを返す

---

### Requirement 3: ロールの編集

**Objective:** As a システム管理者, I want ロールの情報を編集できること, so that ロール名や説明を適切に管理できる

#### Acceptance Criteria

1. When ユーザーがロールを選択して編集を実行した時, the Permission Settings Service shall 編集フォームに現在の値を表示する
2. When ユーザーが編集内容を保存した時, the Permission Settings Service shall ロールレコードを更新する
3. If ロールコードを変更して既存のロールコードと重複する場合, the Permission Settings Service shall 「ロールコードが重複しています」エラーを返す
4. The Permission Settings Service shall 更新時に updated_at を記録する

---

### Requirement 4: ロールの無効化・再有効化

**Objective:** As a システム管理者, I want ロールを無効化/再有効化できること, so that 使用しなくなったロールを管理対象から除外しつつ履歴は保持できる

#### Acceptance Criteria

1. When ユーザーが有効なロールに対して無効化を実行した時, the Permission Settings Service shall is_active を false に更新する
2. When ユーザーが無効なロールに対して再有効化を実行した時, the Permission Settings Service shall is_active を true に更新する
3. If 無効化対象のロールが存在しない場合, the Permission Settings Service shall 「ロールが見つかりません」エラーを返す
4. If 社員が割り当てられているロールを無効化しようとした場合, the Permission Settings Service shall 「社員が割り当てられているため無効化できません」エラーを返す

---

### Requirement 5: メニュー一覧の取得（権限設定用）

**Objective:** As a システム管理者, I want 権限設定可能なメニュー一覧を取得できること, so that ロールに対して権限を設定できる

#### Acceptance Criteria

1. When ユーザーが権限設定画面を開いた時, the Permission Settings Service shall 当該会社のメニュー一覧を取得する
2. The Permission Settings Service shall メニューをカテゴリごとにグルーピングして表示する
3. If メニューが is_consolidation = true の場合, the Permission Settings Service shall 主会社（tenants.primary_company_id と一致する company_id）の社員にのみ表示する
4. If 会社が主会社でない場合, the Permission Settings Service shall 連結専用メニューを一覧から除外する

---

### Requirement 6: ロール×メニュー権限の設定

**Objective:** As a システム管理者, I want ロールごとに各メニューへのアクセスレベルとデータスコープを設定できること, so that 細かな権限制御を実現できる

#### Acceptance Criteria

1. When ユーザーがロールを選択して権限設定画面を開いた時, the Permission Settings Service shall 全メニューに対する現在の権限設定を表示する
2. When ユーザーがメニューに対してアクセスレベル（A/B/C）を選択した時, the Permission Settings Service shall role_menu_permissions レコードを作成または更新する
3. When ユーザーがメニューに対してデータスコープ（ALL/HIERARCHY/ASSIGNED）を選択した時, the Permission Settings Service shall role_menu_permissions レコードを作成または更新する
4. If アクセスレベル C（アクセス不可）を選択した場合, the Permission Settings Service shall データスコープの設定を無効化（または非表示）にする
5. The Permission Settings Service shall アクセスレベルのデフォルト値を C（アクセス不可）とする
6. The Permission Settings Service shall データスコープのデフォルト値を ALL とする

---

### Requirement 7: ASSIGNED時の部門指定

**Objective:** As a システム管理者, I want データスコープがASSIGNEDの場合に対象部門を指定できること, so that 特定部門のデータのみアクセス可能にできる

#### Acceptance Criteria

1. When ユーザーがデータスコープ ASSIGNED を選択した時, the Permission Settings Service shall 部門選択ダイアログを表示する
2. When ユーザーが部門を選択して追加を実行した時, the Permission Settings Service shall role_menu_department_assignments レコードを作成する
3. When ユーザーが部門を選択して include_children オプションを有効にした時, the Permission Settings Service shall include_children = true で保存する
4. When ユーザーが部門指定を削除した時, the Permission Settings Service shall 該当の role_menu_department_assignments レコードを削除する
5. The Permission Settings Service shall 複数の部門を指定可能とする
6. If ASSIGNED で部門が1件も指定されていない場合, the Permission Settings Service shall 「部門を1件以上指定してください」エラーを返す

---

### Requirement 8: 社員ロール割当一覧の表示

**Objective:** As a システム管理者, I want 社員とロールの割当状況を一覧で確認できること, so that 権限設定の漏れや重複を把握できる

#### Acceptance Criteria

1. When ユーザーが社員ロール割当画面を開いた時, the Permission Settings Service shall 当該会社の社員一覧と割当済みロールを表示する
2. The Permission Settings Service shall 各社員について社員番号、氏名、部門名、現在のロールを表示する
3. When ユーザーが部門でフィルタリングした時, the Permission Settings Service shall 該当部門の社員のみを表示する
4. When ユーザーがロールでフィルタリングした時, the Permission Settings Service shall 該当ロールが割り当てられている社員のみを表示する
5. When ユーザーが「未割当」でフィルタリングした時, the Permission Settings Service shall ロールが未割当の社員のみを表示する

---

### Requirement 9: 社員へのロール割当

**Objective:** As a システム管理者, I want 社員にロールを割り当てできること, so that 社員が適切な権限でシステムを利用できる

#### Acceptance Criteria

1. When ユーザーが社員を選択してロールを割り当てた時, the Permission Settings Service shall employee_roles レコードを作成する
2. When ユーザーが社員の割当ロールを変更した時, the Permission Settings Service shall employee_roles レコードを更新する
3. If 同一社員に複数のロールを割り当てようとした場合, the Permission Settings Service shall 「1社員に割り当てられるロールは1つまでです」エラーを返す
4. When ユーザーが社員のロール割当を解除した時, the Permission Settings Service shall employee_roles レコードを削除する
5. If 無効化されたロールを割り当てようとした場合, the Permission Settings Service shall 「無効なロールは割り当てできません」エラーを返す

---

### Requirement 10: ユーザー権限情報の取得

**Objective:** As a ログインユーザー, I want ログイン時に自分の権限情報を取得できること, so that アクセス可能な機能を把握できる

#### Acceptance Criteria

1. When ユーザーがログインした時, the Permission Settings Service shall 当該社員に割り当てられたロールの権限情報を返す
2. The Permission Settings Service shall アクセスレベル C（アクセス不可）のメニューを返却対象から除外する
3. The Permission Settings Service shall 各メニューのアクセスレベル（A または B）とデータスコープを返す
4. If データスコープが ASSIGNED の場合, the Permission Settings Service shall 対象部門のstable_idリストも返す
5. If 社員にロールが割り当てられていない場合, the Permission Settings Service shall 空の権限リストを返す

---

### Requirement 11: 連結機能の制御

**Objective:** As a システム運営者, I want 連結関係の機能を主会社のみに制限できること, so that 連結ガバナンスを担保できる

#### Acceptance Criteria

1. When メニューの is_consolidation が true の場合, the Permission Settings Service shall tenants.primary_company_id と一致する会社の社員にのみ権限設定を許可する
2. If 主会社以外の会社で連結メニューに権限を設定しようとした場合, the Permission Settings Service shall 「連結機能は主会社でのみ使用可能です」エラーを返す
3. When 主会社でない社員がログインした時, the Permission Settings Service shall 連結メニューを権限情報から除外する

---

### Requirement 12: マルチテナント・データ分離

**Objective:** As a システム運営者, I want テナント間のデータが完全に分離されること, so that 情報漏洩リスクを排除できる

#### Acceptance Criteria

1. The Permission Settings Service shall すべての操作において tenant_id による絞り込みを実施する
2. The Permission Settings Service shall Repository レイヤーで tenant_id を必須パラメータとして受け取る
3. The Permission Settings Service shall PostgreSQL の Row Level Security (RLS) と併用してデータ分離を担保する
4. If 異なるテナントのデータにアクセスしようとした場合, the Permission Settings Service shall アクセスを拒否する

---

### Requirement 13: 会社単位の一意性制約

**Objective:** As a システム管理者, I want ロールコードとメニューコードが会社内で一意であること, so that 識別を確実にできる

#### Acceptance Criteria

1. The Permission Settings Service shall tenant_id + company_id + role_code の組み合わせでロールの一意性を担保する
2. The Permission Settings Service shall tenant_id + company_id + menu_code の組み合わせでメニューの一意性を担保する
3. If 同一会社内で重複するコードを登録・更新しようとした場合, the Permission Settings Service shall 重複エラーを返す

---

### Requirement 14: 監査ログ

**Objective:** As a 内部統制担当者, I want 権限変更の履歴を追跡できること, so that 監査・コンプライアンス要件を満たせる

#### Acceptance Criteria

1. The Permission Settings Service shall ロールの登録・更新・無効化・再有効化において操作日時を記録する
2. The Permission Settings Service shall 権限設定の変更において操作日時を記録する
3. The Permission Settings Service shall 社員ロール割当の変更において操作日時を記録する
4. The Permission Settings Service shall created_at / updated_at を自動的に記録する

---

### Requirement 15: 社員への一括ロール割当

**Objective:** As a システム管理者, I want 複数の社員に対して一括でロールを割り当てできること, so that 大量の社員へのロール設定を効率的に行える

#### Acceptance Criteria

1. When ユーザーが一括ロール割当画面を開いた時, the Permission Settings Service shall 有効なロール一覧を選択肢として表示する
2. When ユーザーがロールを選択して次のステップに進んだ時, the Permission Settings Service shall 社員一覧を表示する
3. The Permission Settings Service shall 社員一覧をキーワード（社員コード・氏名）、部門、ロール割当状態でフィルタリング可能とする
4. When ユーザーが複数の社員を選択して一括割当を実行した時, the Permission Settings Service shall 選択された全社員に対して employee_roles レコードを作成または更新する
5. The Permission Settings Service shall 既に同じロールが割り当てられている社員を選択対象から除外（無効化）する
6. If 選択された社員が0人の場合, the Permission Settings Service shall 割当実行ボタンを無効化する
7. The Permission Settings Service shall 一括割当の進捗状態（処理中/完了）を表示する

---

## Out of Scope（本機能のスコープ外）

以下は別機能として実装予定であり、本機能のスコープには含まない：

- **メニューマスタの管理**: メニュー（機能）の登録・編集・削除は別機能として実装
- **承認ワークフロー**: 権限変更の承認フローは別途検討
- **権限変更履歴の詳細表示**: 誰が何を変更したかの詳細履歴表示は将来拡張
- **権限テンプレート**: よく使うロールパターンのテンプレート機能は将来拡張
- **ロールの物理削除**: FK参照があるため無効化のみサポート
