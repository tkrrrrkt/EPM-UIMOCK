"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManagementMeetingReportModule = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const management_meeting_report_controller_1 = require("./management-meeting-report.controller");
const management_meeting_report_service_1 = require("./management-meeting-report.service");
let ManagementMeetingReportModule = class ManagementMeetingReportModule {
};
exports.ManagementMeetingReportModule = ManagementMeetingReportModule;
exports.ManagementMeetingReportModule = ManagementMeetingReportModule = __decorate([
    (0, common_1.Module)({
        imports: [axios_1.HttpModule],
        controllers: [management_meeting_report_controller_1.ManagementMeetingReportController],
        providers: [management_meeting_report_service_1.ManagementMeetingReportService],
        exports: [management_meeting_report_service_1.ManagementMeetingReportService],
    })
], ManagementMeetingReportModule);
//# sourceMappingURL=management-meeting-report.module.js.map