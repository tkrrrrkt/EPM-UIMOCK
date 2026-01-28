import { HttpService } from '@nestjs/axios';
import type { BffDashboardDetailDto, BffDashboardListDto, BffDashboardTemplateListDto, BffCreateDashboardDto, BffUpdateDashboardDto, BffWidgetDataRequestDto, BffWidgetDataResponseDto, BffDashboardSelectorsRequestDto, BffDashboardSelectorsResponseDto, BffKpiDefinitionOptionListDto } from '@epm/contracts/bff/dashboard';
interface GetDashboardsQuery {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    keyword?: string;
}
export declare class DashboardBffService {
    private readonly httpService;
    private readonly apiBaseUrl;
    constructor(httpService: HttpService);
    private normalizeQuery;
    private createHeaders;
    getDashboards(tenantId: string, query: GetDashboardsQuery): Promise<BffDashboardListDto>;
    getDashboard(tenantId: string, id: string): Promise<BffDashboardDetailDto>;
    createDashboard(tenantId: string, userId: string, data: BffCreateDashboardDto): Promise<BffDashboardDetailDto>;
    updateDashboard(tenantId: string, userId: string, id: string, data: BffUpdateDashboardDto): Promise<BffDashboardDetailDto>;
    deleteDashboard(tenantId: string, userId: string, id: string): Promise<void>;
    duplicateDashboard(tenantId: string, userId: string, id: string): Promise<BffDashboardDetailDto>;
    getWidgetData(tenantId: string, companyId: string, dashboardId: string, widgetId: string, request: BffWidgetDataRequestDto): Promise<BffWidgetDataResponseDto>;
    getTemplates(tenantId: string): Promise<BffDashboardTemplateListDto>;
    getSelectors(tenantId: string, companyId: string, query?: BffDashboardSelectorsRequestDto): Promise<BffDashboardSelectorsResponseDto>;
    getKpiDefinitions(tenantId: string, companyId: string): Promise<BffKpiDefinitionOptionListDto>;
}
export {};
