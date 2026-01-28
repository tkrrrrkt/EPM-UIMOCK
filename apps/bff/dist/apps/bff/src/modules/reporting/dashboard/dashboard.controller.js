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
exports.DashboardBffController = void 0;
const common_1 = require("@nestjs/common");
const dashboard_service_1 = require("./dashboard.service");
let DashboardBffController = class DashboardBffController {
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
    async getDashboards(tenantId, query) {
        this.validateTenantId(tenantId);
        return this.service.getDashboards(tenantId, {
            page: query.page ? parseInt(query.page, 10) : undefined,
            pageSize: query.pageSize ? parseInt(query.pageSize, 10) : undefined,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
            keyword: query.keyword,
        });
    }
    async getTemplates(tenantId) {
        this.validateTenantId(tenantId);
        return this.service.getTemplates(tenantId);
    }
    async getSelectors(tenantId, companyId, query) {
        this.validateTenantId(tenantId);
        this.validateCompanyId(companyId);
        return this.service.getSelectors(tenantId, companyId, query);
    }
    async getKpiDefinitionSelectors(tenantId, companyId) {
        this.validateTenantId(tenantId);
        this.validateCompanyId(companyId);
        return this.service.getKpiDefinitions(tenantId, companyId);
    }
    async getDashboard(tenantId, id) {
        this.validateTenantId(tenantId);
        return this.service.getDashboard(tenantId, id);
    }
    async createDashboard(tenantId, userId, data) {
        this.validateTenantId(tenantId);
        this.validateUserId(userId);
        return this.service.createDashboard(tenantId, userId, data);
    }
    async updateDashboard(tenantId, userId, id, data) {
        this.validateTenantId(tenantId);
        this.validateUserId(userId);
        return this.service.updateDashboard(tenantId, userId, id, data);
    }
    async deleteDashboard(tenantId, userId, id) {
        this.validateTenantId(tenantId);
        this.validateUserId(userId);
        await this.service.deleteDashboard(tenantId, userId, id);
    }
    async duplicateDashboard(tenantId, userId, id) {
        this.validateTenantId(tenantId);
        this.validateUserId(userId);
        return this.service.duplicateDashboard(tenantId, userId, id);
    }
    async getWidgetData(tenantId, companyId, dashboardId, widgetId, request) {
        this.validateTenantId(tenantId);
        this.validateCompanyId(companyId);
        return this.service.getWidgetData(tenantId, companyId, dashboardId, widgetId, request);
    }
};
exports.DashboardBffController = DashboardBffController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DashboardBffController.prototype, "getDashboards", null);
__decorate([
    (0, common_1.Get)('templates'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DashboardBffController.prototype, "getTemplates", null);
__decorate([
    (0, common_1.Get)('selectors'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-company-id')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], DashboardBffController.prototype, "getSelectors", null);
__decorate([
    (0, common_1.Get)('selectors/kpi-definitions'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-company-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DashboardBffController.prototype, "getKpiDefinitionSelectors", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DashboardBffController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], DashboardBffController.prototype, "createDashboard", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], DashboardBffController.prototype, "updateDashboard", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], DashboardBffController.prototype, "deleteDashboard", null);
__decorate([
    (0, common_1.Post)(':id/duplicate'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], DashboardBffController.prototype, "duplicateDashboard", null);
__decorate([
    (0, common_1.Post)(':id/widgets/:widgetId/data'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-company-id')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Param)('widgetId')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], DashboardBffController.prototype, "getWidgetData", null);
exports.DashboardBffController = DashboardBffController = __decorate([
    (0, common_1.Controller)('bff/reporting/dashboards'),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardBffService])
], DashboardBffController);
//# sourceMappingURL=dashboard.controller.js.map