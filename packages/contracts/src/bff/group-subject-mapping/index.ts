// Group Subject Mapping BFF Contracts
// packages/contracts/src/bff/group-subject-mapping/index.ts

// ============================================================
// Request DTOs
// ============================================================

export interface BffMappingListRequest {
  page?: number
  pageSize?: number
  sortBy?: 'subjectCode' | 'subjectName' | 'groupSubjectCode' | 'groupSubjectName'
  sortOrder?: 'asc' | 'desc'
  keyword?: string
  subjectType?: 'FIN' | 'KPI'
  subjectClass?: 'BASE' | 'AGGREGATE'
  mappingStatus?: 'mapped' | 'unmapped'
  isActive?: boolean
}

export interface BffCreateMappingRequest {
  companySubjectId: string
  groupSubjectId: string
  coefficient?: 1 | -1
  mappingNote?: string
}

export interface BffUpdateMappingRequest {
  groupSubjectId?: string
  coefficient?: 1 | -1
  mappingNote?: string
  isActive?: boolean
}

export interface BffBulkMappingRequest {
  companySubjectIds: string[]
  groupSubjectId: string
  coefficient?: 1 | -1
}

export interface BffGroupSubjectSelectRequest {
  keyword?: string
  subjectType?: 'FIN' | 'KPI'
}

// ============================================================
// Response DTOs
// ============================================================

export interface BffMappingListItem {
  id: string | null
  companySubjectId: string
  companySubjectCode: string
  companySubjectName: string
  companySubjectClass: 'BASE' | 'AGGREGATE'
  companySubjectType: 'FIN' | 'KPI'
  companySubjectIsContra: boolean
  groupSubjectId: string | null
  groupSubjectCode: string | null
  groupSubjectName: string | null
  coefficient: 1 | -1 | null
  mappingNote: string | null
  isActive: boolean | null
  isMapped: boolean
}

export interface BffMappingListResponse {
  items: BffMappingListItem[]
  pagination: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
  }
  statistics: {
    mappedCount: number
    unmappedCount: number
    totalCount: number
  }
}

export interface BffMappingDetailResponse {
  id: string
  companySubjectId: string
  companySubjectCode: string
  companySubjectName: string
  companySubjectClass: 'BASE' | 'AGGREGATE'
  companySubjectType: 'FIN' | 'KPI'
  companySubjectIsContra: boolean
  groupSubjectId: string
  groupSubjectCode: string
  groupSubjectName: string
  groupSubjectClass: 'BASE' | 'AGGREGATE'
  groupSubjectType: 'FIN' | 'KPI'
  coefficient: 1 | -1
  mappingNote: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface BffBulkMappingResponse {
  successCount: number
  skippedCount: number
  skippedSubjectIds: string[]
}

export interface BffGroupSubjectSelectTreeNode {
  id: string
  groupSubjectCode: string
  groupSubjectName: string
  subjectClass: 'BASE' | 'AGGREGATE'
  subjectType: 'FIN' | 'KPI'
  isRecommended: boolean
  children: BffGroupSubjectSelectTreeNode[]
}

export interface BffGroupSubjectSelectTreeResponse {
  nodes: BffGroupSubjectSelectTreeNode[]
  unassigned: BffGroupSubjectSelectTreeNode[]
}

// ============================================================
// Error Codes
// ============================================================

export const GroupSubjectMappingErrorCode = {
  MAPPING_NOT_FOUND: 'MAPPING_NOT_FOUND',
  MAPPING_ALREADY_EXISTS: 'MAPPING_ALREADY_EXISTS',
  MAPPING_ALREADY_INACTIVE: 'MAPPING_ALREADY_INACTIVE',
  MAPPING_ALREADY_ACTIVE: 'MAPPING_ALREADY_ACTIVE',
  COMPANY_SUBJECT_NOT_FOUND: 'COMPANY_SUBJECT_NOT_FOUND',
  GROUP_SUBJECT_NOT_FOUND: 'GROUP_SUBJECT_NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const

export type GroupSubjectMappingErrorCode =
  (typeof GroupSubjectMappingErrorCode)[keyof typeof GroupSubjectMappingErrorCode]

export interface GroupSubjectMappingError {
  code: GroupSubjectMappingErrorCode
  message: string
  details?: Record<string, unknown>
}
