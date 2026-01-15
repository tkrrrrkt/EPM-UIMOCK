# v0 Prompt: action-plan-kanban

## 1. Design System（冒頭に必ず記載）

```
Use the EPM Design System from: https://epm-registry-6xtkaywr0-tkoizumi-hira-tjps-projects.vercel.app

Theme: Deep Teal & Royal Indigo
- Primary: oklch(0.52 0.13 195) - Deep Teal
- Secondary: oklch(0.48 0.15 280) - Royal Indigo
```

---

## 2. Context（簡潔に）

```markdown
You are generating UI for an EPM SaaS.

**Boundary Rules (MUST FOLLOW):**
- UI → BFF only（Domain API 直接呼び出し禁止）
- Use `packages/contracts/src/bff` DTOs only（api 参照禁止）
- Components from `@/shared/ui` only（base UI を feature 内に作成禁止）
- No layout.tsx（AppShell 内で描画）
- No raw colors（semantic tokens のみ: bg-primary, text-foreground, etc.）
- Start with MockBffClient → later switch to HttpBffClient
```

---

## 3. Feature

```markdown
**kpi/action-plan-kanban**: アクションプラン配下のタスクをカンバンボード形式で管理

### 主要ユースケース
1. カンバンボード表示（ステータス列ごとにタスクカードを表示）
2. タスクのドラッグ&ドロップ（ステータス変更・並び順変更）
3. タスク新規作成
4. タスク詳細編集（モーダル）
5. チェックリスト管理
6. コメント機能
7. ラベル付与（複数選択）
8. 複数担当者アサイン
9. タスク削除
10. フィルタリング（WBS/担当者/期限/ラベル）
11. **ステータス編集（カンバン画面内で直接編集）** ← NEW
12. **ラベル編集（カンバン画面内で直接編集）** ← NEW

> **重要**: ステータス・ラベルはアクションプラン単位で管理（Trelloのボード単位ラベルに準拠）
```

---

## 4. Screens

```markdown
### Screen 1: カンバンボード画面
- **Purpose**: タスクをステータス列ごとにカード形式で表示・管理
- **Layout**:
  - ヘッダー（アクションプラン名、フィルタボタン、タスク追加ボタン）
  - フィルタパネル（折りたたみ式）
  - カンバン列（ステータスごと、左から右に sort_order 順）
  - 各列にタスクカード（縦並び）
- **Interactions**:
  - タスクカードをドラッグ&ドロップ（列間移動 = ステータス変更）
  - 同一列内でドラッグ&ドロップ（並び順変更）
  - タスクカードクリック → 詳細モーダル表示
  - 列の「+」ボタン → タスク作成入力欄表示

### Screen 2: タスクカード
- **Purpose**: タスクの概要を表示
- **Content**:
  - ラベル（色付きバッジ、複数）
  - タスク名
  - チェックリスト進捗（例: ✓ 2/5）
  - 担当者アイコン（複数、アバター）
  - 期限（期限切れの場合は赤）
- **Interactions**:
  - クリック → 詳細モーダル
  - ドラッグ → 移動

### Screen 3: タスク詳細モーダル
- **Purpose**: タスクの詳細情報を編集
- **Trigger**: タスクカードクリック
- **Layout**:
  - 左側: メイン情報
    - タスク名（インライン編集）
    - 説明（textarea、インライン編集）
  - 右側: サイドパネル
    - ステータス表示
    - ラベル（選択/解除）
    - 担当者（選択/解除）
    - 期限（日付選択）
  - 下部:
    - チェックリストセクション（追加/編集/削除/完了切替）
    - コメントセクション（追加/編集/削除）
- **Actions**: 閉じる / 削除ボタン
- **Behavior**: 各フィールド変更時に即時保存

### Screen 4: タスク作成インライン入力
- **Purpose**: 新しいタスクをクイック作成
- **Trigger**: 列の「+ タスクを追加」ボタン
- **Form Fields**:
  - タスク名* (required, text)
- **Actions**: Enter で作成 / Esc でキャンセル

### Screen 5: フィルタパネル
- **Purpose**: タスクを絞り込み
- **Trigger**: フィルタボタン
- **Filters**:
  - WBS項目（select）
  - 担当者（multi-select）
  - 期限（今週/今月/期限切れ/すべて）
  - ラベル（multi-select）
- **Actions**: 適用 / クリア

### Screen 6: 削除確認ダイアログ
- **Purpose**: タスク削除前の確認
- **Trigger**: 詳細モーダルの削除ボタン
- **Content**: 「このタスクを削除しますか？関連するチェックリスト・コメントも削除されます。」
- **Actions**: 削除 / キャンセル

### Screen 7: ステータス編集ポップオーバー（NEW - Trello風）
- **Purpose**: カンバン列（ステータス）の設定を編集
- **Trigger**: 列ヘッダーの「⋯」ボタン
- **Layout**:
  - ステータス名（インライン編集）
  - カラーピッカー（プリセット8色から選択）
  - 並び順変更（上下矢印）
  - 削除ボタン（タスクがない場合のみ有効）
  - 新規ステータス追加ボタン
- **Interactions**:
  - ステータス名編集 → blur/Enter で保存
  - カラー選択 → 即時保存
  - 削除 → 確認ダイアログ後に削除
- **Constraints**:
  - デフォルトステータス（isDefault=true）は削除不可
  - 完了ステータス（isCompleted=true）は1つ以上必須

### Screen 8: ラベル編集ポップオーバー（NEW - Trello風）
- **Purpose**: このアクションプラン専用のラベルを管理
- **Trigger**: タスク詳細モーダルのラベルセクション「編集」ボタン
- **Layout**:
  - ラベル一覧（名前 + カラー + 編集/削除ボタン）
  - 新規ラベル追加フォーム
- **Interactions**:
  - ラベル名編集 → インライン編集
  - カラー選択 → カラーピッカーポップオーバー
  - 削除 → 使用中タスクがある場合は警告表示
- **新規追加フォーム**:
  - ラベル名*（required）
  - カラー選択（プリセット8色）
  - 追加ボタン
```

