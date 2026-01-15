/**
 * Converts BFF data to DHTMLX Gantt format
 */

import type { BffGanttData, BffGanttWbs, BffGanttLink, DhtmlxTask, DhtmlxLink, DhtmlxGanttData } from "../types"

/**
 * Parse ISO date string to Date object
 */
function parseDate(dateStr: string | null): Date | null {
  if (!dateStr) return null
  const date = new Date(dateStr)
  return isNaN(date.getTime()) ? null : date
}

/**
 * Convert BFF WBS item to DHTMLX Task
 */
function convertWbsToTask(wbs: BffGanttWbs): DhtmlxTask {
  const startDate = parseDate(wbs.startDate)
  const endDate = parseDate(wbs.dueDate)

  // Determine task type
  let taskType: "task" | "project" | "milestone" = "task"
  if (wbs.isMilestone) {
    taskType = "milestone"
  }

  return {
    id: wbs.id,
    text: wbs.wbsName,
    start_date: startDate,
    end_date: endDate,
    progress: (wbs.progressRate ?? 0) / 100, // DHTMLX expects 0-1 range
    parent: wbs.parentWbsId ?? "0", // "0" means root level in DHTMLX
    type: taskType,
    open: true, // Expand by default
    // Custom fields
    wbsCode: wbs.wbsCode,
    assigneeName: wbs.assigneeEmployeeName,
    departmentName: wbs.assigneeDepartmentName,
    taskCount: wbs.taskCount,
  }
}

/**
 * Convert BFF Link to DHTMLX Link
 * BFF uses "finish_to_start" type, DHTMLX uses "0" for the same
 */
function convertLinkToGanttLink(link: BffGanttLink): DhtmlxLink {
  // DHTMLX link types:
  // "0" - finish to start (default)
  // "1" - start to start
  // "2" - finish to finish
  // "3" - start to finish
  const typeMap: Record<string, "0" | "1" | "2" | "3"> = {
    finish_to_start: "0",
    start_to_start: "1",
    finish_to_finish: "2",
    start_to_finish: "3",
  }

  return {
    id: link.id,
    source: link.sourceWbsId,
    target: link.targetWbsId,
    type: typeMap[link.type] ?? "0",
  }
}

/**
 * Convert BFF Gantt data to DHTMLX Gantt format
 */
export function convertToGanttData(bffData: BffGanttData): DhtmlxGanttData {
  // Sort WBS items by sortOrder within each parent group
  const sortedWbs = [...bffData.wbsItems].sort((a, b) => {
    // First, compare by parent (root items first)
    if (!a.parentWbsId && b.parentWbsId) return -1
    if (a.parentWbsId && !b.parentWbsId) return 1
    // Then by sortOrder
    return a.sortOrder - b.sortOrder
  })

  const tasks = sortedWbs.map(convertWbsToTask)
  const links = bffData.links.map(convertLinkToGanttLink)

  return { tasks, links }
}

/**
 * Convert DHTMLX task back to BFF update request format
 */
export function convertTaskToUpdateRequest(task: DhtmlxTask): {
  startDate: string | null
  dueDate: string | null
  progressRate: number
} {
  return {
    startDate: task.start_date ? task.start_date.toISOString().split("T")[0] : null,
    dueDate: task.end_date ? task.end_date.toISOString().split("T")[0] : null,
    progressRate: Math.round(task.progress * 100),
  }
}

/**
 * Convert DHTMLX link to BFF format
 */
export function convertLinkToBffFormat(link: DhtmlxLink): {
  sourceWbsId: string
  targetWbsId: string
  type: "finish_to_start"
} {
  // Currently we only support finish_to_start in BFF
  return {
    sourceWbsId: link.source,
    targetWbsId: link.target,
    type: "finish_to_start",
  }
}

/**
 * Calculate the date range for the Gantt chart
 */
export function calculateDateRange(tasks: DhtmlxTask[]): { start: Date; end: Date } {
  const now = new Date()
  const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const defaultEnd = new Date(now.getFullYear(), now.getMonth() + 3, 0)

  const validDates = tasks
    .flatMap((task) => [task.start_date, task.end_date])
    .filter((date): date is Date => date !== null)

  if (validDates.length === 0) {
    return { start: defaultStart, end: defaultEnd }
  }

  const minDate = new Date(Math.min(...validDates.map((d) => d.getTime())))
  const maxDate = new Date(Math.max(...validDates.map((d) => d.getTime())))

  // Add padding (1 month before and after)
  const start = new Date(minDate)
  start.setMonth(start.getMonth() - 1)
  start.setDate(1)

  const end = new Date(maxDate)
  end.setMonth(end.getMonth() + 2)
  end.setDate(0)

  return { start, end }
}
