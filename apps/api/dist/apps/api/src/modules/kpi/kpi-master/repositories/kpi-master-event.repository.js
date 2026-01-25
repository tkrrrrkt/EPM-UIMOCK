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
exports.KpiMasterEventRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../prisma/prisma.service");
const kpi_1 = require("../../../../../../../packages/contracts/src/shared/enums/kpi");
let KpiMasterEventRepository = class KpiMasterEventRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(tenantId, filters) {
        await this.prisma.setTenantContext(tenantId);
        const where = {
            tenant_id: tenantId,
            is_active: true,
        };
        if (filters.keyword) {
            where.OR = [
                { event_code: { contains: filters.keyword, mode: 'insensitive' } },
                { event_name: { contains: filters.keyword, mode: 'insensitive' } },
            ];
        }
        if (filters.fiscalYear !== undefined) {
            where.fiscal_year = filters.fiscalYear;
        }
        if (filters.status) {
            where.status = filters.status;
        }
        const orderBy = {};
        const sortBy = filters.sortBy || 'event_code';
        const sortOrder = filters.sortOrder || 'asc';
        const sortByMap = {
            event_code: 'event_code',
            event_name: 'event_name',
            fiscal_year: 'fiscal_year',
            created_at: 'created_at',
        };
        orderBy[sortByMap[sortBy] || 'event_code'] = sortOrder;
        const [data, total] = await Promise.all([
            this.prisma.kpi_master_events.findMany({
                where,
                orderBy,
                skip: filters.offset,
                take: filters.limit,
            }),
            this.prisma.kpi_master_events.count({ where }),
        ]);
        return {
            data: data.map((event) => this.mapToApiDto(event)),
            total,
        };
    }
    async findById(tenantId, id) {
        await this.prisma.setTenantContext(tenantId);
        const event = await this.prisma.kpi_master_events.findFirst({
            where: {
                tenant_id: tenantId,
                id,
                is_active: true,
            },
        });
        return event ? this.mapToApiDto(event) : null;
    }
    async findByEventCode(tenantId, companyId, eventCode) {
        await this.prisma.setTenantContext(tenantId);
        const event = await this.prisma.kpi_master_events.findFirst({
            where: {
                tenant_id: tenantId,
                company_id: companyId,
                event_code: eventCode,
                is_active: true,
            },
        });
        return event ? this.mapToApiDto(event) : null;
    }
    async create(tenantId, data, userId) {
        await this.prisma.setTenantContext(tenantId);
        const event = await this.prisma.kpi_master_events.create({
            data: {
                tenant_id: tenantId,
                company_id: data.companyId,
                event_code: data.eventCode,
                event_name: data.eventName,
                fiscal_year: data.fiscalYear,
                status: kpi_1.KpiMasterEventStatus.DRAFT,
                is_active: true,
                created_by: userId,
                updated_by: userId,
            },
        });
        return this.mapToApiDto(event);
    }
    async update(tenantId, id, data, userId) {
        await this.prisma.setTenantContext(tenantId);
        const existing = await this.prisma.kpi_master_events.findFirst({
            where: {
                tenant_id: tenantId,
                id,
                is_active: true,
            },
        });
        if (!existing) {
            return null;
        }
        const event = await this.prisma.kpi_master_events.update({
            where: { id },
            data: {
                ...(data.companyId && { company_id: data.companyId }),
                ...(data.eventCode && { event_code: data.eventCode }),
                ...(data.eventName && { event_name: data.eventName }),
                ...(data.fiscalYear && { fiscal_year: data.fiscalYear }),
                ...(data.status && { status: data.status }),
                updated_by: userId,
            },
        });
        return this.mapToApiDto(event);
    }
    mapToApiDto(event) {
        return {
            id: event.id,
            companyId: event.company_id,
            eventCode: event.event_code,
            eventName: event.event_name,
            fiscalYear: event.fiscal_year,
            status: event.status,
            isActive: event.is_active,
            createdAt: event.created_at.toISOString(),
            updatedAt: event.updated_at.toISOString(),
            createdBy: event.created_by || undefined,
            updatedBy: event.updated_by || undefined,
        };
    }
};
exports.KpiMasterEventRepository = KpiMasterEventRepository;
exports.KpiMasterEventRepository = KpiMasterEventRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], KpiMasterEventRepository);
//# sourceMappingURL=kpi-master-event.repository.js.map