---

## 5. BFF Contract（design.md からコピー）

```markdown
### Endpoints

| Method | Endpoint | Purpose | Request DTO | Response DTO |
|--------|----------|---------|-------------|--------------|
| GET | /api/bff/action-plan/kanban/:planId | カンバンボード取得 | - | BffKanbanBoard |
| POST | /api/bff/action-plan/kanban/tasks | タスク作成 | BffCreateTaskRequest | BffTaskDetail |
| PATCH | /api/bff/action-plan/kanban/tasks/:id | タスク更新 | BffUpdateTaskRequest | BffTaskDetail |
| PATCH | /api/bff/action-plan/kanban/tasks/:id/status | ステータス変更 | BffUpdateTaskStatusRequest | void |
| PATCH | /api/bff/action-plan/kanban/tasks/reorder | 並び順変更 | BffReorderTasksRequest | void |
| DELETE | /api/bff/action-plan/kanban/tasks/:id | タスク削除 | - | void |
| GET | /api/bff/action-plan/kanban/tasks/:id | タスク詳細取得 | - | BffTaskDetail |
| POST | /api/bff/action-plan/kanban/tasks/:id/checklist | チェック項目追加 | BffCreateChecklistRequest | BffChecklistItem |
| PATCH | /api/bff/action-plan/kanban/checklist/:id | チェック項目更新 | BffUpdateChecklistRequest | BffChecklistItem |
| DELETE | /api/bff/action-plan/kanban/checklist/:id | チェック項目削除 | - | void |
| POST | /api/bff/action-plan/kanban/tasks/:id/comments | コメント追加 | BffCreateCommentRequest | BffTaskComment |
| PATCH | /api/bff/action-plan/kanban/comments/:id | コメント編集 | BffUpdateCommentRequest | BffTaskComment |
| DELETE | /api/bff/action-plan/kanban/comments/:id | コメント削除 | - | void |
| POST | /api/bff/action-plan/kanban/tasks/:id/labels | ラベル付与 | BffAddLabelRequest | void |
| DELETE | /api/bff/action-plan/kanban/tasks/:id/labels/:labelId | ラベル解除 | - | void |
| POST | /api/bff/action-plan/kanban/tasks/:id/assignees | 担当者追加 | BffAddAssigneeRequest | void |
| DELETE | /api/bff/action-plan/kanban/tasks/:id/assignees/:employeeId | 担当者解除 | - | void |
| **ステータス管理（NEW - アクションプラン単位）** ||||
| GET | /api/bff/action-plan/kanban/:planId/statuses | ステータス一覧取得 | - | BffTaskStatus[] |
| POST | /api/bff/action-plan/kanban/:planId/statuses | ステータス作成 | BffCreateStatusRequest | BffTaskStatus |
| PATCH | /api/bff/action-plan/kanban/statuses/:id | ステータス更新 | BffUpdateStatusRequest | BffTaskStatus |
| DELETE | /api/bff/action-plan/kanban/statuses/:id | ステータス削除 | - | void |
| PATCH | /api/bff/action-plan/kanban/:planId/statuses/reorder | ステータス並び替え | BffReorderStatusesRequest | void |
| **ラベル管理（NEW - アクションプラン単位）** ||||
| GET | /api/bff/action-plan/kanban/:planId/labels | ラベル一覧取得 | - | BffTaskLabel[] |
| POST | /api/bff/action-plan/kanban/:planId/labels | ラベル作成 | BffCreateLabelRequest | BffTaskLabel |
| PATCH | /api/bff/action-plan/kanban/labels/:id | ラベル更新 | BffUpdateLabelRequest | BffTaskLabel |
| DELETE | /api/bff/action-plan/kanban/labels/:id | ラベル削除 | - | void |

### DTOs

```typescript
// === カンバンボード ===
export interface BffKanbanBoard {
  planId: string;
  planName: string;
  columns: BffKanbanColumn[];
}

