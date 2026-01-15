/**
 * BFF Contracts: dimension-master
 *
 * SSoT: .kiro/specs/master-data/dimension-master/design.md
 *
 * UI は packages/contracts/src/api を参照してはならない
 */

// ============================================================================
// Dimension Request DTOs
// ============================================================================

export interface BffListDimensionsRequest {
  page?: number           // default: 1
  pageSize?: number       // default: 50, max: 200
  sortBy?: 'dimensionCode' | 'dimensionName' | 'sortOrder'
  sortOrder?: 'asc' | 'desc'
  keyword?: string        // コード・名前部分一致
  dimensionType?: string  // タイプフィルタ
  isActive?: boolean      // 有効フラグフィルタ
}

export interface BffCreateDimensionRequest {
  dimensionCode: string
  dimensionName: string
  dimensionType: string
  isHierarchical?: boolean  // default: false
  isRequired?: boolean      // default: false
  scopePolicy?: 'tenant' | 'company'  // default: 'tenant'
  sortOrder?: number        // default: 0
}

export interface BffUpdateDimensionRequest {
  dimensionCode?: string
  dimensionName?: string
  dimensionType?: string
  isHierarchical?: boolean
  isRequired?: boolean
  scopePolicy?: 'tenant' | 'company'
  sortOrder?: number
}

// ============================================================================
// Dimension Response DTOs
// ============================================================================

export interface BffDimensionSummary {
  id: string
  dimensionCode: string
  dimensionName: string
  dimensionType: string
  isHierarchical: boolean
  scopePolicy: 'tenant' | 'company'
  sortOrder: number
  isActive: boolean
}

export interface BffListDimensionsResponse {
  items: BffDimensionSummary[]
  totalCount: number
  page: number
  pageSize: number
}

export interface BffDimensionDetailResponse {
  id: string
  dimensionCode: string
  dimensionName: string
  dimensionType: string
  isHierarchical: boolean
  isRequired: boolean
  scopePolicy: 'tenant' | 'company'
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ============================================================================
// Dimension Value Request DTOs
// ============================================================================

export interface BffListDimensionValuesRequest {
  page?: number           // default: 1
  pageSize?: number       // default: 50, max: 200
  sortBy?: 'valueCode' | 'valueName' | 'sortOrder' | 'hierarchyLevel'
  sortOrder?: 'asc' | 'desc'
  keyword?: string        // コード・名前部分一致
  scopeType?: 'tenant' | 'company'
  scopeCompanyId?: string
  isActive?: boolean      // 有効フラグフィルタ
}

export interface BffCreateDimensionValueRequest {
  valueCode: string
  valueName: string
  valueNameShort?: string
  scopeType: 'tenant' | 'company'
  scopeCompanyId?: string  // scopeType='company' 時必須
  parentId?: string        // 親値ID（階層構造用）
  sortOrder?: number       // default: 0
}

export interface BffUpdateDimensionValueRequest {
  valueCode?: string
  valueName?: string
  valueNameShort?: string
  scopeType?: 'tenant' | 'company'
  scopeCompanyId?: string
  parentId?: string | null  // null で親なしに変更可
  sortOrder?: number
}

// ============================================================================
// Dimension Value Response DTOs
// ============================================================================

export interface BffDimensionValueSummary {
  id: string
  valueCode: string
  valueName: string
  valueNameShort: string | null
  scopeType: 'tenant' | 'company'
  parentId: string | null
  hierarchyLevel: number
  sortOrder: number
  isActive: boolean
}

export interface BffListDimensionValuesResponse {
  items: BffDimensionValueSummary[]
  totalCount: number
  page: number
  pageSize: number
}

export interface BffDimensionValueDetailResponse {
  id: string
  dimensionId: string
  valueCode: string
  valueName: string
  valueNameShort: string | null
  scopeType: 'tenant' | 'company'
  scopeCompanyId: string | null
  parentId: string | null
  hierarchyLevel: number
  hierarchyPath: string | null
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ============================================================================
// Error Codes (UI-facing)
// ============================================================================

export const DimensionMasterErrorCode = {
  // Dimension errors
  DIMENSION_NOT_FOUND: 'DIMENSION_NOT_FOUND',
  DIMENSION_CODE_DUPLICATE: 'DIMENSION_CODE_DUPLICATE',
  DIMENSION_ALREADY_INACTIVE: 'DIMENSION_ALREADY_INACTIVE',
  DIMENSION_ALREADY_ACTIVE: 'DIMENSION_ALREADY_ACTIVE',
  // Dimension Value errors
  DIMENSION_VALUE_NOT_FOUND: 'DIMENSION_VALUE_NOT_FOUND',
  VALUE_CODE_DUPLICATE: 'VALUE_CODE_DUPLICATE',
  DIMENSION_VALUE_ALREADY_INACTIVE: 'DIMENSION_VALUE_ALREADY_INACTIVE',
  DIMENSION_VALUE_ALREADY_ACTIVE: 'DIMENSION_VALUE_ALREADY_ACTIVE',
  CIRCULAR_REFERENCE_DETECTED: 'CIRCULAR_REFERENCE_DETECTED',
  // Common
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const

export type DimensionMasterErrorCode =
  typeof DimensionMasterErrorCode[keyof typeof DimensionMasterErrorCode]

export interface DimensionMasterError {
  code: DimensionMasterErrorCode
  message: string
  details?: Record<string, unknown>
}
