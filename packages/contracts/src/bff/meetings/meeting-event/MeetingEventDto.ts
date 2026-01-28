import type { MeetingEventStatus } from '../enums';

/**
 * 会議イベントDTO
 */
export interface MeetingEventDto {
  /** ID */
  id: string;
  /** イベントコード（例: MTG_202606） */
  eventCode: string;
  /** 会議名（例: 6月度経営会議） */
  eventName: string;
  /** 会議種別ID */
  meetingTypeId: string;
  /** 会議種別名 */
  meetingTypeName: string;
  /** 対象期間ID */
  targetPeriodId?: string;
  /** 対象期間名（例: 2026年6月度） */
  targetPeriodName?: string;
  /** 対象年度 */
  targetFiscalYear: number;
  /** ステータス */
  status: MeetingEventStatus;
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
  /** 議事録本文 */
  minutesText?: string;
  /** 議事録記録日時（ISO 8601） */
  minutesRecordedAt?: string;
  /** 議事録記録者 */
  minutesRecordedBy?: string;
  /** 作成日時（ISO 8601） */
  createdAt: string;
  /** 更新日時（ISO 8601） */
  updatedAt: string;
}