export interface BffKanbanColumn {
  statusId: string;
  statusCode: string;
  statusName: string;
  colorCode: string | null;
  tasks: BffTaskCard[];
}

export interface BffTaskCard {
  id: string;
  taskName: string;
  dueDate: string | null;
  sortOrder: number;
  labels: BffTaskLabelBrief[];
  assignees: BffAssigneeBrief[];
  checklistProgress: { completed: number; total: number };
  updatedAt: string;
}

export interface BffTaskLabelBrief {
  id: string;
  labelName: string;
  colorCode: string;
}

export interface BffAssigneeBrief {
  employeeId: string;
  employeeName: string;
}

// === タスク詳細 ===
export interface BffTaskDetail {
  id: string;
  taskName: string;
  description: string | null;
  statusId: string;
  dueDate: string | null;
  labels: BffTaskLabelBrief[];
  assignees: BffAssigneeBrief[];
  checklist: BffChecklistItem[];
  comments: BffTaskComment[];
  updatedAt: string;
}

export interface BffChecklistItem {
  id: string;
  itemName: string;
  isCompleted: boolean;
  sortOrder: number;
}

export interface BffTaskComment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  isOwner: boolean;
}

// === Request DTOs ===
export interface BffCreateTaskRequest {
  wbsItemId: string;
  taskName: string;
  statusId?: string;
}

export interface BffUpdateTaskRequest {
  taskName?: string;
  description?: string;
  dueDate?: string;
  updatedAt: string;
}

export interface BffUpdateTaskStatusRequest {
  statusId: string;
  sortOrder: number;
}

export interface BffReorderTasksRequest {
  orders: { id: string; sortOrder: number }[];
}

export interface BffCreateChecklistRequest {
  itemName: string;
}

export interface BffUpdateChecklistRequest {
  itemName?: string;
  isCompleted?: boolean;
}

export interface BffCreateCommentRequest {
  content: string;
}

export interface BffUpdateCommentRequest {
  content: string;
}

export interface BffAddLabelRequest {
  labelId: string;
}

export interface BffAddAssigneeRequest {
  employeeId: string;
}

// === ステータス管理（NEW - アクションプラン単位）===
export interface BffTaskStatus {
  id: string;
  statusCode: string;
  statusName: string;
  colorCode: string | null;
  sortOrder: number;
  isDefault: boolean;
  isCompleted: boolean;
  updatedAt: string;
}

