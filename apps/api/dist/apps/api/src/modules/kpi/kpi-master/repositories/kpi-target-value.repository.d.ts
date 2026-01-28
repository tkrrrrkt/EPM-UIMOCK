import { PrismaService } from '../../../../prisma/prisma.service';
import type { KpiTargetValueApiDto, CreateKpiTargetValueApiDto, UpdateKpiTargetValueApiDto } from '@epm/contracts/api/kpi-master';
export declare class KpiTargetValueRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByItemId(tenantId: string, kpiMasterItemId: string): Promise<KpiTargetValueApiDto[]>;
    findByPeriod(tenantId: string, kpiMasterItemId: string, periodCode: string): Promise<KpiTargetValueApiDto | null>;
    create(tenantId: string, data: CreateKpiTargetValueApiDto): Promise<KpiTargetValueApiDto>;
    update(tenantId: string, id: string, data: UpdateKpiTargetValueApiDto): Promise<KpiTargetValueApiDto>;
    private mapToApiDto;
}
