/**
 * BffClient instance for project-profitability
 *
 * 開発時: MockBffClient
 * 本番時: HttpBffClient（コメントアウトを切り替え）
 */

import type { BffClient } from './BffClient'
import { MockBffClient } from './MockBffClient'
// import { HttpBffClient } from './HttpBffClient'

export const bffClient: BffClient = new MockBffClient()
// export const bffClient: BffClient = new HttpBffClient()
