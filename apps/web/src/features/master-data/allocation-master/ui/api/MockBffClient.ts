import type { BffClient } from './BffClient'
import type {
  BffAllocationEventListRequest,
  BffAllocationEventListResponse,
  BffAllocationEventResponse,
  BffAllocationEventDetailResponse,
  BffCreateAllocationEventRequest,
  BffUpdateAllocationEventRequest,
  BffCopyAllocationEventRequest,
  BffCreateAllocationStepRequest,
  BffUpdateAllocationStepRequest,
  BffReorderStepsRequest,
  BffAllocationStepResponse,
  BffCreateAllocationTargetRequest,
  BffUpdateAllocationTargetRequest,
  BffAllocationTargetResponse,
  BffAllocationDriverListRequest,
  BffAllocationDriverListResponse,
  BffAllocationDriverResponse,
  BffCreateAllocationDriverRequest,
  BffUpdateAllocationDriverRequest,
} from '@epm/contracts/bff/allocation-master'

// モックデータ
const mockEvents: BffAllocationEventResponse[] = [
  {
    id: 'evt-001',
    companyId: 'company-001',
    eventCode: 'ALLOC-001',
    eventName: '本社経費配賦(実績)',
    scenarioType: 'ACTUAL',
    isActive: true,
    version: 1,
    notes: '月次配賦処理用',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-06T10:00:00Z',
  },
  {
    id: 'evt-002',
    companyId: 'company-001',
    eventCode: 'ALLOC-002',
    eventName: '間接費配賦(予算)',
    scenarioType: 'BUDGET',
    isActive: true,
    version: 1,
    notes: null,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-05T15:00:00Z',
  },
  {
    id: 'evt-003',
    companyId: 'company-001',
    eventCode: 'ALLOC-003',
    eventName: 'IT費用配賦(実績)',
    scenarioType: 'ACTUAL',
    isActive: false,
    version: 2,
    notes: '廃止予定',
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2024-12-15T08:00:00Z',
  },
]

