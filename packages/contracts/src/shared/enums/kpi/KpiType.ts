/**
 * KPI種別
 *
 * FINANCIAL: 財務科目KPI（subjectsテーブルから参照、kpi_managed=true）
 * NON_FINANCIAL: 非財務KPI（kpi_definitionsテーブルで定義）
 * METRIC: 指標KPI（metricsテーブルから参照、kpi_managed=true）
 */
export const KpiType = {
  FINANCIAL: 'FINANCIAL',
  NON_FINANCIAL: 'NON_FINANCIAL',
  METRIC: 'METRIC',
} as const;

export type KpiType = typeof KpiType[keyof typeof KpiType];
