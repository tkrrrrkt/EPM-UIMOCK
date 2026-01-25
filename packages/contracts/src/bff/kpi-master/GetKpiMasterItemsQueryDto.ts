import { HierarchyLevel } from '../../shared/enums/kpi';

/**
 * KPI項目一覧取得クエリDTO
 */
export interface GetKpiMasterItemsQueryDto {
  /** KPI管理イベントID（必須） */
  eventId: string;
  /** 部門フィルタ（複数選択可） */
  departmentStableIds?: string[];
  /** 階層レベルフィルタ */
  hierarchyLevel?: HierarchyLevel;
}
