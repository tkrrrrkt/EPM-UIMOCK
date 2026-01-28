import type { BffClient } from './BffClient'
import { MockBffClient } from './MockBffClient'
import { HttpBffClient } from './HttpBffClient'

/**
 * BffClientファクトリ
 *
 * v0-workflow.md準拠:
 * - Phase UI-MOCK: MockBffClient使用
 * - Phase UI-BFF: HttpBffClient使用
 *
 * 環境変数で切り替え可能
 */
export function createBffClient(): BffClient {
  // Phase 1: MockBffClientを使用
  // Phase 2: 環境変数でHttpBffClientに切り替え
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_BFF !== 'false'

  if (useMock) {
    return new MockBffClient()
  }

  return new HttpBffClient()
}

// シングルトンインスタンス
let clientInstance: BffClient | null = null

export function getBffClient(): BffClient {
  if (!clientInstance) {
    clientInstance = createBffClient()
  }
  return clientInstance
}

// Re-export types
export type { BffClient } from './BffClient'
export { MockBffClient } from './MockBffClient'
export { HttpBffClient } from './HttpBffClient'
