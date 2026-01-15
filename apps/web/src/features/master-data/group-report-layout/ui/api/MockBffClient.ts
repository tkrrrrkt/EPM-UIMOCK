import type { BffClient } from "./BffClient"
import type {
  BffGroupLayoutListRequest,
  BffGroupLayoutListResponse,
  BffGroupLayoutDetailResponse,
  BffGroupLayoutSummary,
  BffCreateGroupLayoutRequest,
  BffUpdateGroupLayoutRequest,
  BffCopyGroupLayoutRequest,
  BffGroupLineListResponse,
  BffGroupLineDetailResponse,
  BffGroupLineSummary,
  BffCreateGroupLineRequest,
  BffUpdateGroupLineRequest,
  BffMoveGroupLineRequest,
  BffGroupSubjectSearchRequest,
  BffGroupSubjectSearchResponse,
  BffGroupSubjectSummary,
  BffGroupLayoutContextResponse,
  LayoutType,
  LineType,
  SignDisplayPolicy,
  SubjectClass,
} from "@epm/contracts/bff/group-report-layout"

// Mock data storage
interface LayoutData extends Omit<BffGroupLayoutDetailResponse, "createdAt" | "updatedAt"> {
  createdAt: Date
  updatedAt: Date
  lineCount: number
}

interface LineData extends Omit<BffGroupLineDetailResponse, "createdAt" | "updatedAt"> {
  createdAt: Date
  updatedAt: Date
}

interface GroupSubjectData {
  id: string
  groupSubjectCode: string
  groupSubjectName: string
  subjectClass: SubjectClass
  subjectType: "FIN" | "KPI"
  finStmtClass: "PL" | "BS" | null
  isActive: boolean
}

// Initial mock layouts
const mockLayouts: LayoutData[] = [
  {
    id: "gl-001",
    layoutCode: "C_PL_STD",
    layoutName: "連結損益計算書（標準）",
    layoutNameShort: "連結PL標準",
    layoutType: "PL",
    description: "グループ連結用の標準損益計算書レイアウト",
    isDefault: true,
    isActive: true,
    sortOrder: 10,
    lineCount: 15,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-06-15"),
  },
  {
    id: "gl-002",
    layoutCode: "C_PL_MGT",
    layoutName: "連結損益計算書（管理会計用）",
    layoutNameShort: "連結PL管理",
    layoutType: "PL",
    description: "管理会計用の連結損益計算書",
    isDefault: false,
    isActive: true,
    sortOrder: 20,
    lineCount: 20,
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-05-20"),
  },
  {
    id: "gl-003",
    layoutCode: "C_BS_STD",
    layoutName: "連結貸借対照表（標準）",
    layoutNameShort: "連結BS標準",
    layoutType: "BS",
    description: "グループ連結用の標準貸借対照表レイアウト",
    isDefault: true,
    isActive: true,
    sortOrder: 10,
    lineCount: 25,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-04-10"),
  },
  {
    id: "gl-004",
    layoutCode: "C_KPI_EXEC",
    layoutName: "連結KPI（経営ダッシュボード）",
    layoutNameShort: "連結KPI経営",
    layoutType: "KPI",
    description: "経営層向けKPIダッシュボード用レイアウト",
    isDefault: true,
    isActive: true,
    sortOrder: 10,
    lineCount: 12,
    createdAt: new Date("2024-03-01"),
    updatedAt: new Date("2024-06-01"),
  },
  {
    id: "gl-005",
    layoutCode: "C_PL_OLD",
    layoutName: "連結損益計算書（旧フォーマット）",
    layoutNameShort: "連結PL旧",
    layoutType: "PL",
    description: "過去互換用の旧フォーマット",
    isDefault: false,
    isActive: false,
    sortOrder: 99,
    lineCount: 18,
    createdAt: new Date("2023-06-01"),
    updatedAt: new Date("2024-01-15"),
  },
]

