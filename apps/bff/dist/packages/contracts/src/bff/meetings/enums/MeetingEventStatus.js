"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetingEventStatusTransitions = exports.MeetingEventStatusLabel = void 0;
exports.MeetingEventStatusLabel = {
    DRAFT: '下書き',
    OPEN: '受付中',
    COLLECTING: '確認中',
    DISTRIBUTED: '展開済',
    HELD: '実施済',
    CLOSED: '完了',
    ARCHIVED: '保管',
};
exports.MeetingEventStatusTransitions = {
    DRAFT: ['OPEN'],
    OPEN: ['COLLECTING'],
    COLLECTING: ['DISTRIBUTED'],
    DISTRIBUTED: ['HELD'],
    HELD: ['CLOSED'],
    CLOSED: ['ARCHIVED'],
    ARCHIVED: [],
};
//# sourceMappingURL=MeetingEventStatus.js.map