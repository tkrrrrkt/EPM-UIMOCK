/**
 * KPI Master BFF Controller
 *
 * Purpose:
 * - Expose BFF REST API for KPI Master UI
 * - Extract tenant_id/user_id from auth headers (Clerk)
 * - Delegate to BFF service
 * - Return UI-optimized DTOs
 *
 * BFF Endpoints:
 * - GET    /api/bff/kpi-master/summary                    - サマリカード（4指標）
 * - GET    /api/bff/kpi-master/events                     - KPI管理イベント一覧
 * - GET    /api/bff/kpi-master/events/:id                 - KPI管理イベント詳細
 * - POST   /api/bff/kpi-master/events                     - KPI管理イベント作成
 * - PATCH  /api/bff/kpi-master/events/:id/confirm         - KPI管理イベント確定
 * - GET    /api/bff/kpi-master/items                      - KPI項目一覧
 * - GET    /api/bff/kpi-master/items/:id                  - KPI項目詳細
 * - POST   /api/bff/kpi-master/items                      - KPI項目作成
 * - PATCH  /api/bff/kpi-master/items/:id                  - KPI項目更新
 * - DELETE /api/bff/kpi-master/items/:id                  - KPI項目削除
 * - GET    /api/bff/kpi-master/selectable-subjects        - 選択可能財務科目
 * - GET    /api/bff/kpi-master/selectable-metrics         - 選択可能指標
 * - GET    /api/bff/kpi-master/kpi-definitions            - 非財務KPI定義一覧
 * - POST   /api/bff/kpi-master/kpi-definitions            - 非財務KPI定義作成
 * - POST   /api/bff/kpi-master/fact-amounts               - 予実データ作成
 * - PUT    /api/bff/kpi-master/fact-amounts/:id           - 予実データ更新
 * - POST   /api/bff/kpi-master/target-values              - 目標値作成
 * - PUT    /api/bff/kpi-master/target-values/:id          - 目標値更新
 *
 * Error Policy: Pass-through (Domain API errors passed to UI as-is)
 *
 * Reference: .kiro/specs/kpi/kpi-master/design.md (Task 5.1)
 */
import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { KpiMasterBffService } from './kpi-master.service';
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

/** Query DTO for event list */
interface GetEventsQueryDto {
  page?: string;
  pageSize?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  keyword?: string;
  fiscalYear?: string;
  status?: 'DRAFT' | 'CONFIRMED';
}

/** Query DTO for item list */
interface GetItemsQueryDto {
  eventId?: string;
  kpiType?: 'FINANCIAL' | 'NON_FINANCIAL' | 'METRIC';
  departmentStableIds?: string | string[];
  hierarchyLevel?: string;
}

/** Query DTO for KPI definition list */
interface GetKpiDefinitionsQueryDto {
  page?: string;
  pageSize?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  keyword?: string;
}

@Controller('kpi-master')
export class KpiMasterBffController {
  constructor(private readonly service: KpiMasterBffService) {}

  // =========================================================================
  // Validation Helpers
  // =========================================================================

  private validateTenantId(tenantId: string): void {
    if (!tenantId) {
      throw new BadRequestException('x-tenant-id header is required');
    }
  }

