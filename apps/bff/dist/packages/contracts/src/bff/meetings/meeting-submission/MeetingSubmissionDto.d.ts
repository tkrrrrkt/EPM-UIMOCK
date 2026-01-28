import type { SubmissionLevel, SubmissionStatus } from '../enums';
import type { MeetingSubmissionValueDto } from './MeetingSubmissionValueDto';
export interface MeetingSubmissionDto {
    id: string;
    meetingEventId: string;
    submissionLevel: SubmissionLevel;
    departmentStableId?: string;
    departmentName?: string;
    status: SubmissionStatus;
    submittedAt?: string;
    submittedBy?: string;
    submittedByName?: string;
    values: MeetingSubmissionValueDto[];
    createdAt: string;
    updatedAt: string;
}
