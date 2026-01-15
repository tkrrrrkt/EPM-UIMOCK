# Requirements Document

## Introduction

本Featureは、KPI目標達成のための施策・取り組み（アクションプラン）を管理するCRUD機能を提供する。アクションプランはKPI科目に紐付き、配下にWBS項目やタスクを持つ3階層構造の最上位に位置する。

---

## Spec Reference（INPUT情報）

本要件を作成するにあたり、以下の情報を確認した：

### 仕様概要（確定済み仕様）
- **参照ファイル**: `.kiro/specs/仕様概要/KPIアクションプラン管理.md`
- **確認日**: 2026-01-09
- **主要な仕様ポイント**:
  - KPIとアクションプランの関係は1:N
  - 3階層構造（アクションプラン → WBS → タスク）
  - 即時保存方式（Trelloスタイル）

### 仕様検討（経緯・背景）※参考
- **参照ファイル**: `.kiro/specs/仕様検討/20260109_KPIアクションプラン管理.md`
- **経緯メモ**: 競合（Loglass/DIGGLE）にないWBS・カンバン機能として差別化

---

## Entity Reference（必須）

本機能で使用するエンティティ定義を `.kiro/specs/entities/*.md` から確認し、以下を記載する：

### 対象エンティティ
- **action_plans**: `.kiro/specs/entities/01_各種マスタ.md` セクション 14.1

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

### Requirement 1: アクションプラン一覧表示

**Objective:** As a ユーザー, I want 登録されているアクションプラン一覧を確認したい, so that 進行中の施策を把握できる

#### Acceptance Criteria
1.1. When アクションプラン一覧画面を開く, the ActionPlan UI shall 会社に紐づく全アクションプランをページング表示する
1.2. The ActionPlan UI shall プランコード、プラン名、紐付きKPI、責任者、期限、ステータス、進捗率を一覧表示する
1.3. The ActionPlan UI shall キーワード検索（プランコード、プラン名）を提供する
1.4. The ActionPlan UI shall ステータス、優先度によるフィルタリングを提供する
1.5. The ActionPlan UI shall プランコード、プラン名、期限、ステータスでのソートを提供する

---

### Requirement 2: アクションプラン詳細表示

**Objective:** As a ユーザー, I want アクションプランの詳細情報を確認したい, so that 施策の内容を把握できる

#### Acceptance Criteria
2.1. When アクションプラン行をクリック, the ActionPlan UI shall 詳細表示パネルを開く
2.2. The ActionPlan UI shall 全項目（プランコード、プラン名、説明、紐付きKPI、責任部門、責任者、開始日、期限、ステータス、進捗率、優先度）を表示する
2.3. The ActionPlan UI shall 配下のWBS件数、タスク件数のサマリを表示する

---

### Requirement 3: アクションプラン新規作成

**Objective:** As a ユーザー, I want 新しいアクションプランを登録したい, so that KPI達成のための施策を計画できる

#### Acceptance Criteria
3.1. When 新規作成ボタンをクリック, the ActionPlan UI shall 作成ダイアログを表示する
3.2. The ActionPlan UI shall 以下の入力を受け付ける：
  - プランコード（必須）
  - プラン名（必須）
  - 説明（任意）
  - 紐付きKPI科目（必須、KPI科目のみ選択可）
  - 責任部門（任意）
  - 責任者（任意）
  - 開始日（任意）
  - 期限（任意）
  - 優先度（任意、HIGH/MEDIUM/LOW）
3.3. When アクションプラン作成を実行, the ActionPlanService shall 会社内でプランコードの重複がないことを検証する
3.4. If プランコードが重複している, then the ActionPlanService shall エラーを返却する
3.5. When 紐付きKPI科目を選択, the ActionPlanService shall subject_type='KPI' の科目のみ許可する
3.6. If KPI以外の科目が指定された, then the ActionPlanService shall エラーを返却する
3.7. When 作成が成功, the ActionPlanService shall ステータスを NOT_STARTED、進捗率を 0 で初期化する
3.8. When 作成が成功, the ActionPlanService shall **初期ステータス（未着手/進行中/レビュー中/完了）を自動生成**する
3.9. When 作成が成功, the ActionPlanService shall **初期ラベル（重要/急ぎ/確認待ち/完了間近）を自動生成**する

