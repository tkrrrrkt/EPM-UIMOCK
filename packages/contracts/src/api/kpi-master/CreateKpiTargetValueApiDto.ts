/**
 * 指標目標値作成リクエストDTO（API）
 */
export interface CreateKpiTargetValueApiDto {
  /** KPI項目ID */
  kpiMasterItemId: string;
  /** 期間コード */
  periodCode: string;
  /** 目標値 */
  targetValue: number;
}
