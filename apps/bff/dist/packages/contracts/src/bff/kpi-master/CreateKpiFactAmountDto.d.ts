export interface CreateKpiFactAmountDto {
    companyId: string;
    kpiEventId: string;
    kpiDefinitionId: string;
    periodCode: string;
    periodStartDate?: string;
    periodEndDate?: string;
    targetValue?: number;
    actualValue?: number;
    departmentStableId?: string;
    notes?: string;
}
