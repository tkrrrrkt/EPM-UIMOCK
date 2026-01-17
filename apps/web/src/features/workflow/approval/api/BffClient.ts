/**
 * BffClient Interface: approval (承認ワークフロー)
 *
 * SSoT: packages/contracts/src/bff/approval/index.ts
 */

import type {
  BffApprovalListRequest,
  BffApprovalListResponse,
  BffApprovalDetailResponse,
  BffApprovalCountResponse,
  BffApprovalActionRequest,
  BffApprovalActionResponse,
  BffApprovalHistoryResponse,
} from '@epm/contracts/bff/approval'

export interface BffClient {
  /** 承認待ち一覧を取得（自分が承認者の案件のみ） */
  listApprovals(request: BffApprovalListRequest): Promise<BffApprovalListResponse>

  /** 承認詳細を取得 */
  getApprovalDetail(id: string): Promise<BffApprovalDetailResponse>

  /** 承認待ち件数を取得（ヘッダ通知用） */
  getApprovalCount(): Promise<BffApprovalCountResponse>

  /** 提出（DRAFT → PENDING） */
  submitApproval(id: string, request: BffApprovalActionRequest): Promise<BffApprovalActionResponse>

  /** 承認（PENDING → PENDING/APPROVED） */
  approveApproval(id: string, request: BffApprovalActionRequest): Promise<BffApprovalActionResponse>

  /** 差戻し（PENDING → REJECTED） */
  rejectApproval(id: string, request: BffApprovalActionRequest): Promise<BffApprovalActionResponse>

  /** 取下げ（PENDING → WITHDRAWN） */
  withdrawApproval(id: string, request: BffApprovalActionRequest): Promise<BffApprovalActionResponse>

  /** 承認履歴を取得 */
  getApprovalHistory(statusId: string): Promise<BffApprovalHistoryResponse>
}