export interface BffCreateStatusRequest {
  statusCode: string;
  statusName: string;
  colorCode?: string;
}

export interface BffUpdateStatusRequest {
  statusName?: string;
  colorCode?: string;
  isDefault?: boolean;
  isCompleted?: boolean;
  updatedAt: string;
}

export interface BffReorderStatusesRequest {
  orders: { id: string; sortOrder: number }[];
}

// === ラベル管理（NEW - アクションプラン単位）===
export interface BffTaskLabel {
  id: string;
  labelCode: string;
  labelName: string;
  colorCode: string;
  sortOrder: number;
  updatedAt: string;
}

export interface BffCreateLabelRequest {
  labelCode: string;
  labelName: string;
  colorCode: string;
}

export interface BffUpdateLabelRequest {
  labelName?: string;
  colorCode?: string;
  updatedAt: string;
}
```

### Errors → UI Messages

| Error Code | UI Message |
|------------|-----------|
| TASK_NOT_FOUND | 「タスクが見つかりません」 |
| CHECKLIST_ITEM_NOT_FOUND | 「チェック項目が見つかりません」 |
| COMMENT_NOT_FOUND | 「コメントが見つかりません」 |
| COMMENT_NOT_OWNER | 「自分のコメントのみ編集・削除できます」 |
| OPTIMISTIC_LOCK_ERROR | 「他のユーザーが更新しました。画面を更新してください」 |
| FORBIDDEN | 「この操作を行う権限がありません」 |
| **ステータス管理（NEW）** ||
| STATUS_NOT_FOUND | 「ステータスが見つかりません」 |
| STATUS_CODE_DUPLICATE | 「同じコードのステータスが既に存在します」 |
| STATUS_HAS_TASKS | 「タスクが存在するステータスは削除できません」 |
| STATUS_IS_DEFAULT | 「デフォルトステータスは削除できません」 |
| STATUS_COMPLETED_REQUIRED | 「完了ステータスは最低1つ必要です」 |
| **ラベル管理（NEW）** ||
| LABEL_NOT_FOUND | 「ラベルが見つかりません」 |
| LABEL_CODE_DUPLICATE | 「同じコードのラベルが既に存在します」 |

### DTO Import（MANDATORY）

```typescript
import type {
  BffKanbanBoard,
  BffKanbanColumn,
  BffTaskCard,
  BffTaskLabelBrief,
  BffAssigneeBrief,
  BffTaskDetail,
  BffChecklistItem,
  BffTaskComment,
  BffCreateTaskRequest,
  BffUpdateTaskRequest,
  BffUpdateTaskStatusRequest,
  BffReorderTasksRequest,
  BffCreateChecklistRequest,
  BffUpdateChecklistRequest,
  BffCreateCommentRequest,
  BffUpdateCommentRequest,
  BffAddLabelRequest,
  BffAddAssigneeRequest,
  // ステータス・ラベル管理（NEW）
  BffTaskStatus,
  BffCreateStatusRequest,
  BffUpdateStatusRequest,
  BffReorderStatusesRequest,
  BffTaskLabel,
  BffCreateLabelRequest,
  BffUpdateLabelRequest,
} from "@epm/contracts/bff/action-plan-kanban";
```
```

---

## 6. UI Components

```markdown
### Tier 1（使用必須 - @/shared/ui から）
- Button, Input, Textarea, Checkbox
- Card, Dialog, Alert, Badge, Avatar
- Toast/Sonner, Popover

### Tier 2（必要時のみ）
- Calendar (日付選択)
- Select (フィルタ用)

### External Library（MUST USE）
- @dnd-kit/core - ドラッグ&ドロップ

### Feature-specific Components（v0 が生成）
- KanbanBoardPage.tsx（カンバンボード親コンポーネント）
- KanbanColumn.tsx（ステータス列）
- TaskCard.tsx（タスクカード）
- TaskDetailModal.tsx（タスク詳細モーダル）
- TaskCreateInput.tsx（インラインタスク作成）
- ChecklistSection.tsx（チェックリストセクション）
- CommentsSection.tsx（コメントセクション）
- LabelSelector.tsx（ラベル選択ポップオーバー）
- AssigneeSelector.tsx（担当者選択ポップオーバー）
- FilterPanel.tsx（フィルタパネル）
- DeleteConfirmDialog.tsx（削除確認）
- **StatusEditPopover.tsx（ステータス編集ポップオーバー - NEW）**
- **LabelEditPopover.tsx（ラベル編集ポップオーバー - NEW）**
- **ColorPicker.tsx（カラーピッカー - 8色プリセット - NEW）**
- api/BffClient.ts, MockBffClient.ts, HttpBffClient.ts
```

