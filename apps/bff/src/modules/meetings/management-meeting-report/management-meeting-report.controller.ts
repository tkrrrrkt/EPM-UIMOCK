import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common'
import { ManagementMeetingReportService } from './management-meeting-report.service'
import type {
  MeetingEventDto,
  MeetingEventListDto,
  CreateMeetingEventDto,
  UpdateMeetingEventDto,
  UpdateMeetingEventStatusDto,
  GetMeetingEventsQueryDto,
  SubmissionStatusSummaryDto,
  MeetingSubmissionDto,
  SaveSubmissionDto,
  KpiCardListDto,
  // Phase 2 DTOs
  SubmissionTrackingDto,
  RemindSubmissionDto,
  CloseEventDto,
  CloseEventResultDto,
  MeetingMinutesDto,
  SaveMeetingMinutesDto,
} from '@epm/contracts/bff/meetings'

/**
 * ManagementMeetingReportController
 *
 * Purpose:
 * - Expose BFF REST API for 経営会議レポート機能 UI
 * - Extract tenant_id/user_id from auth headers (Clerk)
 * - Delegate to BFF service for Mock API responses
 * - Return UI-optimized DTOs with page/pageSize/totalCount
 *
 * Authentication / Tenant Context:
 * - tenant_id/user_id resolved from Clerk auth middleware
 * - All requests require authentication
 * - BFF controller passes tenant_id/user_id to service
 *
 * Error Policy:
 * - Pass-through: Domain API errors are passed to UI as-is
 * - UI handles error display based on error codes
 */
@Controller('bff/meetings')
export class ManagementMeetingReportController {
  constructor(private readonly service: ManagementMeetingReportService) {}

  // ==================== Meeting Events ====================

  /**
   * GET /api/bff/meetings/events
   * 会議イベント一覧取得
   */
  @Get('events')
  async getEvents(
    @Headers('x-tenant-id') tenantId: string,
    @Query() query: GetMeetingEventsQueryDto,
  ): Promise<MeetingEventListDto> {
    return this.service.getEvents(tenantId, query)
  }

  /**
   * GET /api/bff/meetings/events/:id
   * 会議イベント詳細取得
   */
  @Get('events/:id')
  async getEvent(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ): Promise<MeetingEventDto> {
    const event = await this.service.getEventById(tenantId, id)
    if (!event) {
      throw new NotFoundException(`Meeting event not found: ${id}`)
    }
    return event
  }

  /**
   * POST /api/bff/meetings/events
   * 会議イベント作成
   */
  @Post('events')
  async createEvent(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() data: CreateMeetingEventDto,
  ): Promise<MeetingEventDto> {
    return this.service.createEvent(tenantId, userId, data)
  }

  /**
   * PUT /api/bff/meetings/events/:id
   * 会議イベント更新
   */
  @Put('events/:id')
  async updateEvent(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
    @Body() data: UpdateMeetingEventDto,
  ): Promise<MeetingEventDto> {
    const event = await this.service.updateEvent(tenantId, userId, id, data)
    if (!event) {
      throw new NotFoundException(`Meeting event not found: ${id}`)
    }
    return event
  }

  /**
   * POST /api/bff/meetings/events/:id/status
   * 会議イベントステータス更新
   */
  @Post('events/:id/status')
  @HttpCode(HttpStatus.OK)
  async updateEventStatus(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
    @Body() data: UpdateMeetingEventStatusDto,
  ): Promise<MeetingEventDto> {
    const event = await this.service.updateEventStatus(tenantId, userId, id, data)
    if (!event) {
      throw new NotFoundException(`Meeting event not found: ${id}`)
    }
    return event
  }

  // ==================== Submission Status ====================

  /**
   * GET /api/bff/meetings/events/:id/submission-status
   * 提出状況一覧取得
   */
  @Get('events/:id/submission-status')
  async getSubmissionStatus(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') eventId: string,
  ): Promise<SubmissionStatusSummaryDto> {
    return this.service.getSubmissionStatus(tenantId, eventId)
  }

