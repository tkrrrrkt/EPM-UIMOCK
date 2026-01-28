import type { SubmissionStatusDto } from './SubmissionStatusDto';
export interface SubmissionStatusSummaryDto {
    items: SubmissionStatusDto[];
    summary: {
        total: number;
        notStarted: number;
        draft: number;
        submitted: number;
        submissionRate: number;
    };
}
