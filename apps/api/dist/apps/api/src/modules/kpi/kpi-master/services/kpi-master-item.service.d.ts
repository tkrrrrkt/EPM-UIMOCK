import { KpiMasterItemRepository } from '../repositories/kpi-master-item.repository';
import { KpiMasterEventRepository } from '../repositories/kpi-master-event.repository';
import { SubjectRepository } from '../repositories/subject.repository';
import { MetricRepository } from '../repositories/metric.repository';
import { KpiMasterItemApiDto, CreateKpiMasterItemApiDto, UpdateKpiMasterItemApiDto, GetKpiMasterItemsApiQueryDto } from '@epm-sdd/contracts/api/kpi-master';
export declare class KpiMasterItemService {
    private readonly itemRepository;
    private readonly eventRepository;
    private readonly subjectRepository;
    private readonly metricRepository;
    constructor(itemRepository: KpiMasterItemRepository, eventRepository: KpiMasterEventRepository, subjectRepository: SubjectRepository, metricRepository: MetricRepository);
    findAll(tenantId: string, filters: GetKpiMasterItemsApiQueryDto, userPermissions?: {
        hasAdminPermission: boolean;
        controlDepartmentStableIds: string[];
    }): Promise<{
        data: KpiMasterItemApiDto[];
        total: number;
    }>;
    findById(tenantId: string, id: string, userPermissions?: {
        hasAdminPermission: boolean;
        controlDepartmentStableIds: string[];
    }): Promise<KpiMasterItemApiDto>;
    findByEventId(tenantId: string, eventId: string): Promise<KpiMasterItemApiDto[]>;
    create(tenantId: string, data: CreateKpiMasterItemApiDto, userId?: string): Promise<KpiMasterItemApiDto>;
    update(tenantId: string, id: string, data: UpdateKpiMasterItemApiDto, userId?: string): Promise<KpiMasterItemApiDto>;
    delete(tenantId: string, id: string, userId?: string): Promise<void>;
    private validateTypeReferences;
}
