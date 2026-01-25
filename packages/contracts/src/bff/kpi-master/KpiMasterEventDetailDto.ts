import { KpiMasterEventDto } from './KpiMasterEventDto';
import { KpiMasterItemDto } from './KpiMasterItemDto';

/**
 * KPI管理イベント詳細DTO
 */
export interface KpiMasterEventDetailDto extends KpiMasterEventDto {
  /** KPI項目一覧 */
  items: KpiMasterItemDto[];
}
