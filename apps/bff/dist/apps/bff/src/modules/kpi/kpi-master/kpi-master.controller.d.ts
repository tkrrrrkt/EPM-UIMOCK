import { KpiMasterBffService } from './kpi-master.service';
import type { KpiMasterSummaryDto, KpiMasterEventListDto, KpiMasterEventDetailDto, CreateKpiMasterEventDto, KpiMasterItemDto, KpiMasterItemDetailDto, CreateKpiMasterItemDto, UpdateKpiMasterItemDto, SelectableSubjectListDto, SelectableMetricListDto, KpiDefinitionListDto, CreateKpiDefinitionDto, CreateKpiFactAmountDto, UpdateKpiFactAmountDto, KpiFactAmountDto, CreateKpiTargetValueDto, UpdateKpiTargetValueDto, KpiTargetValueDto } from '@epm/contracts/bff/kpi-master';
interface GetEventsQueryDto {
    page?: string;
    pageSize?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    keyword?: string;
    fiscalYear?: string;
    status?: 'DRAFT' | 'CONFIRMED';
}
interface GetItemsQueryDto {
    eventId?: string;
    kpiType?: 'FINANCIAL' | 'NON_FINANCIAL' | 'METRIC';
    departmentStableIds?: string | string[];
    hierarchyLevel?: string;
}
interface GetKpiDefinitionsQueryDto {
    page?: string;
    pageSize?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    keyword?: string;
}
export declare class KpiMasterBffController {
    private readonly service;
    constructor(service: KpiMasterBffService);
    private validateTenantId;
    private validateUserId;
    private validateCompanyId;
    getSummary(tenantId: string, eventId?: string): Promise<KpiMasterSummaryDto>;
    getEvents(tenantId: string, companyId: string, query: GetEventsQueryDto): Promise<KpiMasterEventListDto>;
    getEvent(tenantId: string, id: string): Promise<KpiMasterEventDetailDto>;
    createEvent(tenantId: string, companyId: string, userId: string, data: CreateKpiMasterEventDto): Promise<KpiMasterEventDetailDto>;
    confirmEvent(tenantId: string, userId: string, id: string): Promise<KpiMasterEventDetailDto>;
    getItems(tenantId: string, companyId: string, userId: string, query: GetItemsQueryDto): Promise<KpiMasterItemDto[]>;
    getItem(tenantId: string, userId: string, id: string): Promise<KpiMasterItemDetailDto>;
    createItem(tenantId: string, companyId: string, userId: string, data: CreateKpiMasterItemDto): Promise<KpiMasterItemDetailDto>;
    updateItem(tenantId: string, userId: string, id: string, data: UpdateKpiMasterItemDto): Promise<KpiMasterItemDetailDto>;
    deleteItem(tenantId: string, userId: string, id: string): Promise<void>;
    getSelectableSubjects(tenantId: string, companyId: string): Promise<SelectableSubjectListDto>;
    getSelectableMetrics(tenantId: string, companyId: string): Promise<SelectableMetricListDto>;
    getKpiDefinitions(tenantId: string, companyId: string, query: GetKpiDefinitionsQueryDto): Promise<KpiDefinitionListDto>;
    createKpiDefinition(tenantId: string, companyId: string, userId: string, data: CreateKpiDefinitionDto): Promise<KpiDefinitionListDto>;
    createFactAmount(tenantId: string, companyId: string, userId: string, data: CreateKpiFactAmountDto): Promise<KpiFactAmountDto>;
    updateFactAmount(tenantId: string, userId: string, id: string, data: UpdateKpiFactAmountDto): Promise<KpiFactAmountDto>;
    createTargetValue(tenantId: string, data: CreateKpiTargetValueDto): Promise<KpiTargetValueDto>;
    updateTargetValue(tenantId: string, id: string, data: UpdateKpiTargetValueDto): Promise<KpiTargetValueDto>;
}
export {};
