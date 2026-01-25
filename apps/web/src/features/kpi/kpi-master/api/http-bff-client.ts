import type { BffClient } from './bff-client';
import type {
  KpiMasterEventListDto,
  KpiMasterEventDetailDto,
  CreateKpiMasterEventDto,
  GetKpiMasterEventsQueryDto,
  KpiMasterEventDto,
  KpiMasterItemListDto,
  KpiMasterItemDetailDto,
  CreateKpiMasterItemDto,
  UpdateKpiMasterItemDto,
  GetKpiMasterItemsQueryDto,
  SelectableSubjectListDto,
  SelectableMetricListDto,
  KpiDefinitionListDto,
  CreateKpiDefinitionDto,
  GetKpiDefinitionsQueryDto,
  KpiDefinitionDto,
  CreateKpiFactAmountDto,
  UpdateKpiFactAmountDto,
  KpiFactAmountDto,
  CreateKpiTargetValueDto,
  UpdateKpiTargetValueDto,
  KpiTargetValueDto,
} from '@epm-sdd/contracts/bff/kpi-master';

/**
 * HttpBffClient - Production BFF API Client
 *
 * Purpose:
 * - Connect to real BFF endpoints
 * - Handle authentication headers (tenant_id, user_id)
 * - Error handling and response mapping
 */
export class HttpBffClient implements BffClient {
  private readonly baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_BFF_URL || 'http://localhost:3002';
  }

  // ========== KPI Management Events ==========

  async getEvents(query: GetKpiMasterEventsQueryDto): Promise<KpiMasterEventListDto> {
    const params = new URLSearchParams();
    if (query.page) params.append('page', query.page.toString());
    if (query.pageSize) params.append('pageSize', query.pageSize.toString());
    if (query.keyword) params.append('keyword', query.keyword);
    if (query.fiscalYear) params.append('fiscalYear', query.fiscalYear.toString());
    if (query.status) params.append('status', query.status);
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);

    return this.fetch<KpiMasterEventListDto>(`/api/bff/kpi-master/events?${params}`);
  }

  async getEventById(id: string): Promise<KpiMasterEventDetailDto> {
    return this.fetch<KpiMasterEventDetailDto>(`/api/bff/kpi-master/events/${id}`);
  }

  async createEvent(data: CreateKpiMasterEventDto): Promise<KpiMasterEventDto> {
    return this.fetch<KpiMasterEventDto>('/api/bff/kpi-master/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async confirmEvent(id: string): Promise<KpiMasterEventDto> {
    return this.fetch<KpiMasterEventDto>(`/api/bff/kpi-master/events/${id}/confirm`, {
      method: 'PATCH',
    });
  }

  // ========== KPI Items ==========

  async getItems(query: GetKpiMasterItemsQueryDto): Promise<KpiMasterItemListDto> {
    const params = new URLSearchParams();
    if (query.page) params.append('page', query.page.toString());
    if (query.pageSize) params.append('pageSize', query.pageSize.toString());
    if (query.kpiEventId) params.append('kpiEventId', query.kpiEventId);
    if (query.parentKpiItemId !== undefined)
      params.append('parentKpiItemId', query.parentKpiItemId);
    if (query.kpiType) params.append('kpiType', query.kpiType);
    if (query.hierarchyLevel)
      params.append('hierarchyLevel', query.hierarchyLevel.toString());
    if (query.keyword) params.append('keyword', query.keyword);
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);

    return this.fetch<KpiMasterItemListDto>(`/api/bff/kpi-master/items?${params}`);
  }

  async getItemById(id: string): Promise<KpiMasterItemDetailDto> {
    return this.fetch<KpiMasterItemDetailDto>(`/api/bff/kpi-master/items/${id}`);
  }

  async createItem(data: CreateKpiMasterItemDto): Promise<KpiMasterItemDetailDto> {
    return this.fetch<KpiMasterItemDetailDto>('/api/bff/kpi-master/items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateItem(
    id: string,
    data: UpdateKpiMasterItemDto,
  ): Promise<KpiMasterItemDetailDto> {
    return this.fetch<KpiMasterItemDetailDto>(`/api/bff/kpi-master/items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteItem(id: string): Promise<void> {
    await this.fetch<void>(`/api/bff/kpi-master/items/${id}`, {
      method: 'DELETE',
    });
  }

  // ========== Selectable Options ==========

  async getSelectableSubjects(companyId: string): Promise<SelectableSubjectListDto> {
    return this.fetch<SelectableSubjectListDto>(
      `/api/bff/kpi-master/selectable-subjects?companyId=${companyId}`,
    );
  }

  async getSelectableMetrics(companyId: string): Promise<SelectableMetricListDto> {
    return this.fetch<SelectableMetricListDto>(
      `/api/bff/kpi-master/selectable-metrics?companyId=${companyId}`,
    );
  }

  // ========== Non-Financial KPI Definitions ==========

  async getKpiDefinitions(
    query: GetKpiDefinitionsQueryDto,
  ): Promise<KpiDefinitionListDto> {
    const params = new URLSearchParams();
    if (query.companyId) params.append('companyId', query.companyId);
    if (query.page) params.append('page', query.page.toString());
    if (query.pageSize) params.append('pageSize', query.pageSize.toString());
    if (query.keyword) params.append('keyword', query.keyword);

    return this.fetch<KpiDefinitionListDto>(`/api/bff/kpi-master/kpi-definitions?${params}`);
  }

  async createKpiDefinition(data: CreateKpiDefinitionDto): Promise<KpiDefinitionDto> {
    return this.fetch<KpiDefinitionDto>('/api/bff/kpi-master/kpi-definitions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ========== Fact Amounts ==========

  async createFactAmount(data: CreateKpiFactAmountDto): Promise<KpiFactAmountDto> {
    return this.fetch<KpiFactAmountDto>('/api/bff/kpi-master/fact-amounts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateFactAmount(
    id: string,
    data: UpdateKpiFactAmountDto,
  ): Promise<KpiFactAmountDto> {
    return this.fetch<KpiFactAmountDto>(`/api/bff/kpi-master/fact-amounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // ========== Target Values ==========

  async createTargetValue(data: CreateKpiTargetValueDto): Promise<KpiTargetValueDto> {
    return this.fetch<KpiTargetValueDto>('/api/bff/kpi-master/target-values', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTargetValue(
    id: string,
    data: UpdateKpiTargetValueDto,
  ): Promise<KpiTargetValueDto> {
    return this.fetch<KpiTargetValueDto>(`/api/bff/kpi-master/target-values/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // ========== HTTP Utilities ==========

  private async fetch<T>(url: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');

    // TODO: Add authentication headers from context
    // headers.set('x-tenant-id', getTenantId());
    // headers.set('x-user-id', getUserId());

    const response = await fetch(`${this.baseUrl}${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    // Handle no-content responses
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return undefined as T;
    }

    return response.json();
  }
}
