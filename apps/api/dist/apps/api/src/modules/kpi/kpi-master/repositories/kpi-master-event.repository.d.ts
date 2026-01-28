import { PrismaService } from '../../../../prisma/prisma.service';
import type { KpiMasterEventApiDto, CreateKpiMasterEventApiDto, UpdateKpiMasterEventApiDto, GetKpiMasterEventsApiQueryDto } from '@epm/contracts/api/kpi-master';
export declare class KpiMasterEventRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(tenantId: string, query: Omit<GetKpiMasterEventsApiQueryDto, 'tenant_id' | 'company_id'> & {
        company_id: string;
    }): Promise<{
        items: KpiMasterEventApiDto[];
        total: number;
    }>;
    findById(tenantId: string, id: string): Promise<KpiMasterEventApiDto | null>;
    findByEventCode(tenantId: string, companyId: string, eventCode: string): Promise<KpiMasterEventApiDto | null>;
    create(tenantId: string, data: CreateKpiMasterEventApiDto & {
        created_by?: string;
    }): Promise<KpiMasterEventApiDto>;
    update(tenantId: string, id: string, data: UpdateKpiMasterEventApiDto & {
        updated_by?: string;
    }): Promise<KpiMasterEventApiDto>;
    private mapToApiDto;
}
