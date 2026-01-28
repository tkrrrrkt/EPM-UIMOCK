import { PrismaService } from '../../../../prisma/prisma.service';
import type { KpiMasterItemApiDto, CreateKpiMasterItemApiDto, UpdateKpiMasterItemApiDto, GetKpiMasterItemsApiQueryDto } from '@epm/contracts/api/kpi-master';
export declare class KpiMasterItemRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(tenantId: string, query: Omit<GetKpiMasterItemsApiQueryDto, 'tenant_id'>): Promise<KpiMasterItemApiDto[]>;
    findById(tenantId: string, id: string): Promise<KpiMasterItemApiDto | null>;
    findByEventId(tenantId: string, eventId: string): Promise<KpiMasterItemApiDto[]>;
    findByKpiCode(tenantId: string, eventId: string, kpiCode: string): Promise<KpiMasterItemApiDto | null>;
    hasChildren(tenantId: string, parentId: string): Promise<boolean>;
    create(tenantId: string, data: CreateKpiMasterItemApiDto): Promise<KpiMasterItemApiDto>;
    update(tenantId: string, id: string, data: UpdateKpiMasterItemApiDto): Promise<KpiMasterItemApiDto>;
    delete(tenantId: string, id: string): Promise<void>;
    private mapToApiDto;
}
