import type {
  BffGroupLayoutListRequest,
  BffGroupLayoutListResponse,
  BffGroupLayoutDetailResponse,
  BffCreateGroupLayoutRequest,
  BffUpdateGroupLayoutRequest,
  BffCopyGroupLayoutRequest,
  BffGroupLineListResponse,
  BffGroupLineDetailResponse,
  BffCreateGroupLineRequest,
  BffUpdateGroupLineRequest,
  BffMoveGroupLineRequest,
  BffGroupSubjectSearchRequest,
  BffGroupSubjectSearchResponse,
  BffGroupLayoutContextResponse,
} from "@epm/contracts/bff/group-report-layout"

export interface BffClient {
  // Context
  getContext(): Promise<BffGroupLayoutContextResponse>

  // Layout operations
  getLayouts(request: BffGroupLayoutListRequest): Promise<BffGroupLayoutListResponse>
  getLayoutDetail(id: string): Promise<BffGroupLayoutDetailResponse>
  createLayout(request: BffCreateGroupLayoutRequest): Promise<BffGroupLayoutDetailResponse>
  updateLayout(id: string, request: BffUpdateGroupLayoutRequest): Promise<BffGroupLayoutDetailResponse>
  deactivateLayout(id: string): Promise<BffGroupLayoutDetailResponse>
  reactivateLayout(id: string): Promise<BffGroupLayoutDetailResponse>
  setDefaultLayout(id: string): Promise<BffGroupLayoutDetailResponse>
  copyLayout(id: string, request: BffCopyGroupLayoutRequest): Promise<BffGroupLayoutDetailResponse>

  // Line operations
  getLines(layoutId: string): Promise<BffGroupLineListResponse>
  getLineDetail(id: string): Promise<BffGroupLineDetailResponse>
  createLine(layoutId: string, request: BffCreateGroupLineRequest): Promise<BffGroupLineDetailResponse>
  updateLine(id: string, request: BffUpdateGroupLineRequest): Promise<BffGroupLineDetailResponse>
  deleteLine(id: string): Promise<void>
  moveLine(id: string, request: BffMoveGroupLineRequest): Promise<BffGroupLineListResponse>

  // Group Subject search
  searchGroupSubjects(request: BffGroupSubjectSearchRequest): Promise<BffGroupSubjectSearchResponse>
}
