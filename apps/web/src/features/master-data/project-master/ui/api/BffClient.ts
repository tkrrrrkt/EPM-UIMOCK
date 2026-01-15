import type {
  BffListProjectsRequest,
  BffListProjectsResponse,
  BffProjectDetailResponse,
  BffCreateProjectRequest,
  BffUpdateProjectRequest,
} from "@epm/contracts/bff/project-master"

export interface BffClient {
  listProjects(request: BffListProjectsRequest): Promise<BffListProjectsResponse>
  getProjectDetail(id: string): Promise<BffProjectDetailResponse>
  createProject(request: BffCreateProjectRequest): Promise<BffProjectDetailResponse>
  updateProject(id: string, request: BffUpdateProjectRequest): Promise<BffProjectDetailResponse>
  deactivateProject(id: string): Promise<BffProjectDetailResponse>
  reactivateProject(id: string): Promise<BffProjectDetailResponse>
}
