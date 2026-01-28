import { DashboardService } from './dashboard.service';
import { WidgetDataService } from './widget-data.service';
import { ApiDashboardDto, ApiDashboardDetailDto, ApiCreateDashboardDto, ApiUpdateDashboardDto, ApiWidgetDataRequestDto, ApiWidgetDataResponseDto, ApiDashboardSelectorsResponseDto, ApiKpiDefinitionOptionListDto } from '@epm/contracts/api/dashboard';
export declare class DashboardController {
    private readonly dashboardService;
    private readonly widgetDataService;
    constructor(dashboardService: DashboardService, widgetDataService: WidgetDataService);
    getDashboards(tenantId: string): Promise<ApiDashboardDto[]>;
    getTemplates(tenantId: string): Promise<ApiDashboardDto[]>;
    getSelectors(tenantId: string, companyId: string): Promise<ApiDashboardSelectorsResponseDto>;
    getKpiDefinitionSelectors(tenantId: string, companyId: string): Promise<ApiKpiDefinitionOptionListDto>;
    getDashboard(tenantId: string, id: string): Promise<ApiDashboardDetailDto>;
    createDashboard(tenantId: string, userId: string, data: ApiCreateDashboardDto): Promise<ApiDashboardDetailDto>;
    updateDashboard(tenantId: string, userId: string, id: string, data: ApiUpdateDashboardDto): Promise<ApiDashboardDetailDto>;
    deleteDashboard(tenantId: string, userId: string, id: string): Promise<void>;
    duplicateDashboard(tenantId: string, userId: string, id: string): Promise<ApiDashboardDetailDto>;
    getWidgetData(tenantId: string, companyId: string, dashboardId: string, widgetId: string, request: ApiWidgetDataRequestDto): Promise<ApiWidgetDataResponseDto>;
    private validateTenantId;
    private validateUserId;
    private validateCompanyId;
}
