import type {
  BffLayoutListRequest,
  BffLayoutListResponse,
  BffCreateLayoutRequest,
  BffUpdateLayoutRequest,
  BffCopyLayoutRequest,
  BffLayoutDetailResponse,
  BffLineListResponse,
  BffCreateLineRequest,
  BffUpdateLineRequest,
  BffMoveLineRequest,
  BffLineDetailResponse,
  BffSubjectSearchRequest,
  BffSubjectSearchResponse,
} from "@epm/contracts/bff/report-layout"

export interface BffClient {
  // Layout operations
  getLayouts(request: BffLayoutListRequest): Promise<BffLayoutListResponse>
  getLayoutDetail(id: string): Promise<BffLayoutDetailResponse>
  createLayout(request: BffCreateLayoutRequest): Promise<BffLayoutDetailResponse>
  updateLayout(id: string, request: BffUpdateLayoutRequest): Promise<BffLayoutDetailResponse>
  deactivateLayout(id: string): Promise<BffLayoutDetailResponse>
  reactivateLayout(id: string): Promise<BffLayoutDetailResponse>
  copyLayout(id: string, request: BffCopyLayoutRequest): Promise<BffLayoutDetailResponse>

  // Line operations
  getLines(layoutId: string): Promise<BffLineListResponse>
  getLineDetail(id: string): Promise<BffLineDetailResponse>
  createLine(layoutId: string, request: BffCreateLineRequest): Promise<BffLineDetailResponse>
  updateLine(id: string, request: BffUpdateLineRequest): Promise<BffLineDetailResponse>
  deleteLine(id: string): Promise<void>
  moveLine(id: string, request: BffMoveLineRequest): Promise<BffLineListResponse>

  // Subject search
  searchSubjects(request: BffSubjectSearchRequest): Promise<BffSubjectSearchResponse>
}
