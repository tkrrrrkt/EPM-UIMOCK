// BffClient Interface Definition

// Enums
export type MeetingTypeScope = 'COMPANY' | 'LOCAL'
export type MeetingCycle = 'MONTHLY' | 'BIWEEKLY' | 'QUARTERLY' | 'YEARLY' | 'AD_HOC'
export type SubmissionLevel = 'DEPARTMENT' | 'BU'

// 会議種別DTO
export interface MeetingTypeDto {
  id: string
  typeCode: string
  typeName: string
  typeNameShort?: string
  scope: MeetingTypeScope
  scopeDepartmentStableId?: string
  scopeDepartmentName?: string
  submissionDepth?: number
  submissionLevels: SubmissionLevel[]
  cycle: MeetingCycle
  submissionRequired: boolean
  linkToPlanEvent: boolean
  description?: string
  isActive: boolean
  sortOrder: number
}

// 一覧レスポンス
export interface MeetingTypeListDto {
  items: MeetingTypeDto[]
  total: number
}

// 作成リクエスト
export interface CreateMeetingTypeDto {
  typeCode: string
  typeName: string
  typeNameShort?: string
  scope: MeetingTypeScope
  scopeDepartmentStableId?: string
  submissionDepth?: number
  submissionLevels: SubmissionLevel[]
  cycle: MeetingCycle
  submissionRequired: boolean
  linkToPlanEvent: boolean
  description?: string
  isActive: boolean
  sortOrder: number
}

// 更新リクエスト
export interface UpdateMeetingTypeDto {
  typeName?: string
  typeNameShort?: string
  scope?: MeetingTypeScope
  scopeDepartmentStableId?: string
  submissionDepth?: number
  submissionLevels?: SubmissionLevel[]
  cycle?: MeetingCycle
  submissionRequired?: boolean
  linkToPlanEvent?: boolean
  description?: string
  isActive?: boolean
  sortOrder?: number
}

// クエリ
export interface GetMeetingTypesQueryDto {
  scope?: MeetingTypeScope
  isActive?: boolean
  search?: string
}

// 部門選択肢（選択用）
export interface DepartmentOptionDto {
  stableId: string
  name: string
  level: number
}

// BffClient Interface
export interface BffClient {
  // 会議種別一覧取得
  getMeetingTypes(query: GetMeetingTypesQueryDto): Promise<MeetingTypeListDto>

  // 会議種別詳細取得
  getMeetingTypeById(id: string): Promise<MeetingTypeDto>

  // 会議種別作成
  createMeetingType(data: CreateMeetingTypeDto): Promise<MeetingTypeDto>

  // 会議種別更新
  updateMeetingType(id: string, data: UpdateMeetingTypeDto): Promise<MeetingTypeDto>

  // 会議種別削除
  deleteMeetingType(id: string): Promise<void>

  // 部門選択肢取得
  getDepartmentOptions(): Promise<DepartmentOptionDto[]>
}
