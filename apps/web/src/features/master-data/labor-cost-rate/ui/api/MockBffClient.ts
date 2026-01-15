/**
 * Mock BFF Client for Development
 *
 * Returns sample DTO-shaped data for testing and development
 */

import type { BffClient } from "./BffClient"
import { BffClientError } from "./BffClient"
import type {
  BffListLaborCostRatesRequest,
  BffListLaborCostRatesResponse,
  BffCreateLaborCostRateRequest,
  BffUpdateLaborCostRateRequest,
  BffLaborCostRateDetailResponse,
  BffLaborCostRateSummary,
  BffLaborCostRateItem,
  BffLaborCostRateItemInput,
  BffListSubjectsResponse,
  BffSubject,
} from "../types/bff-contracts"

// Mock subjects data
// Only subjects with is_labor_cost_applicable=true from subject master are returned
const mockSubjects: BffSubject[] = [
  { id: "sub-008", code: "6011", name: "給与手当" },
  { id: "sub-009", code: "6012", name: "法定福利費" },
  { id: "sub-010", code: "6013", name: "賞与" },
  { id: "sub-004", code: "6010", name: "販売費及び一般管理費" },
]

// Helper to calculate percentage
function calculatePercentage(amount: string, totalRate: string): string {
  const amountNum = Number.parseFloat(amount)
  const totalNum = Number.parseFloat(totalRate)
  if (totalNum === 0) return "0.00"
  return ((amountNum / totalNum) * 100).toFixed(2)
}

// Helper to calculate total rate from items
function calculateTotalRate(items: BffLaborCostRateItemInput[]): string {
  const total = items.reduce((sum, item) => sum + Number.parseFloat(item.amount), 0)
  return total.toString()
}

// Helper to convert items input to full items
function convertItemsToFull(items: BffLaborCostRateItemInput[], totalRate: string): BffLaborCostRateItem[] {
  return items.map((item, index) => {
    const subject = mockSubjects.find((s) => s.id === item.subjectId)
    return {
      id: `item-${Date.now()}-${index}`,
      subjectId: item.subjectId,
      subjectCode: subject?.code || "UNKNOWN",
      subjectName: subject?.name || "不明",
      amount: item.amount,
      percentage: calculatePercentage(item.amount, totalRate),
      displayOrder: item.displayOrder,
    }
  })
}

