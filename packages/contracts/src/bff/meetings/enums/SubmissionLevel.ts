/**
 * 報告の階層レベル
 */
export type SubmissionLevel =
  | 'DEPARTMENT' // 部門
  | 'BU'         // 事業部
  | 'COMPANY';   // 全社

/**
 * レベルの表示名マッピング
 */
export const SubmissionLevelLabel: Record<SubmissionLevel, string> = {
  DEPARTMENT: '部門',
  BU: '事業部',
  COMPANY: '全社',
};
