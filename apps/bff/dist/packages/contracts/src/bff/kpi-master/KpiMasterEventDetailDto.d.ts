import { KpiMasterEventDto } from './KpiMasterEventDto';
import { KpiMasterItemDto } from './KpiMasterItemDto';
export interface KpiMasterEventDetailDto extends KpiMasterEventDto {
    items: KpiMasterItemDto[];
}
