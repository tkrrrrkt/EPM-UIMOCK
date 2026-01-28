/**
 * KPI Action Plan Gantt - Mock BFF Client
 *
 * design.md準拠: BFF Endpoints
 * 開発用モッククライアント
 */

import type { BffClient } from './BffClient'
import type {
  BffGanttData,
  BffGanttWbs,
  BffGanttLink,
  BffCreateWbsRequest,
  BffUpdateWbsRequest,
  BffUpdateWbsScheduleRequest,
  BffUpdateWbsProgressRequest,
  BffUpdateWbsDependencyRequest,
  BffNextWbsCodeResponse,
  BffSelectableDepartment,
  BffSelectableEmployee,
} from '../lib/types'

// ============================================
// Mock Data
// ============================================

const MOCK_WBS_ITEMS: BffGanttWbs[] = [
  {
    id: 'wbs-001',
    parentWbsId: null,
    wbsCode: '1',
    wbsName: '新規顧客開拓プロジェクト',
    description: 'Q1の新規顧客獲得を目標としたプロジェクト',
    assigneeDepartmentStableId: 'dept-sales',
    assigneeDepartmentName: '営業部',
    assigneeEmployeeId: null,
    assigneeEmployeeName: null,
    startDate: '2026-01-06',
    dueDate: '2026-03-31',
    actualStartDate: '2026-01-06',
    actualEndDate: null,
    progressRate: 25,
    isMilestone: false,
    sortOrder: 1,
    taskCount: 3,
    updatedAt: '2026-01-25T10:00:00Z',
  },
  {
    id: 'wbs-002',
    parentWbsId: 'wbs-001',
    wbsCode: '1.1',
    wbsName: 'ターゲットリスト作成',
    description: '新規ターゲット企業のリスト作成と優先順位付け',
    assigneeDepartmentStableId: 'dept-sales',
    assigneeDepartmentName: '営業部',
    assigneeEmployeeId: 'emp-001',
    assigneeEmployeeName: '田中一郎',
    startDate: '2026-01-06',
    dueDate: '2026-01-17',
    actualStartDate: '2026-01-06',
    actualEndDate: '2026-01-15',
    progressRate: 100,
    isMilestone: false,
    sortOrder: 1,
    taskCount: 2,
    updatedAt: '2026-01-25T10:00:00Z',
  },
  {
    id: 'wbs-003',
    parentWbsId: 'wbs-001',
    wbsCode: '1.2',
    wbsName: '初回アプローチ',
    description: 'ターゲット企業への初回コンタクト',
    assigneeDepartmentStableId: 'dept-sales',
    assigneeDepartmentName: '営業部',
    assigneeEmployeeId: 'emp-002',
    assigneeEmployeeName: '鈴木花子',
    startDate: '2026-01-20',
    dueDate: '2026-02-14',
    actualStartDate: '2026-01-20',
    actualEndDate: null,
    progressRate: 50,
    isMilestone: false,
    sortOrder: 2,
    taskCount: 5,
    updatedAt: '2026-01-25T10:00:00Z',
  },
  {
    id: 'wbs-004',
    parentWbsId: 'wbs-001',
    wbsCode: '1.3',
    wbsName: '提案・商談',
    description: '関心を持った企業への詳細提案',
    assigneeDepartmentStableId: 'dept-sales',
    assigneeDepartmentName: '営業部',
    assigneeEmployeeId: 'emp-001',
    assigneeEmployeeName: '田中一郎',
    startDate: '2026-02-17',
    dueDate: '2026-03-14',
    actualStartDate: null,
    actualEndDate: null,
    progressRate: 0,
    isMilestone: false,
    sortOrder: 3,
    taskCount: 4,
    updatedAt: '2026-01-25T10:00:00Z',
  },
  {
    id: 'wbs-005',
    parentWbsId: 'wbs-001',
    wbsCode: '1.4',
    wbsName: 'Q1目標達成マイルストーン',
    description: 'Q1の新規顧客獲得目標の達成確認',
    assigneeDepartmentStableId: null,
    assigneeDepartmentName: null,
    assigneeEmployeeId: null,
    assigneeEmployeeName: null,
    startDate: '2026-03-31',
    dueDate: '2026-03-31',
    actualStartDate: null,
    actualEndDate: null,
    progressRate: 0,
    isMilestone: true,
    sortOrder: 4,
    taskCount: 0,
    updatedAt: '2026-01-25T10:00:00Z',
  },
  {
    id: 'wbs-010',
    parentWbsId: null,
    wbsCode: '2',
    wbsName: '既存顧客深耕プロジェクト',
    description: '既存顧客の単価向上とリピート率改善',
    assigneeDepartmentStableId: 'dept-cs',
    assigneeDepartmentName: 'カスタマーサクセス部',
    assigneeEmployeeId: null,
    assigneeEmployeeName: null,
    startDate: '2026-01-13',
    dueDate: '2026-03-28',
    actualStartDate: '2026-01-13',
    actualEndDate: null,
    progressRate: 30,
    isMilestone: false,
    sortOrder: 2,
    taskCount: 2,
    updatedAt: '2026-01-25T10:00:00Z',
  },
  {
    id: 'wbs-011',
    parentWbsId: 'wbs-010',
    wbsCode: '2.1',
    wbsName: '顧客分析・セグメント化',
    description: '既存顧客のLTV分析とセグメント分類',
    assigneeDepartmentStableId: 'dept-cs',
    assigneeDepartmentName: 'カスタマーサクセス部',
    assigneeEmployeeId: 'emp-003',
    assigneeEmployeeName: '山田太郎',
    startDate: '2026-01-13',
    dueDate: '2026-01-31',
    actualStartDate: '2026-01-13',
    actualEndDate: null,
    progressRate: 80,
    isMilestone: false,
    sortOrder: 1,
    taskCount: 3,
    updatedAt: '2026-01-25T10:00:00Z',
  },
  {
    id: 'wbs-012',
    parentWbsId: 'wbs-010',
    wbsCode: '2.2',
    wbsName: 'アップセル施策実施',
    description: 'ハイバリュー顧客へのアップセル提案',
    assigneeDepartmentStableId: 'dept-cs',
    assigneeDepartmentName: 'カスタマーサクセス部',
    assigneeEmployeeId: 'emp-003',
    assigneeEmployeeName: '山田太郎',
    startDate: '2026-02-03',
    dueDate: '2026-03-28',
    actualStartDate: null,
    actualEndDate: null,
    progressRate: 0,
    isMilestone: false,
    sortOrder: 2,
    taskCount: 4,
    updatedAt: '2026-01-25T10:00:00Z',
  },
]

