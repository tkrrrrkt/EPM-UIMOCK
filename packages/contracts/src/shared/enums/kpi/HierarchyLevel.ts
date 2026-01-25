/**
 * KPI階層レベル
 *
 * 1: KGI（全社レベル）
 * 2: KPI（事業部レベル）
 *
 * Level 3（アクションプラン/部課レベル）は action_plans テーブルで管理
 */
export const HierarchyLevel = {
  KGI: 1,
  KPI: 2,
} as const;

export type HierarchyLevel = typeof HierarchyLevel[keyof typeof HierarchyLevel];
