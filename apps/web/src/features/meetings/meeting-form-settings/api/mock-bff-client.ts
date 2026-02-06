import type {
  BffClient,
  FormSectionDto,
  FormSectionListDto,
  CreateFormSectionDto,
  UpdateFormSectionDto,
  ReorderSectionsDto,
  FormFieldDto,
  FormFieldListDto,
  CreateFormFieldDto,
  UpdateFormFieldDto,
  ReorderFieldsDto,
} from './bff-client'

// ============================================
// Mock Data
// ============================================

const mockSections: FormSectionDto[] = [
  // mt-1: 月次経営会議
  {
    id: 'sec-1',
    meetingTypeId: 'mt-1',
    sectionCode: 'SALES_SUMMARY',
    sectionName: '業績サマリー',
    inputScope: 'DEPARTMENT',
    isRequired: true,
    sortOrder: 10,
    description: '売上・利益の見通しとサマリー',
    isActive: true,
    fieldCount: 3,
  },
  {
    id: 'sec-2',
    meetingTypeId: 'mt-1',
    sectionCode: 'VARIANCE',
    sectionName: '差異要因',
    inputScope: 'DEPARTMENT',
    isRequired: true,
    sortOrder: 20,
    description: '予算と実績の差異要因を記載',
    isActive: true,
    fieldCount: 3,
  },
  {
    id: 'sec-3',
    meetingTypeId: 'mt-1',
    sectionCode: 'RISK',
    sectionName: 'リスク・課題',
    inputScope: 'DEPARTMENT',
    isRequired: false,
    sortOrder: 30,
    description: null,
    isActive: true,
    fieldCount: 2,
  },
  {
    id: 'sec-4',
    meetingTypeId: 'mt-1',
    sectionCode: 'ACTION',
    sectionName: 'アクション',
    inputScope: 'DEPARTMENT',
    isRequired: true,
    sortOrder: 40,
    description: null,
    isActive: true,
    fieldCount: 2,
  },
  {
    id: 'sec-5',
    meetingTypeId: 'mt-1',
    sectionCode: 'ATTACHMENT',
    sectionName: '添付資料',
    inputScope: 'DEPARTMENT',
    isRequired: false,
    sortOrder: 50,
    description: null,
    isActive: false,
    fieldCount: 1,
  },
  // mt-2: 四半期経営会議
  {
    id: 'sec-6',
    meetingTypeId: 'mt-2',
    sectionCode: 'SUMMARY',
    sectionName: 'サマリー',
    inputScope: 'DEPARTMENT',
    isRequired: true,
    sortOrder: 10,
    description: '四半期のサマリーと戦略分析',
    isActive: true,
    fieldCount: 2,
  },
  {
    id: 'sec-7',
    meetingTypeId: 'mt-2',
    sectionCode: 'VARIANCE_ANALYSIS',
    sectionName: '差異分析',
    inputScope: 'DEPARTMENT',
    isRequired: true,
    sortOrder: 20,
    description: '四半期の予算差異詳細',
    isActive: true,
    fieldCount: 1,
  },
  {
    id: 'sec-8',
    meetingTypeId: 'mt-2',
    sectionCode: 'STRATEGIC_ISSUES',
    sectionName: '戦略課題',
    inputScope: 'DEPARTMENT',
    isRequired: false,
    sortOrder: 30,
    description: null,
    isActive: true,
    fieldCount: 1,
  },
  {
    id: 'sec-9',
    meetingTypeId: 'mt-2',
    sectionCode: 'STRATEGIC_ACTION',
    sectionName: 'アクション',
    inputScope: 'DEPARTMENT',
    isRequired: true,
    sortOrder: 40,
    description: null,
    isActive: true,
    fieldCount: 1,
  },
  // mt-3: 取締役会
  {
    id: 'sec-10',
    meetingTypeId: 'mt-3',
    sectionCode: 'BOARD_SUMMARY',
    sectionName: 'サマリー',
    inputScope: 'DEPARTMENT',
    isRequired: true,
    sortOrder: 10,
    description: 'エグゼクティブサマリー',
    isActive: true,
    fieldCount: 1,
  },
  {
    id: 'sec-11',
    meetingTypeId: 'mt-3',
    sectionCode: 'DECISIONS',
    sectionName: '決定事項',
    inputScope: 'DEPARTMENT',
    isRequired: true,
    sortOrder: 20,
    description: '取締役会での主要決定',
    isActive: true,
    fieldCount: 1,
  },
  {
    id: 'sec-12',
    meetingTypeId: 'mt-3',
    sectionCode: 'GOVERNANCE_RISKS',
    sectionName: 'リスク',
    inputScope: 'DEPARTMENT',
    isRequired: false,
    sortOrder: 30,
    description: null,
    isActive: true,
    fieldCount: 1,
  },
]

