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
const errors_1 = require("../../../../../../../packages/contracts/src/shared/errors");
let KpiMasterEventService = class KpiMasterEventService {
    constructor(kpiMasterEventRepository) {
        this.kpiMasterEventRepository = kpiMasterEventRepository;
    }
    async findAllEvents(tenantId, query) {
        return this.kpiMasterEventRepository.findAll(tenantId, query);
    }
    async findEventById(tenantId, id) {
        const event = await this.kpiMasterEventRepository.findById(tenantId, id);
        if (!event) {
            throw new errors_1.KpiMasterEventNotFoundError(`KPI Master Event not found: ${id}`);
        }
        return event;
    }
    async createEvent(tenantId, userId, data) {
        const existingEvent = await this.kpiMasterEventRepository.findByEventCode(tenantId, data.company_id, data.event_code);
        if (existingEvent) {
            throw new errors_1.KpiMasterEventDuplicateError(`Event code already exists: ${data.event_code}`);
        }
        const event = await this.kpiMasterEventRepository.create(tenantId, {
            tenant_id: tenantId,
            company_id: data.company_id,
            event_code: data.event_code,
            event_name: data.event_name,
            fiscal_year: data.fiscal_year,
            created_by: userId,
        });
        return event;
    }
    async confirmEvent(tenantId, id, userId) {
        const event = await this.kpiMasterEventRepository.findById(tenantId, id);
        if (!event) {
            throw new errors_1.KpiMasterEventNotFoundError(`KPI Master Event not found: ${id}`);
        }
        if (event.status === 'CONFIRMED') {
            throw new errors_1.KpiMasterEventAlreadyConfirmedError(`Event already confirmed: ${id}`);
        }
        const updatedEvent = await this.kpiMasterEventRepository.update(tenantId, id, {
            status: 'CONFIRMED',
            updated_by: userId,
        });
        return updatedEvent;
    }
    async updateEvent(tenantId, id, userId, data) {
        const event = await this.kpiMasterEventRepository.findById(tenantId, id);
        if (!event) {
            throw new errors_1.KpiMasterEventNotFoundError(`KPI Master Event not found: ${id}`);
        }
        const updatedEvent = await this.kpiMasterEventRepository.update(tenantId, id, {
            event_name: data.event_name,
            updated_by: userId,
        });
        return updatedEvent;
    }
};
exports.KpiMasterEventService = KpiMasterEventService;
exports.KpiMasterEventService = KpiMasterEventService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [kpi_master_event_repository_1.KpiMasterEventRepository])
], KpiMasterEventService);
//# sourceMappingURL=kpi-master-event.service.js.map