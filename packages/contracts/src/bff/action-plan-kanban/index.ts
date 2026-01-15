/**
 * BFF Contracts for Action Plan Kanban Feature
 * SSoT for UI ↔ BFF communication
 *
 * @see .kiro/specs/kpi/action-plan-kanban/design.md
 */

// === Kanban Board ===
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
  tasks: BffTaskCard[]
}

export interface BffTaskCard {
  id: string
  taskName: string
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
}

// === Task Detail ===
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

// === Status Management (Action Plan level) ===
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

export interface BffListStatusesResponse {
  statuses: BffTaskStatus[]
}

// === Label Management (Action Plan level) ===
export interface BffTaskLabel {
  id: string
  labelCode: string
  labelName: string
  colorCode: string
  sortOrder: number
  updatedAt: string
}

export interface BffListLabelsResponse {
  labels: BffTaskLabel[]
}

// === Task Request DTOs ===
export interface BffCreateTaskRequest {
  wbsItemId: string
  taskName: string
  statusId?: string
}

export interface BffUpdateTaskRequest {
  taskName?: string
  description?: string
  dueDate?: string
  updatedAt: string
}

export interface BffUpdateTaskStatusRequest {
  statusId: string
  sortOrder: number
}

export interface BffReorderTasksRequest {
  orders: { id: string; sortOrder: number }[]
}

// === Checklist Request DTOs ===
export interface BffCreateChecklistRequest {
  itemName: string
}

export interface BffUpdateChecklistRequest {
  itemName?: string
  isCompleted?: boolean
}

// === Comment Request DTOs ===
export interface BffCreateCommentRequest {
  content: string
}

export interface BffUpdateCommentRequest {
  content: string
}

// === Label/Assignee Request DTOs ===
export interface BffAddLabelRequest {
  labelId: string
}

export interface BffAddAssigneeRequest {
  employeeId: string
}

// === Status Request DTOs ===
export interface BffCreateStatusRequest {
  statusCode: string
  statusName: string
  colorCode?: string
  isDefault?: boolean
  isCompleted?: boolean
}

export interface BffUpdateStatusRequest {
  statusCode?: string
  statusName?: string
  colorCode?: string
  isDefault?: boolean
  isCompleted?: boolean
  updatedAt: string
}

export interface BffReorderStatusesRequest {
  orders: { id: string; sortOrder: number }[]
}

// === Label Request DTOs ===
export interface BffCreateLabelRequest {
  labelCode: string
  labelName: string
  colorCode: string
}

export interface BffUpdateLabelRequest {
  labelName?: string
  colorCode?: string
  updatedAt: string
}

// === BFF Client Interface ===
export interface BffClient {
  // Kanban Board
  getKanbanBoard(planId: string): Promise<BffKanbanBoard>

  // Task CRUD
  getTaskDetail(id: string): Promise<BffTaskDetail>
  createTask(request: BffCreateTaskRequest): Promise<BffTaskDetail>
  updateTask(id: string, request: BffUpdateTaskRequest): Promise<BffTaskDetail>
  updateTaskStatus(id: string, request: BffUpdateTaskStatusRequest): Promise<void>
  reorderTasks(request: BffReorderTasksRequest): Promise<void>
  deleteTask(id: string): Promise<void>

  // Checklist
  addChecklistItem(taskId: string, request: BffCreateChecklistRequest): Promise<BffChecklistItem>
  updateChecklistItem(id: string, request: BffUpdateChecklistRequest): Promise<BffChecklistItem>
  deleteChecklistItem(id: string): Promise<void>

  // Comments
  addComment(taskId: string, request: BffCreateCommentRequest): Promise<BffTaskComment>
  updateComment(id: string, request: BffUpdateCommentRequest): Promise<BffTaskComment>
  deleteComment(id: string): Promise<void>

  // Labels
  addLabel(taskId: string, request: BffAddLabelRequest): Promise<void>
  removeLabel(taskId: string, labelId: string): Promise<void>

  // Assignees
  addAssignee(taskId: string, request: BffAddAssigneeRequest): Promise<void>
  removeAssignee(taskId: string, employeeId: string): Promise<void>

  // Status Management (Action Plan level)
  getStatuses(planId: string): Promise<BffListStatusesResponse>
  createStatus(planId: string, request: BffCreateStatusRequest): Promise<BffTaskStatus>
  updateStatus(id: string, request: BffUpdateStatusRequest): Promise<BffTaskStatus>
  deleteStatus(id: string): Promise<void>
  reorderStatuses(planId: string, request: BffReorderStatusesRequest): Promise<void>

  // Label Management (Action Plan level)
  getLabels(planId: string): Promise<BffListLabelsResponse>
  createLabel(planId: string, request: BffCreateLabelRequest): Promise<BffTaskLabel>
  updateLabel(id: string, request: BffUpdateLabelRequest): Promise<BffTaskLabel>
  deleteLabel(id: string): Promise<void>
}

// === Error Codes ===
export const ActionPlanKanbanErrorCode = {
  TASK_NOT_FOUND: "TASK_NOT_FOUND",
  STATUS_NOT_FOUND: "STATUS_NOT_FOUND",
  LABEL_NOT_FOUND: "LABEL_NOT_FOUND",
  CHECKLIST_NOT_FOUND: "CHECKLIST_NOT_FOUND",
  COMMENT_NOT_FOUND: "COMMENT_NOT_FOUND",
  STATUS_CODE_DUPLICATE: "STATUS_CODE_DUPLICATE",
  LABEL_CODE_DUPLICATE: "LABEL_CODE_DUPLICATE",
  CANNOT_DELETE_DEFAULT_STATUS: "CANNOT_DELETE_DEFAULT_STATUS",
  OPTIMISTIC_LOCK_ERROR: "OPTIMISTIC_LOCK_ERROR",
  FORBIDDEN: "FORBIDDEN",
} as const

export type ActionPlanKanbanErrorCode =
  (typeof ActionPlanKanbanErrorCode)[keyof typeof ActionPlanKanbanErrorCode]
