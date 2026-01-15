import type { BffClient } from "./BffClient"
import type {
  BffSubjectTreeRequest,
  BffSubjectTreeResponse,
  BffSubjectDetailResponse,
  BffCreateSubjectRequest,
  BffUpdateSubjectRequest,
  BffAddRollupRequest,
  BffUpdateRollupRequest,
  BffMoveSubjectRequest,
  BffSubjectTreeNode,
} from "@contracts/bff/subject-master"

// モックデータ
const mockSubjects: BffSubjectDetailResponse[] = [
  {
    id: "sub-001",
    subjectCode: "4010",
    subjectName: "売上高",
    subjectNameShort: "売上",
    subjectClass: "BASE",
    subjectType: "FIN",
    postingAllowed: true,
    measureKind: "AMOUNT",
    unit: "円",
    scale: 1,
    aggregationMethod: "SUM",
    direction: "CREDIT",
    allowNegative: false,
    isLaborCostApplicable: false,
    isActive: true,
    notes: "売上高の科目",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "sub-002",
    subjectCode: "5010",
    subjectName: "売上原価",
    subjectNameShort: "原価",
    subjectClass: "BASE",
    subjectType: "FIN",
    postingAllowed: true,
    measureKind: "AMOUNT",
    unit: "円",
    scale: 1,
    aggregationMethod: "SUM",
    direction: "DEBIT",
    allowNegative: false,
    isLaborCostApplicable: false,
    isActive: true,
    notes: "売上原価の科目",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "sub-003",
    subjectCode: "GP01",
    subjectName: "粗利益",
    subjectNameShort: "粗利",
    subjectClass: "AGGREGATE",
    subjectType: "FIN",
    postingAllowed: false,
    measureKind: "AMOUNT",
    unit: "円",
    scale: 1,
    aggregationMethod: "SUM",
    direction: null,
    allowNegative: true,
    isLaborCostApplicable: false,
    isActive: true,
    notes: "売上高 - 売上原価",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "sub-004",
    subjectCode: "6010",
    subjectName: "販売費及び一般管理費",
    subjectNameShort: "販管費",
    subjectClass: "BASE",
    subjectType: "FIN",
    postingAllowed: true,
    measureKind: "AMOUNT",
    unit: "円",
    scale: 1,
    aggregationMethod: "SUM",
    direction: "DEBIT",
    allowNegative: false,
    isLaborCostApplicable: true, // 労務費単価で利用可能
    isActive: true,
    notes: "販管費の科目",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "sub-005",
    subjectCode: "OP01",
    subjectName: "営業利益",
    subjectNameShort: "営業益",
    subjectClass: "AGGREGATE",
    subjectType: "FIN",
    postingAllowed: false,
    measureKind: "AMOUNT",
    unit: "円",
    scale: 1,
    aggregationMethod: "SUM",
    direction: null,
    allowNegative: true,
    isLaborCostApplicable: false,
    isActive: true,
    notes: "粗利益 - 販管費",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "sub-006",
    subjectCode: "K001",
    subjectName: "従業員数",
    subjectNameShort: "従業員",
    subjectClass: "BASE",
    subjectType: "KPI",
    postingAllowed: true,
    measureKind: "COUNT",
    unit: "人",
    scale: 1,
    aggregationMethod: "EOP",
    direction: null,
    allowNegative: false,
    isLaborCostApplicable: false,
    isActive: true,
    notes: "KPI指標",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "sub-007",
    subjectCode: "7010",
    subjectName: "未割当科目",
    subjectNameShort: "未割当",
    subjectClass: "BASE",
    subjectType: "FIN",
    postingAllowed: true,
    measureKind: "AMOUNT",
    unit: "円",
    scale: 1,
    aggregationMethod: "SUM",
    direction: null,
    allowNegative: true,
    isLaborCostApplicable: false,
    isActive: true,
    notes: "どの集計科目にも属さない科目",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "sub-008",
    subjectCode: "6011",
    subjectName: "給与手当",
    subjectNameShort: "給与",
    subjectClass: "BASE",
    subjectType: "FIN",
    postingAllowed: true,
    measureKind: "AMOUNT",
    unit: "円",
    scale: 1,
    aggregationMethod: "SUM",
    direction: "DEBIT",
    allowNegative: false,
    isLaborCostApplicable: true, // 労務費単価で利用可能
    isActive: true,
    notes: "給与手当の科目",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "sub-009",
    subjectCode: "6012",
    subjectName: "法定福利費",
    subjectNameShort: "法福",
    subjectClass: "BASE",
    subjectType: "FIN",
    postingAllowed: true,
    measureKind: "AMOUNT",
    unit: "円",
    scale: 1,
    aggregationMethod: "SUM",
    direction: "DEBIT",
    allowNegative: false,
    isLaborCostApplicable: true, // 労務費単価で利用可能
    isActive: true,
    notes: "法定福利費の科目",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "sub-010",
    subjectCode: "6013",
    subjectName: "賞与",
    subjectNameShort: "賞与",
    subjectClass: "BASE",
    subjectType: "FIN",
    postingAllowed: true,
    measureKind: "AMOUNT",
    unit: "円",
    scale: 1,
    aggregationMethod: "SUM",
    direction: "DEBIT",
    allowNegative: false,
    isLaborCostApplicable: true, // 労務費単価で利用可能
    isActive: true,
    notes: "賞与の科目",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
]

export class MockBffClient implements BffClient {
  private subjects = [...mockSubjects]

  async getSubjectTree(request: BffSubjectTreeRequest): Promise<BffSubjectTreeResponse> {
    await this.delay(300)

    let filtered = [...this.subjects]

    // フィルタリング
    if (request.keyword) {
      const keyword = request.keyword.toLowerCase()
      filtered = filtered.filter(
        (s) => s.subjectCode.toLowerCase().includes(keyword) || s.subjectName.toLowerCase().includes(keyword),
      )
    }

    if (request.subjectType) {
      filtered = filtered.filter((s) => s.subjectType === request.subjectType)
    }

    if (request.subjectClass) {
      filtered = filtered.filter((s) => s.subjectClass === request.subjectClass)
    }

    if (request.isActive !== undefined) {
      filtered = filtered.filter((s) => s.isActive === request.isActive)
    }

    // ツリー構造を構築
    const nodes: BffSubjectTreeNode[] = []
    const unassigned: BffSubjectTreeNode[] = []

    // GP01（粗利益）のノード
    const gp01Node: BffSubjectTreeNode = {
      id: "sub-003",
      subjectCode: "GP01",
      subjectName: "粗利益",
      subjectClass: "AGGREGATE",
      subjectType: "FIN",
      isActive: true,
      children: [
        {
          id: "sub-001",
          subjectCode: "4010",
          subjectName: "売上高",
          subjectClass: "BASE",
          subjectType: "FIN",
          isActive: true,
          coefficient: 1,
          children: [],
        },
        {
          id: "sub-002",
          subjectCode: "5010",
          subjectName: "売上原価",
          subjectClass: "BASE",
          subjectType: "FIN",
          isActive: true,
          coefficient: -1,
          children: [],
        },
      ],
    }

    // OP01（営業利益）のノード
    const op01Node: BffSubjectTreeNode = {
      id: "sub-005",
      subjectCode: "OP01",
      subjectName: "営業利益",
      subjectClass: "AGGREGATE",
      subjectType: "FIN",
      isActive: true,
      children: [
        gp01Node,
        {
          id: "sub-004",
          subjectCode: "6010",
          subjectName: "販売費及び一般管理費",
          subjectClass: "BASE",
          subjectType: "FIN",
          isActive: true,
          coefficient: -1,
          children: [],
        },
      ],
    }

    nodes.push(op01Node)

    // 未割当科目
    unassigned.push({
      id: "sub-006",
      subjectCode: "K001",
      subjectName: "従業員数",
      subjectClass: "BASE",
      subjectType: "KPI",
      isActive: true,
      children: [],
    })

    unassigned.push({
      id: "sub-007",
      subjectCode: "7010",
      subjectName: "未割当科目",
      subjectClass: "BASE",
      subjectType: "FIN",
      isActive: true,
      children: [],
    })

    return { nodes, unassigned }
  }

  async getSubjectDetail(id: string): Promise<BffSubjectDetailResponse> {
    await this.delay(200)

    const subject = this.subjects.find((s) => s.id === id)
    if (!subject) {
      throw new Error("SUBJECT_NOT_FOUND")
    }

    return subject
  }

  async createSubject(request: BffCreateSubjectRequest): Promise<BffSubjectDetailResponse> {
    await this.delay(400)

    // 重複チェック
    const duplicate = this.subjects.find((s) => s.subjectCode === request.subjectCode)
    if (duplicate) {
      throw new Error("SUBJECT_CODE_DUPLICATE")
    }

    const newSubject: BffSubjectDetailResponse = {
      id: `sub-${Date.now()}`,
      subjectCode: request.subjectCode,
      subjectName: request.subjectName,
      subjectNameShort: request.subjectNameShort || null,
      subjectClass: request.subjectClass,
      subjectType: request.subjectType,
      postingAllowed: request.postingAllowed ?? request.subjectClass === "BASE",
      measureKind: request.measureKind,
      unit: request.unit || null,
      scale: request.scale || 1,
      aggregationMethod: request.aggregationMethod,
      direction: request.direction || null,
      allowNegative: request.allowNegative || false,
      isLaborCostApplicable: request.isLaborCostApplicable || false,
      isActive: true,
      notes: request.notes || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.subjects.push(newSubject)
    return newSubject
  }

  async updateSubject(id: string, request: BffUpdateSubjectRequest): Promise<BffSubjectDetailResponse> {
    await this.delay(400)

    const subject = this.subjects.find((s) => s.id === id)
    if (!subject) {
      throw new Error("SUBJECT_NOT_FOUND")
    }

    Object.assign(subject, {
      ...request,
      updatedAt: new Date().toISOString(),
    })

    return subject
  }

  async deactivateSubject(id: string): Promise<BffSubjectDetailResponse> {
    await this.delay(300)

    const subject = this.subjects.find((s) => s.id === id)
    if (!subject) {
      throw new Error("SUBJECT_NOT_FOUND")
    }

    if (!subject.isActive) {
      throw new Error("SUBJECT_ALREADY_INACTIVE")
    }

    subject.isActive = false
    subject.updatedAt = new Date().toISOString()

    return subject
  }

  async reactivateSubject(id: string): Promise<BffSubjectDetailResponse> {
    await this.delay(300)

    const subject = this.subjects.find((s) => s.id === id)
    if (!subject) {
      throw new Error("SUBJECT_NOT_FOUND")
    }

    if (subject.isActive) {
      throw new Error("SUBJECT_ALREADY_ACTIVE")
    }

    subject.isActive = true
    subject.updatedAt = new Date().toISOString()

    return subject
  }

  async addRollup(parentId: string, request: BffAddRollupRequest): Promise<BffSubjectTreeResponse> {
    await this.delay(400)

    const parent = this.subjects.find((s) => s.id === parentId)
    if (!parent) {
      throw new Error("SUBJECT_NOT_FOUND")
    }

    if (parent.subjectClass === "BASE") {
      throw new Error("CANNOT_ADD_CHILD_TO_BASE")
    }

    // ツリーを再取得して返す
    return this.getSubjectTree({})
  }

  async updateRollup(
    parentId: string,
    componentId: string,
    request: BffUpdateRollupRequest,
  ): Promise<BffSubjectTreeResponse> {
    await this.delay(400)
    return this.getSubjectTree({})
  }

  async deleteRollup(parentId: string, componentId: string): Promise<BffSubjectTreeResponse> {
    await this.delay(300)
    return this.getSubjectTree({})
  }

  async moveSubject(request: BffMoveSubjectRequest): Promise<BffSubjectTreeResponse> {
    await this.delay(400)
    return this.getSubjectTree({})
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