const mockFieldsForSec1: FormFieldDto[] = [
  {
    id: 'fld-1-1',
    sectionId: 'sec-1',
    fieldCode: 'SALES_OUTLOOK',
    fieldName: '売上見通し',
    fieldType: 'SELECT',
    isRequired: true,
    placeholder: null,
    options: [
      { value: 'GOOD', label: '好調' },
      { value: 'ON_TRACK', label: '計画通り' },
      { value: 'CONCERN', label: '懸念' },
      { value: 'ACTION_NEEDED', label: '要対策' },
    ],
    validation: null,
    defaultValue: null,
    maxLength: null,
    helpText: '当月の売上見通しを選択してください',
    sortOrder: 10,
    isActive: true,
  },
  {
    id: 'fld-1-2',
    sectionId: 'sec-1',
    fieldCode: 'PROFIT_OUTLOOK',
    fieldName: '利益見通し',
    fieldType: 'SELECT',
    isRequired: true,
    placeholder: null,
    options: [
      { value: 'GOOD', label: '好調' },
      { value: 'ON_TRACK', label: '計画通り' },
      { value: 'CONCERN', label: '懸念' },
      { value: 'ACTION_NEEDED', label: '要対策' },
    ],
    validation: null,
    defaultValue: null,
    maxLength: null,
    helpText: null,
    sortOrder: 20,
    isActive: true,
  },
  {
    id: 'fld-1-3',
    sectionId: 'sec-1',
    fieldCode: 'SUMMARY_COMMENT',
    fieldName: 'サマリーコメント',
    fieldType: 'TEXTAREA',
    isRequired: true,
    placeholder: '当月の業績サマリーを入力してください',
    options: null,
    validation: null,
    defaultValue: null,
    maxLength: 2000,
    helpText: '当月の業績の概要を簡潔にまとめてください',
    sortOrder: 30,
    isActive: true,
  },
]

const mockFieldsForSec2: FormFieldDto[] = [
  {
    id: 'fld-2-1',
    sectionId: 'sec-2',
    fieldCode: 'SALES_VARIANCE',
    fieldName: '売上差異の主要因',
    fieldType: 'TEXTAREA',
    isRequired: true,
    placeholder: '売上差異の要因を入力',
    options: null,
    validation: null,
    defaultValue: null,
    maxLength: 2000,
    helpText: null,
    sortOrder: 10,
    isActive: true,
  },
  {
    id: 'fld-2-2',
    sectionId: 'sec-2',
    fieldCode: 'GROSS_PROFIT_VARIANCE',
    fieldName: '粗利差異の主要因',
    fieldType: 'TEXTAREA',
    isRequired: true,
    placeholder: '粗利差異の要因を入力',
    options: null,
    validation: null,
    defaultValue: null,
    maxLength: 2000,
    helpText: null,
    sortOrder: 20,
    isActive: true,
  },
  {
    id: 'fld-2-3',
    sectionId: 'sec-2',
    fieldCode: 'SGA_VARIANCE',
    fieldName: '販管費差異の主要因',
    fieldType: 'TEXTAREA',
    isRequired: false,
    placeholder: '販管費差異の要因を入力（任意）',
    options: null,
    validation: null,
    defaultValue: null,
    maxLength: 2000,
    helpText: null,
    sortOrder: 30,
    isActive: true,
  },
]

const mockFieldsForSec3: FormFieldDto[] = [
  {
    id: 'fld-3-1',
    sectionId: 'sec-3',
    fieldCode: 'RISK_ITEMS',
    fieldName: 'リスク項目',
    fieldType: 'TEXTAREA',
    isRequired: false,
    placeholder: 'リスク項目を入力',
    options: null,
    validation: null,
    defaultValue: null,
    maxLength: 2000,
    helpText: null,
    sortOrder: 10,
    isActive: true,
  },
  {
    id: 'fld-3-2',
    sectionId: 'sec-3',
    fieldCode: 'ISSUES',
    fieldName: '課題',
    fieldType: 'TEXTAREA',
    isRequired: false,
    placeholder: '課題を入力',
    options: null,
    validation: null,
    defaultValue: null,
    maxLength: 2000,
    helpText: null,
    sortOrder: 20,
    isActive: true,
  },
]

