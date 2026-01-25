/**
 * KPI集計方法
 *
 * SUM: 合計
 * EOP: 期末時点値（End of Period）
 * AVG: 平均
 * MAX: 最大値
 * MIN: 最小値
 */
export const AggregationMethod = {
  SUM: 'SUM',
  EOP: 'EOP',
  AVG: 'AVG',
  MAX: 'MAX',
  MIN: 'MIN',
} as const;

export type AggregationMethod = typeof AggregationMethod[keyof typeof AggregationMethod];
