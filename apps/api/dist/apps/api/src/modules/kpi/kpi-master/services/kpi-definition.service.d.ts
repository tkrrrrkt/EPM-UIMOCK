import { KpiDefinitionRepository } from '../repositories/kpi-definition.repository';
import { KpiDefinitionApiDto, CreateKpiDefinitionApiDto } from '@epm-sdd/contracts/api/kpi-master';
export declare class KpiDefinitionService {
    private readonly definitionRepository;
    constructor(definitionRepository: KpiDefinitionRepository);
    findAll(tenantId: string, filters: {
        companyId?: string;
        keyword?: string;
        offset: number;
        limit: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }): Promise<{
        data: KpiDefinitionApiDto[];
        total: number;
    }>;
    create(tenantId: string, data: CreateKpiDefinitionApiDto, userId?: string): Promise<KpiDefinitionApiDto>;
}
