import { KpiType, HierarchyLevel } from '../../shared/enums/kpi';
export interface KpiMasterItemDto {
    id: string;
    kpiEventId: string;
    parentKpiItemId?: string;
    kpiCode: string;
    kpiName: string;
    kpiType: KpiType;
    hierarchyLevel: HierarchyLevel;
    refSubjectId?: string;
    refKpiDefinitionId?: string;
    refMetricId?: string;
    departmentStableId?: string;
    departmentName?: string;
    ownerEmployeeId?: string;
    ownerName?: string;
    sortOrder: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
