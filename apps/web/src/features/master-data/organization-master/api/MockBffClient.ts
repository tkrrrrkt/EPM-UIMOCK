import type { BffClient } from './BffClient'
import type {
  BffVersionListRequest,
  BffVersionListResponse,
  BffVersionDetailResponse,
  BffCreateVersionRequest,
  BffCopyVersionRequest,
  BffUpdateVersionRequest,
  BffDepartmentTreeRequest,
  BffDepartmentTreeResponse,
  BffDepartmentDetailResponse,
  BffCreateDepartmentRequest,
  BffUpdateDepartmentRequest,
  BffMoveDepartmentRequest,
  BffVersionSummary,
  BffDepartmentTreeNode,
} from '@epm/contracts/bff/organization-master'

// Mock data
const mockVersions: BffVersionSummary[] = [
  {
    id: 'v1',
    versionCode: '2024-04',
    versionName: '2024年4月組織',
    effectiveDate: '2024-04-01',
    expiryDate: '2025-03-31',
    isCurrentlyEffective: false,
    departmentCount: 15,
  },
  {
    id: 'v2',
    versionCode: '2025-04',
    versionName: '2025年4月組織改編',
    effectiveDate: '2025-04-01',
    expiryDate: null,
    isCurrentlyEffective: true,
    departmentCount: 18,
  },
  {
    id: 'v3',
    versionCode: '2026-04',
    versionName: '2026年4月予定組織',
    effectiveDate: '2026-04-01',
    expiryDate: null,
    isCurrentlyEffective: false,
    departmentCount: 20,
  },
]