const mockSteps: Record<string, BffAllocationStepResponse[]> = {
  'evt-001': [
    {
      id: 'step-001',
      stepNo: 1,
      stepName: '本社経費 → 各事業部',
      fromSubjectId: 'sub-001',
      fromSubjectName: '本社共通費',
      fromDepartmentStableId: 'S-HQ-001',
      fromDepartmentName: '本社管理部門',
      driverType: 'HEADCOUNT',
      driverSourceType: 'MASTER',
      driverRefId: 'drv-001',
      driverName: '人員比ドライバ',
      notes: null,
      targets: [
        {
          id: 'tgt-001',
          targetType: 'DEPARTMENT',
          targetId: 'S-BU-001',
          targetName: '事業部A',
          toSubjectId: null,
          toSubjectName: null,
          fixedRatio: null,
          sortOrder: 1,
          isActive: true,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
        {
          id: 'tgt-002',
          targetType: 'DEPARTMENT',
          targetId: 'S-BU-002',
          targetName: '事業部B',
          toSubjectId: null,
          toSubjectName: null,
          fixedRatio: null,
          sortOrder: 2,
          isActive: true,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      ],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'step-002',
      stepNo: 2,
      stepName: '事業部経費 → 各部門',
      fromSubjectId: 'sub-002',
      fromSubjectName: '事業部経費',
      fromDepartmentStableId: 'S-BU-001',
      fromDepartmentName: '事業部A',
      driverType: 'FIXED',
      driverSourceType: 'MASTER',
      driverRefId: null,
      driverName: null,
      notes: '固定比率で配賦',
      targets: [
        {
          id: 'tgt-003',
          targetType: 'DEPARTMENT',
          targetId: 'S-DEPT-001',
          targetName: '営業部',
          toSubjectId: 'sub-003',
          toSubjectName: '配賦経費',
          fixedRatio: '0.6000',
          sortOrder: 1,
          isActive: true,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
        {
          id: 'tgt-004',
          targetType: 'DEPARTMENT',
          targetId: 'S-DEPT-002',
          targetName: '開発部',
          toSubjectId: 'sub-003',
          toSubjectName: '配賦経費',
          fixedRatio: '0.4000',
          sortOrder: 2,
          isActive: true,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      ],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
  ],
  'evt-002': [
    {
      id: 'step-003',
      stepNo: 1,
      stepName: '間接費配賦',
      fromSubjectId: 'sub-004',
      fromSubjectName: '間接費',
      fromDepartmentStableId: 'S-HQ-002',
      fromDepartmentName: '本社間接部門',
      driverType: 'SUBJECT_AMOUNT',
      driverSourceType: 'FACT',
      driverRefId: 'drv-002',
      driverName: '売上高比ドライバ',
      notes: null,
      targets: [],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
  ],
}

const mockDrivers: BffAllocationDriverResponse[] = [
  {
    id: 'drv-001',
    companyId: 'company-001',
    driverCode: 'DRV-001',
    driverName: '人員比ドライバ',
    driverType: 'HEADCOUNT',
    sourceType: 'MASTER',
    driverSubjectId: null,
    driverSubjectName: null,
    measureKey: null,
    kpiSubjectId: null,
    kpiSubjectName: null,
    periodRule: null,
    notes: '組織マスタの社員数を使用',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'drv-002',
    companyId: 'company-001',
    driverCode: 'DRV-002',
    driverName: '売上高比ドライバ',
    driverType: 'SUBJECT_AMOUNT',
    sourceType: 'FACT',
    driverSubjectId: 'sub-100',
    driverSubjectName: '売上高',
    measureKey: null,
    kpiSubjectId: null,
    kpiSubjectName: null,
    periodRule: 'MONTHLY',
    notes: '売上高科目の月次金額を使用',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'drv-003',
    companyId: 'company-001',
    driverCode: 'DRV-003',
    driverName: '面積比ドライバ',
    driverType: 'MEASURE',
    sourceType: 'MASTER',
    driverSubjectId: null,
    driverSubjectName: null,
    measureKey: 'AREA',
    kpiSubjectId: null,
    kpiSubjectName: null,
    periodRule: null,
    notes: '部門マスタの面積を使用',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
]

/**
 * Mock BFF Client Implementation
 * 開発・テスト用のモッククライアント実装
 * 本番環境ではHttpBffClientに切り替え
 */
export class MockBffClient implements BffClient {
  private events: BffAllocationEventResponse[] = [...mockEvents]
  private steps: Record<string, BffAllocationStepResponse[]> = JSON.parse(JSON.stringify(mockSteps))
  private drivers: BffAllocationDriverResponse[] = [...mockDrivers]

  async listEvents(request: BffAllocationEventListRequest): Promise<BffAllocationEventListResponse> {
    await this.delay()

    let filtered = [...this.events]

    if (request.keyword) {
      const keyword = request.keyword.toLowerCase()
      filtered = filtered.filter(
        (e) => e.eventCode.toLowerCase().includes(keyword) || e.eventName.toLowerCase().includes(keyword),
      )
    }

    if (request.scenarioType) {
      filtered = filtered.filter((e) => e.scenarioType === request.scenarioType)
    }

    if (request.isActive !== undefined) {
      filtered = filtered.filter((e) => e.isActive === request.isActive)
    }

    const page = request.page || 1
    const pageSize = request.pageSize || 20
    const start = (page - 1) * pageSize
    const end = start + pageSize

    return {
      items: filtered.slice(start, end),
      total: filtered.length,
      page,
      pageSize,
    }
  }

  async createEvent(request: BffCreateAllocationEventRequest): Promise<BffAllocationEventResponse> {
    await this.delay()

    const newEvent: BffAllocationEventResponse = {
      id: `evt-${Date.now()}`,
      companyId: request.companyId,
      eventCode: request.eventCode,
      eventName: request.eventName,
      scenarioType: request.scenarioType,
      isActive: request.isActive ?? true,
      version: 1,
      notes: request.notes || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.events.push(newEvent)
    this.steps[newEvent.id] = []
    return newEvent
  }

  async getEventDetail(id: string): Promise<BffAllocationEventDetailResponse> {
    await this.delay()

    const event = this.events.find((e) => e.id === id)
    if (!event) throw new Error('EVENT_NOT_FOUND')

    return {
      ...event,
      steps: this.steps[id] || [],
    }
  }

  async updateEvent(id: string, request: BffUpdateAllocationEventRequest): Promise<BffAllocationEventResponse> {
    await this.delay()

    const event = this.events.find((e) => e.id === id)
    if (!event) throw new Error('EVENT_NOT_FOUND')

    Object.assign(event, {
      ...request,
      updatedAt: new Date().toISOString(),
    })

    return event
  }

  async deleteEvent(id: string): Promise<void> {
    await this.delay()

    const index = this.events.findIndex((e) => e.id === id)
    if (index === -1) throw new Error('EVENT_NOT_FOUND')

    if (this.steps[id]?.length > 0) {
      throw new Error('EVENT_HAS_STEPS')
    }

    this.events.splice(index, 1)
    delete this.steps[id]
  }

  async copyEvent(id: string, request: BffCopyAllocationEventRequest): Promise<BffAllocationEventResponse> {
    await this.delay()

    const event = this.events.find((e) => e.id === id)
    if (!event) throw new Error('EVENT_NOT_FOUND')

    const newEvent: BffAllocationEventResponse = {
      ...event,
      id: `evt-${Date.now()}`,
      eventCode: request.newEventCode,
      eventName: request.newEventName,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.events.push(newEvent)
    this.steps[newEvent.id] = JSON.parse(JSON.stringify(this.steps[id] || []))

    return newEvent
  }

  async createStep(eventId: string, request: BffCreateAllocationStepRequest): Promise<BffAllocationStepResponse> {
    await this.delay()

    if (!this.steps[eventId]) this.steps[eventId] = []

    const newStep: BffAllocationStepResponse = {
      id: `step-${Date.now()}`,
      stepNo: this.steps[eventId].length + 1,
      stepName: request.stepName,
      fromSubjectId: request.fromSubjectId,
      fromSubjectName: `科目名-${request.fromSubjectId}(モック)`,
      fromDepartmentStableId: request.fromDepartmentStableId,
      fromDepartmentName: `部門名-${request.fromDepartmentStableId}(モック)`,
      driverType: request.driverType,
      driverSourceType: request.driverSourceType,
      driverRefId: request.driverRefId || null,
      driverName: request.driverRefId ? `ドライバ名-${request.driverRefId}(モック)` : null,
      notes: request.notes || null,
      targets: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.steps[eventId].push(newStep)
    return newStep
  }

  async updateStep(
    eventId: string,
    stepId: string,
    request: BffUpdateAllocationStepRequest,
  ): Promise<BffAllocationStepResponse> {
    await this.delay()

    const step = this.steps[eventId]?.find((s) => s.id === stepId)
    if (!step) throw new Error('STEP_NOT_FOUND')

    if (request.stepName !== undefined) step.stepName = request.stepName
    if (request.fromSubjectId !== undefined) {
      step.fromSubjectId = request.fromSubjectId
      step.fromSubjectName = `科目名-${request.fromSubjectId}(モック)`
    }
    if (request.fromDepartmentStableId !== undefined) {
      step.fromDepartmentStableId = request.fromDepartmentStableId
      step.fromDepartmentName = `部門名-${request.fromDepartmentStableId}(モック)`
    }
    if (request.driverType !== undefined) step.driverType = request.driverType
    if (request.driverSourceType !== undefined) step.driverSourceType = request.driverSourceType
    if (request.driverRefId !== undefined) {
      step.driverRefId = request.driverRefId
      step.driverName = request.driverRefId ? `ドライバ名-${request.driverRefId}(モック)` : null
    }
    if (request.notes !== undefined) step.notes = request.notes

    step.updatedAt = new Date().toISOString()

    return step
  }

  async deleteStep(eventId: string, stepId: string): Promise<void> {
    await this.delay()

    const steps = this.steps[eventId]
    if (!steps) throw new Error('STEP_NOT_FOUND')

    const index = steps.findIndex((s) => s.id === stepId)
    if (index === -1) throw new Error('STEP_NOT_FOUND')

    if (steps[index].targets.length > 0) {
      throw new Error('STEP_HAS_TARGETS')
    }

    steps.splice(index, 1)
  }

  async reorderSteps(eventId: string, request: BffReorderStepsRequest): Promise<BffAllocationStepResponse[]> {
    await this.delay()

    const steps = this.steps[eventId]
    if (!steps) throw new Error('EVENT_NOT_FOUND')

    request.stepOrders.forEach((order) => {
      const step = steps.find((s) => s.id === order.id)
      if (step) step.stepNo = order.stepNo
    })

    steps.sort((a, b) => a.stepNo - b.stepNo)
    return steps
  }

  async createTarget(
    eventId: string,
    stepId: string,
    request: BffCreateAllocationTargetRequest,
  ): Promise<BffAllocationTargetResponse> {
    await this.delay()

    const step = this.steps[eventId]?.find((s) => s.id === stepId)
    if (!step) throw new Error('STEP_NOT_FOUND')

    const targetName =
      request.targetType === 'DEPARTMENT'
        ? `部門-${request.targetId}(モック)`
        : `ディメンション値-${request.targetId}(モック)`

    const newTarget: BffAllocationTargetResponse = {
      id: `tgt-${Date.now()}`,
      targetType: request.targetType,
      targetId: request.targetId,
      targetName,
      toSubjectId: request.toSubjectId || null,
      toSubjectName: request.toSubjectId ? `科目名-${request.toSubjectId}(モック)` : null,
      fixedRatio: request.fixedRatio || null,
      sortOrder: request.sortOrder || null,
      isActive: request.isActive ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    step.targets.push(newTarget)
    return newTarget
  }

  async updateTarget(
    eventId: string,
    stepId: string,
    targetId: string,
    request: BffUpdateAllocationTargetRequest,
  ): Promise<BffAllocationTargetResponse> {
    await this.delay()

    const step = this.steps[eventId]?.find((s) => s.id === stepId)
    if (!step) throw new Error('STEP_NOT_FOUND')

    const target = step.targets.find((t) => t.id === targetId)
    if (!target) throw new Error('TARGET_NOT_FOUND')

    Object.assign(target, {
      ...request,
      updatedAt: new Date().toISOString(),
    })

    return target
  }

  async deleteTarget(eventId: string, stepId: string, targetId: string): Promise<void> {
    await this.delay()

    const step = this.steps[eventId]?.find((s) => s.id === stepId)
    if (!step) throw new Error('STEP_NOT_FOUND')

    const index = step.targets.findIndex((t) => t.id === targetId)
    if (index === -1) throw new Error('TARGET_NOT_FOUND')

    step.targets.splice(index, 1)
  }

  async listDrivers(request: BffAllocationDriverListRequest): Promise<BffAllocationDriverListResponse> {
    await this.delay()

    let filtered = [...this.drivers]

    if (request.keyword) {
      const keyword = request.keyword.toLowerCase()
      filtered = filtered.filter(
        (d) => d.driverCode.toLowerCase().includes(keyword) || d.driverName.toLowerCase().includes(keyword),
      )
    }

    if (request.driverType) {
      filtered = filtered.filter((d) => d.driverType === request.driverType)
    }

    const page = request.page || 1
    const pageSize = request.pageSize || 20
    const start = (page - 1) * pageSize
    const end = start + pageSize

    return {
      items: filtered.slice(start, end),
      total: filtered.length,
      page,
      pageSize,
    }
  }

  async createDriver(request: BffCreateAllocationDriverRequest): Promise<BffAllocationDriverResponse> {
    await this.delay()

    const newDriver: BffAllocationDriverResponse = {
      id: `drv-${Date.now()}`,
      companyId: request.companyId,
      driverCode: request.driverCode,
      driverName: request.driverName,
      driverType: request.driverType,
      sourceType: request.sourceType,
      driverSubjectId: request.driverSubjectId || null,
      driverSubjectName: request.driverSubjectId ? `科目名-${request.driverSubjectId}(モック)` : null,
      measureKey: request.measureKey || null,
      kpiSubjectId: request.kpiSubjectId || null,
      kpiSubjectName: request.kpiSubjectId ? `KPI科目名-${request.kpiSubjectId}(モック)` : null,
      periodRule: request.periodRule || null,
      notes: request.notes || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.drivers.push(newDriver)
    return newDriver
  }

  async getDriver(id: string): Promise<BffAllocationDriverResponse> {
    await this.delay()

    const driver = this.drivers.find((d) => d.id === id)
    if (!driver) throw new Error('DRIVER_NOT_FOUND')

    return driver
  }

  async updateDriver(id: string, request: BffUpdateAllocationDriverRequest): Promise<BffAllocationDriverResponse> {
    await this.delay()

    const driver = this.drivers.find((d) => d.id === id)
    if (!driver) throw new Error('DRIVER_NOT_FOUND')

    Object.assign(driver, {
      ...request,
      updatedAt: new Date().toISOString(),
    })

    return driver
  }

  async deleteDriver(id: string): Promise<void> {
    await this.delay()

    const index = this.drivers.findIndex((d) => d.id === id)
    if (index === -1) throw new Error('DRIVER_NOT_FOUND')

    this.drivers.splice(index, 1)
  }

  private delay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 300))
  }
}
