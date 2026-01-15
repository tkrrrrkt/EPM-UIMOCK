import type { BffClient } from "./BffClient"
import type {
  BffGroupSubjectTreeRequest,
  BffGroupSubjectTreeResponse,
  BffGroupSubjectDetailResponse,
  BffCreateGroupSubjectRequest,
  BffUpdateGroupSubjectRequest,
  BffAddGroupRollupRequest,
  BffUpdateGroupRollupRequest,
  BffMoveGroupSubjectRequest,
  BffGroupSubjectTreeNode,
} from "@epm/contracts/bff/group-subject-master"

const mockTreeData: BffGroupSubjectTreeResponse = {
  nodes: [
    {
      id: "gs-001",
      groupSubjectCode: "NET_SALES",
      groupSubjectName: "売上高",
      subjectClass: "AGGREGATE",
      subjectType: "FIN",
      isActive: true,
      children: [
        {
          id: "gs-002",
          groupSubjectCode: "PRODUCT_SALES",
          groupSubjectName: "製品売上高",
          subjectClass: "BASE",
          subjectType: "FIN",
          isActive: true,
          coefficient: 1,
          children: [],
        },
        {
          id: "gs-003",
          groupSubjectCode: "SERVICE_SALES",
          groupSubjectName: "サービス売上高",
          subjectClass: "BASE",
          subjectType: "FIN",
          isActive: true,
          coefficient: 1,
          children: [],
        },
      ],
    },
    {
      id: "gs-010",
      groupSubjectCode: "GROSS_PROFIT",
      groupSubjectName: "売上総利益",
      subjectClass: "AGGREGATE",
      subjectType: "FIN",
      isActive: true,
      children: [
        {
          id: "gs-001",
          groupSubjectCode: "NET_SALES",
          groupSubjectName: "売上高",
          subjectClass: "AGGREGATE",
          subjectType: "FIN",
          isActive: true,
          coefficient: 1,
          children: [],
        },
        {
          id: "gs-011",
          groupSubjectCode: "COGS",
          groupSubjectName: "売上原価",
          subjectClass: "BASE",
          subjectType: "FIN",
          isActive: true,
          coefficient: -1,
          children: [],
        },
      ],
    },
    {
      id: "gs-020",
      groupSubjectCode: "OPERATING_PROFIT",
      groupSubjectName: "営業利益",
      subjectClass: "AGGREGATE",
      subjectType: "FIN",
      isActive: true,
      children: [
        {
          id: "gs-010",
          groupSubjectCode: "GROSS_PROFIT",
          groupSubjectName: "売上総利益",
          subjectClass: "AGGREGATE",
          subjectType: "FIN",
          isActive: true,
          coefficient: 1,
          children: [],
        },
        {
          id: "gs-021",
          groupSubjectCode: "SG_A",
          groupSubjectName: "販売費及び一般管理費",
          subjectClass: "BASE",
          subjectType: "FIN",
          isActive: true,
          coefficient: -1,
          children: [],
        },
      ],
    },
  ],
  unassigned: [
    {
      id: "gs-100",
      groupSubjectCode: "MISC_INCOME",
      groupSubjectName: "雑収入",
      subjectClass: "BASE",
      subjectType: "FIN",
      isActive: true,
      children: [],
    },
    {
      id: "gs-101",
      groupSubjectCode: "HEADCOUNT",
      groupSubjectName: "従業員数",
      subjectClass: "BASE",
      subjectType: "KPI",
      isActive: true,
      children: [],
    },
  ],
  isParentCompany: true,
}

