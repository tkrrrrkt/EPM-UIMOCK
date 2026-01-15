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
} from '@epm/contracts/bff/organization-master'

/**
 * BffClient interface for organization-master
 *
 * SSoT: .kiro/specs/master-data/organization-master/design.md
 */
export interface BffClient {
  // Version operations
  getVersionList(request: BffVersionListRequest): Promise<BffVersionListResponse>
  getVersionDetail(id: string): Promise<BffVersionDetailResponse>
  createVersion(request: BffCreateVersionRequest): Promise<BffVersionDetailResponse>
  copyVersion(id: string, request: BffCopyVersionRequest): Promise<BffVersionDetailResponse>
  updateVersion(id: string, request: BffUpdateVersionRequest): Promise<BffVersionDetailResponse>
  getVersionAsOf(id: string, asOfDate: string): Promise<BffVersionDetailResponse>

  // Department operations
  getDepartmentTree(versionId: string, request: BffDepartmentTreeRequest): Promise<BffDepartmentTreeResponse>
  getDepartmentDetail(id: string): Promise<BffDepartmentDetailResponse>
  createDepartment(versionId: string, request: BffCreateDepartmentRequest): Promise<BffDepartmentDetailResponse>
  updateDepartment(id: string, request: BffUpdateDepartmentRequest): Promise<BffDepartmentDetailResponse>
  moveDepartment(id: string, request: BffMoveDepartmentRequest): Promise<BffDepartmentTreeResponse>
  deactivateDepartment(id: string): Promise<BffDepartmentDetailResponse>
  reactivateDepartment(id: string): Promise<BffDepartmentDetailResponse>
}
