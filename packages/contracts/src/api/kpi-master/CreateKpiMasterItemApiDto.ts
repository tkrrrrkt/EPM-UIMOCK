import { KpiType, HierarchyLevel } from '../../shared/enums/kpi';

/**
 * KPI項目作成リクエストDTO（API）
 */
export interface CreateKpiMasterItemApiDto {
  /** KPI管理イベントID */
  kpiEventId: string;
  /** 親KPI項目ID */
  parentKpiItemId?: string;
  /** KPIコード */
  kpiCode: string;
  /** KPI名 */
  kpiName: string;
  /** KPI種別 */
  kpiType: KpiType;
  /** 階層レベル */
  hierarchyLevel: HierarchyLevel;
  /** 参照先財務科目ID */
  refSubjectId?: string;
  /** 参照先KPI定義ID */
  refKpiDefinitionId?: string;
  /** 参照先指標ID */
  refMetricId?: string;
  /** 責任部門ID */
  departmentStableId?: string;
  /** 責任者社員ID */
  ownerEmployeeId?: string;
  /** 表示順序 */
  sortOrder?: number;
}
