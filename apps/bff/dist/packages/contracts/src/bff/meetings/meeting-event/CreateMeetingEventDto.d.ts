export interface CreateMeetingEventDto {
    meetingTypeId: string;
    eventName: string;
    targetFiscalYear: number;
    targetPeriodId?: string;
    submissionDeadline?: string;
    distributionDate?: string;
    meetingDate?: string;
    reportLayoutId?: string;
    notes?: string;
}
