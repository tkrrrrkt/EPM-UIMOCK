import { KpiMasterItemDto } from './KpiMasterItemDto';
export interface KpiMasterItemTreeDto extends KpiMasterItemDto {
    children: KpiMasterItemTreeDto[];
}
