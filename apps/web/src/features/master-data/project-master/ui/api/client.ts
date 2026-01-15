// BFFクライアントシングルトン

import { MockBffClient } from "./MockBffClient"
import type { BffClient } from "./BffClient"

// 現在はモッククライアントを使用
// 本番環境ではHttpBffClientに切り替え
export const bffClient: BffClient = new MockBffClient()

// 切り替え例:
// export const bffClient: BffClient = new HttpBffClient();
