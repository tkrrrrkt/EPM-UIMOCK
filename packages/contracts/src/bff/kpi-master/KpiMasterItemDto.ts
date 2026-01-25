import { KpiType, HierarchyLevel } from '../../shared/enums/kpi';

/**
 * KPI項目DTO
 */
export interface KpiMasterItemDto {
  /** KPI項目ID */
  id: string;
  /** KPI管理イベントID */
  kpiEventId: string;
  /** 親KPI項目ID */
  parentKpiItemId?: string;
  /** KPIコード */
  kpiCode: string;
  /** KPI名 */
  kpiName: string;
  /** KPI種別（FINANCIAL | NON_FINANCIAL | METRIC） */
  kpiType: KpiType;
  /** 階層レベル（1: KGI、2: KPI） */
  hierarchyLevel: HierarchyLevel;
  /** 参照先財務科目ID */
  refSubjectId?: string;
  /** 参照先KPI定義ID */
  refKpiDefinitionId?: string;
  /** 参照先指標ID */
  refMetricId?: string;
  /** 責任部門ID */
  departmentStableId?: string;
  /** 責任部門名（BFFでマスタ結合） */
  departmentName?: string;
  /** 責任者社員ID */
  ownerEmployeeId?: string;
  /** 責任者名（BFFでマスタ結合） */
  ownerName?: string;
  /** 表示順序 */
  sortOrder: number;
  /** 有効フラグ */
  isActive: boolean;
  /** 作成日時 */
  createdAt: string;
  /** 更新日時 */
  updatedAt: string;
}
