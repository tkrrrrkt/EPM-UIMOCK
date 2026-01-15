# Requirements Document

## Introduction

本Featureは、アクションプラン配下のWBS項目をガントチャート形式で管理する機能を提供する。WBSの階層構造、スケジュール（開始日・終了日）、進捗率、依存関係をビジュアルに表示・編集できる。

---

## Spec Reference（INPUT情報）

### 仕様概要（確定済み仕様）
- **参照ファイル**: `.kiro/specs/仕様概要/KPIアクションプラン管理.md`
- **確認日**: 2026-01-09
- **主要な仕様ポイント**:
  - ガントチャートはPhase 1必須
  - 有償ライブラリ活用（dhtmlxGantt / Bryntum Gantt / Syncfusion から選定）
  - 即時保存方式

---

## Entity Reference（必須）

### 対象エンティティ
- **wbs_items**: `.kiro/specs/entities/01_各種マスタ.md` セクション 14.2

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

### Requirement 1: ガントチャート表示

**Objective:** As a ユーザー, I want WBSをガントチャート形式で表示したい, so that プロジェクト全体のスケジュールを把握できる

#### Acceptance Criteria
1.1. When ガントチャート画面を開く, the Gantt UI shall アクションプランに紐づく全WBS項目を階層構造で表示する
1.2. The Gantt UI shall 左側にWBS一覧（ツリー表示）、右側にタイムラインバーを表示する
1.3. The Gantt UI shall 各WBSの開始日・終了日をバーとして表示する
1.4. The Gantt UI shall 進捗率をバー内に視覚的に表示する
1.5. The Gantt UI shall マイルストーン（is_milestone=true）を菱形で表示する
1.6. The Gantt UI shall 表示期間（月/四半期/年）の切り替えを提供する

---

### Requirement 2: WBS階層管理

**Objective:** As a ユーザー, I want WBSを階層構造で管理したい, so that 作業を分解して整理できる

#### Acceptance Criteria
2.1. The Gantt UI shall WBSツリーの展開/折りたたみを提供する
2.2. The WbsService shall WBS新規作成時に parent_wbs_id を指定して階層を構成できる
2.3. The WbsService shall WBSコード（wbs_code）の自動採番を提供する（例: 1, 1.1, 1.1.1）
2.4. When 親WBSを削除, the WbsService shall 配下の子WBS・タスクも連動して論理削除する

---

### Requirement 3: WBS新規作成

**Objective:** As a ユーザー, I want 新しいWBS項目を追加したい, so that 作業を細分化できる

#### Acceptance Criteria
3.1. When WBS追加ボタンをクリック, the Gantt UI shall WBS作成ダイアログを表示する
3.2. The Gantt UI shall 以下の入力を受け付ける：
  - WBSコード（必須、自動採番可）
  - WBS名（必須）
  - 説明（任意）
  - 担当部門（任意）
  - 担当者（任意）
  - 開始日（任意）
  - 終了日（任意）
  - マイルストーンフラグ（任意）
3.3. When WBS作成を実行, the WbsService shall アクションプラン内でWBSコードの重複がないことを検証する
3.4. If WBSコードが重複している, then the WbsService shall エラーを返却する

---

### Requirement 4: WBS編集

**Objective:** As a ユーザー, I want WBSの情報を編集したい, so that 計画変更に対応できる

#### Acceptance Criteria
4.1. When WBS行をダブルクリック, the Gantt UI shall WBS編集ダイアログを表示する
4.2. The Gantt UI shall 全項目の編集を受け付ける
4.3. When 更新を実行, the WbsService shall 楽観的ロック（updated_at）で競合を検証する
4.4. If 競合が検出された, then the WbsService shall 409 Conflict を返却する

---

### Requirement 5: スケジュール編集（バー操作）

**Objective:** As a ユーザー, I want ガントバーをドラッグして日程変更したい, so that 直感的にスケジュール調整できる

#### Acceptance Criteria
5.1. When ガントバーを左右にドラッグ, the WbsService shall 開始日・終了日を更新する
5.2. When ガントバーの端をドラッグ, the WbsService shall 期間（開始日または終了日）を変更する
5.3. The WbsService shall スケジュール変更を即時保存する

---

### Requirement 6: 依存関係管理

**Objective:** As a ユーザー, I want WBS間の依存関係を設定したい, so that 先行タスクを明示できる

#### Acceptance Criteria
6.1. When 依存線をドラッグ, the WbsService shall predecessor_wbs_id を設定する
6.2. The Gantt UI shall 依存関係を矢印線で表示する
6.3. When 依存関係を解除, the WbsService shall predecessor_wbs_id を null に更新する

---

### Requirement 7: 進捗率管理

**Objective:** As a ユーザー, I want WBSの進捗率を管理したい, so that 作業の進捗を把握できる

#### Acceptance Criteria
7.1. The Gantt UI shall 進捗率の手動入力（0-100%）を提供する
7.2. When 進捗率を変更, the WbsService shall progress_rate を更新する
7.3. The Gantt UI shall 進捗率をバー内の塗りつぶし割合で表示する

---

### Requirement 8: WBS削除

**Objective:** As a ユーザー, I want 不要なWBSを削除したい, so that ガントチャートを整理できる

#### Acceptance Criteria
8.1. When WBS削除ボタンをクリック, the Gantt UI shall 削除確認ダイアログを表示する
8.2. The Gantt UI shall 配下のWBS・タスクが削除される旨を警告表示する
8.3. When 削除を確定, the WbsService shall WBSを論理削除（関連タスクも連動削除）する

---

### Requirement 9: カンバンへの遷移

**Objective:** As a ユーザー, I want ガントチャートからカンバンボードに遷移したい, so that タスク詳細を管理できる

#### Acceptance Criteria
9.1. When WBS行をダブルクリック, the Gantt UI shall 該当WBSで絞り込んだカンバンボードへ遷移するオプションを提供する
9.2. The Gantt UI shall 各WBS行にカンバン遷移リンクを表示する

---

### Requirement 10: フィルタリング

**Objective:** As a ユーザー, I want ガントチャートを絞り込みたい, so that 特定の作業に集中できる

#### Acceptance Criteria
10.1. The Gantt UI shall 担当部門によるフィルタリングを提供する
10.2. The Gantt UI shall マイルストーンのみ表示フィルタを提供する

---

### Requirement 11: 権限制御

**Objective:** As a システム, I want 操作を権限のあるユーザーに限定したい, so that 不正な操作を防止できる

#### Acceptance Criteria
11.1. The WbsService shall `epm.actionplan.read` 権限でガントチャート表示を許可する
11.2. The WbsService shall `epm.actionplan.create` 権限でWBS作成を許可する
11.3. The WbsService shall `epm.actionplan.update` 権限でWBS編集・スケジュール変更を許可する
11.4. The WbsService shall `epm.actionplan.delete` 権限でWBS削除を許可する
11.5. The Gantt UI shall 権限に応じて操作可否を制御する

---

## Out of Scope

| 項目 | 理由 |
|------|------|
| タスク管理・カンバンボード | action-plan-kanban Feature で実装 |
| アクションプランCRUD | action-plan-core Feature で実装 |
| ステータス・ラベル設定 | action-plan-settings Feature で実装 |
| 進捗率の自動計算（配下タスクから） | Phase 2 |
| クリティカルパス表示 | Phase 2 |
| リソース管理 | Phase 2 |

---

## 変更履歴

| 日付 | 変更内容 | 担当 |
|------|---------|------|
| 2026-01-09 | 初版作成 | Claude Code |
