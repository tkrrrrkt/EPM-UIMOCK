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
    constructor(service) {
        this.service = service;
    }
    validateTenantId(tenantId) {
        if (!tenantId) {
            throw new common_1.BadRequestException('x-tenant-id header is required');
        }
    }
    validateUserId(userId) {
        if (!userId) {
            throw new common_1.BadRequestException('x-user-id header is required');
        }
    }
    validateCompanyId(companyId) {
        if (!companyId) {
            throw new common_1.BadRequestException('x-company-id header is required');
        }
    }
    async getSummary(tenantId, eventId) {
        this.validateTenantId(tenantId);
        return this.service.getSummary(tenantId, eventId);
    }
    async getEvents(tenantId, companyId, query) {
        this.validateTenantId(tenantId);
        this.validateCompanyId(companyId);
        return this.service.getEvents(tenantId, companyId, {
            page: query.page ? parseInt(query.page, 10) : undefined,
            pageSize: query.pageSize ? parseInt(query.pageSize, 10) : undefined,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
            keyword: query.keyword,
            fiscalYear: query.fiscalYear ? parseInt(query.fiscalYear, 10) : undefined,
            status: query.status,
        });
    }
    async getEvent(tenantId, id) {
        this.validateTenantId(tenantId);
        return this.service.getEvent(tenantId, id);
    }
    async createEvent(tenantId, companyId, userId, data) {
        this.validateTenantId(tenantId);
        this.validateCompanyId(companyId);
        this.validateUserId(userId);
        return this.service.createEvent(tenantId, companyId, userId, data);
    }
    async confirmEvent(tenantId, userId, id) {
        this.validateTenantId(tenantId);
        this.validateUserId(userId);
        return this.service.confirmEvent(tenantId, userId, id);
    }
    async getItems(tenantId, companyId, userId, query) {
        this.validateTenantId(tenantId);
        this.validateCompanyId(companyId);
        this.validateUserId(userId);
        const departmentStableIds = query.departmentStableIds
            ? Array.isArray(query.departmentStableIds)
                ? query.departmentStableIds
                : query.departmentStableIds
                    .split(',')
                    .map((value) => value.trim())
                    .filter((value) => value.length > 0)
            : undefined;
        return this.service.getItems(tenantId, companyId, userId, {
            eventId: query.eventId,
            kpiType: query.kpiType,
            departmentStableIds,
            hierarchyLevel: query.hierarchyLevel ? parseInt(query.hierarchyLevel, 10) : undefined,
        });
    }
    async getItem(tenantId, userId, id) {
        this.validateTenantId(tenantId);
        this.validateUserId(userId);
        return this.service.getItem(tenantId, userId, id);
    }
    async createItem(tenantId, companyId, userId, data) {
        this.validateTenantId(tenantId);
        this.validateCompanyId(companyId);
        this.validateUserId(userId);
        return this.service.createItem(tenantId, companyId, userId, data);
    }
    async updateItem(tenantId, userId, id, data) {
        this.validateTenantId(tenantId);
        this.validateUserId(userId);
        return this.service.updateItem(tenantId, userId, id, data);
    }
    async deleteItem(tenantId, userId, id) {
        this.validateTenantId(tenantId);
        this.validateUserId(userId);
        await this.service.deleteItem(tenantId, userId, id);
    }
    async getSelectableSubjects(tenantId, companyId) {
        this.validateTenantId(tenantId);
        this.validateCompanyId(companyId);
        return this.service.getSelectableSubjects(tenantId, companyId);
    }
    async getSelectableMetrics(tenantId, companyId) {
        this.validateTenantId(tenantId);
        this.validateCompanyId(companyId);
        return this.service.getSelectableMetrics(tenantId, companyId);
    }
    async getKpiDefinitions(tenantId, companyId, query) {
        this.validateTenantId(tenantId);
        this.validateCompanyId(companyId);
        return this.service.getKpiDefinitions(tenantId, companyId, {
            page: query.page ? parseInt(query.page, 10) : undefined,
            pageSize: query.pageSize ? parseInt(query.pageSize, 10) : undefined,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
            keyword: query.keyword,
        });
    }
    async createKpiDefinition(tenantId, companyId, userId, data) {
        this.validateTenantId(tenantId);
        this.validateCompanyId(companyId);
        this.validateUserId(userId);
        return this.service.createKpiDefinition(tenantId, companyId, userId, data);
    }
    async createFactAmount(tenantId, companyId, userId, data) {
        this.validateTenantId(tenantId);
        this.validateCompanyId(companyId);
        this.validateUserId(userId);
        return this.service.createFactAmount(tenantId, companyId, userId, data);
    }
    async updateFactAmount(tenantId, userId, id, data) {
        this.validateTenantId(tenantId);
        this.validateUserId(userId);
        return this.service.updateFactAmount(tenantId, userId, id, data);
    }
    async createTargetValue(tenantId, data) {
        this.validateTenantId(tenantId);
        return this.service.createTargetValue(tenantId, data);
    }
    async updateTargetValue(tenantId, id, data) {
        this.validateTenantId(tenantId);
        return this.service.updateTargetValue(tenantId, id, data);
    }
};
exports.KpiMasterBffController = KpiMasterBffController;
__decorate([
    (0, common_1.Get)('summary'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Query)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], KpiMasterBffController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)('events'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-company-id')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
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
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-company-id')),
    __param(2, (0, common_1.Headers)('x-user-id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], KpiMasterBffController.prototype, "createEvent", null);
__decorate([
    (0, common_1.Patch)('events/:id/confirm'),
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
    __param(1, (0, common_1.Headers)('x-company-id')),
    __param(2, (0, common_1.Headers)('x-user-id')),
    __param(3, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], KpiMasterBffController.prototype, "getItems", null);
__decorate([
    (0, common_1.Get)('items/:id'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], KpiMasterBffController.prototype, "getItem", null);
__decorate([
    (0, common_1.Post)('items'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-company-id')),
    __param(2, (0, common_1.Headers)('x-user-id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], KpiMasterBffController.prototype, "createItem", null);
__decorate([
    (0, common_1.Patch)('items/:id'),
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
__decorate([
    (0, common_1.Get)('selectable-subjects'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-company-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], KpiMasterBffController.prototype, "getSelectableSubjects", null);
__decorate([
    (0, common_1.Get)('selectable-metrics'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-company-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], KpiMasterBffController.prototype, "getSelectableMetrics", null);
__decorate([
    (0, common_1.Get)('kpi-definitions'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-company-id')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], KpiMasterBffController.prototype, "getKpiDefinitions", null);
__decorate([
    (0, common_1.Post)('kpi-definitions'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-company-id')),
    __param(2, (0, common_1.Headers)('x-user-id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], KpiMasterBffController.prototype, "createKpiDefinition", null);
__decorate([
    (0, common_1.Post)('fact-amounts'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-company-id')),
    __param(2, (0, common_1.Headers)('x-user-id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], KpiMasterBffController.prototype, "createFactAmount", null);
__decorate([
    (0, common_1.Put)('fact-amounts/:id'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], KpiMasterBffController.prototype, "updateFactAmount", null);
__decorate([
    (0, common_1.Post)('target-values'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], KpiMasterBffController.prototype, "createTargetValue", null);
__decorate([
    (0, common_1.Put)('target-values/:id'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], KpiMasterBffController.prototype, "updateTargetValue", null);
exports.KpiMasterBffController = KpiMasterBffController = __decorate([
    (0, common_1.Controller)('bff/kpi-master'),
    __metadata("design:paramtypes", [kpi_master_service_1.KpiMasterBffService])
], KpiMasterBffController);
//# sourceMappingURL=kpi-master.controller.js.map