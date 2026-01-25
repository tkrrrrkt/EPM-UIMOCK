import { KpiMasterBffService } from './kpi-master.service';
import { GetKpiMasterEventsQueryDto, KpiMasterEventDto, KpiMasterEventListDto, CreateKpiMasterEventDto, GetKpiMasterItemsQueryDto, KpiMasterItemDto, KpiMasterItemDetailDto, KpiMasterItemListDto, CreateKpiMasterItemDto, UpdateKpiMasterItemDto } from '@epm-sdd/contracts/bff/kpi-master';
export declare class KpiMasterBffController {
    private readonly bffService;
    constructor(bffService: KpiMasterBffService);
    getEvents(tenantId: string, query: GetKpiMasterEventsQueryDto): Promise<KpiMasterEventListDto>;
    getEvent(tenantId: string, id: string): Promise<KpiMasterEventDto>;
    createEvent(tenantId: string, userId: string, data: CreateKpiMasterEventDto): Promise<KpiMasterEventDto>;
    updateEvent(tenantId: string, userId: string, id: string, data: Partial<CreateKpiMasterEventDto>): Promise<KpiMasterEventDto>;
    confirmEvent(tenantId: string, userId: string, id: string): Promise<KpiMasterEventDto>;
    getItems(tenantId: string, query: GetKpiMasterItemsQueryDto): Promise<KpiMasterItemListDto>;
    getItem(tenantId: string, id: string): Promise<KpiMasterItemDetailDto>;
    createItem(tenantId: string, userId: string, data: CreateKpiMasterItemDto): Promise<KpiMasterItemDto>;
    updateItem(tenantId: string, userId: string, id: string, data: UpdateKpiMasterItemDto): Promise<KpiMasterItemDto>;
    deleteItem(tenantId: string, userId: string, id: string): Promise<void>;
}
