import type { BffClient } from './BffClient'
import type {
  BffListDimensionsRequest,
  BffListDimensionsResponse,
  BffDimensionDetailResponse,
  BffCreateDimensionRequest,
  BffUpdateDimensionRequest,
  BffListDimensionValuesRequest,
  BffListDimensionValuesResponse,
  BffDimensionValueDetailResponse,
  BffCreateDimensionValueRequest,
  BffUpdateDimensionValueRequest,
} from '@epm/contracts/bff/dimension-master'

// Mock data storage
const mockDimensions: BffDimensionDetailResponse[] = [
  {
    id: 'dim-001',
    dimensionCode: 'SEG_IR',
    dimensionName: 'IRセグメント',
    dimensionType: 'IR_SEGMENT',
    isHierarchical: true,
    isRequired: true,
    scopePolicy: 'tenant',
    sortOrder: 10,
    isActive: true,
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
  },
  {
    id: 'dim-002',
    dimensionCode: 'CAT_PROD',
    dimensionName: '製品カテゴリ',
    dimensionType: 'PRODUCT_CATEGORY',
    isHierarchical: true,
    isRequired: false,
    scopePolicy: 'company',
    sortOrder: 20,
    isActive: true,
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z',
  },
  {
    id: 'dim-003',
    dimensionCode: 'GRP_CUST',
    dimensionName: '得意先グループ',
    dimensionType: 'CUSTOMER_GROUP',
    isHierarchical: false,
    isRequired: false,
    scopePolicy: 'tenant',
    sortOrder: 30,
    isActive: true,
    createdAt: '2024-01-17T11:00:00Z',
    updatedAt: '2024-01-17T11:00:00Z',
  },
  {
    id: 'dim-004',
    dimensionCode: 'DIM_REGION',
    dimensionName: '地域',
    dimensionType: 'REGION',
    isHierarchical: true,
    isRequired: false,
    scopePolicy: 'tenant',
    sortOrder: 40,
    isActive: true,
    createdAt: '2024-01-18T12:00:00Z',
    updatedAt: '2024-01-18T12:00:00Z',
  },
  {
    id: 'dim-005',
    dimensionCode: 'DIM_CHANNEL',
    dimensionName: '販売チャネル',
    dimensionType: 'CHANNEL',
    isHierarchical: false,
    isRequired: false,
    scopePolicy: 'tenant',
    sortOrder: 50,
    isActive: false,
    createdAt: '2024-01-19T13:00:00Z',
    updatedAt: '2024-01-20T14:00:00Z',
  },
]

