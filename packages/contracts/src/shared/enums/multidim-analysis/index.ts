/**
 * 多次元分析機能 Shared Enums
 *
 * @module shared/enums/multidim-analysis
 */

/**
 * 分析モード
 * - STANDARD: 標準分析（組織階層ベース）
 * - PROJECT: プロジェクト分析（プロジェクト軸ベース）
 */
export const AnalysisMode = {
  STANDARD: 'standard',
  PROJECT: 'project',
} as const;

export type AnalysisMode = (typeof AnalysisMode)[keyof typeof AnalysisMode];

/**
 * 金額単位
 * - YEN: 円
 * - THOUSAND: 千円
 * - MILLION: 百万円
 */
export const UnitType = {
  YEN: 'yen',
  THOUSAND: 'thousand',
  MILLION: 'million',
} as const;

export type UnitType = (typeof UnitType)[keyof typeof UnitType];

/**
 * シナリオ種別
 * - BUDGET: 予算
 * - FORECAST: 見通し
 * - ACTUAL: 実績
 */
export const ScenarioType = {
  BUDGET: 'BUDGET',
  FORECAST: 'FORECAST',
  ACTUAL: 'ACTUAL',
} as const;

export type ScenarioType = (typeof ScenarioType)[keyof typeof ScenarioType];
