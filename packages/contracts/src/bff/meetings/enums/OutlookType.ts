/**
 * 業績見通しの種類
 */
export type OutlookType =
  | 'GOOD'          // 好調
  | 'ON_TRACK'      // 計画通り
  | 'CONCERN'       // 懸念
  | 'ACTION_NEEDED'; // 要対策

/**
 * 見通しの表示名マッピング
 */
export const OutlookTypeLabel: Record<OutlookType, string> = {
  GOOD: '好調',
  ON_TRACK: '計画通り',
  CONCERN: '懸念',
  ACTION_NEEDED: '要対策',
};
