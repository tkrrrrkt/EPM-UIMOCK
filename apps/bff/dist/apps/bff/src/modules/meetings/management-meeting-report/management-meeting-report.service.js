"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManagementMeetingReportService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const mock_data_1 = require("./mock-data");
let ManagementMeetingReportService = class ManagementMeetingReportService {
    constructor() {
        this.events = [...mock_data_1.MOCK_MEETING_EVENTS];
        this.minutes = new Map();
    }
    async getEvents(tenantId, query) {
        let events = [...this.events];
        if (query.keyword) {
            const keyword = query.keyword.toLowerCase();
            events = events.filter((e) => e.eventName.toLowerCase().includes(keyword) ||
                e.eventCode.toLowerCase().includes(keyword));
        }
        if (query.meetingTypeId) {
            events = events.filter((e) => e.meetingTypeId === query.meetingTypeId);
        }
        if (query.status) {
            events = events.filter((e) => e.status === query.status);
        }
        if (query.fiscalYear) {
            events = events.filter((e) => e.targetFiscalYear === query.fiscalYear);
        }
        const sortBy = query.sortBy || 'createdAt';
        const sortOrder = query.sortOrder || 'desc';
        events.sort((a, b) => {
            const aVal = a[sortBy] ?? '';
            const bVal = b[sortBy] ?? '';
            if (aVal < bVal)
                return sortOrder === 'asc' ? -1 : 1;
            if (aVal > bVal)
                return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
        const page = query.page || 1;
        const pageSize = Math.min(query.pageSize || 20, 100);
        const start = (page - 1) * pageSize;
        const paged = events.slice(start, start + pageSize);
        return {
            items: paged,
            page,
            pageSize,
            totalCount: events.length,
        };
    }
    async getEventById(tenantId, id) {
        return this.events.find((e) => e.id === id) ?? null;
    }
    async createEvent(tenantId, userId, data) {
        const meetingType = mock_data_1.MOCK_MEETING_TYPES.find((t) => t.id === data.meetingTypeId);
        const now = new Date().toISOString();
        const newEvent = {
            id: (0, crypto_1.randomUUID)(),
            eventCode: this.generateEventCode(data.meetingTypeId, data.targetFiscalYear),
            eventName: data.eventName,
            meetingTypeId: data.meetingTypeId,
            meetingTypeName: meetingType?.typeName || '不明',
            targetPeriodId: data.targetPeriodId,
            targetPeriodName: data.targetPeriodId
                ? `${data.targetFiscalYear}年${this.extractMonth(data.targetPeriodId)}月度`
                : undefined,
            targetFiscalYear: data.targetFiscalYear,
            status: 'DRAFT',
            submissionDeadline: data.submissionDeadline,
            distributionDate: data.distributionDate,
            meetingDate: data.meetingDate,
            reportLayoutId: data.reportLayoutId,
            notes: data.notes,
            createdAt: now,
            updatedAt: now,
        };
        this.events.push(newEvent);
        return newEvent;
    }
    async updateEvent(tenantId, userId, id, data) {
        const index = this.events.findIndex((e) => e.id === id);
        if (index === -1)
            return null;
        const updated = {
            ...this.events[index],
            ...data,
            updatedAt: new Date().toISOString(),
        };
        this.events[index] = updated;
        return updated;
    }
    async updateEventStatus(tenantId, userId, id, data) {
        const index = this.events.findIndex((e) => e.id === id);
        if (index === -1)
            return null;
        const updated = {
            ...this.events[index],
            status: data.status,
            updatedAt: new Date().toISOString(),
        };
        this.events[index] = updated;
        return updated;
    }
    async getSubmissionStatus(tenantId, eventId) {
        const items = mock_data_1.MOCK_SUBMISSION_STATUS[eventId] || [];
        const summary = {
            total: items.length,
            notStarted: items.filter((i) => i.status === 'NOT_STARTED').length,
            draft: items.filter((i) => i.status === 'DRAFT').length,
            submitted: items.filter((i) => i.status === 'SUBMITTED').length,
            submissionRate: items.length > 0
                ? Math.round((items.filter((i) => i.status === 'SUBMITTED').length / items.length) * 100)
                : 0,
        };
        return { items, summary };
    }
    async getSubmission(tenantId, eventId, departmentStableId) {
        const key = `${eventId}_${departmentStableId}`;
        const existing = mock_data_1.MOCK_SUBMISSIONS[key];
        if (existing) {
            return existing;
        }
        return {
            id: '',
            meetingEventId: eventId,
            submissionLevel: 'DEPARTMENT',
            departmentStableId,
            departmentName: this.getDepartmentName(departmentStableId),
            status: 'NOT_STARTED',
            values: mock_data_1.MOCK_FORM_FIELDS.map((f) => ({
                ...f,
                id: '',
                valueText: undefined,
                valueNumber: undefined,
                valueDate: undefined,
                valueJson: undefined,
            })),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
    }
    async saveSubmission(tenantId, userId, data) {
        const now = new Date().toISOString();
        const submission = {
            id: (0, crypto_1.randomUUID)(),
            meetingEventId: data.meetingEventId,
            submissionLevel: data.submissionLevel,
            departmentStableId: data.departmentStableId,
            departmentName: this.getDepartmentName(data.departmentStableId || ''),
            status: 'DRAFT',
            values: data.values.map((v) => ({
                id: (0, crypto_1.randomUUID)(),
                fieldId: v.fieldId,
                fieldCode: '',
                fieldName: '',
                fieldType: 'TEXT',
                sectionCode: '',
                sectionName: '',
                isRequired: false,
                valueText: v.valueText,
                valueNumber: v.valueNumber,
                valueDate: v.valueDate,
                valueJson: v.valueJson,
                quoteRefsJson: v.quoteRefsJson,
            })),
            createdAt: now,
            updatedAt: now,
        };
        return submission;
    }
    async submitSubmission(tenantId, userId, submissionId) {
        return {
            id: submissionId,
            meetingEventId: '',
            submissionLevel: 'DEPARTMENT',
            status: 'SUBMITTED',
            submittedAt: new Date().toISOString(),
            submittedBy: userId,
            values: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
    }
    async getKpiCards(tenantId, eventId, departmentStableId) {
        return {
            items: mock_data_1.MOCK_KPI_CARDS,
        };
    }
    async getSubmissionTracking(tenantId, eventId) {
        const event = this.events.find((e) => e.id === eventId);
        const items = mock_data_1.MOCK_SUBMISSION_TRACKING[eventId] || [];
        const deadline = event?.submissionDeadline ? new Date(event.submissionDeadline) : null;
        const now = new Date();
        const itemsWithOverdue = items.map((item) => ({
            ...item,
            isOverdue: Boolean(deadline && now > deadline && item.status !== 'SUBMITTED'),
        }));
        return {
            eventId,
            items: itemsWithOverdue,
            summary: {
                total: itemsWithOverdue.length,
                submitted: itemsWithOverdue.filter((i) => i.status === 'SUBMITTED').length,
                draft: itemsWithOverdue.filter((i) => i.status === 'DRAFT').length,
                notStarted: itemsWithOverdue.filter((i) => i.status === 'NOT_STARTED').length,
                overdue: itemsWithOverdue.filter((i) => i.isOverdue).length,
            },
        };
    }
    async remindSubmission(tenantId, userId, eventId, data) {
        console.log(`[Mock] Remind submission: eventId=${eventId}, departments=${data.departmentStableIds.join(',')}`);
    }
    async closeEvent(tenantId, userId, eventId, data) {
        const index = this.events.findIndex((e) => e.id === eventId);
        if (index === -1) {
            throw new Error(`Event not found: ${eventId}`);
        }
        const now = new Date().toISOString();
        this.events[index] = {
            ...this.events[index],
            status: 'CLOSED',
            updatedAt: now,
        };
        const snapshotIds = data.includeSnapshot && data.snapshotTypes
            ? data.snapshotTypes.map((type) => `snapshot-${eventId}-${type}-${Date.now()}`)
            : undefined;
        return {
            eventId,
            status: 'CLOSED',
            closedAt: now,
            snapshotIds,
        };
    }
    async getMinutes(tenantId, eventId) {
        if (this.minutes.has(eventId)) {
            return this.minutes.get(eventId);
        }
        const mockMinutes = mock_data_1.MOCK_MEETING_MINUTES[eventId];
        if (mockMinutes) {
            return mockMinutes;
        }
        return {
            id: '',
            eventId,
            content: '',
            decisions: [],
            attendees: [],
            attachments: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: '',
            updatedBy: '',
        };
    }
    async saveMinutes(tenantId, userId, eventId, data) {
        const now = new Date().toISOString();
        const existing = this.minutes.get(eventId);
        const minutes = {
            id: existing?.id || (0, crypto_1.randomUUID)(),
            eventId,
            content: data.content,
            decisions: data.decisions,
            attendees: data.attendees,
            attachments: existing?.attachments || [],
            createdAt: existing?.createdAt || now,
            updatedAt: now,
            createdBy: existing?.createdBy || userId,
            updatedBy: userId,
        };
        this.minutes.set(eventId, minutes);
        return minutes;
    }
    generateEventCode(meetingTypeId, fiscalYear) {
        const type = mock_data_1.MOCK_MEETING_TYPES.find((t) => t.id === meetingTypeId);
        const prefix = type?.typeCode === 'MONTHLY_MGMT' ? 'MTG' : type?.typeCode || 'EVT';
        const month = new Date().getMonth() + 1;
        return `${prefix}_${fiscalYear}${month.toString().padStart(2, '0')}`;
    }
    extractMonth(periodId) {
        const match = periodId.match(/\d{4}(\d{2})$/);
        return match ? parseInt(match[1], 10).toString() : '';
    }
    getDepartmentName(stableId) {
        const deptMap = {
            'dept-sales': '営業部',
            'dept-dev': '開発部',
            'dept-admin': '管理部',
            'bu-x': 'X事業部',
            'bu-y': 'Y事業部',
        };
        return deptMap[stableId] || stableId;
    }
};
exports.ManagementMeetingReportService = ManagementMeetingReportService;
exports.ManagementMeetingReportService = ManagementMeetingReportService = __decorate([
    (0, common_1.Injectable)()
], ManagementMeetingReportService);
//# sourceMappingURL=management-meeting-report.service.js.map