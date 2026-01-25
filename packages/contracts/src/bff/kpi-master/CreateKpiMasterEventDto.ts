import { KpiMasterEventStatus } from '../../shared/enums/kpi';

/**
 * KPI管理イベント作成リクエストDTO
 */
export interface CreateKpiMasterEventDto {
  /** 会社ID */
  companyId: string;
  /** イベントコード（最大50文字、同一会社内で一意） */
  eventCode: string;
  /** イベント名（最大200文字） */
  eventName: string;
  /** 会計年度 */
  fiscalYear: number;
}
