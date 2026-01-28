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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const dashboard_service_1 = require("./dashboard.service");
const widget_data_service_1 = require("./widget-data.service");
const errors_1 = require("../../../../../../packages/contracts/src/shared/errors");
let DashboardController = class DashboardController {
    constructor(dashboardService, widgetDataService) {
        this.dashboardService = dashboardService;
        this.widgetDataService = widgetDataService;
    }
    async getDashboards(tenantId) {
        this.validateTenantId(tenantId);
        return this.dashboardService.findAll(tenantId);
    }
    async getTemplates(tenantId) {
        this.validateTenantId(tenantId);
        return this.dashboardService.findTemplates(tenantId);
    }
    async getSelectors(tenantId, companyId) {
        this.validateTenantId(tenantId);
        this.validateCompanyId(companyId);
        return {
            fiscalYears: [2024, 2025, 2026],
            planEvents: [],
            planVersions: [],
            departments: [],
        };
    }
    async getKpiDefinitionSelectors(tenantId, companyId) {
        this.validateTenantId(tenantId);
        this.validateCompanyId(companyId);
        return this.widgetDataService.getKpiDefinitionOptions(tenantId, companyId);
    }
    async getDashboard(tenantId, id) {
        this.validateTenantId(tenantId);
        try {
            return await this.dashboardService.findById(tenantId, id);
        }
        catch (error) {
            if (error instanceof errors_1.DashboardNotFoundError) {
                throw new common_1.NotFoundException(error.message);
            }
            throw error;
        }
    }
    async createDashboard(tenantId, userId, data) {
        this.validateTenantId(tenantId);
        this.validateUserId(userId);
        try {
            return await this.dashboardService.create(tenantId, userId, data);
        }
        catch (error) {
            if (error instanceof errors_1.DashboardNotFoundError) {
                throw new common_1.NotFoundException(error.message);
            }
            throw error;
        }
    }
    async updateDashboard(tenantId, userId, id, data) {
        this.validateTenantId(tenantId);
        this.validateUserId(userId);
        try {
            return await this.dashboardService.update(tenantId, id, data, userId);
        }
        catch (error) {
            if (error instanceof errors_1.DashboardNotFoundError) {
                throw new common_1.NotFoundException(error.message);
            }
            throw error;
        }
    }
    async deleteDashboard(tenantId, userId, id) {
        this.validateTenantId(tenantId);
        this.validateUserId(userId);
        try {
            await this.dashboardService.delete(tenantId, id, userId);
        }
        catch (error) {
            if (error instanceof errors_1.DashboardNotFoundError) {
                throw new common_1.NotFoundException(error.message);
            }
            if (error instanceof errors_1.DashboardDeleteForbiddenError) {
                throw new common_1.BadRequestException(error.message);
            }
            throw error;
        }
    }
    async duplicateDashboard(tenantId, userId, id) {
        this.validateTenantId(tenantId);
        this.validateUserId(userId);
        try {
            return await this.dashboardService.duplicate(tenantId, userId, id);
        }
        catch (error) {
            if (error instanceof errors_1.DashboardNotFoundError) {
                throw new common_1.NotFoundException(error.message);
            }
            throw error;
        }
    }
    async getWidgetData(tenantId, companyId, dashboardId, widgetId, request) {
        this.validateTenantId(tenantId);
        this.validateCompanyId(companyId);
        const dashboard = await this.dashboardService.findById(tenantId, dashboardId);
        const widget = dashboard.widgets.find((w) => w.id === widgetId);
        if (!widget) {
            throw new common_1.NotFoundException(`Widget not found: ${widgetId}`);
        }
        return this.widgetDataService.getData(tenantId, companyId, widget, request.filter);
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
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getDashboards", null);
__decorate([
    (0, common_1.Get)('templates'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getTemplates", null);
__decorate([
    (0, common_1.Get)('selectors'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-company-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getSelectors", null);
__decorate([
    (0, common_1.Get)('selectors/kpi-definitions'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-company-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getKpiDefinitionSelectors", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "createDashboard", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "updateDashboard", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "deleteDashboard", null);
__decorate([
    (0, common_1.Post)(':id/duplicate'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "duplicateDashboard", null);
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
], DashboardController.prototype, "getWidgetData", null);
exports.DashboardController = DashboardController = __decorate([
    (0, common_1.Controller)('reporting/dashboards'),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService,
        widget_data_service_1.WidgetDataService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map