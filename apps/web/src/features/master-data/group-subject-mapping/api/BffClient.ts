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
} from '@epm/contracts/bff/group-subject-mapping'

export interface BffClient {
  getMappingList(params: BffMappingListRequest): Promise<BffMappingListResponse>
  getMappingDetail(id: string): Promise<BffMappingDetailResponse>
  createMapping(data: BffCreateMappingRequest): Promise<BffMappingDetailResponse>
  updateMapping(id: string, data: BffUpdateMappingRequest): Promise<BffMappingDetailResponse>
  deleteMapping(id: string): Promise<{ success: true }>
  deactivateMapping(id: string): Promise<BffMappingDetailResponse>
  reactivateMapping(id: string): Promise<BffMappingDetailResponse>
  bulkCreateMapping(data: BffBulkMappingRequest): Promise<BffBulkMappingResponse>
  getGroupSubjectTree(params: BffGroupSubjectSelectRequest): Promise<BffGroupSubjectSelectTreeResponse>
}
