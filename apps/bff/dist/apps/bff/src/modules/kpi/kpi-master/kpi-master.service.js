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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KpiMasterBffService = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const kpi_master_mapper_1 = require("./mappers/kpi-master.mapper");
let KpiMasterBffService = class KpiMasterBffService {
    constructor(httpService) {
        this.httpService = httpService;
        this.apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3001';
    }
    async getEvents(tenantId, query) {
        const normalized = this.normalizePagingAndSorting(query, {
            defaultSortBy: 'eventCode',
            sortByWhitelist: ['eventCode', 'eventName', 'fiscalYear', 'createdAt'],
            sortByDbMapping: {
                eventCode: 'event_code',
                eventName: 'event_name',
                fiscalYear: 'fiscal_year',
                createdAt: 'created_at',
            },
        });
        const apiQuery = {
            offset: normalized.offset,
            limit: normalized.limit,
            keyword: normalized.keyword,
            fiscalYear: query.fiscalYear,
            status: query.status,
            sortBy: normalized.sortByDb,
            sortOrder: normalized.sortOrder,
        };
        const response = await this.callDomainApi('GET', '/kpi-master/events', tenantId, { params: apiQuery });
        const events = response.data.data.map((event) => kpi_master_mapper_1.KpiMasterMapper.toKpiMasterEventDto(event));
        return {
            events,
            page: normalized.page,
            pageSize: normalized.pageSize,
            totalCount: response.data.total,
        };
    }
    async getEventById(tenantId, id) {
        const response = await this.callDomainApi('GET', `/kpi-master/events/${id}`, tenantId);
        return kpi_master_mapper_1.KpiMasterMapper.toKpiMasterEventDto(response.data);
    }
    async createEvent(tenantId, userId, data) {
        const apiData = {
            companyId: data.companyId,
            eventCode: data.eventCode,
            eventName: data.eventName,
            fiscalYear: data.fiscalYear,
        };
        const response = await this.callDomainApi('POST', '/kpi-master/events', tenantId, { data: apiData }, userId);
        return kpi_master_mapper_1.KpiMasterMapper.toKpiMasterEventDto(response.data);
    }
    async updateEvent(tenantId, userId, id, data) {
        const response = await this.callDomainApi('PUT', `/kpi-master/events/${id}`, tenantId, { data }, userId);
        return kpi_master_mapper_1.KpiMasterMapper.toKpiMasterEventDto(response.data);
    }
    async confirmEvent(tenantId, userId, id) {
        const response = await this.callDomainApi('POST', `/kpi-master/events/${id}/confirm`, tenantId, {}, userId);
        return kpi_master_mapper_1.KpiMasterMapper.toKpiMasterEventDto(response.data);
    }
    async getItems(tenantId, query) {
        const normalized = this.normalizePagingAndSorting(query, {
            defaultSortBy: 'sortOrder',
            sortByWhitelist: ['kpiCode', 'kpiName', 'sortOrder', 'createdAt'],
            sortByDbMapping: {
                kpiCode: 'kpi_code',
                kpiName: 'kpi_name',
                sortOrder: 'sort_order',
                createdAt: 'created_at',
            },
        });
        const apiQuery = {
            offset: normalized.offset,
            limit: normalized.limit,
            kpiEventId: query.kpiEventId,
            parentKpiItemId: query.parentKpiItemId,
            kpiType: query.kpiType,
            hierarchyLevel: query.hierarchyLevel,
            keyword: normalized.keyword,
            sortBy: normalized.sortByDb,
            sortOrder: normalized.sortOrder,
        };
        const response = await this.callDomainApi('GET', '/kpi-master/items', tenantId, { params: apiQuery });
        const items = response.data.data.map((item) => kpi_master_mapper_1.KpiMasterMapper.toKpiMasterItemDto(item));
        return {
            items,
            page: normalized.page,
            pageSize: normalized.pageSize,
            totalCount: response.data.total,
        };
    }
    async getItemById(tenantId, id) {
        const response = await this.callDomainApi('GET', `/kpi-master/items/${id}`, tenantId);
        return kpi_master_mapper_1.KpiMasterMapper.toKpiMasterItemDetailDto(response.data, [], [], []);
    }
    async createItem(tenantId, userId, data) {
        const apiData = {
            kpiEventId: data.kpiEventId,
            parentKpiItemId: data.parentKpiItemId,
            kpiCode: data.kpiCode,
            kpiName: data.kpiName,
            kpiType: data.kpiType,
            hierarchyLevel: data.hierarchyLevel,
            refSubjectId: data.refSubjectId,
            refKpiDefinitionId: data.refKpiDefinitionId,
            refMetricId: data.refMetricId,
            departmentStableId: data.departmentStableId,
            ownerEmployeeId: data.ownerEmployeeId,
            sortOrder: data.sortOrder,
        };
        const response = await this.callDomainApi('POST', '/kpi-master/items', tenantId, { data: apiData }, userId);
        return kpi_master_mapper_1.KpiMasterMapper.toKpiMasterItemDto(response.data);
    }
    async updateItem(tenantId, userId, id, data) {
        const apiData = {
            kpiName: data.kpiName,
            departmentStableId: data.departmentStableId,
            ownerEmployeeId: data.ownerEmployeeId,
            sortOrder: data.sortOrder,
        };
        const response = await this.callDomainApi('PUT', `/kpi-master/items/${id}`, tenantId, { data: apiData }, userId);
        return kpi_master_mapper_1.KpiMasterMapper.toKpiMasterItemDto(response.data);
    }
    async deleteItem(tenantId, userId, id) {
        await this.callDomainApi('DELETE', `/kpi-master/items/${id}`, tenantId, {}, userId);
    }
    normalizePagingAndSorting(query, options) {
        const page = Math.max(1, query.page || 1);
        const pageSize = Math.min(200, Math.max(1, query.pageSize || 50));
        const sortOrder = query.sortOrder || 'asc';
        let sortBy = query.sortBy || options.defaultSortBy;
        if (!options.sortByWhitelist.includes(sortBy)) {
            sortBy = options.defaultSortBy;
        }
        const sortByDb = options.sortByDbMapping[sortBy] || sortBy;
        const keyword = query.keyword?.trim() || undefined;
        const offset = (page - 1) * pageSize;
        const limit = pageSize;
        return {
            page,
            pageSize,
            offset,
            limit,
            keyword,
            sortBy,
            sortByDb,
            sortOrder,
        };
    }
    async callDomainApi(method, path, tenantId, config, userId) {
        const headers = {
            'x-tenant-id': tenantId,
        };
        if (userId) {
            headers['x-user-id'] = userId;
        }
        const url = `${this.apiBaseUrl}${path}`;
        switch (method) {
            case 'GET':
                return (0, rxjs_1.firstValueFrom)(this.httpService.get(url, {
                    headers,
                    params: config?.params,
                }));
            case 'POST':
                return (0, rxjs_1.firstValueFrom)(this.httpService.post(url, config?.data, {
                    headers,
                }));
            case 'PUT':
                return (0, rxjs_1.firstValueFrom)(this.httpService.put(url, config?.data, {
                    headers,
                }));
            case 'DELETE':
                return (0, rxjs_1.firstValueFrom)(this.httpService.delete(url, {
                    headers,
                }));
            default:
                throw new Error(`Unsupported HTTP method: ${method}`);
        }
    }
};
exports.KpiMasterBffService = KpiMasterBffService;
exports.KpiMasterBffService = KpiMasterBffService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof common_1.HttpService !== "undefined" && common_1.HttpService) === "function" ? _a : Object])
], KpiMasterBffService);
//# sourceMappingURL=kpi-master.service.js.map