import type { SubmissionLevel, SubmissionStatus } from '../enums';
import type { MeetingSubmissionValueDto } from './MeetingSubmissionValueDto';

/**
 * 部門報告DTO
 */
export interface MeetingSubmissionDto {
  /** ID */
  id: string;
  /** 会議イベントID */
  meetingEventId: string;
  /** 報告レベル */
  submissionLevel: SubmissionLevel;
  /** 部門StableID */
  departmentStableId?: string;
  /** 部門名 */
  departmentName?: string;
  /** ステータス */
  status: SubmissionStatus;
  /** 提出日時（ISO 8601） */
  submittedAt?: string;
  /** 提出者 */
  submittedBy?: string;
  /** 提出者名 */
  submittedByName?: string;
  /** 報告項目値 */
  values: MeetingSubmissionValueDto[];
  /** 作成日時（ISO 8601） */
  createdAt: string;
  /** 更新日時（ISO 8601） */
  updatedAt: string;
}
