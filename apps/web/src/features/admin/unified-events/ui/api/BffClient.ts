/**
 * BffClient Interface for Unified Events
 *
 * UI → BFF の通信インターフェース定義
 * 実装は MockBffClient または HttpBffClient
 */

import type {
  UnifiedEventType,
  BffUnifiedEventListRequest,
  BffUnifiedEventListResponse,
  BffUnifiedEventDetailResponse,
  BffSubmissionListRequest,
  BffSubmissionListResponse,
  BffSendReminderRequest,
  BffSendReminderResponse,
} from '@epm/contracts/bff/unified-events'

export interface BffClient {
  // イベント一覧取得
  listEvents(request: BffUnifiedEventListRequest): Promise<BffUnifiedEventListResponse>

  // イベント詳細取得
  getEventDetail(
    eventType: UnifiedEventType,
    eventId: string
  ): Promise<BffUnifiedEventDetailResponse>

  // 登録状況一覧取得（BUDGET/FORECAST/MEETINGのみ）
  listSubmissions(
    eventType: UnifiedEventType,
    eventId: string,
    request: BffSubmissionListRequest
  ): Promise<BffSubmissionListResponse>

  // 催促送信
  sendReminder(
    eventType: UnifiedEventType,
    eventId: string,
    request: BffSendReminderRequest
  ): Promise<BffSendReminderResponse>
}
