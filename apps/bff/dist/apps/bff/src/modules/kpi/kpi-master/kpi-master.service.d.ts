import { HttpService } from '@nestjs/common';
import { GetKpiMasterEventsQueryDto, KpiMasterEventDto, KpiMasterEventListDto, GetKpiMasterItemsQueryDto, KpiMasterItemDto, KpiMasterItemDetailDto, KpiMasterItemListDto, CreateKpiMasterEventDto, CreateKpiMasterItemDto, UpdateKpiMasterItemDto } from '@epm-sdd/contracts/bff/kpi-master';
export declare class KpiMasterBffService {
    private readonly httpService;
    private readonly apiBaseUrl;
    constructor(httpService: HttpService);
    getEvents(tenantId: string, query: GetKpiMasterEventsQueryDto): Promise<KpiMasterEventListDto>;
    getEventById(tenantId: string, id: string): Promise<KpiMasterEventDto>;
    createEvent(tenantId: string, userId: string, data: CreateKpiMasterEventDto): Promise<KpiMasterEventDto>;
    updateEvent(tenantId: string, userId: string, id: string, data: Partial<CreateKpiMasterEventDto>): Promise<KpiMasterEventDto>;
    confirmEvent(tenantId: string, userId: string, id: string): Promise<KpiMasterEventDto>;
    getItems(tenantId: string, query: GetKpiMasterItemsQueryDto): Promise<KpiMasterItemListDto>;
    getItemById(tenantId: string, id: string): Promise<KpiMasterItemDetailDto>;
    createItem(tenantId: string, userId: string, data: CreateKpiMasterItemDto): Promise<KpiMasterItemDto>;
    updateItem(tenantId: string, userId: string, id: string, data: UpdateKpiMasterItemDto): Promise<KpiMasterItemDto>;
    deleteItem(tenantId: string, userId: string, id: string): Promise<void>;
    private normalizePagingAndSorting;
    private callDomainApi;
}
