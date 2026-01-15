// BFF Contracts for Project Master
// SSoT for UI/BFF communication

export const ProjectStatus = {
  PLANNED: "PLANNED",
  ACTIVE: "ACTIVE",
  ON_HOLD: "ON_HOLD",
  CLOSED: "CLOSED",
} as const
export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus]

export interface BffProjectSummary {
  id: string
  projectCode: string
  projectName: string
  projectStatus: ProjectStatus
  startDate: string | null
  endDate: string | null
  isActive: boolean
}

export interface BffListProjectsRequest {
  page?: number
  pageSize?: number
  sortBy?: "projectCode" | "projectName" | "projectStatus" | "startDate" | "endDate"
  sortOrder?: "asc" | "desc"
  keyword?: string
  projectStatus?: ProjectStatus
  isActive?: boolean
}

export interface BffListProjectsResponse {
  items: BffProjectSummary[]
  totalCount: number
  page: number
  pageSize: number
}

export interface BffProjectDetailResponse {
  id: string
  projectCode: string
  projectName: string
  projectNameShort: string | null
  projectType: string | null
  projectStatus: ProjectStatus
  startDate: string | null
  endDate: string | null
  parentProjectId: string | null
  ownerDepartmentStableId: string | null
  ownerEmployeeId: string | null
  externalRef: string | null
  notes: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface BffCreateProjectRequest {
  projectCode: string
  projectName: string
  projectNameShort?: string
  projectType?: string
  projectStatus?: ProjectStatus
  startDate?: string
  endDate?: string
  parentProjectId?: string
  ownerDepartmentStableId?: string
  ownerEmployeeId?: string
  externalRef?: string
  notes?: string
}

export interface BffUpdateProjectRequest {
  projectCode?: string
  projectName?: string
  projectNameShort?: string | null
  projectType?: string | null
  projectStatus?: ProjectStatus
  startDate?: string | null
  endDate?: string | null
  parentProjectId?: string | null
  ownerDepartmentStableId?: string | null
  ownerEmployeeId?: string | null
  externalRef?: string | null
  notes?: string | null
}

export const ProjectMasterErrorCode = {
  PROJECT_NOT_FOUND: "PROJECT_NOT_FOUND",
  PROJECT_CODE_DUPLICATE: "PROJECT_CODE_DUPLICATE",
  PROJECT_ALREADY_INACTIVE: "PROJECT_ALREADY_INACTIVE",
  PROJECT_ALREADY_ACTIVE: "PROJECT_ALREADY_ACTIVE",
  PARENT_PROJECT_NOT_FOUND: "PARENT_PROJECT_NOT_FOUND",
  INVALID_PARENT_PROJECT: "INVALID_PARENT_PROJECT",
  VALIDATION_ERROR: "VALIDATION_ERROR",
} as const

export type ProjectMasterErrorCode = (typeof ProjectMasterErrorCode)[keyof typeof ProjectMasterErrorCode]

export interface ProjectMasterError {
  code: ProjectMasterErrorCode
  message: string
  details?: Record<string, unknown>
}


