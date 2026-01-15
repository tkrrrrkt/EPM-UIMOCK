import type {
  BffListDimensionsRequest,
  BffListDimensionsResponse,
  BffDimensionDetailResponse,
  BffCreateDimensionRequest,
  BffUpdateDimensionRequest,
  BffListDimensionValuesRequest,
  BffListDimensionValuesResponse,
  BffDimensionValueDetailResponse,
  BffCreateDimensionValueRequest,
  BffUpdateDimensionValueRequest,
} from '@epm/contracts/bff/dimension-master'

export interface BffClient {
  // Dimension endpoints
  listDimensions(req: BffListDimensionsRequest): Promise<BffListDimensionsResponse>
  getDimensionDetail(id: string): Promise<BffDimensionDetailResponse>
  createDimension(req: BffCreateDimensionRequest): Promise<BffDimensionDetailResponse>
  updateDimension(id: string, req: BffUpdateDimensionRequest): Promise<BffDimensionDetailResponse>
  deactivateDimension(id: string): Promise<BffDimensionDetailResponse>
  reactivateDimension(id: string): Promise<BffDimensionDetailResponse>

  // Dimension Value endpoints
  listDimensionValues(dimensionId: string, req: BffListDimensionValuesRequest): Promise<BffListDimensionValuesResponse>
  getDimensionValueDetail(dimensionId: string, valueId: string): Promise<BffDimensionValueDetailResponse>
  createDimensionValue(
    dimensionId: string,
    req: BffCreateDimensionValueRequest,
  ): Promise<BffDimensionValueDetailResponse>
  updateDimensionValue(
    dimensionId: string,
    valueId: string,
    req: BffUpdateDimensionValueRequest,
  ): Promise<BffDimensionValueDetailResponse>
  deactivateDimensionValue(dimensionId: string, valueId: string): Promise<BffDimensionValueDetailResponse>
  reactivateDimensionValue(dimensionId: string, valueId: string): Promise<BffDimensionValueDetailResponse>
}
