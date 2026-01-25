import { AggregationMethod, Direction } from '../../shared/enums/kpi';

/**
 * 非財務KPI定義DTO（API）
 */
export interface KpiDefinitionApiDto {
  /** KPI定義ID */
  id: string;
  /** 会社ID */
  companyId: string;
  /** KPIコード */
  kpiCode: string;
  /** KPI名 */
  kpiName: string;
  /** 説明 */
  description?: string;
  /** 単位 */
  unit?: string;
  /** 集計方法 */
  aggregationMethod: AggregationMethod;
  /** 方向性 */
  direction?: Direction;
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
