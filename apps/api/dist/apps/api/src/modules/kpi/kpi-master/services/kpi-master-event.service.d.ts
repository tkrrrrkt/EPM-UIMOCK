import { KpiMasterEventRepository } from '../repositories/kpi-master-event.repository';
import type { KpiMasterEventApiDto, CreateKpiMasterEventApiDto, GetKpiMasterEventsApiQueryDto } from '@epm/contracts/api/kpi-master';
export declare class KpiMasterEventService {
    private readonly kpiMasterEventRepository;
    constructor(kpiMasterEventRepository: KpiMasterEventRepository);
    findAllEvents(tenantId: string, query: Omit<GetKpiMasterEventsApiQueryDto, 'tenant_id'>): Promise<{
        items: KpiMasterEventApiDto[];
        total: number;
    }>;
    findEventById(tenantId: string, id: string): Promise<KpiMasterEventApiDto>;
    createEvent(tenantId: string, userId: string, data: Omit<CreateKpiMasterEventApiDto, 'tenant_id' | 'created_by'> & {
        company_id: string;
    }): Promise<KpiMasterEventApiDto>;
    confirmEvent(tenantId: string, id: string, userId: string): Promise<KpiMasterEventApiDto>;
    updateEvent(tenantId: string, id: string, userId: string, data: {
        event_name: string;
    }): Promise<KpiMasterEventApiDto>;
}
