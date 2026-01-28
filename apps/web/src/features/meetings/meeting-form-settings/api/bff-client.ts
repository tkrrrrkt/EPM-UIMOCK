// ============================================
// Meeting Form Settings BFF Client Interface
// ============================================

// Enums
export type FormFieldType =
  | 'TEXT'
  | 'TEXTAREA'
  | 'NUMBER'
  | 'SELECT'
  | 'MULTI_SELECT'
  | 'DATE'
  | 'FILE'
  | 'FORECAST_QUOTE'

export type InputScope = 'DEPARTMENT' | 'BU' | 'COMPANY'

// ============================================
// DTOs
// ============================================

export interface FieldOptionDto {
  value: string
  label: string
}

export interface FieldValidationDto {
  min?: number
  max?: number
  allowedTypes?: string[]
  maxSize?: number
  pattern?: string
}

export interface FormSectionDto {
  id: string
  meetingTypeId: string
  sectionCode: string
  sectionName: string
  inputScope: InputScope
  isRequired: boolean
  sortOrder: number
  description?: string | null
  isActive: boolean
  fieldCount: number
}

export interface FormSectionListDto {
  items: FormSectionDto[]
  total: number
}

export interface CreateFormSectionDto {
  meetingTypeId: string
  sectionCode: string
  sectionName: string
  inputScope: InputScope
  isRequired: boolean
  description?: string
}

export interface UpdateFormSectionDto {
  sectionCode?: string
  sectionName?: string
  inputScope?: InputScope
  isRequired?: boolean
  description?: string
  isActive?: boolean
}

export interface ReorderSectionsDto {
  meetingTypeId: string
  orderedIds: string[]
}

export interface FormFieldDto {
  id: string
  sectionId: string
  fieldCode: string
  fieldName: string
  fieldType: FormFieldType
  isRequired: boolean
  placeholder?: string | null
  options?: FieldOptionDto[] | null
  validation?: FieldValidationDto | null
  defaultValue?: string | null
  maxLength?: number | null
  helpText?: string | null
  sortOrder: number
  isActive: boolean
}

export interface FormFieldListDto {
  items: FormFieldDto[]
  total: number
}

export interface CreateFormFieldDto {
  sectionId: string
  fieldCode: string
  fieldName: string
  fieldType: FormFieldType
  isRequired: boolean
  placeholder?: string
  options?: FieldOptionDto[]
  validation?: FieldValidationDto
  defaultValue?: string
  maxLength?: number
  helpText?: string
}

export interface UpdateFormFieldDto {
  fieldCode?: string
  fieldName?: string
  fieldType?: FormFieldType
  isRequired?: boolean
  placeholder?: string
  options?: FieldOptionDto[]
  validation?: FieldValidationDto
  defaultValue?: string
  maxLength?: number
  helpText?: string
  isActive?: boolean
}

export interface ReorderFieldsDto {
  sectionId: string
  orderedIds: string[]
}

// ============================================
// BffClient Interface
// ============================================

export interface BffClient {
  // セクション
  getFormSections(meetingTypeId: string): Promise<FormSectionListDto>
  createFormSection(data: CreateFormSectionDto): Promise<FormSectionDto>
  updateFormSection(id: string, data: UpdateFormSectionDto): Promise<FormSectionDto>
  deleteFormSection(id: string): Promise<void>
  reorderSections(data: ReorderSectionsDto): Promise<FormSectionListDto>

  // 項目
  getFormFields(sectionId: string): Promise<FormFieldListDto>
  createFormField(data: CreateFormFieldDto): Promise<FormFieldDto>
  updateFormField(id: string, data: UpdateFormFieldDto): Promise<FormFieldDto>
  deleteFormField(id: string): Promise<void>
  reorderFields(data: ReorderFieldsDto): Promise<FormFieldListDto>

  // 会議種別情報
  getMeetingTypeName(meetingTypeId: string): Promise<string>
}
