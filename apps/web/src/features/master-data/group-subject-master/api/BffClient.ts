import type {
  BffGroupSubjectTreeRequest,
  BffGroupSubjectTreeResponse,
  BffGroupSubjectDetailResponse,
  BffCreateGroupSubjectRequest,
  BffUpdateGroupSubjectRequest,
  BffAddGroupRollupRequest,
  BffUpdateGroupRollupRequest,
  BffMoveGroupSubjectRequest,
} from "@epm/contracts/bff/group-subject-master"

export interface BffClient {
  getTree(request: BffGroupSubjectTreeRequest): Promise<BffGroupSubjectTreeResponse>
  getDetail(id: string): Promise<BffGroupSubjectDetailResponse>
  create(request: BffCreateGroupSubjectRequest): Promise<BffGroupSubjectDetailResponse>
  update(id: string, request: BffUpdateGroupSubjectRequest): Promise<BffGroupSubjectDetailResponse>
  deactivate(id: string): Promise<BffGroupSubjectDetailResponse>
  reactivate(id: string): Promise<BffGroupSubjectDetailResponse>
  addRollup(parentId: string, request: BffAddGroupRollupRequest): Promise<BffGroupSubjectTreeResponse>
  updateRollup(
    parentId: string,
    componentId: string,
    request: BffUpdateGroupRollupRequest,
  ): Promise<BffGroupSubjectTreeResponse>
  deleteRollup(parentId: string, componentId: string): Promise<BffGroupSubjectTreeResponse>
  move(request: BffMoveGroupSubjectRequest): Promise<BffGroupSubjectTreeResponse>
}
