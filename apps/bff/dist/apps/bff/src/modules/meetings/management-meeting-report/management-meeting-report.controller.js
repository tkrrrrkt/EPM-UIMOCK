"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManagementMeetingReportController = void 0;
const common_1 = require("@nestjs/common");
const management_meeting_report_service_1 = require("./management-meeting-report.service");
let ManagementMeetingReportController = class ManagementMeetingReportController {
    constructor(service) {
        this.service = service;
    }
    async getEvents(tenantId, query) {
        return this.service.getEvents(tenantId, query);
    }
    async getEvent(tenantId, id) {
        const event = await this.service.getEventById(tenantId, id);
        if (!event) {
            throw new common_1.NotFoundException(`Meeting event not found: ${id}`);
        }
        return event;
    }
    async createEvent(tenantId, userId, data) {
        return this.service.createEvent(tenantId, userId, data);
    }
    async updateEvent(tenantId, userId, id, data) {
        const event = await this.service.updateEvent(tenantId, userId, id, data);
        if (!event) {
            throw new common_1.NotFoundException(`Meeting event not found: ${id}`);
        }
        return event;
    }
    async updateEventStatus(tenantId, userId, id, data) {
        const event = await this.service.updateEventStatus(tenantId, userId, id, data);
        if (!event) {
            throw new common_1.NotFoundException(`Meeting event not found: ${id}`);
        }
        return event;
    }
    async getSubmissionStatus(tenantId, eventId) {
        return this.service.getSubmissionStatus(tenantId, eventId);
    }
    async getSubmission(tenantId, eventId, deptId) {
        const submission = await this.service.getSubmission(tenantId, eventId, deptId);
        if (!submission) {
            throw new common_1.NotFoundException(`Submission not found: ${eventId}/${deptId}`);
        }
        return submission;
    }
    async saveSubmission(tenantId, userId, data) {
        return this.service.saveSubmission(tenantId, userId, data);
    }
    async submitSubmission(tenantId, userId, id) {
        const submission = await this.service.submitSubmission(tenantId, userId, id);
        if (!submission) {
            throw new common_1.NotFoundException(`Submission not found: ${id}`);
        }
        return submission;
    }
    async getKpiCards(tenantId, eventId, departmentStableId) {
        return this.service.getKpiCards(tenantId, eventId, departmentStableId);
    }
    async getSubmissionTracking(tenantId, eventId) {
        return this.service.getSubmissionTracking(tenantId, eventId);
    }
    async remindSubmission(tenantId, userId, eventId, data) {
        await this.service.remindSubmission(tenantId, userId, eventId, data);
    }
    async closeEvent(tenantId, userId, eventId, data) {
        return this.service.closeEvent(tenantId, userId, eventId, data);
    }
    async getMinutes(tenantId, eventId) {
        const minutes = await this.service.getMinutes(tenantId, eventId);
        if (!minutes) {
            throw new common_1.NotFoundException(`Minutes not found for event: ${eventId}`);
        }
        return minutes;
    }
    async saveMinutes(tenantId, userId, eventId, data) {
        return this.service.saveMinutes(tenantId, userId, eventId, data);
    }
};
exports.ManagementMeetingReportController = ManagementMeetingReportController;
__decorate([
    (0, common_1.Get)('events'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ManagementMeetingReportController.prototype, "getEvents", null);
__decorate([
    (0, common_1.Get)('events/:id'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ManagementMeetingReportController.prototype, "getEvent", null);
__decorate([
    (0, common_1.Post)('events'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ManagementMeetingReportController.prototype, "createEvent", null);
__decorate([
    (0, common_1.Put)('events/:id'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], ManagementMeetingReportController.prototype, "updateEvent", null);
__decorate([
    (0, common_1.Post)('events/:id/status'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], ManagementMeetingReportController.prototype, "updateEventStatus", null);
__decorate([
    (0, common_1.Get)('events/:id/submission-status'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ManagementMeetingReportController.prototype, "getSubmissionStatus", null);
__decorate([
    (0, common_1.Get)('submissions/:eventId/:deptId'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Param)('eventId')),
    __param(2, (0, common_1.Param)('deptId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ManagementMeetingReportController.prototype, "getSubmission", null);
__decorate([
    (0, common_1.Post)('submissions'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ManagementMeetingReportController.prototype, "saveSubmission", null);
__decorate([
    (0, common_1.Post)('submissions/:id/submit'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ManagementMeetingReportController.prototype, "submitSubmission", null);
__decorate([
    (0, common_1.Get)('events/:id/kpi-cards'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('departmentStableId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ManagementMeetingReportController.prototype, "getKpiCards", null);
__decorate([
    (0, common_1.Get)('events/:id/submission-tracking'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ManagementMeetingReportController.prototype, "getSubmissionTracking", null);
__decorate([
    (0, common_1.Post)('events/:id/remind'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], ManagementMeetingReportController.prototype, "remindSubmission", null);
__decorate([
    (0, common_1.Post)('events/:id/close'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], ManagementMeetingReportController.prototype, "closeEvent", null);
__decorate([
    (0, common_1.Get)('events/:id/minutes'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ManagementMeetingReportController.prototype, "getMinutes", null);
__decorate([
    (0, common_1.Post)('events/:id/minutes'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], ManagementMeetingReportController.prototype, "saveMinutes", null);
exports.ManagementMeetingReportController = ManagementMeetingReportController = __decorate([
    (0, common_1.Controller)('bff/meetings'),
    __metadata("design:paramtypes", [management_meeting_report_service_1.ManagementMeetingReportService])
], ManagementMeetingReportController);
//# sourceMappingURL=management-meeting-report.controller.js.map