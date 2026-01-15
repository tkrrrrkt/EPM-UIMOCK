import type {
  BffLayoutListRequest,
  BffLayoutListResponse,
  BffCreateLayoutRequest,
  BffUpdateLayoutRequest,
  BffCopyLayoutRequest,
  BffLayoutDetailResponse,
  BffLineListResponse,
  BffCreateLineRequest,
  BffUpdateLineRequest,
  BffMoveLineRequest,
  BffLineDetailResponse,
  BffSubjectSearchRequest,
  BffSubjectSearchResponse,
  BffLayoutSummary,
  BffLineSummary,
  BffSubjectSummary,
} from "@epm/contracts/bff/report-layout"
import type { BffClient } from "./BffClient"

// Mock data
const mockLayouts: BffLayoutSummary[] = [
  {
    id: "layout-001",
    layoutCode: "PL_STD",
    layoutName: "標準PL",
    layoutType: "PL",
    companyId: "company-001",
    companyName: "株式会社サンプル",
    isActive: true,
    lineCount: 15,
  },
  {
    id: "layout-002",
    layoutCode: "BS_STD",
    layoutName: "標準BS",
    layoutType: "BS",
    companyId: "company-001",
    companyName: "株式会社サンプル",
    isActive: true,
    lineCount: 20,
  },
  {
    id: "layout-003",
    layoutCode: "KPI_STD",
    layoutName: "標準KPI",
    layoutType: "KPI",
    companyId: null,
    companyName: null,
    isActive: true,
    lineCount: 10,
  },
  {
    id: "layout-004",
    layoutCode: "PL_MGMT",
    layoutName: "管理PL",
    layoutType: "PL",
    companyId: "company-002",
    companyName: "サンプル商事株式会社",
    isActive: false,
    lineCount: 12,
  },
]

const mockLines: BffLineSummary[] = [
  {
    id: "line-001",
    layoutId: "layout-001",
    lineNo: 10,
    lineType: "header",
    displayName: "売上高",
    subjectId: null,
    subjectCode: null,
    subjectName: null,
    indentLevel: 0,
    signDisplayPolicy: null,
    isBold: true,
    confidenceEnabled: false,
    wnbEnabled: false,
  },
  {
    id: "line-002",
    layoutId: "layout-001",
    lineNo: 20,
    lineType: "account",
    displayName: "売上高（表示名）",
    subjectId: "subject-001",
    subjectCode: "4010",
    subjectName: "売上高",
    indentLevel: 1,
    signDisplayPolicy: "auto",
    isBold: false,
    confidenceEnabled: true,
    wnbEnabled: true,
  },
  {
    id: "line-003",
    layoutId: "layout-001",
    lineNo: 30,
    lineType: "note",
    displayName: "注記: 売上高は税込金額です",
    subjectId: null,
    subjectCode: null,
    subjectName: null,
    indentLevel: 0,
    signDisplayPolicy: null,
    isBold: false,
    confidenceEnabled: false,
    wnbEnabled: false,
  },
  {
    id: "line-004",
    layoutId: "layout-001",
    lineNo: 40,
    lineType: "blank",
    displayName: null,
    subjectId: null,
    subjectCode: null,
    subjectName: null,
    indentLevel: 0,
    signDisplayPolicy: null,
    isBold: false,
    confidenceEnabled: false,
    wnbEnabled: false,
  },
  {
    id: "line-005",
    layoutId: "layout-001",
    lineNo: 50,
    lineType: "header",
    displayName: "売上原価",
    subjectId: null,
    subjectCode: null,
    subjectName: null,
    indentLevel: 0,
    signDisplayPolicy: null,
    isBold: true,
    confidenceEnabled: false,
    wnbEnabled: false,
  },
  {
    id: "line-006",
    layoutId: "layout-001",
    lineNo: 60,
    lineType: "account",
    displayName: "売上原価",
    subjectId: "subject-002",
    subjectCode: "5010",
    subjectName: "売上原価",
    indentLevel: 1,
    signDisplayPolicy: "auto",
    isBold: false,
    confidenceEnabled: true,
    wnbEnabled: false,
  },
]

