import type { SubmissionLevel, SubmissionStatus } from '../enums';
export interface SubmissionStatusDto {
    departmentStableId: string;
    departmentName: string;
    submissionLevel: SubmissionLevel;
    status: SubmissionStatus;
    assigneeName?: string;
    submittedAt?: string;
    submittedByName?: string;
    lastUpdatedAt?: string;
}
