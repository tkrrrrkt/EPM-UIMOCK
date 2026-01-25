import { AggregationMethod, Direction } from '../../shared/enums/kpi';

/**
 * 非財務KPI定義作成リクエストDTO
 */
export interface CreateKpiDefinitionDto {
  /** 会社ID */
  companyId: string;
  /** KPIコード（最大50文字、同一会社内で一意） */
  kpiCode: string;
  /** KPI名（最大200文字） */
  kpiName: string;
  /** 説明 */
  description?: string;
  /** 単位（例: "件"、"人"、"%"） */
  unit?: string;
  /** 集計方法（SUM | EOP | AVG | MAX | MIN） */
  aggregationMethod: AggregationMethod;
  /** 方向性（higher_is_better | lower_is_better） */
  direction?: Direction;
}