---

## 7. Mock Data

```markdown
### Sample Data（BFF Response 形状と一致必須）

```typescript
const mockLabels: BffTaskLabelBrief[] = [
  { id: "label-001", labelName: "重要", colorCode: "#EF4444" },
  { id: "label-002", labelName: "急ぎ", colorCode: "#F59E0B" },
  { id: "label-003", labelName: "確認待ち", colorCode: "#3B82F6" },
  { id: "label-004", labelName: "完了間近", colorCode: "#10B981" },
];

const mockAssignees: BffAssigneeBrief[] = [
  { employeeId: "emp-001", employeeName: "山田太郎" },
  { employeeId: "emp-002", employeeName: "佐藤花子" },
  { employeeId: "emp-003", employeeName: "鈴木一郎" },
];

const mockKanbanBoard: BffKanbanBoard = {
  planId: "plan-001",
  planName: "売上拡大施策",
  columns: [
    {
      statusId: "status-001",
      statusCode: "NOT_STARTED",
      statusName: "未着手",
      colorCode: "#6B7280",
      tasks: [
        {
          id: "task-001",
          taskName: "市場調査レポート作成",
          dueDate: "2026-02-15",
          sortOrder: 1,
          labels: [mockLabels[0]],
          assignees: [mockAssignees[0]],
          checklistProgress: { completed: 0, total: 3 },
          updatedAt: "2026-01-09T10:00:00.000Z",
        },
        {
          id: "task-002",
          taskName: "競合分析",
          dueDate: "2026-02-20",
          sortOrder: 2,
          labels: [],
          assignees: [mockAssignees[1]],
          checklistProgress: { completed: 0, total: 0 },
          updatedAt: "2026-01-09T10:00:00.000Z",
        },
      ],
    },
    {
      statusId: "status-002",
      statusCode: "IN_PROGRESS",
      statusName: "進行中",
      colorCode: "#3B82F6",
      tasks: [
        {
          id: "task-003",
          taskName: "営業資料作成",
          dueDate: "2026-01-31",
          sortOrder: 1,
          labels: [mockLabels[1], mockLabels[0]],
          assignees: [mockAssignees[0], mockAssignees[2]],
          checklistProgress: { completed: 2, total: 5 },
          updatedAt: "2026-01-09T10:00:00.000Z",
        },
      ],
    },
    {
      statusId: "status-003",
      statusCode: "REVIEW",
      statusName: "レビュー中",
      colorCode: "#F59E0B",
      tasks: [
        {
          id: "task-004",
          taskName: "提案書レビュー",
          dueDate: "2026-01-25",
          sortOrder: 1,
          labels: [mockLabels[2]],
          assignees: [mockAssignees[1]],
          checklistProgress: { completed: 3, total: 3 },
          updatedAt: "2026-01-09T10:00:00.000Z",
        },
      ],
    },
    {
      statusId: "status-004",
      statusCode: "COMPLETED",
      statusName: "完了",
      colorCode: "#10B981",
      tasks: [
        {
          id: "task-005",
          taskName: "キックオフミーティング",
          dueDate: "2026-01-10",
          sortOrder: 1,
          labels: [mockLabels[3]],
          assignees: [mockAssignees[0], mockAssignees[1], mockAssignees[2]],
          checklistProgress: { completed: 4, total: 4 },
          updatedAt: "2026-01-09T10:00:00.000Z",
        },
      ],
    },
  ],
};

