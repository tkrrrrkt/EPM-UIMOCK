import type { MeetingEventDto } from './MeetingEventDto';
export interface MeetingEventListDto {
    items: MeetingEventDto[];
    page: number;
    pageSize: number;
    totalCount: number;
}
