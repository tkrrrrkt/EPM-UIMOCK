import { PrismaService } from '../../../../prisma/prisma.service';
import type { KpiDefinitionApiDto, CreateKpiDefinitionApiDto, GetKpiDefinitionsApiQueryDto } from '@epm/contracts/api/kpi-master';
export declare class KpiDefinitionRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(tenantId: string, query: Omit<GetKpiDefinitionsApiQueryDto, 'tenant_id'>): Promise<{
        items: KpiDefinitionApiDto[];
        total: number;
    }>;
    findById(tenantId: string, id: string): Promise<KpiDefinitionApiDto | null>;
    findByKpiCode(tenantId: string, companyId: string, kpiCode: string): Promise<KpiDefinitionApiDto | null>;
    create(tenantId: string, data: CreateKpiDefinitionApiDto & {
        created_by?: string;
    }): Promise<KpiDefinitionApiDto>;
    private mapToApiDto;
}
