import { KpiMasterEventDto } from './KpiMasterEventDto';
export interface KpiMasterEventListDto {
    events: KpiMasterEventDto[];
    page: number;
    pageSize: number;
    totalCount: number;
}
