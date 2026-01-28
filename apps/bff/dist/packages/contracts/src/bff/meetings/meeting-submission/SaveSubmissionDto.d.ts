import type { SubmissionLevel } from '../enums';
export interface SaveSubmissionDto {
    meetingEventId: string;
    submissionLevel: SubmissionLevel;
    departmentStableId?: string;
    values: SaveSubmissionValueDto[];
}
export interface SaveSubmissionValueDto {
    fieldId: string;
    valueText?: string;
    valueNumber?: number;
    valueDate?: string;
    valueJson?: unknown;
    quoteRefsJson?: Array<{
        sourceType: 'SUBMISSION' | 'PLAN_VERSION_COMMENT';
        sourceSubmissionId?: string;
        sourceFieldId?: string;
        sourcePlanVersionId?: string;
        sourceDepartmentStableId?: string;
        quotedAt: string;
    }>;
}
