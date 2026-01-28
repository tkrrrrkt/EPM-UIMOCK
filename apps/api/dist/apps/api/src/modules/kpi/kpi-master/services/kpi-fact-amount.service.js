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
    constructor(kpiFactAmountRepository) {
        this.kpiFactAmountRepository = kpiFactAmountRepository;
    }
    async findByItemId(tenantId, kpiDefinitionId, eventId, departmentStableId) {
        return this.kpiFactAmountRepository.findByItemId(tenantId, kpiDefinitionId, eventId, departmentStableId);
    }
    async createFactAmount(tenantId, userId, data) {
        const existingFactAmount = await this.kpiFactAmountRepository.findByPeriod(tenantId, data.event_id, data.kpi_definition_id, data.period_code, data.department_stable_id);
        if (existingFactAmount) {
            throw new errors_1.KpiFactAmountDuplicateError(`Fact amount already exists for period: ${data.period_code}`);
        }
        const factAmount = await this.kpiFactAmountRepository.create(tenantId, {
            tenant_id: tenantId,
            event_id: data.event_id,
            kpi_definition_id: data.kpi_definition_id,
            department_stable_id: data.department_stable_id,
            period_code: data.period_code,
            period_start_date: data.period_start_date,
            period_end_date: data.period_end_date,
            target_value: data.target_value,
            actual_value: data.actual_value,
            notes: data.notes,
            company_id: data.company_id,
            created_by: userId,
        });
        return factAmount;
    }
    async updateFactAmount(tenantId, id, userId, data) {
        const factAmount = await this.kpiFactAmountRepository.update(tenantId, id, {
            target_value: data.target_value,
            actual_value: data.actual_value,
            notes: data.notes,
            updated_by: userId,
        });
        return factAmount;
    }
};
exports.KpiFactAmountService = KpiFactAmountService;
exports.KpiFactAmountService = KpiFactAmountService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [kpi_fact_amount_repository_1.KpiFactAmountRepository])
], KpiFactAmountService);
//# sourceMappingURL=kpi-fact-amount.service.js.map