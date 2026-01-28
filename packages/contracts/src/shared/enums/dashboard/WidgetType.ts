/**
 * ウィジェット種別
 * @module shared/enums/dashboard
 */
export const WidgetType = {
  KPI_CARD: 'KPI_CARD',
  LINE_CHART: 'LINE_CHART',
  BAR_CHART: 'BAR_CHART',
  PIE_CHART: 'PIE_CHART',
  GAUGE: 'GAUGE',
  TABLE: 'TABLE',
  TEXT: 'TEXT',
  COMPOSITE_CHART: 'COMPOSITE_CHART',
} as const;

export type WidgetType = (typeof WidgetType)[keyof typeof WidgetType];
