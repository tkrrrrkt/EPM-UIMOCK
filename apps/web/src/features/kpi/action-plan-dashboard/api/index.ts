import type { BffClient } from "./BffClient"
import { MockBffClient } from "./MockBffClient"
import { HttpBffClient } from "./HttpBffClient"

export type { BffClient }
export { MockBffClient, HttpBffClient }

// Factory function
export function createBffClient(useMock = true): BffClient {
  if (useMock) {
    return new MockBffClient()
  }
  return new HttpBffClient()
}
