import type { SubmissionStatusDto } from './SubmissionStatusDto';

/**
 * 提出状況サマリーDTO
 */
export interface SubmissionStatusSummaryDto {
  /** 提出状況一覧 */
  items: SubmissionStatusDto[];
  /** サマリー */
  summary: {
    /** 総件数 */
    total: number;
    /** 未着手件数 */
    notStarted: number;
    /** 下書き件数 */
    draft: number;
    /** 提出済件数 */
    submitted: number;
    /** 提出率（0-100） */
    submissionRate: number;
  };
}
