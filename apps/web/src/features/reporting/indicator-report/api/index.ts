// ============================================================
// API Barrel Export + Factory
// ============================================================

export type { BffClient } from "./BffClient"
export { MockBffClient, mockBffClient, bffClient } from "./MockBffClient"
export { httpBffClient } from "./HttpBffClient"

import type { BffClient } from "./BffClient"
import { MockBffClient } from "./MockBffClient"
import { httpBffClient } from "./HttpBffClient"

export function createBffClient(options?: {
  useMock?: boolean
  layoutConfigured?: boolean
}): BffClient {
  const useMock = options?.useMock ?? process.env.NODE_ENV !== "production"

  if (useMock) {
    return new MockBffClient({
      layoutConfigured: options?.layoutConfigured ?? true,
    })
  }

  return httpBffClient
}
