/**
 * 非財務KPI予実DTO
 */
export interface KpiFactAmountDto {
  /** 予実ID */
  id: string;
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
  /** 達成率（%、実績/目標×100、BFF計算） */
  achievementRate?: number;
  /** 部門ID */
  departmentStableId?: string;
  /** 備考 */
  notes?: string;
  /** 作成日時 */
  createdAt: string;
  /** 更新日時 */
  updatedAt: string;
  /** 作成者ID */
  createdBy?: string;
  /** 更新者ID */
  updatedBy?: string;
}
