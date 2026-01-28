/**
 * コンポーネント幅
 *
 * FULL: 全幅（100%）
 * HALF: 半幅（50%）
 * THIRD: 3分の1幅（33.3%）
 */
export const ComponentWidth = {
  FULL: 'FULL',
  HALF: 'HALF',
  THIRD: 'THIRD',
} as const;

export type ComponentWidth = (typeof ComponentWidth)[keyof typeof ComponentWidth];
