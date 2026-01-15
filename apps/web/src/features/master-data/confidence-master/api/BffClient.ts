/**
 * BffClient Interface for Confidence Master
 *
 * UI -> BFF の通信インターフェース定義
 * 実装は MockBffClient または HttpBffClient
 */

import type {
  BffConfidenceLevelListRequest,
  BffConfidenceLevelListResponse,
  BffConfidenceLevelSaveRequest,
  BffConfidenceLevelSaveResponse,
  BffConfidenceLevelDeleteRequest,
} from '@epm/contracts/bff/confidence-master'

export interface BffClient {
  listConfidenceLevels(req: BffConfidenceLevelListRequest): Promise<BffConfidenceLevelListResponse>
  saveConfidenceLevels(req: BffConfidenceLevelSaveRequest): Promise<BffConfidenceLevelSaveResponse>
  deleteConfidenceLevel(req: BffConfidenceLevelDeleteRequest): Promise<{ success: boolean }>
}
