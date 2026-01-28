/**
 * HttpBffClient for Dashboard Feature (UI-BFF Phase)
 *
 * Purpose:
 * - Real HTTP client for production use
 * - Calls BFF endpoints at /api/bff/reporting/dashboards
 * - Replaces MockBffClient in Phase 2 (UI-BFF)
 * - Handles errors according to contracts/bff/errors
 *
 * Reference: .kiro/specs/reporting/dashboard/design.md (Task 15.1)
 */
import type { BffClient, GetDashboardsQuery } from './BffClient';
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
  DashboardErrorCode,
} from '@epm/contracts/bff/dashboard';

/**
 * Dashboard-specific error class
 */
export class DashboardApiError extends Error {
  constructor(
    public code: DashboardErrorCode | string,
    message: string,
    public status?: number,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'DashboardApiError';
  }
}

/**
 * HTTP request helper with error handling
 */
async function fetchJson<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    // Handle non-OK responses
    if (!response.ok) {
      let errorData: any;
      try {
        errorData = await response.json();
      } catch {
        // If response is not JSON, use status text
        throw new DashboardApiError(
          'UNKNOWN_ERROR',
          response.statusText || 'Unknown error occurred',
          response.status
        );
      }

      // Parse BFF error response
      const code = errorData.code || 'UNKNOWN_ERROR';
      const message = errorData.message || response.statusText;
      const details = errorData.details;

      throw new DashboardApiError(code, message, response.status, details);
    }

    // For DELETE requests with no content
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  } catch (error) {
    if (error instanceof DashboardApiError) {
      throw error;
    }

    // Network errors or other fetch failures
    throw new DashboardApiError(
      'NETWORK_ERROR',
      error instanceof Error ? error.message : 'Network request failed'
    );
  }
}

/**
 * Create HttpBffClient instance
 * Real HTTP adapter using fetch API
 */
export function createHttpBffClient(baseUrl = '/api/bff/reporting/dashboards'): BffClient {
  return {
    /**
     * Get dashboard list
     */
    async getDashboards(query?: GetDashboardsQuery): Promise<BffDashboardListDto> {
      const params = new URLSearchParams();
      if (query?.page) params.append('page', String(query.page));
      if (query?.pageSize) params.append('pageSize', String(query.pageSize));
      if (query?.sortBy) params.append('sortBy', query.sortBy);
      if (query?.sortOrder) params.append('sortOrder', query.sortOrder);
      if (query?.keyword) params.append('keyword', query.keyword);

      const url = params.toString() ? `${baseUrl}?${params}` : baseUrl;
      return fetchJson<BffDashboardListDto>(url);
    },

    /**
     * Get dashboard by ID
     */
    async getDashboard(id: string): Promise<BffDashboardDetailDto> {
      return fetchJson<BffDashboardDetailDto>(`${baseUrl}/${id}`);
    },

    /**
     * Create dashboard
     */
    async createDashboard(data: BffCreateDashboardDto): Promise<BffDashboardDetailDto> {
      return fetchJson<BffDashboardDetailDto>(baseUrl, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    /**
     * Update dashboard
     */
    async updateDashboard(
      id: string,
      data: BffUpdateDashboardDto
    ): Promise<BffDashboardDetailDto> {
      return fetchJson<BffDashboardDetailDto>(`${baseUrl}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    /**
     * Delete dashboard
     */
    async deleteDashboard(id: string): Promise<void> {
      return fetchJson<void>(`${baseUrl}/${id}`, {
        method: 'DELETE',
      });
    },

    /**
     * Duplicate dashboard
     */
    async duplicateDashboard(id: string): Promise<BffDashboardDetailDto> {
      return fetchJson<BffDashboardDetailDto>(`${baseUrl}/${id}/duplicate`, {
        method: 'POST',
      });
    },

    /**
     * Get widget data
     */
    async getWidgetData(
      dashboardId: string,
      widgetId: string,
      request: BffWidgetDataRequestDto
    ): Promise<BffWidgetDataResponseDto> {
      return fetchJson<BffWidgetDataResponseDto>(
        `${baseUrl}/${dashboardId}/widgets/${widgetId}/data`,
        {
          method: 'POST',
          body: JSON.stringify(request),
        }
      );
    },

    /**
     * Get selectors
     */
    async getSelectors(
      query?: BffDashboardSelectorsRequestDto
    ): Promise<BffDashboardSelectorsResponseDto> {
      const params = new URLSearchParams();
      if (query?.fiscalYear) params.append('fiscalYear', String(query.fiscalYear));
      if (query?.scenarioType) params.append('scenarioType', query.scenarioType);
      if (query?.planEventId) params.append('planEventId', query.planEventId);

      const url = params.toString()
        ? `${baseUrl}/selectors?${params}`
        : `${baseUrl}/selectors`;
      return fetchJson<BffDashboardSelectorsResponseDto>(url);
    },

    /**
     * Get templates
     */
    async getTemplates(): Promise<BffDashboardTemplateListDto> {
      return fetchJson<BffDashboardTemplateListDto>(`${baseUrl}/templates`);
    },
  };
}
