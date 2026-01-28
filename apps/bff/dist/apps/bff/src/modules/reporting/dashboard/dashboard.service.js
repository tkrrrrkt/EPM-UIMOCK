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
exports.DashboardBffService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const dashboard_mapper_1 = require("./mappers/dashboard.mapper");
const ALLOWED_SORT_BY = ['name', 'sortOrder', 'updatedAt'];
let DashboardBffService = class DashboardBffService {
    constructor(httpService) {
        this.httpService = httpService;
        this.apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3001';
    }
    normalizeQuery(query) {
        const page = Math.max(1, query.page || 1);
        const pageSize = Math.min(100, Math.max(1, query.pageSize || 20));
        const sortBy = ALLOWED_SORT_BY.includes(query.sortBy)
            ? query.sortBy
            : 'sortOrder';
        const sortOrder = query.sortOrder === 'desc' ? 'desc' : 'asc';
        const keyword = query.keyword?.trim() || undefined;
        return {
            page,
            pageSize,
            offset: (page - 1) * pageSize,
            limit: pageSize,
            sortBy,
            sortOrder,
            keyword,
        };
    }
    createHeaders(tenantId, userId, companyId) {
        const headers = {
            'Content-Type': 'application/json',
            'x-tenant-id': tenantId,
        };
        if (userId) {
            headers['x-user-id'] = userId;
        }
        if (companyId) {
            headers['x-company-id'] = companyId;
        }
        return headers;
    }
    async getDashboards(tenantId, query) {
        const normalized = this.normalizeQuery(query);
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.apiBaseUrl}/api/reporting/dashboards`, {
            headers: this.createHeaders(tenantId),
            params: {
                offset: normalized.offset,
                limit: normalized.limit,
                sortBy: normalized.sortBy,
                sortOrder: normalized.sortOrder,
                keyword: normalized.keyword,
            },
        }));
        const items = response.data;
        const total = items.length;
        return dashboard_mapper_1.DashboardMapper.toDashboardList(items, total, normalized.page, normalized.pageSize);
    }
    async getDashboard(tenantId, id) {
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.apiBaseUrl}/api/reporting/dashboards/${id}`, {
            headers: this.createHeaders(tenantId),
        }));
        return dashboard_mapper_1.DashboardMapper.toDashboardDetail(response.data);
    }
    async createDashboard(tenantId, userId, data) {
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.apiBaseUrl}/api/reporting/dashboards`, data, {
            headers: this.createHeaders(tenantId, userId),
        }));
        return dashboard_mapper_1.DashboardMapper.toDashboardDetail(response.data);
    }
    async updateDashboard(tenantId, userId, id, data) {
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.put(`${this.apiBaseUrl}/api/reporting/dashboards/${id}`, data, {
            headers: this.createHeaders(tenantId, userId),
        }));
        return dashboard_mapper_1.DashboardMapper.toDashboardDetail(response.data);
    }
    async deleteDashboard(tenantId, userId, id) {
        await (0, rxjs_1.firstValueFrom)(this.httpService.delete(`${this.apiBaseUrl}/api/reporting/dashboards/${id}`, {
            headers: this.createHeaders(tenantId, userId),
        }));
    }
    async duplicateDashboard(tenantId, userId, id) {
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.apiBaseUrl}/api/reporting/dashboards/${id}/duplicate`, {}, {
            headers: this.createHeaders(tenantId, userId),
        }));
        return dashboard_mapper_1.DashboardMapper.toDashboardDetail(response.data);
    }
    async getWidgetData(tenantId, companyId, dashboardId, widgetId, request) {
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.apiBaseUrl}/api/reporting/dashboards/${dashboardId}/widgets/${widgetId}/data`, {
            filter: request.resolvedFilter,
        }, {
            headers: this.createHeaders(tenantId, undefined, companyId),
        }));
        return dashboard_mapper_1.DashboardMapper.toWidgetDataResponse(response.data);
    }
    async getTemplates(tenantId) {
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.apiBaseUrl}/api/reporting/dashboards/templates`, {
            headers: this.createHeaders(tenantId),
        }));
        return dashboard_mapper_1.DashboardMapper.toTemplateList(response.data);
    }
    async getSelectors(tenantId, companyId, query) {
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.apiBaseUrl}/api/reporting/dashboards/selectors`, {
            headers: this.createHeaders(tenantId, undefined, companyId),
            params: query,
        }));
        return dashboard_mapper_1.DashboardMapper.toSelectorsResponse(response.data);
    }
    async getKpiDefinitions(tenantId, companyId) {
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.apiBaseUrl}/api/reporting/dashboards/selectors/kpi-definitions`, {
            headers: this.createHeaders(tenantId, undefined, companyId),
        }));
        return dashboard_mapper_1.DashboardMapper.toKpiDefinitionOptionList(response.data);
    }
};
exports.DashboardBffService = DashboardBffService;
exports.DashboardBffService = DashboardBffService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], DashboardBffService);
//# sourceMappingURL=dashboard.service.js.map