const mockTaskDetail: BffTaskDetail = {
  id: "task-003",
  taskName: "営業資料作成",
  description: "新規顧客向けの営業資料を作成する。製品概要、価格表、導入事例を含める。",
  statusId: "status-002",
  dueDate: "2026-01-31",
  labels: [mockLabels[1], mockLabels[0]],
  assignees: [mockAssignees[0], mockAssignees[2]],
  checklist: [
    { id: "check-001", itemName: "製品概要ページ作成", isCompleted: true, sortOrder: 1 },
    { id: "check-002", itemName: "価格表作成", isCompleted: true, sortOrder: 2 },
    { id: "check-003", itemName: "導入事例追加", isCompleted: false, sortOrder: 3 },
    { id: "check-004", itemName: "デザイン調整", isCompleted: false, sortOrder: 4 },
    { id: "check-005", itemName: "最終レビュー", isCompleted: false, sortOrder: 5 },
  ],
  comments: [
    {
      id: "comment-001",
      content: "製品概要は完成しました。確認お願いします。",
      authorId: "emp-001",
      authorName: "山田太郎",
      createdAt: "2026-01-08T14:30:00.000Z",
      isOwner: true,
    },
    {
      id: "comment-002",
      content: "確認しました。価格表の更新もお願いします。",
      authorId: "emp-003",
      authorName: "鈴木一郎",
      createdAt: "2026-01-08T16:00:00.000Z",
      isOwner: false,
    },
  ],
  updatedAt: "2026-01-09T10:00:00.000Z",
};
```

### ステータス・ラベル管理用モックデータ（NEW）

```typescript
// ステータス一覧（編集可能）
const mockStatuses: BffTaskStatus[] = [
  {
    id: "status-001",
    statusCode: "NOT_STARTED",
    statusName: "未着手",
    colorCode: "#6B7280",
    sortOrder: 1,
    isDefault: true,
    isCompleted: false,
    updatedAt: "2026-01-09T10:00:00.000Z",
  },
  {
    id: "status-002",
    statusCode: "IN_PROGRESS",
    statusName: "進行中",
    colorCode: "#3B82F6",
    sortOrder: 2,
    isDefault: false,
    isCompleted: false,
    updatedAt: "2026-01-09T10:00:00.000Z",
  },
  {
    id: "status-003",
    statusCode: "REVIEW",
    statusName: "レビュー中",
    colorCode: "#F59E0B",
    sortOrder: 3,
    isDefault: false,
    isCompleted: false,
    updatedAt: "2026-01-09T10:00:00.000Z",
  },
  {
    id: "status-004",
    statusCode: "COMPLETED",
    statusName: "完了",
    colorCode: "#10B981",
    sortOrder: 4,
    isDefault: false,
    isCompleted: true,
    updatedAt: "2026-01-09T10:00:00.000Z",
  },
];

// ラベル一覧（編集可能）
const mockFullLabels: BffTaskLabel[] = [
  {
    id: "label-001",
    labelCode: "IMPORTANT",
    labelName: "重要",
    colorCode: "#EF4444",
    sortOrder: 1,
    updatedAt: "2026-01-09T10:00:00.000Z",
  },
  {
    id: "label-002",
    labelCode: "URGENT",
    labelName: "急ぎ",
    colorCode: "#F59E0B",
    sortOrder: 2,
    updatedAt: "2026-01-09T10:00:00.000Z",
  },
  {
    id: "label-003",
    labelCode: "WAITING",
    labelName: "確認待ち",
    colorCode: "#3B82F6",
    sortOrder: 3,
    updatedAt: "2026-01-09T10:00:00.000Z",
  },
  {
    id: "label-004",
    labelCode: "ALMOST_DONE",
    labelName: "完了間近",
    colorCode: "#10B981",
    sortOrder: 4,
    updatedAt: "2026-01-09T10:00:00.000Z",
  },
];

// カラーピッカー用プリセット（8色）
const colorPresets = [
  "#6B7280", // gray
  "#EF4444", // red
  "#F59E0B", // amber
  "#10B981", // emerald
  "#3B82F6", // blue
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#06B6D4", // cyan
];
```

### States to Cover
- 通常状態（タスクあり）
- 空の列（タスクなし）
- ドラッグ中状態
- ローディング状態
- エラー状態
- フィルタ適用状態
- **ステータス編集ポップオーバー表示状態（NEW）**
- **ラベル編集ポップオーバー表示状態（NEW）**
```

