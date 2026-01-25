import { PrismaService } from '../../../../prisma/prisma.service';
import { KpiMasterItemApiDto, CreateKpiMasterItemApiDto, UpdateKpiMasterItemApiDto, GetKpiMasterItemsApiQueryDto } from '@epm-sdd/contracts/api/kpi-master';
export declare class KpiMasterItemRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(tenantId: string, filters: GetKpiMasterItemsApiQueryDto): Promise<{
        data: KpiMasterItemApiDto[];
        total: number;
    }>;
    findById(tenantId: string, id: string): Promise<KpiMasterItemApiDto | null>;
    findByEventId(tenantId: string, eventId: string): Promise<KpiMasterItemApiDto[]>;
    create(tenantId: string, data: CreateKpiMasterItemApiDto): Promise<KpiMasterItemApiDto>;
    update(tenantId: string, id: string, data: UpdateKpiMasterItemApiDto): Promise<KpiMasterItemApiDto | null>;
    delete(tenantId: string, id: string): Promise<boolean>;
    private mapToApiDto;
}
