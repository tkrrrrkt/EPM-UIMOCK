# Requirements Document

## Introduction

本ドキュメントは、KPIアクションプラン管理におけるダッシュボード機能（action-plan-dashboard）の要件を定義する。KPIの予実データとアクションプラン進捗を並べて表示し、KPI達成に向けた施策の状況を俯瞰できるダッシュボードを提供する。

---

## Spec Reference（INPUT情報）

本要件を作成するにあたり、以下の情報を確認した：

### 仕様概要（確定済み仕様）
- **参照ファイル**: `.kiro/specs/仕様概要/KPIアクションプラン管理.md`
- **確認日**: 2026-01-09
- **主要な仕様ポイント**:
  - KPI連携ダッシュボード: KPI予実 + 進捗を並べて表示
  - DashboardBff → CoreApi（アクションプラン情報）への依存
  - subjects（KPI科目）とaction_plansの連携表示

### 仕様検討（経緯・背景）※参考
- **参照ファイル**: `.kiro/specs/仕様検討/20260109_KPIアクションプラン管理.md`
- **経緯メモ**: KPIアクションプラン機能の一部として、KPI予実とアクションプラン進捗を統合的に表示するダッシュボードが必要

---

## Entity Reference（必須）

本機能で使用するエンティティ定義を `.kiro/specs/entities/*.md` から確認し、以下を記載する：

### 対象エンティティ
- subjects: `.kiro/specs/entities/01_各種マスタ.md` セクション 6.1（KPI科目）
- action_plans: `.kiro/specs/entities/01_各種マスタ.md` セクション 14.1
- wbs_items: `.kiro/specs/entities/01_各種マスタ.md` セクション 14.2（進捗集計用）
- action_plan_tasks: `.kiro/specs/entities/01_各種マスタ.md` セクション 14.3（タスク進捗用）

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

### Requirement 1: ダッシュボード表示

**Objective:** As a KPI管理者, I want KPIとアクションプランの進捗を一覧で確認したい, so that 施策の状況を俯瞰し、適切な判断ができる

#### Acceptance Criteria
1.1. When ユーザーがダッシュボード画面を開く, the DashboardUI shall KPI科目一覧とそれに紐づくアクションプランを表示する
1.2. The DashboardUI shall 各KPI科目について予算・実績・進捗率を表示する
1.3. The DashboardUI shall 各アクションプランについて計画期間・担当部門・進捗率を表示する
1.4. The DashboardUI shall KPI科目ごとにアクションプランをグループ化して表示する
1.5. When アクションプランがないKPI科目がある場合, the DashboardUI shall 「アクションプランなし」と表示する

---

### Requirement 2: 進捗集計

**Objective:** As a KPI管理者, I want アクションプランの進捗率を自動集計で確認したい, so that 手動計算なしで正確な進捗状況を把握できる

#### Acceptance Criteria
2.1. The DashboardService shall アクションプラン配下のWBS進捗率を加重平均で集計する
2.2. The DashboardService shall タスク完了率（完了タスク数/全タスク数）を計算する
2.3. The DashboardUI shall WBS進捗率とタスク完了率の両方を表示する

---

### Requirement 3: フィルタリング

**Objective:** As a KPI管理者, I want 表示するKPIやアクションプランを絞り込みたい, so that 関心のある施策に集中できる

#### Acceptance Criteria
3.1. When ユーザーが組織を選択する, the DashboardUI shall 該当組織のKPIのみを表示する
3.2. When ユーザーが期間を選択する, the DashboardUI shall 該当期間のアクションプランのみを表示する
3.3. When ユーザーが進捗状況を選択する, the DashboardUI shall 遅延・正常・完了などのステータスで絞り込む

---

### Requirement 4: KPI予実詳細

**Objective:** As a KPI管理者, I want KPIの予実明細を確認したい, so that 予算と実績の差異を把握できる

#### Acceptance Criteria
4.1. When ユーザーがKPI行をクリックする, the DashboardUI shall KPI予実詳細パネルを展開する
4.2. The DashboardUI shall 月次の予算・実績・差異を表示する
4.3. The DashboardUI shall 予実達成率（実績/予算×100）を計算して表示する

---

### Requirement 5: アクションプラン詳細ドリルダウン

**Objective:** As a KPI管理者, I want ダッシュボードから各アクションプランの詳細に遷移したい, so that 詳細な進捗管理ができる

#### Acceptance Criteria
5.1. When ユーザーがアクションプラン行をクリックする, the DashboardUI shall アクションプラン詳細へ遷移するオプションを表示する
5.2. The DashboardUI shall ガントチャート画面への遷移リンクを提供する
5.3. The DashboardUI shall カンバンボード画面への遷移リンクを提供する

---

### Requirement 6: アラートインジケーター

**Objective:** As a KPI管理者, I want 遅延や問題のある施策を視覚的に把握したい, so that 迅速に対処できる

#### Acceptance Criteria
6.1. The DashboardUI shall 期限超過のアクションプランに警告アイコンを表示する
6.2. The DashboardUI shall 進捗率が計画を大きく下回るアクションプランに注意アイコンを表示する
6.3. When 遅延アクションプランが存在する場合, the DashboardUI shall サマリー領域に遅延件数を表示する

---

### Requirement 7: データ更新

**Objective:** As a KPI管理者, I want 最新のデータでダッシュボードを確認したい, so that リアルタイムに近い情報で判断できる

#### Acceptance Criteria
7.1. When ユーザーが更新ボタンをクリックする, the DashboardUI shall 最新データを再取得して表示を更新する
7.2. The DashboardUI shall 最終更新日時を表示する

---

### Requirement 8: 権限制御

**Objective:** As a システム管理者, I want ダッシュボードへのアクセスを制御したい, so that 適切な権限を持つユーザーのみが閲覧できる

#### Acceptance Criteria
8.1. While ユーザーがepm.actionplan.read権限を持つ, the DashboardUI shall ダッシュボードを表示する
8.2. While ユーザーがepm.actionplan.read権限を持たない, the DashboardUI shall アクセス拒否メッセージを表示する
8.3. The DashboardService shall ユーザーのアクセス可能な組織のKPIのみを返却する

---

## Out of Scope

以下はPhase 1対象外とする：

| 項目 | 理由 |
|------|------|
| KPI実績の自動取り込み | 外部システム連携が必要、Phase 2 |
| リアルタイム更新 | WebSocket実装はPhase 2 |
| エクスポート機能（PDF/Excel） | Phase 2 |
| カスタムダッシュボード構成 | 表示項目のカスタマイズはPhase 2 |
| KPI予測機能 | AI/ML連携はPhase 2以降 |

---

## 変更履歴

| 日付 | 変更内容 | 担当 |
|------|---------|------|
| 2026-01-09 | 初版作成 | Claude Code |
