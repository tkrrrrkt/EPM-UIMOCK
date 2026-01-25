import { KpiMasterEventRepository } from '../repositories/kpi-master-event.repository';
import { KpiMasterEventApiDto, CreateKpiMasterEventApiDto, GetKpiMasterEventsApiQueryDto } from '@epm-sdd/contracts/api/kpi-master';
export declare class KpiMasterEventService {
    private readonly eventRepository;
    constructor(eventRepository: KpiMasterEventRepository);
    findAll(tenantId: string, filters: GetKpiMasterEventsApiQueryDto): Promise<{
        data: KpiMasterEventApiDto[];
        total: number;
    }>;
    findById(tenantId: string, id: string): Promise<KpiMasterEventApiDto>;
    create(tenantId: string, data: CreateKpiMasterEventApiDto, userId?: string): Promise<KpiMasterEventApiDto>;
    update(tenantId: string, id: string, data: Partial<CreateKpiMasterEventApiDto>, userId?: string): Promise<KpiMasterEventApiDto>;
    confirm(tenantId: string, id: string, userId?: string): Promise<KpiMasterEventApiDto>;
}