const mockFieldsForSec4: FormFieldDto[] = [
  {
    id: 'fld-4-1',
    sectionId: 'sec-4',
    fieldCode: 'ACTION_ITEMS',
    fieldName: 'アクション項目',
    fieldType: 'TEXTAREA',
    isRequired: true,
    placeholder: 'アクション項目を入力',
    options: null,
    validation: null,
    defaultValue: null,
    maxLength: 2000,
    helpText: null,
    sortOrder: 10,
    isActive: true,
  },
  {
    id: 'fld-4-2',
    sectionId: 'sec-4',
    fieldCode: 'DUE_DATE',
    fieldName: '期限',
    fieldType: 'DATE',
    isRequired: true,
    placeholder: null,
    options: null,
    validation: null,
    defaultValue: null,
    maxLength: null,
    helpText: null,
    sortOrder: 20,
    isActive: true,
  },
]

const mockFieldsForSec5: FormFieldDto[] = [
  {
    id: 'fld-5-1',
    sectionId: 'sec-5',
    fieldCode: 'ATTACHMENTS',
    fieldName: '添付ファイル',
    fieldType: 'FILE',
    isRequired: false,
    placeholder: null,
    options: null,
    validation: {
      allowedTypes: ['pdf', 'xlsx', 'pptx'],
      maxSize: 10485760,
    },
    defaultValue: null,
    maxLength: null,
    helpText: 'PDF、Excel、PowerPointファイルを添付できます',
    sortOrder: 10,
    isActive: true,
  },
]

// mt-2: 四半期経営会議 - Section 6 (SUMMARY)
const mockFieldsForSec6: FormFieldDto[] = [
  {
    id: 'fld-6-1',
    sectionId: 'sec-6',
    fieldCode: 'QUARTERLY_SUMMARY',
    fieldName: '四半期サマリー',
    fieldType: 'TEXTAREA',
    isRequired: true,
    placeholder: '四半期の業績概要を入力してください',
    options: null,
    validation: null,
    defaultValue: null,
    maxLength: 3000,
    helpText: '当四半期の主要な業績と達成状況をまとめてください',
    sortOrder: 10,
    isActive: true,
  },
  {
    id: 'fld-6-2',
    sectionId: 'sec-6',
    fieldCode: 'STRATEGIC_ANALYSIS',
    fieldName: '戦略分析',
    fieldType: 'TEXTAREA',
    isRequired: true,
    placeholder: '戦略的な分析内容を入力してください',
    options: null,
    validation: null,
    defaultValue: null,
    maxLength: 3000,
    helpText: '市場環境や競争状況との関連付けで分析してください',
    sortOrder: 20,
    isActive: true,
  },
]

// mt-2: 四半期経営会議 - Section 7 (VARIANCE_ANALYSIS)
const mockFieldsForSec7: FormFieldDto[] = [
  {
    id: 'fld-7-1',
    sectionId: 'sec-7',
    fieldCode: 'BUDGET_VARIANCE_DETAIL',
    fieldName: '予算差異詳細',
    fieldType: 'TEXTAREA',
    isRequired: true,
    placeholder: '四半期の予算差異を詳しく説明してください',
    options: null,
    validation: null,
    defaultValue: null,
    maxLength: 3000,
    helpText: '月次の差異分析結果をまとめ、主要要因を記載してください',
    sortOrder: 10,
    isActive: true,
  },
]

// mt-2: 四半期経営会議 - Section 8 (STRATEGIC_ISSUES)
const mockFieldsForSec8: FormFieldDto[] = [
  {
    id: 'fld-8-1',
    sectionId: 'sec-8',
    fieldCode: 'STRATEGIC_RISKS',
    fieldName: '戦略的リスク',
    fieldType: 'TEXTAREA',
    isRequired: false,
    placeholder: '四半期の戦略的なリスク要因を入力してください',
    options: null,
    validation: null,
    defaultValue: null,
    maxLength: 2000,
    helpText: '次四半期以降に影響を与える可能性のあるリスクを記載',
    sortOrder: 10,
    isActive: true,
  },
]

