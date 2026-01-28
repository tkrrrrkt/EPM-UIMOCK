import { KpiTargetValueRepository } from '../repositories/kpi-target-value.repository';
import type { KpiTargetValueApiDto, CreateKpiTargetValueApiDto, UpdateKpiTargetValueApiDto } from '@epm/contracts/api/kpi-master';
export declare class KpiTargetValueService {
    private readonly kpiTargetValueRepository;
    constructor(kpiTargetValueRepository: KpiTargetValueRepository);
    findByItemId(tenantId: string, kpiMasterItemId: string): Promise<KpiTargetValueApiDto[]>;
    createTargetValue(tenantId: string, data: Omit<CreateKpiTargetValueApiDto, 'tenant_id'>): Promise<KpiTargetValueApiDto>;
    updateTargetValue(tenantId: string, id: string, data: UpdateKpiTargetValueApiDto): Promise<KpiTargetValueApiDto>;
}
