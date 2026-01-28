import { KpiMasterEventDto } from './KpiMasterEventDto';

/**
 * KPI管理イベント一覧レスポンスDTO
 */
export interface KpiMasterEventListDto {
  /** イベント一覧 */
  events: KpiMasterEventDto[];
  /** ページ番号（1始まり） */
  page: number;
  /** ページサイズ */
  pageSize: number;
  /** 総件数 */
  totalCount: number;
}
