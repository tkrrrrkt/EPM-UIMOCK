/**
 * 会議イベントのステータス
 */
export type MeetingEventStatus =
  | 'DRAFT'       // 下書き
  | 'OPEN'        // 受付中
  | 'COLLECTING'  // 確認中
  | 'DISTRIBUTED' // 展開済
  | 'HELD'        // 実施済
  | 'CLOSED'      // 完了
  | 'ARCHIVED';   // 保管

/**
 * ステータスの表示名マッピング
 */
export const MeetingEventStatusLabel: Record<MeetingEventStatus, string> = {
  DRAFT: '下書き',
  OPEN: '受付中',
  COLLECTING: '確認中',
  DISTRIBUTED: '展開済',
  HELD: '実施済',
  CLOSED: '完了',
  ARCHIVED: '保管',
};

/**
 * ステータス遷移の定義
 */
export const MeetingEventStatusTransitions: Record<MeetingEventStatus, MeetingEventStatus[]> = {
  DRAFT: ['OPEN'],
  OPEN: ['COLLECTING'],
  COLLECTING: ['DISTRIBUTED'],
  DISTRIBUTED: ['HELD'],
  HELD: ['CLOSED'],
  CLOSED: ['ARCHIVED'],
  ARCHIVED: [],
};
