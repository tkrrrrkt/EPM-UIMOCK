import type {
  BffClient,
  BffListPlansRequest,
  BffListPlansResponse,
  BffPlanDetailResponse,
  BffCreatePlanRequest,
  BffUpdatePlanRequest,
  BffKpiSubjectsResponse,
  BffActionPlanSummary,
  BffActionPlanDetail,
  BffKpiSubject,
} from "@epm/contracts/bff/action-plan-core"

const mockKpiSubjects: BffKpiSubject[] = [
  { id: "subj-001", subjectCode: "KPI-SALES", subjectName: "売上高KPI" },
  { id: "subj-002", subjectCode: "KPI-COST", subjectName: "コスト削減KPI" },
  { id: "subj-003", subjectCode: "KPI-QUALITY", subjectName: "品質向上KPI" },
]

const mockPlans: BffActionPlanSummary[] = [
  {
    id: "plan-001",
    planCode: "AP-2026-001",
    planName: "売上拡大施策",
    subjectId: "subj-001",
    subjectName: "売上高KPI",
    ownerEmployeeId: "emp-001",
    ownerEmployeeName: "山田太郎",
    dueDate: "2026-03-31",
    status: "IN_PROGRESS",
    progressRate: 45,
    priority: "HIGH",
  },
  {
    id: "plan-002",
    planCode: "AP-2026-002",
    planName: "業務効率化プロジェクト",
    subjectId: "subj-002",
    subjectName: "コスト削減KPI",
    ownerEmployeeId: "emp-002",
    ownerEmployeeName: "佐藤花子",
    dueDate: "2026-06-30",
    status: "NOT_STARTED",
    progressRate: 0,
    priority: "MEDIUM",
  },
  {
    id: "plan-003",
    planCode: "AP-2026-003",
    planName: "品質管理体制構築",
    subjectId: "subj-003",
    subjectName: "品質向上KPI",
    ownerEmployeeId: "emp-003",
    ownerEmployeeName: "鈴木一郎",
    dueDate: "2026-09-30",
    status: "IN_PROGRESS",
    progressRate: 70,
    priority: "LOW",
  },
  {
    id: "plan-004",
    planCode: "AP-2025-012",
    planName: "新規顧客開拓",
    subjectId: "subj-001",
    subjectName: "売上高KPI",
    ownerEmployeeId: "emp-001",
    ownerEmployeeName: "山田太郎",
    dueDate: "2025-12-31",
    status: "COMPLETED",
    progressRate: 100,
    priority: "HIGH",
  },
]

const mockPlanDetails: Record<string, BffActionPlanDetail> = {
  "plan-001": {
    id: "plan-001",
    planCode: "AP-2026-001",
    planName: "売上拡大施策",
    description: "新規市場への進出と既存顧客の深耕により、売上目標を達成する。",
    subjectId: "subj-001",
    subjectName: "売上高KPI",
    ownerDepartmentStableId: "dept-sales",
    ownerDepartmentName: "営業部",
    ownerEmployeeId: "emp-001",
    ownerEmployeeName: "山田太郎",
    startDate: "2026-01-01",
    dueDate: "2026-03-31",
    status: "IN_PROGRESS",
    progressRate: 45,
    priority: "HIGH",
    isActive: true,
    wbsCount: 5,
    taskCount: 23,
    createdAt: "2026-01-01T09:00:00.000Z",
    updatedAt: "2026-01-09T10:30:00.000Z",
  },
  "plan-002": {
    id: "plan-002",
    planCode: "AP-2026-002",
    planName: "業務効率化プロジェクト",
    description: "RPA導入により業務プロセスを自動化し、工数を50%削減する。",
    subjectId: "subj-002",
    subjectName: "コスト削減KPI",
    ownerDepartmentStableId: "dept-ops",
    ownerDepartmentName: "業務部",
    ownerEmployeeId: "emp-002",
    ownerEmployeeName: "佐藤花子",
    startDate: "2026-04-01",
    dueDate: "2026-06-30",
    status: "NOT_STARTED",
    progressRate: 0,
    priority: "MEDIUM",
    isActive: true,
    wbsCount: 3,
    taskCount: 12,
    createdAt: "2026-01-05T14:00:00.000Z",
    updatedAt: "2026-01-05T14:00:00.000Z",
  },
  "plan-003": {
    id: "plan-003",
    planCode: "AP-2026-003",
    planName: "品質管理体制構築",
    description: "ISO9001認証取得に向けた品質管理プロセスの整備と文書化。",
    subjectId: "subj-003",
    subjectName: "品質向上KPI",
    ownerDepartmentStableId: "dept-qa",
    ownerDepartmentName: "品質保証部",
    ownerEmployeeId: "emp-003",
    ownerEmployeeName: "鈴木一郎",
    startDate: "2026-07-01",
    dueDate: "2026-09-30",
    status: "IN_PROGRESS",
    progressRate: 70,
    priority: "LOW",
    isActive: true,
    wbsCount: 8,
    taskCount: 45,
    createdAt: "2026-01-03T11:00:00.000Z",
    updatedAt: "2026-01-08T16:45:00.000Z",
  },
  "plan-004": {
    id: "plan-004",
    planCode: "AP-2025-012",
    planName: "新規顧客開拓",
    description: "中部地域への営業展開により新規顧客100社の獲得を目指す。",
    subjectId: "subj-001",
    subjectName: "売上高KPI",
    ownerDepartmentStableId: "dept-sales",
    ownerDepartmentName: "営業部",
    ownerEmployeeId: "emp-001",
    ownerEmployeeName: "山田太郎",
    startDate: "2025-10-01",
    dueDate: "2025-12-31",
    status: "COMPLETED",
    progressRate: 100,
    priority: "HIGH",
    isActive: true,
    wbsCount: 4,
    taskCount: 28,
    createdAt: "2025-09-15T09:00:00.000Z",
    updatedAt: "2026-01-02T10:00:00.000Z",
  },
}

