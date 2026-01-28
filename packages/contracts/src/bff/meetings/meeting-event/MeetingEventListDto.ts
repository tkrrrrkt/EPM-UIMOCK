import type { MeetingEventDto } from './MeetingEventDto';

/**
 * 会議イベント一覧レスポンスDTO
 */
export interface MeetingEventListDto {
  /** 会議イベント一覧 */
  items: MeetingEventDto[];
  /** 現在のページ（1-based） */
  page: number;
  /** 1ページあたりの件数 */
  pageSize: number;
  /** 総件数 */
  totalCount: number;
}
