import { KpiMasterItemRepository } from '../repositories/kpi-master-item.repository';
import { KpiMasterEventRepository } from '../repositories/kpi-master-event.repository';
import type { KpiMasterItemApiDto, CreateKpiMasterItemApiDto, UpdateKpiMasterItemApiDto, GetKpiMasterItemsApiQueryDto } from '@epm/contracts/api/kpi-master';
export interface UserContext {
    userId: string;
    permissions: string[];
    controlDepartmentStableIds: string[];
}
export declare class KpiMasterItemService {
    private readonly kpiMasterItemRepository;
    private readonly kpiMasterEventRepository;
    constructor(kpiMasterItemRepository: KpiMasterItemRepository, kpiMasterEventRepository: KpiMasterEventRepository);
    findAllItems(tenantId: string, query: Omit<GetKpiMasterItemsApiQueryDto, 'tenant_id'>, userContext: UserContext): Promise<KpiMasterItemApiDto[]>;
    findItemById(tenantId: string, id: string, userContext: UserContext): Promise<KpiMasterItemApiDto>;
    createItem(tenantId: string, userId: string, data: Omit<CreateKpiMasterItemApiDto, 'tenant_id' | 'created_by'> & {
        company_id: string;
    }): Promise<KpiMasterItemApiDto>;
    updateItem(tenantId: string, id: string, userId: string, data: Omit<UpdateKpiMasterItemApiDto, 'updated_by'>, userContext: UserContext): Promise<KpiMasterItemApiDto>;
    deleteItem(tenantId: string, id: string, userId: string, userContext: UserContext): Promise<void>;
    private validateKpiTypeReferences;
    private checkReadPermission;
    private checkWritePermission;
}
