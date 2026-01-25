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
exports.MetricRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../prisma/prisma.service");
let MetricRepository = class MetricRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(tenantId, id) {
        await this.prisma.setTenantContext(tenantId);
        const metric = await this.prisma.metrics.findFirst({
            where: {
                tenant_id: tenantId,
                id,
                is_active: true,
            },
            select: {
                id: true,
                metric_code: true,
                metric_name: true,
                kpi_managed: true,
            },
        });
        if (!metric) {
            return null;
        }
        return {
            id: metric.id,
            metricCode: metric.metric_code,
            metricName: metric.metric_name,
            kpiManaged: metric.kpi_managed,
        };
    }
};
exports.MetricRepository = MetricRepository;
exports.MetricRepository = MetricRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MetricRepository);
//# sourceMappingURL=metric.repository.js.map