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
exports.KpiMasterItemService = void 0;
const common_1 = require("@nestjs/common");
const kpi_master_item_repository_1 = require("../repositories/kpi-master-item.repository");
const kpi_master_event_repository_1 = require("../repositories/kpi-master-event.repository");
const subject_repository_1 = require("../repositories/subject.repository");
const metric_repository_1 = require("../repositories/metric.repository");
const kpi_1 = require("../../../../../../../packages/contracts/src/shared/enums/kpi");
const kpi_2 = require("../../../../../../../packages/contracts/src/shared/enums/kpi");
const errors_1 = require("../../../../../../../packages/contracts/src/shared/errors");
let KpiMasterItemService = class KpiMasterItemService {
    constructor(itemRepository, eventRepository, subjectRepository, metricRepository) {
        this.itemRepository = itemRepository;
        this.eventRepository = eventRepository;
        this.subjectRepository = subjectRepository;
        this.metricRepository = metricRepository;
    }
    async findAll(tenantId, filters, userPermissions) {
        const result = await this.itemRepository.findAll(tenantId, filters);
        return result;
    }
    async findById(tenantId, id, userPermissions) {
        const item = await this.itemRepository.findById(tenantId, id);
        if (!item) {
            throw new errors_1.KpiMasterItemNotFoundError(`KPI item not found: ${id}`);
        }
        return item;
    }
    async findByEventId(tenantId, eventId) {
        return this.itemRepository.findByEventId(tenantId, eventId);
    }
    async create(tenantId, data, userId) {
        await this.validateTypeReferences(tenantId, data.kpiType, {
            refSubjectId: data.refSubjectId,
            refKpiDefinitionId: data.refKpiDefinitionId,
            refMetricId: data.refMetricId,
        });
        const item = await this.itemRepository.create(tenantId, data);
        return item;
    }
    async update(tenantId, id, data, userId) {
        const existing = await this.itemRepository.findById(tenantId, id);
        if (!existing) {
            throw new errors_1.KpiMasterItemNotFoundError(`KPI item not found: ${id}`);
        }
        const updated = await this.itemRepository.update(tenantId, id, data);
        return updated;
    }
    async delete(tenantId, id, userId) {
        const item = await this.itemRepository.findById(tenantId, id);
        if (!item) {
            throw new errors_1.KpiMasterItemNotFoundError(`KPI item not found: ${id}`);
        }
        const event = await this.eventRepository.findById(tenantId, item.kpiEventId);
        if (event && event.status === kpi_2.KpiMasterEventStatus.CONFIRMED) {
            throw new errors_1.KpiMasterItemDeleteForbiddenError(`Cannot delete KPI item: event is CONFIRMED (${event.eventCode})`);
        }
        await this.itemRepository.delete(tenantId, id);
    }
    async validateTypeReferences(tenantId, kpiType, refs) {
        switch (kpiType) {
            case kpi_1.KpiType.FINANCIAL:
                if (!refs.refSubjectId) {
                    throw new errors_1.KpiMasterItemInvalidReferenceError('FINANCIAL KPI requires refSubjectId');
                }
                const subject = await this.subjectRepository.findById(tenantId, refs.refSubjectId);
                if (!subject) {
                    throw new errors_1.KpiManagedSubjectNotFoundError(`Subject not found: ${refs.refSubjectId}`);
                }
                if (!subject.kpiManaged) {
                    throw new errors_1.KpiManagedSubjectNotFoundError(`Subject kpi_managed=false: ${subject.subjectCode} (${subject.subjectName})`);
                }
                break;
            case kpi_1.KpiType.NON_FINANCIAL:
                if (!refs.refKpiDefinitionId) {
                    throw new errors_1.KpiMasterItemInvalidReferenceError('NON_FINANCIAL KPI requires refKpiDefinitionId');
                }
                break;
            case kpi_1.KpiType.METRIC:
                if (!refs.refMetricId) {
                    throw new errors_1.KpiMasterItemInvalidReferenceError('METRIC KPI requires refMetricId');
                }
                const metric = await this.metricRepository.findById(tenantId, refs.refMetricId);
                if (!metric) {
                    throw new errors_1.KpiManagedMetricNotFoundError(`Metric not found: ${refs.refMetricId}`);
                }
                if (!metric.kpiManaged) {
                    throw new errors_1.KpiManagedMetricNotFoundError(`Metric kpi_managed=false: ${metric.metricCode} (${metric.metricName})`);
                }
                break;
            default:
                throw new errors_1.KpiMasterItemInvalidReferenceError(`Invalid KPI type: ${kpiType}`);
        }
    }
};
exports.KpiMasterItemService = KpiMasterItemService;
exports.KpiMasterItemService = KpiMasterItemService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [kpi_master_item_repository_1.KpiMasterItemRepository,
        kpi_master_event_repository_1.KpiMasterEventRepository,
        subject_repository_1.SubjectRepository,
        metric_repository_1.MetricRepository])
], KpiMasterItemService);
//# sourceMappingURL=kpi-master-item.service.js.map