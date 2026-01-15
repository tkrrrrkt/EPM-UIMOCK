import type { BffClient } from "./BffClient"
import type {
  BffListProjectsRequest,
  BffListProjectsResponse,
  BffProjectDetailResponse,
  BffCreateProjectRequest,
  BffUpdateProjectRequest,
  ProjectStatus,
} from "@epm/contracts/bff/project-master"
import { ProjectMasterErrorCode } from "@epm/contracts/bff/project-master"

const mockProjects: BffProjectDetailResponse[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    projectCode: "PRJ001",
    projectName: "基幹システム刷新プロジェクト",
    projectNameShort: "基幹刷新",
    projectType: "CAPEX",
    projectStatus: "ACTIVE" as ProjectStatus,
    startDate: "2024-04-01",
    endDate: "2025-03-31",
    parentProjectId: null,
    ownerDepartmentStableId: "550e8400-e29b-41d4-a716-446655440010",
    ownerEmployeeId: "550e8400-e29b-41d4-a716-446655440020",
    externalRef: "SAP-PS-001",
    notes: "2024年度の最重要プロジェクト",
    isActive: true,
    createdAt: "2024-01-15T09:00:00Z",
    updatedAt: "2024-03-20T14:30:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    projectCode: "PRJ002",
    projectName: "新規事業開発プロジェクト",
    projectNameShort: "新規事業",
    projectType: "OPEX",
    projectStatus: "PLANNED" as ProjectStatus,
    startDate: "2024-07-01",
    endDate: "2025-06-30",
    parentProjectId: null,
    ownerDepartmentStableId: "550e8400-e29b-41d4-a716-446655440011",
    ownerEmployeeId: "550e8400-e29b-41d4-a716-446655440021",
    externalRef: null,
    notes: "AI技術を活用した新規サービスの企画・開発",
    isActive: true,
    createdAt: "2024-02-20T10:30:00Z",
    updatedAt: "2024-02-20T10:30:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    projectCode: "PRJ003",
    projectName: "レガシーシステム移行",
    projectNameShort: "レガシー移行",
    projectType: null,
    projectStatus: "CLOSED" as ProjectStatus,
    startDate: "2023-01-01",
    endDate: "2023-12-31",
    parentProjectId: null,
    ownerDepartmentStableId: null,
    ownerEmployeeId: null,
    externalRef: null,
    notes: null,
    isActive: false,
    createdAt: "2022-11-10T14:00:00Z",
    updatedAt: "2024-01-05T16:30:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    projectCode: "PRJ004",
    projectName: "DX推進プロジェクト",
    projectNameShort: "DX推進",
    projectType: "CAPEX",
    projectStatus: "ON_HOLD" as ProjectStatus,
    startDate: "2024-01-01",
    endDate: null,
    parentProjectId: null,
    ownerDepartmentStableId: "550e8400-e29b-41d4-a716-446655440012",
    ownerEmployeeId: null,
    externalRef: "DX-2024-001",
    notes: "一時保留中",
    isActive: true,
    createdAt: "2024-03-05T11:15:00Z",
    updatedAt: "2024-03-05T11:15:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    projectCode: "PRJ005",
    projectName: "コスト最適化プログラム",
    projectNameShort: "コスト最適化",
    projectType: "OPEX",
    projectStatus: "ACTIVE" as ProjectStatus,
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    parentProjectId: "550e8400-e29b-41d4-a716-446655440001",
    ownerDepartmentStableId: "550e8400-e29b-41d4-a716-446655440013",
    ownerEmployeeId: "550e8400-e29b-41d4-a716-446655440023",
    externalRef: null,
    notes: "運用コストの見直しと最適化施策の実行",
    isActive: true,
    createdAt: "2023-12-01T08:00:00Z",
    updatedAt: "2023-12-01T08:00:00Z",
  },
]

const projectsStore = [...mockProjects]

export class MockBffClient implements BffClient {
  private delay(ms = 300): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  async listProjects(request: BffListProjectsRequest): Promise<BffListProjectsResponse> {
    await this.delay()

    let filtered = [...projectsStore]

    // キーワード検索
    if (request.keyword) {
      const keyword = request.keyword.toLowerCase()
      filtered = filtered.filter(
        (p) => p.projectCode.toLowerCase().includes(keyword) || p.projectName.toLowerCase().includes(keyword),
      )
    }

    if (request.projectStatus) {
      filtered = filtered.filter((p) => p.projectStatus === request.projectStatus)
    }

    // 有効フラグフィルタ
    if (request.isActive !== undefined) {
      filtered = filtered.filter((p) => p.isActive === request.isActive)
    }

    // ソート
    const sortBy = request.sortBy || "projectCode"
    const sortOrder = request.sortOrder || "asc"
    filtered.sort((a, b) => {
      let aVal = a[sortBy]
      let bVal = b[sortBy]

      if (aVal === null) aVal = ""
      if (bVal === null) bVal = ""

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1
      return 0
    })

    // ページネーション
    const page = request.page || 1
    const pageSize = Math.min(request.pageSize || 50, 200)
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const items = filtered.slice(startIndex, endIndex)

    return {
      items: items.map((p) => ({
        id: p.id,
        projectCode: p.projectCode,
        projectName: p.projectName,
        projectStatus: p.projectStatus,
        startDate: p.startDate,
        endDate: p.endDate,
        isActive: p.isActive,
      })),
      totalCount: filtered.length,
      page,
      pageSize,
    }
  }

