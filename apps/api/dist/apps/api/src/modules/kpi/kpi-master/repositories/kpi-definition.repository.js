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
    async findAll(tenantId, filters) {
        await this.prisma.setTenantContext(tenantId);
        const where = {
            tenant_id: tenantId,
            is_active: true,
        };
        if (filters.companyId) {
            where.company_id = filters.companyId;
        }
        if (filters.keyword) {
            where.OR = [
                { kpi_code: { contains: filters.keyword, mode: 'insensitive' } },
                { kpi_name: { contains: filters.keyword, mode: 'insensitive' } },
            ];
        }
        const orderBy = {};
        const sortBy = filters.sortBy || 'kpi_code';
        const sortOrder = filters.sortOrder || 'asc';
        const sortByMap = {
            kpi_code: 'kpi_code',
            kpi_name: 'kpi_name',
            created_at: 'created_at',
        };
        orderBy[sortByMap[sortBy] || 'kpi_code'] = sortOrder;
        const [data, total] = await Promise.all([
            this.prisma.kpi_definitions.findMany({
                where,
                orderBy,
                skip: filters.offset,
                take: filters.limit,
            }),
            this.prisma.kpi_definitions.count({ where }),
        ]);
        return {
            data: data.map((definition) => this.mapToApiDto(definition)),
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
    async findByCode(tenantId, companyId, kpiCode) {
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
    async create(tenantId, data, userId) {
        await this.prisma.setTenantContext(tenantId);
        const definition = await this.prisma.kpi_definitions.create({
            data: {
                tenant_id: tenantId,
                company_id: data.companyId,
                kpi_code: data.kpiCode,
                kpi_name: data.kpiName,
                description: data.description,
                unit: data.unit,
                aggregation_method: data.aggregationMethod,
                direction: data.direction,
                is_active: true,
                created_by: userId,
                updated_by: userId,
            },
        });
        return this.mapToApiDto(definition);
    }
    mapToApiDto(definition) {
        return {
            id: definition.id,
            companyId: definition.company_id,
            kpiCode: definition.kpi_code,
            kpiName: definition.kpi_name,
            description: definition.description || undefined,
            unit: definition.unit || undefined,
            aggregationMethod: definition.aggregation_method,
            direction: definition.direction || undefined,
            isActive: definition.is_active,
            createdAt: definition.created_at.toISOString(),
            updatedAt: definition.updated_at.toISOString(),
            createdBy: definition.created_by || undefined,
            updatedBy: definition.updated_by || undefined,
        };
    }
};
exports.KpiDefinitionRepository = KpiDefinitionRepository;
exports.KpiDefinitionRepository = KpiDefinitionRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], KpiDefinitionRepository);
//# sourceMappingURL=kpi-definition.repository.js.map