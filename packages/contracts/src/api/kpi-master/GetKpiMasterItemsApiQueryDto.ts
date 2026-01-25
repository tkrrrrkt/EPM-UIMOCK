import { HierarchyLevel } from '../../shared/enums/kpi';

/**
 * KPI項目一覧取得クエリDTO（API）
 */
export interface GetKpiMasterItemsApiQueryDto {
  /** KPI管理イベントID */
  eventId: string;
  /** 部門フィルタ */
  departmentStableIds?: string[];
  /** 階層レベルフィルタ */
  hierarchyLevel?: HierarchyLevel;
}
