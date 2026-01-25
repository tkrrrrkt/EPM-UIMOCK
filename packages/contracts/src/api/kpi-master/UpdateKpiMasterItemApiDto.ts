/**
 * KPI項目更新リクエストDTO（API）
 */
export interface UpdateKpiMasterItemApiDto {
  /** KPI名 */
  kpiName?: string;
  /** 責任部門ID */
  departmentStableId?: string;
  /** 責任者社員ID */
  ownerEmployeeId?: string;
  /** 表示順序 */
  sortOrder?: number;
}
