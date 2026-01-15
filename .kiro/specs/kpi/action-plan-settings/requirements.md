# Requirements Document

## Introduction

本Featureは、KPIアクションプラン機能で使用するタスクステータスとラベルを会社ごとにカスタマイズする設定画面を提供する。カンバンボードの列（ステータス）と色タグ（ラベル）のマスタ管理機能であり、他のアクションプラン系Featureの基盤となる。

---

## Spec Reference（INPUT情報）

本要件を作成するにあたり、以下の情報を確認した：

### 仕様概要（確定済み仕様）
- **参照ファイル**: `.kiro/specs/仕様概要/KPIアクションプラン管理.md`
- **確認日**: 2026-01-09
- **主要な仕様ポイント**:
  - ステータス管理は会社ごとにカスタマイズ可能
  - 保存方式は即時保存（Trelloスタイル）
  - 権限：`epm.actionplan.admin` でステータス・ラベル設定を管理

### 仕様検討（経緯・背景）※参考
- **参照ファイル**: `.kiro/specs/仕様検討/20260109_KPIアクションプラン管理.md`
- **経緯メモ**: Trello準拠のカンバン機能実装にあたり、ステータス・ラベルのカスタマイズ要件を確認

---

## Entity Reference（必須）

本機能で使用するエンティティ定義を `.kiro/specs/entities/*.md` から確認し、以下を記載する：

### 対象エンティティ
- **task_statuses**: `.kiro/specs/entities/01_各種マスタ.md` セクション 14.4
- **task_labels**: `.kiro/specs/entities/01_各種マスタ.md` セクション 14.5

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

### Requirement 1: ステータス一覧表示

**Objective:** As a 管理者, I want カンバンボードで使用するステータス一覧を確認したい, so that 現在の設定状況を把握できる

#### Acceptance Criteria
1.1. When ステータス設定画面を開く, the Settings UI shall 会社に紐づく全ステータスを sort_order 昇順で一覧表示する
1.2. The Settings UI shall 各ステータスのステータスコード、ステータス名、色、並び順、デフォルトフラグ、完了フラグを表示する
1.3. While ステータスが存在しない, the Settings UI shall 初期データ作成を促すメッセージを表示する

---

### Requirement 2: ステータス新規作成

**Objective:** As a 管理者, I want 新しいステータスを追加したい, so that 業務フローに合わせたカンバン列を設定できる

#### Acceptance Criteria
2.1. When 新規作成ボタンをクリック, the Settings UI shall ステータス作成ダイアログを表示する
2.2. The Settings UI shall ステータスコード（必須）、ステータス名（必須）、色（任意、#RRGGBB形式）、デフォルトフラグ、完了フラグの入力を受け付ける
2.3. When ステータス作成を実行, the StatusService shall 会社内でステータスコードの重複がないことを検証する
2.4. If ステータスコードが重複している, then the StatusService shall エラーを返却する
2.5. When ステータス作成が成功, the StatusService shall 新規ステータスを最大 sort_order + 1 で追加する
2.6. When デフォルトフラグをtrueで作成, the StatusService shall 既存のデフォルトステータスのフラグをfalseに変更する

---

### Requirement 3: ステータス編集

**Objective:** As a 管理者, I want 既存ステータスの情報を変更したい, so that 名称や色を業務に合わせて調整できる

#### Acceptance Criteria
3.1. When ステータス行の編集ボタンをクリック, the Settings UI shall ステータス編集ダイアログを表示する
3.2. The Settings UI shall ステータスコード、ステータス名、色、デフォルトフラグ、完了フラグの編集を受け付ける
3.3. When ステータス更新を実行, the StatusService shall 楽観的ロック（updated_at）で競合を検証する
3.4. If 競合が検出された, then the StatusService shall 409 Conflict を返却する
3.5. When デフォルトフラグをtrueに変更, the StatusService shall 既存のデフォルトステータスのフラグをfalseに変更する

---

### Requirement 4: ステータス並び順変更

**Objective:** As a 管理者, I want ステータスの表示順序を変更したい, so that カンバンボードの列順序をカスタマイズできる

#### Acceptance Criteria
4.1. The Settings UI shall ステータス行のドラッグ&ドロップによる並び替えを提供する
4.2. When ステータスをドラッグ&ドロップ, the StatusService shall 影響を受ける全ステータスの sort_order を更新する
4.3. The StatusService shall sort_order の更新を即時保存する

---

### Requirement 5: ステータス削除

**Objective:** As a 管理者, I want 不要なステータスを削除したい, so that 使用しないカンバン列を整理できる

#### Acceptance Criteria
5.1. When ステータス行の削除ボタンをクリック, the Settings UI shall 削除確認ダイアログを表示する
5.2. When 削除を確定, the StatusService shall 該当ステータスを使用中のタスクが存在しないことを検証する
5.3. If タスクが使用中, then the StatusService shall 削除を拒否しエラーメッセージを返却する
5.4. When 削除が成功, the StatusService shall ステータスを物理削除する
5.5. The StatusService shall デフォルトステータスの削除を禁止する（is_default=true の場合）

