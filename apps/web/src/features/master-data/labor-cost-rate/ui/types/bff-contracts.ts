/**
 * BFF Contract Types for Labor Cost Rate
 *
 * These types represent the DTOs from packages/contracts/src/bff/labor-cost-rate
 * In the actual project, these should be imported from @contracts/bff/labor-cost-rate
 */

// Enums
export type ResourceType = "EMPLOYEE" | "CONTRACTOR"
export type RateType = "MONTHLY" | "HOURLY" | "DAILY"

// Subject Types (for item breakdown)
export interface BffSubject {
  id: string
  code: string
  name: string
}

export interface BffListSubjectsResponse {
  items: BffSubject[]
}

// Labor Cost Rate Item Types
export interface BffLaborCostRateItemInput {
  subjectId: string
  amount: string // Decimal as string
  displayOrder: number
}

export interface BffLaborCostRateItem {
  id: string
  subjectId: string
  subjectCode: string
  subjectName: string
  amount: string // Decimal as string
  percentage: string // Auto-calculated, Decimal as string
  displayOrder: number
}

// Request DTOs
export interface BffListLaborCostRatesRequest {
  page?: number
  pageSize?: number
  sortBy?: "rateCode" | "jobCategory" | "grade" | "effectiveDate" | "totalRate"
  sortOrder?: "asc" | "desc"
  keyword?: string
  resourceType?: ResourceType
  grade?: string
  employmentType?: string
  rateType?: RateType
  isActive?: boolean
  asOfDate?: string // ISO 8601 date
}

export interface BffCreateLaborCostRateRequest {
  rateCode: string
  resourceType: ResourceType
  vendorName?: string // Required when resourceType is CONTRACTOR
  jobCategory: string
  grade?: string
  employmentType?: string
  rateType: RateType
  effectiveDate: string // ISO 8601 date
  expiryDate?: string // ISO 8601 date
  notes?: string
  items: BffLaborCostRateItemInput[] // At least one item required
}

export interface BffUpdateLaborCostRateRequest {
  rateCode?: string
  resourceType?: ResourceType
  vendorName?: string
  jobCategory?: string
  grade?: string
  employmentType?: string
  rateType?: RateType
  effectiveDate?: string
  expiryDate?: string
  notes?: string
  items?: BffLaborCostRateItemInput[] // At least one item required when provided
}

// Response DTOs
export interface BffLaborCostRateSummary {
  id: string
  rateCode: string
  resourceType: ResourceType
  vendorName: string | null
  jobCategory: string
  grade: string | null
  employmentType: string | null
  rateType: RateType
  totalRate: string // Auto-calculated from items
  effectiveDate: string
  expiryDate: string | null
  isActive: boolean
}

export interface BffListLaborCostRatesResponse {
  items: BffLaborCostRateSummary[]
  totalCount: number
  page: number
  pageSize: number
}

export interface BffLaborCostRateDetailResponse {
  id: string
  rateCode: string
  resourceType: ResourceType
  vendorName: string | null
  jobCategory: string
  grade: string | null
  employmentType: string | null
  rateType: RateType
  totalRate: string // Auto-calculated from items
  effectiveDate: string
  expiryDate: string | null
  isActive: boolean
  notes: string | null
  items: BffLaborCostRateItem[] // Subject-wise breakdown
  createdAt: string
  updatedAt: string
}

// Error Types
export type LaborCostRateErrorCode =
  | "LABOR_COST_RATE_NOT_FOUND"
  | "RATE_CODE_DUPLICATE"
  | "LABOR_COST_RATE_ALREADY_INACTIVE"
  | "LABOR_COST_RATE_ALREADY_ACTIVE"
  | "INVALID_DATE_RANGE"
  | "SUBJECT_NOT_FOUND"
  | "DUPLICATE_SUBJECT_IN_ITEMS"
  | "NO_ITEMS_PROVIDED"
  | "INVALID_ITEM_AMOUNT"
  | "VALIDATION_ERROR"

export interface BffError {
  code: LaborCostRateErrorCode
  message: string
  details?: Record<string, unknown>
}