---

### Requirement 4: アクションプラン編集

**Objective:** As a ユーザー, I want 既存アクションプランの情報を変更したい, so that 計画の変更に対応できる

#### Acceptance Criteria
4.1. When 編集ボタンをクリック, the ActionPlan UI shall 編集ダイアログを表示する
4.2. The ActionPlan UI shall 全項目の編集を受け付ける（プランコード、プラン名、説明、紐付きKPI、責任部門、責任者、開始日、期限、ステータス、進捗率、優先度）
4.3. When 更新を実行, the ActionPlanService shall 楽観的ロック（updated_at）で競合を検証する
4.4. If 競合が検出された, then the ActionPlanService shall 409 Conflict を返却する
4.5. When プランコードを変更, the ActionPlanService shall 会社内での重複がないことを検証する

---

### Requirement 5: アクションプラン削除（無効化）

**Objective:** As a ユーザー, I want 不要なアクションプランを削除したい, so that 一覧を整理できる

#### Acceptance Criteria
5.1. When 削除ボタンをクリック, the ActionPlan UI shall 削除確認ダイアログを表示する
5.2. The ActionPlan UI shall 配下のWBS・タスクが削除される旨を警告表示する
5.3. When 削除を確定, the ActionPlanService shall アクションプランを論理削除（is_active=false）する
5.4. When 論理削除が成功, the ActionPlanService shall 配下のWBS・タスクも連動して論理削除する

---

### Requirement 6: KPI科目連携

**Objective:** As a ユーザー, I want KPI科目の予実状況を確認しながらアクションプランを管理したい, so that 目標達成に向けた施策の効果を把握できる

#### Acceptance Criteria
6.1. When アクションプラン詳細を表示, the ActionPlan UI shall 紐付きKPI科目の名称と予実サマリを表示する
6.2. The ActionPlan UI shall KPI科目へのリンクを提供する

---

### Requirement 7: 権限制御

**Objective:** As a システム, I want 操作を権限のあるユーザーに限定したい, so that 不正な操作を防止できる

#### Acceptance Criteria
7.1. The ActionPlanService shall `epm.actionplan.read` 権限を持つユーザーのみ一覧・詳細表示を許可する
7.2. The ActionPlanService shall `epm.actionplan.create` 権限を持つユーザーのみ作成を許可する
7.3. The ActionPlanService shall `epm.actionplan.update` 権限を持つユーザーのみ編集を許可する
7.4. The ActionPlanService shall `epm.actionplan.delete` 権限を持つユーザーのみ削除を許可する
7.5. If 権限がないユーザーが操作を試みた, then the ActionPlan BFF shall 403 Forbidden を返却する
7.6. The ActionPlan UI shall 権限に応じてボタンの表示・非表示を制御する

---

## Out of Scope

| 項目 | 理由 |
|------|------|
| WBS管理（CRUD・階層） | action-plan-gantt Feature で実装 |
| タスク管理・カンバンボード | action-plan-kanban Feature で実装 |
| ステータス・ラベル編集（プラン作成後） | action-plan-kanban Feature でカンバン画面から編集 |
| KPI連携ダッシュボード | action-plan-dashboard Feature で実装 |
| 進捗率の自動計算 | Phase 2（WBSからの集計） |
| ガントチャートへの遷移 | action-plan-gantt Feature で実装 |
| カンバンボードへの遷移 | action-plan-kanban Feature で実装 |

---

## 変更履歴

| 日付 | 変更内容 | 担当 |
|------|---------|------|
| 2026-01-09 | 初版作成 | Claude Code |
| 2026-01-09 | **プラン作成時に初期ステータス・ラベル自動生成を追加**（Req 3.8, 3.9） | Claude Code |
