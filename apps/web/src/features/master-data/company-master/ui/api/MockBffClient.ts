/**
 * MockBffClient for Company Master
 *
 * UI-MOCK Phase: モックデータで画面を動作させる
 * UI-BFF Phase: HttpBffClient に差し替え
 */

import type {
  BffListCompaniesRequest,
  BffListCompaniesResponse,
  BffCompanyDetailResponse,
  BffCreateCompanyRequest,
  BffUpdateCompanyRequest,
  BffCompanyTreeResponse,
  BffCompanyTreeNode,
} from '@epm/contracts/bff/company-master'
import type { BffClient } from './BffClient'

// Mock data
const mockCompanies: BffCompanyDetailResponse[] = [
  {
    id: 'company-001',
    companyCode: 'HD001',
    companyName: 'EPMホールディングス株式会社',
    companyNameShort: 'EPM HD',
    parentCompanyId: null,
    parentCompanyName: null,
    consolidationType: 'full',
    ownershipRatio: null,
    votingRatio: null,
    currencyCode: 'JPY',
    reportingCurrencyCode: 'JPY',
    fiscalYearEndMonth: 3,
    timezone: 'Asia/Tokyo',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'company-002',
    companyCode: 'JP001',
    companyName: 'EPMジャパン株式会社',
    companyNameShort: 'EPM Japan',
    parentCompanyId: 'company-001',
    parentCompanyName: 'EPMホールディングス株式会社',
    consolidationType: 'full',
    ownershipRatio: 100.0,
    votingRatio: 100.0,
    currencyCode: 'JPY',
    reportingCurrencyCode: 'JPY',
    fiscalYearEndMonth: 3,
    timezone: 'Asia/Tokyo',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'company-003',
    companyCode: 'CN001',
    companyName: 'EPM上海有限公司',
    companyNameShort: 'EPM Shanghai',
    parentCompanyId: 'company-001',
    parentCompanyName: 'EPMホールディングス株式会社',
    consolidationType: 'equity',
    ownershipRatio: 25.5,
    votingRatio: 30.0,
    currencyCode: 'CNY',
    reportingCurrencyCode: 'JPY',
    fiscalYearEndMonth: 12,
    timezone: 'Asia/Shanghai',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'company-004',
    companyCode: 'US001',
    companyName: 'EPM America Inc.',
    companyNameShort: 'EPM USA',
    parentCompanyId: 'company-001',
    parentCompanyName: 'EPMホールディングス株式会社',
    consolidationType: 'full',
    ownershipRatio: 100.0,
    votingRatio: 100.0,
    currencyCode: 'USD',
    reportingCurrencyCode: 'JPY',
    fiscalYearEndMonth: 12,
    timezone: 'America/New_York',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'company-005',
    companyCode: 'SG001',
    companyName: 'EPM Singapore Pte. Ltd.',
    companyNameShort: 'EPM SG',
    parentCompanyId: 'company-001',
    parentCompanyName: 'EPMホールディングス株式会社',
    consolidationType: 'equity',
    ownershipRatio: 40.0,
    votingRatio: 40.0,
    currencyCode: 'SGD',
    reportingCurrencyCode: 'JPY',
    fiscalYearEndMonth: 3,
    timezone: 'Asia/Singapore',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'company-006',
    companyCode: 'OLD01',
    companyName: '旧EPM販売株式会社',
    companyNameShort: '旧EPM販売',
    parentCompanyId: null,
    parentCompanyName: null,
    consolidationType: 'none',
    ownershipRatio: null,
    votingRatio: null,
    currencyCode: 'JPY',
    reportingCurrencyCode: 'JPY',
    fiscalYearEndMonth: 3,
    timezone: 'Asia/Tokyo',
    isActive: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'company-007',
    companyCode: 'TH001',
    companyName: 'EPMタイランド有限会社',
    companyNameShort: 'EPM TH',
    parentCompanyId: null,
    parentCompanyName: null,
    consolidationType: 'none',
    ownershipRatio: null,
    votingRatio: null,
    currencyCode: 'THB',
    reportingCurrencyCode: 'JPY',
    fiscalYearEndMonth: 12,
    timezone: 'Asia/Bangkok',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
]

export const mockBffClient: BffClient = {
  async listCompanies(req: BffListCompaniesRequest): Promise<BffListCompaniesResponse> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    let filtered = [...mockCompanies]

    // Filter by keyword
    if (req.keyword) {
      const keyword = req.keyword.toLowerCase()
      filtered = filtered.filter(
        (c) => c.companyCode.toLowerCase().includes(keyword) || c.companyName.toLowerCase().includes(keyword),
      )
    }

    // Filter by isActive
    if (req.isActive !== undefined) {
      filtered = filtered.filter((c) => c.isActive === req.isActive)
    }

    // Filter by consolidationType
    if (req.consolidationType) {
      filtered = filtered.filter((c) => c.consolidationType === req.consolidationType)
    }

    // Sort
    const sortBy = req.sortBy || 'companyCode'
    const sortOrder = req.sortOrder || 'asc'
    filtered.sort((a, b) => {
      const aVal = a[sortBy as keyof BffCompanyDetailResponse]
      const bVal = b[sortBy as keyof BffCompanyDetailResponse]
      if (aVal == null) return 1
      if (bVal == null) return -1
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      return sortOrder === 'asc' ? comparison : -comparison
    })

    // Paginate
    const page = req.page || 1
    const pageSize = req.pageSize || 10
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const items = filtered.slice(start, end)

    return {
      items: items.map((c) => ({
        id: c.id,
        companyCode: c.companyCode,
        companyName: c.companyName,
        consolidationType: c.consolidationType,
        currencyCode: c.currencyCode,
        fiscalYearEndMonth: c.fiscalYearEndMonth,
        isActive: c.isActive,
      })),
      totalCount: filtered.length,
      page,
      pageSize,
    }
  },

  async getCompanyTree(): Promise<BffCompanyTreeResponse> {
    await new Promise((resolve) => setTimeout(resolve, 200))

    // Only include active companies
    const activeCompanies = mockCompanies.filter((c) => c.isActive)

    const roots: BffCompanyTreeNode[] = []
    const childrenMap = new Map<string, BffCompanyTreeNode[]>()

    // Build children map
    activeCompanies.forEach((c) => {
      if (c.parentCompanyId) {
        if (!childrenMap.has(c.parentCompanyId)) {
          childrenMap.set(c.parentCompanyId, [])
        }
        childrenMap.get(c.parentCompanyId)!.push({
          id: c.id,
          companyCode: c.companyCode,
          companyName: c.companyName,
          consolidationType: c.consolidationType,
          isActive: c.isActive,
          children: [],
        })
      }
    })

    // Build roots
    activeCompanies.forEach((c) => {
      if (!c.parentCompanyId) {
        roots.push({
          id: c.id,
          companyCode: c.companyCode,
          companyName: c.companyName,
          consolidationType: c.consolidationType,
          isActive: c.isActive,
          children: childrenMap.get(c.id) || [],
        })
      }
    })

    return { roots }
  },

  async getCompanyDetail(id: string): Promise<BffCompanyDetailResponse> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    const company = mockCompanies.find((c) => c.id === id)
    if (!company) {
      throw new Error('COMPANY_NOT_FOUND')
    }
    return company
  },

  async createCompany(req: BffCreateCompanyRequest): Promise<BffCompanyDetailResponse> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Check duplicate code
    if (mockCompanies.some((c) => c.companyCode === req.companyCode)) {
      throw new Error('COMPANY_CODE_DUPLICATE')
    }

    const newCompany: BffCompanyDetailResponse = {
      id: `company-${Date.now()}`,
      companyCode: req.companyCode,
      companyName: req.companyName,
      companyNameShort: req.companyNameShort || null,
      parentCompanyId: req.parentCompanyId || null,
      parentCompanyName: req.parentCompanyId
        ? mockCompanies.find((c) => c.id === req.parentCompanyId)?.companyName || null
        : null,
      consolidationType: req.consolidationType,
      ownershipRatio: req.ownershipRatio ?? null,
      votingRatio: req.votingRatio ?? null,
      currencyCode: req.currencyCode,
      reportingCurrencyCode: req.reportingCurrencyCode || null,
      fiscalYearEndMonth: req.fiscalYearEndMonth,
      timezone: req.timezone || null,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    mockCompanies.push(newCompany)
    return newCompany
  },

  async updateCompany(id: string, req: BffUpdateCompanyRequest): Promise<BffCompanyDetailResponse> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const index = mockCompanies.findIndex((c) => c.id === id)
    if (index === -1) {
      throw new Error('COMPANY_NOT_FOUND')
    }

    // Check duplicate code
    if (req.companyCode && mockCompanies.some((c) => c.id !== id && c.companyCode === req.companyCode)) {
      throw new Error('COMPANY_CODE_DUPLICATE')
    }

    const current = mockCompanies[index]
    const updated: BffCompanyDetailResponse = {
      ...current,
      companyCode: req.companyCode ?? current.companyCode,
      companyName: req.companyName ?? current.companyName,
      companyNameShort: req.companyNameShort !== undefined ? req.companyNameShort : current.companyNameShort,
      parentCompanyId: req.parentCompanyId !== undefined ? req.parentCompanyId : current.parentCompanyId,
      parentCompanyName: req.parentCompanyId !== undefined
        ? (req.parentCompanyId ? mockCompanies.find((c) => c.id === req.parentCompanyId)?.companyName || null : null)
        : current.parentCompanyName,
      consolidationType: req.consolidationType ?? current.consolidationType,
      ownershipRatio: req.ownershipRatio !== undefined ? req.ownershipRatio : current.ownershipRatio,
      votingRatio: req.votingRatio !== undefined ? req.votingRatio : current.votingRatio,
      currencyCode: req.currencyCode ?? current.currencyCode,
      reportingCurrencyCode: req.reportingCurrencyCode !== undefined ? req.reportingCurrencyCode : current.reportingCurrencyCode,
      fiscalYearEndMonth: req.fiscalYearEndMonth ?? current.fiscalYearEndMonth,
      timezone: req.timezone !== undefined ? req.timezone : current.timezone,
      updatedAt: new Date().toISOString(),
    }

    mockCompanies[index] = updated
    return updated
  },

  async deactivateCompany(id: string): Promise<BffCompanyDetailResponse> {
    await new Promise((resolve) => setTimeout(resolve, 200))

    const company = mockCompanies.find((c) => c.id === id)
    if (!company) {
      throw new Error('COMPANY_NOT_FOUND')
    }
    if (!company.isActive) {
      throw new Error('COMPANY_ALREADY_INACTIVE')
    }

    company.isActive = false
    company.updatedAt = new Date().toISOString()
    return company
  },

  async reactivateCompany(id: string): Promise<BffCompanyDetailResponse> {
    await new Promise((resolve) => setTimeout(resolve, 200))

    const company = mockCompanies.find((c) => c.id === id)
    if (!company) {
      throw new Error('COMPANY_NOT_FOUND')
    }
    if (company.isActive) {
      throw new Error('COMPANY_ALREADY_ACTIVE')
    }

    company.isActive = true
    company.updatedAt = new Date().toISOString()
    return company
  },
}

// Export as default bffClient for current phase
export const bffClient = mockBffClient
