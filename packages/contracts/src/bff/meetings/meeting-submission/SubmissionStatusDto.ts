import type { SubmissionLevel, SubmissionStatus } from '../enums';

/**
 * 提出状況DTO（一覧表示用）
 */
export interface SubmissionStatusDto {
  /** 部門StableID */
  departmentStableId: string;
  /** 部門名 */
  departmentName: string;
  /** 報告レベル */
  submissionLevel: SubmissionLevel;
  /** ステータス */
  status: SubmissionStatus;
  /** 担当者名 */
  assigneeName?: string;
  /** 提出日時（ISO 8601） */
  submittedAt?: string;
  /** 提出者名 */
  submittedByName?: string;
  /** 最終更新日時（ISO 8601） */
  lastUpdatedAt?: string;
}