const mockDetails: Record<string, BffGroupSubjectDetailResponse> = {
  "gs-001": {
    id: "gs-001",
    groupSubjectCode: "NET_SALES",
    groupSubjectName: "売上高",
    groupSubjectNameShort: "売上",
    subjectClass: "AGGREGATE",
    subjectType: "FIN",
    postingAllowed: false,
    measureKind: "AMOUNT",
    unit: "JPY",
    scale: 0,
    aggregationMethod: "SUM",
    finStmtClass: "PL",
    glElement: "REVENUE",
    normalBalance: "credit",
    isContra: false,
    isActive: true,
    notes: "連結売上高の集計科目",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-05T10:30:00Z",
    isParentCompany: true,
  },
  "gs-002": {
    id: "gs-002",
    groupSubjectCode: "PRODUCT_SALES",
    groupSubjectName: "製品売上高",
    groupSubjectNameShort: "製品売上",
    subjectClass: "BASE",
    subjectType: "FIN",
    postingAllowed: true,
    measureKind: "AMOUNT",
    unit: "JPY",
    scale: 0,
    aggregationMethod: "SUM",
    finStmtClass: "PL",
    glElement: "REVENUE",
    normalBalance: "credit",
    isContra: false,
    isActive: true,
    notes: "製品販売による売上",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-03T14:20:00Z",
    isParentCompany: true,
  },
  "gs-003": {
    id: "gs-003",
    groupSubjectCode: "SERVICE_SALES",
    groupSubjectName: "サービス売上高",
    groupSubjectNameShort: "サービス売上",
    subjectClass: "BASE",
    subjectType: "FIN",
    postingAllowed: true,
    measureKind: "AMOUNT",
    unit: "JPY",
    scale: 0,
    aggregationMethod: "SUM",
    finStmtClass: "PL",
    glElement: "REVENUE",
    normalBalance: "credit",
    isContra: false,
    isActive: true,
    notes: "サービス提供による売上",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-03T14:20:00Z",
    isParentCompany: true,
  },
  "gs-010": {
    id: "gs-010",
    groupSubjectCode: "GROSS_PROFIT",
    groupSubjectName: "売上総利益",
    groupSubjectNameShort: "粗利",
    subjectClass: "AGGREGATE",
    subjectType: "FIN",
    postingAllowed: false,
    measureKind: "AMOUNT",
    unit: "JPY",
    scale: 0,
    aggregationMethod: "SUM",
    finStmtClass: "PL",
    glElement: "REVENUE",
    normalBalance: "credit",
    isContra: false,
    isActive: true,
    notes: "売上高から売上原価を控除した利益",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-03T14:20:00Z",
    isParentCompany: true,
  },
  "gs-011": {
    id: "gs-011",
    groupSubjectCode: "COGS",
    groupSubjectName: "売上原価",
    groupSubjectNameShort: "原価",
    subjectClass: "BASE",
    subjectType: "FIN",
    postingAllowed: true,
    measureKind: "AMOUNT",
    unit: "JPY",
    scale: 0,
    aggregationMethod: "SUM",
    finStmtClass: "PL",
    glElement: "EXPENSE",
    normalBalance: "debit",
    isContra: false,
    isActive: true,
    notes: "売上に対応する原価",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-03T14:20:00Z",
    isParentCompany: true,
  },
  "gs-020": {
    id: "gs-020",
    groupSubjectCode: "OPERATING_PROFIT",
    groupSubjectName: "営業利益",
    groupSubjectNameShort: "営業利益",
    subjectClass: "AGGREGATE",
    subjectType: "FIN",
    postingAllowed: false,
    measureKind: "AMOUNT",
    unit: "JPY",
    scale: 0,
    aggregationMethod: "SUM",
    finStmtClass: "PL",
    glElement: "REVENUE",
    normalBalance: "credit",
    isContra: false,
    isActive: true,
    notes: "売上総利益から販管費を控除した利益",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-03T14:20:00Z",
    isParentCompany: true,
  },
  "gs-021": {
    id: "gs-021",
    groupSubjectCode: "SG_A",
    groupSubjectName: "販売費及び一般管理費",
    groupSubjectNameShort: "販管費",
    subjectClass: "BASE",
    subjectType: "FIN",
    postingAllowed: true,
    measureKind: "AMOUNT",
    unit: "JPY",
    scale: 0,
    aggregationMethod: "SUM",
    finStmtClass: "PL",
    glElement: "EXPENSE",
    normalBalance: "debit",
    isContra: false,
    isActive: true,
    notes: "販売費及び一般管理費",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-03T14:20:00Z",
    isParentCompany: true,
  },
  "gs-100": {
    id: "gs-100",
    groupSubjectCode: "MISC_INCOME",
    groupSubjectName: "雑収入",
    groupSubjectNameShort: "雑収入",
    subjectClass: "BASE",
    subjectType: "FIN",
    postingAllowed: true,
    measureKind: "AMOUNT",
    unit: "JPY",
    scale: 0,
    aggregationMethod: "SUM",
    finStmtClass: "PL",
    glElement: "REVENUE",
    normalBalance: "credit",
    isContra: false,
    isActive: true,
    notes: "その他の雑収入",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-03T14:20:00Z",
    isParentCompany: true,
  },
  "gs-101": {
    id: "gs-101",
    groupSubjectCode: "HEADCOUNT",
    groupSubjectName: "従業員数",
    groupSubjectNameShort: "人数",
    subjectClass: "BASE",
    subjectType: "KPI",
    postingAllowed: true,
    measureKind: "COUNT",
    unit: "人",
    scale: 0,
    aggregationMethod: "EOP",
    finStmtClass: null,
    glElement: null,
    normalBalance: null,
    isContra: false,
    isActive: true,
    notes: "期末時点の従業員数",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-03T14:20:00Z",
    isParentCompany: true,
  },
}

