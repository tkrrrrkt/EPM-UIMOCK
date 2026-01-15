import type { BffClient } from './BffClient'
import type {
  BffMappingListRequest,
  BffMappingListResponse,
  BffMappingDetailResponse,
  BffCreateMappingRequest,
  BffUpdateMappingRequest,
  BffBulkMappingRequest,
  BffBulkMappingResponse,
  BffGroupSubjectSelectRequest,
  BffGroupSubjectSelectTreeResponse,
  BffMappingListItem,
  BffGroupSubjectSelectTreeNode,
} from '@epm/contracts/bff/group-subject-mapping'

// Mock data storage
const mockMappings: BffMappingListItem[] = [
  {
    id: 'map-001',
    companySubjectId: 'sub-001',
    companySubjectCode: '4010',
    companySubjectName: '売上高',
    companySubjectClass: 'BASE',
    companySubjectType: 'FIN',
    companySubjectIsContra: false,
    groupSubjectId: 'gs-001',
    groupSubjectCode: 'NET_SALES',
    groupSubjectName: '売上高',
    coefficient: 1,
    mappingNote: null,
    isActive: true,
    isMapped: true,
  },
  {
    id: 'map-002',
    companySubjectId: 'sub-002',
    companySubjectCode: '4020',
    companySubjectName: '売上割引',
    companySubjectClass: 'BASE',
    companySubjectType: 'FIN',
    companySubjectIsContra: true,
    groupSubjectId: 'gs-001',
    groupSubjectCode: 'NET_SALES',
    groupSubjectName: '売上高',
    coefficient: -1,
    mappingNote: '控除科目のためマイナス係数',
    isActive: true,
    isMapped: true,
  },
  {
    id: null,
    companySubjectId: 'sub-003',
    companySubjectCode: '5010',
    companySubjectName: '仕入高',
    companySubjectClass: 'BASE',
    companySubjectType: 'FIN',
    companySubjectIsContra: false,
    groupSubjectId: null,
    groupSubjectCode: null,
    groupSubjectName: null,
    coefficient: null,
    mappingNote: null,
    isActive: null,
    isMapped: false,
  },
  {
    id: 'map-003',
    companySubjectId: 'sub-004',
    companySubjectCode: '5020',
    companySubjectName: '外注費',
    companySubjectClass: 'BASE',
    companySubjectType: 'FIN',
    companySubjectIsContra: false,
    groupSubjectId: 'gs-011',
    groupSubjectCode: 'COGS',
    groupSubjectName: '売上原価',
    coefficient: 1,
    mappingNote: null,
    isActive: true,
    isMapped: true,
  },
  {
    id: null,
    companySubjectId: 'sub-010',
    companySubjectCode: 'K001',
    companySubjectName: '従業員数',
    companySubjectClass: 'BASE',
    companySubjectType: 'KPI',
    companySubjectIsContra: false,
    groupSubjectId: null,
    groupSubjectCode: null,
    groupSubjectName: null,
    coefficient: null,
    mappingNote: null,
    isActive: null,
    isMapped: false,
  },
  {
    id: 'map-004',
    companySubjectId: 'sub-011',
    companySubjectCode: 'K002',
    companySubjectName: '売上高',
    companySubjectClass: 'BASE',
    companySubjectType: 'KPI',
    companySubjectIsContra: false,
    groupSubjectId: 'gs-200',
    groupSubjectCode: 'KPI_REVENUE',
    groupSubjectName: '売上高（KPI）',
    coefficient: 1,
    mappingNote: null,
    isActive: true,
    isMapped: true,
  },
]

