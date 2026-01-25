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
exports.KpiTargetValueService = void 0;
const common_1 = require("@nestjs/common");
const kpi_target_value_repository_1 = require("../repositories/kpi-target-value.repository");
const errors_1 = require("../../../../../../../packages/contracts/src/shared/errors");
let KpiTargetValueService = class KpiTargetValueService {
    constructor(targetValueRepository) {
        this.targetValueRepository = targetValueRepository;
    }
    async findByItemId(tenantId, kpiMasterItemId) {
        return this.targetValueRepository.findByItemId(tenantId, kpiMasterItemId);
    }
    async create(tenantId, data, userId) {
        const existing = await this.targetValueRepository.findByItemId(tenantId, data.kpiMasterItemId);
        const duplicate = existing.find((target) => target.periodCode === data.periodCode);
        if (duplicate) {
            throw new errors_1.KpiTargetValueDuplicateError(`Target value already exists for period: ${data.periodCode}`);
        }
        const targetValue = await this.targetValueRepository.create(tenantId, data);
        return targetValue;
    }
    async update(tenantId, id, data, userId) {
        const existing = await this.targetValueRepository.findById(tenantId, id);
        if (!existing) {
            throw new errors_1.KpiTargetValueNotFoundError(`Target value not found: ${id}`);
        }
        const updated = await this.targetValueRepository.update(tenantId, id, data);
        return updated;
    }
};
exports.KpiTargetValueService = KpiTargetValueService;
exports.KpiTargetValueService = KpiTargetValueService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [kpi_target_value_repository_1.KpiTargetValueRepository])
], KpiTargetValueService);
//# sourceMappingURL=kpi-target-value.service.js.map