/**
 * KPI Action Plan Kanban - BFF Client Interface
 *
 * design.md準拠: BFF Endpoints
 */

import type {
  BffKanbanBoard,
  BffTaskDetail,
  BffTaskStatus,
  BffTaskLabel,
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
  BffCreateStatusRequest,
  BffUpdateStatusRequest,
  BffCreateLabelRequest,
  BffUpdateLabelRequest,
  BffSelectableEmployee,
  BffChecklistItem,
  BffTaskComment,
} from '../lib/types'

export interface BffClient {
  // === カンバンボード ===

  /**
   * カンバンボード取得
   * GET /api/bff/action-plan/kanban/:planId
   */
  getKanbanBoard(planId: string): Promise<BffKanbanBoard>

  // === タスク CRUD ===

  /**
   * タスク詳細取得
   * GET /api/bff/action-plan/kanban/tasks/:id
   */
  getTaskDetail(taskId: string): Promise<BffTaskDetail>

  /**
   * タスク作成
   * POST /api/bff/action-plan/kanban/tasks
   */
  createTask(request: BffCreateTaskRequest): Promise<BffTaskDetail>

  /**
   * タスク更新
   * PATCH /api/bff/action-plan/kanban/tasks/:id
   */
  updateTask(taskId: string, request: BffUpdateTaskRequest): Promise<BffTaskDetail>

  /**
   * タスク削除
   * DELETE /api/bff/action-plan/kanban/tasks/:id
   */
  deleteTask(taskId: string): Promise<void>

  /**
   * ステータス変更
   * PATCH /api/bff/action-plan/kanban/tasks/:id/status
   */
  updateTaskStatus(taskId: string, request: BffUpdateTaskStatusRequest): Promise<void>

  /**
   * 並び順変更
   * PATCH /api/bff/action-plan/kanban/tasks/reorder
   */
  reorderTasks(request: BffReorderTasksRequest): Promise<void>

  // === チェックリスト ===

  /**
   * チェック項目追加
   * POST /api/bff/action-plan/kanban/tasks/:id/checklist
   */
  createChecklistItem(taskId: string, request: BffCreateChecklistRequest): Promise<BffChecklistItem>

  /**
   * チェック項目更新
   * PATCH /api/bff/action-plan/kanban/checklist/:id
   */
  updateChecklistItem(itemId: string, request: BffUpdateChecklistRequest): Promise<BffChecklistItem>

  /**
   * チェック項目削除
   * DELETE /api/bff/action-plan/kanban/checklist/:id
   */
  deleteChecklistItem(itemId: string): Promise<void>

  // === コメント ===

  /**
   * コメント追加
   * POST /api/bff/action-plan/kanban/tasks/:id/comments
   */
  createComment(taskId: string, request: BffCreateCommentRequest): Promise<BffTaskComment>

  /**
   * コメント編集
   * PATCH /api/bff/action-plan/kanban/comments/:id
   */
  updateComment(commentId: string, request: BffUpdateCommentRequest): Promise<BffTaskComment>

  /**
   * コメント削除
   * DELETE /api/bff/action-plan/kanban/comments/:id
   */
  deleteComment(commentId: string): Promise<void>

  // === ラベル付与 ===

  /**
   * ラベル付与
   * POST /api/bff/action-plan/kanban/tasks/:id/labels
   */
  addLabel(taskId: string, request: BffAddLabelRequest): Promise<void>

  /**
   * ラベル解除
   * DELETE /api/bff/action-plan/kanban/tasks/:id/labels/:labelId
   */
  removeLabel(taskId: string, labelId: string): Promise<void>

  // === 担当者 ===

  /**
   * 担当者追加
   * POST /api/bff/action-plan/kanban/tasks/:id/assignees
   */
  addAssignee(taskId: string, request: BffAddAssigneeRequest): Promise<void>

  /**
   * 担当者解除
   * DELETE /api/bff/action-plan/kanban/tasks/:id/assignees/:employeeId
   */
  removeAssignee(taskId: string, employeeId: string): Promise<void>

  // === ステータス管理（アクションプラン単位）===

  /**
   * ステータス一覧取得
   * GET /api/bff/action-plan/kanban/:planId/statuses
   */
  getStatuses(planId: string): Promise<BffTaskStatus[]>

  /**
   * ステータス作成
   * POST /api/bff/action-plan/kanban/:planId/statuses
   */
  createStatus(planId: string, request: BffCreateStatusRequest): Promise<BffTaskStatus>

  /**
   * ステータス更新
   * PATCH /api/bff/action-plan/kanban/statuses/:id
   */
  updateStatus(statusId: string, request: BffUpdateStatusRequest): Promise<BffTaskStatus>

  /**
   * ステータス削除
   * DELETE /api/bff/action-plan/kanban/statuses/:id
   */
  deleteStatus(statusId: string): Promise<void>

  // === ラベル管理（アクションプラン単位）===

  /**
   * ラベル一覧取得
   * GET /api/bff/action-plan/kanban/:planId/labels
   */
  getLabels(planId: string): Promise<BffTaskLabel[]>

  /**
   * ラベル作成
   * POST /api/bff/action-plan/kanban/:planId/labels
   */
  createLabel(planId: string, request: BffCreateLabelRequest): Promise<BffTaskLabel>

  /**
   * ラベル更新
   * PATCH /api/bff/action-plan/kanban/labels/:id
   */
  updateLabel(labelId: string, request: BffUpdateLabelRequest): Promise<BffTaskLabel>

  /**
   * ラベル削除
   * DELETE /api/bff/action-plan/kanban/labels/:id
   */
  deleteLabel(labelId: string): Promise<void>

  // === 選択可能データ ===

  /**
   * 選択可能社員一覧
   */
  getSelectableEmployees(): Promise<BffSelectableEmployee[]>
}
