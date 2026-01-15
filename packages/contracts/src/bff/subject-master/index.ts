// Subject Master BFF Contracts
// packages/contracts/src/bff/subject-master/index.ts

// ============================================================
// Request DTOs
// ============================================================

export interface BffSubjectTreeRequest {
  keyword?: string
  subjectType?: 'FIN' | 'KPI'
  subjectClass?: 'BASE' | 'AGGREGATE'
  isActive?: boolean
}

export interface BffCreateSubjectRequest {
  subjectCode: string
  subjectName: string
  subjectNameShort?: string
  subjectClass: 'BASE' | 'AGGREGATE'
  subjectType: 'FIN' | 'KPI'
  postingAllowed?: boolean
  measureKind: string
  unit?: string
  scale?: number
  aggregationMethod: 'SUM' | 'EOP' | 'AVG' | 'MAX' | 'MIN'
  direction?: string
  allowNegative?: boolean
  isLaborCostApplicable?: boolean // 労務費単価利用可否 default: false
  notes?: string
}

export interface BffUpdateSubjectRequest {
  subjectCode?: string
  subjectName?: string
  subjectNameShort?: string
  measureKind?: string
  unit?: string
  scale?: number
  aggregationMethod?: 'SUM' | 'EOP' | 'AVG' | 'MAX' | 'MIN'
  direction?: string
  allowNegative?: boolean
  isLaborCostApplicable?: boolean // 労務費単価利用可否
  notes?: string
}

export interface BffAddRollupRequest {
  componentSubjectId: string
  coefficient: number
  validFrom?: string
  validTo?: string
  sortOrder?: number
}

export interface BffUpdateRollupRequest {
  coefficient?: number
  validFrom?: string
  validTo?: string
  sortOrder?: number
}

export interface BffMoveSubjectRequest {
  subjectId: string
  fromParentId?: string
  toParentId?: string
  coefficient?: number
}

// ============================================================
// Response DTOs
// ============================================================

export interface BffSubjectTreeNode {
  id: string
  subjectCode: string
  subjectName: string
  subjectClass: 'BASE' | 'AGGREGATE'
  subjectType: 'FIN' | 'KPI'
  isActive: boolean
  coefficient?: number
  children: BffSubjectTreeNode[]
}

export interface BffSubjectTreeResponse {
  nodes: BffSubjectTreeNode[]
  unassigned: BffSubjectTreeNode[]
}

export interface BffSubjectDetailResponse {
  id: string
  subjectCode: string
  subjectName: string
  subjectNameShort: string | null
  subjectClass: 'BASE' | 'AGGREGATE'
  subjectType: 'FIN' | 'KPI'
  postingAllowed: boolean
  measureKind: string
  unit: string | null
  scale: number
  aggregationMethod: string
  direction: string | null
  allowNegative: boolean
  isLaborCostApplicable: boolean // 労務費単価利用可否
  isActive: boolean
  notes: string | null
  createdAt: string
  updatedAt: string
}

// ============================================================
// Error Codes
// ============================================================

export const SubjectMasterErrorCode = {
  SUBJECT_NOT_FOUND: 'SUBJECT_NOT_FOUND',
  SUBJECT_CODE_DUPLICATE: 'SUBJECT_CODE_DUPLICATE',
  SUBJECT_ALREADY_INACTIVE: 'SUBJECT_ALREADY_INACTIVE',
  SUBJECT_ALREADY_ACTIVE: 'SUBJECT_ALREADY_ACTIVE',
  ROLLUP_ALREADY_EXISTS: 'ROLLUP_ALREADY_EXISTS',
  ROLLUP_NOT_FOUND: 'ROLLUP_NOT_FOUND',
  CIRCULAR_REFERENCE_DETECTED: 'CIRCULAR_REFERENCE_DETECTED',
  CANNOT_ADD_CHILD_TO_BASE: 'CANNOT_ADD_CHILD_TO_BASE',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const

export type SubjectMasterErrorCode =
  (typeof SubjectMasterErrorCode)[keyof typeof SubjectMasterErrorCode]

export interface SubjectMasterError {
  code: SubjectMasterErrorCode
  message: string
  details?: Record<string, unknown>
}
