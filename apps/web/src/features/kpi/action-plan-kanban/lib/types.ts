/**
 * KPI Action Plan Kanban - Type Definitions
 *
 * design.md準拠: BFF DTO形状
 * Syncfusion Kanban対応のデータ構造
 */

// === カンバンボード ===

export interface BffKanbanBoard {
  planId: string
  planName: string
  columns: BffKanbanColumn[]
}

export interface BffKanbanColumn {
  statusId: string
  statusCode: string
  statusName: string
  colorCode: string | null
  sortOrder: number
  isDefault: boolean
  isCompleted: boolean
  tasks: BffTaskCard[]
}

export interface BffTaskCard {
  id: string
  taskName: string
  description: string | null
  statusId: string
  dueDate: string | null
  sortOrder: number
  labels: BffTaskLabelBrief[]
  assignees: BffAssigneeBrief[]
  checklistProgress: { completed: number; total: number }
  updatedAt: string
}

export interface BffTaskLabelBrief {
  id: string
  labelName: string
  colorCode: string
}

export interface BffAssigneeBrief {
  employeeId: string
  employeeName: string
  avatarUrl?: string
}

// === タスク詳細 ===

export interface BffTaskDetail {
  id: string
  taskName: string
  description: string | null
  statusId: string
  dueDate: string | null
  labels: BffTaskLabelBrief[]
  assignees: BffAssigneeBrief[]
  checklist: BffChecklistItem[]
  comments: BffTaskComment[]
  updatedAt: string
}

export interface BffChecklistItem {
  id: string
  itemName: string
  isCompleted: boolean
  sortOrder: number
}

export interface BffTaskComment {
  id: string
  content: string
  authorId: string
  authorName: string
  createdAt: string
  isOwner: boolean
}

// === ステータス管理 ===

export interface BffTaskStatus {
  id: string
  statusCode: string
  statusName: string
  colorCode: string | null
  sortOrder: number
  isDefault: boolean
  isCompleted: boolean
  updatedAt: string
}

// === ラベル管理 ===

export interface BffTaskLabel {
  id: string
  labelName: string
  colorCode: string
  sortOrder: number
  updatedAt: string
}

// === Request DTOs ===

export interface BffCreateTaskRequest {
  planId: string
  taskName: string
  statusId?: string
  description?: string
}

export interface BffUpdateTaskRequest {
  taskName?: string
  description?: string
  dueDate?: string | null
  updatedAt: string
}

export interface BffUpdateTaskStatusRequest {
  statusId: string
  sortOrder: number
}

export interface BffReorderTasksRequest {
  orders: { id: string; sortOrder: number }[]
}

export interface BffCreateChecklistRequest {
  itemName: string
}

export interface BffUpdateChecklistRequest {
  itemName?: string
  isCompleted?: boolean
}

export interface BffCreateCommentRequest {
  content: string
}

export interface BffUpdateCommentRequest {
  content: string
}

export interface BffAddLabelRequest {
  labelId: string
}

export interface BffAddAssigneeRequest {
  employeeId: string
}

export interface BffCreateStatusRequest {
  statusCode: string
  statusName: string
  colorCode?: string
  isDefault?: boolean
  isCompleted?: boolean
}

export interface BffUpdateStatusRequest {
  statusName?: string
  colorCode?: string
  isDefault?: boolean
  isCompleted?: boolean
  updatedAt: string
}

export interface BffCreateLabelRequest {
  labelName: string
  colorCode: string
}

export interface BffUpdateLabelRequest {
  labelName?: string
  colorCode?: string
  updatedAt: string
}

// === Syncfusion Kanban用データ構造 ===

/**
 * Syncfusion Kanban DataSource用のフラット化されたタスクデータ
 */
export interface KanbanTaskData {
  Id: string
  Title: string
  Status: string // statusCode
  Summary: string | null
  DueDate: string | null
  Priority: string
  Tags: string // カンマ区切りラベル名
  Assignee: string // カンマ区切り担当者名
  AssigneeIds: string[] // 担当者ID配列
  LabelIds: string[] // ラベルID配列
  ChecklistCompleted: number
  ChecklistTotal: number
  UpdatedAt: string
  SortOrder: number
  // カスタム表示用
  Labels: BffTaskLabelBrief[]
  Assignees: BffAssigneeBrief[]
}

/**
 * BffTaskCard → KanbanTaskData 変換
 */
export function toKanbanTaskData(task: BffTaskCard, statusCode: string): KanbanTaskData {
  return {
    Id: task.id,
    Title: task.taskName,
    Status: statusCode,
    Summary: task.description,
    DueDate: task.dueDate,
    Priority: getPriority(task),
    Tags: task.labels.map((l) => l.labelName).join(','),
    Assignee: task.assignees.map((a) => a.employeeName).join(','),
    AssigneeIds: task.assignees.map((a) => a.employeeId),
    LabelIds: task.labels.map((l) => l.id),
    ChecklistCompleted: task.checklistProgress.completed,
    ChecklistTotal: task.checklistProgress.total,
    UpdatedAt: task.updatedAt,
    SortOrder: task.sortOrder,
    Labels: task.labels,
    Assignees: task.assignees,
  }
}

/**
 * 優先度判定（期限ベース）
 */
function getPriority(task: BffTaskCard): string {
  if (!task.dueDate) return 'Normal'
  const due = new Date(task.dueDate)
  const today = new Date()
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return 'Critical' // 期限切れ
  if (diffDays <= 3) return 'High' // 3日以内
  if (diffDays <= 7) return 'Normal' // 1週間以内
  return 'Low'
}

// === 選択可能オプション ===

export interface BffSelectableEmployee {
  id: string
  name: string
  departmentName?: string
}

// === カラーピッカー用プリセット ===

export const COLOR_PRESETS = [
  '#6B7280', // gray
  '#EF4444', // red
  '#F59E0B', // amber
  '#10B981', // emerald
  '#3B82F6', // blue
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
] as const
