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
let KpiFactAmountRepository = class KpiFactAmountRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByItemId(tenantId, kpiDefinitionId, eventId, departmentStableId) {
        await this.prisma.setTenantContext(tenantId);
        const where = {
            tenant_id: tenantId,
            kpi_definition_id: kpiDefinitionId,
            kpi_event_id: eventId,
        };
        if (departmentStableId) {
            where.department_stable_id = departmentStableId;
        }
        const factAmounts = await this.prisma.kpi_fact_amounts.findMany({
            where,
            orderBy: [{ period_start_date: 'asc' }],
        });
        return factAmounts.map((fa) => this.mapToApiDto(fa));
    }
    async findByPeriod(tenantId, eventId, kpiDefinitionId, periodCode, departmentStableId) {
        await this.prisma.setTenantContext(tenantId);
        const where = {
            tenant_id: tenantId,
            kpi_event_id: eventId,
            kpi_definition_id: kpiDefinitionId,
            period_code: periodCode,
        };
        if (departmentStableId) {
            where.department_stable_id = departmentStableId;
        }
        else {
            where.department_stable_id = null;
        }
        const factAmount = await this.prisma.kpi_fact_amounts.findFirst({
            where,
        });
        return factAmount ? this.mapToApiDto(factAmount) : null;
    }
    async create(tenantId, data) {
        await this.prisma.setTenantContext(tenantId);
        const factAmount = await this.prisma.kpi_fact_amounts.create({
            data: {
                tenant_id: tenantId,
                company_id: data.company_id,
                kpi_event_id: data.event_id,
                kpi_definition_id: data.kpi_definition_id,
                period_code: data.period_code,
                period_start_date: data.period_start_date
                    ? new Date(data.period_start_date)
                    : null,
                period_end_date: data.period_end_date
                    ? new Date(data.period_end_date)
                    : null,
                target_value: data.target_value,
                actual_value: data.actual_value,
                department_stable_id: data.department_stable_id,
                notes: data.notes,
                created_by: data.created_by,
                updated_by: data.created_by,
            },
        });
        return this.mapToApiDto(factAmount);
    }
    async update(tenantId, id, data) {
        await this.prisma.setTenantContext(tenantId);
        const factAmount = await this.prisma.kpi_fact_amounts.update({
            where: {
                tenant_id: tenantId,
                id,
            },
            data: {
                target_value: data.target_value,
                actual_value: data.actual_value,
                notes: data.notes,
                updated_by: data.updated_by,
            },
        });
        return this.mapToApiDto(factAmount);
    }
    mapToApiDto(factAmount) {
        return {
            id: factAmount.id,
            tenant_id: factAmount.tenant_id,
            company_id: factAmount.company_id,
            event_id: factAmount.kpi_event_id,
            kpi_definition_id: factAmount.kpi_definition_id,
            period_code: factAmount.period_code,
            period_start_date: factAmount.period_start_date
                ? factAmount.period_start_date.toISOString().split('T')[0]
                : undefined,
            period_end_date: factAmount.period_end_date
                ? factAmount.period_end_date.toISOString().split('T')[0]
                : undefined,
            target_value: factAmount.target_value
                ? parseFloat(factAmount.target_value.toString())
                : undefined,
            actual_value: factAmount.actual_value
                ? parseFloat(factAmount.actual_value.toString())
                : undefined,
            department_stable_id: factAmount.department_stable_id,
            notes: factAmount.notes,
            created_at: factAmount.created_at.toISOString(),
            updated_at: factAmount.updated_at.toISOString(),
            created_by: factAmount.created_by,
            updated_by: factAmount.updated_by,
        };
    }
};
exports.KpiFactAmountRepository = KpiFactAmountRepository;
exports.KpiFactAmountRepository = KpiFactAmountRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], KpiFactAmountRepository);
//# sourceMappingURL=kpi-fact-amount.repository.js.map