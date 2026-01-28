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
exports.KpiMasterItemRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../prisma/prisma.service");
let KpiMasterItemRepository = class KpiMasterItemRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(tenantId, query) {
        await this.prisma.setTenantContext(tenantId);
        const { event_id, department_stable_ids, kpi_type, hierarchy_level, } = query;
        const where = {
            tenant_id: tenantId,
            kpi_event_id: event_id,
            is_active: true,
        };
        if (department_stable_ids && department_stable_ids.length > 0) {
            where.department_stable_id = { in: department_stable_ids };
        }
        if (kpi_type) {
            where.kpi_type = kpi_type;
        }
        if (hierarchy_level !== undefined) {
            where.hierarchy_level = hierarchy_level;
        }
        const items = await this.prisma.kpi_master_items.findMany({
            where,
            include: {
                kpi_master_events: {
                    select: { company_id: true },
                },
            },
            orderBy: [{ hierarchy_level: 'asc' }, { sort_order: 'asc' }],
        });
        return items.map((item) => this.mapToApiDto(item));
    }
    async findById(tenantId, id) {
        await this.prisma.setTenantContext(tenantId);
        const item = await this.prisma.kpi_master_items.findFirst({
            where: {
                tenant_id: tenantId,
                id,
                is_active: true,
            },
            include: {
                kpi_master_events: {
                    select: { company_id: true },
                },
            },
        });
        return item ? this.mapToApiDto(item) : null;
    }
    async findByEventId(tenantId, eventId) {
        await this.prisma.setTenantContext(tenantId);
        const items = await this.prisma.kpi_master_items.findMany({
            where: {
                tenant_id: tenantId,
                kpi_event_id: eventId,
                is_active: true,
            },
            include: {
                kpi_master_events: {
                    select: { company_id: true },
                },
            },
            orderBy: [{ hierarchy_level: 'asc' }, { sort_order: 'asc' }],
        });
        return items.map((item) => this.mapToApiDto(item));
    }
    async findByKpiCode(tenantId, eventId, kpiCode) {
        await this.prisma.setTenantContext(tenantId);
        const item = await this.prisma.kpi_master_items.findFirst({
            where: {
                tenant_id: tenantId,
                kpi_event_id: eventId,
                kpi_code: kpiCode,
                is_active: true,
            },
            include: {
                kpi_master_events: {
                    select: { company_id: true },
                },
            },
        });
        return item ? this.mapToApiDto(item) : null;
    }
    async hasChildren(tenantId, parentId) {
        await this.prisma.setTenantContext(tenantId);
        const count = await this.prisma.kpi_master_items.count({
            where: {
                tenant_id: tenantId,
                parent_kpi_item_id: parentId,
                is_active: true,
            },
        });
        return count > 0;
    }
    async create(tenantId, data) {
        await this.prisma.setTenantContext(tenantId);
        const item = await this.prisma.kpi_master_items.create({
            data: {
                tenant_id: tenantId,
                kpi_event_id: data.event_id,
                parent_kpi_item_id: data.parent_kpi_item_id,
                kpi_code: data.kpi_code,
                kpi_name: data.kpi_name,
                kpi_type: data.kpi_type,
                hierarchy_level: data.hierarchy_level,
                ref_subject_id: data.ref_subject_id,
                ref_kpi_definition_id: data.ref_kpi_definition_id,
                ref_metric_id: data.ref_metric_id,
                department_stable_id: data.department_stable_id,
                owner_employee_id: data.owner_employee_id,
                sort_order: data.sort_order ?? 1,
                is_active: true,
            },
            include: {
                kpi_master_events: {
                    select: { company_id: true },
                },
            },
        });
        return this.mapToApiDto(item);
    }
    async update(tenantId, id, data) {
        await this.prisma.setTenantContext(tenantId);
        const item = await this.prisma.kpi_master_items.update({
            where: {
                tenant_id: tenantId,
                id,
            },
            data: {
                kpi_name: data.kpi_name,
                department_stable_id: data.department_stable_id,
                owner_employee_id: data.owner_employee_id,
                sort_order: data.sort_order,
            },
            include: {
                kpi_master_events: {
                    select: { company_id: true },
                },
            },
        });
        return this.mapToApiDto(item);
    }
    async delete(tenantId, id) {
        await this.prisma.setTenantContext(tenantId);
        await this.prisma.kpi_master_items.update({
            where: {
                tenant_id: tenantId,
                id,
            },
            data: {
                is_active: false,
            },
        });
    }
    mapToApiDto(item) {
        return {
            id: item.id,
            tenant_id: item.tenant_id,
            company_id: item.kpi_master_events.company_id,
            event_id: item.kpi_event_id,
            parent_kpi_item_id: item.parent_kpi_item_id,
            kpi_code: item.kpi_code,
            kpi_name: item.kpi_name,
            kpi_type: item.kpi_type,
            hierarchy_level: item.hierarchy_level,
            ref_subject_id: item.ref_subject_id,
            ref_kpi_definition_id: item.ref_kpi_definition_id,
            ref_metric_id: item.ref_metric_id,
            department_stable_id: item.department_stable_id,
            owner_employee_id: item.owner_employee_id,
            sort_order: item.sort_order,
            is_active: item.is_active,
            created_at: item.created_at.toISOString(),
            updated_at: item.updated_at.toISOString(),
        };
    }
};
exports.KpiMasterItemRepository = KpiMasterItemRepository;
exports.KpiMasterItemRepository = KpiMasterItemRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], KpiMasterItemRepository);
//# sourceMappingURL=kpi-master-item.repository.js.map