import { KpiMasterEventService } from './services/kpi-master-event.service';
import { KpiMasterItemService } from './services/kpi-master-item.service';
import { KpiDefinitionService } from './services/kpi-definition.service';
import { KpiFactAmountService } from './services/kpi-fact-amount.service';
import { KpiTargetValueService } from './services/kpi-target-value.service';
import type { KpiMasterEventApiDto, CreateKpiMasterEventApiDto, GetKpiMasterEventsApiQueryDto, KpiMasterItemApiDto, CreateKpiMasterItemApiDto, UpdateKpiMasterItemApiDto, GetKpiMasterItemsApiQueryDto, KpiDefinitionApiDto, CreateKpiDefinitionApiDto, GetKpiDefinitionsApiQueryDto, KpiFactAmountApiDto, CreateKpiFactAmountApiDto, UpdateKpiFactAmountApiDto, KpiTargetValueApiDto, CreateKpiTargetValueApiDto, UpdateKpiTargetValueApiDto } from '@epm/contracts/api/kpi-master';
export declare class KpiMasterController {
    private readonly kpiMasterEventService;
    private readonly kpiMasterItemService;
    private readonly kpiDefinitionService;
    private readonly kpiFactAmountService;
    private readonly kpiTargetValueService;
    constructor(kpiMasterEventService: KpiMasterEventService, kpiMasterItemService: KpiMasterItemService, kpiDefinitionService: KpiDefinitionService, kpiFactAmountService: KpiFactAmountService, kpiTargetValueService: KpiTargetValueService);
    createEvent(tenantId: string, userId: string, companyId: string, data: Omit<CreateKpiMasterEventApiDto, 'tenant_id' | 'created_by'>): Promise<KpiMasterEventApiDto>;
    confirmEvent(tenantId: string, userId: string, id: string): Promise<KpiMasterEventApiDto>;
    getEvents(tenantId: string, companyId: string, query: Omit<GetKpiMasterEventsApiQueryDto, 'tenant_id' | 'company_id'>): Promise<{
        items: KpiMasterEventApiDto[];
        total: number;
    }>;
    getEvent(tenantId: string, id: string): Promise<KpiMasterEventApiDto>;
    createItem(tenantId: string, userId: string, companyId: string, data: Omit<CreateKpiMasterItemApiDto, 'tenant_id' | 'created_by'>): Promise<KpiMasterItemApiDto>;
    updateItem(tenantId: string, userId: string, id: string, data: Omit<UpdateKpiMasterItemApiDto, 'updated_by'>): Promise<KpiMasterItemApiDto>;
    deleteItem(tenantId: string, userId: string, id: string): Promise<void>;
    getItems(tenantId: string, userId: string, query: Omit<GetKpiMasterItemsApiQueryDto, 'tenant_id'>): Promise<KpiMasterItemApiDto[]>;
    getItem(tenantId: string, userId: string, id: string): Promise<KpiMasterItemApiDto>;
    getSelectableSubjects(tenantId: string, companyId: string): Promise<any[]>;
    getSelectableMetrics(tenantId: string, companyId: string): Promise<any[]>;
    createKpiDefinition(tenantId: string, userId: string, companyId: string, data: Omit<CreateKpiDefinitionApiDto, 'tenant_id' | 'created_by'>): Promise<KpiDefinitionApiDto>;
    getKpiDefinitions(tenantId: string, companyId: string, query: Omit<GetKpiDefinitionsApiQueryDto, 'tenant_id' | 'company_id'>): Promise<{
        items: KpiDefinitionApiDto[];
        total: number;
    }>;
    createFactAmount(tenantId: string, userId: string, companyId: string, data: Omit<CreateKpiFactAmountApiDto, 'tenant_id' | 'created_by'>): Promise<KpiFactAmountApiDto>;
    updateFactAmount(tenantId: string, userId: string, id: string, data: Omit<UpdateKpiFactAmountApiDto, 'updated_by'>): Promise<KpiFactAmountApiDto>;
    createTargetValue(tenantId: string, data: Omit<CreateKpiTargetValueApiDto, 'tenant_id'>): Promise<KpiTargetValueApiDto>;
    updateTargetValue(tenantId: string, id: string, data: UpdateKpiTargetValueApiDto): Promise<KpiTargetValueApiDto>;
    private validateTenantId;
    private validateUserId;
    private validateCompanyId;
    private extractUserContext;
}
