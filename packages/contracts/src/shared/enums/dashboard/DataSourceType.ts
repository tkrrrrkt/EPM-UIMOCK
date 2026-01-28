/**
 * データソース種別
 * @module shared/enums/dashboard
 */
export const DataSourceType = {
  /** 勘定科目残高データ（subjects.stable_id → facts） */
  FACT: 'FACT',
  /** KPI管理マスタで定義されたKPI（kpi_definitions.id → kpi_fact_amounts） */
  KPI: 'KPI',
  /** 計算指標（metrics.id → formula評価） */
  METRIC: 'METRIC',
} as const;

export type DataSourceType = (typeof DataSourceType)[keyof typeof DataSourceType];
