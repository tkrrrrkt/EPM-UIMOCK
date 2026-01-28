import type { MeetingEventDto, SubmissionStatusDto, MeetingSubmissionDto, MeetingSubmissionValueDto, KpiCardDto, SubmissionTrackingItemDto, MeetingMinutesDto } from '@epm/contracts/bff/meetings';
export declare const MOCK_MEETING_TYPES: {
    id: string;
    typeCode: string;
    typeName: string;
}[];
export declare const MOCK_MEETING_EVENTS: MeetingEventDto[];
export declare const MOCK_DEPARTMENTS: {
    stableId: string;
    name: string;
    level: string;
}[];
export declare const MOCK_SUBMISSION_STATUS: Record<string, SubmissionStatusDto[]>;
export declare const MOCK_FORM_FIELDS: MeetingSubmissionValueDto[];
export declare const MOCK_SUBMISSIONS: Record<string, MeetingSubmissionDto>;
export declare const MOCK_KPI_CARDS: KpiCardDto[];
export declare const MOCK_SUBMISSION_TRACKING: Record<string, SubmissionTrackingItemDto[]>;
export declare const MOCK_MEETING_MINUTES: Record<string, MeetingMinutesDto>;
