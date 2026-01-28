/**
 * KPI Action Plan Gantt - BFF Client Factory
 */

import type { BffClient } from './BffClient'
import { MockBffClient } from './MockBffClient'

let clientInstance: BffClient | null = null

/**
 * BffClient シングルトン取得
 *
 * 環境変数 NEXT_PUBLIC_USE_MOCK_BFF により切り替え可能
 */
export function getBffClient(): BffClient {
  if (!clientInstance) {
    // TODO: HttpBffClient 実装後に切り替え
    // const useMock = process.env.NEXT_PUBLIC_USE_MOCK_BFF === 'true'
    // clientInstance = useMock ? new MockBffClient() : new HttpBffClient()
    clientInstance = new MockBffClient()
  }
  return clientInstance
}

/**
 * テスト用: クライアントインスタンスをリセット
 */
export function resetBffClient(): void {
  clientInstance = null
}
