import { KpiMasterEventStatus } from '../../shared/enums/kpi';

/**
 * KPI管理イベントDTO（API）
 */
export interface KpiMasterEventApiDto {
  /** イベントID */
  id: string;
  /** 会社ID */
  companyId: string;
  /** イベントコード */
  eventCode: string;
  /** イベント名 */
  eventName: string;
  /** 会計年度 */
  fiscalYear: number;
  /** ステータス */
  status: KpiMasterEventStatus;
  /** 有効フラグ */
  isActive: boolean;
  /** 作成日時 */
  createdAt: string;
  /** 更新日時 */
  updatedAt: string;
  /** 作成者ID */
  createdBy?: string;
  /** 更新者ID */
  updatedBy?: string;
}
