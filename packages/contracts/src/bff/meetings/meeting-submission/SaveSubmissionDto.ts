import type { SubmissionLevel } from '../enums';

/**
 * 報告保存リクエストDTO
 */
export interface SaveSubmissionDto {
  /** 会議イベントID */
  meetingEventId: string;
  /** 報告レベル */
  submissionLevel: SubmissionLevel;
  /** 部門StableID */
  departmentStableId?: string;
  /** 報告項目値 */
  values: SaveSubmissionValueDto[];
}

/**
 * 報告項目値の保存DTO
 */
export interface SaveSubmissionValueDto {
  /** フォーム項目ID */
  fieldId: string;
  /** テキスト値 */
  valueText?: string;
  /** 数値 */
  valueNumber?: number;
  /** 日付値（ISO 8601） */
  valueDate?: string;
  /** JSON値 */
  valueJson?: unknown;
  /** 引用メタデータ */
  quoteRefsJson?: Array<{
    sourceType: 'SUBMISSION' | 'PLAN_VERSION_COMMENT';
    sourceSubmissionId?: string;
    sourceFieldId?: string;
    sourcePlanVersionId?: string;
    sourceDepartmentStableId?: string;
    quotedAt: string;
  }>;
}
