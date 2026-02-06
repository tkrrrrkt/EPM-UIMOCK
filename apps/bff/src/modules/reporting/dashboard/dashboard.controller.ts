/**
 * Dashboard BFF Controller
 *
 * Purpose:
 * - Expose BFF REST API for Dashboard UI
 * - Extract tenant_id/user_id from auth headers (Clerk)
 * - Delegate to BFF service
 * - Return UI-optimized DTOs
 *
 * BFF Endpoints:
 * - GET    /api/bff/reporting/dashboards              - ダッシュボード一覧
 * - GET    /api/bff/reporting/dashboards/:id          - ダッシュボード詳細
 * - POST   /api/bff/reporting/dashboards              - ダッシュボード作成
 * - PUT    /api/bff/reporting/dashboards/:id          - ダッシュボード更新
 * - DELETE /api/bff/reporting/dashboards/:id          - ダッシュボード削除
 * - POST   /api/bff/reporting/dashboards/:id/duplicate- ダッシュボード複製
 * - POST   /api/bff/reporting/dashboards/:id/widgets/:widgetId/data - ウィジェットデータ取得
 * - GET    /api/bff/reporting/dashboards/templates    - テンプレート一覧
 * - GET    /api/bff/reporting/dashboards/selectors    - 選択肢取得
 * - GET    /api/bff/reporting/dashboards/selectors/kpi-definitions - KPI定義選択肢
 *
 * Error Policy: Pass-through (Domain API errors passed to UI as-is)
 *
 * Reference: .kiro/specs/reporting/dashboard/design.md (Task 10.1)
 */
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { DashboardBffService } from './dashboard.service';
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
  BffSubjectSelectorResponse,
  BffMetricSelectorResponse,
} from '@epm/contracts/bff/dashboard';

/** Query DTO for dashboard list */
interface GetDashboardsQueryDto {
  page?: string;
  pageSize?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  keyword?: string;
}

@Controller('reporting/dashboards')
export class DashboardBffController {
  constructor(private readonly service: DashboardBffService) {}

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
  // Dashboard CRUD
  // =========================================================================

  /**
   * GET /api/bff/reporting/dashboards
   * ダッシュボード一覧取得
   */
  @Get()
  async getDashboards(
    @Headers('x-tenant-id') tenantId: string,
    @Query() query: GetDashboardsQueryDto,
  ): Promise<BffDashboardListDto> {
    this.validateTenantId(tenantId);
    return this.service.getDashboards(tenantId, {
      page: query.page ? parseInt(query.page, 10) : undefined,
      pageSize: query.pageSize ? parseInt(query.pageSize, 10) : undefined,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      keyword: query.keyword,
    });
  }

  /**
   * GET /api/bff/reporting/dashboards/templates
   * テンプレート一覧取得
   * NOTE: This route must be before :id to avoid conflicts
   */
  @Get('templates')
  async getTemplates(
    @Headers('x-tenant-id') tenantId: string,
  ): Promise<BffDashboardTemplateListDto> {
    this.validateTenantId(tenantId);
    return this.service.getTemplates(tenantId);
  }

  /**
   * GET /api/bff/reporting/dashboards/selectors
   * 選択肢取得（年度、部門等）
   * NOTE: This route must be before :id to avoid conflicts
   */
  @Get('selectors')
  async getSelectors(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-company-id') companyId: string,
    @Query() query?: BffDashboardSelectorsRequestDto,
  ): Promise<BffDashboardSelectorsResponseDto> {
    this.validateTenantId(tenantId);
    this.validateCompanyId(companyId);
    return this.service.getSelectors(tenantId, companyId, query);
  }

  /**
   * GET /api/bff/reporting/dashboards/selectors/kpi-definitions
   * 非財務KPI定義の選択肢取得
   * NOTE: This route must be before :id to avoid conflicts
   */
  @Get('selectors/kpi-definitions')
  async getKpiDefinitionSelectors(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-company-id') companyId: string,
  ): Promise<BffKpiDefinitionOptionListDto> {
    this.validateTenantId(tenantId);
    this.validateCompanyId(companyId);
    return this.service.getKpiDefinitions(tenantId, companyId);
  }

  /**
   * GET /api/bff/reporting/dashboards/selectors/subjects
   * 科目（FACT）選択肢取得
   * NOTE: This route must be before :id to avoid conflicts
   */
  @Get('selectors/subjects')
  async getSubjectSelectors(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-company-id') companyId: string,
  ) {
    this.validateTenantId(tenantId);
    this.validateCompanyId(companyId);
    return this.service.getSubjectSelectors(tenantId, companyId);
  }

  /**
   * GET /api/bff/reporting/dashboards/selectors/metrics
   * 指標（METRIC）選択肢取得
   * NOTE: This route must be before :id to avoid conflicts
   */
  @Get('selectors/metrics')
  async getMetricSelectors(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-company-id') companyId: string,
  ) {
    this.validateTenantId(tenantId);
    this.validateCompanyId(companyId);
    return this.service.getMetricSelectors(tenantId, companyId);
  }

  /**
   * GET /api/bff/reporting/dashboards/:id
   * ダッシュボード詳細取得
   */
  @Get(':id')
  async getDashboard(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ): Promise<BffDashboardDetailDto> {
    this.validateTenantId(tenantId);
    return this.service.getDashboard(tenantId, id);
  }

  /**
   * POST /api/bff/reporting/dashboards
   * ダッシュボード作成
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createDashboard(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() data: BffCreateDashboardDto,
  ): Promise<BffDashboardDetailDto> {
    this.validateTenantId(tenantId);
    this.validateUserId(userId);
    return this.service.createDashboard(tenantId, userId, data);
  }

  /**
   * PUT /api/bff/reporting/dashboards/:id
   * ダッシュボード更新
   */
  @Put(':id')
  async updateDashboard(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
    @Body() data: BffUpdateDashboardDto,
  ): Promise<BffDashboardDetailDto> {
    this.validateTenantId(tenantId);
    this.validateUserId(userId);
    return this.service.updateDashboard(tenantId, userId, id, data);
  }

  /**
   * DELETE /api/bff/reporting/dashboards/:id
   * ダッシュボード削除
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDashboard(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
  ): Promise<void> {
    this.validateTenantId(tenantId);
    this.validateUserId(userId);
    await this.service.deleteDashboard(tenantId, userId, id);
  }

  /**
   * POST /api/bff/reporting/dashboards/:id/duplicate
   * ダッシュボード複製
   */
  @Post(':id/duplicate')
  async duplicateDashboard(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
  ): Promise<BffDashboardDetailDto> {
    this.validateTenantId(tenantId);
    this.validateUserId(userId);
    return this.service.duplicateDashboard(tenantId, userId, id);
  }

  // =========================================================================
  // Widget Data
  // =========================================================================

  /**
   * POST /api/bff/reporting/dashboards/:id/widgets/:widgetId/data
   * ウィジェットデータ取得
   */
  @Post(':id/widgets/:widgetId/data')
  async getWidgetData(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-company-id') companyId: string,
    @Param('id') dashboardId: string,
    @Param('widgetId') widgetId: string,
    @Body() request: BffWidgetDataRequestDto,
  ): Promise<BffWidgetDataResponseDto> {
    this.validateTenantId(tenantId);
    this.validateCompanyId(companyId);
    return this.service.getWidgetData(tenantId, companyId, dashboardId, widgetId, request);
  }
}
