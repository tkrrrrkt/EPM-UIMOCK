import { KpiMasterEventStatus } from '../../shared/enums/kpi';

/**
 * KPI管理イベント一覧取得クエリDTO（API）
 *
 * offset/limit形式（BFFでpage/pageSizeから変換）
 */
export interface GetKpiMasterEventsApiQueryDto {
  /** オフセット（0始まり） */
  offset: number;
  /** 取得件数 */
  limit: number;
  /** キーワード検索 */
  keyword?: string;
  /** 会計年度フィルタ */
  fiscalYear?: number;
  /** ステータスフィルタ */
  status?: KpiMasterEventStatus;
  /** ソート項目（DB列名: event_code, event_name, fiscal_year, created_at） */
  sortBy?: string;
  /** ソート順 */
  sortOrder?: 'asc' | 'desc';
}
