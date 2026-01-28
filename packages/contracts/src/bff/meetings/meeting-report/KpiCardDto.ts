import type { KpiCardStatus } from '../enums';

/**
 * KPIカードDTO（レポート表示用）
 */
export interface KpiCardDto {
  /** 科目ID */
  subjectId: string;
  /** 科目名 */
  subjectName: string;
  /** 予算 */
  budget: number;
  /** 実績 */
  actual: number;
  /** 見込 */
  forecast: number;
  /** 達成率（(actual + forecast) / budget * 100） */
  achievementRate: number;
  /** 達成状況 */
  status: KpiCardStatus;
  /** 予算差異 */
  variance: number;
  /** 差異率 */
  varianceRate: number;
  /** 単位 */
  unit?: string;
  /** フォーマットタイプ */
  formatType?: 'currency' | 'percentage' | 'number';
}
