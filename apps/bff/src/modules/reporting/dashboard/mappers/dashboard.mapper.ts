/**
 * Dashboard Mapper
 *
 * Transforms API DTOs to BFF DTOs
 * - snake_case → camelCase conversion (handled by contracts)
 * - JSONB config → typed interface conversion
 *
 * Reference: .kiro/specs/reporting/dashboard/design.md (Task 9.1)
 */
import type {
  BffDashboardDto,
  BffDashboardDetailDto,
  BffWidgetDto,
  BffDashboardListDto,
  BffDashboardTemplateDto,
  BffDashboardTemplateListDto,
  BffWidgetDataResponseDto,
  BffDataPoint,
  BffDashboardSelectorsResponseDto,
  BffPlanEventOption,
  BffPlanVersionOption,
  BffDepartmentNode,
  BffKpiDefinitionOption,
  BffKpiDefinitionOptionListDto,
} from '@epm/contracts/bff/dashboard';
import type {
  ApiDashboardDto,
  ApiDashboardDetailDto,
  ApiWidgetDto,
  ApiWidgetDataResponseDto,
  ApiDataPoint,
  ApiDashboardSelectorsResponseDto,
  ApiPlanEventOption,
  ApiPlanVersionOption,
  ApiDepartmentNode,
  ApiKpiDefinitionOption,
  ApiKpiDefinitionOptionListDto,
} from '@epm/contracts/api/dashboard';

export const DashboardMapper = {
  /**
   * Map API Dashboard DTO to BFF Dashboard DTO
   */
  toDashboard(api: ApiDashboardDto): BffDashboardDto {
    return {
      id: api.id,
      name: api.name,
      description: api.description,
      ownerType: api.ownerType,
      ownerId: api.ownerId,
      isActive: api.isActive,
      sortOrder: api.sortOrder,
      createdAt: api.createdAt,
      updatedAt: api.updatedAt,
      createdBy: api.createdBy,
      updatedBy: api.updatedBy,
    };
  },

  /**
   * Map API Widget DTO to BFF Widget DTO
   */
  toWidget(api: ApiWidgetDto): BffWidgetDto {
    return {
      id: api.id,
      widgetType: api.widgetType,
      title: api.title,
      layout: api.layout,
      dataConfig: api.dataConfig,
      filterConfig: api.filterConfig,
      displayConfig: api.displayConfig,
      sortOrder: api.sortOrder,
    };
  },

  /**
   * Map API Dashboard Detail DTO to BFF Dashboard Detail DTO
   */
  toDashboardDetail(api: ApiDashboardDetailDto): BffDashboardDetailDto {
    return {
      ...DashboardMapper.toDashboard(api),
      globalFilterConfig: api.globalFilterConfig,
      widgets: api.widgets.map((w) => DashboardMapper.toWidget(w)),
    };
  },

  /**
   * Map API Dashboard array to BFF Dashboard List DTO
   */
  toDashboardList(
    items: ApiDashboardDto[],
    total: number,
    page: number,
    pageSize: number,
  ): BffDashboardListDto {
    return {
      items: items.map((item) => DashboardMapper.toDashboard(item)),
      total,
      page,
      pageSize,
    };
  },

  /**
   * Map API Dashboard to Template DTO
   */
  toTemplate(api: ApiDashboardDetailDto): BffDashboardTemplateDto {
    return {
      id: api.id,
      name: api.name,
      description: api.description,
      widgetCount: api.widgets?.length ?? 0,
    };
  },

  /**
   * Map API Dashboard array to Template List DTO
   */
  toTemplateList(items: ApiDashboardDetailDto[]): BffDashboardTemplateListDto {
    return {
      templates: items.map((item) => DashboardMapper.toTemplate(item)),
    };
  },

  /**
   * Map API Data Point to BFF Data Point
   */
  toDataPoint(api: ApiDataPoint): BffDataPoint {
    return {
      label: api.label,
      value: api.value,
      compareValue: api.compareValue,
    };
  },

  /**
   * Map API Widget Data Response to BFF Widget Data Response
   */
  toWidgetDataResponse(api: ApiWidgetDataResponseDto): BffWidgetDataResponseDto {
    return {
      widgetId: api.widgetId,
      dataPoints: api.dataPoints.map((dp) => DashboardMapper.toDataPoint(dp)),
      difference: api.difference,
      unit: api.unit,
      meta: api.meta,
    };
  },

  /**
   * Map API Plan Event Option to BFF Plan Event Option
   */
  toPlanEventOption(api: ApiPlanEventOption): BffPlanEventOption {
    return {
      id: api.id,
      eventCode: api.eventCode,
      eventName: api.eventName,
      scenarioType: api.scenarioType,
      fiscalYear: api.fiscalYear,
    };
  },

  /**
   * Map API Plan Version Option to BFF Plan Version Option
   */
  toPlanVersionOption(api: ApiPlanVersionOption): BffPlanVersionOption {
    return {
      id: api.id,
      versionCode: api.versionCode,
      versionName: api.versionName,
      status: api.status,
    };
  },

  /**
   * Map API Department Node to BFF Department Node (recursive)
   */
  toDepartmentNode(api: ApiDepartmentNode): BffDepartmentNode {
    return {
      stableId: api.stableId,
      departmentCode: api.departmentCode,
      departmentName: api.departmentName,
      level: api.level,
      hasChildren: api.hasChildren,
      children: api.children?.map((c) => DashboardMapper.toDepartmentNode(c)),
    };
  },

  /**
   * Map API Selectors Response to BFF Selectors Response
   */
  toSelectorsResponse(api: ApiDashboardSelectorsResponseDto): BffDashboardSelectorsResponseDto {
    return {
      fiscalYears: api.fiscalYears,
      planEvents: api.planEvents.map((pe) => DashboardMapper.toPlanEventOption(pe)),
      planVersions: api.planVersions.map((pv) => DashboardMapper.toPlanVersionOption(pv)),
      departments: api.departments.map((d) => DashboardMapper.toDepartmentNode(d)),
    };
  },

  /**
   * Map API KPI Definition Option to BFF Option
   */
  toKpiDefinitionOption(api: ApiKpiDefinitionOption): BffKpiDefinitionOption {
    return {
      id: api.id,
      kpiCode: api.kpiCode,
      kpiName: api.kpiName,
      unit: api.unit,
    };
  },

  /**
   * Map API KPI Definition Option List to BFF List
   */
  toKpiDefinitionOptionList(
    api: ApiKpiDefinitionOptionListDto,
  ): BffKpiDefinitionOptionListDto {
    return {
      items: api.items.map((item) => DashboardMapper.toKpiDefinitionOption(item)),
    };
  },
};
