/**
 * コンポーネント高さ
 *
 * AUTO: 自動（内容に応じて自動調整）
 * SMALL: 小（固定高さ・小）
 * MEDIUM: 中（固定高さ・中）
 * LARGE: 大（固定高さ・大）
 */
export const ComponentHeight = {
  AUTO: 'AUTO',
  SMALL: 'SMALL',
  MEDIUM: 'MEDIUM',
  LARGE: 'LARGE',
} as const;

export type ComponentHeight = (typeof ComponentHeight)[keyof typeof ComponentHeight];
