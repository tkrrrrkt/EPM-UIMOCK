import type { MeetingEventStatus } from '../enums';
export interface MeetingEventDto {
    id: string;
    eventCode: string;
    eventName: string;
    meetingTypeId: string;
    meetingTypeName: string;
    targetPeriodId?: string;
    targetPeriodName?: string;
    targetFiscalYear: number;
    status: MeetingEventStatus;
    submissionDeadline?: string;
    distributionDate?: string;
    meetingDate?: string;
    reportLayoutId?: string;
    notes?: string;
    minutesText?: string;
    minutesRecordedAt?: string;
    minutesRecordedBy?: string;
    createdAt: string;
    updatedAt: string;
}
