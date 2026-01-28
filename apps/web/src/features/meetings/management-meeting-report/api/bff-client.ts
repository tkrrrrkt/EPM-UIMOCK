import type {
  // Meeting Events
  MeetingEventDto,
  MeetingEventListDto,
  CreateMeetingEventDto,
  UpdateMeetingEventDto,
  UpdateMeetingEventStatusDto,
  GetMeetingEventsQueryDto,
  CloseEventDto,
  CloseEventResultDto,
  // Submissions
  SubmissionStatusSummaryDto,
  MeetingSubmissionDto,
  SaveSubmissionDto,
  SubmissionLevel,
  SubmissionStatus,
  // KPI Cards
  KpiCardListDto,
  // Phase 2: B3, B4, B5
  SubmissionTrackingDto,
  RemindSubmissionDto,
  MeetingMinutesDto,
  SaveMeetingMinutesDto,
} from '@epm/contracts/bff/meetings'

/**
 * 階層組織ノード（提出状況付き）
 * D4 部門報告タブのツリー表示に使用
 */
export interface OrgNodeWithSubmission {
  id: string
  name: string
  isReportingTarget: boolean
  submissionLevel?: SubmissionLevel
  submissionStatus?: SubmissionStatus
  submittedAt?: string
  submittedByName?: string
  children?: OrgNodeWithSubmission[]
}

/**
 * BffClient Interface for Management Meeting Report
 *
 * Purpose:
 * - Define all BFF API methods for 経営会議レポート機能
 * - Enable MockBffClient and HttpBffClient implementations
 * - Ensure type safety across UI layer
 */
export interface BffClient {
  // ========== Meeting Events ==========

  /**
   * 会議イベント一覧取得
   */
  getEvents(query: GetMeetingEventsQueryDto): Promise<MeetingEventListDto>

  /**
   * 会議イベント詳細取得
   */
  getEventById(id: string): Promise<MeetingEventDto>

  /**
   * 会議イベント作成
   */
  createEvent(data: CreateMeetingEventDto): Promise<MeetingEventDto>

  /**
   * 会議イベント更新
   */
  updateEvent(id: string, data: UpdateMeetingEventDto): Promise<MeetingEventDto>

  /**
   * 会議イベントステータス更新
   */
  updateEventStatus(id: string, data: UpdateMeetingEventStatusDto): Promise<MeetingEventDto>

  // ========== Submission Status ==========

  /**
   * 提出状況一覧取得
   */
  getSubmissionStatus(eventId: string): Promise<SubmissionStatusSummaryDto>

  // ========== Submissions ==========

  /**
   * 部門報告取得
   */
  getSubmission(eventId: string, departmentStableId: string): Promise<MeetingSubmissionDto>

  /**
   * 報告保存
   */
  saveSubmission(data: SaveSubmissionDto): Promise<MeetingSubmissionDto>

  /**
   * 報告提出
   */
  submitSubmission(id: string): Promise<MeetingSubmissionDto>

  // ========== KPI Cards ==========

  /**
   * KPIカード一覧取得
   */
  getKpiCards(eventId: string, departmentStableId?: string): Promise<KpiCardListDto>

  // ========== Phase 2: B3 登録状況管理 ==========

  /**
   * 登録状況詳細取得
   */
  getSubmissionTracking(eventId: string): Promise<SubmissionTrackingDto>

  /**
   * 催促メール送信
   */
  remindSubmission(eventId: string, data: RemindSubmissionDto): Promise<void>

  // ========== Phase 2: B4 会議クローズ ==========

  /**
   * 会議クローズ
   */
  closeEvent(eventId: string, data: CloseEventDto): Promise<CloseEventResultDto>

  // ========== Phase 2: B5 議事録 ==========

  /**
   * 議事録取得
   */
  getMinutes(eventId: string): Promise<MeetingMinutesDto>

  /**
   * 議事録保存
   */
  saveMinutes(eventId: string, data: SaveMeetingMinutesDto): Promise<MeetingMinutesDto>

  // ========== D4: 部門報告閲覧 ==========

  /**
   * 組織ツリー（提出状況付き）取得
   */
  getOrgTreeWithSubmission(eventId: string): Promise<OrgNodeWithSubmission[]>
}
