import { AggregationMethod, Direction } from '../../shared/enums/kpi';

/**
 * 非財務KPI定義作成リクエストDTO（API）
 */
export interface CreateKpiDefinitionApiDto {
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
}
