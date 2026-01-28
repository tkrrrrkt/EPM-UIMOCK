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
exports.KpiDefinitionRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../prisma/prisma.service");
let KpiDefinitionRepository = class KpiDefinitionRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(tenantId, query) {
        await this.prisma.setTenantContext(tenantId);
        const { company_id, offset = 0, limit = 50, sort_by = 'kpi_code', sort_order = 'asc', keyword, } = query;
        const where = {
            tenant_id: tenantId,
            company_id,
            is_active: true,
        };
        if (keyword) {
            where.OR = [
                { kpi_code: { contains: keyword, mode: 'insensitive' } },
                { kpi_name: { contains: keyword, mode: 'insensitive' } },
            ];
        }
        const total = await this.prisma.kpi_definitions.count({ where });
        const orderBy = {};
        orderBy[sort_by] = sort_order;
        const definitions = await this.prisma.kpi_definitions.findMany({
            where,
            orderBy,
            skip: offset,
            take: limit,
        });
        return {
            items: definitions.map((d) => this.mapToApiDto(d)),
            total,
        };
    }
    async findById(tenantId, id) {
        await this.prisma.setTenantContext(tenantId);
        const definition = await this.prisma.kpi_definitions.findFirst({
            where: {
                tenant_id: tenantId,
                id,
                is_active: true,
            },
        });
        return definition ? this.mapToApiDto(definition) : null;
    }
    async findByKpiCode(tenantId, companyId, kpiCode) {
        await this.prisma.setTenantContext(tenantId);
        const definition = await this.prisma.kpi_definitions.findFirst({
            where: {
                tenant_id: tenantId,
                company_id: companyId,
                kpi_code: kpiCode,
                is_active: true,
            },
        });
        return definition ? this.mapToApiDto(definition) : null;
    }
    async create(tenantId, data) {
        await this.prisma.setTenantContext(tenantId);
        const definition = await this.prisma.kpi_definitions.create({
            data: {
                tenant_id: tenantId,
                company_id: data.company_id,
                kpi_code: data.kpi_code,
                kpi_name: data.kpi_name,
                description: data.description,
                unit: data.unit,
                aggregation_method: data.aggregation_method,
                direction: data.direction,
                is_active: true,
                created_by: data.created_by,
                updated_by: data.created_by,
            },
        });
        return this.mapToApiDto(definition);
    }
    mapToApiDto(definition) {
        return {
            id: definition.id,
            tenant_id: definition.tenant_id,
            company_id: definition.company_id,
            kpi_code: definition.kpi_code,
            kpi_name: definition.kpi_name,
            description: definition.description,
            unit: definition.unit,
            aggregation_method: definition.aggregation_method,
            direction: definition.direction,
            is_active: definition.is_active,
            created_at: definition.created_at.toISOString(),
            updated_at: definition.updated_at.toISOString(),
            created_by: definition.created_by,
            updated_by: definition.updated_by,
        };
    }
};
exports.KpiDefinitionRepository = KpiDefinitionRepository;
exports.KpiDefinitionRepository = KpiDefinitionRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], KpiDefinitionRepository);
//# sourceMappingURL=kpi-definition.repository.js.map