import type {
  BffClient,
  MinutesFormDto,
  MinutesSectionDto,
  MeetingMinutesDto,
  SaveMinutesDataDto,
  MinutesFieldValueDto,
} from './bff-client'
import {
  MeetingEventNotFoundError,
  MeetingMinutesFormNotFoundError,
  MeetingMinutesSaveError,
} from './bff-client'

/**
 * Mock BFF Client for Meeting Minutes
 *
 * Phase 1 Implementation:
 * - Loads form definition from meeting form settings (MEETING_MINUTES sections only)
 * - Stores minutes data in memory
 * - Simulates API behavior
 */

// Mock meeting events
const mockMeetingEvents = [
  { id: 'evt-001', eventCode: 'MTG_202601', eventName: '1月度経営会議', meetingTypeId: 'mt-1' },
  { id: 'evt-002', eventCode: 'MTG_202602', eventName: '2月度経営会議', meetingTypeId: 'mt-1' },
  { id: 'evt-003', eventCode: 'MTG_202603Q', eventName: '2026年度第1四半期会議', meetingTypeId: 'mt-2' },
  { id: 'evt-004', eventCode: 'MTG_202604', eventName: '4月度経営会議', meetingTypeId: 'mt-1' },
  { id: 'evt-005', eventCode: 'MTG_202605', eventName: '5月度経営会議', meetingTypeId: 'mt-1' },
]

// Mock form sections and fields for MEETING_MINUTES
const mockMinutesFormSections: MinutesSectionDto[] = [
  {
    id: 'section-m1',
    meetingTypeId: 'mt-1',
    sectionCode: 'MEETING_MINUTES',
    sectionName: '議事録',
    description: '会議の記録と決定事項',
    inputScope: 'COMPANY',
    isRequired: true,
    isActive: true,
    sortOrder: 10,
    fields: [
      {
        id: 'field-m1-1',
        sectionId: 'section-m1',
        fieldCode: 'DISCUSSION_POINTS',
        fieldName: '議論内容',
        fieldType: 'TEXTAREA',
        isRequired: true,
        isActive: true,
        sortOrder: 10,
        maxLength: 5000,
        placeholder: '会議で議論した主要なポイントを記入してください',
        description: '議論した内容の要約',
        validationRules: { maxLength: 5000 },
      },
      {
        id: 'field-m1-2',
        sectionId: 'section-m1',
        fieldCode: 'DECISIONS',
        fieldName: '決定事項',
        fieldType: 'TEXTAREA',
        isRequired: true,
        isActive: true,
        sortOrder: 20,
        maxLength: 5000,
        placeholder: '本会議で決定した事項を記入してください',
        description: '決定内容と実行期限',
        validationRules: { maxLength: 5000 },
      },
      {
        id: 'field-m1-3',
        sectionId: 'section-m1',
        fieldCode: 'ACTION_DEADLINE',
        fieldName: '実行期限',
        fieldType: 'DATE',
        isRequired: false,
        isActive: true,
        sortOrder: 30,
        placeholder: 'YYYY-MM-DD',
        description: '決定事項の実行予定日',
        validationRules: {},
      },
      {
        id: 'field-m1-4',
        sectionId: 'section-m1',
        fieldCode: 'ISSUES_RISKS',
        fieldName: '課題・リスク',
        fieldType: 'TEXTAREA',
        isRequired: false,
        isActive: true,
        sortOrder: 40,
        maxLength: 3000,
        placeholder: '会議で挙がった課題やリスクを記入してください',
        description: '認識された課題とリスク',
        validationRules: { maxLength: 3000 },
      },
      {
        id: 'field-m1-5',
        sectionId: 'section-m1',
        fieldCode: 'FOLLOWUP_ITEMS',
        fieldName: 'フォローアップ',
        fieldType: 'TEXTAREA',
        isRequired: false,
        isActive: true,
        sortOrder: 50,
        maxLength: 3000,
        placeholder: '次回への引継ぎ項目を記入してください',
        description: '次のステップと確認予定日',
        validationRules: { maxLength: 3000 },
      },
      {
        id: 'field-m1-6',
        sectionId: 'section-m1',
        fieldCode: 'NEXT_REVIEW_DATE',
        fieldName: '次回進捗確認日',
        fieldType: 'DATE',
        isRequired: false,
        isActive: true,
        sortOrder: 60,
        placeholder: 'YYYY-MM-DD',
        description: 'フォローアップ項目の進捗確認予定日',
        validationRules: {},
      },
    ],
  },
  // mt-2（四半期会議）用
  {
    id: 'section-m2',
    meetingTypeId: 'mt-2',
    sectionCode: 'MEETING_MINUTES',
    sectionName: '議事録',
    description: '会議の記録と決定事項',
    inputScope: 'COMPANY',
    isRequired: true,
    isActive: true,
    sortOrder: 10,
    fields: [
      {
        id: 'field-m2-1',
        sectionId: 'section-m2',
        fieldCode: 'DISCUSSION_POINTS',
        fieldName: '議論内容',
        fieldType: 'TEXTAREA',
        isRequired: true,
        isActive: true,
        sortOrder: 10,
        maxLength: 5000,
        placeholder: '会議で議論した主要なポイントを記入してください',
        description: '議論した内容の要約',
        validationRules: { maxLength: 5000 },
      },
      {
        id: 'field-m2-2',
        sectionId: 'section-m2',
        fieldCode: 'STRATEGIC_DECISIONS',
        fieldName: '戦略的決定事項',
        fieldType: 'TEXTAREA',
        isRequired: true,
        isActive: true,
        sortOrder: 20,
        maxLength: 5000,
        placeholder: '四半期に向けた戦略的な決定事項を記入してください',
        description: '経営戦略に関わる決定',
        validationRules: { maxLength: 5000 },
      },
      {
        id: 'field-m2-3',
        sectionId: 'section-m2',
        fieldCode: 'QUARTERLY_INITIATIVES',
        fieldName: '四半期重点施策',
        fieldType: 'TEXTAREA',
        isRequired: true,
        isActive: true,
        sortOrder: 30,
        maxLength: 5000,
        placeholder: '本四半期の重点施策を記入してください',
        description: '重点的に取り組む施策',
        validationRules: { maxLength: 5000 },
      },
    ],
  },
]