  private validateUserId(userId: string): void {
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }
  }

  private validateCompanyId(companyId: string): void {
    if (!companyId) {
      throw new BadRequestException('x-company-id header is required');
    }
  }

  // =========================================================================
  // Summary
  // =========================================================================

  /**
   * GET /api/bff/kpi-master/summary
   * サマリカード（4指標取得）
   */
  @Get('summary')
  async getSummary(
    @Headers('x-tenant-id') tenantId: string,
    @Query('eventId') eventId?: string,
  ): Promise<KpiMasterSummaryDto> {
    this.validateTenantId(tenantId);
    return this.service.getSummary(tenantId, eventId);
  }

  // =========================================================================
  // KPI管理イベント操作
  // =========================================================================

  /**
   * GET /api/bff/kpi-master/events
   * KPI管理イベント一覧取得
   */
  @Get('events')
  async getEvents(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-company-id') companyId: string,
    @Query() query: GetEventsQueryDto,
  ): Promise<KpiMasterEventListDto> {
    this.validateTenantId(tenantId);
    this.validateCompanyId(companyId);
    return this.service.getEvents(tenantId, companyId, {
      page: query.page ? parseInt(query.page, 10) : undefined,
      pageSize: query.pageSize ? parseInt(query.pageSize, 10) : undefined,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      keyword: query.keyword,
      fiscalYear: query.fiscalYear ? parseInt(query.fiscalYear, 10) : undefined,
      status: query.status,
    });
  }

  /**
   * GET /api/bff/kpi-master/events/:id
   * KPI管理イベント詳細取得
   */
  @Get('events/:id')
  async getEvent(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ): Promise<KpiMasterEventDetailDto> {
    this.validateTenantId(tenantId);
    return this.service.getEvent(tenantId, id);
  }

  /**
   * POST /api/bff/kpi-master/events
   * KPI管理イベント作成
   */
  @Post('events')
  @HttpCode(HttpStatus.CREATED)
  async createEvent(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-company-id') companyId: string,
    @Headers('x-user-id') userId: string,
    @Body() data: CreateKpiMasterEventDto,
  ): Promise<KpiMasterEventDetailDto> {
    this.validateTenantId(tenantId);
    this.validateCompanyId(companyId);
    this.validateUserId(userId);
    return this.service.createEvent(tenantId, companyId, userId, data);
  }

  /**
   * PATCH /api/bff/kpi-master/events/:id/confirm
   * KPI管理イベント確定
   */
  @Patch('events/:id/confirm')
  async confirmEvent(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
  ): Promise<KpiMasterEventDetailDto> {
    this.validateTenantId(tenantId);
    this.validateUserId(userId);
    return this.service.confirmEvent(tenantId, userId, id);
  }

  // =========================================================================
  // KPI項目操作
  // =========================================================================

  /**
   * GET /api/bff/kpi-master/items
   * KPI項目一覧取得
   */
  @Get('items')
  async getItems(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-company-id') companyId: string,
    @Headers('x-user-id') userId: string,
    @Query() query: GetItemsQueryDto,
  ): Promise<KpiMasterItemDto[]> {
    this.validateTenantId(tenantId);
    this.validateCompanyId(companyId);
    this.validateUserId(userId);
    const departmentStableIds = query.departmentStableIds
      ? Array.isArray(query.departmentStableIds)
        ? query.departmentStableIds
        : query.departmentStableIds
            .split(',')
            .map((value) => value.trim())
            .filter((value) => value.length > 0)
      : undefined;

    return this.service.getItems(tenantId, companyId, userId, {
      eventId: query.eventId,
      kpiType: query.kpiType,
      departmentStableIds,
      hierarchyLevel: query.hierarchyLevel ? (parseInt(query.hierarchyLevel, 10) as 1 | 2) : undefined,
    });
  }

  /**
   * GET /api/bff/kpi-master/items/:id
   * KPI項目詳細取得
   */
  @Get('items/:id')
  async getItem(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
  ): Promise<KpiMasterItemDetailDto> {
    this.validateTenantId(tenantId);
    this.validateUserId(userId);
    return this.service.getItem(tenantId, userId, id);
  }

  /**
   * POST /api/bff/kpi-master/items
   * KPI項目作成
   */
  @Post('items')
  @HttpCode(HttpStatus.CREATED)
  async createItem(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-company-id') companyId: string,
    @Headers('x-user-id') userId: string,
    @Body() data: CreateKpiMasterItemDto,
  ): Promise<KpiMasterItemDetailDto> {
    this.validateTenantId(tenantId);
    this.validateCompanyId(companyId);
    this.validateUserId(userId);
    return this.service.createItem(tenantId, companyId, userId, data);
  }

  /**
   * PATCH /api/bff/kpi-master/items/:id
   * KPI項目更新
   */
  @Patch('items/:id')
  async updateItem(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
    @Body() data: UpdateKpiMasterItemDto,
  ): Promise<KpiMasterItemDetailDto> {
    this.validateTenantId(tenantId);
    this.validateUserId(userId);
    return this.service.updateItem(tenantId, userId, id, data);
  }

  /**
   * DELETE /api/bff/kpi-master/items/:id
   * KPI項目削除
   */
  @Delete('items/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteItem(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
  ): Promise<void> {
    this.validateTenantId(tenantId);
    this.validateUserId(userId);
    await this.service.deleteItem(tenantId, userId, id);
  }

  /**
   * GET /api/bff/kpi-master/selectable-subjects
   * 選択可能財務科目一覧取得
   */
  @Get('selectable-subjects')
  async getSelectableSubjects(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-company-id') companyId: string,
  ): Promise<SelectableSubjectListDto> {
    this.validateTenantId(tenantId);
    this.validateCompanyId(companyId);
    return this.service.getSelectableSubjects(tenantId, companyId);
  }

  /**
   * GET /api/bff/kpi-master/selectable-metrics
   * 選択可能指標一覧取得
   */
  @Get('selectable-metrics')
  async getSelectableMetrics(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-company-id') companyId: string,
  ): Promise<SelectableMetricListDto> {
    this.validateTenantId(tenantId);
    this.validateCompanyId(companyId);
    return this.service.getSelectableMetrics(tenantId, companyId);
  }

  // =========================================================================
  // 非財務KPI定義
  // =========================================================================

  /**
   * GET /api/bff/kpi-master/kpi-definitions
   * 非財務KPI定義一覧取得
   */
  @Get('kpi-definitions')
  async getKpiDefinitions(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-company-id') companyId: string,
    @Query() query: GetKpiDefinitionsQueryDto,
  ): Promise<KpiDefinitionListDto> {
    this.validateTenantId(tenantId);
    this.validateCompanyId(companyId);
    return this.service.getKpiDefinitions(tenantId, companyId, {
      page: query.page ? parseInt(query.page, 10) : undefined,
      pageSize: query.pageSize ? parseInt(query.pageSize, 10) : undefined,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      keyword: query.keyword,
    });
  }

  /**
   * POST /api/bff/kpi-master/kpi-definitions
   * 非財務KPI定義作成
   */
  @Post('kpi-definitions')
  @HttpCode(HttpStatus.CREATED)
  async createKpiDefinition(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-company-id') companyId: string,
    @Headers('x-user-id') userId: string,
    @Body() data: CreateKpiDefinitionDto,
  ): Promise<KpiDefinitionListDto> {
    this.validateTenantId(tenantId);
    this.validateCompanyId(companyId);
    this.validateUserId(userId);
    return this.service.createKpiDefinition(tenantId, companyId, userId, data);
  }

  // =========================================================================
  // 非財務KPI予実データ
  // =========================================================================

  /**
   * POST /api/bff/kpi-master/fact-amounts
   * 予実データ作成
   */
  @Post('fact-amounts')
  @HttpCode(HttpStatus.CREATED)
  async createFactAmount(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-company-id') companyId: string,
    @Headers('x-user-id') userId: string,
    @Body() data: CreateKpiFactAmountDto,
  ): Promise<KpiFactAmountDto> {
    this.validateTenantId(tenantId);
    this.validateCompanyId(companyId);
    this.validateUserId(userId);
    return this.service.createFactAmount(tenantId, companyId, userId, data);
  }

  /**
   * PUT /api/bff/kpi-master/fact-amounts/:id
   * 予実データ更新
   */
  @Put('fact-amounts/:id')
  async updateFactAmount(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
    @Body() data: UpdateKpiFactAmountDto,
  ): Promise<KpiFactAmountDto> {
    this.validateTenantId(tenantId);
    this.validateUserId(userId);
    return this.service.updateFactAmount(tenantId, userId, id, data);
  }

  // =========================================================================
  // 指標目標値
  // =========================================================================

  /**
   * POST /api/bff/kpi-master/target-values
   * 目標値作成
   */
  @Post('target-values')
  @HttpCode(HttpStatus.CREATED)
  async createTargetValue(
    @Headers('x-tenant-id') tenantId: string,
    @Body() data: CreateKpiTargetValueDto,
  ): Promise<KpiTargetValueDto> {
    this.validateTenantId(tenantId);
    return this.service.createTargetValue(tenantId, data);
  }

  /**
   * PUT /api/bff/kpi-master/target-values/:id
   * 目標値更新
   */
  @Put('target-values/:id')
  async updateTargetValue(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() data: UpdateKpiTargetValueDto,
  ): Promise<KpiTargetValueDto> {
    this.validateTenantId(tenantId);
    return this.service.updateTargetValue(tenantId, id, data);
  }
}