const mockDimensionValues: Record<string, BffDimensionValueDetailResponse[]> = {
  'dim-001': [
    {
      id: 'val-001',
      dimensionId: 'dim-001',
      valueCode: 'DOM',
      valueName: '国内事業',
      valueNameShort: '国内',
      scopeType: 'tenant',
      scopeCompanyId: null,
      parentId: null,
      hierarchyLevel: 0,
      hierarchyPath: '/DOM',
      sortOrder: 10,
      isActive: true,
      createdAt: '2024-01-15T09:30:00Z',
      updatedAt: '2024-01-15T09:30:00Z',
    },
    {
      id: 'val-002',
      dimensionId: 'dim-001',
      valueCode: 'DOM_EAST',
      valueName: '国内事業（東日本）',
      valueNameShort: '東日本',
      scopeType: 'tenant',
      scopeCompanyId: null,
      parentId: 'val-001',
      hierarchyLevel: 1,
      hierarchyPath: '/DOM/DOM_EAST',
      sortOrder: 11,
      isActive: true,
      createdAt: '2024-01-15T09:31:00Z',
      updatedAt: '2024-01-15T09:31:00Z',
    },
    {
      id: 'val-003',
      dimensionId: 'dim-001',
      valueCode: 'DOM_WEST',
      valueName: '国内事業（西日本）',
      valueNameShort: '西日本',
      scopeType: 'tenant',
      scopeCompanyId: null,
      parentId: 'val-001',
      hierarchyLevel: 1,
      hierarchyPath: '/DOM/DOM_WEST',
      sortOrder: 12,
      isActive: true,
      createdAt: '2024-01-15T09:32:00Z',
      updatedAt: '2024-01-15T09:32:00Z',
    },
    {
      id: 'val-004',
      dimensionId: 'dim-001',
      valueCode: 'OVERSEA',
      valueName: '海外事業',
      valueNameShort: '海外',
      scopeType: 'tenant',
      scopeCompanyId: null,
      parentId: null,
      hierarchyLevel: 0,
      hierarchyPath: '/OVERSEA',
      sortOrder: 20,
      isActive: true,
      createdAt: '2024-01-15T09:33:00Z',
      updatedAt: '2024-01-15T09:33:00Z',
    },
  ],
  'dim-002': [
    {
      id: 'val-101',
      dimensionId: 'dim-002',
      valueCode: 'PROD_A',
      valueName: '製品A群',
      valueNameShort: 'A群',
      scopeType: 'company',
      scopeCompanyId: 'comp-001',
      parentId: null,
      hierarchyLevel: 0,
      hierarchyPath: '/PROD_A',
      sortOrder: 10,
      isActive: true,
      createdAt: '2024-01-16T10:30:00Z',
      updatedAt: '2024-01-16T10:30:00Z',
    },
    {
      id: 'val-102',
      dimensionId: 'dim-002',
      valueCode: 'PROD_B',
      valueName: '製品B群',
      valueNameShort: 'B群',
      scopeType: 'company',
      scopeCompanyId: 'comp-001',
      parentId: null,
      hierarchyLevel: 0,
      hierarchyPath: '/PROD_B',
      sortOrder: 20,
      isActive: true,
      createdAt: '2024-01-16T10:31:00Z',
      updatedAt: '2024-01-16T10:31:00Z',
    },
  ],
  'dim-004': [
    {
      id: 'val-201',
      dimensionId: 'dim-004',
      valueCode: 'KANTO',
      valueName: '関東エリア',
      valueNameShort: '関東',
      scopeType: 'tenant',
      scopeCompanyId: null,
      parentId: null,
      hierarchyLevel: 0,
      hierarchyPath: '/KANTO',
      sortOrder: 10,
      isActive: true,
      createdAt: '2024-01-18T12:30:00Z',
      updatedAt: '2024-01-18T12:30:00Z',
    },
    {
      id: 'val-202',
      dimensionId: 'dim-004',
      valueCode: 'KANSAI',
      valueName: '関西エリア',
      valueNameShort: '関西',
      scopeType: 'tenant',
      scopeCompanyId: null,
      parentId: null,
      hierarchyLevel: 0,
      hierarchyPath: '/KANSAI',
      sortOrder: 20,
      isActive: true,
      createdAt: '2024-01-18T12:31:00Z',
      updatedAt: '2024-01-18T12:31:00Z',
    },
  ],
}

export class MockBffClient implements BffClient {
  // Dimension methods
  async listDimensions(req: BffListDimensionsRequest): Promise<BffListDimensionsResponse> {
    await this.delay(300)

    let filtered = [...mockDimensions]

    // Apply filters
    if (req.keyword) {
      const keyword = req.keyword.toLowerCase()
      filtered = filtered.filter(
        (d) => d.dimensionCode.toLowerCase().includes(keyword) || d.dimensionName.toLowerCase().includes(keyword),
      )
    }
    if (req.dimensionType) {
      filtered = filtered.filter((d) => d.dimensionType === req.dimensionType)
    }
    if (req.isActive !== undefined) {
      filtered = filtered.filter((d) => d.isActive === req.isActive)
    }

    // Apply sorting
    const sortBy = req.sortBy || 'sortOrder'
    const sortOrder = req.sortOrder || 'asc'
    filtered.sort((a, b) => {
      const aVal = a[sortBy]
      const bVal = b[sortBy]
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      return sortOrder === 'asc' ? comparison : -comparison
    })

    // Apply pagination
    const page = req.page || 1
    const pageSize = Math.min(req.pageSize || 50, 200)
    const start = (page - 1) * pageSize
    const items = filtered.slice(start, start + pageSize)

    return {
      items: items.map((d) => ({
        id: d.id,
        dimensionCode: d.dimensionCode,
        dimensionName: d.dimensionName,
        dimensionType: d.dimensionType,
        isHierarchical: d.isHierarchical,
        scopePolicy: d.scopePolicy,
        sortOrder: d.sortOrder,
        isActive: d.isActive,
      })),
      totalCount: filtered.length,
      page,
      pageSize,
    }
  }

  async getDimensionDetail(id: string): Promise<BffDimensionDetailResponse> {
    await this.delay(200)
    const dimension = mockDimensions.find((d) => d.id === id)
    if (!dimension) {
      throw new Error('DIMENSION_NOT_FOUND')
    }
    return dimension
  }