// Initial mock lines for gl-001 (連結PL標準)
const mockLines: LineData[] = [
  {
    id: "gln-001",
    layoutId: "gl-001",
    lineNo: 10,
    lineType: "header",
    displayName: "売上高",
    groupSubjectId: null,
    groupSubjectCode: null,
    groupSubjectName: null,
    subjectClass: null,
    indentLevel: 0,
    signDisplayPolicy: "auto",
    isBold: true,
    isUnderline: false,
    isDoubleUnderline: false,
    bgHighlight: false,
    notes: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "gln-002",
    layoutId: "gl-001",
    lineNo: 20,
    lineType: "account",
    displayName: null,
    groupSubjectId: "gs-001",
    groupSubjectCode: "C4100",
    groupSubjectName: "売上高合計",
    subjectClass: "AGGREGATE",
    indentLevel: 1,
    signDisplayPolicy: "auto",
    isBold: false,
    isUnderline: false,
    isDoubleUnderline: false,
    bgHighlight: false,
    notes: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "gln-003",
    layoutId: "gl-001",
    lineNo: 30,
    lineType: "header",
    displayName: "売上原価",
    groupSubjectId: null,
    groupSubjectCode: null,
    groupSubjectName: null,
    subjectClass: null,
    indentLevel: 0,
    signDisplayPolicy: "auto",
    isBold: true,
    isUnderline: false,
    isDoubleUnderline: false,
    bgHighlight: false,
    notes: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "gln-004",
    layoutId: "gl-001",
    lineNo: 40,
    lineType: "account",
    displayName: null,
    groupSubjectId: "gs-002",
    groupSubjectCode: "C5100",
    groupSubjectName: "売上原価合計",
    subjectClass: "AGGREGATE",
    indentLevel: 1,
    signDisplayPolicy: "force_minus",
    isBold: false,
    isUnderline: false,
    isDoubleUnderline: false,
    bgHighlight: false,
    notes: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "gln-005",
    layoutId: "gl-001",
    lineNo: 50,
    lineType: "blank",
    displayName: null,
    groupSubjectId: null,
    groupSubjectCode: null,
    groupSubjectName: null,
    subjectClass: null,
    indentLevel: 0,
    signDisplayPolicy: "auto",
    isBold: false,
    isUnderline: false,
    isDoubleUnderline: false,
    bgHighlight: false,
    notes: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "gln-006",
    layoutId: "gl-001",
    lineNo: 60,
    lineType: "header",
    displayName: "売上総利益",
    groupSubjectId: null,
    groupSubjectCode: null,
    groupSubjectName: null,
    subjectClass: null,
    indentLevel: 0,
    signDisplayPolicy: "auto",
    isBold: true,
    isUnderline: true,
    isDoubleUnderline: false,
    bgHighlight: true,
    notes: "売上高-売上原価",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "gln-007",
    layoutId: "gl-001",
    lineNo: 70,
    lineType: "account",
    displayName: null,
    groupSubjectId: "gs-003",
    groupSubjectCode: "C5900",
    groupSubjectName: "売上総利益",
    subjectClass: "AGGREGATE",
    indentLevel: 1,
    signDisplayPolicy: "auto",
    isBold: true,
    isUnderline: false,
    isDoubleUnderline: true,
    bgHighlight: false,
    notes: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "gln-008",
    layoutId: "gl-001",
    lineNo: 80,
    lineType: "note",
    displayName: "※内部取引消去後",
    groupSubjectId: null,
    groupSubjectCode: null,
    groupSubjectName: null,
    subjectClass: null,
    indentLevel: 2,
    signDisplayPolicy: "auto",
    isBold: false,
    isUnderline: false,
    isDoubleUnderline: false,
    bgHighlight: false,
    notes: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
]

// Mock group subjects (連結科目)
const mockGroupSubjects: GroupSubjectData[] = [
  { id: "gs-001", groupSubjectCode: "C4100", groupSubjectName: "売上高合計", subjectClass: "AGGREGATE", subjectType: "FIN", finStmtClass: "PL", isActive: true },
  { id: "gs-002", groupSubjectCode: "C5100", groupSubjectName: "売上原価合計", subjectClass: "AGGREGATE", subjectType: "FIN", finStmtClass: "PL", isActive: true },
  { id: "gs-003", groupSubjectCode: "C5900", groupSubjectName: "売上総利益", subjectClass: "AGGREGATE", subjectType: "FIN", finStmtClass: "PL", isActive: true },
  { id: "gs-004", groupSubjectCode: "C6100", groupSubjectName: "販売費合計", subjectClass: "AGGREGATE", subjectType: "FIN", finStmtClass: "PL", isActive: true },
  { id: "gs-005", groupSubjectCode: "C6200", groupSubjectName: "一般管理費合計", subjectClass: "AGGREGATE", subjectType: "FIN", finStmtClass: "PL", isActive: true },
  { id: "gs-006", groupSubjectCode: "C6900", groupSubjectName: "営業利益", subjectClass: "AGGREGATE", subjectType: "FIN", finStmtClass: "PL", isActive: true },
  { id: "gs-007", groupSubjectCode: "C7100", groupSubjectName: "営業外収益合計", subjectClass: "AGGREGATE", subjectType: "FIN", finStmtClass: "PL", isActive: true },
  { id: "gs-008", groupSubjectCode: "C7200", groupSubjectName: "営業外費用合計", subjectClass: "AGGREGATE", subjectType: "FIN", finStmtClass: "PL", isActive: true },
  { id: "gs-009", groupSubjectCode: "C7900", groupSubjectName: "経常利益", subjectClass: "AGGREGATE", subjectType: "FIN", finStmtClass: "PL", isActive: true },
  { id: "gs-010", groupSubjectCode: "C8900", groupSubjectName: "税引前当期純利益", subjectClass: "AGGREGATE", subjectType: "FIN", finStmtClass: "PL", isActive: true },
  { id: "gs-011", groupSubjectCode: "C4110", groupSubjectName: "国内売上高", subjectClass: "BASE", subjectType: "FIN", finStmtClass: "PL", isActive: true },
  { id: "gs-012", groupSubjectCode: "C4120", groupSubjectName: "海外売上高", subjectClass: "BASE", subjectType: "FIN", finStmtClass: "PL", isActive: true },
  // BS subjects
  { id: "gs-101", groupSubjectCode: "C1100", groupSubjectName: "流動資産合計", subjectClass: "AGGREGATE", subjectType: "FIN", finStmtClass: "BS", isActive: true },
  { id: "gs-102", groupSubjectCode: "C1200", groupSubjectName: "固定資産合計", subjectClass: "AGGREGATE", subjectType: "FIN", finStmtClass: "BS", isActive: true },
  { id: "gs-103", groupSubjectCode: "C1900", groupSubjectName: "資産合計", subjectClass: "AGGREGATE", subjectType: "FIN", finStmtClass: "BS", isActive: true },
  { id: "gs-104", groupSubjectCode: "C2100", groupSubjectName: "流動負債合計", subjectClass: "AGGREGATE", subjectType: "FIN", finStmtClass: "BS", isActive: true },
  { id: "gs-105", groupSubjectCode: "C2200", groupSubjectName: "固定負債合計", subjectClass: "AGGREGATE", subjectType: "FIN", finStmtClass: "BS", isActive: true },
  { id: "gs-106", groupSubjectCode: "C2900", groupSubjectName: "負債合計", subjectClass: "AGGREGATE", subjectType: "FIN", finStmtClass: "BS", isActive: true },
  { id: "gs-107", groupSubjectCode: "C3100", groupSubjectName: "株主資本合計", subjectClass: "AGGREGATE", subjectType: "FIN", finStmtClass: "BS", isActive: true },
  { id: "gs-108", groupSubjectCode: "C3900", groupSubjectName: "純資産合計", subjectClass: "AGGREGATE", subjectType: "FIN", finStmtClass: "BS", isActive: true },
  // KPI subjects
  { id: "gs-201", groupSubjectCode: "K0001", groupSubjectName: "ROE", subjectClass: "BASE", subjectType: "KPI", finStmtClass: null, isActive: true },
  { id: "gs-202", groupSubjectCode: "K0002", groupSubjectName: "ROA", subjectClass: "BASE", subjectType: "KPI", finStmtClass: null, isActive: true },
  { id: "gs-203", groupSubjectCode: "K0003", groupSubjectName: "売上高営業利益率", subjectClass: "BASE", subjectType: "KPI", finStmtClass: null, isActive: true },
  { id: "gs-204", groupSubjectCode: "K0004", groupSubjectName: "自己資本比率", subjectClass: "BASE", subjectType: "KPI", finStmtClass: null, isActive: true },
  { id: "gs-205", groupSubjectCode: "K0005", groupSubjectName: "従業員数", subjectClass: "BASE", subjectType: "KPI", finStmtClass: null, isActive: true },
  { id: "gs-206", groupSubjectCode: "K0006", groupSubjectName: "従業員一人当たり売上高", subjectClass: "BASE", subjectType: "KPI", finStmtClass: null, isActive: true },
]

// Simulate async delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export class MockBffClient implements BffClient {
  private layouts: LayoutData[] = [...mockLayouts]
  private lines: LineData[] = [...mockLines]
  private groupSubjects: GroupSubjectData[] = [...mockGroupSubjects]
  private isParentCompany = true // Mock: default to parent company

  async getContext(): Promise<BffGroupLayoutContextResponse> {
    await delay(100)
    return {
      isParentCompany: this.isParentCompany,
      canEdit: this.isParentCompany,
    }
  }

  async getLayouts(request: BffGroupLayoutListRequest): Promise<BffGroupLayoutListResponse> {
    await delay(200)

    let filtered = [...this.layouts]

    // Filter by keyword
    if (request.keyword) {
      const keyword = request.keyword.toLowerCase()
      filtered = filtered.filter(
        (l) =>
          l.layoutCode.toLowerCase().includes(keyword) ||
          l.layoutName.toLowerCase().includes(keyword)
      )
    }

    // Filter by layoutType
    if (request.layoutType) {
      filtered = filtered.filter((l) => l.layoutType === request.layoutType)
    }

    // Filter by isActive
    if (request.isActive !== undefined) {
      filtered = filtered.filter((l) => l.isActive === request.isActive)
    }

    // Sort
    const sortBy = request.sortBy || "layoutCode"
    const sortOrder = request.sortOrder || "asc"
    filtered.sort((a, b) => {
      let comparison = 0
      if (sortBy === "layoutCode") {
        comparison = a.layoutCode.localeCompare(b.layoutCode)
      } else if (sortBy === "layoutName") {
        comparison = a.layoutName.localeCompare(b.layoutName)
      } else if (sortBy === "sortOrder") {
        comparison = a.sortOrder - b.sortOrder
      }
      return sortOrder === "asc" ? comparison : -comparison
    })

    // Pagination
    const page = request.page || 1
    const pageSize = request.pageSize || 50
    const totalCount = filtered.length
    const totalPages = Math.ceil(totalCount / pageSize)
    const startIndex = (page - 1) * pageSize
    const paginatedItems = filtered.slice(startIndex, startIndex + pageSize)

    const items: BffGroupLayoutSummary[] = paginatedItems.map((l) => ({
      id: l.id,
      layoutCode: l.layoutCode,
      layoutName: l.layoutName,
      layoutNameShort: l.layoutNameShort,
      layoutType: l.layoutType,
      isDefault: l.isDefault,
      isActive: l.isActive,
      lineCount: this.lines.filter((line) => line.layoutId === l.id).length,
      sortOrder: l.sortOrder,
    }))

    return {
      items,
      totalCount,
      page,
      pageSize,
      totalPages,
    }
  }

  async getLayoutDetail(id: string): Promise<BffGroupLayoutDetailResponse> {
    await delay(150)

    const layout = this.layouts.find((l) => l.id === id)
    if (!layout) {
      throw new Error("LAYOUT_NOT_FOUND")
    }

    return {
      id: layout.id,
      layoutCode: layout.layoutCode,
      layoutName: layout.layoutName,
      layoutNameShort: layout.layoutNameShort,
      layoutType: layout.layoutType,
      description: layout.description,
      isDefault: layout.isDefault,
      isActive: layout.isActive,
      sortOrder: layout.sortOrder,
      createdAt: layout.createdAt.toISOString(),
      updatedAt: layout.updatedAt.toISOString(),
    }
  }

  async createLayout(request: BffCreateGroupLayoutRequest): Promise<BffGroupLayoutDetailResponse> {
    await delay(300)

    if (!this.isParentCompany) {
      throw new Error("NOT_PARENT_COMPANY")
    }

    // Check duplicate
    const existing = this.layouts.find(
      (l) => l.layoutType === request.layoutType && l.layoutCode === request.layoutCode
    )
    if (existing) {
      throw new Error("LAYOUT_CODE_DUPLICATE")
    }

    const newLayout: LayoutData = {
      id: `gl-${Date.now()}`,
      layoutCode: request.layoutCode,
      layoutName: request.layoutName,
      layoutNameShort: request.layoutNameShort || null,
      layoutType: request.layoutType,
      description: request.description || null,
      isDefault: false,
      isActive: true,
      sortOrder: 10,
      lineCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.layouts.push(newLayout)

    return {
      ...newLayout,
      createdAt: newLayout.createdAt.toISOString(),
      updatedAt: newLayout.updatedAt.toISOString(),
    }
  }

  async updateLayout(id: string, request: BffUpdateGroupLayoutRequest): Promise<BffGroupLayoutDetailResponse> {
    await delay(300)

    if (!this.isParentCompany) {
      throw new Error("NOT_PARENT_COMPANY")
    }

    const layout = this.layouts.find((l) => l.id === id)
    if (!layout) {
      throw new Error("LAYOUT_NOT_FOUND")
    }

    // Check code duplicate if changing
    if (request.layoutCode && request.layoutCode !== layout.layoutCode) {
      const targetType = request.layoutType || layout.layoutType
      const existing = this.layouts.find(
        (l) => l.id !== id && l.layoutType === targetType && l.layoutCode === request.layoutCode
      )
      if (existing) {
        throw new Error("LAYOUT_CODE_DUPLICATE")
      }
    }

    // If layoutType changes, delete all lines
    if (request.layoutType && request.layoutType !== layout.layoutType) {
      this.lines = this.lines.filter((l) => l.layoutId !== id)
    }

    // Update
    if (request.layoutCode !== undefined) layout.layoutCode = request.layoutCode
    if (request.layoutName !== undefined) layout.layoutName = request.layoutName
    if (request.layoutNameShort !== undefined) layout.layoutNameShort = request.layoutNameShort
    if (request.description !== undefined) layout.description = request.description
    if (request.layoutType !== undefined) layout.layoutType = request.layoutType
    layout.updatedAt = new Date()

    return {
      ...layout,
      createdAt: layout.createdAt.toISOString(),
      updatedAt: layout.updatedAt.toISOString(),
    }
  }

  async deactivateLayout(id: string): Promise<BffGroupLayoutDetailResponse> {
    await delay(200)

    if (!this.isParentCompany) {
      throw new Error("NOT_PARENT_COMPANY")
    }

    const layout = this.layouts.find((l) => l.id === id)
    if (!layout) {
      throw new Error("LAYOUT_NOT_FOUND")
    }

    if (!layout.isActive) {
      throw new Error("LAYOUT_ALREADY_INACTIVE")
    }

    if (layout.isDefault) {
      throw new Error("DEFAULT_LAYOUT_CANNOT_DEACTIVATE")
    }

    layout.isActive = false
    layout.updatedAt = new Date()

    return {
      ...layout,
      createdAt: layout.createdAt.toISOString(),
      updatedAt: layout.updatedAt.toISOString(),
    }
  }

  async reactivateLayout(id: string): Promise<BffGroupLayoutDetailResponse> {
    await delay(200)

    if (!this.isParentCompany) {
      throw new Error("NOT_PARENT_COMPANY")
    }

    const layout = this.layouts.find((l) => l.id === id)
    if (!layout) {
      throw new Error("LAYOUT_NOT_FOUND")
    }

    if (layout.isActive) {
      throw new Error("LAYOUT_ALREADY_ACTIVE")
    }

    layout.isActive = true
    layout.updatedAt = new Date()

    return {
      ...layout,
      createdAt: layout.createdAt.toISOString(),
      updatedAt: layout.updatedAt.toISOString(),
    }
  }

  async setDefaultLayout(id: string): Promise<BffGroupLayoutDetailResponse> {
    await delay(200)

    if (!this.isParentCompany) {
      throw new Error("NOT_PARENT_COMPANY")
    }

    const layout = this.layouts.find((l) => l.id === id)
    if (!layout) {
      throw new Error("LAYOUT_NOT_FOUND")
    }

    if (!layout.isActive) {
      throw new Error("INACTIVE_LAYOUT_CANNOT_SET_DEFAULT")
    }

    // Clear existing default for same type
    this.layouts.forEach((l) => {
      if (l.layoutType === layout.layoutType && l.isDefault) {
        l.isDefault = false
        l.updatedAt = new Date()
      }
    })

    // Set new default
    layout.isDefault = true
    layout.updatedAt = new Date()

    return {
      ...layout,
      createdAt: layout.createdAt.toISOString(),
      updatedAt: layout.updatedAt.toISOString(),
    }
  }

  async copyLayout(id: string, request: BffCopyGroupLayoutRequest): Promise<BffGroupLayoutDetailResponse> {
    await delay(400)

    if (!this.isParentCompany) {
      throw new Error("NOT_PARENT_COMPANY")
    }

    const sourceLayout = this.layouts.find((l) => l.id === id)
    if (!sourceLayout) {
      throw new Error("LAYOUT_NOT_FOUND")
    }

    // Check duplicate
    const existing = this.layouts.find(
      (l) => l.layoutType === sourceLayout.layoutType && l.layoutCode === request.layoutCode
    )
    if (existing) {
      throw new Error("LAYOUT_CODE_DUPLICATE")
    }

    // Create new layout
    const newLayout: LayoutData = {
      id: `gl-${Date.now()}`,
      layoutCode: request.layoutCode,
      layoutName: request.layoutName,
      layoutNameShort: sourceLayout.layoutNameShort,
      layoutType: sourceLayout.layoutType,
      description: sourceLayout.description,
      isDefault: false,
      isActive: true,
      sortOrder: sourceLayout.sortOrder + 1,
      lineCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.layouts.push(newLayout)

    // Copy all lines
    const sourceLines = this.lines.filter((l) => l.layoutId === id)
    for (const sourceLine of sourceLines) {
      const newLine: LineData = {
        ...sourceLine,
        id: `gln-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        layoutId: newLayout.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      this.lines.push(newLine)
    }

    return {
      ...newLayout,
      createdAt: newLayout.createdAt.toISOString(),
      updatedAt: newLayout.updatedAt.toISOString(),
    }
  }

  async getLines(layoutId: string): Promise<BffGroupLineListResponse> {
    await delay(150)

    const layout = this.layouts.find((l) => l.id === layoutId)
    if (!layout) {
      throw new Error("LAYOUT_NOT_FOUND")
    }

    const layoutLines = this.lines
      .filter((l) => l.layoutId === layoutId)
      .sort((a, b) => a.lineNo - b.lineNo)

    const items: BffGroupLineSummary[] = layoutLines.map((l) => ({
      id: l.id,
      layoutId: l.layoutId,
      lineNo: l.lineNo,
      lineType: l.lineType,
      displayName: l.displayName,
      groupSubjectId: l.groupSubjectId,
      groupSubjectCode: l.groupSubjectCode,
      groupSubjectName: l.groupSubjectName,
      subjectClass: l.subjectClass,
      indentLevel: l.indentLevel,
      signDisplayPolicy: l.signDisplayPolicy,
      isBold: l.isBold,
      isUnderline: l.isUnderline,
      isDoubleUnderline: l.isDoubleUnderline,
      bgHighlight: l.bgHighlight,
    }))

    return {
      layoutId,
      layoutCode: layout.layoutCode,
      items,
    }
  }

  async getLineDetail(id: string): Promise<BffGroupLineDetailResponse> {
    await delay(100)

    const line = this.lines.find((l) => l.id === id)
    if (!line) {
      throw new Error("LINE_NOT_FOUND")
    }

    return {
      ...line,
      createdAt: line.createdAt.toISOString(),
      updatedAt: line.updatedAt.toISOString(),
    }
  }

  async createLine(layoutId: string, request: BffCreateGroupLineRequest): Promise<BffGroupLineDetailResponse> {
    await delay(300)

    if (!this.isParentCompany) {
      throw new Error("NOT_PARENT_COMPANY")
    }

    const layout = this.layouts.find((l) => l.id === layoutId)
    if (!layout) {
      throw new Error("LAYOUT_NOT_FOUND")
    }

    // Validation based on lineType
    if (request.lineType === "account" && !request.groupSubjectId) {
      throw new Error("GROUP_SUBJECT_REQUIRED_FOR_ACCOUNT")
    }

    // Get group subject info if account
    let groupSubjectCode: string | null = null
    let groupSubjectName: string | null = null
    let subjectClass: SubjectClass | null = null

    if (request.groupSubjectId) {
      const subject = this.groupSubjects.find((s) => s.id === request.groupSubjectId)
      if (!subject) {
        throw new Error("GROUP_SUBJECT_NOT_FOUND")
      }
      if (!subject.isActive) {
        throw new Error("GROUP_SUBJECT_INACTIVE")
      }
      // Type mismatch check
      if (layout.layoutType === "KPI" && subject.subjectType !== "KPI") {
        throw new Error("GROUP_SUBJECT_TYPE_MISMATCH")
      }
      if ((layout.layoutType === "PL" || layout.layoutType === "BS") && subject.subjectType !== "FIN") {
        throw new Error("GROUP_SUBJECT_TYPE_MISMATCH")
      }
      if (layout.layoutType === "PL" && subject.finStmtClass !== "PL") {
        throw new Error("GROUP_SUBJECT_TYPE_MISMATCH")
      }
      if (layout.layoutType === "BS" && subject.finStmtClass !== "BS") {
        throw new Error("GROUP_SUBJECT_TYPE_MISMATCH")
      }

      groupSubjectCode = subject.groupSubjectCode
      groupSubjectName = subject.groupSubjectName
      subjectClass = subject.subjectClass
    }

    // Calculate next lineNo
    const existingLines = this.lines.filter((l) => l.layoutId === layoutId)
    const maxLineNo = existingLines.length > 0 ? Math.max(...existingLines.map((l) => l.lineNo)) : 0
    const newLineNo = maxLineNo + 10

    const newLine: LineData = {
      id: `gln-${Date.now()}`,
      layoutId,
      lineNo: newLineNo,
      lineType: request.lineType,
      displayName: request.displayName || null,
      groupSubjectId: request.groupSubjectId || null,
      groupSubjectCode,
      groupSubjectName,
      subjectClass,
      indentLevel: request.indentLevel ?? 0,
      signDisplayPolicy: request.signDisplayPolicy || "auto",
      isBold: request.isBold ?? false,
      isUnderline: request.isUnderline ?? false,
      isDoubleUnderline: request.isDoubleUnderline ?? false,
      bgHighlight: request.bgHighlight ?? false,
      notes: request.notes || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.lines.push(newLine)

    return {
      ...newLine,
      createdAt: newLine.createdAt.toISOString(),
      updatedAt: newLine.updatedAt.toISOString(),
    }
  }

  async updateLine(id: string, request: BffUpdateGroupLineRequest): Promise<BffGroupLineDetailResponse> {
    await delay(300)

    if (!this.isParentCompany) {
      throw new Error("NOT_PARENT_COMPANY")
    }

    const line = this.lines.find((l) => l.id === id)
    if (!line) {
      throw new Error("LINE_NOT_FOUND")
    }

    const layout = this.layouts.find((l) => l.id === line.layoutId)
    if (!layout) {
      throw new Error("LAYOUT_NOT_FOUND")
    }

    // Update group subject info if changing
    if (request.groupSubjectId !== undefined) {
      if (request.groupSubjectId) {
        const subject = this.groupSubjects.find((s) => s.id === request.groupSubjectId)
        if (!subject) {
          throw new Error("GROUP_SUBJECT_NOT_FOUND")
        }
        if (!subject.isActive) {
          throw new Error("GROUP_SUBJECT_INACTIVE")
        }
        // Type mismatch check
        if (layout.layoutType === "KPI" && subject.subjectType !== "KPI") {
          throw new Error("GROUP_SUBJECT_TYPE_MISMATCH")
        }
        if ((layout.layoutType === "PL" || layout.layoutType === "BS") && subject.subjectType !== "FIN") {
          throw new Error("GROUP_SUBJECT_TYPE_MISMATCH")
        }
        if (layout.layoutType === "PL" && subject.finStmtClass !== "PL") {
          throw new Error("GROUP_SUBJECT_TYPE_MISMATCH")
        }
        if (layout.layoutType === "BS" && subject.finStmtClass !== "BS") {
          throw new Error("GROUP_SUBJECT_TYPE_MISMATCH")
        }

        line.groupSubjectId = subject.id
        line.groupSubjectCode = subject.groupSubjectCode
        line.groupSubjectName = subject.groupSubjectName
        line.subjectClass = subject.subjectClass
      } else {
        line.groupSubjectId = null
        line.groupSubjectCode = null
        line.groupSubjectName = null
        line.subjectClass = null
      }
    }

    if (request.displayName !== undefined) line.displayName = request.displayName || null
    if (request.indentLevel !== undefined) line.indentLevel = request.indentLevel
    if (request.signDisplayPolicy !== undefined) line.signDisplayPolicy = request.signDisplayPolicy
    if (request.isBold !== undefined) line.isBold = request.isBold
    if (request.isUnderline !== undefined) line.isUnderline = request.isUnderline
    if (request.isDoubleUnderline !== undefined) line.isDoubleUnderline = request.isDoubleUnderline
    if (request.bgHighlight !== undefined) line.bgHighlight = request.bgHighlight
    if (request.notes !== undefined) line.notes = request.notes || null
    line.updatedAt = new Date()

    return {
      ...line,
      createdAt: line.createdAt.toISOString(),
      updatedAt: line.updatedAt.toISOString(),
    }
  }

  async deleteLine(id: string): Promise<void> {
    await delay(200)

    if (!this.isParentCompany) {
      throw new Error("NOT_PARENT_COMPANY")
    }

    const lineIndex = this.lines.findIndex((l) => l.id === id)
    if (lineIndex === -1) {
      throw new Error("LINE_NOT_FOUND")
    }

    this.lines.splice(lineIndex, 1)
  }

  async moveLine(id: string, request: BffMoveGroupLineRequest): Promise<BffGroupLineListResponse> {
    await delay(200)

    if (!this.isParentCompany) {
      throw new Error("NOT_PARENT_COMPANY")
    }

    const line = this.lines.find((l) => l.id === id)
    if (!line) {
      throw new Error("LINE_NOT_FOUND")
    }

    const layoutId = line.layoutId
    const layoutLines = this.lines.filter((l) => l.layoutId === layoutId)
    const currentLineNo = line.lineNo
    const targetLineNo = request.targetLineNo

    if (currentLineNo === targetLineNo) {
      return this.getLines(layoutId)
    }

    // Update line numbers
    layoutLines.forEach((l) => {
      if (l.id === id) {
        l.lineNo = targetLineNo
      } else if (currentLineNo < targetLineNo) {
        if (l.lineNo > currentLineNo && l.lineNo <= targetLineNo) {
          l.lineNo = l.lineNo - 10
        }
      } else {
        if (l.lineNo >= targetLineNo && l.lineNo < currentLineNo) {
          l.lineNo = l.lineNo + 10
        }
      }
      l.updatedAt = new Date()
    })

    return this.getLines(layoutId)
  }

  async searchGroupSubjects(request: BffGroupSubjectSearchRequest): Promise<BffGroupSubjectSearchResponse> {
    await delay(200)

    let filtered = this.groupSubjects.filter((s) => s.isActive)

    // Filter by layoutType
    if (request.layoutType === "PL") {
      filtered = filtered.filter((s) => s.subjectType === "FIN" && s.finStmtClass === "PL")
    } else if (request.layoutType === "BS") {
      filtered = filtered.filter((s) => s.subjectType === "FIN" && s.finStmtClass === "BS")
    } else if (request.layoutType === "KPI") {
      filtered = filtered.filter((s) => s.subjectType === "KPI")
    }

    // Filter by keyword
    if (request.keyword) {
      const keyword = request.keyword.toLowerCase()
      filtered = filtered.filter(
        (s) =>
          s.groupSubjectCode.toLowerCase().includes(keyword) ||
          s.groupSubjectName.toLowerCase().includes(keyword)
      )
    }

    // Pagination
    const page = request.page || 1
    const pageSize = request.pageSize || 10
    const totalCount = filtered.length
    const totalPages = Math.ceil(totalCount / pageSize)
    const startIndex = (page - 1) * pageSize
    const paginatedItems = filtered.slice(startIndex, startIndex + pageSize)

    const items: BffGroupSubjectSummary[] = paginatedItems.map((s) => ({
      id: s.id,
      groupSubjectCode: s.groupSubjectCode,
      groupSubjectName: s.groupSubjectName,
      subjectClass: s.subjectClass,
    }))

    return {
      items,
      page,
      pageSize,
      totalCount,
      totalPages,
    }
  }
}
