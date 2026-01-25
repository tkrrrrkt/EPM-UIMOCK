"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KpiMasterModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../prisma/prisma.module");
const kpi_master_controller_1 = require("./kpi-master.controller");
const kpi_master_event_service_1 = require("./services/kpi-master-event.service");
const kpi_master_item_service_1 = require("./services/kpi-master-item.service");
const kpi_definition_service_1 = require("./services/kpi-definition.service");
const kpi_fact_amount_service_1 = require("./services/kpi-fact-amount.service");
const kpi_target_value_service_1 = require("./services/kpi-target-value.service");
const kpi_master_event_repository_1 = require("./repositories/kpi-master-event.repository");
const kpi_master_item_repository_1 = require("./repositories/kpi-master-item.repository");
const kpi_definition_repository_1 = require("./repositories/kpi-definition.repository");
const kpi_fact_amount_repository_1 = require("./repositories/kpi-fact-amount.repository");
const kpi_target_value_repository_1 = require("./repositories/kpi-target-value.repository");
const subject_repository_1 = require("./repositories/subject.repository");
const metric_repository_1 = require("./repositories/metric.repository");
let KpiMasterModule = class KpiMasterModule {
};
exports.KpiMasterModule = KpiMasterModule;
exports.KpiMasterModule = KpiMasterModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [kpi_master_controller_1.KpiMasterController],
        providers: [
            kpi_master_event_service_1.KpiMasterEventService,
            kpi_master_item_service_1.KpiMasterItemService,
            kpi_definition_service_1.KpiDefinitionService,
            kpi_fact_amount_service_1.KpiFactAmountService,
            kpi_target_value_service_1.KpiTargetValueService,
            kpi_master_event_repository_1.KpiMasterEventRepository,
            kpi_master_item_repository_1.KpiMasterItemRepository,
            kpi_definition_repository_1.KpiDefinitionRepository,
            kpi_fact_amount_repository_1.KpiFactAmountRepository,
            kpi_target_value_repository_1.KpiTargetValueRepository,
            subject_repository_1.SubjectRepository,
            metric_repository_1.MetricRepository,
        ],
        exports: [
            kpi_master_event_service_1.KpiMasterEventService,
            kpi_master_item_service_1.KpiMasterItemService,
            kpi_definition_service_1.KpiDefinitionService,
            kpi_fact_amount_service_1.KpiFactAmountService,
            kpi_target_value_service_1.KpiTargetValueService,
        ],
    })
], KpiMasterModule);
//# sourceMappingURL=kpi-master.module.js.map