import { Injectable, HttpService } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import {
  GetKpiMasterEventsQueryDto,
  KpiMasterEventDto,
  KpiMasterEventListDto,
  GetKpiMasterItemsQueryDto,
  KpiMasterItemDto,
  KpiMasterItemDetailDto,
  KpiMasterItemListDto,
  CreateKpiMasterEventDto,
  CreateKpiMasterItemDto,
  UpdateKpiMasterItemDto,
  CreateKpiDefinitionDto,
  KpiDefinitionDto,
} from '@epm-sdd/contracts/bff/kpi-master';
import {
  GetKpiMasterEventsApiQueryDto,
  KpiMasterEventApiDto,
  GetKpiMasterItemsApiQueryDto,
  KpiMasterItemApiDto,
  CreateKpiMasterEventApiDto,
  CreateKpiMasterItemApiDto,
  UpdateKpiMasterItemApiDto,
  CreateKpiDefinitionApiDto,
  KpiDefinitionApiDto,
} from '@epm-sdd/contracts/api/kpi-master';
import { KpiMasterMapper } from './mappers/kpi-master.mapper';

/**
 * KpiMasterBffService
 *
 * Purpose:
 * - UI requirements optimization (Read Model / ViewModel)
 * - Aggregate and transform Domain API responses (no business rules)
 * - Normalize paging/sorting/filtering parameters
 *
 * BFF Responsibilities:
 * - page/pageSize → offset/limit transformation
 * - sortBy whitelist validation
 * - keyword trim, empty → undefined
 * - API DTO ⇄ BFF DTO transformation
 * - Achievement rate calculation (actual/target × 100)
 * - Hierarchy assembly (parent_kpi_item_id → children array)
 * - Period data structuring (fact_amounts array → periodMap object)
 * - Master data join (department_stable_id → departmentName)
 * - Paging info attachment (page/pageSize/totalCount)
 */
@Injectable()
export class KpiMasterBffService {
  private readonly apiBaseUrl: string;

  constructor(private readonly httpService: HttpService) {
    // TODO: Get from config
    this.apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3001';
  }

  /**
   * Get KPI management events list with paging/sorting/filtering
   *
   * BFF Normalization:
   * - Defaults: page=1, pageSize=50, sortBy="eventCode", sortOrder="asc"
   * - Clamp: pageSize <= 200
   * - Whitelist: sortBy in ["eventCode", "eventName", "fiscalYear", "createdAt"]
   * - Normalize: keyword trim, empty → undefined
   * - Transform: offset=(page-1)*pageSize, limit=pageSize
   */
  async getEvents(
    tenantId: string,
    query: GetKpiMasterEventsQueryDto,
  ): Promise<KpiMasterEventListDto> {
    // Normalize query parameters
    const normalized = this.normalizePagingAndSorting(query, {
      defaultSortBy: 'eventCode',
      sortByWhitelist: ['eventCode', 'eventName', 'fiscalYear', 'createdAt'],
      sortByDbMapping: {
        eventCode: 'event_code',
        eventName: 'event_name',
        fiscalYear: 'fiscal_year',
        createdAt: 'created_at',
      },
    });

    // Build API query
    const apiQuery: GetKpiMasterEventsApiQueryDto = {
      offset: normalized.offset,
      limit: normalized.limit,
      keyword: normalized.keyword,
      fiscalYear: query.fiscalYear,
      status: query.status,
      sortBy: normalized.sortByDb,
      sortOrder: normalized.sortOrder,
    };

    // Call Domain API
    const response = await this.callDomainApi<{
      data: KpiMasterEventApiDto[];
      total: number;
    }>('GET', '/kpi-master/events', tenantId, { params: apiQuery });

    // Map to BFF DTO
    const events = response.data.data.map((event) =>
      KpiMasterMapper.toKpiMasterEventDto(event),
    );

    return {
      events,
      page: normalized.page,
      pageSize: normalized.pageSize,
      totalCount: response.data.total,
    };
  }

  /**
   * Get KPI management event by ID
   */
  async getEventById(tenantId: string, id: string): Promise<KpiMasterEventDto> {
    const response = await this.callDomainApi<KpiMasterEventApiDto>(
      'GET',
      `/kpi-master/events/${id}`,
      tenantId,
    );

    return KpiMasterMapper.toKpiMasterEventDto(response.data);
  }

