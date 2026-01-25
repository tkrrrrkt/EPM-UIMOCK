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
Object.defineProperty(exports, "__esModule", { value: true });
exports.KpiMasterEventService = void 0;
const common_1 = require("@nestjs/common");
const kpi_master_event_repository_1 = require("../repositories/kpi-master-event.repository");
const kpi_1 = require("../../../../../../../packages/contracts/src/shared/enums/kpi");
const errors_1 = require("../../../../../../../packages/contracts/src/shared/errors");
let KpiMasterEventService = class KpiMasterEventService {
    constructor(eventRepository) {
        this.eventRepository = eventRepository;
    }
    async findAll(tenantId, filters) {
        return this.eventRepository.findAll(tenantId, filters);
    }
    async findById(tenantId, id) {
        const event = await this.eventRepository.findById(tenantId, id);
        if (!event) {
            throw new errors_1.KpiMasterEventNotFoundError(`KPI event not found: ${id}`);
        }
        return event;
    }
    async create(tenantId, data, userId) {
        const existing = await this.eventRepository.findByEventCode(tenantId, data.companyId, data.eventCode);
        if (existing) {
            throw new errors_1.KpiMasterEventDuplicateError(`Event code already exists: ${data.eventCode} in company ${data.companyId}`);
        }
        const event = await this.eventRepository.create(tenantId, data, userId);
        return event;
    }
    async update(tenantId, id, data, userId) {
        const existing = await this.eventRepository.findById(tenantId, id);
        if (!existing) {
            throw new errors_1.KpiMasterEventNotFoundError(`KPI event not found: ${id}`);
        }
        if (data.eventCode && data.eventCode !== existing.eventCode) {
            const duplicate = await this.eventRepository.findByEventCode(tenantId, data.companyId || existing.companyId, data.eventCode);
            if (duplicate && duplicate.id !== id) {
                throw new errors_1.KpiMasterEventDuplicateError(`Event code already exists: ${data.eventCode}`);
            }
        }
        const updated = await this.eventRepository.update(tenantId, id, data, userId);
        return updated;
    }
    async confirm(tenantId, id, userId) {
        const existing = await this.eventRepository.findById(tenantId, id);
        if (!existing) {
            throw new errors_1.KpiMasterEventNotFoundError(`KPI event not found: ${id}`);
        }
        if (existing.status !== kpi_1.KpiMasterEventStatus.DRAFT) {
            throw new errors_1.KpiMasterEventAlreadyConfirmedError(`Cannot confirm event in ${existing.status} status. Only DRAFT events can be confirmed.`);
        }
        const updated = await this.eventRepository.update(tenantId, id, { status: kpi_1.KpiMasterEventStatus.CONFIRMED }, userId);
        return updated;
    }
};
exports.KpiMasterEventService = KpiMasterEventService;
exports.KpiMasterEventService = KpiMasterEventService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [kpi_master_event_repository_1.KpiMasterEventRepository])
], KpiMasterEventService);
//# sourceMappingURL=kpi-master-event.service.js.map