/**
 * Dashboard BFF Service
 *
 * Purpose:
 * - Call Domain API via HTTP with tenant context
 * - Apply paging normalization (page/pageSize → offset/limit)
 * - Transform API responses to BFF DTOs via DashboardMapper
 *
 * Paging Normalization:
 * - UI/BFF: page / pageSize (page-based)
 * - Domain API: offset / limit (DB-friendly)
 * - Defaults: page=1, pageSize=20
 * - Clamp: pageSize <= 100
 * - Whitelist: sortBy = name | sortOrder | updatedAt
 *
 * Reference: .kiro/specs/reporting/dashboard/design.md (Task 9.2)
 */
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { DashboardMapper } from './mappers/dashboard.mapper';
import type {
  BffDashboardDto,
  BffDashboardDetailDto,
  BffDashboardListDto,
  BffDashboardTemplateListDto,
  BffCreateDashboardDto,
  BffUpdateDashboardDto,
  BffWidgetDataRequestDto,
  BffWidgetDataResponseDto,
  BffDashboardSelectorsRequestDto,
  BffDashboardSelectorsResponseDto,
  BffKpiDefinitionOptionListDto,
} from '@epm/contracts/bff/dashboard';
import type {
  ApiDashboardDto,
  ApiDashboardDetailDto,
  ApiWidgetDataResponseDto,
  ApiDashboardSelectorsResponseDto,
  ApiKpiDefinitionOptionListDto,
} from '@epm/contracts/api/dashboard';

/** Query params for dashboard list */
interface GetDashboardsQuery {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  keyword?: string;
}

/** Allowed sortBy values */
const ALLOWED_SORT_BY = ['name', 'sortOrder', 'updatedAt'] as const;

@Injectable()
export class DashboardBffService {
  private readonly apiBaseUrl: string;

  constructor(private readonly httpService: HttpService) {
    // Domain API base URL (configurable via environment)
    this.apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3001';
  }

  // =========================================================================
  // Paging Normalization
  // =========================================================================

  /**
   * Normalize query parameters for Domain API
   */
  private normalizeQuery(query: GetDashboardsQuery) {
    const page = Math.max(1, query.page || 1);
    const pageSize = Math.min(100, Math.max(1, query.pageSize || 20));

    // Whitelist sortBy
    const sortBy = ALLOWED_SORT_BY.includes(query.sortBy as typeof ALLOWED_SORT_BY[number])
      ? query.sortBy
      : 'sortOrder';
    const sortOrder = query.sortOrder === 'desc' ? 'desc' : 'asc';

    // Normalize keyword (trim, empty→undefined)
    const keyword = query.keyword?.trim() || undefined;

    return {
      page,
      pageSize,
      offset: (page - 1) * pageSize,
      limit: pageSize,
      sortBy,
      sortOrder,
      keyword,
    };
  }

