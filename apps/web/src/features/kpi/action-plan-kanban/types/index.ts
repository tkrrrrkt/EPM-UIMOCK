/**
 * Type definitions for KPI Action Plan Kanban feature
 *
 * Re-exported from @epm/contracts/bff/action-plan-kanban (SSoT)
 */

export type {
  // Kanban Board
  BffKanbanBoard,
  BffKanbanColumn,
  BffTaskCard,
  BffTaskLabelBrief,
  BffAssigneeBrief,
  // Task Detail
  BffTaskDetail,
  BffChecklistItem,
  BffTaskComment,
  // Status Management
  BffTaskStatus,
  BffListStatusesResponse,
  // Label Management
  BffTaskLabel,
  BffListLabelsResponse,
  // Request DTOs
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
  BffReorderStatusesRequest,
  BffCreateLabelRequest,
  BffUpdateLabelRequest,
  // Client Interface
  BffClient,
} from "@epm/contracts/bff/action-plan-kanban"

export { ActionPlanKanbanErrorCode } from "@epm/contracts/bff/action-plan-kanban"
