/**
 * 非財務KPI予実更新リクエストDTO（インライン編集）
 */
export interface UpdateKpiFactAmountDto {
  /** 目標値 */
  targetValue?: number;
  /** 実績値 */
  actualValue?: number;
  /** 備考 */
  notes?: string;
}
