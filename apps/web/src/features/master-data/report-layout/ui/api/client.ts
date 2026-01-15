import { MockBffClient } from "./MockBffClient"
import { HttpBffClient } from "./HttpBffClient"
import type { BffClient } from "./BffClient"

// Switch between mock and real client
const USE_MOCK = true

export const bffClient: BffClient = USE_MOCK ? new MockBffClient() : new HttpBffClient()
