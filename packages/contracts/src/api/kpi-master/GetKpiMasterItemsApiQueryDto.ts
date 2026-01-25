import { HierarchyLevel, KpiType } from '../../shared/enums/kpi';

/**
 * KPI項目一覧取得クエリDTO（API）
 */
export interface GetKpiMasterItemsApiQueryDto {
  /** KPI管理イベントID */
  eventId: string;
  /** 親KPI項目ID（階層フィルタ） */
  parentKpiItemId?: string | null;
  /** KPI種別フィルタ */
  kpiType?: KpiType;
  /** 部門フィルタ */
  departmentStableIds?: string[];
  /** 階層レベルフィルタ */
  hierarchyLevel?: HierarchyLevel;
  /** キーワード検索 */
  keyword?: string;
  /** ソート項目 */
  sortBy?: string;
  /** ソート順序 */
  sortOrder?: 'asc' | 'desc';
  /** オフセット（ページング） */
  offset?: number;
  /** リミット（ページング） */
  limit?: number;
}
