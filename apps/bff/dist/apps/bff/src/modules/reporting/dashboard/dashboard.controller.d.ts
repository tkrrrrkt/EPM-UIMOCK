import { DashboardBffService } from './dashboard.service';
import type { BffDashboardListDto, BffDashboardDetailDto, BffCreateDashboardDto, BffUpdateDashboardDto, BffDashboardTemplateListDto, BffWidgetDataRequestDto, BffWidgetDataResponseDto, BffDashboardSelectorsRequestDto, BffDashboardSelectorsResponseDto, BffKpiDefinitionOptionListDto } from '@epm/contracts/bff/dashboard';
interface GetDashboardsQueryDto {
    page?: string;
    pageSize?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    keyword?: string;
}
export declare class DashboardBffController {
    private readonly service;
    constructor(service: DashboardBffService);
    private validateTenantId;
    private validateUserId;
    private validateCompanyId;
    getDashboards(tenantId: string, query: GetDashboardsQueryDto): Promise<BffDashboardListDto>;
    getTemplates(tenantId: string): Promise<BffDashboardTemplateListDto>;
    getSelectors(tenantId: string, companyId: string, query?: BffDashboardSelectorsRequestDto): Promise<BffDashboardSelectorsResponseDto>;
    getKpiDefinitionSelectors(tenantId: string, companyId: string): Promise<BffKpiDefinitionOptionListDto>;
    getDashboard(tenantId: string, id: string): Promise<BffDashboardDetailDto>;
    createDashboard(tenantId: string, userId: string, data: BffCreateDashboardDto): Promise<BffDashboardDetailDto>;
    updateDashboard(tenantId: string, userId: string, id: string, data: BffUpdateDashboardDto): Promise<BffDashboardDetailDto>;
    deleteDashboard(tenantId: string, userId: string, id: string): Promise<void>;
    duplicateDashboard(tenantId: string, userId: string, id: string): Promise<BffDashboardDetailDto>;
    getWidgetData(tenantId: string, companyId: string, dashboardId: string, widgetId: string, request: BffWidgetDataRequestDto): Promise<BffWidgetDataResponseDto>;
}
export {};
