import { HierarchyLevel, KpiType } from '../../shared/enums/kpi';

/**
 * KPI項目一覧取得クエリDTO
 */
export interface GetKpiMasterItemsQueryDto {
  /** KPI管理イベントID（必須） */
  eventId: string;
  /** 親KPI項目ID（階層フィルタ） */
  parentKpiItemId?: string | null;
  /** KPI種別フィルタ */
  kpiType?: KpiType;
  /** 部門フィルタ（複数選択可） */
  departmentStableIds?: string[];
  /** 階層レベルフィルタ */
  hierarchyLevel?: HierarchyLevel;
  /** キーワード検索 */
  keyword?: string;
  /** ソート項目 */
  sortBy?: string;
  /** ソート順序 */
  sortOrder?: 'asc' | 'desc';
  /** ページ番号（1始まり） */
  page?: number;
  /** ページサイズ */
  pageSize?: number;
}
