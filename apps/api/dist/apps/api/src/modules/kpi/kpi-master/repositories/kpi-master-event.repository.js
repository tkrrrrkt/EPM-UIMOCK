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
let KpiMasterEventRepository = class KpiMasterEventRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(tenantId, query) {
        await this.prisma.setTenantContext(tenantId);
        const { company_id, offset = 0, limit = 50, sort_by = 'created_at', sort_order = 'desc', keyword, fiscal_year, status, } = query;
        const where = {
            tenant_id: tenantId,
            company_id,
            is_active: true,
        };
        if (keyword) {
            where.OR = [
                { event_code: { contains: keyword, mode: 'insensitive' } },
                { event_name: { contains: keyword, mode: 'insensitive' } },
            ];
        }
        if (fiscal_year !== undefined) {
            where.fiscal_year = fiscal_year;
        }
        if (status) {
            where.status = status;
        }
        const total = await this.prisma.kpi_master_events.count({ where });
        const orderBy = {};
        orderBy[sort_by] = sort_order;
        const events = await this.prisma.kpi_master_events.findMany({
            where,
            orderBy,
            skip: offset,
            take: limit,
        });
        return {
            items: events.map((e) => this.mapToApiDto(e)),
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
    async create(tenantId, data) {
        await this.prisma.setTenantContext(tenantId);
        const event = await this.prisma.kpi_master_events.create({
            data: {
                tenant_id: tenantId,
                company_id: data.company_id,
                event_code: data.event_code,
                event_name: data.event_name,
                fiscal_year: data.fiscal_year,
                status: 'DRAFT',
                is_active: true,
                created_by: data.created_by,
                updated_by: data.created_by,
            },
        });
        return this.mapToApiDto(event);
    }
    async update(tenantId, id, data) {
        await this.prisma.setTenantContext(tenantId);
        const event = await this.prisma.kpi_master_events.update({
            where: {
                tenant_id: tenantId,
                id,
            },
            data: {
                event_name: data.event_name,
                status: data.status,
                updated_by: data.updated_by,
            },
        });
        return this.mapToApiDto(event);
    }
    mapToApiDto(event) {
        return {
            id: event.id,
            tenant_id: event.tenant_id,
            company_id: event.company_id,
            event_code: event.event_code,
            event_name: event.event_name,
            fiscal_year: event.fiscal_year,
            status: event.status,
            is_active: event.is_active,
            created_at: event.created_at.toISOString(),
            updated_at: event.updated_at.toISOString(),
            created_by: event.created_by,
            updated_by: event.updated_by,
        };
    }
};
exports.KpiMasterEventRepository = KpiMasterEventRepository;
exports.KpiMasterEventRepository = KpiMasterEventRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], KpiMasterEventRepository);
//# sourceMappingURL=kpi-master-event.repository.js.map