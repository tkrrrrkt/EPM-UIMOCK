import { KpiMasterEventStatus } from '../../shared/enums/kpi';
export interface GetKpiMasterEventsQueryDto {
    page?: number;
    pageSize?: number;
    keyword?: string;
    fiscalYear?: number;
    status?: KpiMasterEventStatus;
    sortBy?: 'eventCode' | 'eventName' | 'fiscalYear' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
}
