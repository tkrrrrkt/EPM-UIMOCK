import type {
  BffClient,
  BffGanttData,
  BffCreateWbsRequest,
  BffUpdateWbsRequest,
  BffUpdateWbsScheduleRequest,
  BffUpdateWbsProgressRequest,
  BffUpdateWbsDependencyRequest,
  BffWbsResponse,
  BffNextWbsCodeResponse,
  BffGanttWbs,
} from "@epm/contracts/bff/action-plan-gantt"

const mockWbsItems: BffGanttWbs[] = [
  {
    id: "wbs-001",
    parentWbsId: null,
    wbsCode: "1",
    wbsName: "要件定義フェーズ",
    description: "要件定義の実施",
    assigneeDepartmentStableId: "dept-001",
    assigneeDepartmentName: "企画部",
    assigneeEmployeeId: "emp-001",
    assigneeEmployeeName: "山田太郎",
    startDate: "2026-01-06",
    dueDate: "2026-01-31",
    actualStartDate: "2026-01-06",
    actualEndDate: null,
    progressRate: 60,
    isMilestone: false,
    sortOrder: 1,
    taskCount: 3,
    updatedAt: "2026-01-09T10:00:00.000Z",
  },
  {
    id: "wbs-002",
    parentWbsId: "wbs-001",
    wbsCode: "1.1",
    wbsName: "ヒアリング",
    description: "関係者へのヒアリング実施",
    assigneeDepartmentStableId: "dept-001",
    assigneeDepartmentName: "企画部",
    assigneeEmployeeId: "emp-002",
    assigneeEmployeeName: "佐藤花子",
    startDate: "2026-01-06",
    dueDate: "2026-01-17",
    actualStartDate: "2026-01-06",
    actualEndDate: "2026-01-15",
    progressRate: 100,
    isMilestone: false,
    sortOrder: 1,
    taskCount: 2,
    updatedAt: "2026-01-09T10:00:00.000Z",
  },
  {
    id: "wbs-003",
    parentWbsId: "wbs-001",
    wbsCode: "1.2",
    wbsName: "要件書作成",
    description: "要件定義書のドラフト作成",
    assigneeDepartmentStableId: "dept-001",
    assigneeDepartmentName: "企画部",
    assigneeEmployeeId: "emp-001",
    assigneeEmployeeName: "山田太郎",
    startDate: "2026-01-20",
    dueDate: "2026-01-31",
    actualStartDate: null,
    actualEndDate: null,
    progressRate: 30,
    isMilestone: false,
    sortOrder: 2,
    taskCount: 1,
    updatedAt: "2026-01-09T10:00:00.000Z",
  },
  {
    id: "wbs-004",
    parentWbsId: null,
    wbsCode: "M1",
    wbsName: "要件定義完了",
    description: "要件定義フェーズのマイルストーン",
    assigneeDepartmentStableId: null,
    assigneeDepartmentName: null,
    assigneeEmployeeId: null,
    assigneeEmployeeName: null,
    startDate: "2026-01-31",
    dueDate: "2026-01-31",
    actualStartDate: null,
    actualEndDate: null,
    progressRate: null,
    isMilestone: true,
    sortOrder: 2,
    taskCount: 0,
    updatedAt: "2026-01-09T10:00:00.000Z",
  },
  {
    id: "wbs-005",
    parentWbsId: null,
    wbsCode: "2",
    wbsName: "設計フェーズ",
    description: "システム設計の実施",
    assigneeDepartmentStableId: "dept-002",
    assigneeDepartmentName: "開発部",
    assigneeEmployeeId: "emp-003",
    assigneeEmployeeName: "鈴木一郎",
    startDate: "2026-02-03",
    dueDate: "2026-02-28",
    actualStartDate: null,
    actualEndDate: null,
    progressRate: 0,
    isMilestone: false,
    sortOrder: 3,
    taskCount: 5,
    updatedAt: "2026-01-09T10:00:00.000Z",
  },
]

