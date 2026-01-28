import { KpiFactAmountRepository } from '../repositories/kpi-fact-amount.repository';
import type { KpiFactAmountApiDto, CreateKpiFactAmountApiDto, UpdateKpiFactAmountApiDto } from '@epm/contracts/api/kpi-master';
export declare class KpiFactAmountService {
    private readonly kpiFactAmountRepository;
    constructor(kpiFactAmountRepository: KpiFactAmountRepository);
    findByItemId(tenantId: string, kpiDefinitionId: string, eventId: string, departmentStableId?: string): Promise<KpiFactAmountApiDto[]>;
    createFactAmount(tenantId: string, userId: string, data: Omit<CreateKpiFactAmountApiDto, 'tenant_id' | 'created_by'> & {
        company_id: string;
    }): Promise<KpiFactAmountApiDto>;
    updateFactAmount(tenantId: string, id: string, userId: string, data: Omit<UpdateKpiFactAmountApiDto, 'updated_by'>): Promise<KpiFactAmountApiDto>;
}
