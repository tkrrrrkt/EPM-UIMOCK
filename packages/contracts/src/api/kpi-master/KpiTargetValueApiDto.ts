/**
 * 指標目標値DTO（API）
 */
export interface KpiTargetValueApiDto {
  /** 目標値ID */
  id: string;
  /** KPI項目ID */
  kpiMasterItemId: string;
  /** 期間コード */
  periodCode: string;
  /** 目標値 */
  targetValue: number;
  /** 作成日時 */
  createdAt: string;
  /** 更新日時 */
  updatedAt: string;
}
