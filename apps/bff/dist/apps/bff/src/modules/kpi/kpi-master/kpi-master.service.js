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
exports.KpiMasterBffService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const kpi_master_mapper_1 = require("./mappers/kpi-master.mapper");
const ALLOWED_EVENT_SORT_BY = ['event_code', 'event_name', 'fiscal_year', 'created_at'];
const ALLOWED_DEFINITION_SORT_BY = ['kpi_code', 'kpi_name', 'created_at'];
let KpiMasterBffService = class KpiMasterBffService {
    constructor(httpService) {
        this.httpService = httpService;
        this.apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3001';
    }
    normalizeEventQuery(query) {
        const page = Math.max(1, query.page || 1);
        const pageSize = Math.min(200, Math.max(1, query.pageSize || 50));
        const sortBy = ALLOWED_EVENT_SORT_BY.includes(query.sortBy)
            ? query.sortBy
            : 'event_code';
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
            fiscalYear: query.fiscalYear,
            status: query.status,
        };
    }
    normalizeItemQuery(query) {
        return {
            eventId: query.eventId,
            kpiType: query.kpiType,
            departmentStableIds: query.departmentStableIds,
            hierarchyLevel: query.hierarchyLevel,
        };
    }
    normalizeDefinitionQuery(query) {
        const page = Math.max(1, query.page || 1);
        const pageSize = Math.min(200, Math.max(1, query.pageSize || 50));
        const sortBy = ALLOWED_DEFINITION_SORT_BY.includes(query.sortBy)
            ? query.sortBy
            : 'kpi_code';
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
    async getSummary(tenantId, eventId) {
        return {
            totalKpiCount: 0,
            avgAchievementRate: 0,
            delayedActionPlanCount: 0,
            attentionRequiredCount: 0,
        };
    }
    async getEvents(tenantId, companyId, query) {
        const normalized = this.normalizeEventQuery(query);
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.apiBaseUrl}/api/kpi/kpi-master/events`, {
            headers: this.createHeaders(tenantId, undefined, companyId),
            params: {
                offset: normalized.offset,
                limit: normalized.limit,
                sort_by: normalized.sortBy,
                sort_order: normalized.sortOrder,
                keyword: normalized.keyword,
                fiscal_year: normalized.fiscalYear,
                status: normalized.status,
            },
        }));
        const { items, total } = response.data;
        return kpi_master_mapper_1.KpiMasterMapper.toEventList(items, total, normalized.page, normalized.pageSize);
    }
    async getEvent(tenantId, id) {
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.apiBaseUrl}/api/kpi/kpi-master/events/${id}`, {
            headers: this.createHeaders(tenantId),
        }));
        return kpi_master_mapper_1.KpiMasterMapper.toEventDetail(response.data);
    }
    async createEvent(tenantId, companyId, userId, data) {
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.apiBaseUrl}/api/kpi/kpi-master/events`, kpi_master_mapper_1.KpiMasterMapper.toCreateEventApiDto(data, companyId), {
            headers: this.createHeaders(tenantId, userId, companyId),
        }));
        return kpi_master_mapper_1.KpiMasterMapper.toEventDetail(response.data);
    }
    async confirmEvent(tenantId, userId, id) {
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.patch(`${this.apiBaseUrl}/api/kpi/kpi-master/events/${id}/confirm`, {}, {
            headers: this.createHeaders(tenantId, userId),
        }));
        return kpi_master_mapper_1.KpiMasterMapper.toEventDetail(response.data);
    }
    async getItems(tenantId, companyId, userId, query) {
        const normalized = this.normalizeItemQuery(query);
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.apiBaseUrl}/api/kpi/kpi-master/items`, {
            headers: this.createHeaders(tenantId, userId, companyId),
            params: {
                company_id: companyId,
                event_id: normalized.eventId,
                kpi_type: normalized.kpiType,
                department_stable_ids: normalized.departmentStableIds,
                hierarchy_level: normalized.hierarchyLevel,
            },
        }));
        return kpi_master_mapper_1.KpiMasterMapper.toItemList(response.data);
    }
    async getItem(tenantId, userId, id) {
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.apiBaseUrl}/api/kpi/kpi-master/items/${id}`, {
            headers: this.createHeaders(tenantId, userId),
        }));
        return kpi_master_mapper_1.KpiMasterMapper.toItemDetail(response.data);
    }
    async createItem(tenantId, companyId, userId, data) {
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.apiBaseUrl}/api/kpi/kpi-master/items`, kpi_master_mapper_1.KpiMasterMapper.toCreateItemApiDto(data, companyId), {
            headers: this.createHeaders(tenantId, userId, companyId),
        }));
        return kpi_master_mapper_1.KpiMasterMapper.toItemDetail(response.data);
    }
    async updateItem(tenantId, userId, id, data) {
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.patch(`${this.apiBaseUrl}/api/kpi/kpi-master/items/${id}`, kpi_master_mapper_1.KpiMasterMapper.toUpdateItemApiDto(data), {
            headers: this.createHeaders(tenantId, userId),
        }));
        return kpi_master_mapper_1.KpiMasterMapper.toItemDetail(response.data);
    }
    async deleteItem(tenantId, userId, id) {
        await (0, rxjs_1.firstValueFrom)(this.httpService.delete(`${this.apiBaseUrl}/api/kpi/kpi-master/items/${id}`, {
            headers: this.createHeaders(tenantId, userId),
        }));
    }
    async getSelectableSubjects(tenantId, companyId) {
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.apiBaseUrl}/api/kpi/kpi-master/selectable-subjects`, {
            headers: this.createHeaders(tenantId, undefined, companyId),
        }));
        return kpi_master_mapper_1.KpiMasterMapper.toSelectableSubjectList(response.data);
    }
    async getSelectableMetrics(tenantId, companyId) {
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.apiBaseUrl}/api/kpi/kpi-master/selectable-metrics`, {
            headers: this.createHeaders(tenantId, undefined, companyId),
        }));
        return kpi_master_mapper_1.KpiMasterMapper.toSelectableMetricList(response.data);
    }
    async getKpiDefinitions(tenantId, companyId, query) {
        const normalized = this.normalizeDefinitionQuery(query);
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.apiBaseUrl}/api/kpi/kpi-master/kpi-definitions`, {
            headers: this.createHeaders(tenantId, undefined, companyId),
            params: {
                offset: normalized.offset,
                limit: normalized.limit,
                sort_by: normalized.sortBy,
                sort_order: normalized.sortOrder,
                keyword: normalized.keyword,
            },
        }));
        const { items, total } = response.data;
        return kpi_master_mapper_1.KpiMasterMapper.toDefinitionList(items, total, normalized.page, normalized.pageSize);
    }
    async createKpiDefinition(tenantId, companyId, userId, data) {
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.apiBaseUrl}/api/kpi/kpi-master/kpi-definitions`, kpi_master_mapper_1.KpiMasterMapper.toCreateDefinitionApiDto(data, companyId), {
            headers: this.createHeaders(tenantId, userId, companyId),
        }));
        return kpi_master_mapper_1.KpiMasterMapper.toDefinitionList([response.data], 1, 1, 1);
    }
    async createFactAmount(tenantId, companyId, userId, data) {
        const context = await this.resolveFactAmountContext(tenantId, userId, data.kpiMasterItemId);
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.apiBaseUrl}/api/kpi/kpi-master/fact-amounts`, kpi_master_mapper_1.KpiMasterMapper.toCreateFactAmountApiDto(data, context), {
            headers: this.createHeaders(tenantId, userId, companyId),
        }));
        return kpi_master_mapper_1.KpiMasterMapper.toFactAmountDto(response.data, data.kpiMasterItemId);
    }
    async updateFactAmount(tenantId, userId, id, data) {
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.put(`${this.apiBaseUrl}/api/kpi/kpi-master/fact-amounts/${id}`, kpi_master_mapper_1.KpiMasterMapper.toUpdateFactAmountApiDto(data), {
            headers: this.createHeaders(tenantId, userId),
        }));
        return kpi_master_mapper_1.KpiMasterMapper.toFactAmountDto(response.data);
    }
    async resolveFactAmountContext(tenantId, userId, kpiMasterItemId) {
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.apiBaseUrl}/api/kpi/kpi-master/items/${kpiMasterItemId}`, {
            headers: this.createHeaders(tenantId, userId),
        }));
        const item = response.data;
        if (!item.ref_kpi_definition_id) {
            throw new common_1.BadRequestException('kpiMasterItemId must reference a KPI definition');
        }
        return {
            eventId: item.event_id,
            kpiDefinitionId: item.ref_kpi_definition_id,
        };
    }
    async createTargetValue(tenantId, data) {
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.apiBaseUrl}/api/kpi/kpi-master/target-values`, kpi_master_mapper_1.KpiMasterMapper.toCreateTargetValueApiDto(data), {
            headers: this.createHeaders(tenantId),
        }));
        return kpi_master_mapper_1.KpiMasterMapper.toTargetValueDto(response.data);
    }
    async updateTargetValue(tenantId, id, data) {
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.put(`${this.apiBaseUrl}/api/kpi/kpi-master/target-values/${id}`, kpi_master_mapper_1.KpiMasterMapper.toUpdateTargetValueApiDto(data), {
            headers: this.createHeaders(tenantId),
        }));
        return kpi_master_mapper_1.KpiMasterMapper.toTargetValueDto(response.data);
    }
};
exports.KpiMasterBffService = KpiMasterBffService;
exports.KpiMasterBffService = KpiMasterBffService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], KpiMasterBffService);
//# sourceMappingURL=kpi-master.service.js.map