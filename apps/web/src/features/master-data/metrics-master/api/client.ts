import { MockBffClient } from "./MockBffClient"
import type { BffClient } from "./BffClient"

// 現在はモッククライアントを使用
// 本番環境では HttpBffClient に切り替え
export const bffClient: BffClient = new MockBffClient()

// 本番用（コメントアウト）
// import { HttpBffClient } from "./HttpBffClient"
// export const bffClient: BffClient = new HttpBffClient()
