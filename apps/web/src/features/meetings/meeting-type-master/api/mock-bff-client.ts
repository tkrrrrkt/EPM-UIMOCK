// MockBffClient Implementation

import type {
  BffClient,
  MeetingTypeDto,
  MeetingTypeListDto,
  CreateMeetingTypeDto,
  UpdateMeetingTypeDto,
  GetMeetingTypesQueryDto,
  DepartmentOptionDto,
} from './bff-client'

const mockMeetingTypes: MeetingTypeDto[] = [
  {
    id: 'mt-1',
    typeCode: 'MONTHLY_MGMT',
    typeName: '月次経営会議',
    typeNameShort: '月次会議',
    scope: 'COMPANY',
    submissionLevels: ['DEPARTMENT', 'BU'],
    cycle: 'MONTHLY',
    submissionRequired: true,
    linkToPlanEvent: true,
    description: '毎月開催する全社経営会議',
    isActive: true,
    sortOrder: 1,
  },
  {
    id: 'mt-2',
    typeCode: 'BOARD_MEETING',
    typeName: '取締役会',
    typeNameShort: '取締役会',
    scope: 'COMPANY',
    submissionLevels: ['BU'],
    cycle: 'QUARTERLY',
    submissionRequired: false,
    linkToPlanEvent: false,
    description: '四半期ごとの取締役会',
    isActive: true,
    sortOrder: 2,
  },
  {
    id: 'mt-3',
    typeCode: 'X_BU_REVIEW',
    typeName: 'X事業部レビュー会議',
    typeNameShort: 'X事業部会議',
    scope: 'LOCAL',
    scopeDepartmentStableId: 'DEPT-X-BU',
    scopeDepartmentName: 'X事業部',
    submissionDepth: 1,
    submissionLevels: ['DEPARTMENT'],
    cycle: 'BIWEEKLY',
    submissionRequired: true,
    linkToPlanEvent: true,
    description: 'X事業部内の隔週レビュー',
    isActive: true,
    sortOrder: 3,
  },
  {
    id: 'mt-4',
    typeCode: 'SALES_REVIEW',
    typeName: '営業本部会議',
    typeNameShort: '営業会議',
    scope: 'LOCAL',
    scopeDepartmentStableId: 'DEPT-SALES-HQ',
    scopeDepartmentName: '営業本部',
    submissionDepth: 2,
    submissionLevels: ['DEPARTMENT'],
    cycle: 'MONTHLY',
    submissionRequired: true,
    linkToPlanEvent: false,
    description: '営業本部配下の月次会議',
    isActive: false,
    sortOrder: 4,
  },
]

const mockDepartments: DepartmentOptionDto[] = [
  { stableId: 'DEPT-X-BU', name: 'X事業部', level: 0 },
  { stableId: 'DEPT-X-SALES', name: '├ 営業部', level: 1 },
  { stableId: 'DEPT-X-DEV', name: '├ 開発部', level: 1 },
  { stableId: 'DEPT-Y-BU', name: 'Y事業部', level: 0 },
  { stableId: 'DEPT-Y-SALES', name: '├ 営業部', level: 1 },
  { stableId: 'DEPT-SALES-HQ', name: '営業本部', level: 0 },
  { stableId: 'DEPT-ADMIN', name: '管理本部', level: 0 },
]

export class MockBffClient implements BffClient {
  private data: MeetingTypeDto[] = [...mockMeetingTypes]

  async getMeetingTypes(query: GetMeetingTypesQueryDto): Promise<MeetingTypeListDto> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    let items = [...this.data]
    if (query.scope) {
      items = items.filter((i) => i.scope === query.scope)
    }
    if (query.isActive !== undefined) {
      items = items.filter((i) => i.isActive === query.isActive)
    }
    if (query.search) {
      const searchLower = query.search.toLowerCase()
      items = items.filter(
        (i) =>
          i.typeName.toLowerCase().includes(searchLower) ||
          i.typeCode.toLowerCase().includes(searchLower)
      )
    }
    return { items, total: items.length }
  }

  async getMeetingTypeById(id: string): Promise<MeetingTypeDto> {
    await new Promise((resolve) => setTimeout(resolve, 200))

    const item = this.data.find((i) => i.id === id)
    if (!item) {
      throw new Error('Not found')
    }
    return { ...item }
  }

  async createMeetingType(data: CreateMeetingTypeDto): Promise<MeetingTypeDto> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Check for duplicate typeCode
    const exists = this.data.some((i) => i.typeCode === data.typeCode)
    if (exists) {
      throw new Error('DUPLICATE_TYPE_CODE')
    }

    const department = mockDepartments.find((d) => d.stableId === data.scopeDepartmentStableId)

    const newItem: MeetingTypeDto = {
      ...data,
      id: crypto.randomUUID(),
      scopeDepartmentName: department?.name.replace(/^[├└]\s*/, ''),
    }
    this.data.push(newItem)
    return { ...newItem }
  }

  async updateMeetingType(id: string, data: UpdateMeetingTypeDto): Promise<MeetingTypeDto> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const index = this.data.findIndex((i) => i.id === id)
    if (index === -1) {
      throw new Error('Not found')
    }

    const department = data.scopeDepartmentStableId
      ? mockDepartments.find((d) => d.stableId === data.scopeDepartmentStableId)
      : undefined

    this.data[index] = {
      ...this.data[index],
      ...data,
      ...(department && { scopeDepartmentName: department.name.replace(/^[├└]\s*/, '') }),
    }
    return { ...this.data[index] }
  }

  async deleteMeetingType(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const index = this.data.findIndex((i) => i.id === id)
    if (index === -1) {
      throw new Error('Not found')
    }

    // Simulate reference check - id '1' has references
    if (id === '1') {
      throw new Error('REFERENCE_EXISTS')
    }

    this.data.splice(index, 1)
  }

  async getDepartmentOptions(): Promise<DepartmentOptionDto[]> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return [...mockDepartments]
  }
}
