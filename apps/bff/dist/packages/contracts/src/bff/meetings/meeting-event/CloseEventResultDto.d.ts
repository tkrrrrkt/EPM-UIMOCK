import type { MeetingEventStatus } from '../enums/MeetingEventStatus';
export interface CloseEventResultDto {
    eventId: string;
    status: MeetingEventStatus;
    closedAt: string;
    snapshotIds?: string[];
}
