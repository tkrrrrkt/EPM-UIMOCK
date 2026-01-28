/**
 * レポートデータソース種別
 *
 * FACT: 実績データ（予算・実績・見込）
 * KPI: KPIデータ（KPI定義・目標・実績）
 * SUBMISSION: 部門報告データ
 * SNAPSHOT: スナップショットデータ（前回会議データ）
 * EXTERNAL: 外部データ（既存レポート、アクション等）
 */
export const ReportDataSource = {
  FACT: 'FACT',
  KPI: 'KPI',
  SUBMISSION: 'SUBMISSION',
  SNAPSHOT: 'SNAPSHOT',
  EXTERNAL: 'EXTERNAL',
} as const;

export type ReportDataSource = (typeof ReportDataSource)[keyof typeof ReportDataSource];
