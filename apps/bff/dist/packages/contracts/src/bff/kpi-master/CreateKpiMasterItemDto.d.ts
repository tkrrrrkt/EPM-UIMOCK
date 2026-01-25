import { KpiType, HierarchyLevel } from '../../shared/enums/kpi';
export interface CreateKpiMasterItemDto {
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
    ownerEmployeeId?: string;
    sortOrder?: number;
}
