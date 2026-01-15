// Group Report Layout BFF Contracts
// packages/contracts/src/bff/group-report-layout/index.ts

// ============================================================
// Common Types
// ============================================================

export type LayoutType = 'PL' | 'BS' | 'KPI'
export type LineType = 'header' | 'account' | 'note' | 'blank'
export type SubjectClass = 'BASE' | 'AGGREGATE'
export type SignDisplayPolicy = 'auto' | 'force_plus' | 'force_minus' | 'force_paren'

// ============================================================
// Context DTOs
// ============================================================

export interface BffGroupLayoutContextResponse {
  isParentCompany: boolean
  canEdit: boolean
}

// ============================================================
// Layout Request DTOs
// ============================================================

export interface BffGroupLayoutListRequest {
  keyword?: string
  layoutType?: LayoutType
  isActive?: boolean
  page?: number
  pageSize?: number
  sortBy?: 'layoutCode' | 'layoutName' | 'sortOrder'
  sortOrder?: 'asc' | 'desc'
}

export interface BffCreateGroupLayoutRequest {
  layoutCode: string
  layoutName: string
  layoutType: LayoutType
  layoutNameShort?: string
  description?: string
}

export interface BffUpdateGroupLayoutRequest {
  layoutCode?: string
  layoutName?: string
  layoutNameShort?: string
  description?: string
  layoutType?: LayoutType
}

export interface BffCopyGroupLayoutRequest {
  layoutCode: string
  layoutName: string
}

// ============================================================
// Layout Response DTOs
// ============================================================

export interface BffGroupLayoutSummary {
  id: string
  layoutCode: string
  layoutName: string
  layoutNameShort: string | null
  layoutType: LayoutType
  isDefault: boolean
  isActive: boolean
  lineCount: number
  sortOrder: number
}

export interface BffGroupLayoutListResponse {
  items: BffGroupLayoutSummary[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

export interface BffGroupLayoutDetailResponse {
  id: string
  layoutCode: string
  layoutName: string
  layoutNameShort: string | null
  layoutType: LayoutType
  description: string | null
  isDefault: boolean
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

// ============================================================
// Line Request DTOs
// ============================================================

export interface BffCreateGroupLineRequest {
  lineType: LineType
  displayName?: string
  groupSubjectId?: string
  indentLevel?: number
  signDisplayPolicy?: SignDisplayPolicy
  isBold?: boolean
  isUnderline?: boolean
  isDoubleUnderline?: boolean
  bgHighlight?: boolean
  notes?: string
}

export interface BffUpdateGroupLineRequest {
  displayName?: string
  groupSubjectId?: string
  indentLevel?: number
  signDisplayPolicy?: SignDisplayPolicy
  isBold?: boolean
  isUnderline?: boolean
  isDoubleUnderline?: boolean
  bgHighlight?: boolean
  notes?: string
}

export interface BffMoveGroupLineRequest {
  targetLineNo: number
}

// ============================================================
// Line Response DTOs
// ============================================================

export interface BffGroupLineSummary {
  id: string
  layoutId: string
  lineNo: number
  lineType: LineType
  displayName: string | null
  groupSubjectId: string | null
  groupSubjectCode: string | null
  groupSubjectName: string | null
  subjectClass: SubjectClass | null
  indentLevel: number
  signDisplayPolicy: SignDisplayPolicy
  isBold: boolean
  isUnderline: boolean
  isDoubleUnderline: boolean
  bgHighlight: boolean
}

export interface BffGroupLineListResponse {
  layoutId: string
  layoutCode: string
  items: BffGroupLineSummary[]
}

export interface BffGroupLineDetailResponse {
  id: string
  layoutId: string
  lineNo: number
  lineType: LineType
  displayName: string | null
  groupSubjectId: string | null
  groupSubjectCode: string | null
  groupSubjectName: string | null
  subjectClass: SubjectClass | null
  indentLevel: number
  signDisplayPolicy: SignDisplayPolicy
  isBold: boolean
  isUnderline: boolean
  isDoubleUnderline: boolean
  bgHighlight: boolean
  notes: string | null
  createdAt: string
  updatedAt: string
}

// ============================================================
// Group Subject Search DTOs
// ============================================================

export interface BffGroupSubjectSearchRequest {
  layoutType: LayoutType
  keyword?: string
  page?: number
  pageSize?: number
}

export interface BffGroupSubjectSummary {
  id: string
  groupSubjectCode: string
  groupSubjectName: string
  subjectClass: SubjectClass
}

export interface BffGroupSubjectSearchResponse {
  items: BffGroupSubjectSummary[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

// ============================================================
// Error Codes
// ============================================================

export const GroupReportLayoutErrorCode = {
  LAYOUT_NOT_FOUND: 'LAYOUT_NOT_FOUND',
  LAYOUT_CODE_DUPLICATE: 'LAYOUT_CODE_DUPLICATE',
  LAYOUT_ALREADY_INACTIVE: 'LAYOUT_ALREADY_INACTIVE',
  LAYOUT_ALREADY_ACTIVE: 'LAYOUT_ALREADY_ACTIVE',
  DEFAULT_LAYOUT_CANNOT_DEACTIVATE: 'DEFAULT_LAYOUT_CANNOT_DEACTIVATE',
  INACTIVE_LAYOUT_CANNOT_SET_DEFAULT: 'INACTIVE_LAYOUT_CANNOT_SET_DEFAULT',
  LINE_NOT_FOUND: 'LINE_NOT_FOUND',
  GROUP_SUBJECT_REQUIRED_FOR_ACCOUNT: 'GROUP_SUBJECT_REQUIRED_FOR_ACCOUNT',
  GROUP_SUBJECT_NOT_FOUND: 'GROUP_SUBJECT_NOT_FOUND',
  GROUP_SUBJECT_INACTIVE: 'GROUP_SUBJECT_INACTIVE',
  GROUP_SUBJECT_TYPE_MISMATCH: 'GROUP_SUBJECT_TYPE_MISMATCH',
  NOT_PARENT_COMPANY: 'NOT_PARENT_COMPANY',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const

export type GroupReportLayoutErrorCode =
  (typeof GroupReportLayoutErrorCode)[keyof typeof GroupReportLayoutErrorCode]

export interface GroupReportLayoutError {
  code: GroupReportLayoutErrorCode
  message: string
  details?: Record<string, unknown>
}
