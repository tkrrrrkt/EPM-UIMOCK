/**
 * KPI管理イベントのステータス
 *
 * DRAFT: 編集可能状態（KPI項目の追加・編集・削除が可能）
 * CONFIRMED: 確定状態（KPI項目の削除は禁止、追加・編集は可能）
 */
export const KpiMasterEventStatus = {
  DRAFT: 'DRAFT',
  CONFIRMED: 'CONFIRMED',
} as const;

export type KpiMasterEventStatus = typeof KpiMasterEventStatus[keyof typeof KpiMasterEventStatus];
