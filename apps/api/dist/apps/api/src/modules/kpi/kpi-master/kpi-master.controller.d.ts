import { KpiMasterEventService } from './services/kpi-master-event.service';
import { KpiMasterItemService } from './services/kpi-master-item.service';
import { KpiDefinitionService } from './services/kpi-definition.service';
import { KpiFactAmountService } from './services/kpi-fact-amount.service';
import { KpiTargetValueService } from './services/kpi-target-value.service';
import { KpiMasterEventApiDto, CreateKpiMasterEventApiDto, GetKpiMasterEventsApiQueryDto, KpiMasterItemApiDto, CreateKpiMasterItemApiDto, UpdateKpiMasterItemApiDto, GetKpiMasterItemsApiQueryDto, KpiDefinitionApiDto, CreateKpiDefinitionApiDto, KpiFactAmountApiDto, CreateKpiFactAmountApiDto, KpiTargetValueApiDto, CreateKpiTargetValueApiDto } from '@epm-sdd/contracts/api/kpi-master';
export declare class KpiMasterController {
    private readonly eventService;
    private readonly itemService;
    private readonly definitionService;
    private readonly factAmountService;
    private readonly targetValueService;
    constructor(eventService: KpiMasterEventService, itemService: KpiMasterItemService, definitionService: KpiDefinitionService, factAmountService: KpiFactAmountService, targetValueService: KpiTargetValueService);
    getEvents(tenantId: string, query: GetKpiMasterEventsApiQueryDto): Promise<{
        data: KpiMasterEventApiDto[];
        total: number;
    }>;
    getEvent(tenantId: string, id: string): Promise<KpiMasterEventApiDto>;
    createEvent(tenantId: string, userId: string, data: CreateKpiMasterEventApiDto): Promise<KpiMasterEventApiDto>;
    updateEvent(tenantId: string, userId: string, id: string, data: Partial<CreateKpiMasterEventApiDto>): Promise<KpiMasterEventApiDto>;
    confirmEvent(tenantId: string, userId: string, id: string): Promise<KpiMasterEventApiDto>;
    getItems(tenantId: string, query: GetKpiMasterItemsApiQueryDto): Promise<{
        data: KpiMasterItemApiDto[];
        total: number;
    }>;
    getItem(tenantId: string, id: string): Promise<KpiMasterItemApiDto>;
    getItemsByEvent(tenantId: string, eventId: string): Promise<KpiMasterItemApiDto[]>;
    createItem(tenantId: string, userId: string, data: CreateKpiMasterItemApiDto): Promise<KpiMasterItemApiDto>;
    updateItem(tenantId: string, userId: string, id: string, data: UpdateKpiMasterItemApiDto): Promise<KpiMasterItemApiDto>;
    deleteItem(tenantId: string, userId: string, id: string): Promise<void>;
    getDefinitions(tenantId: string, companyId?: string, keyword?: string, offset?: string, limit?: string, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<{
        data: KpiDefinitionApiDto[];
        total: number;
    }>;
    createDefinition(tenantId: string, userId: string, data: CreateKpiDefinitionApiDto): Promise<KpiDefinitionApiDto>;
    getFactAmounts(tenantId: string, definitionId: string, eventId: string): Promise<KpiFactAmountApiDto[]>;
    createFactAmount(tenantId: string, userId: string, data: CreateKpiFactAmountApiDto): Promise<KpiFactAmountApiDto>;
    updateFactAmount(tenantId: string, userId: string, id: string, data: Partial<CreateKpiFactAmountApiDto>): Promise<KpiFactAmountApiDto>;
    getTargetValues(tenantId: string, itemId: string): Promise<KpiTargetValueApiDto[]>;
    createTargetValue(tenantId: string, userId: string, data: CreateKpiTargetValueApiDto): Promise<KpiTargetValueApiDto>;
    updateTargetValue(tenantId: string, userId: string, id: string, data: Partial<CreateKpiTargetValueApiDto>): Promise<KpiTargetValueApiDto>;
}