  /**
   * Create KPI management event
   */
  async createEvent(
    tenantId: string,
    userId: string,
    data: CreateKpiMasterEventDto,
  ): Promise<KpiMasterEventDto> {
    const apiData: CreateKpiMasterEventApiDto = {
      companyId: data.companyId,
      eventCode: data.eventCode,
      eventName: data.eventName,
      fiscalYear: data.fiscalYear,
    };

    const response = await this.callDomainApi<KpiMasterEventApiDto>(
      'POST',
      '/kpi-master/events',
      tenantId,
      { data: apiData },
      userId,
    );

    return KpiMasterMapper.toKpiMasterEventDto(response.data);
  }

  /**
   * Update KPI management event
   */
  async updateEvent(
    tenantId: string,
    userId: string,
    id: string,
    data: Partial<CreateKpiMasterEventDto>,
  ): Promise<KpiMasterEventDto> {
    const response = await this.callDomainApi<KpiMasterEventApiDto>(
      'PUT',
      `/kpi-master/events/${id}`,
      tenantId,
      { data },
      userId,
    );

    return KpiMasterMapper.toKpiMasterEventDto(response.data);
  }

  /**
   * Confirm KPI management event (DRAFT → CONFIRMED)
   */
  async confirmEvent(tenantId: string, userId: string, id: string): Promise<KpiMasterEventDto> {
    const response = await this.callDomainApi<KpiMasterEventApiDto>(
      'POST',
      `/kpi-master/events/${id}/confirm`,
      tenantId,
      {},
      userId,
    );

    return KpiMasterMapper.toKpiMasterEventDto(response.data);
  }

  /**
   * Get KPI items list with paging/sorting/filtering
   *
   * BFF Normalization:
   * - Defaults: page=1, pageSize=50, sortBy="sortOrder", sortOrder="asc"
   * - Clamp: pageSize <= 200
   * - Whitelist: sortBy in ["kpiCode", "kpiName", "sortOrder", "createdAt"]
   */
  async getItems(
    tenantId: string,
    query: GetKpiMasterItemsQueryDto,
  ): Promise<KpiMasterItemListDto> {
    // Normalize query parameters
    const normalized = this.normalizePagingAndSorting(query, {
      defaultSortBy: 'sortOrder',
      sortByWhitelist: ['kpiCode', 'kpiName', 'sortOrder', 'createdAt'],
      sortByDbMapping: {
        kpiCode: 'kpi_code',
        kpiName: 'kpi_name',
        sortOrder: 'sort_order',
        createdAt: 'created_at',
      },
    });

    // Build API query
    const apiQuery: GetKpiMasterItemsApiQueryDto = {
      offset: normalized.offset,
      limit: normalized.limit,
      kpiEventId: query.kpiEventId,
      parentKpiItemId: query.parentKpiItemId,
      kpiType: query.kpiType,
      hierarchyLevel: query.hierarchyLevel,
      keyword: normalized.keyword,
      sortBy: normalized.sortByDb,
      sortOrder: normalized.sortOrder,
    };

    // Call Domain API
    const response = await this.callDomainApi<{
      data: KpiMasterItemApiDto[];
      total: number;
    }>('GET', '/kpi-master/items', tenantId, { params: apiQuery });

    // Map to BFF DTO (basic list, no detail data)
    const items = response.data.data.map((item) => KpiMasterMapper.toKpiMasterItemDto(item));

    return {
      items,
      page: normalized.page,
      pageSize: normalized.pageSize,
      totalCount: response.data.total,
    };
  }

  /**
   * Get KPI item detail by ID (with hierarchy assembly and achievement rate calculation)
   */
  async getItemById(tenantId: string, id: string): Promise<KpiMasterItemDetailDto> {
    const response = await this.callDomainApi<KpiMasterItemApiDto>(
      'GET',
      `/kpi-master/items/${id}`,
      tenantId,
    );

    // TODO: Fetch related data (fact amounts, target values, action plans)
    // and assemble into KpiMasterItemDetailDto with periodFacts and achievementRate

    return KpiMasterMapper.toKpiMasterItemDetailDto(response.data, [], [], []);
  }

