import { KpiMasterItemDto } from './KpiMasterItemDto';

/**
 * 期間別予実データ
 */
export interface PeriodFactDto {
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
  /** 備考 */
  notes?: string;
}

/**
 * アクションプラン簡易情報
 */
export interface ActionPlanSummaryDto {
  /** アクションプランID */
  id: string;
  /** プラン名 */
  planName: string;
  /** 担当部門ID */
  departmentStableId?: string;
  /** 担当部門名 */
  departmentName?: string;
  /** 担当者社員ID */
  ownerEmployeeId?: string;
  /** 担当者名 */
  ownerName?: string;
  /** 期限 */
  deadline?: string;
  /** 進捗率（%） */
  progressRate?: number;
}

/**
 * KPI項目詳細DTO（パネル用）
 */
export interface KpiMasterItemDetailDto extends KpiMasterItemDto {
  /** 期間別予実データ（期間コードをキーとしたMap） */
  periodFacts: Record<string, PeriodFactDto>;
  /** 紐づくアクションプラン一覧 */
  actionPlans: ActionPlanSummaryDto[];
}
