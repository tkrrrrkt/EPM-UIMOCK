// BFF Contracts for Headcount Planning（人員計画登録）
// SSoT for UI/BFF communication
// Source: .kiro/specs/planning/headcount-planning/design.md

// ============================================
// Enums
// ============================================

export const ResourceType = {
  EMPLOYEE: "EMPLOYEE",
  CONTRACTOR: "CONTRACTOR",
} as const
export type ResourceType = (typeof ResourceType)[keyof typeof ResourceType]

export const RateType = {
  MONTHLY: "MONTHLY",
  HOURLY: "HOURLY",
  DAILY: "DAILY",
} as const
export type RateType = (typeof RateType)[keyof typeof RateType]

export const AllocationType = {
  PERCENTAGE: "PERCENTAGE",
  HEADCOUNT: "HEADCOUNT",
} as const
export type AllocationType = (typeof AllocationType)[keyof typeof AllocationType]

export const AllocationStatus = {
  NOT_SET: "NOT_SET",
  PARTIAL: "PARTIAL",
  COMPLETE: "COMPLETE",
} as const
export type AllocationStatus = (typeof AllocationStatus)[keyof typeof AllocationStatus]

export const AllocationCheckMode = {
  ERROR: "ERROR",
  WARN: "WARN",
} as const
export type AllocationCheckMode = (typeof AllocationCheckMode)[keyof typeof AllocationCheckMode]

// ============================================
// Common Types
// ============================================

export interface BffDepartmentRef {
  id: string
  stableId: string
  code: string
  name: string
}

export interface BffRateRef {
  id: string
  code: string
  totalRate: string
  rateType: RateType
}

export interface BffRateItemRef {
  subjectId: string
  subjectCode: string
  subjectName: string
  amount: string
  percentage: string
}

// ============================================
// Context DTOs
// ============================================

export interface BffHeadcountContextRequest {
  companyId: string
}

export interface BffHeadcountContextResponse {
  fiscalYears: { value: number; label: string }[]
  planEvents: {
    id: string
    code: string
    name: string
    scenarioType: string
    allocationCheckMode: AllocationCheckMode
  }[]
  planVersions: { id: string; code: string; name: string; status: string }[]
  departments: BffDepartmentRef[]
}

// ============================================
// Resource Plan DTOs（レイヤー1：一括管理）
// ============================================

export interface BffListResourcePlansRequest {
  companyId: string
  planEventId: string
  planVersionId: string
  sourceDepartmentStableId?: string
  resourceType?: ResourceType
  keyword?: string
  page?: number
  pageSize?: number
  sortBy?: "resourceType" | "jobCategory" | "grade" | "headcount" | "annualAmount"
  sortOrder?: "asc" | "desc"
}

export interface BffResourcePlanSummary {
  id: string
  resourceType: ResourceType
  jobCategory: string
  grade: string | null
  sourceDepartment: BffDepartmentRef
  rate: BffRateRef | null
  customRate: string | null
  rateType: RateType
  totalHeadcount: string
  annualAmount: string
  allocationStatus: AllocationStatus
  months: BffResourcePlanMonth[]
}

export interface BffListResourcePlansResponse {
  items: BffResourcePlanSummary[]
  totalCount: number
  page: number
  pageSize: number
  summary: {
    employeeCount: string
    employeeAmount: string
    contractorCount: string
    contractorAmount: string
    totalAmount: string
  }
}

export interface BffResourcePlanMonth {
  periodMonth: number // 1-12
  headcount: string // "10.00"
}

export interface BffResourceAllocation {
  id: string
  targetDepartment: BffDepartmentRef
  allocationType: AllocationType
  percentage: string | null
  headcountAmount: string | null
  annualAmount: string
}

export interface BffResourcePlanDetailResponse {
  id: string
  resourceType: ResourceType
  jobCategory: string
  grade: string | null
  sourceDepartment: BffDepartmentRef
  rate: (BffRateRef & { items: BffRateItemRef[] }) | null
  customRate: string | null
  rateType: RateType
  months: BffResourcePlanMonth[]
  allocations: BffResourceAllocation[]
  notes: string | null
  totalHeadcount: string
  annualAmount: string
}

export interface BffCreateResourcePlanRequest {
  companyId: string
  planEventId: string
  planVersionId: string
  sourceDepartmentStableId: string
  resourceType: ResourceType
  jobCategory: string
  grade?: string
  rateId?: string
  customRate?: string
  rateType: RateType
  notes?: string
}

export interface BffUpdateResourcePlanRequest {
  resourceType?: ResourceType
  jobCategory?: string
  grade?: string
  rateId?: string
  customRate?: string
  rateType?: RateType
  notes?: string
}

export interface BffResourcePlanResponse {
  id: string
  resourceType: ResourceType
  jobCategory: string
  grade: string | null
  rateType: RateType
}

export interface BffUpdateResourcePlanMonthsRequest {
  months: { periodMonth: number; headcount: string }[]
}

export interface BffResourcePlanMonthsResponse {
  months: BffResourcePlanMonth[]
  totalHeadcount: string
  annualAmount: string
}

export interface BffUpdateResourceAllocationsRequest {
  allocationType: AllocationType
  allocations: {
    targetDepartmentStableId: string
    percentage?: string
    headcountAmount?: string
  }[]
}

