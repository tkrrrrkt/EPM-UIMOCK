import { ManagementMeetingReportService } from './management-meeting-report.service';
import type { MeetingEventDto, MeetingEventListDto, CreateMeetingEventDto, UpdateMeetingEventDto, UpdateMeetingEventStatusDto, GetMeetingEventsQueryDto, SubmissionStatusSummaryDto, MeetingSubmissionDto, SaveSubmissionDto, KpiCardListDto, SubmissionTrackingDto, RemindSubmissionDto, CloseEventDto, CloseEventResultDto, MeetingMinutesDto, SaveMeetingMinutesDto } from '@epm/contracts/bff/meetings';
export declare class ManagementMeetingReportController {
    private readonly service;
    constructor(service: ManagementMeetingReportService);
    getEvents(tenantId: string, query: GetMeetingEventsQueryDto): Promise<MeetingEventListDto>;
    getEvent(tenantId: string, id: string): Promise<MeetingEventDto>;
    createEvent(tenantId: string, userId: string, data: CreateMeetingEventDto): Promise<MeetingEventDto>;
    updateEvent(tenantId: string, userId: string, id: string, data: UpdateMeetingEventDto): Promise<MeetingEventDto>;
    updateEventStatus(tenantId: string, userId: string, id: string, data: UpdateMeetingEventStatusDto): Promise<MeetingEventDto>;
    getSubmissionStatus(tenantId: string, eventId: string): Promise<SubmissionStatusSummaryDto>;
    getSubmission(tenantId: string, eventId: string, deptId: string): Promise<MeetingSubmissionDto>;
    saveSubmission(tenantId: string, userId: string, data: SaveSubmissionDto): Promise<MeetingSubmissionDto>;
    submitSubmission(tenantId: string, userId: string, id: string): Promise<MeetingSubmissionDto>;
    getKpiCards(tenantId: string, eventId: string, departmentStableId?: string): Promise<KpiCardListDto>;
    getSubmissionTracking(tenantId: string, eventId: string): Promise<SubmissionTrackingDto>;
    remindSubmission(tenantId: string, userId: string, eventId: string, data: RemindSubmissionDto): Promise<void>;
    closeEvent(tenantId: string, userId: string, eventId: string, data: CloseEventDto): Promise<CloseEventResultDto>;
    getMinutes(tenantId: string, eventId: string): Promise<MeetingMinutesDto>;
    saveMinutes(tenantId: string, userId: string, eventId: string, data: SaveMeetingMinutesDto): Promise<MeetingMinutesDto>;
}
