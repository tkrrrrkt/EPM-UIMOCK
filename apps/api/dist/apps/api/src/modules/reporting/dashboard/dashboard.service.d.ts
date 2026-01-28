import { DashboardRepository } from './dashboard.repository';
import { ApiDashboardDto, ApiDashboardDetailDto, ApiCreateDashboardDto, ApiUpdateDashboardDto } from '@epm/contracts/api/dashboard';
export declare class DashboardService {
    private readonly dashboardRepository;
    constructor(dashboardRepository: DashboardRepository);
    findAll(tenantId: string): Promise<ApiDashboardDto[]>;
    findById(tenantId: string, id: string): Promise<ApiDashboardDetailDto>;
    create(tenantId: string, userId: string, data: ApiCreateDashboardDto): Promise<ApiDashboardDetailDto>;
    update(tenantId: string, id: string, data: ApiUpdateDashboardDto, userId: string): Promise<ApiDashboardDetailDto>;
    delete(tenantId: string, id: string, userId: string): Promise<void>;
    duplicate(tenantId: string, userId: string, id: string): Promise<ApiDashboardDetailDto>;
    findTemplates(tenantId: string): Promise<ApiDashboardDto[]>;
}
