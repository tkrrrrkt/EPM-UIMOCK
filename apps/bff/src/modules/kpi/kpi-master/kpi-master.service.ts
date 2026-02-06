/**
 * KPI Master BFF Service
 *
 * Purpose:
 * - Call Domain API via HTTP with tenant context
 * - Apply paging normalization (page/pageSize → offset/limit)
 * - Transform API responses to BFF DTOs via KpiMasterMapper
 *
 * Paging Normalization:
 * - UI/BFF: page / pageSize (page-based)
 * - Domain API: offset / limit (DB-friendly)
 * - Defaults: page=1, pageSize=50
 * - Clamp: pageSize <= 200
 * - Whitelist: sortBy = eventCode | kpiCode | kpiName | fiscalYear | createdAt
 *
 * Reference: .kiro/specs/kpi/kpi-master/design.md (Task 5.2)
 */
import { BadRequestException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { KpiMasterMapper } from './mappers/kpi-master.mapper';
import type {
  KpiMasterSummaryDto,
  KpiMasterEventListDto,
  KpiMasterEventDetailDto,
  CreateKpiMasterEventDto,
  KpiMasterItemDto,
  KpiMasterItemDetailDto,
  CreateKpiMasterItemDto,
  UpdateKpiMasterItemDto,
  SelectableSubjectListDto,
  SelectableMetricListDto,
  KpiDefinitionListDto,
  CreateKpiDefinitionDto,
  CreateKpiFactAmountDto,
  UpdateKpiFactAmountDto,
  KpiFactAmountDto,
  CreateKpiTargetValueDto,
  UpdateKpiTargetValueDto,
  KpiTargetValueDto,
} from '@epm/contracts/bff/kpi-master';
import type {
  KpiMasterEventApiDto,
  KpiMasterItemApiDto,
  KpiDefinitionApiDto,
  KpiFactAmountApiDto,
  KpiTargetValueApiDto,
} from '@epm/contracts/api/kpi-master';

/** Query params for event list */
interface GetEventsQuery {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  keyword?: string;
  fiscalYear?: number;
  status?: 'DRAFT' | 'CONFIRMED';
}

/** Query params for item list */
interface GetItemsQuery {
  eventId?: string;
  kpiType?: 'FINANCIAL' | 'NON_FINANCIAL' | 'METRIC';
  departmentStableIds?: string[];
  hierarchyLevel?: 1 | 2;
}

/** Query params for KPI definition list */
interface GetKpiDefinitionsQuery {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  keyword?: string;
}

/** Allowed sortBy values for events */
const ALLOWED_EVENT_SORT_BY = ['event_code', 'event_name', 'fiscal_year', 'created_at'] as const;

/** Allowed sortBy values for definitions */
const ALLOWED_DEFINITION_SORT_BY = ['kpi_code', 'kpi_name', 'created_at'] as const;

@Injectable()
export class KpiMasterBffService {
  private readonly apiBaseUrl: string;

  constructor(private readonly httpService: HttpService) {
    // Domain API base URL (configurable via environment)
    this.apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3002';
  }

  // =========================================================================
  // Paging Normalization
  // =========================================================================

  /**
   * Normalize event query parameters for Domain API
   */
  private normalizeEventQuery(query: GetEventsQuery) {
    const page = Math.max(1, query.page || 1);
    const pageSize = Math.min(200, Math.max(1, query.pageSize || 50));

    // Whitelist sortBy
    const sortBy = ALLOWED_EVENT_SORT_BY.includes(query.sortBy as typeof ALLOWED_EVENT_SORT_BY[number])
      ? query.sortBy
      : 'event_code';
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
      fiscalYear: query.fiscalYear,
      status: query.status,
    };
  }

  /**
   * Normalize item query parameters for Domain API
   */
  private normalizeItemQuery(query: GetItemsQuery) {
    return {
      eventId: query.eventId,
      kpiType: query.kpiType,
      departmentStableIds: query.departmentStableIds,
      hierarchyLevel: query.hierarchyLevel,
    };
  }

  /**
   * Normalize KPI definition query parameters for Domain API
   */
  private normalizeDefinitionQuery(query: GetKpiDefinitionsQuery) {
    const page = Math.max(1, query.page || 1);
    const pageSize = Math.min(200, Math.max(1, query.pageSize || 50));

    // Whitelist sortBy
    const sortBy = ALLOWED_DEFINITION_SORT_BY.includes(query.sortBy as typeof ALLOWED_DEFINITION_SORT_BY[number])
      ? query.sortBy
      : 'kpi_code';
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
  // Summary
  // =========================================================================

  /**
   * Get summary (4 metrics for card display)
   */
  async getSummary(tenantId: string, eventId?: string): Promise<KpiMasterSummaryDto> {
    // TODO: Phase 2 - Domain API endpoint implementation
    // For now, return mock data
    return {
      totalKpiCount: 0,
      avgAchievementRate: 0,
      delayedActionPlanCount: 0,
      attentionRequiredCount: 0,
    };
  }

  // =========================================================================
  // KPI管理イベント操作
  // =========================================================================

  /**
   * Get events with paging
   */
  async getEvents(
    tenantId: string,
    companyId: string,
    query: GetEventsQuery,
  ): Promise<KpiMasterEventListDto> {
    const normalized = this.normalizeEventQuery(query);

    const response = await firstValueFrom(
      this.httpService.get<{ items: KpiMasterEventApiDto[]; total: number }>(
        `${this.apiBaseUrl}/api/kpi/kpi-master/events`,
        {
          headers: this.createHeaders(tenantId, undefined, companyId),
          params: {
            offset: normalized.offset,
            limit: normalized.limit,
            sort_by: normalized.sortBy,
            sort_order: normalized.sortOrder,
            keyword: normalized.keyword,
            fiscal_year: normalized.fiscalYear,
            status: normalized.status,
          },
        },
      ),
    );

    const { items, total } = response.data;

    return KpiMasterMapper.toEventList(items, total, normalized.page, normalized.pageSize);
  }

  /**
   * Get event by ID
   */
  async getEvent(tenantId: string, id: string): Promise<KpiMasterEventDetailDto> {
    const response = await firstValueFrom(
      this.httpService.get<KpiMasterEventApiDto>(
        `${this.apiBaseUrl}/api/kpi/kpi-master/events/${id}`,
        {
          headers: this.createHeaders(tenantId),
        },
      ),
    );

    return KpiMasterMapper.toEventDetail(response.data);
  }

  /**
   * Create event
   */
  async createEvent(
    tenantId: string,
    companyId: string,
    userId: string,
    data: CreateKpiMasterEventDto,
  ): Promise<KpiMasterEventDetailDto> {
    const response = await firstValueFrom(
      this.httpService.post<KpiMasterEventApiDto>(
        `${this.apiBaseUrl}/api/kpi/kpi-master/events`,
        KpiMasterMapper.toCreateEventApiDto(data, companyId),
        {
          headers: this.createHeaders(tenantId, userId, companyId),
        },
      ),
    );

    return KpiMasterMapper.toEventDetail(response.data);
  }

  /**
   * Confirm event
   */
  async confirmEvent(
    tenantId: string,
    userId: string,
    id: string,
  ): Promise<KpiMasterEventDetailDto> {
    const response = await firstValueFrom(
      this.httpService.patch<KpiMasterEventApiDto>(
        `${this.apiBaseUrl}/api/kpi/kpi-master/events/${id}/confirm`,
        {},
        {
          headers: this.createHeaders(tenantId, userId),
        },
      ),
    );

    return KpiMasterMapper.toEventDetail(response.data);
  }

  // =========================================================================
  // KPI項目操作
  // =========================================================================

  /**
   * Get items with paging
   */
  async getItems(
    tenantId: string,
    companyId: string,
    userId: string,
    query: GetItemsQuery,
  ): Promise<KpiMasterItemDto[]> {
    const normalized = this.normalizeItemQuery(query);

    const response = await firstValueFrom(
      this.httpService.get<KpiMasterItemApiDto[]>(
        `${this.apiBaseUrl}/api/kpi/kpi-master/items`,
        {
          headers: this.createHeaders(tenantId, userId, companyId),
          params: {
            company_id: companyId,
            event_id: normalized.eventId,
            kpi_type: normalized.kpiType,
            department_stable_ids: normalized.departmentStableIds,
            hierarchy_level: normalized.hierarchyLevel,
          },
        },
      ),
    );

    return KpiMasterMapper.toItemList(response.data);
  }

  /**
   * Get item by ID
   */
  async getItem(tenantId: string, userId: string, id: string): Promise<KpiMasterItemDetailDto> {
    const response = await firstValueFrom(
      this.httpService.get<KpiMasterItemApiDto>(
        `${this.apiBaseUrl}/api/kpi/kpi-master/items/${id}`,
        {
          headers: this.createHeaders(tenantId, userId),
        },
      ),
    );

    return KpiMasterMapper.toItemDetail(response.data);
  }

  /**
   * Create item
   */
  async createItem(
    tenantId: string,
    companyId: string,
    userId: string,
    data: CreateKpiMasterItemDto,
  ): Promise<KpiMasterItemDetailDto> {
    const response = await firstValueFrom(
      this.httpService.post<KpiMasterItemApiDto>(
        `${this.apiBaseUrl}/api/kpi/kpi-master/items`,
        KpiMasterMapper.toCreateItemApiDto(data, companyId),
        {
          headers: this.createHeaders(tenantId, userId, companyId),
        },
      ),
    );

    return KpiMasterMapper.toItemDetail(response.data);
  }

  /**
   * Update item
   */
  async updateItem(
    tenantId: string,
    userId: string,
    id: string,
    data: UpdateKpiMasterItemDto,
  ): Promise<KpiMasterItemDetailDto> {
    const response = await firstValueFrom(
      this.httpService.patch<KpiMasterItemApiDto>(
        `${this.apiBaseUrl}/api/kpi/kpi-master/items/${id}`,
        KpiMasterMapper.toUpdateItemApiDto(data),
        {
          headers: this.createHeaders(tenantId, userId),
        },
      ),
    );

    return KpiMasterMapper.toItemDetail(response.data);
  }

  /**
   * Delete item
   */
  async deleteItem(tenantId: string, userId: string, id: string): Promise<void> {
    await firstValueFrom(
      this.httpService.delete(`${this.apiBaseUrl}/api/kpi/kpi-master/items/${id}`, {
        headers: this.createHeaders(tenantId, userId),
      }),
    );
  }

  /**
   * Get selectable subjects
   */
  async getSelectableSubjects(
    tenantId: string,
    companyId: string,
  ): Promise<SelectableSubjectListDto> {
    const response = await firstValueFrom(
      this.httpService.get<any[]>(
        `${this.apiBaseUrl}/api/kpi/kpi-master/selectable-subjects`,
        {
          headers: this.createHeaders(tenantId, undefined, companyId),
        },
      ),
    );

    return KpiMasterMapper.toSelectableSubjectList(response.data);
  }

  /**
   * Get selectable metrics
   */
  async getSelectableMetrics(
    tenantId: string,
    companyId: string,
  ): Promise<SelectableMetricListDto> {
    const response = await firstValueFrom(
      this.httpService.get<any[]>(`${this.apiBaseUrl}/api/kpi/kpi-master/selectable-metrics`, {
        headers: this.createHeaders(tenantId, undefined, companyId),
      }),
    );

    return KpiMasterMapper.toSelectableMetricList(response.data);
  }

  // =========================================================================
  // 非財務KPI定義
  // =========================================================================

  /**
   * Get KPI definitions with paging
   */
  async getKpiDefinitions(
    tenantId: string,
    companyId: string,
    query: GetKpiDefinitionsQuery,
  ): Promise<KpiDefinitionListDto> {
    const normalized = this.normalizeDefinitionQuery(query);

    const response = await firstValueFrom(
      this.httpService.get<{ items: KpiDefinitionApiDto[]; total: number }>(
        `${this.apiBaseUrl}/api/kpi/kpi-master/kpi-definitions`,
        {
          headers: this.createHeaders(tenantId, undefined, companyId),
          params: {
            offset: normalized.offset,
            limit: normalized.limit,
            sort_by: normalized.sortBy,
            sort_order: normalized.sortOrder,
            keyword: normalized.keyword,
          },
        },
      ),
    );

    const { items, total } = response.data;

    return KpiMasterMapper.toDefinitionList(items, total, normalized.page, normalized.pageSize);
  }

  /**
   * Create KPI definition
   */
  async createKpiDefinition(
    tenantId: string,
    companyId: string,
    userId: string,
    data: CreateKpiDefinitionDto,
  ): Promise<KpiDefinitionListDto> {
    const response = await firstValueFrom(
      this.httpService.post<KpiDefinitionApiDto>(
        `${this.apiBaseUrl}/api/kpi/kpi-master/kpi-definitions`,
        KpiMasterMapper.toCreateDefinitionApiDto(data, companyId),
        {
          headers: this.createHeaders(tenantId, userId, companyId),
        },
      ),
    );

    // Return as list with single item for consistency
    return KpiMasterMapper.toDefinitionList([response.data], 1, 1, 1);
  }

  // =========================================================================
  // 非財務KPI予実データ
  // =========================================================================

  /**
   * Create fact amount
   */
  async createFactAmount(
    tenantId: string,
    companyId: string,
    userId: string,
    data: CreateKpiFactAmountDto,
  ): Promise<KpiFactAmountDto> {
    const context = await this.resolveFactAmountContext(tenantId, userId, data.kpiMasterItemId);

    const response = await firstValueFrom(
      this.httpService.post<KpiFactAmountApiDto>(
        `${this.apiBaseUrl}/api/kpi/kpi-master/fact-amounts`,
        KpiMasterMapper.toCreateFactAmountApiDto(data, context),
        {
          headers: this.createHeaders(tenantId, userId, companyId),
        },
      ),
    );

    return KpiMasterMapper.toFactAmountDto(response.data, data.kpiMasterItemId);
  }

  /**
   * Update fact amount
   */
  async updateFactAmount(
    tenantId: string,
    userId: string,
    id: string,
    data: UpdateKpiFactAmountDto,
  ): Promise<KpiFactAmountDto> {
    const response = await firstValueFrom(
      this.httpService.put<KpiFactAmountApiDto>(
        `${this.apiBaseUrl}/api/kpi/kpi-master/fact-amounts/${id}`,
        KpiMasterMapper.toUpdateFactAmountApiDto(data),
        {
          headers: this.createHeaders(tenantId, userId),
        },
      ),
    );

    return KpiMasterMapper.toFactAmountDto(response.data);
  }

  private async resolveFactAmountContext(
    tenantId: string,
    userId: string,
    kpiMasterItemId: string,
  ): Promise<{ eventId: string; kpiDefinitionId: string }> {
    const response = await firstValueFrom(
      this.httpService.get<KpiMasterItemApiDto>(
        `${this.apiBaseUrl}/api/kpi/kpi-master/items/${kpiMasterItemId}`,
        {
          headers: this.createHeaders(tenantId, userId),
        },
      ),
    );

    const item = response.data;
    if (!item.ref_kpi_definition_id) {
      throw new BadRequestException('kpiMasterItemId must reference a KPI definition');
    }

    return {
      eventId: item.event_id,
      kpiDefinitionId: item.ref_kpi_definition_id,
    };
  }

  // =========================================================================
  // 指標目標値
  // =========================================================================

  /**
   * Create target value
   */
  async createTargetValue(tenantId: string, data: CreateKpiTargetValueDto): Promise<KpiTargetValueDto> {
    const response = await firstValueFrom(
      this.httpService.post<KpiTargetValueApiDto>(
        `${this.apiBaseUrl}/api/kpi/kpi-master/target-values`,
        KpiMasterMapper.toCreateTargetValueApiDto(data),
        {
          headers: this.createHeaders(tenantId),
        },
      ),
    );

    return KpiMasterMapper.toTargetValueDto(response.data);
  }

  /**
   * Update target value
   */
  async updateTargetValue(
    tenantId: string,
    id: string,
    data: UpdateKpiTargetValueDto,
  ): Promise<KpiTargetValueDto> {
    const response = await firstValueFrom(
      this.httpService.put<KpiTargetValueApiDto>(
        `${this.apiBaseUrl}/api/kpi/kpi-master/target-values/${id}`,
        KpiMasterMapper.toUpdateTargetValueApiDto(data),
        {
          headers: this.createHeaders(tenantId),
        },
      ),
    );

    return KpiMasterMapper.toTargetValueDto(response.data);
  }
}
