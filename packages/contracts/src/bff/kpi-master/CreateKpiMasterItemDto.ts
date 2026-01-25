import { KpiType, HierarchyLevel } from '../../shared/enums/kpi';

/**
 * KPI項目作成リクエストDTO
 */
export interface CreateKpiMasterItemDto {
  /** KPI管理イベントID */
  kpiEventId: string;
  /** 親KPI項目ID（Level 2の場合に指定） */
  parentKpiItemId?: string;
  /** KPIコード（最大50文字、同一イベント内で一意） */
  kpiCode: string;
  /** KPI名（最大200文字） */
  kpiName: string;
  /** KPI種別（FINANCIAL | NON_FINANCIAL | METRIC） */
  kpiType: KpiType;
  /** 階層レベル（1: KGI、2: KPI） */
  hierarchyLevel: HierarchyLevel;
  /** 参照先財務科目ID（kpiType=FINANCIALの場合のみ） */
  refSubjectId?: string;
  /** 参照先KPI定義ID（kpiType=NON_FINANCIALの場合のみ） */
  refKpiDefinitionId?: string;
  /** 参照先指標ID（kpiType=METRICの場合のみ） */
  refMetricId?: string;
  /** 責任部門ID */
  departmentStableId?: string;
  /** 責任者社員ID */
  ownerEmployeeId?: string;
  /** 表示順序 */
  sortOrder?: number;
}
