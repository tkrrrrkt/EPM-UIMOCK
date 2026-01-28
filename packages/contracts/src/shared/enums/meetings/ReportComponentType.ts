/**
 * レポートコンポーネント種別
 *
 * KPI_CARD: 主要指標カード（売上・利益等のKPI表示）
 * TABLE: データ表（予実対比表等）
 * CHART: グラフ（ウォーターフォール、棒、折れ線等）
 * SUBMISSION_DISPLAY: 部門報告表示
 * REPORT_LINK: 既存レポートリンク（予実レポート等へのリンク）
 * ACTION_LIST: アクション一覧（会議アクション表示）
 * SNAPSHOT_COMPARE: 前回比較（前回会議との差分表示）
 * KPI_DASHBOARD: KPI一覧ダッシュボード
 * AP_PROGRESS: アクションプラン進捗表示
 */
export const ReportComponentType = {
  KPI_CARD: 'KPI_CARD',
  TABLE: 'TABLE',
  CHART: 'CHART',
  SUBMISSION_DISPLAY: 'SUBMISSION_DISPLAY',
  REPORT_LINK: 'REPORT_LINK',
  ACTION_LIST: 'ACTION_LIST',
  SNAPSHOT_COMPARE: 'SNAPSHOT_COMPARE',
  KPI_DASHBOARD: 'KPI_DASHBOARD',
  AP_PROGRESS: 'AP_PROGRESS',
} as const;

export type ReportComponentType = (typeof ReportComponentType)[keyof typeof ReportComponentType];