export class MockBffClient implements BffClient {
  private treeData: BffGroupSubjectTreeResponse = mockTreeData

  async getTree(request: BffGroupSubjectTreeRequest): Promise<BffGroupSubjectTreeResponse> {
    await this.delay(300)

    let filteredNodes = [...this.treeData.nodes]
    let filteredUnassigned = [...this.treeData.unassigned]

    if (request.keyword) {
      const keyword = request.keyword.toLowerCase()
      filteredNodes = this.filterTreeByKeyword(filteredNodes, keyword)
      filteredUnassigned = filteredUnassigned.filter(
        (node) =>
          node.groupSubjectCode.toLowerCase().includes(keyword) ||
          node.groupSubjectName.toLowerCase().includes(keyword),
      )
    }

    if (request.subjectType) {
      filteredNodes = this.filterTreeByType(filteredNodes, request.subjectType)
      filteredUnassigned = filteredUnassigned.filter((node) => node.subjectType === request.subjectType)
    }

    if (request.subjectClass) {
      filteredNodes = this.filterTreeByClass(filteredNodes, request.subjectClass)
      filteredUnassigned = filteredUnassigned.filter((node) => node.subjectClass === request.subjectClass)
    }

    if (request.isActive !== undefined) {
      filteredNodes = this.filterTreeByActive(filteredNodes, request.isActive)
      filteredUnassigned = filteredUnassigned.filter((node) => node.isActive === request.isActive)
    }

    return {
      nodes: filteredNodes,
      unassigned: filteredUnassigned,
      isParentCompany: this.treeData.isParentCompany,
    }
  }

  async getDetail(id: string): Promise<BffGroupSubjectDetailResponse> {
    await this.delay(200)
    const detail = mockDetails[id]
    if (!detail) {
      throw new Error("GROUP_SUBJECT_NOT_FOUND")
    }
    return detail
  }

