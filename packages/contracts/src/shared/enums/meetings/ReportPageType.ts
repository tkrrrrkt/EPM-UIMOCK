/**
 * レポートページ種別
 *
 * FIXED: 固定1ページ（エグゼクティブサマリー、全社集計）
 * PER_DEPARTMENT: 部門ごとに展開（部門別詳細ページ）
 * PER_BU: 事業部ごとに展開（事業部別詳細ページ）
 */
export const ReportPageType = {
  FIXED: 'FIXED',
  PER_DEPARTMENT: 'PER_DEPARTMENT',
  PER_BU: 'PER_BU',
} as const;

export type ReportPageType = (typeof ReportPageType)[keyof typeof ReportPageType];
