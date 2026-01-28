import { KpiDefinitionRepository } from '../repositories/kpi-definition.repository';
import type { KpiDefinitionApiDto, CreateKpiDefinitionApiDto, GetKpiDefinitionsApiQueryDto } from '@epm/contracts/api/kpi-master';
export declare class KpiDefinitionService {
    private readonly kpiDefinitionRepository;
    constructor(kpiDefinitionRepository: KpiDefinitionRepository);
    findAllDefinitions(tenantId: string, query: Omit<GetKpiDefinitionsApiQueryDto, 'tenant_id'>): Promise<{
        items: KpiDefinitionApiDto[];
        total: number;
    }>;
    createDefinition(tenantId: string, userId: string, data: Omit<CreateKpiDefinitionApiDto, 'tenant_id' | 'created_by'> & {
        company_id: string;
    }): Promise<KpiDefinitionApiDto>;
}
