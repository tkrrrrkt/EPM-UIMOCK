/**
 * BffClient Interface for Period Close Status
 *
 * UI → BFF の通信インターフェース定義
 * 実装は MockBffClient または HttpBffClient
 *
 * 締めステータス: OPEN / HARD_CLOSED の2段階（仮締め廃止）
 * 入力制御: input_locked フラグで管理
 */

import type {
  BffListPeriodCloseStatusRequest,
  BffListPeriodCloseStatusResponse,
  BffHardCloseRequest,
  BffReopenRequest,
  BffCloseOperationResponse,
  BffFiscalYearListResponse,
  BffRunAllocationRequest,
  BffRunAllocationResponse,
  // 配賦処理関連
  BffListAllocationEventsRequest,
  BffListAllocationEventsResponse,
  BffExecuteAllocationRequest,
  BffExecuteAllocationResponse,
  BffGetAllocationResultRequest,
  BffAllocationResultResponse,
  BffUnlockInputRequest,
  BffUnlockInputResponse,
} from '@epm/contracts/bff/period-close-status'

export interface BffClient {
  // 締め状況一覧・年度取得
  listPeriodCloseStatus(req: BffListPeriodCloseStatusRequest): Promise<BffListPeriodCloseStatusResponse>
  getFiscalYears(companyId: string): Promise<BffFiscalYearListResponse>
  // 締め処理（本締め・差し戻しのみ）
  hardClose(req: BffHardCloseRequest): Promise<BffCloseOperationResponse>
  reopen(req: BffReopenRequest): Promise<BffCloseOperationResponse>
  // レガシー配賦（将来削除予定）
  runAllocation(req: BffRunAllocationRequest): Promise<BffRunAllocationResponse>
  // 配賦処理（新API）
  listAllocationEvents(req: BffListAllocationEventsRequest): Promise<BffListAllocationEventsResponse>
  executeAllocation(req: BffExecuteAllocationRequest): Promise<BffExecuteAllocationResponse>
  getAllocationResult(req: BffGetAllocationResultRequest): Promise<BffAllocationResultResponse>
  unlockInput(req: BffUnlockInputRequest): Promise<BffUnlockInputResponse>
}