  async createDimension(req: BffCreateDimensionRequest): Promise<BffDimensionDetailResponse> {
    await this.delay(400)

    // Check for duplicate code
    if (mockDimensions.some((d) => d.dimensionCode === req.dimensionCode)) {
      throw new Error('DIMENSION_CODE_DUPLICATE')
    }

    const newDimension: BffDimensionDetailResponse = {
      id: `dim-${Date.now()}`,
      dimensionCode: req.dimensionCode,
      dimensionName: req.dimensionName,
      dimensionType: req.dimensionType,
      isHierarchical: req.isHierarchical ?? false,
      isRequired: req.isRequired ?? false,
      scopePolicy: req.scopePolicy ?? 'tenant',
      sortOrder: req.sortOrder ?? 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    mockDimensions.push(newDimension)
    return newDimension
  }

  async updateDimension(id: string, req: BffUpdateDimensionRequest): Promise<BffDimensionDetailResponse> {
    await this.delay(400)
    const dimension = mockDimensions.find((d) => d.id === id)
    if (!dimension) {
      throw new Error('DIMENSION_NOT_FOUND')
    }

    // Check for duplicate code (if changing)
    if (req.dimensionCode && req.dimensionCode !== dimension.dimensionCode) {
      if (mockDimensions.some((d) => d.id !== id && d.dimensionCode === req.dimensionCode)) {
        throw new Error('DIMENSION_CODE_DUPLICATE')
      }
    }

    Object.assign(dimension, {
      ...req,
      updatedAt: new Date().toISOString(),
    })

    return dimension
  }

  async deactivateDimension(id: string): Promise<BffDimensionDetailResponse> {
    await this.delay(300)
    const dimension = mockDimensions.find((d) => d.id === id)
    if (!dimension) {
      throw new Error('DIMENSION_NOT_FOUND')
    }
    if (!dimension.isActive) {
      throw new Error('DIMENSION_ALREADY_INACTIVE')
    }

    dimension.isActive = false
    dimension.updatedAt = new Date().toISOString()
    return dimension
  }

  async reactivateDimension(id: string): Promise<BffDimensionDetailResponse> {
    await this.delay(300)
    const dimension = mockDimensions.find((d) => d.id === id)
    if (!dimension) {
      throw new Error('DIMENSION_NOT_FOUND')
    }
    if (dimension.isActive) {
      throw new Error('DIMENSION_ALREADY_ACTIVE')
    }

    dimension.isActive = true
    dimension.updatedAt = new Date().toISOString()
    return dimension
  }

  // Dimension Value methods
  async listDimensionValues(
    dimensionId: string,
    req: BffListDimensionValuesRequest,
  ): Promise<BffListDimensionValuesResponse> {
    await this.delay(300)

    const values = mockDimensionValues[dimensionId] || []
    let filtered = [...values]

    // Apply filters
    if (req.keyword) {
      const keyword = req.keyword.toLowerCase()
      filtered = filtered.filter(
        (v) => v.valueCode.toLowerCase().includes(keyword) || v.valueName.toLowerCase().includes(keyword),
      )
    }
    if (req.scopeType) {
      filtered = filtered.filter((v) => v.scopeType === req.scopeType)
    }
    if (req.scopeCompanyId) {
      filtered = filtered.filter((v) => v.scopeCompanyId === req.scopeCompanyId)
    }
    if (req.isActive !== undefined) {
      filtered = filtered.filter((v) => v.isActive === req.isActive)
    }

    // Apply sorting
    const sortBy = req.sortBy || 'sortOrder'
    const sortOrder = req.sortOrder || 'asc'
    filtered.sort((a, b) => {
      const aVal = a[sortBy]
      const bVal = b[sortBy]
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      return sortOrder === 'asc' ? comparison : -comparison
    })

    // Apply pagination
    const page = req.page || 1
    const pageSize = Math.min(req.pageSize || 50, 200)
    const start = (page - 1) * pageSize
    const items = filtered.slice(start, start + pageSize)

    return {
      items: items.map((v) => ({
        id: v.id,
        valueCode: v.valueCode,
        valueName: v.valueName,
        valueNameShort: v.valueNameShort,
        scopeType: v.scopeType,
        parentId: v.parentId,
        hierarchyLevel: v.hierarchyLevel,
        sortOrder: v.sortOrder,
        isActive: v.isActive,
      })),
      totalCount: filtered.length,
      page,
      pageSize,
    }
  }

  async getDimensionValueDetail(dimensionId: string, valueId: string): Promise<BffDimensionValueDetailResponse> {
    await this.delay(200)
    const values = mockDimensionValues[dimensionId] || []
    const value = values.find((v) => v.id === valueId)
    if (!value) {
      throw new Error('DIMENSION_VALUE_NOT_FOUND')
    }
    return value
  }

  async createDimensionValue(
    dimensionId: string,
    req: BffCreateDimensionValueRequest,
  ): Promise<BffDimensionValueDetailResponse> {
    await this.delay(400)

    const values = mockDimensionValues[dimensionId] || []

    // Check for duplicate code
    if (values.some((v) => v.valueCode === req.valueCode)) {
      throw new Error('VALUE_CODE_DUPLICATE')
    }

    // Calculate hierarchy level
    let hierarchyLevel = 0
    let hierarchyPath = `/${req.valueCode}`
    if (req.parentId) {
      const parent = values.find((v) => v.id === req.parentId)
      if (parent) {
        hierarchyLevel = parent.hierarchyLevel + 1
        hierarchyPath = `${parent.hierarchyPath}/${req.valueCode}`
      }
    }

    const newValue: BffDimensionValueDetailResponse = {
      id: `val-${Date.now()}`,
      dimensionId,
      valueCode: req.valueCode,
      valueName: req.valueName,
      valueNameShort: req.valueNameShort || null,
      scopeType: req.scopeType,
      scopeCompanyId: req.scopeCompanyId || null,
      parentId: req.parentId || null,
      hierarchyLevel,
      hierarchyPath,
      sortOrder: req.sortOrder ?? 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    if (!mockDimensionValues[dimensionId]) {
      mockDimensionValues[dimensionId] = []
    }
    mockDimensionValues[dimensionId].push(newValue)
    return newValue
  }

  async updateDimensionValue(
    dimensionId: string,
    valueId: string,
    req: BffUpdateDimensionValueRequest,
  ): Promise<BffDimensionValueDetailResponse> {
    await this.delay(400)
    const values = mockDimensionValues[dimensionId] || []
    const value = values.find((v) => v.id === valueId)
    if (!value) {
      throw new Error('DIMENSION_VALUE_NOT_FOUND')
    }

    // Check for duplicate code (if changing)
    if (req.valueCode && req.valueCode !== value.valueCode) {
      if (values.some((v) => v.id !== valueId && v.valueCode === req.valueCode)) {
        throw new Error('VALUE_CODE_DUPLICATE')
      }
    }

    // Check for circular reference if changing parent
    if (req.parentId !== undefined && req.parentId !== value.parentId) {
      if (req.parentId && this.wouldCreateCircularReference(values, valueId, req.parentId)) {
        throw new Error('CIRCULAR_REFERENCE_DETECTED')
      }
    }

    Object.assign(value, {
      ...req,
      updatedAt: new Date().toISOString(),
    })

    return value
  }

  async deactivateDimensionValue(dimensionId: string, valueId: string): Promise<BffDimensionValueDetailResponse> {
    await this.delay(300)
    const values = mockDimensionValues[dimensionId] || []
    const value = values.find((v) => v.id === valueId)
    if (!value) {
      throw new Error('DIMENSION_VALUE_NOT_FOUND')
    }
    if (!value.isActive) {
      throw new Error('DIMENSION_VALUE_ALREADY_INACTIVE')
    }

    value.isActive = false
    value.updatedAt = new Date().toISOString()
    return value
  }

  async reactivateDimensionValue(dimensionId: string, valueId: string): Promise<BffDimensionValueDetailResponse> {
    await this.delay(300)
    const values = mockDimensionValues[dimensionId] || []
    const value = values.find((v) => v.id === valueId)
    if (!value) {
      throw new Error('DIMENSION_VALUE_NOT_FOUND')
    }
    if (value.isActive) {
      throw new Error('DIMENSION_VALUE_ALREADY_ACTIVE')
    }

    value.isActive = true
    value.updatedAt = new Date().toISOString()
    return value
  }

  // Helper methods
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  private wouldCreateCircularReference(
    values: BffDimensionValueDetailResponse[],
    childId: string,
    proposedParentId: string,
  ): boolean {
    let currentId: string | null = proposedParentId
    const visited = new Set<string>()

    while (currentId) {
      if (currentId === childId) {
        return true // Circular reference detected
      }
      if (visited.has(currentId)) {
        return false // Already checked this node
      }
      visited.add(currentId)

      const parent = values.find((v) => v.id === currentId)
      currentId = parent?.parentId || null
    }

    return false
  }
}
