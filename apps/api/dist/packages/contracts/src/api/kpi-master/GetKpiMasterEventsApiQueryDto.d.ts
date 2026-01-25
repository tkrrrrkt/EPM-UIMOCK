import { KpiMasterEventStatus } from '../../shared/enums/kpi';
export interface GetKpiMasterEventsApiQueryDto {
    offset: number;
    limit: number;
    keyword?: string;
    fiscalYear?: number;
    status?: KpiMasterEventStatus;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
