/**
 * 非財務KPI予実作成リクエストDTO（API）
 */
export interface CreateKpiFactAmountApiDto {
  /** 会社ID */
  companyId: string;
  /** KPI管理イベントID */
  kpiEventId: string;
  /** KPI定義ID */
  kpiDefinitionId: string;
  /** 期間コード */
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
