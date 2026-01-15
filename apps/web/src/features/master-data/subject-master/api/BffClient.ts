import type {
  BffSubjectTreeRequest,
  BffSubjectTreeResponse,
  BffSubjectDetailResponse,
  BffCreateSubjectRequest,
  BffUpdateSubjectRequest,
  BffAddRollupRequest,
  BffUpdateRollupRequest,
  BffMoveSubjectRequest,
} from "@contracts/bff/subject-master"

export interface BffClient {
  // Subject endpoints
  getSubjectTree(request: BffSubjectTreeRequest): Promise<BffSubjectTreeResponse>
  getSubjectDetail(id: string): Promise<BffSubjectDetailResponse>
  createSubject(request: BffCreateSubjectRequest): Promise<BffSubjectDetailResponse>
  updateSubject(id: string, request: BffUpdateSubjectRequest): Promise<BffSubjectDetailResponse>
  deactivateSubject(id: string): Promise<BffSubjectDetailResponse>
  reactivateSubject(id: string): Promise<BffSubjectDetailResponse>

  // Rollup endpoints
  addRollup(parentId: string, request: BffAddRollupRequest): Promise<BffSubjectTreeResponse>
  updateRollup(parentId: string, componentId: string, request: BffUpdateRollupRequest): Promise<BffSubjectTreeResponse>
  deleteRollup(parentId: string, componentId: string): Promise<BffSubjectTreeResponse>
  moveSubject(request: BffMoveSubjectRequest): Promise<BffSubjectTreeResponse>
}
