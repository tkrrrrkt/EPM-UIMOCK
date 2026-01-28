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
const errors_1 = require("../../../../../../../packages/contracts/src/shared/errors");
let KpiMasterItemService = class KpiMasterItemService {
    constructor(kpiMasterItemRepository, kpiMasterEventRepository) {
        this.kpiMasterItemRepository = kpiMasterItemRepository;
        this.kpiMasterEventRepository = kpiMasterEventRepository;
    }
    async findAllItems(tenantId, query, userContext) {
        const items = await this.kpiMasterItemRepository.findAll(tenantId, query);
        return items.filter((item) => this.checkReadPermission(item, userContext));
    }
    async findItemById(tenantId, id, userContext) {
        const item = await this.kpiMasterItemRepository.findById(tenantId, id);
        if (!item) {
            throw new errors_1.KpiMasterItemNotFoundError(`KPI Master Item not found: ${id}`);
        }
        if (!this.checkReadPermission(item, userContext)) {
            throw new errors_1.KpiMasterItemAccessDeniedError(`Access denied to KPI item: ${id}`);
        }
        return item;
    }
    async createItem(tenantId, userId, data) {
        const existingItem = await this.kpiMasterItemRepository.findByKpiCode(tenantId, data.event_id, data.kpi_code);
        if (existingItem) {
            throw new errors_1.KpiMasterItemInvalidReferenceError(`KPI code already exists: ${data.kpi_code}`);
        }
        this.validateKpiTypeReferences(data);
        const item = await this.kpiMasterItemRepository.create(tenantId, {
            tenant_id: tenantId,
            company_id: data.company_id,
            event_id: data.event_id,
            kpi_code: data.kpi_code,
            kpi_name: data.kpi_name,
            kpi_type: data.kpi_type,
            hierarchy_level: data.hierarchy_level,
            parent_kpi_item_id: data.parent_kpi_item_id,
            ref_subject_id: data.ref_subject_id,
            ref_kpi_definition_id: data.ref_kpi_definition_id,
            ref_metric_id: data.ref_metric_id,
            department_stable_id: data.department_stable_id,
            owner_employee_id: data.owner_employee_id,
            unit: data.unit,
            sort_order: data.sort_order,
            created_by: userId,
        });
        return item;
    }
    async updateItem(tenantId, id, userId, data, userContext) {
        const item = await this.kpiMasterItemRepository.findById(tenantId, id);
        if (!item) {
            throw new errors_1.KpiMasterItemNotFoundError(`KPI Master Item not found: ${id}`);
        }
        if (!this.checkWritePermission(item, userContext)) {
            throw new errors_1.KpiMasterItemAccessDeniedError(`Write access denied to KPI item: ${id}`);
        }
        const updatedItem = await this.kpiMasterItemRepository.update(tenantId, id, {
            kpi_name: data.kpi_name,
            department_stable_id: data.department_stable_id,
            owner_employee_id: data.owner_employee_id,
            unit: data.unit,
            sort_order: data.sort_order,
            updated_by: userId,
        });
        return updatedItem;
    }
    async deleteItem(tenantId, id, userId, userContext) {
        const item = await this.kpiMasterItemRepository.findById(tenantId, id);
        if (!item) {
            throw new errors_1.KpiMasterItemNotFoundError(`KPI Master Item not found: ${id}`);
        }
        if (!this.checkWritePermission(item, userContext)) {
            throw new errors_1.KpiMasterItemAccessDeniedError(`Write access denied to KPI item: ${id}`);
        }
        const event = await this.kpiMasterEventRepository.findById(tenantId, item.event_id);
        if (event && event.status === 'CONFIRMED') {
            throw new errors_1.KpiMasterItemDeleteForbiddenError(`Cannot delete KPI item in confirmed event: ${id}`);
        }
        const hasChildren = await this.kpiMasterItemRepository.hasChildren(tenantId, id);
        if (hasChildren) {
            throw new errors_1.KpiMasterItemDeleteForbiddenError(`Cannot delete KPI item with children: ${id}`);
        }
        await this.kpiMasterItemRepository.delete(tenantId, id);
    }
    validateKpiTypeReferences(data) {
        const { kpi_type, ref_subject_id, ref_kpi_definition_id, ref_metric_id } = data;
        if (kpi_type === 'FINANCIAL') {
            if (!ref_subject_id || ref_kpi_definition_id || ref_metric_id) {
                throw new errors_1.KpiMasterItemInvalidReferenceError('FINANCIAL type requires ref_subject_id only');
            }
        }
        else if (kpi_type === 'NON_FINANCIAL') {
            if (!ref_kpi_definition_id || ref_subject_id || ref_metric_id) {
                throw new errors_1.KpiMasterItemInvalidReferenceError('NON_FINANCIAL type requires ref_kpi_definition_id only');
            }
        }
        else if (kpi_type === 'METRIC') {
            if (!ref_metric_id || ref_subject_id || ref_kpi_definition_id) {
                throw new errors_1.KpiMasterItemInvalidReferenceError('METRIC type requires ref_metric_id only');
            }
        }
    }
    checkReadPermission(item, userContext) {
        if (userContext.permissions.includes('epm.kpi.admin')) {
            return true;
        }
        if (!item.department_stable_id) {
            return true;
        }
        return userContext.controlDepartmentStableIds.includes(item.department_stable_id);
    }
    checkWritePermission(item, userContext) {
        if (!this.checkReadPermission(item, userContext)) {
            return false;
        }
        return (userContext.permissions.includes('epm.kpi.admin') ||
            userContext.permissions.includes('epm.kpi.write'));
    }
};
exports.KpiMasterItemService = KpiMasterItemService;
exports.KpiMasterItemService = KpiMasterItemService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [kpi_master_item_repository_1.KpiMasterItemRepository,
        kpi_master_event_repository_1.KpiMasterEventRepository])
], KpiMasterItemService);
//# sourceMappingURL=kpi-master-item.service.js.map