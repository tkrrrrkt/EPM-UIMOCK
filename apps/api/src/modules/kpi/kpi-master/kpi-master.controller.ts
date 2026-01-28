/**
 * KPI Master API Controller
 *
 * @module kpi/kpi-master
 *
 * Domain API Endpoints:
 * - POST   /api/kpi/kpi-master/events                - KPI管理イベント作成
 * - PATCH  /api/kpi/kpi-master/events/:id/confirm   - KPI管理イベント確定
 * - GET    /api/kpi/kpi-master/events                - KPI管理イベント一覧
 * - GET    /api/kpi/kpi-master/events/:id            - KPI管理イベント詳細
 * - POST   /api/kpi/kpi-master/items                 - KPI項目作成
 * - PATCH  /api/kpi/kpi-master/items/:id             - KPI項目更新
 * - DELETE /api/kpi/kpi-master/items/:id             - KPI項目削除
 * - GET    /api/kpi/kpi-master/items                 - KPI項目一覧
 * - GET    /api/kpi/kpi-master/items/:id             - KPI項目詳細
 * - GET    /api/kpi/kpi-master/selectable-subjects   - 選択可能勘定科目
 * - GET    /api/kpi/kpi-master/selectable-metrics    - 選択可能指標
 * - POST   /api/kpi/kpi-master/kpi-definitions       - 非財務KPI定義作成
 * - GET    /api/kpi/kpi-master/kpi-definitions       - 非財務KPI定義一覧
 * - POST   /api/kpi/kpi-master/fact-amounts          - 予実データ作成
 * - PUT    /api/kpi/kpi-master/fact-amounts/:id      - 予実データ更新
 * - POST   /api/kpi/kpi-master/target-values         - 目標値作成
 * - PUT    /api/kpi/kpi-master/target-values/:id     - 目標値更新
 *
 * Spec: .kiro/specs/kpi/kpi-master/design.md (Controller Specification)
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
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { KpiMasterEventService } from './services/kpi-master-event.service';
import { KpiMasterItemService, UserContext } from './services/kpi-master-item.service';
import { KpiDefinitionService } from './services/kpi-definition.service';
import { KpiFactAmountService } from './services/kpi-fact-amount.service';
import { KpiTargetValueService } from './services/kpi-target-value.service';
import type {
  KpiMasterEventApiDto,
  CreateKpiMasterEventApiDto,
  GetKpiMasterEventsApiQueryDto,
  KpiMasterItemApiDto,
  CreateKpiMasterItemApiDto,
  UpdateKpiMasterItemApiDto,
  GetKpiMasterItemsApiQueryDto,
  KpiDefinitionApiDto,
  CreateKpiDefinitionApiDto,
  GetKpiDefinitionsApiQueryDto,
  KpiFactAmountApiDto,
  CreateKpiFactAmountApiDto,
  UpdateKpiFactAmountApiDto,
  KpiTargetValueApiDto,
  CreateKpiTargetValueApiDto,
  UpdateKpiTargetValueApiDto,
} from '@epm/contracts/api/kpi-master';
import {
  KpiMasterEventNotFoundError,
  KpiMasterEventAlreadyConfirmedError,
  KpiMasterEventDuplicateError,
  KpiMasterItemNotFoundError,
  KpiMasterItemTypeImmutableError,
  KpiMasterItemDeleteForbiddenError,
  KpiMasterItemAccessDeniedError,
  KpiMasterItemInvalidReferenceError,
  KpiDefinitionDuplicateError,
  KpiFactAmountDuplicateError,
  KpiFactAmountNotFoundError,
  KpiTargetValueDuplicateError,
  KpiTargetValueNotFoundError,
} from '@epm/contracts/shared/errors';

@Controller('kpi/kpi-master')
export class KpiMasterController {
  constructor(
    private readonly kpiMasterEventService: KpiMasterEventService,
    private readonly kpiMasterItemService: KpiMasterItemService,
    private readonly kpiDefinitionService: KpiDefinitionService,
    private readonly kpiFactAmountService: KpiFactAmountService,
    private readonly kpiTargetValueService: KpiTargetValueService,
  ) {}

  // =========================================================================
  // KPI管理イベント操作
  // =========================================================================

  /**
   * POST /api/kpi/kpi-master/events
   * KPI管理イベント作成
   */
  @Post('events')
  @HttpCode(HttpStatus.CREATED)
  async createEvent(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Headers('x-company-id') companyId: string,
    @Body() data: Omit<CreateKpiMasterEventApiDto, 'tenant_id' | 'created_by'>,
  ): Promise<KpiMasterEventApiDto> {
    this.validateTenantId(tenantId);
    this.validateUserId(userId);
    this.validateCompanyId(companyId);

    try {
      return await this.kpiMasterEventService.createEvent(tenantId, userId, {
        ...data,
        company_id: companyId,
      });
    } catch (error) {
      if (error instanceof KpiMasterEventDuplicateError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  /**
   * PATCH /api/kpi/kpi-master/events/:id/confirm
   * KPI管理イベント確定
   */
  @Patch('events/:id/confirm')
  async confirmEvent(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
  ): Promise<KpiMasterEventApiDto> {
    this.validateTenantId(tenantId);
    this.validateUserId(userId);

    try {
      return await this.kpiMasterEventService.confirmEvent(tenantId, id, userId);
    } catch (error) {
      if (error instanceof KpiMasterEventNotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof KpiMasterEventAlreadyConfirmedError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  /**
   * GET /api/kpi/kpi-master/events
   * KPI管理イベント一覧取得
   */
  @Get('events')
  async getEvents(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-company-id') companyId: string,
    @Query() query: Omit<GetKpiMasterEventsApiQueryDto, 'tenant_id' | 'company_id'>,
  ): Promise<{ items: KpiMasterEventApiDto[]; total: number }> {
    this.validateTenantId(tenantId);
    this.validateCompanyId(companyId);

    return this.kpiMasterEventService.findAllEvents(tenantId, {
      ...query,
      company_id: companyId,
    });
  }

  /**
   * GET /api/kpi/kpi-master/events/:id
   * KPI管理イベント詳細取得
   */
  @Get('events/:id')
  async getEvent(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ): Promise<KpiMasterEventApiDto> {
    this.validateTenantId(tenantId);

    try {
      return await this.kpiMasterEventService.findEventById(tenantId, id);
    } catch (error) {
      if (error instanceof KpiMasterEventNotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  // =========================================================================
  // KPI項目操作
  // =========================================================================

  /**
   * POST /api/kpi/kpi-master/items
   * KPI項目作成
   */
  @Post('items')
  @HttpCode(HttpStatus.CREATED)
  async createItem(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Headers('x-company-id') companyId: string,
    @Body() data: Omit<CreateKpiMasterItemApiDto, 'tenant_id' | 'created_by'>,
  ): Promise<KpiMasterItemApiDto> {
    this.validateTenantId(tenantId);
    this.validateUserId(userId);
    this.validateCompanyId(companyId);

    try {
      return await this.kpiMasterItemService.createItem(tenantId, userId, {
        ...data,
        company_id: companyId,
      });
    } catch (error) {
      if (error instanceof KpiMasterItemInvalidReferenceError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  /**
   * PATCH /api/kpi/kpi-master/items/:id
   * KPI項目更新
   */
  @Patch('items/:id')
  async updateItem(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
    @Body() data: Omit<UpdateKpiMasterItemApiDto, 'updated_by'>,
  ): Promise<KpiMasterItemApiDto> {
    this.validateTenantId(tenantId);
    this.validateUserId(userId);

    const userContext = this.extractUserContext(userId);

    try {
      return await this.kpiMasterItemService.updateItem(
        tenantId,
        id,
        userId,
        data,
        userContext,
      );
    } catch (error) {
      if (error instanceof KpiMasterItemNotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof KpiMasterItemAccessDeniedError) {
        throw new ForbiddenException(error.message);
      }
      throw error;
    }
  }

  /**
   * DELETE /api/kpi/kpi-master/items/:id
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

    const userContext = this.extractUserContext(userId);

    try {
      await this.kpiMasterItemService.deleteItem(tenantId, id, userId, userContext);
    } catch (error) {
      if (error instanceof KpiMasterItemNotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof KpiMasterItemAccessDeniedError) {
        throw new ForbiddenException(error.message);
      }
      if (error instanceof KpiMasterItemDeleteForbiddenError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  /**
   * GET /api/kpi/kpi-master/items
   * KPI項目一覧取得
   */
  @Get('items')
  async getItems(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Query() query: Omit<GetKpiMasterItemsApiQueryDto, 'tenant_id'>,
  ): Promise<KpiMasterItemApiDto[]> {
    this.validateTenantId(tenantId);
    this.validateUserId(userId);

    const userContext = this.extractUserContext(userId);

    return this.kpiMasterItemService.findAllItems(tenantId, query, userContext);
  }

  /**
   * GET /api/kpi/kpi-master/items/:id
   * KPI項目詳細取得
   */
  @Get('items/:id')
  async getItem(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
  ): Promise<KpiMasterItemApiDto> {
    this.validateTenantId(tenantId);
    this.validateUserId(userId);

    const userContext = this.extractUserContext(userId);

    try {
      return await this.kpiMasterItemService.findItemById(tenantId, id, userContext);
    } catch (error) {
      if (error instanceof KpiMasterItemNotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof KpiMasterItemAccessDeniedError) {
        throw new ForbiddenException(error.message);
      }
      throw error;
    }
  }

  // =========================================================================
  // 選択可能オプション
  // =========================================================================

  /**
   * GET /api/kpi/kpi-master/selectable-subjects
   * 選択可能勘定科目一覧取得
   */
  @Get('selectable-subjects')
  async getSelectableSubjects(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-company-id') companyId: string,
  ): Promise<any[]> {
    this.validateTenantId(tenantId);
    this.validateCompanyId(companyId);

    // TODO: Phase 2 - SubjectRepository.findSelectable() 実装
    // kpi_managed=true の勘定科目のみ返す
    return [];
  }

  /**
   * GET /api/kpi/kpi-master/selectable-metrics
   * 選択可能指標一覧取得
   */
  @Get('selectable-metrics')
  async getSelectableMetrics(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-company-id') companyId: string,
  ): Promise<any[]> {
    this.validateTenantId(tenantId);
    this.validateCompanyId(companyId);

    // TODO: Phase 2 - MetricRepository.findSelectable() 実装
    // kpi_managed=true の指標のみ返す
    return [];
  }

  // =========================================================================
  // 非財務KPI定義
  // =========================================================================

  /**
   * POST /api/kpi/kpi-master/kpi-definitions
   * 非財務KPI定義作成
   */
  @Post('kpi-definitions')
  @HttpCode(HttpStatus.CREATED)
  async createKpiDefinition(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Headers('x-company-id') companyId: string,
    @Body() data: Omit<CreateKpiDefinitionApiDto, 'tenant_id' | 'created_by'>,
  ): Promise<KpiDefinitionApiDto> {
    this.validateTenantId(tenantId);
    this.validateUserId(userId);
    this.validateCompanyId(companyId);

    try {
      return await this.kpiDefinitionService.createDefinition(tenantId, userId, {
        ...data,
        company_id: companyId,
      });
    } catch (error) {
      if (error instanceof KpiDefinitionDuplicateError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  /**
   * GET /api/kpi/kpi-master/kpi-definitions
   * 非財務KPI定義一覧取得
   */
  @Get('kpi-definitions')
  async getKpiDefinitions(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-company-id') companyId: string,
    @Query() query: Omit<GetKpiDefinitionsApiQueryDto, 'tenant_id' | 'company_id'>,
  ): Promise<{ items: KpiDefinitionApiDto[]; total: number }> {
    this.validateTenantId(tenantId);
    this.validateCompanyId(companyId);

    return this.kpiDefinitionService.findAllDefinitions(tenantId, {
      ...query,
      company_id: companyId,
    });
  }

  // =========================================================================
  // 非財務KPI予実データ
  // =========================================================================

  /**
   * POST /api/kpi/kpi-master/fact-amounts
   * 予実データ作成
   */
  @Post('fact-amounts')
  @HttpCode(HttpStatus.CREATED)
  async createFactAmount(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Headers('x-company-id') companyId: string,
    @Body() data: Omit<CreateKpiFactAmountApiDto, 'tenant_id' | 'created_by'>,
  ): Promise<KpiFactAmountApiDto> {
    this.validateTenantId(tenantId);
    this.validateUserId(userId);
    this.validateCompanyId(companyId);

    try {
      return await this.kpiFactAmountService.createFactAmount(tenantId, userId, {
        ...data,
        company_id: companyId,
      });
    } catch (error) {
      if (error instanceof KpiFactAmountDuplicateError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  /**
   * PUT /api/kpi/kpi-master/fact-amounts/:id
   * 予実データ更新
   */
  @Put('fact-amounts/:id')
  async updateFactAmount(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
    @Body() data: Omit<UpdateKpiFactAmountApiDto, 'updated_by'>,
  ): Promise<KpiFactAmountApiDto> {
    this.validateTenantId(tenantId);
    this.validateUserId(userId);

    try {
      return await this.kpiFactAmountService.updateFactAmount(tenantId, id, userId, data);
    } catch (error) {
      if (error instanceof KpiFactAmountNotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  // =========================================================================
  // 指標目標値
  // =========================================================================

  /**
   * POST /api/kpi/kpi-master/target-values
   * 目標値作成
   */
  @Post('target-values')
  @HttpCode(HttpStatus.CREATED)
  async createTargetValue(
    @Headers('x-tenant-id') tenantId: string,
    @Body() data: Omit<CreateKpiTargetValueApiDto, 'tenant_id'>,
  ): Promise<KpiTargetValueApiDto> {
    this.validateTenantId(tenantId);

    try {
      return await this.kpiTargetValueService.createTargetValue(tenantId, data);
    } catch (error) {
      if (error instanceof KpiTargetValueDuplicateError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  /**
   * PUT /api/kpi/kpi-master/target-values/:id
   * 目標値更新
   */
  @Put('target-values/:id')
  async updateTargetValue(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() data: UpdateKpiTargetValueApiDto,
  ): Promise<KpiTargetValueApiDto> {
    this.validateTenantId(tenantId);

    try {
      return await this.kpiTargetValueService.updateTargetValue(tenantId, id, data);
    } catch (error) {
      if (error instanceof KpiTargetValueNotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  // =========================================================================
  // Private Validation Methods
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

  /**
   * UserContext 抽出
   *
   * Phase 1 実装:
   * - permissions と controlDepartmentStableIds はヘッダーから取得
   * - 本来は AuthService/UserService から取得すべき
   *
   * TODO: Phase 2 - AuthService/UserService 連携
   */
  private extractUserContext(userId: string): UserContext {
    return {
      userId,
      permissions: ['epm.kpi.admin'], // TODO: 実際の権限取得
      controlDepartmentStableIds: [], // TODO: 実際の部門ID取得
    };
  }
}
