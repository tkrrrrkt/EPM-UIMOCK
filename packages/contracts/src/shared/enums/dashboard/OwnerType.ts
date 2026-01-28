/**
 * ダッシュボードオーナー種別
 * @module shared/enums/dashboard
 */
export const OwnerType = {
  /** システムテンプレート（削除不可） */
  SYSTEM: 'SYSTEM',
  /** ユーザー作成ダッシュボード */
  USER: 'USER',
} as const;

export type OwnerType = (typeof OwnerType)[keyof typeof OwnerType];
