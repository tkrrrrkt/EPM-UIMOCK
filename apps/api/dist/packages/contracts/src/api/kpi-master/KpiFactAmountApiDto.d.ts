export interface KpiFactAmountApiDto {
    id: string;
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
    createdAt: string;
    updatedAt: string;
    createdBy?: string;
    updatedBy?: string;
}
