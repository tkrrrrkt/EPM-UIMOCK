import type { SubmissionTrackingItemDto } from './SubmissionTrackingItemDto';

/**
 * 登録状況詳細レスポンス（B3用）
 */
export interface SubmissionTrackingDto {
  /** 会議イベントID */
  eventId: string;
  /** 部門別提出状況一覧 */
  items: SubmissionTrackingItemDto[];
  /** サマリー情報 */
  summary: {
    /** 対象部門数 */
    total: number;
    /** 提出済み部門数 */
    submitted: number;
    /** 作成中部門数 */
    draft: number;
    /** 未着手部門数 */
    notStarted: number;
    /** 締切超過部門数 */
    overdue: number;
  };
}