---

### Requirement 6: ラベル一覧表示

**Objective:** As a 管理者, I want タスクに付与できるラベル一覧を確認したい, so that 現在のラベル設定状況を把握できる

#### Acceptance Criteria
6.1. When ラベル設定画面を開く, the Settings UI shall 会社に紐づく全ラベルを sort_order 昇順で一覧表示する
6.2. The Settings UI shall 各ラベルのラベル名、色、並び順を表示する
6.3. While ラベルが存在しない, the Settings UI shall 初期データ作成を促すメッセージを表示する

---

### Requirement 7: ラベル新規作成

**Objective:** As a 管理者, I want 新しいラベルを追加したい, so that タスクの分類・視認性を向上できる

#### Acceptance Criteria
7.1. When 新規作成ボタンをクリック, the Settings UI shall ラベル作成ダイアログを表示する
7.2. The Settings UI shall ラベル名（必須）、色（必須、#RRGGBB形式）の入力を受け付ける
7.3. When ラベル作成を実行, the LabelService shall 会社内でラベル名の重複がないことを検証する
7.4. If ラベル名が重複している, then the LabelService shall エラーを返却する
7.5. When ラベル作成が成功, the LabelService shall 新規ラベルを最大 sort_order + 1 で追加する

---

### Requirement 8: ラベル編集

**Objective:** As a 管理者, I want 既存ラベルの情報を変更したい, so that ラベル名や色を調整できる

#### Acceptance Criteria
8.1. When ラベル行の編集ボタンをクリック, the Settings UI shall ラベル編集ダイアログを表示する
8.2. The Settings UI shall ラベル名、色の編集を受け付ける
8.3. When ラベル更新を実行, the LabelService shall 楽観的ロック（updated_at）で競合を検証する
8.4. If 競合が検出された, then the LabelService shall 409 Conflict を返却する
8.5. When ラベル名を変更, the LabelService shall 会社内でラベル名の重複がないことを検証する

---

### Requirement 9: ラベル並び順変更

**Objective:** As a 管理者, I want ラベルの表示順序を変更したい, so that 重要なラベルを上位に表示できる

#### Acceptance Criteria
9.1. The Settings UI shall ラベル行のドラッグ&ドロップによる並び替えを提供する
9.2. When ラベルをドラッグ&ドロップ, the LabelService shall 影響を受ける全ラベルの sort_order を更新する
9.3. The LabelService shall sort_order の更新を即時保存する

---

### Requirement 10: ラベル削除

**Objective:** As a 管理者, I want 不要なラベルを削除したい, so that 使用しないラベルを整理できる

#### Acceptance Criteria
10.1. When ラベル行の削除ボタンをクリック, the Settings UI shall 削除確認ダイアログを表示する
10.2. When 削除を確定, the LabelService shall 該当ラベルを使用中のタスクからラベル紐付けを削除する
10.3. When ラベル紐付け削除が完了, the LabelService shall ラベルを物理削除する
10.4. The Settings UI shall ラベル削除時にタスクへの影響（紐付け解除）を警告表示する

---

### Requirement 11: 初期データ作成

**Objective:** As a 管理者, I want 推奨されるステータス・ラベルの初期セットを作成したい, so that 設定を一から行う手間を省ける

#### Acceptance Criteria
11.1. Where ステータスが存在しない会社, the Settings UI shall 初期ステータス作成ボタンを表示する
11.2. When 初期ステータス作成を実行, the StatusService shall 未着手・進行中・レビュー中・完了の4ステータスを作成する
11.3. Where ラベルが存在しない会社, the Settings UI shall 初期ラベル作成ボタンを表示する
11.4. When 初期ラベル作成を実行, the LabelService shall 重要・急ぎ・確認待ち・完了間近の4ラベルを作成する

---

### Requirement 12: 権限制御

**Objective:** As a システム, I want 設定変更を権限のあるユーザーに限定したい, so that 不正な設定変更を防止できる

#### Acceptance Criteria
12.1. The StatusService shall `epm.actionplan.admin` 権限を持つユーザーのみステータスの作成・編集・削除を許可する
12.2. The LabelService shall `epm.actionplan.admin` 権限を持つユーザーのみラベルの作成・編集・削除を許可する
12.3. If 権限がないユーザーが設定変更を試みた, then the Settings BFF shall 403 Forbidden を返却する
12.4. The Settings UI shall `epm.actionplan.admin` 権限がないユーザーには編集・削除ボタンを非表示にする

---

## Out of Scope

| 項目 | 理由 |
|------|------|
| タスク一覧・カンバンボード | action-plan-kanban Feature で実装 |
| WBS・ガントチャート | action-plan-gantt Feature で実装 |
| アクションプランCRUD | action-plan-core Feature で実装 |
| 担当者設定 | 社員マスタ（employee-master）を利用 |
| ステータス/ラベルのインポート・エクスポート | Phase 2 |

---

## 変更履歴

| 日付 | 変更内容 | 担当 |
|------|---------|------|
| 2026-01-09 | 初版作成 | Claude Code |
