import type { KpiCardDto } from './KpiCardDto';

/**
 * KPIカード一覧DTO
 */
export interface KpiCardListDto {
  /** KPIカード一覧 */
  items: KpiCardDto[];
}
