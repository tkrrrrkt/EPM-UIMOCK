import type { MeetingEventStatus } from '../enums/MeetingEventStatus';

/**
 * 会議クローズ結果レスポンス
 */
export interface CloseEventResultDto {
  /** 会議イベントID */
  eventId: string;
  /** 更新後のステータス */
  status: MeetingEventStatus;
  /** クローズ日時（ISO 8601） */
  closedAt: string;
  /** 取得したスナップショットID一覧 */
  snapshotIds?: string[];
}