// Mock data with new structure
// Items use subject IDs from subject master with is_labor_cost_applicable=true
const mockRates: BffLaborCostRateDetailResponse[] = [
  {
    id: "1",
    rateCode: "SE_G2_REGULAR",
    resourceType: "EMPLOYEE",
    vendorName: null,
    jobCategory: "SE",
    grade: "G2",
    employmentType: "REGULAR",
    rateType: "MONTHLY",
    totalRate: "650000",
    effectiveDate: "2025-04-01",
    expiryDate: "2026-03-31",
    isActive: true,
    notes: "システムエンジニア G2等級 正社員の標準月額単価",
    items: [
      { id: "item-1-1", subjectId: "sub-008", subjectCode: "6011", subjectName: "給与手当", amount: "450000", percentage: "69.23", displayOrder: 1 },
      { id: "item-1-2", subjectId: "sub-010", subjectCode: "6013", subjectName: "賞与", amount: "100000", percentage: "15.38", displayOrder: 2 },
      { id: "item-1-3", subjectId: "sub-009", subjectCode: "6012", subjectName: "法定福利費", amount: "100000", percentage: "15.38", displayOrder: 3 },
    ],
    createdAt: "2024-12-01T09:00:00Z",
    updatedAt: "2024-12-01T09:00:00Z",
  },
  {
    id: "2",
    rateCode: "SE_G3_CONTRACT",
    resourceType: "CONTRACTOR",
    vendorName: "ABCシステムズ",
    jobCategory: "SE",
    grade: "G3",
    employmentType: null,
    rateType: "HOURLY",
    totalRate: "5000",
    effectiveDate: "2025-04-01",
    expiryDate: null,
    isActive: true,
    notes: "システムエンジニア G3等級 外注先（ABCシステムズ）の時給単価",
    items: [
      { id: "item-2-1", subjectId: "sub-004", subjectCode: "6010", subjectName: "販売費及び一般管理費", amount: "5000", percentage: "100.00", displayOrder: 1 },
    ],
    createdAt: "2024-12-01T09:00:00Z",
    updatedAt: "2024-12-01T09:00:00Z",
  },
  {
    id: "3",
    rateCode: "SALES_G1_REGULAR",
    resourceType: "EMPLOYEE",
    vendorName: null,
    jobCategory: "営業",
    grade: "G1",
    employmentType: "REGULAR",
    rateType: "MONTHLY",
    totalRate: "550000",
    effectiveDate: "2025-04-01",
    expiryDate: "2026-03-31",
    isActive: true,
    notes: "営業職 G1等級 正社員の標準月額単価",
    items: [
      { id: "item-3-1", subjectId: "sub-008", subjectCode: "6011", subjectName: "給与手当", amount: "380000", percentage: "69.09", displayOrder: 1 },
      { id: "item-3-2", subjectId: "sub-010", subjectCode: "6013", subjectName: "賞与", amount: "85000", percentage: "15.45", displayOrder: 2 },
      { id: "item-3-3", subjectId: "sub-009", subjectCode: "6012", subjectName: "法定福利費", amount: "85000", percentage: "15.45", displayOrder: 3 },
    ],
    createdAt: "2024-12-01T09:00:00Z",
    updatedAt: "2024-12-01T09:00:00Z",
  },
  {
    id: "4",
    rateCode: "DESIGN_G2_DAILY",
    resourceType: "CONTRACTOR",
    vendorName: "デザインパートナーズ",
    jobCategory: "設計",
    grade: "G2",
    employmentType: null,
    rateType: "DAILY",
    totalRate: "40000",
    effectiveDate: "2025-01-01",
    expiryDate: null,
    isActive: true,
    notes: "設計職 G2等級 外注先（デザインパートナーズ）の日給単価",
    items: [
      { id: "item-4-1", subjectId: "sub-004", subjectCode: "6010", subjectName: "販売費及び一般管理費", amount: "40000", percentage: "100.00", displayOrder: 1 },
    ],
    createdAt: "2024-12-15T09:00:00Z",
    updatedAt: "2024-12-15T09:00:00Z",
  },
  {
    id: "5",
    rateCode: "ADMIN_G1_REGULAR",
    resourceType: "EMPLOYEE",
    vendorName: null,
    jobCategory: "管理",
    grade: "G1",
    employmentType: "REGULAR",
    rateType: "MONTHLY",
    totalRate: "500000",
    effectiveDate: "2024-04-01",
    expiryDate: "2025-03-31",
    isActive: false,
    notes: "管理職 G1等級 正社員の標準月額単価（旧年度）",
    items: [
      { id: "item-5-1", subjectId: "sub-008", subjectCode: "6011", subjectName: "給与手当", amount: "350000", percentage: "70.00", displayOrder: 1 },
      { id: "item-5-2", subjectId: "sub-009", subjectCode: "6012", subjectName: "法定福利費", amount: "80000", percentage: "16.00", displayOrder: 2 },
      { id: "item-5-3", subjectId: "sub-010", subjectCode: "6013", subjectName: "賞与", amount: "70000", percentage: "14.00", displayOrder: 3 },
    ],
    createdAt: "2024-01-01T09:00:00Z",
    updatedAt: "2024-12-01T09:00:00Z",
  },
  {
    id: "6",
    rateCode: "SE_G1_REGULAR",
    resourceType: "EMPLOYEE",
    vendorName: null,
    jobCategory: "SE",
    grade: "G1",
    employmentType: "REGULAR",
    rateType: "MONTHLY",
    totalRate: "700000",
    effectiveDate: "2025-04-01",
    expiryDate: null,
    isActive: true,
    notes: "システムエンジニア G1等級 正社員の標準月額単価",
    items: [
      { id: "item-6-1", subjectId: "sub-008", subjectCode: "6011", subjectName: "給与手当", amount: "480000", percentage: "68.57", displayOrder: 1 },
      { id: "item-6-2", subjectId: "sub-010", subjectCode: "6013", subjectName: "賞与", amount: "110000", percentage: "15.71", displayOrder: 2 },
      { id: "item-6-3", subjectId: "sub-009", subjectCode: "6012", subjectName: "法定福利費", amount: "110000", percentage: "15.71", displayOrder: 3 },
    ],
    createdAt: "2024-12-01T09:00:00Z",
    updatedAt: "2024-12-01T09:00:00Z",
  },
]

