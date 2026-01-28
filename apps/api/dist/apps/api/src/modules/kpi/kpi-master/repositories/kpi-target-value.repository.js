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
exports.KpiTargetValueRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../prisma/prisma.service");
let KpiTargetValueRepository = class KpiTargetValueRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByItemId(tenantId, kpiMasterItemId) {
        await this.prisma.setTenantContext(tenantId);
        const targetValues = await this.prisma.kpi_target_values.findMany({
            where: {
                tenant_id: tenantId,
                kpi_master_item_id: kpiMasterItemId,
            },
            orderBy: [{ period_code: 'asc' }],
        });
        return targetValues.map((tv) => this.mapToApiDto(tv));
    }
    async findByPeriod(tenantId, kpiMasterItemId, periodCode) {
        await this.prisma.setTenantContext(tenantId);
        const targetValue = await this.prisma.kpi_target_values.findFirst({
            where: {
                tenant_id: tenantId,
                kpi_master_item_id: kpiMasterItemId,
                period_code: periodCode,
            },
        });
        return targetValue ? this.mapToApiDto(targetValue) : null;
    }
    async create(tenantId, data) {
        await this.prisma.setTenantContext(tenantId);
        const targetValue = await this.prisma.kpi_target_values.create({
            data: {
                tenant_id: tenantId,
                kpi_master_item_id: data.kpi_master_item_id,
                period_code: data.period_code,
                target_value: data.target_value,
            },
        });
        return this.mapToApiDto(targetValue);
    }
    async update(tenantId, id, data) {
        await this.prisma.setTenantContext(tenantId);
        const targetValue = await this.prisma.kpi_target_values.update({
            where: {
                tenant_id: tenantId,
                id,
            },
            data: {
                target_value: data.target_value,
            },
        });
        return this.mapToApiDto(targetValue);
    }
    mapToApiDto(targetValue) {
        return {
            id: targetValue.id,
            tenant_id: targetValue.tenant_id,
            kpi_master_item_id: targetValue.kpi_master_item_id,
            period_code: targetValue.period_code,
            target_value: parseFloat(targetValue.target_value.toString()),
            created_at: targetValue.created_at.toISOString(),
            updated_at: targetValue.updated_at.toISOString(),
        };
    }
};
exports.KpiTargetValueRepository = KpiTargetValueRepository;
exports.KpiTargetValueRepository = KpiTargetValueRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], KpiTargetValueRepository);
//# sourceMappingURL=kpi-target-value.repository.js.map