import { PrismaService } from '../../../../prisma/prisma.service';
import { KpiTargetValueApiDto, CreateKpiTargetValueApiDto } from '@epm-sdd/contracts/api/kpi-master';
export declare class KpiTargetValueRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByItemId(tenantId: string, kpiMasterItemId: string): Promise<KpiTargetValueApiDto[]>;
    findById(tenantId: string, id: string): Promise<KpiTargetValueApiDto | null>;
    create(tenantId: string, data: CreateKpiTargetValueApiDto): Promise<KpiTargetValueApiDto>;
    update(tenantId: string, id: string, data: Partial<CreateKpiTargetValueApiDto>): Promise<KpiTargetValueApiDto | null>;
    private mapToApiDto;
}