export class MockBffClient implements BffClient {
  private data: BffLaborCostRateDetailResponse[] = [...mockRates]

  async listLaborCostRates(request: BffListLaborCostRatesRequest): Promise<BffListLaborCostRatesResponse> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    let filtered = [...this.data]

    // Filter by keyword (rateCode, jobCategory, or vendorName)
    if (request.keyword) {
      const keyword = request.keyword.toLowerCase()
      filtered = filtered.filter(
        (rate) =>
          rate.rateCode.toLowerCase().includes(keyword) ||
          rate.jobCategory.toLowerCase().includes(keyword) ||
          (rate.vendorName && rate.vendorName.toLowerCase().includes(keyword)),
      )
    }

    // Filter by resourceType
    if (request.resourceType) {
      filtered = filtered.filter((rate) => rate.resourceType === request.resourceType)
    }

    // Filter by grade
    if (request.grade) {
      filtered = filtered.filter((rate) => rate.grade === request.grade)
    }

    // Filter by employmentType
    if (request.employmentType) {
      filtered = filtered.filter((rate) => rate.employmentType === request.employmentType)
    }

    // Filter by rateType
    if (request.rateType) {
      filtered = filtered.filter((rate) => rate.rateType === request.rateType)
    }

    // Filter by isActive
    if (request.isActive !== undefined) {
      filtered = filtered.filter((rate) => rate.isActive === request.isActive)
    }

    // Filter by asOfDate (effective date range)
    if (request.asOfDate) {
      const asOf = new Date(request.asOfDate)
      filtered = filtered.filter((rate) => {
        const effectiveDate = new Date(rate.effectiveDate)
        const expiryDate = rate.expiryDate ? new Date(rate.expiryDate) : null
        return effectiveDate <= asOf && (!expiryDate || expiryDate >= asOf)
      })
    }

    // Sort
    const sortBy = request.sortBy || "rateCode"
    const sortOrder = request.sortOrder || "asc"
    filtered.sort((a, b) => {
      let aVal: string | number = ""
      let bVal: string | number = ""

      if (sortBy === "totalRate") {
        aVal = Number.parseFloat(a.totalRate)
        bVal = Number.parseFloat(b.totalRate)
      } else {
        aVal = (a[sortBy] || "").toString()
        bVal = (b[sortBy] || "").toString()
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1
      return 0
    })

    // Paginate
    const page = request.page || 1
    const pageSize = request.pageSize || 20
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const items = filtered.slice(start, end)

    return {
      items: items.map((rate) => this.toSummary(rate)),
      totalCount: filtered.length,
      page,
      pageSize,
    }
  }

  async getLaborCostRateDetail(id: string): Promise<BffLaborCostRateDetailResponse> {
    await new Promise((resolve) => setTimeout(resolve, 200))

    const rate = this.data.find((r) => r.id === id)
    if (!rate) {
      throw new BffClientError({
        code: "LABOR_COST_RATE_NOT_FOUND",
        message: "指定された単価が見つかりません",
      })
    }

    return { ...rate }
  }

  async createLaborCostRate(request: BffCreateLaborCostRateRequest): Promise<BffLaborCostRateDetailResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Check for duplicate rateCode
    if (this.data.some((r) => r.rateCode === request.rateCode)) {
      throw new BffClientError({
        code: "RATE_CODE_DUPLICATE",
        message: "この単価コードは既に使用されています",
      })
    }