const mockSubjects: BffSubjectSummary[] = [
  {
    id: "subject-001",
    subjectCode: "4010",
    subjectName: "売上高",
    subjectClass: "BASE",
  },
  {
    id: "subject-002",
    subjectCode: "5010",
    subjectName: "売上原価",
    subjectClass: "BASE",
  },
  {
    id: "subject-003",
    subjectCode: "6010",
    subjectName: "販管費",
    subjectClass: "AGGREGATE",
  },
  {
    id: "subject-004",
    subjectCode: "6020",
    subjectName: "給与手当",
    subjectClass: "BASE",
  },
  {
    id: "subject-005",
    subjectCode: "6030",
    subjectName: "地代家賃",
    subjectClass: "BASE",
  },
]

export class MockBffClient implements BffClient {
  private layouts = [...mockLayouts]
  private lines = [...mockLines]
  private subjects = [...mockSubjects]

  async getLayouts(request: BffLayoutListRequest): Promise<BffLayoutListResponse> {
    await this.delay()

    let filtered = [...this.layouts]

    // Filter by keyword
    if (request.keyword) {
      const keyword = request.keyword.toLowerCase()
      filtered = filtered.filter(
        (layout) =>
          layout.layoutCode.toLowerCase().includes(keyword) || layout.layoutName.toLowerCase().includes(keyword),
      )
    }

    // Filter by layout type
    if (request.layoutType) {
      filtered = filtered.filter((layout) => layout.layoutType === request.layoutType)
    }

    // Filter by active status
    if (request.isActive !== undefined) {
      filtered = filtered.filter((layout) => layout.isActive === request.isActive)
    }

    // Sort
    if (request.sortBy) {
      filtered.sort((a, b) => {
        const aVal = a[request.sortBy as keyof BffLayoutSummary] ?? ""
        const bVal = b[request.sortBy as keyof BffLayoutSummary] ?? ""
        const order = request.sortOrder === "desc" ? -1 : 1
        return aVal > bVal ? order : aVal < bVal ? -order : 0
      })
    }

    // Paginate
    const page = request.page || 1
    const pageSize = request.pageSize || 10
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const items = filtered.slice(start, end)

    return {
      items,
      totalCount: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize),
    }
  }

  async getLayoutDetail(id: string): Promise<BffLayoutDetailResponse> {
    await this.delay()

    const layout = this.layouts.find((l) => l.id === id)
    if (!layout) {
      throw new Error("LAYOUT_NOT_FOUND")
    }

    return {
      id: layout.id,
      layoutCode: layout.layoutCode,
      layoutName: layout.layoutName,
      layoutType: layout.layoutType,
      companyId: layout.companyId,
      companyName: layout.companyName,
      isActive: layout.isActive,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    }
  }

  async createLayout(request: BffCreateLayoutRequest): Promise<BffLayoutDetailResponse> {
    await this.delay()

    // Check duplicate
    if (this.layouts.some((l) => l.layoutCode === request.layoutCode)) {
      throw new Error("LAYOUT_CODE_DUPLICATE")
    }

    const newLayout: BffLayoutSummary = {
      id: `layout-${Date.now()}`,
      layoutCode: request.layoutCode,
      layoutName: request.layoutName,
      layoutType: request.layoutType,
      companyId: request.companyId || null,
      companyName: request.companyId ? "株式会社サンプル" : null,
      isActive: true,
      lineCount: 0,
    }

    this.layouts.push(newLayout)

    return {
      id: newLayout.id,
      layoutCode: newLayout.layoutCode,
      layoutName: newLayout.layoutName,
      layoutType: newLayout.layoutType,
      companyId: newLayout.companyId,
      companyName: newLayout.companyName,
      isActive: newLayout.isActive,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  async updateLayout(id: string, request: BffUpdateLayoutRequest): Promise<BffLayoutDetailResponse> {
    await this.delay()

    const layout = this.layouts.find((l) => l.id === id)
    if (!layout) {
      throw new Error("LAYOUT_NOT_FOUND")
    }

    if (request.layoutCode) layout.layoutCode = request.layoutCode
    if (request.layoutName) layout.layoutName = request.layoutName
    if (request.layoutType) layout.layoutType = request.layoutType

    return {
      id: layout.id,
      layoutCode: layout.layoutCode,
      layoutName: layout.layoutName,
      layoutType: layout.layoutType,
      companyId: layout.companyId,
      companyName: layout.companyName,
      isActive: layout.isActive,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: new Date().toISOString(),
    }
  }

  async deactivateLayout(id: string): Promise<BffLayoutDetailResponse> {
    await this.delay()

    const layout = this.layouts.find((l) => l.id === id)
    if (!layout) {
      throw new Error("LAYOUT_NOT_FOUND")
    }
    if (!layout.isActive) {
      throw new Error("LAYOUT_ALREADY_INACTIVE")
    }

    layout.isActive = false

    return {
      id: layout.id,
      layoutCode: layout.layoutCode,
      layoutName: layout.layoutName,
      layoutType: layout.layoutType,
      companyId: layout.companyId,
      companyName: layout.companyName,
      isActive: layout.isActive,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: new Date().toISOString(),
    }
  }

  async reactivateLayout(id: string): Promise<BffLayoutDetailResponse> {
    await this.delay()

    const layout = this.layouts.find((l) => l.id === id)
    if (!layout) {
      throw new Error("LAYOUT_NOT_FOUND")
    }
    if (layout.isActive) {
      throw new Error("LAYOUT_ALREADY_ACTIVE")
    }

    layout.isActive = true

    return {
      id: layout.id,
      layoutCode: layout.layoutCode,
      layoutName: layout.layoutName,
      layoutType: layout.layoutType,
      companyId: layout.companyId,
      companyName: layout.companyName,
      isActive: layout.isActive,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: new Date().toISOString(),
    }
  }

  async copyLayout(id: string, request: BffCopyLayoutRequest): Promise<BffLayoutDetailResponse> {
    await this.delay()

    const layout = this.layouts.find((l) => l.id === id)
    if (!layout) {
      throw new Error("LAYOUT_NOT_FOUND")
    }

    // Check duplicate
    if (this.layouts.some((l) => l.layoutCode === request.layoutCode)) {
      throw new Error("LAYOUT_CODE_DUPLICATE")
    }

    const newLayout: BffLayoutSummary = {
      id: `layout-${Date.now()}`,
      layoutCode: request.layoutCode,
      layoutName: request.layoutName,
      layoutType: layout.layoutType,
      companyId: layout.companyId,
      companyName: layout.companyName,
      isActive: true,
      lineCount: layout.lineCount,
    }

    this.layouts.push(newLayout)

    // Copy lines
    const layoutLines = this.lines.filter((l) => l.layoutId === id)
    layoutLines.forEach((line) => {
      this.lines.push({
        ...line,
        id: `line-${Date.now()}-${Math.random()}`,
        layoutId: newLayout.id,
      })
    })

    return {
      id: newLayout.id,
      layoutCode: newLayout.layoutCode,
      layoutName: newLayout.layoutName,
      layoutType: newLayout.layoutType,
      companyId: newLayout.companyId,
      companyName: newLayout.companyName,
      isActive: newLayout.isActive,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  async getLines(layoutId: string): Promise<BffLineListResponse> {
    await this.delay()

    const lines = this.lines.filter((l) => l.layoutId === layoutId).sort((a, b) => a.lineNo - b.lineNo)

    return { items: lines }
  }

  async getLineDetail(id: string): Promise<BffLineDetailResponse> {
    await this.delay()

    const line = this.lines.find((l) => l.id === id)
    if (!line) {
      throw new Error("LINE_NOT_FOUND")
    }

    return {
      id: line.id,
      layoutId: line.layoutId,
      lineNo: line.lineNo,
      lineType: line.lineType,
      displayName: line.displayName,
      subjectId: line.subjectId,
      subjectCode: line.subjectCode,
      subjectName: line.subjectName,
      indentLevel: line.indentLevel,
      signDisplayPolicy: line.signDisplayPolicy,
      isBold: line.isBold,
      confidenceEnabled: line.confidenceEnabled,
      wnbEnabled: line.wnbEnabled,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    }
  }

  async createLine(layoutId: string, request: BffCreateLineRequest): Promise<BffLineDetailResponse> {
    await this.delay()

    // Validate account line
    if (request.lineType === "account" && !request.subjectId) {
      throw new Error("SUBJECT_REQUIRED_FOR_ACCOUNT")
    }

    // Get max line number
    const layoutLines = this.lines.filter((l) => l.layoutId === layoutId)
    const maxLineNo = layoutLines.length > 0 ? Math.max(...layoutLines.map((l) => l.lineNo)) : 0

    const subject = request.subjectId ? this.subjects.find((s) => s.id === request.subjectId) : null

    const newLine: BffLineSummary = {
      id: `line-${Date.now()}`,
      layoutId,
      lineNo: maxLineNo + 10,
      lineType: request.lineType,
      displayName: request.displayName || subject?.subjectName || null,
      subjectId: request.subjectId || null,
      subjectCode: subject?.subjectCode || null,
      subjectName: subject?.subjectName || null,
      indentLevel: request.indentLevel || 0,
      signDisplayPolicy: request.signDisplayPolicy || null,
      isBold: request.isBold || false,
      confidenceEnabled: request.confidenceEnabled || false,
      wnbEnabled: request.wnbEnabled || false,
    }

    this.lines.push(newLine)

    // Update line count
    const layout = this.layouts.find((l) => l.id === layoutId)
    if (layout) {
      layout.lineCount++
    }

    return {
      id: newLine.id,
      layoutId: newLine.layoutId,
      lineNo: newLine.lineNo,
      lineType: newLine.lineType,
      displayName: newLine.displayName,
      subjectId: newLine.subjectId,
      subjectCode: newLine.subjectCode,
      subjectName: newLine.subjectName,
      indentLevel: newLine.indentLevel,
      signDisplayPolicy: newLine.signDisplayPolicy,
      isBold: newLine.isBold,
      confidenceEnabled: newLine.confidenceEnabled,
      wnbEnabled: newLine.wnbEnabled,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  async updateLine(id: string, request: BffUpdateLineRequest): Promise<BffLineDetailResponse> {
    await this.delay()

    const line = this.lines.find((l) => l.id === id)
    if (!line) {
      throw new Error("LINE_NOT_FOUND")
    }

    if (request.displayName !== undefined) line.displayName = request.displayName
    if (request.subjectId !== undefined) {
      line.subjectId = request.subjectId
      const subject = this.subjects.find((s) => s.id === request.subjectId)
      line.subjectCode = subject?.subjectCode || null
      line.subjectName = subject?.subjectName || null
    }
    if (request.indentLevel !== undefined) line.indentLevel = request.indentLevel
    if (request.signDisplayPolicy !== undefined) line.signDisplayPolicy = request.signDisplayPolicy
    if (request.isBold !== undefined) line.isBold = request.isBold
    if (request.confidenceEnabled !== undefined) line.confidenceEnabled = request.confidenceEnabled
    if (request.wnbEnabled !== undefined) line.wnbEnabled = request.wnbEnabled

    return {
      id: line.id,
      layoutId: line.layoutId,
      lineNo: line.lineNo,
      lineType: line.lineType,
      displayName: line.displayName,
      subjectId: line.subjectId,
      subjectCode: line.subjectCode,
      subjectName: line.subjectName,
      indentLevel: line.indentLevel,
      signDisplayPolicy: line.signDisplayPolicy,
      isBold: line.isBold,
      confidenceEnabled: line.confidenceEnabled,
      wnbEnabled: line.wnbEnabled,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: new Date().toISOString(),
    }
  }

  async deleteLine(id: string): Promise<void> {
    await this.delay()

    const index = this.lines.findIndex((l) => l.id === id)
    if (index === -1) {
      throw new Error("LINE_NOT_FOUND")
    }

    const line = this.lines[index]
    this.lines.splice(index, 1)

    // Update line count
    const layout = this.layouts.find((l) => l.id === line.layoutId)
    if (layout) {
      layout.lineCount--
    }
  }

  async moveLine(id: string, request: BffMoveLineRequest): Promise<BffLineListResponse> {
    await this.delay()

    const line = this.lines.find((l) => l.id === id)
    if (!line) {
      throw new Error("LINE_NOT_FOUND")
    }

    line.lineNo = request.targetLineNo

    return this.getLines(line.layoutId)
  }

  async searchSubjects(request: BffSubjectSearchRequest): Promise<BffSubjectSearchResponse> {
    await this.delay()

    let filtered = [...this.subjects]

    // Filter by keyword
    if (request.keyword) {
      const keyword = request.keyword.toLowerCase()
      filtered = filtered.filter(
        (subject) =>
          subject.subjectCode.toLowerCase().includes(keyword) || subject.subjectName.toLowerCase().includes(keyword),
      )
    }

    // Paginate
    const page = request.page || 1
    const pageSize = request.pageSize || 10
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const items = filtered.slice(start, end)

    return {
      items,
      page,
      pageSize,
      totalCount: filtered.length,
      totalPages: Math.ceil(filtered.length / pageSize),
    }
  }

  private delay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 300))
  }
}