  // ==================== Submissions ====================

  /**
   * GET /api/bff/meetings/submissions/:eventId/:deptId
   * 部門報告取得
   */
  @Get('submissions/:eventId/:deptId')
  async getSubmission(
    @Headers('x-tenant-id') tenantId: string,
    @Param('eventId') eventId: string,
    @Param('deptId') deptId: string,
  ): Promise<MeetingSubmissionDto> {
    const submission = await this.service.getSubmission(tenantId, eventId, deptId)
    if (!submission) {
      throw new NotFoundException(`Submission not found: ${eventId}/${deptId}`)
    }
    return submission
  }

  /**
   * POST /api/bff/meetings/submissions
   * 報告保存
   */
  @Post('submissions')
  async saveSubmission(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() data: SaveSubmissionDto,
  ): Promise<MeetingSubmissionDto> {
    return this.service.saveSubmission(tenantId, userId, data)
  }

  /**
   * POST /api/bff/meetings/submissions/:id/submit
   * 報告提出
   */
  @Post('submissions/:id/submit')
  @HttpCode(HttpStatus.OK)
  async submitSubmission(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
  ): Promise<MeetingSubmissionDto> {
    const submission = await this.service.submitSubmission(tenantId, userId, id)
    if (!submission) {
      throw new NotFoundException(`Submission not found: ${id}`)
    }
    return submission
  }

  // ==================== KPI Cards ====================

  /**
   * GET /api/bff/meetings/events/:id/kpi-cards
   * KPIカード一覧取得
   */
  @Get('events/:id/kpi-cards')
  async getKpiCards(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') eventId: string,
    @Query('departmentStableId') departmentStableId?: string,
  ): Promise<KpiCardListDto> {
    return this.service.getKpiCards(tenantId, eventId, departmentStableId)
  }

  // ==================== Phase 2: B3 登録状況管理 ====================

  /**
   * GET /api/bff/meetings/events/:id/submission-tracking
   * 登録状況詳細取得（B3用）
   */
  @Get('events/:id/submission-tracking')
  async getSubmissionTracking(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') eventId: string,
  ): Promise<SubmissionTrackingDto> {
    return this.service.getSubmissionTracking(tenantId, eventId)
  }

  /**
   * POST /api/bff/meetings/events/:id/remind
   * 催促メール送信（B3用）
   */
  @Post('events/:id/remind')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remindSubmission(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') eventId: string,
    @Body() data: RemindSubmissionDto,
  ): Promise<void> {
    await this.service.remindSubmission(tenantId, userId, eventId, data)
  }

  // ==================== Phase 2: B4 会議クローズ ====================

  /**
   * POST /api/bff/meetings/events/:id/close
   * 会議クローズ（B4用）
   */
  @Post('events/:id/close')
  @HttpCode(HttpStatus.OK)
  async closeEvent(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') eventId: string,
    @Body() data: CloseEventDto,
  ): Promise<CloseEventResultDto> {
    return this.service.closeEvent(tenantId, userId, eventId, data)
  }

  // ==================== Phase 2: B5 議事録 ====================

  /**
   * GET /api/bff/meetings/events/:id/minutes
   * 議事録取得（B5用）
   */
  @Get('events/:id/minutes')
  async getMinutes(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') eventId: string,
  ): Promise<MeetingMinutesDto> {
    const minutes = await this.service.getMinutes(tenantId, eventId)
    if (!minutes) {
      throw new NotFoundException(`Minutes not found for event: ${eventId}`)
    }
    return minutes
  }

  /**
   * POST /api/bff/meetings/events/:id/minutes
   * 議事録保存（B5用）
   */
  @Post('events/:id/minutes')
  @HttpCode(HttpStatus.OK)
  async saveMinutes(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') eventId: string,
    @Body() data: SaveMeetingMinutesDto,
  ): Promise<MeetingMinutesDto> {
    return this.service.saveMinutes(tenantId, userId, eventId, data)
  }
}
