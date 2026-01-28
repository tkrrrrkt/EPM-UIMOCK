import type { MeetingEventStatus } from '../enums';

/**
 * 会議イベント一覧クエリDTO
 */
export interface GetMeetingEventsQueryDto {
  /** キーワード検索（会議名、イベントコード） */
  keyword?: string;
  /** 会議種別ID */
  meetingTypeId?: string;
  /** ステータス */
  status?: MeetingEventStatus;
  /** 対象年度 */
  fiscalYear?: number;
  /** ソートキー */
  sortBy?: 'eventCode' | 'eventName' | 'meetingDate' | 'submissionDeadline' | 'status' | 'createdAt';
  /** ソート順 */
  sortOrder?: 'asc' | 'desc';
  /** ページ番号（1-based） */
  page?: number;
  /** 1ページあたりの件数 */
  pageSize?: number;
}
