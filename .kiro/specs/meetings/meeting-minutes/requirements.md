# 議事録登録 Requirements

> **ステータス**: 要件定義中（Phase 1 → Phase 2）
> **作成日**: 2026-01-30
> **スコープ**: A2b（議事録タブ - 会議レポート画面内）
> **対象ユーザー**: 経営企画部（会議進行役）

---

## Spec Reference

- **仕様概要（SSoT）**: [.kiro/specs/仕様概要/経営会議レポート機能.md](../../仕様概要/経営会議レポート機能.md)
- **報告フォーム設定**: [.kiro/specs/meetings/meeting-form-settings/requirements.md](../meeting-form-settings/requirements.md)
- **レイアウト決定**: [.kiro/specs/meetings/meeting-report-layout/ARCHITECTURE_DECISION.md](../meeting-report-layout/ARCHITECTURE_DECISION.md)

---

## Introduction

議事録登録（meeting-minutes）は、会議開催**後**に管理者が会議の決定事項・課題・フォローアップなどを記録する機能である。

本機能は会議レポート表示画面（C2）の「議事録」タブを実装する。

### 位置づけ

- **A3（報告フォーム設定）**: 議事録フォーム構造の定義（INPUT側）
- **C2議事録タブ**: 議事録の登録・編集画面（INPUT実行側）
- **C2議事録表示**: 記録された議事録の表示（OUTPUT側）

### 対象ユーザー

- 経営企画部（会議進行役）
- 管理者

### ビジネス目的

- 会議の決定事項を記録・共有できる
- 課題・リスクをフォローアップできる
- 会議の成果・実行事項を可視化できる
- 会議ごとの進捗管理が可能

---

## Scope & Out of Scope

### In Scope

- 会議ごとの議事録登録フォーム表示
- フォーム項目への入力・保存
- 議事録内容の表示
- 編集・更新機能

### Out of Scope

- 議事録のテンプレート定義（報告フォーム設定に含まれる）
- 議事録の承認フロー
- 議事録の配信・通知
- 議事録の検索・一覧表示

---

## Data Model Reference

**使用テーブル** (Phase 2以降):
- `meeting_minutes`: 議事録トランザクションデータ
  - `id`: 議事録ID
  - `tenant_id`: テナントID
  - `event_id`: 会議イベントID (FK → meeting_events)
  - `created_at`: 作成日時
  - `updated_at`: 更新日時
  - `created_by_user_id`: 作成ユーザーID

- `meeting_minutes_field_values`: 議事録フィールド値
  - `id`: 値ID
  - `tenant_id`: テナントID
  - `minutes_id`: 議事録ID (FK → meeting_minutes)
  - `form_field_id`: フォームフィールドID (FK → meeting_form_fields)
  - `field_value`: 入力値（JSON）

---

## Functional Requirements

### FR-1: 議事録フォーム表示

**Objective:** As a 管理者, I want 会議の議事録フォームを表示できること, so that 会議の決定事項を記録できる

#### Acceptance Criteria

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-1.1 | When ユーザーが会議レポート画面の「議事録」タブを選択した時, the Meeting Minutes Service shall 報告フォーム設定から「MEETING_MINUTES」セクションを取得し表示する | P1 |
| FR-1.2 | The Meeting Minutes Service shall セクション内の全フィールドを表示順（sort_order）で配列する | P1 |
| FR-1.3 | The Meeting Minutes Service shall 各フィールドのタイプ（TEXT/TEXTAREA/DATE等）に応じた入力UIを提供する | P1 |
| FR-1.4 | The Meeting Minutes Service shall 既に登録済みの議事録がある場合、その内容を入力フィールドに復元する | P2 |

---

### FR-2: 議事録登録

**Objective:** As a 管理者, I want 議事録を新規登録できること, so that 会議の成果を記録できる

#### Acceptance Criteria

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-2.1 | When ユーザーが議事録フォームに入力して「保存」を実行した時, the Meeting Minutes Service shall 新規議事録レコードを作成する | P1 |
| FR-2.2 | The Meeting Minutes Service shall 送信時に必須フィールドの入力を検証する | P1 |
| FR-2.3 | If 必須フィールドが未入力の場合, the Meeting Minutes Service shall 「必須項目が未入力です」エラーを返す | P1 |
| FR-2.4 | The Meeting Minutes Service shall 登録時に created_by_user_id に現在のユーザーIDを記録する | P1 |
| FR-2.5 | The Meeting Minutes Service shall 登録後「保存しました」メッセージを表示し、フォームをリセットする | P2 |

---

### FR-3: 議事録編集

**Objective:** As a 管理者, I want 既存の議事録を編集できること, so that 誤りを修正できる

#### Acceptance Criteria

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-3.1 | When ユーザーが既存議事録の「編集」を実行した時, the Meeting Minutes Service shall 登録済み内容をフォームに復元する | P2 |
| FR-3.2 | The Meeting Minutes Service shall 編集時に必須フィールドの入力を検証する | P2 |
| FR-3.3 | The Meeting Minutes Service shall 更新時に updated_at を現在時刻で更新する | P2 |
| FR-3.4 | The Meeting Minutes Service shall 保存後「更新しました」メッセージを表示する | P2 |

---

### FR-4: バリデーション

**Objective:** As a システム, I want 入力値の妥当性を検証すること, so that データ品質を確保できる

#### Acceptance Criteria

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-4.1 | The Meeting Minutes Service shall フィールドタイプ（TEXT/TEXTAREA/NUMBER/DATE/FILE）に応じた入力検証を実行する | P1 |
| FR-4.2 | The Meeting Minutes Service shall DATE フィールドで無効な日付を拒否する | P1 |
| FR-4.3 | The Meeting Minutes Service shall FILE フィールドでサイズ制限（最大 10MB）を実装する | P2 |

---

## Non-Functional Requirements

| ID | 要件 | 優先度 |
|----|------|--------|
| NFR-1.1 | The Meeting Minutes Service shall フォーム表示レイテンシを 500ms 以下に維持する | P2 |
| NFR-1.2 | The Meeting Minutes Service shall 議事録登録・更新の成功率を 99.9% 以上とする | P2 |

---

## Out of Scope Details

- 議事録の削除機能（Phase 3 以降で検討）
- 議事録の承認フロー
- 議事録の配信・メール通知
- 議事録の検索・フィルタ
- 複数議事録の比較表示
