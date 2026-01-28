export interface GetKpiMasterSummaryQueryDto {
    eventId: string;
    departmentStableIds?: string[];
}
export interface KpiMasterSummaryDto {
    totalKpiCount: number;
    avgAchievementRate: number;
    delayedActionPlanCount: number;
    attentionRequiredCount: number;
}
export interface KpiMasterEventDto {
    id: string;
    eventCode: string;
    eventName: string;
    fiscalYear: number;
    status: 'DRAFT' | 'CONFIRMED';
    createdAt: string;
    updatedAt: string;
}
export interface GetKpiMasterEventsQueryDto {
    page?: number;
    pageSize?: number;
    sortBy?: 'eventCode' | 'eventName' | 'fiscalYear' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
    keyword?: string;
    fiscalYear?: number;
    status?: 'DRAFT' | 'CONFIRMED';
}
export interface KpiMasterEventListDto {
    items: KpiMasterEventDto[];
    total: number;
    page: number;
    pageSize: number;
}
export interface KpiMasterEventDetailDto extends KpiMasterEventDto {
    kpiItems: KpiMasterItemDto[];
}
export interface CreateKpiMasterEventDto {
    eventCode: string;
    eventName: string;
    fiscalYear: number;
}
export interface KpiMasterItemDto {
    id: string;
    eventId: string;
    kpiCode: string;
    kpiName: string;
    kpiType: 'FINANCIAL' | 'NON_FINANCIAL' | 'METRIC';
    hierarchyLevel: 1 | 2;
    parentKpiItemId?: string;
    departmentStableId?: string;
    departmentName?: string;
    ownerEmployeeId?: string;
    ownerEmployeeName?: string;
    unit?: string;
    achievementRate?: number;
    createdAt: string;
    updatedAt: string;
}
export interface KpiMasterItemTreeDto extends KpiMasterItemDto {
    children: KpiMasterItemTreeDto[];
    actionPlans: ActionPlanSummaryDto[];
}
export interface ActionPlanSummaryDto {
    id: string;
    planName: string;
    departmentStableId?: string;
    departmentName?: string;
    ownerEmployeeId?: string;
    ownerEmployeeName?: string;
    dueDate?: string;
    progressRate: number;
    isDelayed: boolean;
}
export interface GetKpiMasterItemsQueryDto {
    eventId: string;
    departmentStableIds?: string[];
    kpiType?: 'FINANCIAL' | 'NON_FINANCIAL' | 'METRIC';
    hierarchyLevel?: 1 | 2;
}
export interface KpiMasterItemDetailDto extends KpiMasterItemDto {
    factAmounts: KpiFactAmountDto[];
    actionPlans: ActionPlanSummaryDto[];
}
export interface CreateKpiMasterItemDto {
    eventId: string;
    kpiCode: string;
    kpiName: string;
    kpiType: 'FINANCIAL' | 'NON_FINANCIAL' | 'METRIC';
    hierarchyLevel: 1 | 2;
    parentKpiItemId?: string;
    refSubjectId?: string;
    refKpiDefinitionId?: string;
    refMetricId?: string;
    departmentStableId?: string;
    ownerEmployeeId?: string;
    unit?: string;
}
export interface UpdateKpiMasterItemDto {
    kpiName?: string;
    departmentStableId?: string;
    ownerEmployeeId?: string;
    unit?: string;
}
export interface SelectableSubjectDto {
    id: string;
    subjectCode: string;
    subjectName: string;
    subjectType: string;
}
export interface SelectableSubjectListDto {
    subjects: SelectableSubjectDto[];
}
export interface SelectableMetricDto {
    id: string;
    metricCode: string;
    metricName: string;
    formula?: string;
}
export interface SelectableMetricListDto {
    metrics: SelectableMetricDto[];
}
export interface KpiDefinitionDto {
    id: string;
    kpiCode: string;
    kpiName: string;
    description?: string;
    unit?: string;
    aggregationMethod: 'SUM' | 'EOP' | 'AVG' | 'MAX' | 'MIN';
    direction?: 'higher_is_better' | 'lower_is_better';
    createdAt: string;
    updatedAt: string;
}
export interface GetKpiDefinitionsQueryDto {
    page?: number;
    pageSize?: number;
    keyword?: string;
}
export interface KpiDefinitionListDto {
    items: KpiDefinitionDto[];
    total: number;
    page: number;
    pageSize: number;
}
export interface CreateKpiDefinitionDto {
    kpiCode: string;
    kpiName: string;
    description?: string;
    unit?: string;
    aggregationMethod: 'SUM' | 'EOP' | 'AVG' | 'MAX' | 'MIN';
    direction?: 'higher_is_better' | 'lower_is_better';
}
export interface KpiFactAmountDto {
    id: string;
    kpiMasterItemId: string;
    periodCode: string;
    periodStartDate?: string;
    periodEndDate?: string;
    targetValue?: number;
    actualValue?: number;
    achievementRate?: number;
    createdAt: string;
    updatedAt: string;
}
export interface CreateKpiFactAmountDto {
    kpiMasterItemId: string;
    periodCode: string;
    periodStartDate?: string;
    periodEndDate?: string;
    targetValue?: number;
    actualValue?: number;
}
export interface UpdateKpiFactAmountDto {
    targetValue?: number;
    actualValue?: number;
}
export interface KpiTargetValueDto {
    id: string;
    kpiMasterItemId: string;
    periodCode: string;
    periodStartDate?: string;
    periodEndDate?: string;
    targetValue: number;
    createdAt: string;
    updatedAt: string;
}
export interface CreateKpiTargetValueDto {
    kpiMasterItemId: string;
    periodCode: string;
    periodStartDate?: string;
    periodEndDate?: string;
    targetValue: number;
}
export interface UpdateKpiTargetValueDto {
    targetValue: number;
}