    // Validate date range
    if (request.expiryDate && new Date(request.expiryDate) <= new Date(request.effectiveDate)) {
      throw new BffClientError({
        code: "INVALID_DATE_RANGE",
        message: "有効終了日は有効開始日より後である必要があります",
      })
    }

    // Validate items
    if (!request.items || request.items.length === 0) {
      throw new BffClientError({
        code: "NO_ITEMS_PROVIDED",
        message: "科目別内訳は1件以上必要です",
      })
    }

    // Check for duplicate subjects
    const subjectIds = request.items.map((item) => item.subjectId)
    const uniqueSubjectIds = new Set(subjectIds)
    if (subjectIds.length !== uniqueSubjectIds.size) {
      throw new BffClientError({
        code: "DUPLICATE_SUBJECT_IN_ITEMS",
        message: "同一科目を複数指定することはできません",
      })
    }

    // Validate subject existence
    for (const item of request.items) {
      if (!mockSubjects.find((s) => s.id === item.subjectId)) {
        throw new BffClientError({
          code: "SUBJECT_NOT_FOUND",
          message: `科目が見つかりません: ${item.subjectId}`,
        })
      }
    }

    // Validate item amounts
    for (const item of request.items) {
      const amount = Number.parseFloat(item.amount)
      if (isNaN(amount) || amount <= 0) {
        throw new BffClientError({
          code: "INVALID_ITEM_AMOUNT",
          message: "科目金額は正の数値である必要があります",
        })
      }
    }

    const totalRate = calculateTotalRate(request.items)
    const items = convertItemsToFull(request.items, totalRate)

    const newRate: BffLaborCostRateDetailResponse = {
      id: String(this.data.length + 1),
      rateCode: request.rateCode,
      resourceType: request.resourceType,
      vendorName: request.vendorName || null,
      jobCategory: request.jobCategory,
      grade: request.grade || null,
      employmentType: request.employmentType || null,
      rateType: request.rateType,
      totalRate,
      effectiveDate: request.effectiveDate,
      expiryDate: request.expiryDate || null,
      isActive: true,
      notes: request.notes || null,
      items,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.data.push(newRate)
    return { ...newRate }
  }

  async updateLaborCostRate(
    id: string,
    request: BffUpdateLaborCostRateRequest,
  ): Promise<BffLaborCostRateDetailResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const index = this.data.findIndex((r) => r.id === id)
    if (index === -1) {
      throw new BffClientError({
        code: "LABOR_COST_RATE_NOT_FOUND",
        message: "指定された単価が見つかりません",
      })
    }

    // Check for duplicate rateCode (if changing)
    if (
      request.rateCode &&
      request.rateCode !== this.data[index].rateCode &&
      this.data.some((r) => r.rateCode === request.rateCode)
    ) {
      throw new BffClientError({
        code: "RATE_CODE_DUPLICATE",
        message: "この単価コードは既に使用されています",
      })
    }

    // Validate date range
    const effectiveDate = request.effectiveDate || this.data[index].effectiveDate
    const expiryDate = request.expiryDate !== undefined ? request.expiryDate : this.data[index].expiryDate

    if (expiryDate && new Date(expiryDate) <= new Date(effectiveDate)) {
      throw new BffClientError({
        code: "INVALID_DATE_RANGE",
        message: "有効終了日は有効開始日より後である必要があります",
      })
    }

    // Validate items if provided
    let totalRate = this.data[index].totalRate
    let items = this.data[index].items

