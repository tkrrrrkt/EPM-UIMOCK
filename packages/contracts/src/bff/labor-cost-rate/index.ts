// BFF Contracts for Labor Cost Rate Master
// SSoT for UI/BFF communication

// ============================================
// Labor Cost Rate Master DTOs
// ============================================

// Request DTOs
export interface BffListLaborCostRatesRequest {
  page?: number
  pageSize?: number
  sortBy?: "rateCode" | "jobCategory" | "grade" | "effectiveDate" | "plannedRate"
  sortOrder?: "asc" | "desc"
  keyword?: string
  grade?: string
  employmentType?: string
  rateType?: "MONTHLY" | "HOURLY"
  isActive?: boolean
  asOfDate?: string // ISO 8601 date
}

export interface BffCreateLaborCostRateRequest {
  rateCode: string
  jobCategory: string
  grade?: string
  employmentType?: string
  rateType: "MONTHLY" | "HOURLY"
  plannedRate: string // Decimal as string
  effectiveDate: string // ISO 8601 date
  expiryDate?: string // ISO 8601 date
  notes?: string
}

export interface BffUpdateLaborCostRateRequest {
  rateCode?: string
  jobCategory?: string
  grade?: string
  employmentType?: string
  rateType?: "MONTHLY" | "HOURLY"
  plannedRate?: string
  effectiveDate?: string
  expiryDate?: string
  notes?: string
}

// Response DTOs
export interface BffLaborCostRateSummary {
  id: string
  rateCode: string
  jobCategory: string
  grade: string | null
  employmentType: string | null
  rateType: "MONTHLY" | "HOURLY"
  plannedRate: string
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
  jobCategory: string
  grade: string | null
  employmentType: string | null
  rateType: "MONTHLY" | "HOURLY"
  plannedRate: string
  effectiveDate: string
  expiryDate: string | null
  isActive: boolean
  notes: string | null
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
  | "VALIDATION_ERROR"

export interface BffError {
  code: LaborCostRateErrorCode
  message: string
  details?: Record<string, unknown>
}