  async create(request: BffCreateGroupSubjectRequest): Promise<BffGroupSubjectDetailResponse> {
    await this.delay(400)
    const newDetail: BffGroupSubjectDetailResponse = {
      id: `gs-${Date.now()}`,
      groupSubjectCode: request.groupSubjectCode,
      groupSubjectName: request.groupSubjectName,
      groupSubjectNameShort: request.groupSubjectNameShort || null,
      subjectClass: request.subjectClass,
      subjectType: request.subjectType,
      postingAllowed: request.postingAllowed ?? request.subjectClass === "BASE",
      measureKind: request.measureKind,
      unit: request.unit || null,
      scale: request.scale ?? 0,
      aggregationMethod: request.aggregationMethod,
      finStmtClass: request.finStmtClass || null,
      glElement: request.glElement || null,
      normalBalance: request.normalBalance || null,
      isContra: request.isContra ?? false,
      isActive: true,
      notes: request.notes || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isParentCompany: true,
    }
    return newDetail
  }

  async update(id: string, request: BffUpdateGroupSubjectRequest): Promise<BffGroupSubjectDetailResponse> {
    await this.delay(300)
    const existing = mockDetails[id]
    if (!existing) {
      throw new Error("GROUP_SUBJECT_NOT_FOUND")
    }
    return {
      ...existing,
      ...request,
      updatedAt: new Date().toISOString(),
    }
  }

  async deactivate(id: string): Promise<BffGroupSubjectDetailResponse> {
    await this.delay(300)
    const existing = mockDetails[id]
    if (!existing) {
      throw new Error("GROUP_SUBJECT_NOT_FOUND")
    }
    return {
      ...existing,
      isActive: false,
      updatedAt: new Date().toISOString(),
    }
  }

  async reactivate(id: string): Promise<BffGroupSubjectDetailResponse> {
    await this.delay(300)
    const existing = mockDetails[id]
    if (!existing) {
      throw new Error("GROUP_SUBJECT_NOT_FOUND")
    }
    return {
      ...existing,
      isActive: true,
      updatedAt: new Date().toISOString(),
    }
  }

  async addRollup(parentId: string, request: BffAddGroupRollupRequest): Promise<BffGroupSubjectTreeResponse> {
    await this.delay(300)
    return this.treeData
  }

  async updateRollup(
    parentId: string,
    componentId: string,
    request: BffUpdateGroupRollupRequest,
  ): Promise<BffGroupSubjectTreeResponse> {
    await this.delay(300)
    return this.treeData
  }

  async deleteRollup(parentId: string, componentId: string): Promise<BffGroupSubjectTreeResponse> {
    await this.delay(300)
    return this.treeData
  }

  async move(request: BffMoveGroupSubjectRequest): Promise<BffGroupSubjectTreeResponse> {
    await this.delay(300)
    return this.treeData
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  private filterTreeByKeyword(nodes: BffGroupSubjectTreeNode[], keyword: string): BffGroupSubjectTreeNode[] {
    return nodes
      .map((node) => ({
        ...node,
        children: this.filterTreeByKeyword(node.children, keyword),
      }))
      .filter(
        (node) =>
          node.groupSubjectCode.toLowerCase().includes(keyword) ||
          node.groupSubjectName.toLowerCase().includes(keyword) ||
          node.children.length > 0,
      )
  }

  private filterTreeByType(nodes: BffGroupSubjectTreeNode[], type: "FIN" | "KPI"): BffGroupSubjectTreeNode[] {
    return nodes
      .map((node) => ({
        ...node,
        children: this.filterTreeByType(node.children, type),
      }))
      .filter((node) => node.subjectType === type)
  }

  private filterTreeByClass(nodes: BffGroupSubjectTreeNode[], cls: "BASE" | "AGGREGATE"): BffGroupSubjectTreeNode[] {
    return nodes
      .map((node) => ({
        ...node,
        children: this.filterTreeByClass(node.children, cls),
      }))
      .filter((node) => node.subjectClass === cls)
  }

  private filterTreeByActive(nodes: BffGroupSubjectTreeNode[], isActive: boolean): BffGroupSubjectTreeNode[] {
    return nodes
      .map((node) => ({
        ...node,
        children: this.filterTreeByActive(node.children, isActive),
      }))
      .filter((node) => node.isActive === isActive)
  }
}