---

## 8. Output Structure（二重出力：プレビュー用 + 移植用）

```markdown
### 重要：2つの出力先に同期して生成すること（MANDATORY）

v0 は以下の **2箇所に同じ内容を出力** すること：

---

### 1. プレビュー用（v0 内で動作確認）

v0 プロジェクトの `app/` に配置（プレビュー・調整用）:

```
app/kpi/action-plan-kanban/
├── page.tsx
└── components/
    ├── KanbanBoardPage.tsx
    ├── KanbanColumn.tsx
    ├── TaskCard.tsx
    ├── TaskDetailModal.tsx
    ├── TaskCreateInput.tsx
    ├── ChecklistSection.tsx
    ├── CommentsSection.tsx
    ├── LabelSelector.tsx
    ├── AssigneeSelector.tsx
    ├── FilterPanel.tsx
    ├── DeleteConfirmDialog.tsx
    ├── StatusEditPopover.tsx    ← NEW
    ├── LabelEditPopover.tsx     ← NEW
    ├── ColorPicker.tsx          ← NEW
    └── api/
        ├── BffClient.ts
        ├── MockBffClient.ts
        └── HttpBffClient.ts
```

---

### 2. 移植用モジュール（DL して本番環境へ移植）

v0 プロジェクトの `_v0_drop/` に配置（移植用、プレビュー用と同期）:

```
_v0_drop/kpi/action-plan-kanban/src/
├── app/
│   └── page.tsx
├── components/
│   ├── KanbanBoardPage.tsx
│   ├── KanbanColumn.tsx
│   ├── TaskCard.tsx
│   ├── TaskDetailModal.tsx
│   ├── TaskCreateInput.tsx
│   ├── ChecklistSection.tsx
│   ├── CommentsSection.tsx
│   ├── LabelSelector.tsx
│   ├── AssigneeSelector.tsx
│   ├── FilterPanel.tsx
│   ├── DeleteConfirmDialog.tsx
│   ├── StatusEditPopover.tsx   # NEW - ステータス編集
│   ├── LabelEditPopover.tsx    # NEW - ラベル編集
│   ├── ColorPicker.tsx         # NEW - カラーピッカー（8色プリセット）
│   └── index.ts                # barrel export
├── api/
│   ├── BffClient.ts            # interface
│   ├── MockBffClient.ts        # mock implementation
│   ├── HttpBffClient.ts        # HTTP implementation
│   └── index.ts                # barrel export + factory
├── lib/
│   └── error-messages.ts       # エラーコード → UIメッセージ
├── types/
│   └── index.ts                # 型定義（contracts からの re-export）
└── OUTPUT.md                   # 移植手順・チェックリスト
```

---

### 同期ルール（MUST）

1. プレビュー用と移植用のコンポーネント実装は **完全に同一**
2. 移植用は以下を追加：
   - `index.ts`（barrel export）
   - `lib/error-messages.ts`（エラーマッピング）
   - `OUTPUT.md`（移植手順）
3. 移植用のインポートパスは本番環境を想定：
   - `@/shared/ui` → `@/shared/ui`（そのまま）
   - `@epm/contracts/bff/action-plan-kanban` → `@epm/contracts/bff/action-plan-kanban`（そのまま）

---

### OUTPUT.md（必須生成 - _v0_drop 内）

v0 は `_v0_drop/kpi/action-plan-kanban/src/OUTPUT.md` に以下を含めること:

1. **Generated Files Tree** - 生成したファイル一覧
2. **Imports Used** - @/shared/ui から使用したコンポーネント、DTO インポート
3. **Missing Components (TODO)** - 不足している shared component があれば記載
4. **Migration Steps** - 移植手順:
   - コピー先: `apps/web/src/features/kpi/action-plan-kanban/ui/`
   - インポートパス変更（必要な場合）
   - page.tsx 接続方法
5. **Compliance Checklist**:
   - [ ] Components from @/shared/ui only
   - [ ] DTOs from @epm/contracts/bff only
   - [ ] No raw colors (bg-[#...]) - semantic tokens only
   - [ ] No layout.tsx
   - [ ] No base UI recreated in feature
   - [ ] MockBffClient returns DTO-shaped data
   - [ ] Error codes mapped to user messages
   - [ ] _v0_drop と app が同期している
```