    if (request.items !== undefined) {
      if (request.items.length === 0) {
        throw new BffClientError({
          code: "NO_ITEMS_PROVIDED",
          message: "科目別内訳は1件以上必要です",
        })
      }

      // Check for duplicate subjects
      const subjectIds = request.items.map((item) => item.subjectId)
      const uniqueSubjectIds = new Set(subjectIds)
      if (subjectIds.length !== uniqueSubjectIds.size) {
        throw new BffClientError({
          code: "DUPLICATE_SUBJECT_IN_ITEMS",
          message: "同一科目を複数指定することはできません",
        })
      }

      // Validate subject existence
      for (const item of request.items) {
        if (!mockSubjects.find((s) => s.id === item.subjectId)) {
          throw new BffClientError({
            code: "SUBJECT_NOT_FOUND",
            message: `科目が見つかりません: ${item.subjectId}`,
          })
        }
      }

      // Validate item amounts
      for (const item of request.items) {
        const amount = Number.parseFloat(item.amount)
        if (isNaN(amount) || amount <= 0) {
          throw new BffClientError({
            code: "INVALID_ITEM_AMOUNT",
            message: "科目金額は正の数値である必要があります",
          })
        }
      }

      totalRate = calculateTotalRate(request.items)
      items = convertItemsToFull(request.items, totalRate)
    }

    this.data[index] = {
      ...this.data[index],
      rateCode: request.rateCode ?? this.data[index].rateCode,
      resourceType: request.resourceType ?? this.data[index].resourceType,
      vendorName: request.vendorName !== undefined ? request.vendorName ?? null : this.data[index].vendorName,
      jobCategory: request.jobCategory ?? this.data[index].jobCategory,
      grade: request.grade !== undefined ? request.grade ?? null : this.data[index].grade,
      employmentType: request.employmentType !== undefined ? request.employmentType ?? null : this.data[index].employmentType,
      rateType: request.rateType ?? this.data[index].rateType,
      effectiveDate,
      expiryDate: expiryDate ?? null,
      notes: request.notes !== undefined ? request.notes ?? null : this.data[index].notes,
      totalRate,
      items,
      updatedAt: new Date().toISOString(),
    }

    return { ...this.data[index] }
  }

  async deactivateLaborCostRate(id: string): Promise<BffLaborCostRateDetailResponse> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const index = this.data.findIndex((r) => r.id === id)
    if (index === -1) {
      throw new BffClientError({
        code: "LABOR_COST_RATE_NOT_FOUND",
        message: "指定された単価が見つかりません",
      })
    }

    if (!this.data[index].isActive) {
      throw new BffClientError({
        code: "LABOR_COST_RATE_ALREADY_INACTIVE",
        message: "この単価は既に無効化されています",
      })
    }

    this.data[index].isActive = false
    this.data[index].updatedAt = new Date().toISOString()

    return { ...this.data[index] }
  }

  async reactivateLaborCostRate(id: string): Promise<BffLaborCostRateDetailResponse> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const index = this.data.findIndex((r) => r.id === id)
    if (index === -1) {
      throw new BffClientError({
        code: "LABOR_COST_RATE_NOT_FOUND",
        message: "指定された単価が見つかりません",
      })
    }

    if (this.data[index].isActive) {
      throw new BffClientError({
        code: "LABOR_COST_RATE_ALREADY_ACTIVE",
        message: "この単価は既に有効です",
      })
    }

    this.data[index].isActive = true
    this.data[index].updatedAt = new Date().toISOString()

    return { ...this.data[index] }
  }

  /**
   * Returns subjects available for labor cost rate item breakdown.
   * Only subjects with is_labor_cost_applicable=true AND is_active=true
   * from the subject master are returned.
   */
  async listSubjects(): Promise<BffListSubjectsResponse> {
    await new Promise((resolve) => setTimeout(resolve, 100))
    return { items: [...mockSubjects] }
  }

  private toSummary(detail: BffLaborCostRateDetailResponse): BffLaborCostRateSummary {
    return {
      id: detail.id,
      rateCode: detail.rateCode,
      resourceType: detail.resourceType,
      vendorName: detail.vendorName,
      jobCategory: detail.jobCategory,
      grade: detail.grade,
      employmentType: detail.employmentType,
      rateType: detail.rateType,
      totalRate: detail.totalRate,
      effectiveDate: detail.effectiveDate,
      expiryDate: detail.expiryDate,
      isActive: detail.isActive,
    }
  }
}
