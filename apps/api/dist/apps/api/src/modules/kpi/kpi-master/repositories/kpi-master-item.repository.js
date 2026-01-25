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
    async findAll(tenantId, filters) {
        await this.prisma.setTenantContext(tenantId);
        const where = {
            tenant_id: tenantId,
            is_active: true,
        };
        if (filters.eventId) {
            where.kpi_event_id = filters.eventId;
        }
        if (filters.parentKpiItemId !== undefined) {
            where.parent_kpi_item_id = filters.parentKpiItemId || null;
        }
        if (filters.kpiType) {
            where.kpi_type = filters.kpiType;
        }
        if (filters.hierarchyLevel !== undefined) {
            where.hierarchy_level = filters.hierarchyLevel;
        }
        if (filters.keyword) {
            where.OR = [
                { kpi_code: { contains: filters.keyword, mode: 'insensitive' } },
                { kpi_name: { contains: filters.keyword, mode: 'insensitive' } },
            ];
        }
        const orderBy = {};
        const sortBy = filters.sortBy || 'sort_order';
        const sortOrder = filters.sortOrder || 'asc';
        const sortByMap = {
            kpi_code: 'kpi_code',
            kpi_name: 'kpi_name',
            sort_order: 'sort_order',
            created_at: 'created_at',
        };
        orderBy[sortByMap[sortBy] || 'sort_order'] = sortOrder;
        const [data, total] = await Promise.all([
            this.prisma.kpi_master_items.findMany({
                where,
                orderBy,
                skip: filters.offset,
                take: filters.limit,
            }),
            this.prisma.kpi_master_items.count({ where }),
        ]);
        return {
            data: data.map((item) => this.mapToApiDto(item)),
            total,
        };
    }
    async findById(tenantId, id) {
        await this.prisma.setTenantContext(tenantId);
        const item = await this.prisma.kpi_master_items.findFirst({
            where: {
                tenant_id: tenantId,
                id,
                is_active: true,
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
            orderBy: {
                sort_order: 'asc',
            },
        });
        return items.map((item) => this.mapToApiDto(item));
    }
    async create(tenantId, data) {
        await this.prisma.setTenantContext(tenantId);
        const item = await this.prisma.kpi_master_items.create({
            data: {
                tenant_id: tenantId,
                kpi_event_id: data.kpiEventId,
                parent_kpi_item_id: data.parentKpiItemId,
                kpi_code: data.kpiCode,
                kpi_name: data.kpiName,
                kpi_type: data.kpiType,
                hierarchy_level: data.hierarchyLevel,
                ref_subject_id: data.refSubjectId,
                ref_kpi_definition_id: data.refKpiDefinitionId,
                ref_metric_id: data.refMetricId,
                department_stable_id: data.departmentStableId,
                owner_employee_id: data.ownerEmployeeId,
                sort_order: data.sortOrder ?? 1,
                is_active: true,
            },
        });
        return this.mapToApiDto(item);
    }
    async update(tenantId, id, data) {
        await this.prisma.setTenantContext(tenantId);
        const existing = await this.prisma.kpi_master_items.findFirst({
            where: {
                tenant_id: tenantId,
                id,
                is_active: true,
            },
        });
        if (!existing) {
            return null;
        }
        const item = await this.prisma.kpi_master_items.update({
            where: { id },
            data: {
                ...(data.kpiName && { kpi_name: data.kpiName }),
                ...(data.departmentStableId !== undefined && {
                    department_stable_id: data.departmentStableId,
                }),
                ...(data.ownerEmployeeId !== undefined && {
                    owner_employee_id: data.ownerEmployeeId,
                }),
                ...(data.sortOrder !== undefined && { sort_order: data.sortOrder }),
            },
        });
        return this.mapToApiDto(item);
    }
    async delete(tenantId, id) {
        await this.prisma.setTenantContext(tenantId);
        const existing = await this.prisma.kpi_master_items.findFirst({
            where: {
                tenant_id: tenantId,
                id,
                is_active: true,
            },
        });
        if (!existing) {
            return false;
        }
        await this.prisma.kpi_master_items.update({
            where: { id },
            data: {
                is_active: false,
            },
        });
        return true;
    }
    mapToApiDto(item) {
        return {
            id: item.id,
            kpiEventId: item.kpi_event_id,
            parentKpiItemId: item.parent_kpi_item_id || undefined,
            kpiCode: item.kpi_code,
            kpiName: item.kpi_name,
            kpiType: item.kpi_type,
            hierarchyLevel: item.hierarchy_level,
            refSubjectId: item.ref_subject_id || undefined,
            refKpiDefinitionId: item.ref_kpi_definition_id || undefined,
            refMetricId: item.ref_metric_id || undefined,
            departmentStableId: item.department_stable_id || undefined,
            ownerEmployeeId: item.owner_employee_id || undefined,
            sortOrder: item.sort_order,
            isActive: item.is_active,
            createdAt: item.created_at.toISOString(),
            updatedAt: item.updated_at.toISOString(),
        };
    }
};
exports.KpiMasterItemRepository = KpiMasterItemRepository;
exports.KpiMasterItemRepository = KpiMasterItemRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], KpiMasterItemRepository);
//# sourceMappingURL=kpi-master-item.repository.js.map