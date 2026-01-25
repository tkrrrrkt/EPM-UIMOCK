import { PrismaService } from '../../../../prisma/prisma.service';
import { KpiDefinitionApiDto, CreateKpiDefinitionApiDto } from '@epm-sdd/contracts/api/kpi-master';
export declare class KpiDefinitionRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
    findById(tenantId: string, id: string): Promise<KpiDefinitionApiDto | null>;
    findByCode(tenantId: string, companyId: string, kpiCode: string): Promise<KpiDefinitionApiDto | null>;
    create(tenantId: string, data: CreateKpiDefinitionApiDto, userId?: string): Promise<KpiDefinitionApiDto>;
    private mapToApiDto;
}
