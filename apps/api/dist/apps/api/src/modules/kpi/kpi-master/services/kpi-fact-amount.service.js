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
exports.KpiFactAmountService = void 0;
const common_1 = require("@nestjs/common");
const kpi_fact_amount_repository_1 = require("../repositories/kpi-fact-amount.repository");
const errors_1 = require("../../../../../../../packages/contracts/src/shared/errors");
let KpiFactAmountService = class KpiFactAmountService {
    constructor(factAmountRepository) {
        this.factAmountRepository = factAmountRepository;
    }
    async findByItemId(tenantId, kpiDefinitionId, eventId) {
        return this.factAmountRepository.findByItemId(tenantId, kpiDefinitionId, eventId);
    }
    async create(tenantId, data, userId) {
        const existing = await this.factAmountRepository.findByItemId(tenantId, data.kpiDefinitionId, data.kpiEventId);
        const duplicate = existing.find((fact) => fact.periodCode === data.periodCode &&
            (fact.departmentStableId || null) === (data.departmentStableId || null));
        if (duplicate) {
            throw new errors_1.KpiFactAmountDuplicateError(`Fact amount already exists for period: ${data.periodCode}, department: ${data.departmentStableId || 'company-wide'}`);
        }
        const factAmount = await this.factAmountRepository.create(tenantId, data, userId);
        return factAmount;
    }
    async update(tenantId, id, data, userId) {
        const existing = await this.factAmountRepository.findById(tenantId, id);
        if (!existing) {
            throw new errors_1.KpiFactAmountNotFoundError(`Fact amount not found: ${id}`);
        }
        const updated = await this.factAmountRepository.update(tenantId, id, data, userId);
        return updated;
    }
};
exports.KpiFactAmountService = KpiFactAmountService;
exports.KpiFactAmountService = KpiFactAmountService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [kpi_fact_amount_repository_1.KpiFactAmountRepository])
], KpiFactAmountService);
//# sourceMappingURL=kpi-fact-amount.service.js.map