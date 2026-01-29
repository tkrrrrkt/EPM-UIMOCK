/**
 * Meeting Minutes Feature
 *
 * Provides meeting minutes registration interface (議事録タブ).
 * Integrated into meeting report display screen (C2).
 *
 * Phase 1: UI + Mock (current)
 * Phase 2: Backend + persistence
 */

export { MinutesFormTab } from './components'
export type {
  BffClient,
  MinutesFormDto,
  MeetingMinutesDto,
  SaveMinutesDataDto,
} from './api'
export {
  mockBffClient,
  MeetingEventNotFoundError,
  MeetingMinutesFormNotFoundError,
  MeetingMinutesSaveError,
} from './api'
