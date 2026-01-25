import { KpiFactAmountRepository } from '../repositories/kpi-fact-amount.repository';
import { KpiFactAmountApiDto, CreateKpiFactAmountApiDto } from '@epm-sdd/contracts/api/kpi-master';
export declare class KpiFactAmountService {
    private readonly factAmountRepository;
    constructor(factAmountRepository: KpiFactAmountRepository);
    findByItemId(tenantId: string, kpiDefinitionId: string, eventId: string): Promise<KpiFactAmountApiDto[]>;
    create(tenantId: string, data: CreateKpiFactAmountApiDto, userId?: string): Promise<KpiFactAmountApiDto>;
    update(tenantId: string, id: string, data: Partial<CreateKpiFactAmountApiDto>, userId?: string): Promise<KpiFactAmountApiDto>;
}
