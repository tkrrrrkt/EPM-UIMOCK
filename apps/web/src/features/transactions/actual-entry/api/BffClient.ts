import type {
  BffActualGridRequest,
  BffActualGridResponse,
  BffActualContextResponse,
  BffUpdateActualCellRequest,
  BffUpdateActualCellResponse,
  BffUpdateActualCellsRequest,
  BffUpdateActualCellsResponse,
  BffActualBudgetCompareRequest,
  BffActualBudgetCompareResponse,
  BffActualForecastCompareRequest,
  BffActualForecastCompareResponse,
  BffSubjectListResponse,
} from "@epm/contracts/bff/actual-entry"

export interface ActualBffClient {
  // Grid operations
  getGrid(request: BffActualGridRequest): Promise<BffActualGridResponse>
  getContext(): Promise<BffActualContextResponse>
  updateCell(
    gridRequest: BffActualGridRequest,
    cellRequest: BffUpdateActualCellRequest
  ): Promise<BffUpdateActualCellResponse>
  updateCells(
    gridRequest: BffActualGridRequest,
    cellsRequest: BffUpdateActualCellsRequest
  ): Promise<BffUpdateActualCellsResponse>

  // Comparison
  getBudgetCompare(request: BffActualBudgetCompareRequest): Promise<BffActualBudgetCompareResponse>
  getForecastCompare(request: BffActualForecastCompareRequest): Promise<BffActualForecastCompareResponse>

  // Master data
  getSubjects(): Promise<BffSubjectListResponse>
}
