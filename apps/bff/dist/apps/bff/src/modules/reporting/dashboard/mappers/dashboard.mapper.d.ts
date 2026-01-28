import type { BffDashboardDto, BffDashboardDetailDto, BffWidgetDto, BffDashboardListDto, BffDashboardTemplateDto, BffDashboardTemplateListDto, BffWidgetDataResponseDto, BffDataPoint, BffDashboardSelectorsResponseDto, BffPlanEventOption, BffPlanVersionOption, BffDepartmentNode, BffKpiDefinitionOption, BffKpiDefinitionOptionListDto } from '@epm/contracts/bff/dashboard';
import type { ApiDashboardDto, ApiDashboardDetailDto, ApiWidgetDto, ApiWidgetDataResponseDto, ApiDataPoint, ApiDashboardSelectorsResponseDto, ApiPlanEventOption, ApiPlanVersionOption, ApiDepartmentNode, ApiKpiDefinitionOption, ApiKpiDefinitionOptionListDto } from '@epm/contracts/api/dashboard';
export declare const DashboardMapper: {
    toDashboard(api: ApiDashboardDto): BffDashboardDto;
    toWidget(api: ApiWidgetDto): BffWidgetDto;
    toDashboardDetail(api: ApiDashboardDetailDto): BffDashboardDetailDto;
    toDashboardList(items: ApiDashboardDto[], total: number, page: number, pageSize: number): BffDashboardListDto;
    toTemplate(api: ApiDashboardDetailDto): BffDashboardTemplateDto;
    toTemplateList(items: ApiDashboardDetailDto[]): BffDashboardTemplateListDto;
    toDataPoint(api: ApiDataPoint): BffDataPoint;
    toWidgetDataResponse(api: ApiWidgetDataResponseDto): BffWidgetDataResponseDto;
    toPlanEventOption(api: ApiPlanEventOption): BffPlanEventOption;
    toPlanVersionOption(api: ApiPlanVersionOption): BffPlanVersionOption;
    toDepartmentNode(api: ApiDepartmentNode): BffDepartmentNode;
    toSelectorsResponse(api: ApiDashboardSelectorsResponseDto): BffDashboardSelectorsResponseDto;
    toKpiDefinitionOption(api: ApiKpiDefinitionOption): BffKpiDefinitionOption;
    toKpiDefinitionOptionList(api: ApiKpiDefinitionOptionListDto): BffKpiDefinitionOptionListDto;
};