export interface BffResourceAllocationsResponse {
  allocations: BffResourceAllocation[]
  totalPercentage: string
  totalHeadcount: string
  warning?: string // allocation_check_mode = WARN の場合
}

// ============================================
// Individual Allocation DTOs（レイヤー2：個人別管理）
// ============================================

export interface BffListIndividualAllocationsRequest {
  companyId: string
  planEventId: string
  planVersionId: string
  sourceDepartmentStableId?: string
  keyword?: string
  page?: number
  pageSize?: number
  sortBy?: "individualName" | "jobCategory" | "grade" | "targetDepartment" | "percentage"
  sortOrder?: "asc" | "desc"
}

export interface BffIndividualAllocationSummary {
  individualKey: string // employee_stable_id or hash of individual_name
  employeeStableId: string | null
  individualName: string
  sourceDepartment: BffDepartmentRef
  jobCategory: string
  grade: string | null
  rate: BffRateRef | null
  customRate: string | null
  rateType: RateType
  totalPercentage: string
  annualAmount: string
  allocations: {
    id: string
    targetDepartment: BffDepartmentRef
    percentage: string
    annualAmount: string
  }[]
}

export interface BffListIndividualAllocationsResponse {
  items: BffIndividualAllocationSummary[]
  totalCount: number
  page: number
  pageSize: number
  summary: {
    individualCount: number
    totalAmount: string
  }
}

export interface BffCreateIndividualAllocationRequest {
  companyId: string
  planEventId: string
  planVersionId: string
  sourceDepartmentStableId: string
  employeeStableId?: string
  individualName: string
  jobCategory: string
  grade?: string
  rateId?: string
  customRate?: string
  rateType: RateType
  allocations: {
    targetDepartmentStableId: string
    percentage: string
  }[]
}

export interface BffUpdateIndividualAllocationRequest {
  individualName?: string
  jobCategory?: string
  grade?: string
  rateId?: string
  customRate?: string
  rateType?: RateType
  allocations?: {
    targetDepartmentStableId: string
    percentage: string
  }[]
}

export interface BffIndividualAllocationResponse {
  individualKey: string
  individualName: string
  totalPercentage: string
  annualAmount: string
}

// ============================================
// Summary DTOs
// ============================================

export interface BffHeadcountSummaryRequest {
  companyId: string
  planEventId: string
  planVersionId: string
  targetDepartmentStableId: string
}

export interface BffHeadcountSummaryResponse {
  targetDepartment: BffDepartmentRef
  items: {
    category: "OWN_EMPLOYEE" | "TRANSFER_IN" | "CONTRACTOR"
    sourceDepartment: BffDepartmentRef | null
    jobCategory: string
    grade: string | null
    headcount: string
    annualAmount: string
    notes: string | null
  }[]
  totals: {
    ownEmployeeHeadcount: string
    ownEmployeeAmount: string
    transferInHeadcount: string
    transferInAmount: string
    contractorHeadcount: string
    contractorAmount: string
    totalHeadcount: string
    totalAmount: string
  }
}

// ============================================
// Apply Budget DTOs
// ============================================

export interface BffApplyBudgetRequest {
  companyId: string
  planEventId: string
  planVersionId: string
}

export interface BffApplyBudgetResponse {
  success: boolean
  affectedCount: number
  deletedCount: number
  insertedCount: number
  warnings?: string[]
}

// ============================================
// Labor Cost Rate Reference DTOs
// ============================================

export interface BffListLaborCostRatesForPlanningRequest {
  companyId: string
  resourceType?: ResourceType
  jobCategory?: string
  grade?: string
  rateType?: RateType
  isActive?: boolean
  asOfDate?: string
  page?: number
  pageSize?: number
}

export interface BffLaborCostRateForPlanningSummary {
  id: string
  rateCode: string
  resourceType: ResourceType
  jobCategory: string
  grade: string | null
  vendorName: string | null
  employmentType: string | null
  rateType: RateType
  totalRate: string
  effectiveDate: string
  expiryDate: string | null
  isActive: boolean
}

export interface BffListLaborCostRatesForPlanningResponse {
  items: BffLaborCostRateForPlanningSummary[]
  totalCount: number
  page: number
  pageSize: number
}

export interface BffLaborCostRateForPlanningDetailResponse {
  id: string
  rateCode: string
  resourceType: ResourceType
  jobCategory: string
  grade: string | null
  vendorName: string | null
  employmentType: string | null
  rateType: RateType
  totalRate: string
  effectiveDate: string
  expiryDate: string | null
  isActive: boolean
  items: BffRateItemRef[]
}

// ============================================
// Error Types
// ============================================

export type HeadcountPlanningErrorCode =
  | "RESOURCE_PLAN_NOT_FOUND"
  | "INDIVIDUAL_ALLOCATION_NOT_FOUND"
  | "DUPLICATE_RESOURCE_PLAN"
  | "DUPLICATE_ALLOCATION_TARGET"
  | "ALLOCATION_PERCENTAGE_NOT_100"
  | "ALLOCATION_HEADCOUNT_MISMATCH"
  | "RATE_NOT_FOUND"
  | "DEPARTMENT_NOT_FOUND"
  | "INVALID_PLAN_VERSION_STATUS"
  | "BUDGET_APPLY_FAILED"
  | "VALIDATION_ERROR"

export interface BffHeadcountPlanningError {
  code: HeadcountPlanningErrorCode
  message: string
  details?: Record<string, unknown>
}