const mockDepartmentTree: BffDepartmentTreeNode[] = [
  {
    id: 'd1',
    stableId: 'stable-corp',
    departmentCode: 'CORP',
    departmentName: '本社',
    orgUnitType: 'company',
    isActive: true,
    hierarchyLevel: 1,
    children: [
      {
        id: 'd2',
        stableId: 'stable-sales',
        departmentCode: 'SALES',
        departmentName: '営業本部',
        orgUnitType: 'headquarters',
        isActive: true,
        hierarchyLevel: 2,
        children: [
          {
            id: 'd3',
            stableId: 'stable-sales1',
            departmentCode: 'SALES-1',
            departmentName: '第一営業部',
            orgUnitType: 'department',
            isActive: true,
            hierarchyLevel: 3,
            children: [
              {
                id: 'd4',
                stableId: 'stable-sales1-1',
                departmentCode: 'SALES-1-1',
                departmentName: '東日本営業課',
                orgUnitType: 'section',
                isActive: true,
                hierarchyLevel: 4,
                children: [],
              },
              {
                id: 'd5',
                stableId: 'stable-sales1-2',
                departmentCode: 'SALES-1-2',
                departmentName: '西日本営業課',
                orgUnitType: 'section',
                isActive: true,
                hierarchyLevel: 4,
                children: [],
              },
            ],
          },
          {
            id: 'd6',
            stableId: 'stable-sales2',
            departmentCode: 'SALES-2',
            departmentName: '第二営業部',
            orgUnitType: 'department',
            isActive: true,
            hierarchyLevel: 3,
            children: [],
          },
        ],
      },
      {
        id: 'd7',
        stableId: 'stable-dev',
        departmentCode: 'DEV',
        departmentName: '開発本部',
        orgUnitType: 'headquarters',
        isActive: true,
        hierarchyLevel: 2,
        children: [
          {
            id: 'd8',
            stableId: 'stable-dev1',
            departmentCode: 'DEV-1',
            departmentName: '第一開発部',
            orgUnitType: 'department',
            isActive: true,
            hierarchyLevel: 3,
            children: [],
          },
          {
            id: 'd9',
            stableId: 'stable-dev2',
            departmentCode: 'DEV-2',
            departmentName: '第二開発部',
            orgUnitType: 'department',
            isActive: true,
            hierarchyLevel: 3,
            children: [],
          },
        ],
      },
      {
        id: 'd10',
        stableId: 'stable-admin',
        departmentCode: 'ADMIN',
        departmentName: '管理本部',
        orgUnitType: 'headquarters',
        isActive: true,
        hierarchyLevel: 2,
        children: [
          {
            id: 'd11',
            stableId: 'stable-hr',
            departmentCode: 'HR',
            departmentName: '人事部',
            orgUnitType: 'department',
            isActive: true,
            hierarchyLevel: 3,
            children: [],
          },
          {
            id: 'd12',
            stableId: 'stable-finance',
            departmentCode: 'FIN',
            departmentName: '経理部',
            orgUnitType: 'department',
            isActive: true,
            hierarchyLevel: 3,
            children: [],
          },
          {
            id: 'd13',
            stableId: 'stable-legal',
            departmentCode: 'LEGAL',
            departmentName: '法務部',
            orgUnitType: 'department',
            isActive: false,
            hierarchyLevel: 3,
            children: [],
          },
        ],
      },
    ],
  },
]

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function generateId(): string {
  return `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export class MockBffClient implements BffClient {
  private versions = [...mockVersions]
  private departmentTree = JSON.parse(JSON.stringify(mockDepartmentTree)) as BffDepartmentTreeNode[]

  async getVersionList(_request: BffVersionListRequest): Promise<BffVersionListResponse> {
    await delay(300)
    return { items: this.versions }
  }

  async getVersionDetail(id: string): Promise<BffVersionDetailResponse> {
    await delay(200)
    const version = this.versions.find((v) => v.id === id)
    if (!version) {
      throw new Error('VERSION_NOT_FOUND')
    }
    return {
      ...version,
      description: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  async createVersion(request: BffCreateVersionRequest): Promise<BffVersionDetailResponse> {
    await delay(300)
    const newVersion: BffVersionSummary = {
      id: generateId(),
      versionCode: request.versionCode,
      versionName: request.versionName,
      effectiveDate: request.effectiveDate,
      expiryDate: request.expiryDate || null,
      isCurrentlyEffective: false,
      departmentCount: 0,
    }
    this.versions.push(newVersion)
    return {
      ...newVersion,
      description: request.description || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  async copyVersion(id: string, request: BffCopyVersionRequest): Promise<BffVersionDetailResponse> {
    await delay(500)
    const sourceVersion = this.versions.find((v) => v.id === id)
    if (!sourceVersion) {
      throw new Error('VERSION_NOT_FOUND')
    }
    const newVersion: BffVersionSummary = {
      id: generateId(),
      versionCode: request.versionCode,
      versionName: request.versionName,
      effectiveDate: request.effectiveDate,
      expiryDate: request.expiryDate || null,
      isCurrentlyEffective: false,
      departmentCount: sourceVersion.departmentCount,
    }
    this.versions.push(newVersion)
    return {
      ...newVersion,
      description: request.description || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  async updateVersion(id: string, request: BffUpdateVersionRequest): Promise<BffVersionDetailResponse> {
    await delay(300)
    const index = this.versions.findIndex((v) => v.id === id)
    if (index === -1) {
      throw new Error('VERSION_NOT_FOUND')
    }
    const version = this.versions[index]
    const updated: BffVersionSummary = {
      ...version,
      versionCode: request.versionCode ?? version.versionCode,
      versionName: request.versionName ?? version.versionName,
      effectiveDate: request.effectiveDate ?? version.effectiveDate,
      expiryDate: request.expiryDate === null ? null : (request.expiryDate ?? version.expiryDate),
    }
    this.versions[index] = updated
    return {
      ...updated,
      description: request.description === null ? null : (request.description ?? null),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  async getVersionAsOf(id: string, _asOfDate: string): Promise<BffVersionDetailResponse> {
    return this.getVersionDetail(id)
  }

  async getDepartmentTree(_versionId: string, request: BffDepartmentTreeRequest): Promise<BffDepartmentTreeResponse> {
    await delay(300)

    const filterNodes = (nodes: BffDepartmentTreeNode[]): BffDepartmentTreeNode[] => {
      return nodes
        .filter((node) => {
          if (request.isActive !== undefined && node.isActive !== request.isActive) {
            return false
          }
          if (request.orgUnitType && node.orgUnitType !== request.orgUnitType) {
            return false
          }
          if (request.keyword) {
            const keyword = request.keyword.toLowerCase()
            if (
              !node.departmentCode.toLowerCase().includes(keyword) &&
              !node.departmentName.toLowerCase().includes(keyword)
            ) {
              return false
            }
          }
          return true
        })
        .map((node) => ({
          ...node,
          children: filterNodes(node.children),
        }))
    }

    const filtered = request.keyword || request.isActive !== undefined || request.orgUnitType
      ? filterNodes(this.departmentTree)
      : this.departmentTree

    return { roots: filtered }
  }

  async getDepartmentDetail(id: string): Promise<BffDepartmentDetailResponse> {
    await delay(200)

    const findNode = (nodes: BffDepartmentTreeNode[], parentName: string | null = null): BffDepartmentDetailResponse | null => {
      for (const node of nodes) {
        if (node.id === id) {
          return {
            id: node.id,
            stableId: node.stableId,
            departmentCode: node.departmentCode,
            departmentName: node.departmentName,
            departmentNameShort: null,
            parentDepartmentId: null,
            parentDepartmentName: parentName,
            sortOrder: 10,
            hierarchyLevel: node.hierarchyLevel,
            hierarchyPath: `/${node.departmentCode}`,
            orgUnitType: node.orgUnitType,
            responsibilityType: node.hierarchyLevel <= 2 ? 'profit_center' : 'cost_center',
            externalCenterCode: null,
            notes: null,
            isActive: node.isActive,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        }
        const found = findNode(node.children, node.departmentName)
        if (found) return found
      }
      return null
    }

    const result = findNode(this.departmentTree)
    if (!result) {
      throw new Error('DEPARTMENT_NOT_FOUND')
    }
    return result
  }

  async createDepartment(_versionId: string, request: BffCreateDepartmentRequest): Promise<BffDepartmentDetailResponse> {
    await delay(300)

    const newId = generateId()
    const newNode: BffDepartmentTreeNode = {
      id: newId,
      stableId: `stable-${newId}`,
      departmentCode: request.departmentCode,
      departmentName: request.departmentName,
      orgUnitType: request.orgUnitType || null,
      isActive: true,
      hierarchyLevel: 1,
      children: [],
    }

    if (request.parentId) {
      const addToParent = (nodes: BffDepartmentTreeNode[]): boolean => {
        for (const node of nodes) {
          if (node.id === request.parentId) {
            newNode.hierarchyLevel = node.hierarchyLevel + 1
            node.children.push(newNode)
            return true
          }
          if (addToParent(node.children)) return true
        }
        return false
      }
      addToParent(this.departmentTree)
    } else {
      this.departmentTree.push(newNode)
    }

    return {
      id: newNode.id,
      stableId: newNode.stableId,
      departmentCode: newNode.departmentCode,
      departmentName: newNode.departmentName,
      departmentNameShort: request.departmentNameShort || null,
      parentDepartmentId: request.parentId || null,
      parentDepartmentName: null,
      sortOrder: request.sortOrder || 10,
      hierarchyLevel: newNode.hierarchyLevel,
      hierarchyPath: `/${newNode.departmentCode}`,
      orgUnitType: newNode.orgUnitType,
      responsibilityType: request.responsibilityType || null,
      externalCenterCode: request.externalCenterCode || null,
      notes: request.notes || null,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  async updateDepartment(id: string, request: BffUpdateDepartmentRequest): Promise<BffDepartmentDetailResponse> {
    await delay(300)

    const updateNode = (nodes: BffDepartmentTreeNode[]): BffDepartmentTreeNode | null => {
      for (const node of nodes) {
        if (node.id === id) {
          if (request.departmentCode !== undefined) node.departmentCode = request.departmentCode
          if (request.departmentName !== undefined) node.departmentName = request.departmentName
          if (request.orgUnitType !== undefined) node.orgUnitType = request.orgUnitType
          return node
        }
        const found = updateNode(node.children)
        if (found) return found
      }
      return null
    }

    const updated = updateNode(this.departmentTree)
    if (!updated) {
      throw new Error('DEPARTMENT_NOT_FOUND')
    }

    return {
      id: updated.id,
      stableId: updated.stableId,
      departmentCode: updated.departmentCode,
      departmentName: updated.departmentName,
      departmentNameShort: request.departmentNameShort === null ? null : (request.departmentNameShort || null),
      parentDepartmentId: null,
      parentDepartmentName: null,
      sortOrder: request.sortOrder || 10,
      hierarchyLevel: updated.hierarchyLevel,
      hierarchyPath: `/${updated.departmentCode}`,
      orgUnitType: updated.orgUnitType,
      responsibilityType: request.responsibilityType === null ? null : (request.responsibilityType || null),
      externalCenterCode: request.externalCenterCode === null ? null : (request.externalCenterCode || null),
      notes: request.notes === null ? null : (request.notes || null),
      isActive: updated.isActive,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  async moveDepartment(id: string, request: BffMoveDepartmentRequest): Promise<BffDepartmentTreeResponse> {
    await delay(300)

    // Remove node from current position
    let movedNode: BffDepartmentTreeNode | null = null
    const removeNode = (nodes: BffDepartmentTreeNode[]): boolean => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === id) {
          movedNode = nodes.splice(i, 1)[0]
          return true
        }
        if (removeNode(nodes[i].children)) return true
      }
      return false
    }
    removeNode(this.departmentTree)

    if (!movedNode) {
      throw new Error('DEPARTMENT_NOT_FOUND')
    }

    // Capture the node for use in nested functions (explicit type assertion)
    const nodeToMove: BffDepartmentTreeNode = movedNode

    // Add to new position
    if (request.newParentId) {
      const addToParent = (nodes: BffDepartmentTreeNode[]): boolean => {
        for (const node of nodes) {
          if (node.id === request.newParentId) {
            nodeToMove.hierarchyLevel = node.hierarchyLevel + 1
            node.children.push(nodeToMove)
            return true
          }
          if (addToParent(node.children)) return true
        }
        return false
      }
      addToParent(this.departmentTree)
    } else {
      nodeToMove.hierarchyLevel = 1
      this.departmentTree.push(nodeToMove)
    }

    return { roots: this.departmentTree }
  }

  async deactivateDepartment(id: string): Promise<BffDepartmentDetailResponse> {
    await delay(200)

    const deactivateNode = (nodes: BffDepartmentTreeNode[]): BffDepartmentTreeNode | null => {
      for (const node of nodes) {
        if (node.id === id) {
          node.isActive = false
          return node
        }
        const found = deactivateNode(node.children)
        if (found) return found
      }
      return null
    }

    const node = deactivateNode(this.departmentTree)
    if (!node) {
      throw new Error('DEPARTMENT_NOT_FOUND')
    }

    return {
      id: node.id,
      stableId: node.stableId,
      departmentCode: node.departmentCode,
      departmentName: node.departmentName,
      departmentNameShort: null,
      parentDepartmentId: null,
      parentDepartmentName: null,
      sortOrder: 10,
      hierarchyLevel: node.hierarchyLevel,
      hierarchyPath: `/${node.departmentCode}`,
      orgUnitType: node.orgUnitType,
      responsibilityType: null,
      externalCenterCode: null,
      notes: null,
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  async reactivateDepartment(id: string): Promise<BffDepartmentDetailResponse> {
    await delay(200)

    const reactivateNode = (nodes: BffDepartmentTreeNode[]): BffDepartmentTreeNode | null => {
      for (const node of nodes) {
        if (node.id === id) {
          node.isActive = true
          return node
        }
        const found = reactivateNode(node.children)
        if (found) return found
      }
      return null
    }

    const node = reactivateNode(this.departmentTree)
    if (!node) {
      throw new Error('DEPARTMENT_NOT_FOUND')
    }

    return {
      id: node.id,
      stableId: node.stableId,
      departmentCode: node.departmentCode,
      departmentName: node.departmentName,
      departmentNameShort: null,
      parentDepartmentId: null,
      parentDepartmentName: null,
      sortOrder: 10,
      hierarchyLevel: node.hierarchyLevel,
      hierarchyPath: `/${node.departmentCode}`,
      orgUnitType: node.orgUnitType,
      responsibilityType: null,
      externalCenterCode: null,
      notes: null,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }
}
