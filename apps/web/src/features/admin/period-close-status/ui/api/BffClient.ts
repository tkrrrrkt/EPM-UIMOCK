/**
 * BffClient Interface for Period Close Status
 *
 * UI → BFF の通信インターフェース定義
 * 実装は MockBffClient または HttpBffClient
 */

import type {
  BffListPeriodCloseStatusRequest,
  BffListPeriodCloseStatusResponse,
  BffSoftCloseRequest,
  BffHardCloseRequest,
  BffReopenRequest,
  BffCloseOperationResponse,
  BffFiscalYearListResponse,
  BffRunAllocationRequest,
  BffRunAllocationResponse,
} from '@epm/contracts/bff/period-close-status'

export interface BffClient {
  listPeriodCloseStatus(req: BffListPeriodCloseStatusRequest): Promise<BffListPeriodCloseStatusResponse>
  getFiscalYears(companyId: string): Promise<BffFiscalYearListResponse>
  softClose(req: BffSoftCloseRequest): Promise<BffCloseOperationResponse>
  hardClose(req: BffHardCloseRequest): Promise<BffCloseOperationResponse>
  reopen(req: BffReopenRequest): Promise<BffCloseOperationResponse>
  runAllocation(req: BffRunAllocationRequest): Promise<BffRunAllocationResponse>
}
