export type MeetingEventStatus = 'DRAFT' | 'OPEN' | 'COLLECTING' | 'DISTRIBUTED' | 'HELD' | 'CLOSED' | 'ARCHIVED';
export declare const MeetingEventStatusLabel: Record<MeetingEventStatus, string>;
export declare const MeetingEventStatusTransitions: Record<MeetingEventStatus, MeetingEventStatus[]>;
