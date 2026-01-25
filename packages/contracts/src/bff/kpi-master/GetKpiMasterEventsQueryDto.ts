import { KpiMasterEventStatus } from '../../shared/enums/kpi';

/**
 * KPI管理イベント一覧取得クエリDTO
 */
export interface GetKpiMasterEventsQueryDto {
  /** ページ番号（1始まり、デフォルト: 1） */
  page?: number;
  /** ページサイズ（デフォルト: 50、最大: 200） */
  pageSize?: number;
  /** キーワード検索（event_code または event_name） */
  keyword?: string;
  /** 会計年度フィルタ */
  fiscalYear?: number;
  /** ステータスフィルタ（DRAFT | CONFIRMED） */
  status?: KpiMasterEventStatus;
  /** ソート項目（デフォルト: "eventCode"） */
  sortBy?: 'eventCode' | 'eventName' | 'fiscalYear' | 'createdAt';
  /** ソート順（デフォルト: "asc"） */
  sortOrder?: 'asc' | 'desc';
}
