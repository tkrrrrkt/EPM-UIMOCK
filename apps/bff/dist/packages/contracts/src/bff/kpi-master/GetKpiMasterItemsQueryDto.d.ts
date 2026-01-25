import { HierarchyLevel, KpiType } from '../../shared/enums/kpi';
export interface GetKpiMasterItemsQueryDto {
    eventId: string;
    parentKpiItemId?: string | null;
    kpiType?: KpiType;
    departmentStableIds?: string[];
    hierarchyLevel?: HierarchyLevel;
    keyword?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    pageSize?: number;
}
