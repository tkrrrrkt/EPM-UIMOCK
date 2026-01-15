export type { BffClient } from "./BffClient"
export * from "./BffClient"
export { MockBffClient } from "./MockBffClient"
export { HttpBffClient } from "./HttpBffClient"

import type { BffClient } from "./BffClient"
import { MockBffClient } from "./MockBffClient"
import { HttpBffClient } from "./HttpBffClient"

// Factory function
export function createBffClient(useMock = true): BffClient {
  if (useMock) {
    return new MockBffClient()
  }
  return new HttpBffClient()
}