const MOCK_LINKS: BffGanttLink[] = [
  {
    id: 'link-001',
    sourceWbsId: 'wbs-002',
    targetWbsId: 'wbs-003',
    type: 'finish_to_start',
  },
  {
    id: 'link-002',
    sourceWbsId: 'wbs-003',
    targetWbsId: 'wbs-004',
    type: 'finish_to_start',
  },
  {
    id: 'link-003',
    sourceWbsId: 'wbs-004',
    targetWbsId: 'wbs-005',
    type: 'finish_to_start',
  },
  {
    id: 'link-004',
    sourceWbsId: 'wbs-011',
    targetWbsId: 'wbs-012',
    type: 'finish_to_start',
  },
]

const MOCK_DEPARTMENTS: BffSelectableDepartment[] = [
  { stableId: 'dept-sales', name: '営業部' },
  { stableId: 'dept-cs', name: 'カスタマーサクセス部' },
  { stableId: 'dept-mktg', name: 'マーケティング部' },
  { stableId: 'dept-dev', name: '開発部' },
]

const MOCK_EMPLOYEES: BffSelectableEmployee[] = [
  { id: 'emp-001', name: '田中一郎', departmentName: '営業部' },
  { id: 'emp-002', name: '鈴木花子', departmentName: '営業部' },
  { id: 'emp-003', name: '山田太郎', departmentName: 'カスタマーサクセス部' },
  { id: 'emp-004', name: '佐藤次郎', departmentName: 'マーケティング部' },
  { id: 'emp-005', name: '高橋美咲', departmentName: '開発部' },
]