  /**
   * Create KPI item
   */
  async createItem(
    tenantId: string,
    userId: string,
    data: CreateKpiMasterItemDto,
  ): Promise<KpiMasterItemDto> {
    const apiData: CreateKpiMasterItemApiDto = {
      kpiEventId: data.kpiEventId,
      parentKpiItemId: data.parentKpiItemId,
      kpiCode: data.kpiCode,
      kpiName: data.kpiName,
      kpiType: data.kpiType,
      hierarchyLevel: data.hierarchyLevel,
      refSubjectId: data.refSubjectId,
      refKpiDefinitionId: data.refKpiDefinitionId,
      refMetricId: data.refMetricId,
      departmentStableId: data.departmentStableId,
      ownerEmployeeId: data.ownerEmployeeId,
      sortOrder: data.sortOrder,
    };

    const response = await this.callDomainApi<KpiMasterItemApiDto>(
      'POST',
      '/kpi-master/items',
      tenantId,
      { data: apiData },
      userId,
    );

    return KpiMasterMapper.toKpiMasterItemDto(response.data);
  }

  /**
   * Update KPI item
   */
  async updateItem(
    tenantId: string,
    userId: string,
    id: string,
    data: UpdateKpiMasterItemDto,
  ): Promise<KpiMasterItemDto> {
    const apiData: UpdateKpiMasterItemApiDto = {
      kpiName: data.kpiName,
      departmentStableId: data.departmentStableId,
      ownerEmployeeId: data.ownerEmployeeId,
      sortOrder: data.sortOrder,
    };

    const response = await this.callDomainApi<KpiMasterItemApiDto>(
      'PUT',
      `/kpi-master/items/${id}`,
      tenantId,
      { data: apiData },
      userId,
    );

    return KpiMasterMapper.toKpiMasterItemDto(response.data);
  }

  /**
   * Delete KPI item (logical delete)
   */
  async deleteItem(tenantId: string, userId: string, id: string): Promise<void> {
    await this.callDomainApi('DELETE', `/kpi-master/items/${id}`, tenantId, {}, userId);
  }

  /**
   * Normalize paging and sorting parameters
   *
   * BFF Responsibilities (MANDATORY):
   * - Defaults: page=1, pageSize=50
   * - Clamp: pageSize <= 200
   * - Whitelist: sortBy validation
   * - Normalize: keyword trim, empty → undefined
   * - Transform: offset=(page-1)*pageSize, limit=pageSize
   */
  private normalizePagingAndSorting(
    query: GetKpiMasterEventsQueryDto | GetKpiMasterItemsQueryDto,
    options: {
      defaultSortBy: string;
      sortByWhitelist: string[];
      sortByDbMapping: Record<string, string>;
    },
  ): {
    page: number;
    pageSize: number;
    offset: number;
    limit: number;
    keyword: string | undefined;
    sortBy: string;
    sortByDb: string;
    sortOrder: 'asc' | 'desc';
  } {
    // Defaults
    const page = Math.max(1, query.page || 1);
    const pageSize = Math.min(200, Math.max(1, query.pageSize || 50));
    const sortOrder = query.sortOrder || 'asc';

    // Whitelist validation for sortBy
    let sortBy = query.sortBy || options.defaultSortBy;
    if (!options.sortByWhitelist.includes(sortBy)) {
      sortBy = options.defaultSortBy;
    }

    // Map to DB column name
    const sortByDb = options.sortByDbMapping[sortBy] || sortBy;

    // Normalize keyword
    const keyword = query.keyword?.trim() || undefined;

    // Transform to offset/limit
    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    return {
      page,
      pageSize,
      offset,
      limit,
      keyword,
      sortBy,
      sortByDb,
      sortOrder,
    };
  }

  /**
   * Call Domain API with tenant/user headers
   */
  private async callDomainApi<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    tenantId: string,
    config?: { params?: any; data?: any },
    userId?: string,
  ): Promise<AxiosResponse<T>> {
    const headers: Record<string, string> = {
      'x-tenant-id': tenantId,
    };

    if (userId) {
      headers['x-user-id'] = userId;
    }

    const url = `${this.apiBaseUrl}${path}`;

    switch (method) {
      case 'GET':
        return firstValueFrom(
          this.httpService.get<T>(url, {
            headers,
            params: config?.params,
          }),
        );
      case 'POST':
        return firstValueFrom(
          this.httpService.post<T>(url, config?.data, {
            headers,
          }),
        );
      case 'PUT':
        return firstValueFrom(
          this.httpService.put<T>(url, config?.data, {
            headers,
          }),
        );
      case 'DELETE':
        return firstValueFrom(
          this.httpService.delete<T>(url, {
            headers,
          }),
        );
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
  }
}