// mt-2: 四半期経営会議 - Section 9 (STRATEGIC_ACTION)
const mockFieldsForSec9: FormFieldDto[] = [
  {
    id: 'fld-9-1',
    sectionId: 'sec-9',
    fieldCode: 'STRATEGIC_ACTIONS',
    fieldName: '戦略アクション',
    fieldType: 'TEXTAREA',
    isRequired: true,
    placeholder: 'アクション項目を記載してください',
    options: null,
    validation: null,
    defaultValue: null,
    maxLength: 2000,
    helpText: '次四半期に向けた対策内容を記載してください',
    sortOrder: 10,
    isActive: true,
  },
]

// mt-3: 取締役会 - Section 10 (BOARD_SUMMARY)
const mockFieldsForSec10: FormFieldDto[] = [
  {
    id: 'fld-10-1',
    sectionId: 'sec-10',
    fieldCode: 'BOARD_SUMMARY',
    fieldName: 'エグゼクティブサマリー',
    fieldType: 'TEXTAREA',
    isRequired: true,
    placeholder: 'C-levelビューの業績サマリーを入力してください',
    options: null,
    validation: null,
    defaultValue: null,
    maxLength: 2000,
    helpText: '取締役向けの簡潔でインパクトのあるサマリーを作成してください',
    sortOrder: 10,
    isActive: true,
  },
]

// mt-3: 取締役会 - Section 11 (DECISIONS)
const mockFieldsForSec11: FormFieldDto[] = [
  {
    id: 'fld-11-1',
    sectionId: 'sec-11',
    fieldCode: 'KEY_DECISIONS',
    fieldName: '主要決定事項',
    fieldType: 'TEXTAREA',
    isRequired: true,
    placeholder: '取締役会での主要な決定事項を入力してください',
    options: null,
    validation: null,
    defaultValue: null,
    maxLength: 2000,
    helpText: 'ガバナンス、資本配分、戦略についての決定を記載',
    sortOrder: 10,
    isActive: true,
  },
]

// mt-3: 取締役会 - Section 12 (GOVERNANCE_RISKS)
const mockFieldsForSec12: FormFieldDto[] = [
  {
    id: 'fld-12-1',
    sectionId: 'sec-12',
    fieldCode: 'BOARD_RISKS',
    fieldName: 'ガバナンスリスク',
    fieldType: 'TEXTAREA',
    isRequired: false,
    placeholder: 'ガバナンスに関連するリスク要因を入力してください',
    options: null,
    validation: null,
    defaultValue: null,
    maxLength: 2000,
    helpText: 'コンプライアンス、内部統制等の観点からのリスク',
    sortOrder: 10,
    isActive: true,
  },
]

// ============================================
// MockBffClient Implementation
// ============================================

export class MockBffClient implements BffClient {
  private sections: FormSectionDto[] = [...mockSections]
  private fieldsMap: Map<string, FormFieldDto[]> = new Map([
    ['sec-1', [...mockFieldsForSec1]],
    ['sec-2', [...mockFieldsForSec2]],
    ['sec-3', [...mockFieldsForSec3]],
    ['sec-4', [...mockFieldsForSec4]],
    ['sec-5', [...mockFieldsForSec5]],
    ['sec-6', [...mockFieldsForSec6]],
    ['sec-7', [...mockFieldsForSec7]],
    ['sec-8', [...mockFieldsForSec8]],
    ['sec-9', [...mockFieldsForSec9]],
    ['sec-10', [...mockFieldsForSec10]],
    ['sec-11', [...mockFieldsForSec11]],
    ['sec-12', [...mockFieldsForSec12]],
  ])

  private delay(ms: number = 300): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  async getFormSections(meetingTypeId: string): Promise<FormSectionListDto> {
    await this.delay()
    const items = this.sections
      .filter((s) => s.meetingTypeId === meetingTypeId)
      .sort((a, b) => a.sortOrder - b.sortOrder)
    return { items, total: items.length }
  }

  async createFormSection(data: CreateFormSectionDto): Promise<FormSectionDto> {
    await this.delay()
    const maxSortOrder = Math.max(...this.sections.map((s) => s.sortOrder), 0)
    const newSection: FormSectionDto = {
      id: `sec-${Date.now()}`,
      meetingTypeId: data.meetingTypeId,
      sectionCode: data.sectionCode,
      sectionName: data.sectionName,
      inputScope: data.inputScope,
      isRequired: data.isRequired,
      sortOrder: maxSortOrder + 10,
      description: data.description ?? null,
      isActive: true,
      fieldCount: 0,
    }
    this.sections.push(newSection)
    this.fieldsMap.set(newSection.id, [])
    return newSection
  }

