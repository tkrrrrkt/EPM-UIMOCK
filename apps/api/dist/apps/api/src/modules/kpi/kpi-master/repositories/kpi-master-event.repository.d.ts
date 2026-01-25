import { PrismaService } from '../../../../prisma/prisma.service';
import { KpiMasterEventApiDto, CreateKpiMasterEventApiDto, GetKpiMasterEventsApiQueryDto } from '@epm-sdd/contracts/api/kpi-master';
import { KpiMasterEventStatus } from '@epm-sdd/contracts/shared/enums/kpi';
export declare class KpiMasterEventRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(tenantId: string, filters: GetKpiMasterEventsApiQueryDto): Promise<{
        data: KpiMasterEventApiDto[];
        total: number;
    }>;
    findById(tenantId: string, id: string): Promise<KpiMasterEventApiDto | null>;
    findByEventCode(tenantId: string, companyId: string, eventCode: string): Promise<KpiMasterEventApiDto | null>;
    create(tenantId: string, data: CreateKpiMasterEventApiDto, userId?: string): Promise<KpiMasterEventApiDto>;
    update(tenantId: string, id: string, data: Partial<CreateKpiMasterEventApiDto> & {
        status?: KpiMasterEventStatus;
    }, userId?: string): Promise<KpiMasterEventApiDto | null>;
    private mapToApiDto;
}
