import type { ReportLayoutDto } from './ReportLayoutDto';

/**
 * レポートレイアウト一覧DTO
 */
export interface ReportLayoutListDto {
  /** レイアウト一覧 */
  items: ReportLayoutDto[];
  /** 総件数 */
  total: number;
}
