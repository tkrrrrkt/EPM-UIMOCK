// API exports and client factory
import { MockBffClient } from "./MockBffClient"
import type { BffClient } from "./BffClient"

// Default to MockBffClient for now
// Switch to HttpBffClient when ready to connect to real BFF
export function createBffClient(): BffClient {
  // return new HttpBffClient();
  return new MockBffClient()
}

export { mockDepartments } from "./MockBffClient"
export type { BffClient } from "./BffClient"
