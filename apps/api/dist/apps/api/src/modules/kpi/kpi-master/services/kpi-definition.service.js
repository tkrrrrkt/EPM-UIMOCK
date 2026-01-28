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
exports.KpiDefinitionService = void 0;
const common_1 = require("@nestjs/common");
const kpi_definition_repository_1 = require("../repositories/kpi-definition.repository");
const errors_1 = require("../../../../../../../packages/contracts/src/shared/errors");
let KpiDefinitionService = class KpiDefinitionService {
    constructor(kpiDefinitionRepository) {
        this.kpiDefinitionRepository = kpiDefinitionRepository;
    }
    async findAllDefinitions(tenantId, query) {
        return this.kpiDefinitionRepository.findAll(tenantId, query);
    }
    async createDefinition(tenantId, userId, data) {
        const existingDefinition = await this.kpiDefinitionRepository.findByKpiCode(tenantId, data.company_id, data.kpi_code);
        if (existingDefinition) {
            throw new errors_1.KpiDefinitionDuplicateError(`KPI code already exists: ${data.kpi_code}`);
        }
        const definition = await this.kpiDefinitionRepository.create(tenantId, {
            tenant_id: tenantId,
            company_id: data.company_id,
            kpi_code: data.kpi_code,
            kpi_name: data.kpi_name,
            description: data.description,
            unit: data.unit,
            aggregation_method: data.aggregation_method,
            direction: data.direction,
            created_by: userId,
        });
        return definition;
    }
};
exports.KpiDefinitionService = KpiDefinitionService;
exports.KpiDefinitionService = KpiDefinitionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [kpi_definition_repository_1.KpiDefinitionRepository])
], KpiDefinitionService);
//# sourceMappingURL=kpi-definition.service.js.map