  /**
   * Create headers for Domain API call
   */
  private createHeaders(tenantId: string, userId?: string, companyId?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-tenant-id': tenantId,
    };
    if (userId) {
      headers['x-user-id'] = userId;
    }
    if (companyId) {
      headers['x-company-id'] = companyId;
    }
    return headers;
  }

  // =========================================================================
  // Dashboard CRUD
  // =========================================================================

  /**
   * Get dashboards with paging
   */
  async getDashboards(
    tenantId: string,
    query: GetDashboardsQuery,
  ): Promise<BffDashboardListDto> {
    const normalized = this.normalizeQuery(query);

    const response = await firstValueFrom(
      this.httpService.get<ApiDashboardDto[]>(
        `${this.apiBaseUrl}/api/reporting/dashboards`,
        {
          headers: this.createHeaders(tenantId),
          params: {
            offset: normalized.offset,
            limit: normalized.limit,
            sortBy: normalized.sortBy,
            sortOrder: normalized.sortOrder,
            keyword: normalized.keyword,
          },
        },
      ),
    );

    // Domain API returns array; calculate total from array length for now
    // (In production, API should return { items, total })
    const items = response.data;
    const total = items.length;

    return DashboardMapper.toDashboardList(
      items,
      total,
      normalized.page,
      normalized.pageSize,
    );
  }

  /**
   * Get dashboard by ID with widgets
   */
  async getDashboard(tenantId: string, id: string): Promise<BffDashboardDetailDto> {
    const response = await firstValueFrom(
      this.httpService.get<ApiDashboardDetailDto>(
        `${this.apiBaseUrl}/api/reporting/dashboards/${id}`,
        {
          headers: this.createHeaders(tenantId),
        },
      ),
    );

    return DashboardMapper.toDashboardDetail(response.data);
  }

  /**
   * Create a new dashboard
   */
  async createDashboard(
    tenantId: string,
    userId: string,
    data: BffCreateDashboardDto,
  ): Promise<BffDashboardDetailDto> {
    const response = await firstValueFrom(
      this.httpService.post<ApiDashboardDetailDto>(
        `${this.apiBaseUrl}/api/reporting/dashboards`,
        data,
        {
          headers: this.createHeaders(tenantId, userId),
        },
      ),
    );

    return DashboardMapper.toDashboardDetail(response.data);
  }

  /**
   * Update a dashboard
   */
  async updateDashboard(
    tenantId: string,
    userId: string,
    id: string,
    data: BffUpdateDashboardDto,
  ): Promise<BffDashboardDetailDto> {
    const response = await firstValueFrom(
      this.httpService.put<ApiDashboardDetailDto>(
        `${this.apiBaseUrl}/api/reporting/dashboards/${id}`,
        data,
        {
          headers: this.createHeaders(tenantId, userId),
        },
      ),
    );

    return DashboardMapper.toDashboardDetail(response.data);
  }

  /**
   * Delete a dashboard
   */
  async deleteDashboard(tenantId: string, userId: string, id: string): Promise<void> {
    await firstValueFrom(
      this.httpService.delete(`${this.apiBaseUrl}/api/reporting/dashboards/${id}`, {
        headers: this.createHeaders(tenantId, userId),
      }),
    );
  }

  /**
   * Duplicate a dashboard
   */
  async duplicateDashboard(
    tenantId: string,
    userId: string,
    id: string,
  ): Promise<BffDashboardDetailDto> {
    const response = await firstValueFrom(
      this.httpService.post<ApiDashboardDetailDto>(
        `${this.apiBaseUrl}/api/reporting/dashboards/${id}/duplicate`,
        {},
        {
          headers: this.createHeaders(tenantId, userId),
        },
      ),
    );

    return DashboardMapper.toDashboardDetail(response.data);
  }

  // =========================================================================
  // Widget Data
  // =========================================================================

  /**
   * Get widget data
   */
  async getWidgetData(
    tenantId: string,
    companyId: string,
    dashboardId: string,
    widgetId: string,
    request: BffWidgetDataRequestDto,
  ): Promise<BffWidgetDataResponseDto> {
    const response = await firstValueFrom(
      this.httpService.post<ApiWidgetDataResponseDto>(
        `${this.apiBaseUrl}/api/reporting/dashboards/${dashboardId}/widgets/${widgetId}/data`,
        {
          filter: request.resolvedFilter,
        },
        {
          headers: this.createHeaders(tenantId, undefined, companyId),
        },
      ),
    );

    return DashboardMapper.toWidgetDataResponse(response.data);
  }

  // =========================================================================
  // Templates
  // =========================================================================

  /**
   * Get dashboard templates
   */
  async getTemplates(tenantId: string): Promise<BffDashboardTemplateListDto> {
    const response = await firstValueFrom(
      this.httpService.get<ApiDashboardDetailDto[]>(
        `${this.apiBaseUrl}/api/reporting/dashboards/templates`,
        {
          headers: this.createHeaders(tenantId),
        },
      ),
    );

    return DashboardMapper.toTemplateList(response.data);
  }

  // =========================================================================
  // Selectors
  // =========================================================================

  /**
   * Get selectors (fiscal years, plan events, plan versions, departments)
   */
  async getSelectors(
    tenantId: string,
    companyId: string,
    query?: BffDashboardSelectorsRequestDto,
  ): Promise<BffDashboardSelectorsResponseDto> {
    const response = await firstValueFrom(
      this.httpService.get<ApiDashboardSelectorsResponseDto>(
        `${this.apiBaseUrl}/api/reporting/dashboards/selectors`,
        {
          headers: this.createHeaders(tenantId, undefined, companyId),
          params: query,
        },
      ),
    );

    return DashboardMapper.toSelectorsResponse(response.data);
  }

  /**
   * Get KPI definition selector options
   */
  async getKpiDefinitions(
    tenantId: string,
    companyId: string,
  ): Promise<BffKpiDefinitionOptionListDto> {
    const response = await firstValueFrom(
      this.httpService.get<ApiKpiDefinitionOptionListDto>(
        `${this.apiBaseUrl}/api/reporting/dashboards/selectors/kpi-definitions`,
        {
          headers: this.createHeaders(tenantId, undefined, companyId),
        },
      ),
    );

    return DashboardMapper.toKpiDefinitionOptionList(response.data);
  }
}
