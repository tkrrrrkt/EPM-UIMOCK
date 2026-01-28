// BFF Request Types
export interface BffGetKpiListRequest {
  eventId: string
  departmentStableIds?: string[]
}

export interface BffCreateKpiItemRequest {
  eventId: string
  kpiCode: string
  kpiName: string
  kpiType: 'FINANCIAL' | 'NON_FINANCIAL' | 'METRIC'
  hierarchyLevel: 1 | 2
  parentKpiItemId?: string
  refSubjectId?: string
  refKpiDefinitionId?: string
  refMetricId?: string
  departmentStableId?: string
  ownerEmployeeId?: string
}

export interface BffCreateActionPlanRequest {
  kpiMasterItemId: string
  planName: string
  departmentStableId?: string
  ownerEmployeeId?: string
  dueDate?: string
}

export interface BffUpsertKpiFactAmountRequest {
  kpiMasterItemId: string
  periodCode: string
  targetValue?: number
  actualValue?: number
}

export interface BffCreateKpiEventRequest {
  eventCode: string
  eventName: string
  fiscalYear: number
}

// BFF Response Types
export interface BffKpiListResponse {
  summary: {
    totalKpis: number
    overallAchievementRate: number
    delayedActionPlans: number
    attentionRequired: number
  }
  kpiTree: BffKpiTreeNode[]
}

export interface BffKpiTreeNode {
  id: string
  kpiCode: string
  kpiName: string
  kpiType: 'FINANCIAL' | 'NON_FINANCIAL' | 'METRIC'
  hierarchyLevel: 1 | 2
  departmentStableId?: string
  departmentName?: string
  ownerEmployeeName?: string
  achievementRate?: number
  unit?: string
  children: BffKpiTreeNode[]
  actionPlans: BffActionPlanSummary[]
}

export interface BffActionPlanSummary {
  id: string
  planName: string
  departmentName?: string
  ownerEmployeeName?: string
  dueDate?: string
  progressRate: number
  isDelayed: boolean
}

export interface BffKpiDetail {
  id: string
  kpiCode: string
  kpiName: string
  kpiType: 'FINANCIAL' | 'NON_FINANCIAL' | 'METRIC'
  departmentName?: string
  ownerEmployeeName?: string
  unit?: string
  factAmounts: BffFactAmount[]
  actionPlans: BffActionPlanSummary[]
}

export interface BffFactAmount {
  id: string
  periodCode: string
  targetValue?: number
  actualValue?: number
  achievementRate?: number
}

export interface BffKpiEvent {
  id: string
  eventCode: string
  eventName: string
  fiscalYear: number
  status: 'DRAFT' | 'CONFIRMED'
}

export interface BffKpiItem {
  id: string
  kpiCode: string
  kpiName: string
  kpiType: 'FINANCIAL' | 'NON_FINANCIAL' | 'METRIC'
  hierarchyLevel: 1 | 2
  parentKpiItemId?: string
  departmentStableId?: string
  departmentName?: string
  ownerEmployeeId?: string
  ownerEmployeeName?: string
}

export interface BffSelectOption {
  id: string
  code: string
  name: string
}

export interface BffDepartment {
  stableId: string
  name: string
}

export interface BffEmployee {
  id: string
  name: string
}

// Utility type for achievement badge variant
export type AchievementBadgeVariant = 'success' | 'warning' | 'destructive' | 'secondary'

export const getAchievementBadgeVariant = (rate: number | undefined): AchievementBadgeVariant => {
  if (rate === undefined) return 'secondary'
  if (rate >= 100) return 'success'
  if (rate >= 80) return 'warning'
  return 'destructive'
}

export const getKpiTypeLabel = (type: 'FINANCIAL' | 'NON_FINANCIAL' | 'METRIC'): string => {
  switch (type) {
    case 'FINANCIAL':
      return '財務科目'
    case 'NON_FINANCIAL':
      return '非財務KPI'
    case 'METRIC':
      return '指標'
  }
}

export const getHierarchyLevelLabel = (level: 1 | 2): string => {
  return level === 1 ? 'KGI' : 'KPI'
}
