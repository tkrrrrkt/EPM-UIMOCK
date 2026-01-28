import type { SubmissionLevel } from '../enums/SubmissionLevel';
import type { SubmissionStatus } from '../enums/SubmissionStatus';

/**
 * 部門別提出状況アイテム
 */
export interface SubmissionTrackingItemDto {
  /** 部門安定ID */
  departmentStableId: string;
  /** 部門名 */
  departmentName: string;
  /** 部門レベル */
  level: SubmissionLevel;
  /** 提出ステータス */
  status: SubmissionStatus;
  /** 提出日時（ISO 8601） */
  submittedAt?: string;
  /** 提出者名 */
  submittedBy?: string;
  /** 締切超過フラグ */
  isOverdue: boolean;
  /** 最終催促日時（ISO 8601） */
  lastRemindedAt?: string;
}
