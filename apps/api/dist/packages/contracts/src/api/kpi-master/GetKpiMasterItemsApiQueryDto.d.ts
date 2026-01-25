import { HierarchyLevel, KpiType } from '../../shared/enums/kpi';
export interface GetKpiMasterItemsApiQueryDto {
    eventId: string;
    parentKpiItemId?: string | null;
    kpiType?: KpiType;
    departmentStableIds?: string[];
    hierarchyLevel?: HierarchyLevel;
    keyword?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    offset?: number;
    limit?: number;
}
