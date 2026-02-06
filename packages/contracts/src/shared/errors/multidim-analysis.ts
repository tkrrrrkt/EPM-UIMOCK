/**
 * 多次元分析機能 Error Codes
 *
 * @module shared/errors/multidim-analysis
 */

/**
 * 多次元分析エラーコード
 * - INVALID_LAYOUT: レイアウト構成が不正
 * - DIMX_CONFLICT: DimX相互排他ルール違反
 * - MODE_CONFLICT: 分析モード制約違反
 * - ROW_LIMIT_EXCEEDED: 行軸フィールド数上限超過
 * - QUERY_TIMEOUT: クエリタイムアウト
 * - ACCESS_DENIED: アクセス権限なし
 */
export const MultidimErrorCode = {
  INVALID_LAYOUT: 'MULTIDIM_INVALID_LAYOUT',
  DIMX_CONFLICT: 'MULTIDIM_DIMX_CONFLICT',
  MODE_CONFLICT: 'MULTIDIM_MODE_CONFLICT',
  ROW_LIMIT_EXCEEDED: 'MULTIDIM_ROW_LIMIT_EXCEEDED',
  QUERY_TIMEOUT: 'MULTIDIM_QUERY_TIMEOUT',
  ACCESS_DENIED: 'MULTIDIM_ACCESS_DENIED',
} as const;

export type MultidimErrorCode =
  (typeof MultidimErrorCode)[keyof typeof MultidimErrorCode];
