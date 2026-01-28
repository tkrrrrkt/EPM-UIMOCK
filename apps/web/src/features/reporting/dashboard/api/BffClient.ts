/**
 * Dashboard BffClient Interface
 *
 * Purpose:
 * - Define contract between UI and BFF for Dashboard feature
 * - UI must only use BFF DTOs (packages/contracts/src/bff/dashboard)
 * - Never import API contracts in UI layer
 *
 * Reference: .kiro/specs/reporting/dashboard/design.md (Task 11.1)
 */
import type {
  BffDashboardListDto,
  BffDashboardDetailDto,
  BffCreateDashboardDto,
  BffUpdateDashboardDto,
  BffDashboardTemplateListDto,
  BffWidgetDataRequestDto,
  BffWidgetDataResponseDto,
  BffDashboardSelectorsRequestDto,
  BffDashboardSelectorsResponseDto,
  BffKpiDefinitionOptionListDto,
} from '@epm/contracts/bff/dashboard';

/** Query parameters for dashboard list */
export interface GetDashboardsQuery {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  keyword?: string;
}

/**
 * BffClient interface for Dashboard feature
 * Implemented by:
 * - MockBffClient (UI-MOCK phase, hardcoded data)
 * - HttpBffClient (UI-BFF phase, real HTTP calls)
 */
export interface BffClient {
  /**
   * Get dashboard list with pagination
   */
  getDashboards(query?: GetDashboardsQuery): Promise<BffDashboardListDto>;

  /**
   * Get dashboard by ID with widgets
   */
  getDashboard(id: string): Promise<BffDashboardDetailDto>;

  /**
   * Create a new dashboard
   */
  createDashboard(data: BffCreateDashboardDto): Promise<BffDashboardDetailDto>;

  /**
   * Update a dashboard
   */
  updateDashboard(id: string, data: BffUpdateDashboardDto): Promise<BffDashboardDetailDto>;

  /**
   * Delete a dashboard
   */
  deleteDashboard(id: string): Promise<void>;

  /**
   * Duplicate a dashboard
   */
  duplicateDashboard(id: string): Promise<BffDashboardDetailDto>;

  /**
   * Get widget data
   */
  getWidgetData(
    dashboardId: string,
    widgetId: string,
    request: BffWidgetDataRequestDto,
  ): Promise<BffWidgetDataResponseDto>;

  /**
   * Get selectors (fiscal years, plan events, plan versions, departments)
   */
  getSelectors(query?: BffDashboardSelectorsRequestDto): Promise<BffDashboardSelectorsResponseDto>;

  /**
   * Get KPI definition selectors
   */
  getKpiDefinitions(): Promise<BffKpiDefinitionOptionListDto>;

  /**
   * Get dashboard templates
   */
  getTemplates(): Promise<BffDashboardTemplateListDto>;
}
