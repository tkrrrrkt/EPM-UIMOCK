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
exports.KpiFactAmountRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../prisma/prisma.service");
const library_1 = require("@prisma/client/runtime/library");
let KpiFactAmountRepository = class KpiFactAmountRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByItemId(tenantId, kpiDefinitionId, eventId) {
        await this.prisma.setTenantContext(tenantId);
        const factAmounts = await this.prisma.kpi_fact_amounts.findMany({
            where: {
                tenant_id: tenantId,
                kpi_definition_id: kpiDefinitionId,
                kpi_event_id: eventId,
            },
            orderBy: {
                period_code: 'asc',
            },
        });
        return factAmounts.map((fact) => this.mapToApiDto(fact));
    }
    async findById(tenantId, id) {
        await this.prisma.setTenantContext(tenantId);
        const factAmount = await this.prisma.kpi_fact_amounts.findFirst({
            where: {
                tenant_id: tenantId,
                id,
            },
        });
        return factAmount ? this.mapToApiDto(factAmount) : null;
    }
    async create(tenantId, data, userId) {
        await this.prisma.setTenantContext(tenantId);
        const factAmount = await this.prisma.kpi_fact_amounts.create({
            data: {
                tenant_id: tenantId,
                company_id: data.companyId,
                kpi_event_id: data.kpiEventId,
                kpi_definition_id: data.kpiDefinitionId,
                period_code: data.periodCode,
                period_start_date: data.periodStartDate ? new Date(data.periodStartDate) : undefined,
                period_end_date: data.periodEndDate ? new Date(data.periodEndDate) : undefined,
                target_value: data.targetValue !== undefined ? new library_1.Decimal(data.targetValue) : undefined,
                actual_value: data.actualValue !== undefined ? new library_1.Decimal(data.actualValue) : undefined,
                department_stable_id: data.departmentStableId,
                notes: data.notes,
                created_by: userId,
                updated_by: userId,
            },
        });
        return this.mapToApiDto(factAmount);
    }
    async update(tenantId, id, data, userId) {
        await this.prisma.setTenantContext(tenantId);
        const existing = await this.prisma.kpi_fact_amounts.findFirst({
            where: {
                tenant_id: tenantId,
                id,
            },
        });
        if (!existing) {
            return null;
        }
        const factAmount = await this.prisma.kpi_fact_amounts.update({
            where: { id },
            data: {
                ...(data.periodStartDate !== undefined && {
                    period_start_date: data.periodStartDate ? new Date(data.periodStartDate) : null,
                }),
                ...(data.periodEndDate !== undefined && {
                    period_end_date: data.periodEndDate ? new Date(data.periodEndDate) : null,
                }),
                ...(data.targetValue !== undefined && {
                    target_value: data.targetValue !== null ? new library_1.Decimal(data.targetValue) : null,
                }),
                ...(data.actualValue !== undefined && {
                    actual_value: data.actualValue !== null ? new library_1.Decimal(data.actualValue) : null,
                }),
                ...(data.departmentStableId !== undefined && {
                    department_stable_id: data.departmentStableId,
                }),
                ...(data.notes !== undefined && { notes: data.notes }),
                updated_by: userId,
            },
        });
        return this.mapToApiDto(factAmount);
    }
    mapToApiDto(fact) {
        return {
            id: fact.id,
            companyId: fact.company_id,
            kpiEventId: fact.kpi_event_id,
            kpiDefinitionId: fact.kpi_definition_id,
            periodCode: fact.period_code,
            periodStartDate: fact.period_start_date?.toISOString(),
            periodEndDate: fact.period_end_date?.toISOString(),
            targetValue: fact.target_value ? parseFloat(fact.target_value.toString()) : undefined,
            actualValue: fact.actual_value ? parseFloat(fact.actual_value.toString()) : undefined,
            departmentStableId: fact.department_stable_id || undefined,
            notes: fact.notes || undefined,
            createdAt: fact.created_at.toISOString(),
            updatedAt: fact.updated_at.toISOString(),
            createdBy: fact.created_by || undefined,
            updatedBy: fact.updated_by || undefined,
        };
    }
};
exports.KpiFactAmountRepository = KpiFactAmountRepository;
exports.KpiFactAmountRepository = KpiFactAmountRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], KpiFactAmountRepository);
//# sourceMappingURL=kpi-fact-amount.repository.js.map