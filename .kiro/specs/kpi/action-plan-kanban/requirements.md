# Requirements Document

## Introduction

本Featureは、アクションプラン配下のタスクをカンバンボード形式で管理する機能を提供する。ステータス列間のドラッグ&ドロップ、タスク詳細編集、チェックリスト、コメント、ラベル付与、複数担当者アサインなどTrello準拠の機能を実装する。

**また、ステータス・ラベルの管理もカンバン画面内で直接編集可能**とし、アクションプラン単位でカスタマイズできる（Trelloのボード単位ラベルに準拠）。

---

## Spec Reference（INPUT情報）

### 仕様概要（確定済み仕様）
- **参照ファイル**: `.kiro/specs/仕様概要/KPIアクションプラン管理.md`
- **確認日**: 2026-01-09
- **主要な仕様ポイント**:
  - カンバンボードはPhase 1必須（Trello準拠）
  - 即時保存方式（Trelloスタイル）
  - ライブラリ: @dnd-kit/core（OSS）

---

## Entity Reference（必須）

### 対象エンティティ
- **action_plan_tasks**: `.kiro/specs/entities/01_各種マスタ.md` セクション 14.3
- **task_statuses**: `.kiro/specs/entities/01_各種マスタ.md` セクション 14.4（**アクションプラン単位**）
- **task_labels**: `.kiro/specs/entities/01_各種マスタ.md` セクション 14.5（**アクションプラン単位**）
- **task_label_assignments**: `.kiro/specs/entities/01_各種マスタ.md` セクション 14.6
- **task_assignees**: `.kiro/specs/entities/01_各種マスタ.md` セクション 14.7
- **task_checklist_items**: `.kiro/specs/entities/01_各種マスタ.md` セクション 14.8
- **task_comments**: `.kiro/specs/entities/01_各種マスタ.md` セクション 14.9

### エンティティ整合性確認
- [x] 対象エンティティのカラム・型・制約を確認した
- [x] エンティティ補足のビジネスルールを要件に反映した
- [x] スコープ外の関連エンティティを Out of Scope に明記した

---

## INPUT整合性チェック

| チェック項目 | 確認結果 |
|-------------|---------|
| 仕様概要との整合性 | ✅ |
| エンティティとの整合性 | ✅ |
| 仕様検討の背景理解 | ✅ |

---

## Requirements

### Requirement 1: カンバンボード表示

**Objective:** As a ユーザー, I want タスクをカンバン形式で一覧表示したい, so that 作業状況を視覚的に把握できる

#### Acceptance Criteria
1.1. When カンバンボード画面を開く, the Kanban UI shall アクションプランに紐づく全タスクをステータス列ごとに表示する
1.2. The Kanban UI shall 各ステータス列を sort_order 昇順で左から右に配置する
1.3. The Kanban UI shall 各タスクカードにタスク名、ラベル（色）、チェックリスト進捗、担当者、期限を表示する
1.4. The Kanban UI shall WBS項目によるタスクフィルタリングを提供する
1.5. The Kanban UI shall 担当者、期限（今週/今月/期限切れ）、ラベルによるフィルタリングを提供する

---

### Requirement 2: タスクのドラッグ&ドロップ（ステータス変更）

**Objective:** As a ユーザー, I want タスクをドラッグ&ドロップでステータス変更したい, so that 直感的に作業進捗を更新できる

#### Acceptance Criteria
2.1. When タスクカードを別のステータス列にドロップ, the TaskService shall タスクの status_id を更新する
2.2. The TaskService shall ステータス変更を即時保存する
2.3. When ドロップ先列内の位置を指定, the TaskService shall ドロップ位置に応じて sort_order を更新する

---

### Requirement 3: タスクのドラッグ&ドロップ（並び順変更）

**Objective:** As a ユーザー, I want 同一ステータス内でタスクの並び順を変更したい, so that 優先度順に整理できる

#### Acceptance Criteria
3.1. When 同一ステータス列内でタスクをドラッグ&ドロップ, the TaskService shall 影響を受ける全タスクの sort_order を更新する
3.2. The TaskService shall 並び順変更を即時保存する

---

### Requirement 4: タスク新規作成

**Objective:** As a ユーザー, I want 新しいタスクを追加したい, so that 作業項目を管理できる

#### Acceptance Criteria
4.1. When ステータス列の追加ボタンをクリック, the Kanban UI shall タスク作成入力欄を表示する
4.2. The Kanban UI shall タスク名（必須）の入力を受け付ける
4.3. When タスク作成を確定, the TaskService shall 該当ステータスの最大 sort_order + 1 で新規タスクを作成する
4.4. The TaskService shall デフォルトステータス（is_default=true）で新規タスクを作成する（ステータス列から追加の場合は該当ステータス）

---

### Requirement 5: タスク詳細モーダル

**Objective:** As a ユーザー, I want タスクの詳細情報を編集したい, so that タスク内容を詳しく管理できる

#### Acceptance Criteria
5.1. When タスクカードをクリック, the Kanban UI shall タスク詳細モーダルを表示する
5.2. The Kanban UI shall タスク名、説明、担当者（複数選択）、期限、ラベル（複数選択）の編集を受け付ける
5.3. When フィールドを編集, the TaskService shall 即時保存する
5.4. When タスク更新を実行, the TaskService shall 楽観的ロック（updated_at）で競合を検証する
5.5. If 競合が検出された, then the TaskService shall 409 Conflict を返却する

---

### Requirement 6: チェックリスト機能

**Objective:** As a ユーザー, I want タスク内にチェックリストを作成したい, so that サブタスクを管理できる

