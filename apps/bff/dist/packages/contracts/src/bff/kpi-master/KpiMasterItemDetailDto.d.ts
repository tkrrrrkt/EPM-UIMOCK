import { KpiMasterItemDto } from './KpiMasterItemDto';
export interface PeriodFactDto {
    periodCode: string;
    periodStartDate?: string;
    periodEndDate?: string;
    targetValue?: number;
    actualValue?: number;
    achievementRate?: number;
    notes?: string;
}
export interface ActionPlanSummaryDto {
    id: string;
    planName: string;
    departmentStableId?: string;
    departmentName?: string;
    ownerEmployeeId?: string;
    ownerName?: string;
    deadline?: string;
    progressRate?: number;
}
export interface KpiMasterItemDetailDto extends KpiMasterItemDto {
    periodFacts: Record<string, PeriodFactDto>;
    actionPlans: ActionPlanSummaryDto[];
}
