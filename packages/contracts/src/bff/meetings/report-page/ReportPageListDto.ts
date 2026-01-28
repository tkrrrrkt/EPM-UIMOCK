import type { ReportPageDto } from './ReportPageDto';

/**
 * レポートページ一覧DTO
 */
export interface ReportPageListDto {
  /** ページ一覧 */
  items: ReportPageDto[];
  /** 総件数 */
  total: number;
}
