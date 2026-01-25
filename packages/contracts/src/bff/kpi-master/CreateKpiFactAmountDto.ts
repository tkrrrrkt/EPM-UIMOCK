/**
 * 非財務KPI予実作成リクエストDTO（期間追加）
 */
export interface CreateKpiFactAmountDto {
  /** 会社ID */
  companyId: string;
  /** KPI管理イベントID */
  kpiEventId: string;
  /** KPI定義ID */
  kpiDefinitionId: string;
  /** 期間コード（最大32文字、例: "2026-Q1"、"2026-04"） */
  periodCode: string;
  /** 期間開始日 */
  periodStartDate?: string;
  /** 期間終了日 */
  periodEndDate?: string;
  /** 目標値 */
  targetValue?: number;
  /** 実績値 */
  actualValue?: number;
  /** 部門ID */
  departmentStableId?: string;
  /** 備考 */
  notes?: string;
}
