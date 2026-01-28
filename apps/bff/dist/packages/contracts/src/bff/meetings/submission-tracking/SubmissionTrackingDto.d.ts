import type { SubmissionTrackingItemDto } from './SubmissionTrackingItemDto';
export interface SubmissionTrackingDto {
    eventId: string;
    items: SubmissionTrackingItemDto[];
    summary: {
        total: number;
        submitted: number;
        draft: number;
        notStarted: number;
        overdue: number;
    };
}
