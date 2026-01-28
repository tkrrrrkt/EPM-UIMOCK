import { KpiMasterItemDto } from './KpiMasterItemDto';

/**
 * KPI項目一覧レスポンスDTO
 */
export interface KpiMasterItemListDto {
  /** KPI項目一覧 */
  items: KpiMasterItemDto[];
  /** 総件数 */
  totalCount: number;
  /** ページ番号（1始まり） */
  page: number;
  /** ページサイズ */
  pageSize: number;
}
