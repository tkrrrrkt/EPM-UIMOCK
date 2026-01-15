/**
 * BFF Contracts: company-master
 *
 * SSoT: .kiro/specs/master-data/company-master/design.md
 *
 * UI は packages/contracts/src/api を参照してはならない
 */

// ============================================================================
// Enums
// ============================================================================

export const ConsolidationType = {
  FULL: 'full',
  EQUITY: 'equity',
  NONE: 'none',
} as const

export type ConsolidationType = (typeof ConsolidationType)[keyof typeof ConsolidationType]

// ============================================================================
// Request DTOs
// ============================================================================

export interface BffListCompaniesRequest {
  page?: number           // default: 1
  pageSize?: number       // default: 50, max: 200
  sortBy?: 'companyCode' | 'companyName'
  sortOrder?: 'asc' | 'desc'
  keyword?: string        // 法人コード・法人名部分一致
  isActive?: boolean      // 有効フラグフィルタ
  consolidationType?: ConsolidationType  // 連結種別フィルタ
}

export interface BffCreateCompanyRequest {
  companyCode: string
  companyName: string
  companyNameShort?: string
  parentCompanyId?: string
  consolidationType: ConsolidationType
  ownershipRatio?: number       // 0-100
  votingRatio?: number          // 0-100
  currencyCode: string          // ISO 4217 (e.g., "JPY")
  reportingCurrencyCode?: string // ISO 4217
  fiscalYearEndMonth: number    // 1-12
  timezone?: string             // IANA timezone (e.g., "Asia/Tokyo")
}

export interface BffUpdateCompanyRequest {
  companyCode?: string
  companyName?: string
  companyNameShort?: string
  parentCompanyId?: string | null  // null で親法人解除
  consolidationType?: ConsolidationType
  ownershipRatio?: number | null
  votingRatio?: number | null
  currencyCode?: string
  reportingCurrencyCode?: string | null
  fiscalYearEndMonth?: number
  timezone?: string | null
}

// ============================================================================
// Response DTOs
// ============================================================================

export interface BffCompanySummary {
  id: string
  companyCode: string
  companyName: string
  consolidationType: ConsolidationType
  currencyCode: string
  fiscalYearEndMonth: number
  isActive: boolean
}

export interface BffListCompaniesResponse {
  items: BffCompanySummary[]
  totalCount: number
  page: number
  pageSize: number
}

export interface BffCompanyDetailResponse {
  id: string
  companyCode: string
  companyName: string
  companyNameShort: string | null
  parentCompanyId: string | null
  parentCompanyName: string | null  // BFF で解決
  consolidationType: ConsolidationType
  ownershipRatio: number | null
  votingRatio: number | null
  currencyCode: string
  reportingCurrencyCode: string | null
  fiscalYearEndMonth: number
  timezone: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Tree Response（階層表示用）
export interface BffCompanyTreeNode {
  id: string
  companyCode: string
  companyName: string
  consolidationType: ConsolidationType
  isActive: boolean
  children: BffCompanyTreeNode[]
}

export interface BffCompanyTreeResponse {
  roots: BffCompanyTreeNode[]  // 親なし法人がルート
}

// ============================================================================
// Error Codes (UI-facing)
// ============================================================================

export const CompanyMasterErrorCode = {
  COMPANY_NOT_FOUND: 'COMPANY_NOT_FOUND',
  COMPANY_CODE_DUPLICATE: 'COMPANY_CODE_DUPLICATE',
  COMPANY_ALREADY_INACTIVE: 'COMPANY_ALREADY_INACTIVE',
  COMPANY_ALREADY_ACTIVE: 'COMPANY_ALREADY_ACTIVE',
  PARENT_COMPANY_NOT_FOUND: 'PARENT_COMPANY_NOT_FOUND',
  SELF_REFERENCE_NOT_ALLOWED: 'SELF_REFERENCE_NOT_ALLOWED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const

export type CompanyMasterErrorCode =
  typeof CompanyMasterErrorCode[keyof typeof CompanyMasterErrorCode]

export interface CompanyMasterError {
  code: CompanyMasterErrorCode
  message: string
  details?: Record<string, unknown>
}
