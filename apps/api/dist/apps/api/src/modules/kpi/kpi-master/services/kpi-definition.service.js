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
    constructor(definitionRepository) {
        this.definitionRepository = definitionRepository;
    }
    async findAll(tenantId, filters) {
        return this.definitionRepository.findAll(tenantId, filters);
    }
    async create(tenantId, data, userId) {
        const existing = await this.definitionRepository.findByCode(tenantId, data.companyId, data.kpiCode);
        if (existing) {
            throw new errors_1.KpiDefinitionDuplicateError(`KPI definition code already exists: ${data.kpiCode} in company ${data.companyId}`);
        }
        const definition = await this.definitionRepository.create(tenantId, data, userId);
        return definition;
    }
};
exports.KpiDefinitionService = KpiDefinitionService;
exports.KpiDefinitionService = KpiDefinitionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [kpi_definition_repository_1.KpiDefinitionRepository])
], KpiDefinitionService);
//# sourceMappingURL=kpi-definition.service.js.map