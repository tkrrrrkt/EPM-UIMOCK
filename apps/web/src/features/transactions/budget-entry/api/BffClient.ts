import type {
  BffBudgetGridRequest,
  BffBudgetGridResponse,
  BffBudgetContextResponse,
  BffUpdateCellRequest,
  BffUpdateCellResponse,
  BffUpdateCellsRequest,
  BffUpdateCellsResponse,
  BffBudgetCompareRequest,
  BffBudgetCompareResponse,
  BffHistoricalActualRequest,
  BffHistoricalActualResponse,
  BffSubjectListResponse,
  BffHistoricalCompareRequest,
  BffHistoricalCompareResponse,
} from "@epm/contracts/bff/budget-entry"

export interface BffClient {
  getGrid(request: BffBudgetGridRequest): Promise<BffBudgetGridResponse>
  getContext(): Promise<BffBudgetContextResponse>
  updateCell(
    gridRequest: BffBudgetGridRequest,
    cellRequest: BffUpdateCellRequest
  ): Promise<BffUpdateCellResponse>
  updateCells(
    gridRequest: BffBudgetGridRequest,
    cellsRequest: BffUpdateCellsRequest
  ): Promise<BffUpdateCellsResponse>
  getCompare(request: BffBudgetCompareRequest): Promise<BffBudgetCompareResponse>
  getHistoricalActuals(request: BffHistoricalActualRequest): Promise<BffHistoricalActualResponse>
  getSubjects(): Promise<BffSubjectListResponse>
  getHistoricalCompare(request: BffHistoricalCompareRequest): Promise<BffHistoricalCompareResponse>
}