// In-memory storage for minutes data
let minutesDataStore: Map<string, MeetingMinutesDto> = new Map()

/**
 * Mock BFF Client Implementation
 */
export class MockBffClient implements BffClient {
  /**
   * Get minutes form definition for an event
   */
  async getMinutesForm(eventId: string): Promise<MinutesFormDto> {
    // Simulate async delay
    await new Promise(resolve => setTimeout(resolve, 100))

    // Find event
    const event = mockMeetingEvents.find(e => e.id === eventId)
    if (!event) {
      throw new MeetingEventNotFoundError(eventId)
    }

    // Find form sections for this meeting type
    const sections = mockMinutesFormSections.filter(
      s => s.meetingTypeId === event.meetingTypeId,
    )

    if (sections.length === 0) {
      throw new MeetingMinutesFormNotFoundError(eventId)
    }

    return {
      eventId,
      sections,
    }
  }

  /**
   * Save minutes data
   */
  async saveMinutes(
    eventId: string,
    data: SaveMinutesDataDto,
  ): Promise<MeetingMinutesDto> {
    // Simulate async delay
    await new Promise(resolve => setTimeout(resolve, 150))

    // Validate event exists
    const event = mockMeetingEvents.find(e => e.id === eventId)
    if (!event) {
      throw new MeetingEventNotFoundError(eventId)
    }

    // Get form to validate field IDs
    const formData = await this.getMinutesForm(eventId)

    // Validate that all provided field IDs exist in form
    const validFieldIds = new Set<string>()
    formData.sections.forEach(section => {
      section.fields.forEach(field => {
        validFieldIds.add(field.id)
      })
    })

    for (const fv of data.fieldValues) {
      if (!validFieldIds.has(fv.formFieldId)) {
        throw new MeetingMinutesSaveError(
          `Invalid field ID: ${fv.formFieldId}`,
        )
      }
    }

    // Build field values with field info
    const fieldValues: MinutesFieldValueDto[] = []
    for (const fv of data.fieldValues) {
      const field = formData.sections
        .flatMap(s => s.fields)
        .find(f => f.id === fv.formFieldId)
      if (field) {
        fieldValues.push({
          formFieldId: fv.formFieldId,
          fieldName: field.fieldName,
          fieldType: field.fieldType,
          value: fv.value,
        })
      }
    }

    // Create minutes record
    const minutesRecord: MeetingMinutesDto = {
      eventId,
      minutesId: `minutes-${Date.now()}`,
      fieldValues,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdByUserName: 'System Admin',
    }

    // Store in memory
    minutesDataStore.set(eventId, minutesRecord)

    return minutesRecord
  }

  /**
   * Get existing minutes data
   */
  async getMinutesData(eventId: string): Promise<MeetingMinutesDto | null> {
    // Simulate async delay
    await new Promise(resolve => setTimeout(resolve, 50))

    const event = mockMeetingEvents.find(e => e.id === eventId)
    if (!event) {
      throw new MeetingEventNotFoundError(eventId)
    }

    return minutesDataStore.get(eventId) || null
  }
}

// Export singleton instance
export const mockBffClient = new MockBffClient()
