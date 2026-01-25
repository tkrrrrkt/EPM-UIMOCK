import { KpiTargetValueRepository } from '../repositories/kpi-target-value.repository';
import { KpiTargetValueApiDto, CreateKpiTargetValueApiDto } from '@epm-sdd/contracts/api/kpi-master';
export declare class KpiTargetValueService {
    private readonly targetValueRepository;
    constructor(targetValueRepository: KpiTargetValueRepository);
    findByItemId(tenantId: string, kpiMasterItemId: string): Promise<KpiTargetValueApiDto[]>;
    create(tenantId: string, data: CreateKpiTargetValueApiDto, userId?: string): Promise<KpiTargetValueApiDto>;
    update(tenantId: string, id: string, data: Partial<CreateKpiTargetValueApiDto>, userId?: string): Promise<KpiTargetValueApiDto>;
}
