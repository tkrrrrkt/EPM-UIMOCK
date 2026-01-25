import { KpiMasterItemDto } from './KpiMasterItemDto';
export interface KpiMasterItemListDto {
    items: KpiMasterItemDto[];
    totalCount: number;
    page: number;
    pageSize: number;
}