  async updateFormSection(id: string, data: UpdateFormSectionDto): Promise<FormSectionDto> {
    await this.delay()
    const index = this.sections.findIndex((s) => s.id === id)
    if (index === -1) throw new Error('Section not found')

    this.sections[index] = {
      ...this.sections[index],
      ...data,
    }
    return this.sections[index]
  }

  async deleteFormSection(id: string): Promise<void> {
    await this.delay()
    const index = this.sections.findIndex((s) => s.id === id)
    if (index === -1) throw new Error('Section not found')
    this.sections.splice(index, 1)
    this.fieldsMap.delete(id)
  }

  async reorderSections(data: ReorderSectionsDto): Promise<FormSectionListDto> {
    await this.delay()
    data.orderedIds.forEach((id, index) => {
      const section = this.sections.find((s) => s.id === id)
      if (section) {
        section.sortOrder = (index + 1) * 10
      }
    })
    return this.getFormSections(data.meetingTypeId)
  }

  async getFormFields(sectionId: string): Promise<FormFieldListDto> {
    await this.delay(200)
    const items = (this.fieldsMap.get(sectionId) ?? []).sort((a, b) => a.sortOrder - b.sortOrder)
    return { items, total: items.length }
  }

  async createFormField(data: CreateFormFieldDto): Promise<FormFieldDto> {
    await this.delay()
    const fields = this.fieldsMap.get(data.sectionId) ?? []
    const maxSortOrder = Math.max(...fields.map((f) => f.sortOrder), 0)
    const newField: FormFieldDto = {
      id: `fld-${Date.now()}`,
      sectionId: data.sectionId,
      fieldCode: data.fieldCode,
      fieldName: data.fieldName,
      fieldType: data.fieldType,
      isRequired: data.isRequired,
      placeholder: data.placeholder ?? null,
      options: data.options ?? null,
      validation: data.validation ?? null,
      defaultValue: data.defaultValue ?? null,
      maxLength: data.maxLength ?? null,
      helpText: data.helpText ?? null,
      sortOrder: maxSortOrder + 10,
      isActive: true,
    }
    fields.push(newField)
    this.fieldsMap.set(data.sectionId, fields)

    // Update section field count
    const section = this.sections.find((s) => s.id === data.sectionId)
    if (section) {
      section.fieldCount = fields.length
    }

    return newField
  }

  async updateFormField(id: string, data: UpdateFormFieldDto): Promise<FormFieldDto> {
    await this.delay()
    for (const [, fields] of this.fieldsMap) {
      const index = fields.findIndex((f) => f.id === id)
      if (index !== -1) {
        fields[index] = {
          ...fields[index],
          ...data,
        }
        return fields[index]
      }
    }
    throw new Error('Field not found')
  }

  async deleteFormField(id: string): Promise<void> {
    await this.delay()
    for (const [sectionId, fields] of this.fieldsMap) {
      const index = fields.findIndex((f) => f.id === id)
      if (index !== -1) {
        fields.splice(index, 1)
        this.fieldsMap.set(sectionId, fields)

        // Update section field count
        const section = this.sections.find((s) => s.id === sectionId)
        if (section) {
          section.fieldCount = fields.length
        }
        return
      }
    }
    throw new Error('Field not found')
  }

  async reorderFields(data: ReorderFieldsDto): Promise<FormFieldListDto> {
    await this.delay()
    const fields = this.fieldsMap.get(data.sectionId) ?? []
    data.orderedIds.forEach((id, index) => {
      const field = fields.find((f) => f.id === id)
      if (field) {
        field.sortOrder = (index + 1) * 10
      }
    })
    return this.getFormFields(data.sectionId)
  }

  async getMeetingTypeName(meetingTypeId: string): Promise<string> {
    await this.delay(100)
    const meetingTypes: Record<string, string> = {
      'mt-1': '月次経営会議',
      'mt-2': '週次営業会議',
      'mt-3': '四半期レビュー',
    }
    return meetingTypes[meetingTypeId] ?? '会議'
  }
}

// Singleton instance
export const mockBffClient = new MockBffClient()
