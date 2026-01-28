/**
 * KPIカードの達成状況
 */
export type KpiCardStatus =
  | 'SUCCESS'  // 達成
  | 'WARNING'  // 警告
  | 'ERROR';   // 未達

/**
 * ステータスの表示名マッピング
 */
export const KpiCardStatusLabel: Record<KpiCardStatus, string> = {
  SUCCESS: '達成',
  WARNING: '注意',
  ERROR: '未達',
};
