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
const library_1 = require("@prisma/client/runtime/library");
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
            orderBy: {
                period_code: 'asc',
            },
        });
        return targetValues.map((target) => this.mapToApiDto(target));
    }
    async findById(tenantId, id) {
        await this.prisma.setTenantContext(tenantId);
        const targetValue = await this.prisma.kpi_target_values.findFirst({
            where: {
                tenant_id: tenantId,
                id,
            },
        });
        return targetValue ? this.mapToApiDto(targetValue) : null;
    }
    async create(tenantId, data) {
        await this.prisma.setTenantContext(tenantId);
        const targetValue = await this.prisma.kpi_target_values.create({
            data: {
                tenant_id: tenantId,
                kpi_master_item_id: data.kpiMasterItemId,
                period_code: data.periodCode,
                target_value: new library_1.Decimal(data.targetValue),
            },
        });
        return this.mapToApiDto(targetValue);
    }
    async update(tenantId, id, data) {
        await this.prisma.setTenantContext(tenantId);
        const existing = await this.prisma.kpi_target_values.findFirst({
            where: {
                tenant_id: tenantId,
                id,
            },
        });
        if (!existing) {
            return null;
        }
        const targetValue = await this.prisma.kpi_target_values.update({
            where: { id },
            data: {
                ...(data.periodCode && { period_code: data.periodCode }),
                ...(data.targetValue !== undefined && { target_value: new library_1.Decimal(data.targetValue) }),
            },
        });
        return this.mapToApiDto(targetValue);
    }
    mapToApiDto(target) {
        return {
            id: target.id,
            kpiMasterItemId: target.kpi_master_item_id,
            periodCode: target.period_code,
            targetValue: parseFloat(target.target_value.toString()),
            createdAt: target.created_at.toISOString(),
            updatedAt: target.updated_at.toISOString(),
        };
    }
};
exports.KpiTargetValueRepository = KpiTargetValueRepository;
exports.KpiTargetValueRepository = KpiTargetValueRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], KpiTargetValueRepository);
//# sourceMappingURL=kpi-target-value.repository.js.map