// ============================================
// Mock State
// ============================================

let mockWbsItems = [...MOCK_WBS_ITEMS]
let mockLinks = [...MOCK_LINKS]
let idCounter = 100

// ============================================
// Mock BFF Client Implementation
// ============================================

export class MockBffClient implements BffClient {
  private delay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 200))
  }

  async getGanttData(planId: string): Promise<BffGanttData> {
    await this.delay()
    return {
      planId,
      planName: `アクションプラン ${planId}`,
      wbsItems: [...mockWbsItems],
      links: [...mockLinks],
    }
  }

  async createWbs(request: BffCreateWbsRequest): Promise<BffGanttWbs> {
    await this.delay()

    const newId = `wbs-${++idCounter}`
    const wbsCode = request.wbsCode || this.generateWbsCode(request.parentWbsId ?? null)

    // 重複チェック
    if (mockWbsItems.some((w) => w.wbsCode === wbsCode)) {
      throw new Error('WBS_CODE_DUPLICATE')
    }

    const department = MOCK_DEPARTMENTS.find(
      (d) => d.stableId === request.assigneeDepartmentStableId
    )
    const employee = MOCK_EMPLOYEES.find((e) => e.id === request.assigneeEmployeeId)

    const newWbs: BffGanttWbs = {
      id: newId,
      parentWbsId: request.parentWbsId || null,
      wbsCode,
      wbsName: request.wbsName,
      description: request.description || null,
      assigneeDepartmentStableId: request.assigneeDepartmentStableId || null,
      assigneeDepartmentName: department?.name || null,
      assigneeEmployeeId: request.assigneeEmployeeId || null,
      assigneeEmployeeName: employee?.name || null,
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

    mockWbsItems.push(newWbs)
    return newWbs
  }

  async updateWbs(wbsId: string, request: BffUpdateWbsRequest): Promise<BffGanttWbs> {
    await this.delay()

    const index = mockWbsItems.findIndex((w) => w.id === wbsId)
    if (index === -1) {
      throw new Error('WBS_NOT_FOUND')
    }

    const existing = mockWbsItems[index]

    // 楽観的ロックチェック
    if (existing.updatedAt !== request.updatedAt) {
      throw new Error('CONFLICT')
    }

    // WBSコード重複チェック（変更時）
    if (request.wbsCode && request.wbsCode !== existing.wbsCode) {
      if (mockWbsItems.some((w) => w.wbsCode === request.wbsCode && w.id !== wbsId)) {
        throw new Error('WBS_CODE_DUPLICATE')
      }
    }

    const department = request.assigneeDepartmentStableId
      ? MOCK_DEPARTMENTS.find((d) => d.stableId === request.assigneeDepartmentStableId)
      : null
    const employee = request.assigneeEmployeeId
      ? MOCK_EMPLOYEES.find((e) => e.id === request.assigneeEmployeeId)
      : null

    const updated: BffGanttWbs = {
      ...existing,
      wbsCode: request.wbsCode ?? existing.wbsCode,
      wbsName: request.wbsName ?? existing.wbsName,
      description: request.description !== undefined ? request.description : existing.description,
      assigneeDepartmentStableId:
        request.assigneeDepartmentStableId !== undefined
          ? request.assigneeDepartmentStableId
          : existing.assigneeDepartmentStableId,
      assigneeDepartmentName: department?.name ?? existing.assigneeDepartmentName,
      assigneeEmployeeId:
        request.assigneeEmployeeId !== undefined
          ? request.assigneeEmployeeId
          : existing.assigneeEmployeeId,
      assigneeEmployeeName: employee?.name ?? existing.assigneeEmployeeName,
      startDate: request.startDate !== undefined ? request.startDate : existing.startDate,
      dueDate: request.dueDate !== undefined ? request.dueDate : existing.dueDate,
      isMilestone: request.isMilestone ?? existing.isMilestone,
      updatedAt: new Date().toISOString(),
    }

    mockWbsItems[index] = updated
    return updated
  }

  async deleteWbs(wbsId: string): Promise<void> {
    await this.delay()

    const index = mockWbsItems.findIndex((w) => w.id === wbsId)
    if (index === -1) {
      throw new Error('WBS_NOT_FOUND')
    }

    // 子WBSも含めて削除
    const idsToDelete = this.collectDescendantIds(wbsId)
    mockWbsItems = mockWbsItems.filter((w) => !idsToDelete.includes(w.id))
    mockLinks = mockLinks.filter(
      (l) => !idsToDelete.includes(l.sourceWbsId) && !idsToDelete.includes(l.targetWbsId)
    )
  }

  async updateWbsSchedule(wbsId: string, request: BffUpdateWbsScheduleRequest): Promise<void> {
    await this.delay()

    const index = mockWbsItems.findIndex((w) => w.id === wbsId)
    if (index === -1) {
      throw new Error('WBS_NOT_FOUND')
    }

    mockWbsItems[index] = {
      ...mockWbsItems[index],
      startDate: request.startDate,
      dueDate: request.dueDate,
      updatedAt: new Date().toISOString(),
    }
  }

  async updateWbsProgress(wbsId: string, request: BffUpdateWbsProgressRequest): Promise<void> {
    await this.delay()

    const index = mockWbsItems.findIndex((w) => w.id === wbsId)
    if (index === -1) {
      throw new Error('WBS_NOT_FOUND')
    }

    mockWbsItems[index] = {
      ...mockWbsItems[index],
      progressRate: request.progressRate,
      updatedAt: new Date().toISOString(),
    }
  }

  async updateWbsDependency(wbsId: string, request: BffUpdateWbsDependencyRequest): Promise<void> {
    await this.delay()

    const index = mockWbsItems.findIndex((w) => w.id === wbsId)
    if (index === -1) {
      throw new Error('WBS_NOT_FOUND')
    }

    // 既存の依存関係を削除
    mockLinks = mockLinks.filter((l) => l.targetWbsId !== wbsId)

    // 新しい依存関係を追加
    if (request.predecessorWbsId) {
      mockLinks.push({
        id: `link-${++idCounter}`,
        sourceWbsId: request.predecessorWbsId,
        targetWbsId: wbsId,
        type: 'finish_to_start',
      })
    }
  }

  async getNextWbsCode(
    parentWbsId: string | null,
    _planId: string
  ): Promise<BffNextWbsCodeResponse> {
    await this.delay()
    return {
      nextCode: this.generateWbsCode(parentWbsId),
    }
  }

  async getSelectableDepartments(): Promise<BffSelectableDepartment[]> {
    await this.delay()
    return [...MOCK_DEPARTMENTS]
  }

  async getSelectableEmployees(): Promise<BffSelectableEmployee[]> {
    await this.delay()
    return [...MOCK_EMPLOYEES]
  }

  // ============================================
  // Helper Methods
  // ============================================

  private generateWbsCode(parentWbsId: string | null): string {
    if (!parentWbsId) {
      // ルートレベル
      const rootItems = mockWbsItems.filter((w) => !w.parentWbsId)
      const maxCode = rootItems.reduce((max, item) => {
        const code = parseInt(item.wbsCode, 10)
        return code > max ? code : max
      }, 0)
      return String(maxCode + 1)
    }

    // 子レベル
    const parent = mockWbsItems.find((w) => w.id === parentWbsId)
    if (!parent) return '1'

    const siblings = mockWbsItems.filter((w) => w.parentWbsId === parentWbsId)
    const parentPrefix = parent.wbsCode + '.'
    const maxSuffix = siblings.reduce((max, item) => {
      if (item.wbsCode.startsWith(parentPrefix)) {
        const suffix = parseInt(item.wbsCode.substring(parentPrefix.length).split('.')[0], 10)
        return suffix > max ? suffix : max
      }
      return max
    }, 0)

    return `${parent.wbsCode}.${maxSuffix + 1}`
  }

  private collectDescendantIds(wbsId: string): string[] {
    const ids = [wbsId]
    const children = mockWbsItems.filter((w) => w.parentWbsId === wbsId)
    for (const child of children) {
      ids.push(...this.collectDescendantIds(child.id))
    }
    return ids
  }
}