#### Acceptance Criteria
6.1. When タスク詳細モーダルでチェックリスト追加, the Kanban UI shall チェック項目の入力欄を表示する
6.2. The ChecklistService shall チェック項目の追加・編集・削除・完了切替を即時保存する
6.3. The Kanban UI shall タスクカードにチェックリストの完了数/総数を表示する

---

### Requirement 7: コメント機能

**Objective:** As a ユーザー, I want タスクにコメントを追加したい, so that チームでコミュニケーションできる

#### Acceptance Criteria
7.1. When タスク詳細モーダルでコメント入力, the CommentService shall コメントを作成する
7.2. The Kanban UI shall コメント一覧を作成日時降順で表示する
7.3. The CommentService shall 自分のコメントのみ編集・削除を許可する

---

### Requirement 8: ラベル付与

**Objective:** As a ユーザー, I want タスクにラベルを付与したい, so that タスクを分類・視覚化できる

#### Acceptance Criteria
8.1. When タスク詳細モーダルでラベル選択, the LabelAssignmentService shall タスク-ラベル紐付けを作成する
8.2. The Kanban UI shall 複数ラベルの付与を許可する
8.3. When ラベルを解除, the LabelAssignmentService shall タスク-ラベル紐付けを削除する

---

### Requirement 9: 複数担当者アサイン

**Objective:** As a ユーザー, I want タスクに複数の担当者をアサインしたい, so that チーム作業を管理できる

#### Acceptance Criteria
9.1. When タスク詳細モーダルで担当者追加, the AssigneeService shall タスク担当者を追加する
9.2. The Kanban UI shall 複数担当者のアサインを許可する
9.3. When 担当者を解除, the AssigneeService shall タスク担当者を削除する
9.4. The Kanban UI shall タスクカードに担当者アイコン（複数）を表示する

---

### Requirement 10: タスク削除

**Objective:** As a ユーザー, I want 不要なタスクを削除したい, so that カンバンを整理できる

#### Acceptance Criteria
10.1. When タスク詳細モーダルで削除ボタンをクリック, the Kanban UI shall 削除確認ダイアログを表示する
10.2. When 削除を確定, the TaskService shall タスクを物理削除する
10.3. The TaskService shall タスク削除時に関連データ（チェックリスト、コメント、ラベル紐付け、担当者）も削除する

---

### Requirement 11: 権限制御

**Objective:** As a システム, I want 操作を権限のあるユーザーに限定したい, so that 不正な操作を防止できる

#### Acceptance Criteria
11.1. The TaskService shall `epm.actionplan.read` 権限でカンバン表示を許可する
11.2. The TaskService shall `epm.actionplan.create` 権限でタスク作成を許可する
11.3. The TaskService shall `epm.actionplan.update` 権限でタスク編集・ステータス変更・並び順変更を許可する
11.4. The TaskService shall `epm.actionplan.delete` 権限でタスク削除を許可する
11.5. The Kanban UI shall 権限に応じて操作可否を制御する
11.6. The StatusService/LabelService shall `epm.actionplan.admin` 権限でステータス・ラベル編集を許可する

---

### Requirement 12: ステータス編集（カンバン内）

**Objective:** As a 管理者, I want カンバンボード内でステータス列を編集したい, so that プロジェクトに適したワークフローを定義できる

#### Acceptance Criteria
12.1. When カンバンボードのステータス設定ボタンをクリック, the Kanban UI shall ステータス編集ポップオーバー/ダイアログを表示する
12.2. The StatusService shall ステータスの追加・編集・削除を受け付ける
12.3. The StatusService shall ステータスコード（必須）、ステータス名（必須）、色、デフォルトフラグ、完了フラグの設定を受け付ける
12.4. When ステータス列をドラッグ&ドロップ, the StatusService shall 並び順（sort_order）を更新する
12.5. The StatusService shall ステータス変更を即時保存する
12.6. If ステータスがタスクで使用中, then the StatusService shall 削除を拒否する
12.7. The StatusService shall is_default=true のステータスをプラン内で1つのみ許可する

---

### Requirement 13: ラベル編集（カンバン内）

**Objective:** As a 管理者, I want カンバンボード内でラベルを編集したい, so that タスク分類をプロジェクトに合わせてカスタマイズできる

#### Acceptance Criteria
13.1. When タスク詳細モーダルのラベル選択でラベル編集ボタンをクリック, the Kanban UI shall ラベル編集ポップオーバーを表示する
13.2. The LabelService shall ラベルの追加・編集・削除を受け付ける
13.3. The LabelService shall ラベル名（必須）、色（必須）の設定を受け付ける
13.4. When ラベルを削除, the LabelService shall 該当ラベルのタスク紐付けも削除する
13.5. The LabelService shall ラベル変更を即時保存する

---

## Out of Scope

| 項目 | 理由 |
|------|------|
| WBS・ガントチャート | action-plan-gantt Feature で実装 |
| アクションプランCRUD | action-plan-core Feature で実装 |
| 初期ステータス・ラベル生成 | action-plan-core Feature でプラン作成時に自動生成 |
| リアルタイム同期（WebSocket） | Phase 2 |
| 添付ファイル | Phase 2 |
| アクティビティログ | Phase 2 |

---

## 変更履歴

| 日付 | 変更内容 | 担当 |
|------|---------|------|
| 2026-01-09 | 初版作成 | Claude Code |
| 2026-01-09 | **ステータス・ラベル編集機能を追加**（Req 12, 13）。アクションプラン単位でのカスタマイズに対応 | Claude Code |
