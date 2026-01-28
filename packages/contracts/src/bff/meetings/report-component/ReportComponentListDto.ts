import type { ReportComponentDto } from './ReportComponentDto';

/**
 * レポートコンポーネント一覧DTO
 */
export interface ReportComponentListDto {
  /** コンポーネント一覧 */
  items: ReportComponentDto[];
  /** 総件数 */
  total: number;
}
