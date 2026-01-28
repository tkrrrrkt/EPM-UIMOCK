/**
 * 会議イベント更新リクエストDTO
 */
export interface UpdateMeetingEventDto {
  /** 会議名 */
  eventName?: string;
  /** 報告締切日（ISO 8601） */
  submissionDeadline?: string;
  /** 事前展開日（ISO 8601） */
  distributionDate?: string;
  /** 会議日（ISO 8601） */
  meetingDate?: string;
  /** レポートレイアウトID */
  reportLayoutId?: string;
  /** 備考 */
  notes?: string;
}
