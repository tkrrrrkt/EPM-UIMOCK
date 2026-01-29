import type {
  FormSectionDto,
  FormFieldDto,
} from '@epm/contracts/bff/meetings'

/**
 * Meeting Minutes BFF Client Interface
 *
 * Handles meeting minutes form display and data submission.
 * Minutes form is loaded from Form Settings (sectionCode='MEETING_MINUTES' only).
 */
export interface BffClient {
  /**
   * Get meeting minutes form definition
   * @param eventId - Meeting event ID
   * @returns MinutesFormDto with form structure and existing data
   */
  getMinutesForm(eventId: string): Promise<MinutesFormDto>

  /**
   * Save meeting minutes data
   * @param eventId - Meeting event ID
   * @param data - Form field values to save
   * @returns Saved minutes data with timestamp
   */
  saveMinutes(
    eventId: string,
    data: SaveMinutesDataDto,
  ): Promise<MeetingMinutesDto>

  /**
   * Get existing meeting minutes data (if already saved)
   * @param eventId - Meeting event ID
   * @returns Existing minutes data or null if not yet saved
   */
  getMinutesData(eventId: string): Promise<MeetingMinutesDto | null>
}

/**
 * Minutes form definition DTO
 * Contains MEETING_MINUTES sections and their fields
 */
export interface MinutesFormDto {
  eventId: string
  sections: MinutesSectionDto[]
}

export interface MinutesSectionDto extends FormSectionDto {
  sectionCode: 'MEETING_MINUTES' // Fixed
  fields: FormFieldDto[]
}

/**
 * Minutes data DTO
 * Represents saved minutes with field values
 */
export interface MeetingMinutesDto {
  eventId: string
  minutesId?: string // null if not yet saved
  fieldValues: MinutesFieldValueDto[]
  createdAt?: Date
  updatedAt?: Date
  createdByUserName?: string
}

export interface MinutesFieldValueDto {
  formFieldId: string
  fieldName: string // For display
  fieldType: string // TEXT | TEXTAREA | DATE | SELECT | MULTI_SELECT | FILE
  value: string | number | boolean | Date | File[] | null
}

/**
 * Save request DTO
 */
export interface SaveMinutesDataDto {
  fieldValues: {
    formFieldId: string
    value: string | number | boolean | Date | File[] | null
  }[]
}

/**
 * Error types
 */
export class MeetingEventNotFoundError extends Error {
  constructor(eventId: string) {
    super(`Meeting event not found: ${eventId}`)
    this.name = 'MeetingEventNotFoundError'
  }
}

export class MeetingMinutesFormNotFoundError extends Error {
  constructor(eventId: string) {
    super(`Meeting minutes form not configured for event: ${eventId}`)
    this.name = 'MeetingMinutesFormNotFoundError'
  }
}

export class MeetingMinutesSaveError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'MeetingMinutesSaveError'
  }
}
