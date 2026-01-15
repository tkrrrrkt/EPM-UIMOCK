// Report Layout BFF Contracts
// packages/contracts/src/bff/report-layout/index.ts

// ============================================================
// Common Types
// ============================================================

export type LayoutType = 'PL' | 'BS' | 'KPI'
export type LineType = 'header' | 'account' | 'note' | 'blank'
export type SubjectClass = 'BASE' | 'AGGREGATE'
export type SignDisplayPolicy = 'auto' | 'positive' | 'negative' | 'absolute'

// ============================================================
// Layout Request DTOs
// ============================================================

export interface BffLayoutListRequest {
  keyword?: string
  layoutType?: LayoutType
  isActive?: boolean
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface BffCreateLayoutRequest {
  layoutCode: string
  layoutName: string
  layoutType: LayoutType
  companyId?: string
}

export interface BffUpdateLayoutRequest {
  layoutCode?: string
  layoutName?: string
  layoutType?: LayoutType
}

export interface BffCopyLayoutRequest {
  layoutCode: string
  layoutName: string
}

// ============================================================
// Layout Response DTOs
// ============================================================

export interface BffLayoutSummary {
  id: string
  layoutCode: string
  layoutName: string
  layoutType: LayoutType
  companyId: string | null
  companyName: string | null
  isActive: boolean
  lineCount: number
}

export interface BffLayoutListResponse {
  items: BffLayoutSummary[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

export interface BffLayoutDetailResponse {
  id: string
  layoutCode: string
  layoutName: string
  layoutType: LayoutType
  companyId: string | null
  companyName: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ============================================================
// Line Request DTOs
// ============================================================

export interface BffCreateLineRequest {
  lineType: LineType
  displayName?: string
  subjectId?: string
  indentLevel?: number
  signDisplayPolicy?: SignDisplayPolicy
  isBold?: boolean
  // 確度管理・W/N/B設定（科目行のみ有効）
  confidenceEnabled?: boolean
  wnbEnabled?: boolean
}

export interface BffUpdateLineRequest {
  displayName?: string
  subjectId?: string
  indentLevel?: number
  signDisplayPolicy?: SignDisplayPolicy | null
  isBold?: boolean
  // 確度管理・W/N/B設定（科目行のみ有効）
  confidenceEnabled?: boolean
  wnbEnabled?: boolean
}

export interface BffMoveLineRequest {
  targetLineNo: number
}

// ============================================================
// Line Response DTOs
// ============================================================

export interface BffLineSummary {
  id: string
  layoutId: string
  lineNo: number
  lineType: LineType
  displayName: string | null
  subjectId: string | null
  subjectCode: string | null
  subjectName: string | null
  indentLevel: number
  signDisplayPolicy: SignDisplayPolicy | null
  isBold: boolean
  // 確度管理・W/N/B設定
  confidenceEnabled: boolean
  wnbEnabled: boolean
}

export interface BffLineListResponse {
  items: BffLineSummary[]
}

export interface BffLineDetailResponse {
  id: string
  layoutId: string
  lineNo: number
  lineType: LineType
  displayName: string | null
  subjectId: string | null
  subjectCode: string | null
  subjectName: string | null
  indentLevel: number
  signDisplayPolicy: SignDisplayPolicy | null
  isBold: boolean
  // 確度管理・W/N/B設定
  confidenceEnabled: boolean
  wnbEnabled: boolean
  createdAt: string
  updatedAt: string
}

// ============================================================
// Subject Search DTOs
// ============================================================

export interface BffSubjectSearchRequest {
  layoutType: LayoutType
  companyId: string
  keyword?: string
  page?: number
  pageSize?: number
}

export interface BffSubjectSummary {
  id: string
  subjectCode: string
  subjectName: string
  subjectClass: SubjectClass
}

export interface BffSubjectSearchResponse {
  items: BffSubjectSummary[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

// ============================================================
// Error Codes
// ============================================================

export const ReportLayoutErrorCode = {
  LAYOUT_NOT_FOUND: 'LAYOUT_NOT_FOUND',
  LAYOUT_CODE_DUPLICATE: 'LAYOUT_CODE_DUPLICATE',
  LAYOUT_ALREADY_INACTIVE: 'LAYOUT_ALREADY_INACTIVE',
  LAYOUT_ALREADY_ACTIVE: 'LAYOUT_ALREADY_ACTIVE',
  LINE_NOT_FOUND: 'LINE_NOT_FOUND',
  SUBJECT_REQUIRED_FOR_ACCOUNT: 'SUBJECT_REQUIRED_FOR_ACCOUNT',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const

export type ReportLayoutErrorCode =
  (typeof ReportLayoutErrorCode)[keyof typeof ReportLayoutErrorCode]

export interface ReportLayoutError {
  code: ReportLayoutErrorCode
  message: string
  details?: Record<string, unknown>
}
