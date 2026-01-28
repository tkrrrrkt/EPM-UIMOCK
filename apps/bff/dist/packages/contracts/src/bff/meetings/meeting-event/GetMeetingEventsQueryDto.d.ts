import type { MeetingEventStatus } from '../enums';
export interface GetMeetingEventsQueryDto {
    keyword?: string;
    meetingTypeId?: string;
    status?: MeetingEventStatus;
    fiscalYear?: number;
    sortBy?: 'eventCode' | 'eventName' | 'meetingDate' | 'submissionDeadline' | 'status' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    pageSize?: number;
}
