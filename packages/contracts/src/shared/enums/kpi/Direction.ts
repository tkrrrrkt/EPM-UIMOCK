/**
 * KPI方向性
 *
 * higher_is_better: 高い方が良い（売上、利益率など）
 * lower_is_better: 低い方が良い（コスト、不良率など）
 */
export const Direction = {
  HIGHER_IS_BETTER: 'higher_is_better',
  LOWER_IS_BETTER: 'lower_is_better',
} as const;

export type Direction = typeof Direction[keyof typeof Direction];
