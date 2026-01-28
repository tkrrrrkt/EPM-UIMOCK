import type { MeetingEventDto, MeetingEventListDto, CreateMeetingEventDto, UpdateMeetingEventDto, UpdateMeetingEventStatusDto, GetMeetingEventsQueryDto, SubmissionStatusSummaryDto, MeetingSubmissionDto, SaveSubmissionDto, KpiCardListDto, SubmissionTrackingDto, RemindSubmissionDto, CloseEventDto, CloseEventResultDto, MeetingMinutesDto, SaveMeetingMinutesDto } from '@epm/contracts/bff/meetings';
export declare class ManagementMeetingReportService {
    private events;
    getEvents(tenantId: string, query: GetMeetingEventsQueryDto): Promise<MeetingEventListDto>;
    getEventById(tenantId: string, id: string): Promise<MeetingEventDto | null>;
    createEvent(tenantId: string, userId: string, data: CreateMeetingEventDto): Promise<MeetingEventDto>;
    updateEvent(tenantId: string, userId: string, id: string, data: UpdateMeetingEventDto): Promise<MeetingEventDto | null>;
    updateEventStatus(tenantId: string, userId: string, id: string, data: UpdateMeetingEventStatusDto): Promise<MeetingEventDto | null>;
    getSubmissionStatus(tenantId: string, eventId: string): Promise<SubmissionStatusSummaryDto>;
    getSubmission(tenantId: string, eventId: string, departmentStableId: string): Promise<MeetingSubmissionDto | null>;
    saveSubmission(tenantId: string, userId: string, data: SaveSubmissionDto): Promise<MeetingSubmissionDto>;
    submitSubmission(tenantId: string, userId: string, submissionId: string): Promise<MeetingSubmissionDto | null>;
    getKpiCards(tenantId: string, eventId: string, departmentStableId?: string): Promise<KpiCardListDto>;
    getSubmissionTracking(tenantId: string, eventId: string): Promise<SubmissionTrackingDto>;
    remindSubmission(tenantId: string, userId: string, eventId: string, data: RemindSubmissionDto): Promise<void>;
    closeEvent(tenantId: string, userId: string, eventId: string, data: CloseEventDto): Promise<CloseEventResultDto>;
    private minutes;
    getMinutes(tenantId: string, eventId: string): Promise<MeetingMinutesDto | null>;
    saveMinutes(tenantId: string, userId: string, eventId: string, data: SaveMeetingMinutesDto): Promise<MeetingMinutesDto>;
    private generateEventCode;
    private extractMonth;
    private getDepartmentName;
}
