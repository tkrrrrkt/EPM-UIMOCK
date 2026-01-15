import { MockBffClient } from "./MockBffClient"
import { HttpBffClient } from "./HttpBffClient"

export type { BffClient } from "./BffClient"
export { MockBffClient } from "./MockBffClient"
export { HttpBffClient } from "./HttpBffClient"

// Factory function for production use
export function createBffClient(useMock = false) {
  if (useMock) {
    return new MockBffClient()
  }
  return new HttpBffClient()
}
