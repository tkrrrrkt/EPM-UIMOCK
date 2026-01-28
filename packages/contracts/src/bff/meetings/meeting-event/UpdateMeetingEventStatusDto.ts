import type { MeetingEventStatus } from '../enums';

/**
 * 会議イベントステータス更新リクエストDTO
 */
export interface UpdateMeetingEventStatusDto {
  /** 新しいステータス */
  status: MeetingEventStatus;
}
