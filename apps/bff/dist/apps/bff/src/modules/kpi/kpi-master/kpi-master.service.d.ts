import { HttpService } from '@nestjs/axios';
import type { KpiMasterSummaryDto, KpiMasterEventListDto, KpiMasterEventDetailDto, CreateKpiMasterEventDto, KpiMasterItemDto, KpiMasterItemDetailDto, CreateKpiMasterItemDto, UpdateKpiMasterItemDto, SelectableSubjectListDto, SelectableMetricListDto, KpiDefinitionListDto, CreateKpiDefinitionDto, CreateKpiFactAmountDto, UpdateKpiFactAmountDto, KpiFactAmountDto, CreateKpiTargetValueDto, UpdateKpiTargetValueDto, KpiTargetValueDto } from '@epm/contracts/bff/kpi-master';
interface GetEventsQuery {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    keyword?: string;
    fiscalYear?: number;
    status?: 'DRAFT' | 'CONFIRMED';
}
interface GetItemsQuery {
    eventId?: string;
    kpiType?: 'FINANCIAL' | 'NON_FINANCIAL' | 'METRIC';
    departmentStableIds?: string[];
    hierarchyLevel?: 1 | 2;
}
interface GetKpiDefinitionsQuery {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    keyword?: string;
}
export declare class KpiMasterBffService {
    private readonly httpService;
    private readonly apiBaseUrl;
    constructor(httpService: HttpService);
    private normalizeEventQuery;
    private normalizeItemQuery;
    private normalizeDefinitionQuery;
    private createHeaders;
    getSummary(tenantId: string, eventId?: string): Promise<KpiMasterSummaryDto>;
    getEvents(tenantId: string, companyId: string, query: GetEventsQuery): Promise<KpiMasterEventListDto>;
    getEvent(tenantId: string, id: string): Promise<KpiMasterEventDetailDto>;
    createEvent(tenantId: string, companyId: string, userId: string, data: CreateKpiMasterEventDto): Promise<KpiMasterEventDetailDto>;
    confirmEvent(tenantId: string, userId: string, id: string): Promise<KpiMasterEventDetailDto>;
    getItems(tenantId: string, companyId: string, userId: string, query: GetItemsQuery): Promise<KpiMasterItemDto[]>;
    getItem(tenantId: string, userId: string, id: string): Promise<KpiMasterItemDetailDto>;
    createItem(tenantId: string, companyId: string, userId: string, data: CreateKpiMasterItemDto): Promise<KpiMasterItemDetailDto>;
    updateItem(tenantId: string, userId: string, id: string, data: UpdateKpiMasterItemDto): Promise<KpiMasterItemDetailDto>;
    deleteItem(tenantId: string, userId: string, id: string): Promise<void>;
    getSelectableSubjects(tenantId: string, companyId: string): Promise<SelectableSubjectListDto>;
    getSelectableMetrics(tenantId: string, companyId: string): Promise<SelectableMetricListDto>;
    getKpiDefinitions(tenantId: string, companyId: string, query: GetKpiDefinitionsQuery): Promise<KpiDefinitionListDto>;
    createKpiDefinition(tenantId: string, companyId: string, userId: string, data: CreateKpiDefinitionDto): Promise<KpiDefinitionListDto>;
    createFactAmount(tenantId: string, companyId: string, userId: string, data: CreateKpiFactAmountDto): Promise<KpiFactAmountDto>;
    updateFactAmount(tenantId: string, userId: string, id: string, data: UpdateKpiFactAmountDto): Promise<KpiFactAmountDto>;
    private resolveFactAmountContext;
    createTargetValue(tenantId: string, data: CreateKpiTargetValueDto): Promise<KpiTargetValueDto>;
    updateTargetValue(tenantId: string, id: string, data: UpdateKpiTargetValueDto): Promise<KpiTargetValueDto>;
}
export {};
