import { PrismaService } from '../../../prisma/prisma.service';
import { ApiDashboardDto, ApiDashboardDetailDto, ApiCreateDashboardDto, ApiUpdateDashboardDto } from '@epm/contracts/api/dashboard';
export declare class DashboardRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(tenantId: string): Promise<ApiDashboardDto[]>;
    findById(tenantId: string, id: string): Promise<ApiDashboardDto | null>;
    findByIdWithWidgets(tenantId: string, id: string): Promise<ApiDashboardDetailDto | null>;
    create(tenantId: string, data: ApiCreateDashboardDto, userId?: string): Promise<ApiDashboardDetailDto>;
    update(tenantId: string, id: string, data: ApiUpdateDashboardDto, userId?: string): Promise<ApiDashboardDetailDto | null>;
    softDelete(tenantId: string, id: string, deletedBy: string): Promise<boolean>;
    findTemplates(tenantId: string): Promise<ApiDashboardDto[]>;
    findTemplateByIdWithWidgets(tenantId: string, templateId: string): Promise<ApiDashboardDetailDto | null>;
    private mapToApiDto;
    private mapToDetailDto;
    private mapToWidgetDto;
}
