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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KpiMasterController = void 0;
const common_1 = require("@nestjs/common");
const kpi_master_event_service_1 = require("./services/kpi-master-event.service");
const kpi_master_item_service_1 = require("./services/kpi-master-item.service");
const kpi_definition_service_1 = require("./services/kpi-definition.service");
const kpi_fact_amount_service_1 = require("./services/kpi-fact-amount.service");
const kpi_target_value_service_1 = require("./services/kpi-target-value.service");
let KpiMasterController = class KpiMasterController {
    constructor(eventService, itemService, definitionService, factAmountService, targetValueService) {
        this.eventService = eventService;
        this.itemService = itemService;
        this.definitionService = definitionService;
        this.factAmountService = factAmountService;
        this.targetValueService = targetValueService;
    }
    async getEvents(tenantId, query) {
        return this.eventService.findAll(tenantId, query);
    }
    async getEvent(tenantId, id) {
        return this.eventService.findById(tenantId, id);
    }
    async createEvent(tenantId, userId, data) {
        return this.eventService.create(tenantId, data, userId);
    }
    async updateEvent(tenantId, userId, id, data) {
        return this.eventService.update(tenantId, id, data, userId);
    }
    async confirmEvent(tenantId, userId, id) {
        return this.eventService.confirm(tenantId, id, userId);
    }
    async getItems(tenantId, query) {
        return this.itemService.findAll(tenantId, query);
    }
    async getItem(tenantId, id) {
        return this.itemService.findById(tenantId, id);
    }
    async getItemsByEvent(tenantId, eventId) {
        return this.itemService.findByEventId(tenantId, eventId);
    }
    async createItem(tenantId, userId, data) {
        return this.itemService.create(tenantId, data, userId);
    }
    async updateItem(tenantId, userId, id, data) {
        return this.itemService.update(tenantId, id, data, userId);
    }
    async deleteItem(tenantId, userId, id) {
        return this.itemService.delete(tenantId, id, userId);
    }
    async getDefinitions(tenantId, companyId, keyword, offset = '0', limit = '50', sortBy, sortOrder) {
        return this.definitionService.findAll(tenantId, {
            companyId,
            keyword,
            offset: parseInt(offset, 10),
            limit: parseInt(limit, 10),
            sortBy,
            sortOrder,
        });
    }
    async createDefinition(tenantId, userId, data) {
        return this.definitionService.create(tenantId, data, userId);
    }
    async getFactAmounts(tenantId, definitionId, eventId) {
        return this.factAmountService.findByItemId(tenantId, definitionId, eventId);
    }
    async createFactAmount(tenantId, userId, data) {
        return this.factAmountService.create(tenantId, data, userId);
    }
    async updateFactAmount(tenantId, userId, id, data) {
        return this.factAmountService.update(tenantId, id, data, userId);
    }
    async getTargetValues(tenantId, itemId) {
        return this.targetValueService.findByItemId(tenantId, itemId);
    }
    async createTargetValue(tenantId, userId, data) {
        return this.targetValueService.create(tenantId, data, userId);
    }
    async updateTargetValue(tenantId, userId, id, data) {
        return this.targetValueService.update(tenantId, id, data, userId);
    }
};
exports.KpiMasterController = KpiMasterController;
__decorate([
    (0, common_1.Get)('events'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], KpiMasterController.prototype, "getEvents", null);
__decorate([
    (0, common_1.Get)('events/:id'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], KpiMasterController.prototype, "getEvent", null);
__decorate([
    (0, common_1.Post)('events'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], KpiMasterController.prototype, "createEvent", null);
__decorate([
    (0, common_1.Put)('events/:id'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], KpiMasterController.prototype, "updateEvent", null);
__decorate([
    (0, common_1.Post)('events/:id/confirm'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], KpiMasterController.prototype, "confirmEvent", null);
__decorate([
    (0, common_1.Get)('items'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], KpiMasterController.prototype, "getItems", null);
__decorate([
    (0, common_1.Get)('items/:id'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], KpiMasterController.prototype, "getItem", null);
__decorate([
    (0, common_1.Get)('events/:eventId/items'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Param)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], KpiMasterController.prototype, "getItemsByEvent", null);
__decorate([
    (0, common_1.Post)('items'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], KpiMasterController.prototype, "createItem", null);
__decorate([
    (0, common_1.Put)('items/:id'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], KpiMasterController.prototype, "updateItem", null);
__decorate([
    (0, common_1.Delete)('items/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], KpiMasterController.prototype, "deleteItem", null);
__decorate([
    (0, common_1.Get)('definitions'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Query)('keyword')),
    __param(3, (0, common_1.Query)('offset')),
    __param(4, (0, common_1.Query)('limit')),
    __param(5, (0, common_1.Query)('sortBy')),
    __param(6, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], KpiMasterController.prototype, "getDefinitions", null);
__decorate([
    (0, common_1.Post)('definitions'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], KpiMasterController.prototype, "createDefinition", null);
__decorate([
    (0, common_1.Get)('definitions/:definitionId/events/:eventId/fact-amounts'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Param)('definitionId')),
    __param(2, (0, common_1.Param)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], KpiMasterController.prototype, "getFactAmounts", null);
__decorate([
    (0, common_1.Post)('fact-amounts'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], KpiMasterController.prototype, "createFactAmount", null);
__decorate([
    (0, common_1.Put)('fact-amounts/:id'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], KpiMasterController.prototype, "updateFactAmount", null);
__decorate([
    (0, common_1.Get)('items/:itemId/target-values'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Param)('itemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], KpiMasterController.prototype, "getTargetValues", null);
__decorate([
    (0, common_1.Post)('target-values'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], KpiMasterController.prototype, "createTargetValue", null);
__decorate([
    (0, common_1.Put)('target-values/:id'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], KpiMasterController.prototype, "updateTargetValue", null);
exports.KpiMasterController = KpiMasterController = __decorate([
    (0, common_1.Controller)('kpi-master'),
    __metadata("design:paramtypes", [kpi_master_event_service_1.KpiMasterEventService,
        kpi_master_item_service_1.KpiMasterItemService,
        kpi_definition_service_1.KpiDefinitionService,
        kpi_fact_amount_service_1.KpiFactAmountService,
        kpi_target_value_service_1.KpiTargetValueService])
], KpiMasterController);
//# sourceMappingURL=kpi-master.controller.js.map