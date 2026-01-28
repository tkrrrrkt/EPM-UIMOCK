import type { SubmissionLevel } from '../enums/SubmissionLevel';
import type { SubmissionStatus } from '../enums/SubmissionStatus';
export interface SubmissionTrackingItemDto {
    departmentStableId: string;
    departmentName: string;
    level: SubmissionLevel;
    status: SubmissionStatus;
    submittedAt?: string;
    submittedBy?: string;
    isOverdue: boolean;
    lastRemindedAt?: string;
}
