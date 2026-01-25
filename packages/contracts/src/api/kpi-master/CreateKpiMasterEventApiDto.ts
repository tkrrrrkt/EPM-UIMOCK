import { KpiMasterEventStatus } from '../../shared/enums/kpi';

/**
 * KPI管理イベント作成リクエストDTO（API）
 */
export interface CreateKpiMasterEventApiDto {
  /** 会社ID */
  companyId: string;
  /** イベントコード */
  eventCode: string;
  /** イベント名 */
  eventName: string;
  /** 会計年度 */
  fiscalYear: number;
}
