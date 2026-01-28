/**
 * 会議イベント作成リクエストDTO
 */
export interface CreateMeetingEventDto {
  /** 会議種別ID */
  meetingTypeId: string;
  /** 会議名 */
  eventName: string;
  /** 対象年度 */
  targetFiscalYear: number;
  /** 対象期間ID（月度） */
  targetPeriodId?: string;
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
