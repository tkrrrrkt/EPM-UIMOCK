import { PrismaService } from '../../../../prisma/prisma.service';
import { KpiFactAmountApiDto, CreateKpiFactAmountApiDto } from '@epm-sdd/contracts/api/kpi-master';
export declare class KpiFactAmountRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByItemId(tenantId: string, kpiDefinitionId: string, eventId: string): Promise<KpiFactAmountApiDto[]>;
    findById(tenantId: string, id: string): Promise<KpiFactAmountApiDto | null>;
    create(tenantId: string, data: CreateKpiFactAmountApiDto, userId?: string): Promise<KpiFactAmountApiDto>;
    update(tenantId: string, id: string, data: Partial<CreateKpiFactAmountApiDto>, userId?: string): Promise<KpiFactAmountApiDto | null>;
    private mapToApiDto;
}
