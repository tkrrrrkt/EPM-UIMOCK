import { KpiMasterEventDto } from './KpiMasterEventDto';
import { KpiMasterItemDetailDto } from './KpiMasterItemDetailDto';

/**
 * KPI管理イベント詳細DTO
 */
export interface KpiMasterEventDetailDto extends KpiMasterEventDto {
  /** KPI項目一覧 */
  items: KpiMasterItemDetailDto[];
}
