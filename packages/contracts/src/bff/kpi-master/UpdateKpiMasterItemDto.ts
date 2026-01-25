/**
 * KPI項目更新リクエストDTO
 *
 * 注意: kpiType、refSubjectId、refKpiDefinitionId、refMetricId は変更不可（Immutable）
 */
export interface UpdateKpiMasterItemDto {
  /** KPI名（最大200文字） */
  kpiName?: string;
  /** 責任部門ID */
  departmentStableId?: string;
  /** 責任者社員ID */
  ownerEmployeeId?: string;
  /** 表示順序 */
  sortOrder?: number;
}
