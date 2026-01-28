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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const dashboard_repository_1 = require("./dashboard.repository");
const errors_1 = require("../../../../../../packages/contracts/src/shared/errors");
let DashboardService = class DashboardService {
    constructor(dashboardRepository) {
        this.dashboardRepository = dashboardRepository;
    }
    async findAll(tenantId) {
        return this.dashboardRepository.findAll(tenantId);
    }
    async findById(tenantId, id) {
        const dashboard = await this.dashboardRepository.findByIdWithWidgets(tenantId, id);
        if (!dashboard) {
            throw new errors_1.DashboardNotFoundError(`Dashboard not found: ${id}`);
        }
        return dashboard;
    }
    async create(tenantId, userId, data) {
        if (data.templateId) {
            const template = await this.dashboardRepository.findTemplateByIdWithWidgets(tenantId, data.templateId);
            if (!template) {
                throw new errors_1.DashboardNotFoundError(`Template not found: ${data.templateId}`);
            }
            const createData = {
                name: data.name || `${template.name}（コピー）`,
                description: data.description ?? template.description ?? undefined,
                globalFilterConfig: data.globalFilterConfig ?? template.globalFilterConfig,
                widgets: template.widgets.map((w) => ({
                    widgetType: w.widgetType,
                    title: w.title,
                    layout: w.layout,
                    dataConfig: w.dataConfig,
                    filterConfig: w.filterConfig,
                    displayConfig: w.displayConfig,
                    sortOrder: w.sortOrder,
                })),
            };
            const dashboard = await this.dashboardRepository.create(tenantId, createData, userId);
            return dashboard;
        }
        const dashboard = await this.dashboardRepository.create(tenantId, data, userId);
        return dashboard;
    }
    async update(tenantId, id, data, userId) {
        const dashboard = await this.dashboardRepository.update(tenantId, id, data, userId);
        if (!dashboard) {
            throw new errors_1.DashboardNotFoundError(`Dashboard not found: ${id}`);
        }
        return dashboard;
    }
    async delete(tenantId, id, userId) {
        const dashboard = await this.dashboardRepository.findById(tenantId, id);
        if (!dashboard) {
            throw new errors_1.DashboardNotFoundError(`Dashboard not found: ${id}`);
        }
        if (dashboard.ownerType === 'SYSTEM') {
            throw new errors_1.DashboardDeleteForbiddenError('System template dashboard cannot be deleted');
        }
        const deleted = await this.dashboardRepository.softDelete(tenantId, id, userId);
        if (!deleted) {
            throw new errors_1.DashboardNotFoundError(`Dashboard not found: ${id}`);
        }
    }
    async duplicate(tenantId, userId, id) {
        const source = await this.dashboardRepository.findByIdWithWidgets(tenantId, id);
        if (!source) {
            throw new errors_1.DashboardNotFoundError(`Dashboard not found: ${id}`);
        }
        const createData = {
            name: `${source.name}（コピー）`,
            description: source.description ?? undefined,
            globalFilterConfig: source.globalFilterConfig,
            widgets: source.widgets.map((w) => ({
                widgetType: w.widgetType,
                title: w.title,
                layout: w.layout,
                dataConfig: w.dataConfig,
                filterConfig: w.filterConfig,
                displayConfig: w.displayConfig,
                sortOrder: w.sortOrder,
            })),
        };
        const dashboard = await this.dashboardRepository.create(tenantId, createData, userId);
        return dashboard;
    }
    async findTemplates(tenantId) {
        return this.dashboardRepository.findTemplates(tenantId);
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [dashboard_repository_1.DashboardRepository])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map