const mockGroupSubjectTree: BffGroupSubjectSelectTreeResponse = {
  nodes: [
    {
      id: 'gs-010',
      groupSubjectCode: 'GROSS_PROFIT',
      groupSubjectName: '売上総利益',
      subjectClass: 'AGGREGATE',
      subjectType: 'FIN',
      isRecommended: true,
      children: [
        {
          id: 'gs-001',
          groupSubjectCode: 'NET_SALES',
          groupSubjectName: '売上高',
          subjectClass: 'AGGREGATE',
          subjectType: 'FIN',
          isRecommended: true,
          children: [
            {
              id: 'gs-002',
              groupSubjectCode: 'PRODUCT_SALES',
              groupSubjectName: '製品売上高',
              subjectClass: 'BASE',
              subjectType: 'FIN',
              isRecommended: true,
              children: [],
            },
          ],
        },
        {
          id: 'gs-011',
          groupSubjectCode: 'COGS',
          groupSubjectName: '売上原価',
          subjectClass: 'BASE',
          subjectType: 'FIN',
          isRecommended: true,
          children: [],
        },
      ],
    },
    {
      id: 'gs-100',
      groupSubjectCode: 'OPERATING_PROFIT',
      groupSubjectName: '営業利益',
      subjectClass: 'AGGREGATE',
      subjectType: 'FIN',
      isRecommended: true,
      children: [],
    },
  ],
  unassigned: [
    {
      id: 'gs-150',
      groupSubjectCode: 'MISC_INCOME',
      groupSubjectName: '雑収入',
      subjectClass: 'BASE',
      subjectType: 'FIN',
      isRecommended: true,
      children: [],
    },
    {
      id: 'gs-200',
      groupSubjectCode: 'KPI_REVENUE',
      groupSubjectName: '売上高（KPI）',
      subjectClass: 'BASE',
      subjectType: 'KPI',
      isRecommended: false,
      children: [],
    },
  ],
}

