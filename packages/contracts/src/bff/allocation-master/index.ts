// Allocation Master BFF Contracts
// packages/contracts/src/bff/allocation-master/index.ts

// ============================================================
// Enums
// ============================================================

export const ScenarioType = {
  ACTUAL: 'ACTUAL',
  BUDGET: 'BUDGET',
  FORECAST: 'FORECAST',
} as const
export type ScenarioType = (typeof ScenarioType)[keyof typeof ScenarioType]

export const DriverType = {
  FIXED: 'FIXED',
  HEADCOUNT: 'HEADCOUNT',
  SUBJECT_AMOUNT: 'SUBJECT_AMOUNT',
  MEASURE: 'MEASURE',
  KPI: 'KPI',
} as const
export type DriverType = (typeof DriverType)[keyof typeof DriverType]

export const DriverSourceType = {
  MASTER: 'MASTER',
  FACT: 'FACT',
  KPI: 'KPI',
} as const
export type DriverSourceType = (typeof DriverSourceType)[keyof typeof DriverSourceType]

export const TargetType = {
  DEPARTMENT: 'DEPARTMENT',
  DIMENSION_VALUE: 'DIMENSION_VALUE',
} as const
export type TargetType = (typeof TargetType)[keyof typeof TargetType]

// ============================================================
// Request DTOs
// ============================================================

export interface BffAllocationEventListRequest {
  keyword?: string
  scenarioType?: ScenarioType
  isActive?: boolean
  page?: number
  pageSize?: number
  sortBy?: 'eventCode' | 'eventName' | 'scenarioType' | 'isActive' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
}

export interface BffCreateAllocationEventRequest {
  companyId: string
  eventCode: string
  eventName: string
  scenarioType: ScenarioType
  isActive?: boolean
  notes?: string
}

export interface BffUpdateAllocationEventRequest {
  eventCode?: string
  eventName?: string
  scenarioType?: ScenarioType
  isActive?: boolean
  notes?: string
}

export interface BffCopyAllocationEventRequest {
  newEventCode: string
  newEventName: string
}

export interface BffCreateAllocationStepRequest {
  stepName: string
  fromSubjectId: string
  fromDepartmentStableId: string
  driverType: DriverType
  driverSourceType: DriverSourceType
  driverRefId?: string
  notes?: string
}

export interface BffUpdateAllocationStepRequest {
  stepName?: string
  fromSubjectId?: string
  fromDepartmentStableId?: string
  driverType?: DriverType
  driverSourceType?: DriverSourceType
  driverRefId?: string
  notes?: string
}

export interface BffReorderStepsRequest {
  eventVersion: number
  stepOrders: { id: string; stepNo: number }[]
}

export interface BffCreateAllocationTargetRequest {
  targetType: TargetType
  targetId: string
  toSubjectId?: string
  fixedRatio?: string
  sortOrder?: number
  isActive?: boolean
}

export interface BffUpdateAllocationTargetRequest {
  targetType?: TargetType
  targetId?: string
  toSubjectId?: string | null
  fixedRatio?: string | null
  sortOrder?: number
  isActive?: boolean
}

export interface BffAllocationDriverListRequest {
  keyword?: string
  driverType?: DriverType
  page?: number
  pageSize?: number
  sortBy?: 'driverCode' | 'driverName' | 'driverType' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
}

export interface BffCreateAllocationDriverRequest {
  companyId: string
  driverCode: string
  driverName: string
  driverType: DriverType
  sourceType: DriverSourceType
  driverSubjectId?: string
  measureKey?: string
  kpiSubjectId?: string
  periodRule?: string
  notes?: string
}

export interface BffUpdateAllocationDriverRequest {
  driverCode?: string
  driverName?: string
  driverType?: DriverType
  sourceType?: DriverSourceType
  driverSubjectId?: string
  measureKey?: string
  kpiSubjectId?: string
  periodRule?: string
  notes?: string
}

// ============================================================
// Response DTOs
// ============================================================

export interface BffAllocationTargetResponse {
  id: string
  targetType: TargetType
  targetId: string
  targetName: string
  toSubjectId: string | null
  toSubjectName: string | null
  fixedRatio: string | null
  sortOrder: number | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface BffAllocationStepResponse {
  id: string
  stepNo: number
  stepName: string
  fromSubjectId: string
  fromSubjectName: string
  fromDepartmentStableId: string
  fromDepartmentName: string
  driverType: DriverType
  driverSourceType: DriverSourceType
  driverRefId: string | null
  driverName: string | null
  notes: string | null
  targets: BffAllocationTargetResponse[]
  createdAt: string
  updatedAt: string
}

export interface BffAllocationEventResponse {
  id: string
  companyId: string
  eventCode: string
  eventName: string
  scenarioType: ScenarioType
  isActive: boolean
  version: number
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface BffAllocationEventDetailResponse extends BffAllocationEventResponse {
  steps: BffAllocationStepResponse[]
}

export interface BffAllocationEventListResponse {
  items: BffAllocationEventResponse[]
  total: number
  page: number
  pageSize: number
}

export interface BffAllocationDriverResponse {
  id: string
  companyId: string
  driverCode: string
  driverName: string
  driverType: DriverType
  sourceType: DriverSourceType
  driverSubjectId: string | null
  driverSubjectName: string | null
  measureKey: string | null
  kpiSubjectId: string | null
  kpiSubjectName: string | null
  periodRule: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface BffAllocationDriverListResponse {
  items: BffAllocationDriverResponse[]
  total: number
  page: number
  pageSize: number
}

// ============================================================
// Error Codes
// ============================================================

export const AllocationMasterErrorCode = {
  EVENT_NOT_FOUND: 'EVENT_NOT_FOUND',
  EVENT_CODE_DUPLICATE: 'EVENT_CODE_DUPLICATE',
  EVENT_HAS_STEPS: 'EVENT_HAS_STEPS',
  EVENT_VERSION_CONFLICT: 'EVENT_VERSION_CONFLICT',
  STEP_NOT_FOUND: 'STEP_NOT_FOUND',
  STEP_HAS_TARGETS: 'STEP_HAS_TARGETS',
  TARGET_NOT_FOUND: 'TARGET_NOT_FOUND',
  TARGET_DUPLICATE: 'TARGET_DUPLICATE',
  TARGET_REF_NOT_FOUND: 'TARGET_REF_NOT_FOUND',
  DRIVER_NOT_FOUND: 'DRIVER_NOT_FOUND',
  DRIVER_CODE_DUPLICATE: 'DRIVER_CODE_DUPLICATE',
  DRIVER_IN_USE: 'DRIVER_IN_USE',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_DRIVER_CONFIG: 'INVALID_DRIVER_CONFIG',
  INVALID_FIXED_RATIO: 'INVALID_FIXED_RATIO',
} as const

export type AllocationMasterErrorCode =
  (typeof AllocationMasterErrorCode)[keyof typeof AllocationMasterErrorCode]

export interface AllocationMasterError {
  code: AllocationMasterErrorCode
  message: string
  details?: Record<string, unknown>
}
