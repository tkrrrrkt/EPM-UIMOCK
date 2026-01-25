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
exports.KpiMasterBffController = void 0;
const common_1 = require("@nestjs/common");
const kpi_master_service_1 = require("./kpi-master.service");
let KpiMasterBffController = class KpiMasterBffController {
    constructor(bffService) {
        this.bffService = bffService;
    }
    async getEvents(tenantId, query) {
        return this.bffService.getEvents(tenantId, query);
    }
    async getEvent(tenantId, id) {
        return this.bffService.getEventById(tenantId, id);
    }
    async createEvent(tenantId, userId, data) {
        return this.bffService.createEvent(tenantId, userId, data);
    }
    async updateEvent(tenantId, userId, id, data) {
        return this.bffService.updateEvent(tenantId, userId, id, data);
    }
    async confirmEvent(tenantId, userId, id) {
        return this.bffService.confirmEvent(tenantId, userId, id);
    }
    async getItems(tenantId, query) {
        return this.bffService.getItems(tenantId, query);
    }
    async getItem(tenantId, id) {
        return this.bffService.getItemById(tenantId, id);
    }
    async createItem(tenantId, userId, data) {
        return this.bffService.createItem(tenantId, userId, data);
    }
    async updateItem(tenantId, userId, id, data) {
        return this.bffService.updateItem(tenantId, userId, id, data);
    }
    async deleteItem(tenantId, userId, id) {
        return this.bffService.deleteItem(tenantId, userId, id);
    }
};
exports.KpiMasterBffController = KpiMasterBffController;
__decorate([
    (0, common_1.Get)('events'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], KpiMasterBffController.prototype, "getEvents", null);
__decorate([
    (0, common_1.Get)('events/:id'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], KpiMasterBffController.prototype, "getEvent", null);
__decorate([
    (0, common_1.Post)('events'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], KpiMasterBffController.prototype, "createEvent", null);
__decorate([
    (0, common_1.Put)('events/:id'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], KpiMasterBffController.prototype, "updateEvent", null);
__decorate([
    (0, common_1.Post)('events/:id/confirm'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], KpiMasterBffController.prototype, "confirmEvent", null);
__decorate([
    (0, common_1.Get)('items'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], KpiMasterBffController.prototype, "getItems", null);
__decorate([
    (0, common_1.Get)('items/:id'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], KpiMasterBffController.prototype, "getItem", null);
__decorate([
    (0, common_1.Post)('items'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], KpiMasterBffController.prototype, "createItem", null);
__decorate([
    (0, common_1.Put)('items/:id'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], KpiMasterBffController.prototype, "updateItem", null);
__decorate([
    (0, common_1.Delete)('items/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], KpiMasterBffController.prototype, "deleteItem", null);
exports.KpiMasterBffController = KpiMasterBffController = __decorate([
    (0, common_1.Controller)('bff/kpi-master'),
    __metadata("design:paramtypes", [kpi_master_service_1.KpiMasterBffService])
], KpiMasterBffController);
//# sourceMappingURL=kpi-master.controller.js.map