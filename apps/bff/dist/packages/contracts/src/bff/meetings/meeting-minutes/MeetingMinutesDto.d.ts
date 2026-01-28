import type { AttachmentDto } from './AttachmentDto';
export interface MeetingMinutesDto {
    id: string;
    eventId: string;
    content: string;
    decisions: string[];
    attendees: string[];
    attachments: AttachmentDto[];
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
}
