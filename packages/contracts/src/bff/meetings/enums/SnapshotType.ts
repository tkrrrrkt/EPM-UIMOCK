/**
 * スナップショット種別
 * 会議クローズ時に取得するデータの種類
 */
export type SnapshotType = 'FACT_SUMMARY' | 'KPI_STATUS' | 'ACTION_PROGRESS';

export const SnapshotTypeLabel: Record<SnapshotType, string> = {
  FACT_SUMMARY: '数値サマリー',
  KPI_STATUS: 'KPI達成状況',
  ACTION_PROGRESS: 'アクションプラン進捗',
};
