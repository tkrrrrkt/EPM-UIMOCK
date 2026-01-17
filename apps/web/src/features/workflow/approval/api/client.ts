import type { BffClient } from './BffClient'
import { MockBffClient } from './MockBffClient'
// import { HttpBffClient } from './HttpBffClient'

// Currently using MockBffClient for development
// Switch to HttpBffClient when BFF endpoints are ready
export const bffClient: BffClient = new MockBffClient()
// export const bffClient: BffClient = new HttpBffClient()
