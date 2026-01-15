export type { BffClient } from './BffClient'
export { MockBffClient } from './MockBffClient'
export { HttpBffClient } from './HttpBffClient'

import { MockBffClient } from './MockBffClient'
import type { BffClient } from './BffClient'

// Factory function - switch to HttpBffClient for production
export function createBffClient(): BffClient {
  // return new HttpBffClient()
  return new MockBffClient()
}

export const bffClient = createBffClient()