export class MockBffClient implements BffClient {
  private delay(ms: number = 300): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  async getGanttData(planId: string): Promise<BffGanttData> {
    await this.delay()
    return {
      planId,
      planName: "売上拡大施策",
      wbsItems: mockWbsItems,
      links: [
        {
          id: "link-001",
          sourceWbsId: "wbs-002",
          targetWbsId: "wbs-003",
          type: "finish_to_start",
        },
        {
          id: "link-002",
          sourceWbsId: "wbs-003",
          targetWbsId: "wbs-004",
          type: "finish_to_start",
        },
        {
          id: "link-003",
          sourceWbsId: "wbs-004",
          targetWbsId: "wbs-005",
          type: "finish_to_start",
        },
      ],
    }
  }

  async createWbs(request: BffCreateWbsRequest): Promise<BffWbsResponse> {
    await this.delay()
    const newWbs: BffGanttWbs = {
      id: `wbs-${Date.now()}`,
      parentWbsId: request.parentWbsId || null,
      wbsCode: request.wbsCode || "NEW",
      wbsName: request.wbsName,
      description: request.description || null,
      assigneeDepartmentStableId: request.assigneeDepartmentStableId || null,
      assigneeDepartmentName: null,
      assigneeEmployeeId: request.assigneeEmployeeId || null,
      assigneeEmployeeName: null,
      startDate: request.startDate || null,
      dueDate: request.dueDate || null,
      actualStartDate: null,
      actualEndDate: null,
      progressRate: 0,
      isMilestone: request.isMilestone || false,
      sortOrder: mockWbsItems.length + 1,
      taskCount: 0,
      updatedAt: new Date().toISOString(),
    }
    return { wbs: newWbs }
  }

  async updateWbs(id: string, request: BffUpdateWbsRequest): Promise<BffWbsResponse> {
    await this.delay()
    const wbs = mockWbsItems.find((w) => w.id === id)
    if (!wbs) {
      throw new Error("WBS_NOT_FOUND")
    }
    const updatedWbs: BffGanttWbs = {
      ...wbs,
      ...request,
      updatedAt: new Date().toISOString(),
    }
    return { wbs: updatedWbs }
  }

  async updateWbsSchedule(id: string, request: BffUpdateWbsScheduleRequest): Promise<BffWbsResponse> {
    await this.delay()
    const wbs = mockWbsItems.find((w) => w.id === id)
    if (!wbs) {
      throw new Error("WBS_NOT_FOUND")
    }
    const updatedWbs: BffGanttWbs = {
      ...wbs,
      startDate: request.startDate,
      dueDate: request.dueDate,
      updatedAt: new Date().toISOString(),
    }
    return { wbs: updatedWbs }
  }

  async updateWbsProgress(id: string, request: BffUpdateWbsProgressRequest): Promise<BffWbsResponse> {
    await this.delay()
    const wbs = mockWbsItems.find((w) => w.id === id)
    if (!wbs) {
      throw new Error("WBS_NOT_FOUND")
    }
    const updatedWbs: BffGanttWbs = {
      ...wbs,
      progressRate: request.progressRate,
      updatedAt: new Date().toISOString(),
    }
    return { wbs: updatedWbs }
  }

  async updateWbsDependency(id: string, request: BffUpdateWbsDependencyRequest): Promise<BffWbsResponse> {
    await this.delay()
    const wbs = mockWbsItems.find((w) => w.id === id)
    if (!wbs) {
      throw new Error("WBS_NOT_FOUND")
    }
    return { wbs }
  }

  async deleteWbs(id: string): Promise<void> {
    await this.delay()
    const index = mockWbsItems.findIndex((w) => w.id === id)
    if (index === -1) {
      throw new Error("WBS_NOT_FOUND")
    }
  }

  async getNextWbsCode(planId: string, parentWbsId?: string): Promise<BffNextWbsCodeResponse> {
    await this.delay()
    if (parentWbsId) {
      const parent = mockWbsItems.find((w) => w.id === parentWbsId)
      const children = mockWbsItems.filter((w) => w.parentWbsId === parentWbsId)
      return { nextCode: `${parent?.wbsCode || "1"}.${children.length + 1}` }
    }
    const rootItems = mockWbsItems.filter((w) => !w.parentWbsId && !w.isMilestone)
    return { nextCode: String(rootItems.length + 1) }
  }
}
