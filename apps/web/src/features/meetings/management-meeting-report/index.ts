/**
 * Management Meeting Report Feature (経営会議レポート機能)
 *
 * Phase 1 Implementation:
 * - B1: EventListPage (会議イベント一覧)
 * - B2: EventCreateWizard (会議イベント作成)
 * - C1: SubmissionFormPage (報告登録)
 * - D1+D2: ReportMainPage + SummaryDashboard (レポートメイン + サマリー)
 *
 * Phase 2 Implementation:
 * - B3: SubmissionTrackingPage (登録状況管理)
 * - B4: EventClosePage (会議クローズ)
 * - B5: MinutesFormPage (議事録登録)
 *
 * API Clients:
 * - MockBffClient: For UI-MOCK phase development
 * - HttpBffClient: For production (connects to real BFF)
 */

// Components
export {
  // Phase 1
  EventListPage,
  EventCreateWizard,
  SubmissionFormPage,
  ReportMainPage,
  SummaryDashboard,
  KpiCard,
  // Phase 2
  SubmissionTrackingPage,
  EventClosePage,
  MinutesFormPage,
  // Shared
  MeetingEventStatusBadge,
  SubmissionStatusBadge,
  KpiCardStatusBadge,
} from './components'

// API Clients
export type { BffClient } from './api'
export { MockBffClient, HttpBffClient } from './api'
