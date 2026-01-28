/**
 * 部門報告の提出ステータス
 */
export type SubmissionStatus =
  | 'NOT_STARTED' // 未着手
  | 'DRAFT'       // 下書き中
  | 'SUBMITTED';  // 提出済

/**
 * ステータスの表示名マッピング
 */
export const SubmissionStatusLabel: Record<SubmissionStatus, string> = {
  NOT_STARTED: '未着手',
  DRAFT: '下書き中',
  SUBMITTED: '提出済',
};
