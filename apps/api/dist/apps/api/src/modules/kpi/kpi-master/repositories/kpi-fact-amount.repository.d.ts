import { PrismaService } from '../../../../prisma/prisma.service';
import type { KpiFactAmountApiDto, CreateKpiFactAmountApiDto, UpdateKpiFactAmountApiDto } from '@epm/contracts/api/kpi-master';
export declare class KpiFactAmountRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByItemId(tenantId: string, kpiDefinitionId: string, eventId: string, departmentStableId?: string): Promise<KpiFactAmountApiDto[]>;
    findByPeriod(tenantId: string, eventId: string, kpiDefinitionId: string, periodCode: string, departmentStableId?: string): Promise<KpiFactAmountApiDto | null>;
    create(tenantId: string, data: CreateKpiFactAmountApiDto & {
        company_id: string;
        created_by?: string;
    }): Promise<KpiFactAmountApiDto>;
    update(tenantId: string, id: string, data: UpdateKpiFactAmountApiDto & {
        updated_by?: string;
    }): Promise<KpiFactAmountApiDto>;
    private mapToApiDto;
}