  async getProjectDetail(id: string): Promise<BffProjectDetailResponse> {
    await this.delay()

    const project = projectsStore.find((p) => p.id === id)
    if (!project) {
      throw {
        code: ProjectMasterErrorCode.PROJECT_NOT_FOUND,
        message: "プロジェクトが見つかりません",
      }
    }

    return project
  }

  async createProject(request: BffCreateProjectRequest): Promise<BffProjectDetailResponse> {
    await this.delay()

    const duplicate = projectsStore.find((p) => p.projectCode === request.projectCode)
    if (duplicate) {
      throw {
        code: ProjectMasterErrorCode.PROJECT_CODE_DUPLICATE,
        message: "プロジェクトコードが重複しています",
        details: { projectCode: request.projectCode },
      }
    }

    const newProject: BffProjectDetailResponse = {
      id: `550e8400-e29b-41d4-a716-${Date.now()}`,
      projectCode: request.projectCode,
      projectName: request.projectName,
      projectNameShort: request.projectNameShort || null,
      projectType: request.projectType || null,
      projectStatus: request.projectStatus || ("PLANNED" as ProjectStatus),
      startDate: request.startDate || null,
      endDate: request.endDate || null,
      parentProjectId: request.parentProjectId || null,
      ownerDepartmentStableId: request.ownerDepartmentStableId || null,
      ownerEmployeeId: request.ownerEmployeeId || null,
      externalRef: request.externalRef || null,
      notes: request.notes || null,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    projectsStore.push(newProject)
    return newProject
  }

  async updateProject(id: string, request: BffUpdateProjectRequest): Promise<BffProjectDetailResponse> {
    await this.delay()

    const projectIndex = projectsStore.findIndex((p) => p.id === id)
    if (projectIndex === -1) {
      throw {
        code: ProjectMasterErrorCode.PROJECT_NOT_FOUND,
        message: "プロジェクトが見つかりません",
      }
    }

    if (request.projectCode) {
      const duplicate = projectsStore.find((p) => p.projectCode === request.projectCode && p.id !== id)
      if (duplicate) {
        throw {
          code: ProjectMasterErrorCode.PROJECT_CODE_DUPLICATE,
          message: "プロジェクトコードが重複しています",
          details: { projectCode: request.projectCode },
        }
      }
    }

    const project = projectsStore[projectIndex]
    const updatedProject: BffProjectDetailResponse = {
      ...project,
      projectCode: request.projectCode ?? project.projectCode,
      projectName: request.projectName ?? project.projectName,
      projectNameShort: request.projectNameShort !== undefined ? request.projectNameShort : project.projectNameShort,
      projectType: request.projectType !== undefined ? request.projectType : project.projectType,
      projectStatus: request.projectStatus ?? project.projectStatus,
      startDate: request.startDate !== undefined ? request.startDate : project.startDate,
      endDate: request.endDate !== undefined ? request.endDate : project.endDate,
      parentProjectId: request.parentProjectId !== undefined ? request.parentProjectId : project.parentProjectId,
      ownerDepartmentStableId:
        request.ownerDepartmentStableId !== undefined
          ? request.ownerDepartmentStableId
          : project.ownerDepartmentStableId,
      ownerEmployeeId: request.ownerEmployeeId !== undefined ? request.ownerEmployeeId : project.ownerEmployeeId,
      externalRef: request.externalRef !== undefined ? request.externalRef : project.externalRef,
      notes: request.notes !== undefined ? request.notes : project.notes,
      updatedAt: new Date().toISOString(),
    }

    projectsStore[projectIndex] = updatedProject
    return updatedProject
  }

  async deactivateProject(id: string): Promise<BffProjectDetailResponse> {
    await this.delay()

    const projectIndex = projectsStore.findIndex((p) => p.id === id)
    if (projectIndex === -1) {
      throw {
        code: ProjectMasterErrorCode.PROJECT_NOT_FOUND,
        message: "プロジェクトが見つかりません",
      }
    }

    const project = projectsStore[projectIndex]
    if (!project.isActive) {
      throw {
        code: ProjectMasterErrorCode.PROJECT_ALREADY_INACTIVE,
        message: "このプロジェクトは既に無効化されています",
      }
    }

    const updatedProject: BffProjectDetailResponse = {
      ...project,
      isActive: false,
      updatedAt: new Date().toISOString(),
    }

    projectsStore[projectIndex] = updatedProject
    return updatedProject
  }

  async reactivateProject(id: string): Promise<BffProjectDetailResponse> {
    await this.delay()

    const projectIndex = projectsStore.findIndex((p) => p.id === id)
    if (projectIndex === -1) {
      throw {
        code: ProjectMasterErrorCode.PROJECT_NOT_FOUND,
        message: "プロジェクトが見つかりません",
      }
    }

    const project = projectsStore[projectIndex]
    if (project.isActive) {
      throw {
        code: ProjectMasterErrorCode.PROJECT_ALREADY_ACTIVE,
        message: "このプロジェクトは既に有効です",
      }
    }

    const updatedProject: BffProjectDetailResponse = {
      ...project,
      isActive: true,
      updatedAt: new Date().toISOString(),
    }

    projectsStore[projectIndex] = updatedProject
    return updatedProject
  }
}
