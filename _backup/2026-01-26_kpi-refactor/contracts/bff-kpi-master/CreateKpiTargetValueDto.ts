/**
 * 指標目標値作成リクエストDTO（期間追加）
 */
export interface CreateKpiTargetValueDto {
  /** KPI項目ID */
  kpiMasterItemId: string;
  /** 期間コード（最大32文字、例: "2026-Q1"、"2026-04"） */
  periodCode: string;
  /** 目標値 */
  targetValue: number;
}
