// Group Subject Master BFF Contracts
// packages/contracts/src/bff/group-subject-master/index.ts

// ============================================================
// Request DTOs
// ============================================================

export interface BffGroupSubjectTreeRequest {
  keyword?: string
  subjectType?: 'FIN' | 'KPI'
  subjectClass?: 'BASE' | 'AGGREGATE'
  isActive?: boolean
}

export interface BffCreateGroupSubjectRequest {
  groupSubjectCode: string
  groupSubjectName: string
  groupSubjectNameShort?: string
  subjectClass: 'BASE' | 'AGGREGATE'
  subjectType: 'FIN' | 'KPI'
  postingAllowed?: boolean
  measureKind: string
  unit?: string
  scale?: number
  aggregationMethod: 'SUM' | 'EOP' | 'AVG' | 'MAX' | 'MIN'
  finStmtClass?: 'PL' | 'BS'
  glElement?: string
  normalBalance?: 'debit' | 'credit'
  isContra?: boolean
  notes?: string
}

export interface BffUpdateGroupSubjectRequest {
  groupSubjectCode?: string
  groupSubjectName?: string
  groupSubjectNameShort?: string
  measureKind?: string
  unit?: string
  scale?: number
  aggregationMethod?: 'SUM' | 'EOP' | 'AVG' | 'MAX' | 'MIN'
  finStmtClass?: 'PL' | 'BS'
  glElement?: string
  normalBalance?: 'debit' | 'credit'
  isContra?: boolean
  notes?: string
}

export interface BffAddGroupRollupRequest {
  componentGroupSubjectId: string
  coefficient: 1 | -1
  sortOrder?: number
}

export interface BffUpdateGroupRollupRequest {
  coefficient?: 1 | -1
  sortOrder?: number
}

export interface BffMoveGroupSubjectRequest {
  groupSubjectId: string
  fromParentId?: string
  toParentId?: string
  coefficient?: 1 | -1
}

// ============================================================
// Response DTOs
// ============================================================

export interface BffGroupSubjectTreeNode {
  id: string
  groupSubjectCode: string
  groupSubjectName: string
  subjectClass: 'BASE' | 'AGGREGATE'
  subjectType: 'FIN' | 'KPI'
  isActive: boolean
  coefficient?: 1 | -1
  children: BffGroupSubjectTreeNode[]
}

export interface BffGroupSubjectTreeResponse {
  nodes: BffGroupSubjectTreeNode[]
  unassigned: BffGroupSubjectTreeNode[]
  isParentCompany: boolean
}

export interface BffGroupSubjectDetailResponse {
  id: string
  groupSubjectCode: string
  groupSubjectName: string
  groupSubjectNameShort: string | null
  subjectClass: 'BASE' | 'AGGREGATE'
  subjectType: 'FIN' | 'KPI'
  postingAllowed: boolean
  measureKind: string
  unit: string | null
  scale: number
  aggregationMethod: string
  finStmtClass: 'PL' | 'BS' | null
  glElement: string | null
  normalBalance: 'debit' | 'credit' | null
  isContra: boolean
  isActive: boolean
  notes: string | null
  createdAt: string
  updatedAt: string
  isParentCompany: boolean
}

// ============================================================
// Error Codes
// ============================================================

export const GroupSubjectMasterErrorCode = {
  GROUP_SUBJECT_NOT_FOUND: 'GROUP_SUBJECT_NOT_FOUND',
  GROUP_SUBJECT_CODE_DUPLICATE: 'GROUP_SUBJECT_CODE_DUPLICATE',
  GROUP_SUBJECT_ALREADY_INACTIVE: 'GROUP_SUBJECT_ALREADY_INACTIVE',
  GROUP_SUBJECT_ALREADY_ACTIVE: 'GROUP_SUBJECT_ALREADY_ACTIVE',
  GROUP_ROLLUP_ALREADY_EXISTS: 'GROUP_ROLLUP_ALREADY_EXISTS',
  GROUP_ROLLUP_NOT_FOUND: 'GROUP_ROLLUP_NOT_FOUND',
  CIRCULAR_REFERENCE_DETECTED: 'CIRCULAR_REFERENCE_DETECTED',
  CANNOT_ADD_CHILD_TO_BASE: 'CANNOT_ADD_CHILD_TO_BASE',
  NOT_PARENT_COMPANY: 'NOT_PARENT_COMPANY',
  INVALID_COEFFICIENT: 'INVALID_COEFFICIENT',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const

export type GroupSubjectMasterErrorCode =
  (typeof GroupSubjectMasterErrorCode)[keyof typeof GroupSubjectMasterErrorCode]

export interface GroupSubjectMasterError {
  code: GroupSubjectMasterErrorCode
  message: string
  details?: Record<string, unknown>
}
