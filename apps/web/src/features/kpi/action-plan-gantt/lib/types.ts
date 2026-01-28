/**
 * KPI Action Plan Gantt - Type Definitions
 *
 * design.md準拠: BFF DTO形状
 * Syncfusion Gantt対応のデータ構造
 */

// === ガントチャートデータ ===

export interface BffGanttData {
  planId: string
  planName: string
  wbsItems: BffGanttWbs[]
  links: BffGanttLink[]
}

export interface BffGanttWbs {
  id: string
  parentWbsId: string | null
  wbsCode: string
  wbsName: string
  description: string | null
  assigneeDepartmentStableId: string | null
  assigneeDepartmentName: string | null
  assigneeEmployeeId: string | null
  assigneeEmployeeName: string | null
  startDate: string | null
  dueDate: string | null
  actualStartDate: string | null
  actualEndDate: string | null
  progressRate: number | null
  isMilestone: boolean
  sortOrder: number
  taskCount: number
  updatedAt: string
}

export interface BffGanttLink {
  id: string
  sourceWbsId: string
  targetWbsId: string
  type: 'finish_to_start'
}

// === Request DTOs ===

export interface BffCreateWbsRequest {
  actionPlanId: string
  parentWbsId?: string
  wbsCode?: string // 空の場合自動採番
  wbsName: string
  description?: string
  assigneeDepartmentStableId?: string
  assigneeEmployeeId?: string
  startDate?: string
  dueDate?: string
  isMilestone?: boolean
}

export interface BffUpdateWbsRequest {
  wbsCode?: string
  wbsName?: string
  description?: string
  assigneeDepartmentStableId?: string
  assigneeEmployeeId?: string
  startDate?: string | null
  dueDate?: string | null
  isMilestone?: boolean
  updatedAt: string
}

export interface BffUpdateWbsScheduleRequest {
  startDate: string | null
  dueDate: string | null
}

export interface BffUpdateWbsProgressRequest {
  progressRate: number
}

export interface BffUpdateWbsDependencyRequest {
  predecessorWbsId: string | null
}

// === Response DTOs ===

export interface BffWbsResponse {
  wbs: BffGanttWbs
}

export interface BffNextWbsCodeResponse {
  nextCode: string
}

// === 選択可能オプション ===

export interface BffSelectableDepartment {
  stableId: string
  name: string
}

export interface BffSelectableEmployee {
  id: string
  name: string
  departmentName?: string
}

// === Syncfusion Gantt用データ構造 ===

/**
 * Syncfusion Gantt DataSource用のデータ
 */
export interface GanttTaskData {
  TaskId: string
  TaskName: string
  StartDate: Date | null
  EndDate: Date | null
  Duration: number | null
  Progress: number
  ParentId: string | null
  Predecessor: string | null // "1FS,2FS" 形式
  isMilestone: boolean
  // カスタムフィールド
  WbsCode: string
  Description: string | null
  AssigneeName: string | null
  DepartmentName: string | null
  TaskCount: number
  UpdatedAt: string
}

/**
 * BffGanttWbs → GanttTaskData 変換
 */
export function toGanttTaskData(
  wbs: BffGanttWbs,
  links: BffGanttLink[]
): GanttTaskData {
  // 依存関係を文字列に変換
  const predecessors = links
    .filter((link) => link.targetWbsId === wbs.id)
    .map((link) => link.sourceWbsId + 'FS')
    .join(',')

  // 期間計算
  let duration: number | null = null
  if (wbs.startDate && wbs.dueDate) {
    const start = new Date(wbs.startDate)
    const end = new Date(wbs.dueDate)
    duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  }

  return {
    TaskId: wbs.id,
    TaskName: wbs.wbsName,
    StartDate: wbs.startDate ? new Date(wbs.startDate) : null,
    EndDate: wbs.dueDate ? new Date(wbs.dueDate) : null,
    Duration: duration,
    Progress: wbs.progressRate ?? 0,
    ParentId: wbs.parentWbsId,
    Predecessor: predecessors || null,
    isMilestone: wbs.isMilestone,
    WbsCode: wbs.wbsCode,
    Description: wbs.description,
    AssigneeName: wbs.assigneeEmployeeName,
    DepartmentName: wbs.assigneeDepartmentName,
    TaskCount: wbs.taskCount,
    UpdatedAt: wbs.updatedAt,
  }
}

/**
 * BffGanttData → GanttTaskData[] 変換
 */
export function toGanttDataSource(data: BffGanttData): GanttTaskData[] {
  return data.wbsItems.map((wbs) => toGanttTaskData(wbs, data.links))
}