export class MockBffClient implements BffClient {
  private plans: BffActionPlanSummary[] = [...mockPlans]

  async listPlans(request: BffListPlansRequest): Promise<BffListPlansResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    let filtered = [...this.plans]

    if (request.keyword) {
      const keyword = request.keyword.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.planCode.toLowerCase().includes(keyword) ||
          p.planName.toLowerCase().includes(keyword) ||
          p.subjectName.toLowerCase().includes(keyword),
      )
    }

    if (request.status) {
      filtered = filtered.filter((p) => p.status === request.status)
    }

    if (request.priority) {
      filtered = filtered.filter((p) => p.priority === request.priority)
    }

    if (request.sortBy) {
      filtered.sort((a, b) => {
        const aVal = a[request.sortBy!] ?? ""
        const bVal = b[request.sortBy!] ?? ""

        if (request.sortOrder === "desc") {
          return bVal > aVal ? 1 : -1
        }
        return aVal > bVal ? 1 : -1
      })
    }

    const page = request.page || 1
    const pageSize = request.pageSize || 10
    const start = (page - 1) * pageSize
    const end = start + pageSize

    return {
      plans: filtered.slice(start, end),
      totalCount: filtered.length,
      page,
      pageSize,
    }
  }

  async getPlanDetail(id: string): Promise<BffPlanDetailResponse> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const plan = mockPlanDetails[id]
    if (!plan) {
      throw new Error("PLAN_NOT_FOUND")
    }

    return { plan }
  }

  async createPlan(request: BffCreatePlanRequest): Promise<BffPlanDetailResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (this.plans.some((p) => p.planCode === request.planCode)) {
      throw new Error("PLAN_CODE_DUPLICATE")
    }

    const subject = mockKpiSubjects.find((s) => s.id === request.subjectId)
    if (!subject) {
      throw new Error("INVALID_SUBJECT_TYPE")
    }

    const newPlan: BffActionPlanDetail = {
      id: `plan-${Date.now()}`,
      planCode: request.planCode,
      planName: request.planName,
      description: request.description || null,
      subjectId: request.subjectId,
      subjectName: subject.subjectName,
      ownerDepartmentStableId: request.ownerDepartmentStableId || null,
      ownerDepartmentName: null,
      ownerEmployeeId: request.ownerEmployeeId || null,
      ownerEmployeeName: null,
      startDate: request.startDate || null,
      dueDate: request.dueDate || null,
      status: "NOT_STARTED",
      progressRate: 0,
      priority: request.priority || null,
      isActive: true,
      wbsCount: 0,
      taskCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const summary: BffActionPlanSummary = {
      id: newPlan.id,
      planCode: newPlan.planCode,
      planName: newPlan.planName,
      subjectId: newPlan.subjectId,
      subjectName: newPlan.subjectName,
      ownerEmployeeId: newPlan.ownerEmployeeId,
      ownerEmployeeName: newPlan.ownerEmployeeName,
      dueDate: newPlan.dueDate,
      status: newPlan.status,
      progressRate: newPlan.progressRate,
      priority: newPlan.priority,
    }

    this.plans = [summary, ...this.plans]
    mockPlanDetails[newPlan.id] = newPlan

    return { plan: newPlan }
  }

  async updatePlan(id: string, request: BffUpdatePlanRequest): Promise<BffPlanDetailResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const existing = mockPlanDetails[id]
    if (!existing) {
      throw new Error("PLAN_NOT_FOUND")
    }

    if (existing.updatedAt !== request.updatedAt) {
      throw new Error("OPTIMISTIC_LOCK_ERROR")
    }

    const updated: BffActionPlanDetail = {
      ...existing,
      planCode: request.planCode ?? existing.planCode,
      planName: request.planName ?? existing.planName,
      description: request.description ?? existing.description,
      subjectId: request.subjectId ?? existing.subjectId,
      ownerDepartmentStableId: request.ownerDepartmentStableId ?? existing.ownerDepartmentStableId,
      ownerEmployeeId: request.ownerEmployeeId ?? existing.ownerEmployeeId,
      startDate: request.startDate ?? existing.startDate,
      dueDate: request.dueDate ?? existing.dueDate,
      status: request.status ?? existing.status,
      progressRate: request.progressRate ?? existing.progressRate,
      priority: request.priority ?? existing.priority,
      updatedAt: new Date().toISOString(),
    }

    mockPlanDetails[id] = updated

    const summaryIndex = this.plans.findIndex((p) => p.id === id)
    if (summaryIndex >= 0) {
      this.plans[summaryIndex] = {
        id: updated.id,
        planCode: updated.planCode,
        planName: updated.planName,
        subjectId: updated.subjectId,
        subjectName: updated.subjectName,
        ownerEmployeeId: updated.ownerEmployeeId,
        ownerEmployeeName: updated.ownerEmployeeName,
        dueDate: updated.dueDate,
        status: updated.status,
        progressRate: updated.progressRate,
        priority: updated.priority,
      }
    }

    return { plan: updated }
  }

  async deletePlan(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const existing = mockPlanDetails[id]
    if (!existing) {
      throw new Error("PLAN_NOT_FOUND")
    }

    this.plans = this.plans.filter((p) => p.id !== id)
    delete mockPlanDetails[id]
  }

  async getKpiSubjects(): Promise<BffKpiSubjectsResponse> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return { subjects: mockKpiSubjects }
  }
}