export class MockBffClient implements BffClient {
  private delay(ms = 500): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  async getMappingList(params: BffMappingListRequest): Promise<BffMappingListResponse> {
    await this.delay()

    let filtered = [...mockMappings]

    // Apply filters
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.companySubjectCode.toLowerCase().includes(keyword) ||
          item.companySubjectName.toLowerCase().includes(keyword) ||
          item.groupSubjectCode?.toLowerCase().includes(keyword) ||
          item.groupSubjectName?.toLowerCase().includes(keyword)
      )
    }

    if (params.subjectType) {
      filtered = filtered.filter((item) => item.companySubjectType === params.subjectType)
    }

    if (params.subjectClass) {
      filtered = filtered.filter((item) => item.companySubjectClass === params.subjectClass)
    }

    if (params.mappingStatus === 'mapped') {
      filtered = filtered.filter((item) => item.isMapped)
    } else if (params.mappingStatus === 'unmapped') {
      filtered = filtered.filter((item) => !item.isMapped)
    }

    if (params.isActive !== undefined) {
      filtered = filtered.filter((item) => item.isActive === params.isActive)
    }

    // Sorting
    if (params.sortBy) {
      filtered.sort((a, b) => {
        let aVal: string | null = ''
        let bVal: string | null = ''

        switch (params.sortBy) {
          case 'subjectCode':
            aVal = a.companySubjectCode
            bVal = b.companySubjectCode
            break
          case 'subjectName':
            aVal = a.companySubjectName
            bVal = b.companySubjectName
            break
          case 'groupSubjectCode':
            aVal = a.groupSubjectCode
            bVal = b.groupSubjectCode
            break
          case 'groupSubjectName':
            aVal = a.groupSubjectName
            bVal = b.groupSubjectName
            break
        }

        if (aVal === null) return 1
        if (bVal === null) return -1

        const comparison = aVal.localeCompare(bVal)
        return params.sortOrder === 'desc' ? -comparison : comparison
      })
    }

    // Pagination
    const page = params.page || 1
    const pageSize = params.pageSize || 50
    const startIndex = (page - 1) * pageSize
    const paginatedItems = filtered.slice(startIndex, startIndex + pageSize)

    const mappedCount = mockMappings.filter((item) => item.isMapped).length
    const unmappedCount = mockMappings.filter((item) => !item.isMapped).length

    return {
      items: paginatedItems,
      pagination: {
        page,
        pageSize,
        totalCount: filtered.length,
        totalPages: Math.ceil(filtered.length / pageSize),
      },
      statistics: {
        mappedCount,
        unmappedCount,
        totalCount: mockMappings.length,
      },
    }
  }

  async getMappingDetail(id: string): Promise<BffMappingDetailResponse> {
    await this.delay()

    const mapping = mockMappings.find((m) => m.id === id)
    if (!mapping || !mapping.isMapped) {
      throw new Error('MAPPING_NOT_FOUND')
    }

    return {
      id: mapping.id!,
      companySubjectId: mapping.companySubjectId,
      companySubjectCode: mapping.companySubjectCode,
      companySubjectName: mapping.companySubjectName,
      companySubjectClass: mapping.companySubjectClass,
      companySubjectType: mapping.companySubjectType,
      companySubjectIsContra: mapping.companySubjectIsContra,
      groupSubjectId: mapping.groupSubjectId!,
      groupSubjectCode: mapping.groupSubjectCode!,
      groupSubjectName: mapping.groupSubjectName!,
      groupSubjectClass: 'AGGREGATE',
      groupSubjectType: mapping.companySubjectType,
      coefficient: mapping.coefficient!,
      mappingNote: mapping.mappingNote,
      isActive: mapping.isActive!,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-05T10:30:00Z',
    }
  }

  async createMapping(data: BffCreateMappingRequest): Promise<BffMappingDetailResponse> {
    await this.delay()

    const existingMapping = mockMappings.find(
      (m) => m.companySubjectId === data.companySubjectId && m.isMapped
    )
    if (existingMapping) {
      throw new Error('MAPPING_ALREADY_EXISTS')
    }

    const companySubject = mockMappings.find((m) => m.companySubjectId === data.companySubjectId)
    if (!companySubject) {
      throw new Error('COMPANY_SUBJECT_NOT_FOUND')
    }

    const newId = `map-${Date.now()}`
    const coefficient = data.coefficient || (companySubject.companySubjectIsContra ? -1 : 1)

    const updatedMapping: BffMappingListItem = {
      ...companySubject,
      id: newId,
      groupSubjectId: data.groupSubjectId,
      groupSubjectCode: 'NEW_CODE',
      groupSubjectName: '新規マッピング先',
      coefficient,
      mappingNote: data.mappingNote || null,
      isActive: true,
      isMapped: true,
    }

    const index = mockMappings.findIndex((m) => m.companySubjectId === data.companySubjectId)
    mockMappings[index] = updatedMapping

    return {
      id: newId,
      companySubjectId: updatedMapping.companySubjectId,
      companySubjectCode: updatedMapping.companySubjectCode,
      companySubjectName: updatedMapping.companySubjectName,
      companySubjectClass: updatedMapping.companySubjectClass,
      companySubjectType: updatedMapping.companySubjectType,
      companySubjectIsContra: updatedMapping.companySubjectIsContra,
      groupSubjectId: data.groupSubjectId,
      groupSubjectCode: 'NEW_CODE',
      groupSubjectName: '新規マッピング先',
      groupSubjectClass: 'BASE',
      groupSubjectType: updatedMapping.companySubjectType,
      coefficient,
      mappingNote: data.mappingNote || null,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  async updateMapping(
    id: string,
    data: BffUpdateMappingRequest
  ): Promise<BffMappingDetailResponse> {
    await this.delay()

    const index = mockMappings.findIndex((m) => m.id === id)
    if (index === -1) {
      throw new Error('MAPPING_NOT_FOUND')
    }

    const mapping = mockMappings[index]
    if (data.groupSubjectId) mapping.groupSubjectId = data.groupSubjectId
    if (data.coefficient) mapping.coefficient = data.coefficient
    if (data.mappingNote !== undefined) mapping.mappingNote = data.mappingNote
    if (data.isActive !== undefined) mapping.isActive = data.isActive

    return this.getMappingDetail(id)
  }

  async deleteMapping(id: string): Promise<{ success: true }> {
    await this.delay()

    const index = mockMappings.findIndex((m) => m.id === id)
    if (index === -1) {
      throw new Error('MAPPING_NOT_FOUND')
    }

    const mapping = mockMappings[index]
    mockMappings[index] = {
      ...mapping,
      id: null,
      groupSubjectId: null,
      groupSubjectCode: null,
      groupSubjectName: null,
      coefficient: null,
      mappingNote: null,
      isActive: null,
      isMapped: false,
    }

    return { success: true }
  }

  async deactivateMapping(id: string): Promise<BffMappingDetailResponse> {
    await this.delay()

    const index = mockMappings.findIndex((m) => m.id === id)
    if (index === -1) {
      throw new Error('MAPPING_NOT_FOUND')
    }

    if (mockMappings[index].isActive === false) {
      throw new Error('MAPPING_ALREADY_INACTIVE')
    }

    mockMappings[index].isActive = false
    return this.getMappingDetail(id)
  }

  async reactivateMapping(id: string): Promise<BffMappingDetailResponse> {
    await this.delay()

    const index = mockMappings.findIndex((m) => m.id === id)
    if (index === -1) {
      throw new Error('MAPPING_NOT_FOUND')
    }

    if (mockMappings[index].isActive === true) {
      throw new Error('MAPPING_ALREADY_ACTIVE')
    }

    mockMappings[index].isActive = true
    return this.getMappingDetail(id)
  }

  async bulkCreateMapping(data: BffBulkMappingRequest): Promise<BffBulkMappingResponse> {
    await this.delay()

    let successCount = 0
    const skippedSubjectIds: string[] = []

    for (const companySubjectId of data.companySubjectIds) {
      const existing = mockMappings.find(
        (m) => m.companySubjectId === companySubjectId && m.isMapped
      )
      if (existing) {
        skippedSubjectIds.push(companySubjectId)
        continue
      }

      const index = mockMappings.findIndex((m) => m.companySubjectId === companySubjectId)
      if (index !== -1) {
        const mapping = mockMappings[index]
        const coefficient = data.coefficient || (mapping.companySubjectIsContra ? -1 : 1)

        mockMappings[index] = {
          ...mapping,
          id: `map-bulk-${Date.now()}-${successCount}`,
          groupSubjectId: data.groupSubjectId,
          groupSubjectCode: 'BULK_CODE',
          groupSubjectName: '一括マッピング先',
          coefficient,
          isActive: true,
          isMapped: true,
        }
        successCount++
      }
    }

    return {
      successCount,
      skippedCount: skippedSubjectIds.length,
      skippedSubjectIds,
    }
  }

  async getGroupSubjectTree(
    params: BffGroupSubjectSelectRequest
  ): Promise<BffGroupSubjectSelectTreeResponse> {
    await this.delay()

    const filterTree = (
      nodes: BffGroupSubjectSelectTreeNode[]
    ): BffGroupSubjectSelectTreeNode[] => {
      return nodes
        .filter((node) => {
          const matchesKeyword =
            !params.keyword ||
            node.groupSubjectCode.toLowerCase().includes(params.keyword.toLowerCase()) ||
            node.groupSubjectName.toLowerCase().includes(params.keyword.toLowerCase())

          const matchesType = !params.subjectType || node.subjectType === params.subjectType

          return matchesKeyword && matchesType
        })
        .map((node) => ({
          ...node,
          isRecommended: params.subjectType
            ? node.subjectType === params.subjectType
            : node.isRecommended,
          children: filterTree(node.children),
        }))
    }

    return {
      nodes: filterTree(mockGroupSubjectTree.nodes),
      unassigned: filterTree(mockGroupSubjectTree.unassigned),
    }
  }
}