---

## 9. 禁止事項（v0 への最終リマインダー）

```markdown
❌ PROHIBITED:
- `packages/contracts/src/api` からのインポート
- Domain API 直接呼び出し（/api/domain/...）
- fetch() を HttpBffClient 外で使用
- layout.tsx の生成
- base UI コンポーネント（button.tsx, input.tsx 等）の作成
- 生カラー（bg-[#14b8a6], bg-teal-500 等）
- 任意スペーシング（p-[16px], gap-[20px] 等）
- Sidebar/Header/Shell の独自作成

✅ REQUIRED:
- @/shared/ui からコンポーネント使用
- @epm/contracts/bff から DTO 使用
- semantic tokens（bg-primary, text-foreground, border-input 等）
- Tailwind scale（p-4, gap-4, rounded-lg 等）
- MockBffClient でモックデータ提供
- OUTPUT.md 生成
- @dnd-kit/core でドラッグ&ドロップ実装
```

---

## 10. 追加実装指示

```markdown
### ドラッグ&ドロップ実装（@dnd-kit/core）
- DndContext でボード全体をラップ
- useDraggable でタスクカードをドラッグ可能に
- useDroppable で列をドロップゾーンに
- ドラッグ中のタスクカードに影・透過のvisual feedback
- ドロップ時に即時保存（updateTaskStatus or reorderTasks API呼び出し）

### タスク詳細モーダル
- 各フィールドは即時保存（blur時またはEnter時）
- チェックリスト: チェックボックスクリックで即時更新
- コメント: 自分のコメントのみ編集・削除ボタン表示

### ラベル表示
- カード上では色付きの小さなバー（高さ4px程度）として表示
- モーダル内では色付きバッジとして表示

### 担当者表示
- カード上ではアバター（イニシャル）を重ねて表示（最大3名、+N表示）
- モーダル内ではリスト表示

### 期限表示
- 期限切れ: 赤字（text-destructive）
- 今週中: 黄色系
- それ以外: 通常色

### 権限制御
- epm.actionplan.create: タスク作成許可
- epm.actionplan.update: タスク編集・D&D許可
- epm.actionplan.delete: タスク削除許可
- Mock段階ではすべてtrue固定でOK

### ステータス編集（NEW - Trello風）
- 列ヘッダーに「⋯」メニューボタンを配置
- ポップオーバーでステータス設定を編集可能に
- ステータス名編集: インライン編集（blur/Enter で保存）
- カラー変更: ColorPicker（8色プリセット）で即時選択・保存
- 並び順: ドラッグ&ドロップまたは上下矢印で変更
- 新規追加: ポップオーバー内の「+ ステータス追加」ボタン
- 削除: タスクが0件の場合のみ有効、確認ダイアログ表示
- 制約表示:
  - isDefault=true → 「デフォルト」バッジ表示、削除ボタン無効
  - isCompleted=true → 「完了」バッジ表示、最後の1つは削除不可

### ラベル編集（NEW - Trello風）
- タスク詳細モーダルのラベルセクションに「ラベルを編集」リンク
- ポップオーバーでラベルマスタを管理
- ラベル一覧表示: 名前 + カラーバー + 編集/削除アイコン
- ラベル名編集: クリックでインライン編集モード
- カラー変更: ColorPicker（8色プリセット）
- 新規追加: 下部に追加フォーム（名前入力 + カラー選択）
- 削除: 使用中タスクがある場合は「N件のタスクで使用中」警告表示

### ColorPicker（共通コンポーネント）
- 8色プリセット（gray, red, amber, emerald, blue, violet, pink, cyan）
- グリッド配置（4x2）
- 現在選択中の色にチェックマーク表示
- ボーダーでホバー状態を表示
```
