import type { BffClient } from './BffClient'
import { MockBffClient } from './MockBffClient'

// Factory function to get the appropriate BFF client
export function createBffClient(): BffClient {
  // TODO: When BFF is ready, return HttpBffClient based on environment
  // if (process.env.NEXT_PUBLIC_USE_MOCK_API !== 'true') {
  //   return new HttpBffClient()
  // }
  return new MockBffClient()
}
