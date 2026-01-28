/**
 * BffClient Factory
 *
 * v0-workflow.md準拠: MockBffClient → HttpBffClient切替
 */

import type { BffClient } from './BffClient'
import { MockBffClient } from './MockBffClient'

// シングルトンインスタンス
let clientInstance: BffClient | null = null

/**
 * BffClient取得（シングルトン）
 */
export function getBffClient(): BffClient {
  if (!clientInstance) {
    clientInstance = createBffClient()
  }
  return clientInstance
}

/**
 * BffClient生成
 *
 * 環境変数やフラグで切替可能
 * Phase 1: MockBffClient
 * Phase 2: HttpBffClient
 */
export function createBffClient(): BffClient {
  // TODO: 環境変数で切替
  // if (process.env.NEXT_PUBLIC_USE_MOCK_API === 'false') {
  //   return new HttpBffClient()
  // }
  return new MockBffClient()
}

// Re-exports
export { MockBffClient } from './MockBffClient'
export type { BffClient } from './BffClient'
