# EPM SaaS 開発プロセス完全ガイド

## CCSDD（Contract-Centered Specification Driven Development）× v0 × Cursor

---

## 本ドキュメントについて

本ドキュメントは、EPM SaaS の Feature 開発における**全 STEP を網羅した実践ガイド**です。

- **対象者**: 開発者、AI エージェント（Cursor / Claude）、レビュアー
- **目的**: 仕様駆動開発（SDD/CCSDD）を破綻なく実行するための手順書
- **原則**: Spec（仕様）が正、コードは従属

---

## 全体フロー概要

```
STEP 0: Steering 確認
    ↓
STEP 1: Requirements 作成
    ↓
STEP 2: Design 作成
    ↓
STEP 3: Design Review
    ↓
STEP 4: Tasks 作成
    ↓
STEP 5: Contracts 実装
    ↓
STEP 6: v0 Prompt 作成
    ↓
STEP 7: v0 実行 & UI 生成
    ↓
STEP 8: v0 ファイル取得
    ↓
STEP 9: Structure Guard 検証
    ↓
STEP 10: v0 → features 移植
    ↓
STEP 11: Backend 実装（API / BFF）
    ↓
STEP 12: 統合テスト & 完了
```

---

## STEP 0: Steering 確認

### 目的

開発開始前に、プロジェクト全体の「憲法」を確認し、守るべきルールを把握する。

### 実施者

- 開発者（人間）
- AI エージェント

### 入力

なし（プロジェクト参加時に必ず確認）

### 作業内容

以下の Steering ファイルを読み、内容を理解する：

| ファイル                                | 内容                     |
| --------------------------------------- | ------------------------ |
| `.kiro/steering/tech.md`                | 技術憲法・非交渉ルール   |
| `.kiro/steering/structure.md`           | 構造・責務分離ルール     |
| `.kiro/steering/product.md`             | プロダクト方針           |
| `.kiro/steering/v0-workflow.md`         | v0 隔離・受入・移植ルール|
| `.kiro/steering/development-process.md` | 開発プロセス憲法         |

### 出力

なし（理解の確認のみ）

### 完了条件

- 境界ルール（UI → BFF → API → DB）を理解
- v0 隔離ルールを理解
- Contracts-first 順序を理解

---

## STEP 1: Requirements 作成

### 目的

「何を実現するか」を曖昧さなく定義する。

### 実施者

- プロダクトオーナー / ビジネス担当
- AI エージェント（Kiro / Cursor）

### 入力

- 業務要求・ユーザーストーリー
- ドメイン知識

### 作業内容

1. `.kiro/specs/<context>/<feature>/` ディレクトリを作成
2. `requirements.md` を作成

### フォーマット

EARS（Easy Approach to Requirements Syntax）形式を使用：

```markdown
# Requirements: <Feature Name>

## 1. Overview
### 1.1 Purpose
[この機能の目的]

### 1.2 Scope
[スコープ内・スコープ外]

## 2. Functional Requirements

### 2.1 <Requirement Title>
When [condition], the system shall [action].

### 2.2 <Requirement Title>
Given [precondition], when [trigger], then [outcome].

## 3. Non-Functional Requirements

### 3.1 Performance
[レスポンス時間、同時接続数など]

### 3.2 Security
[認可、監査など]
```

### 出力

- `.kiro/specs/<context>/<feature>/requirements.md`

### 完了条件

- 全ての業務要求が網羅されている
- 各要件に一意の ID（2.1, 2.2 など）が付与されている
- UI・技術詳細は書かれていない

---

## STEP 2: Design 作成

### 目的

**UI より先に Contract と責務境界を確定する**

### 実施者

- AI エージェント（Kiro / Cursor）
- アーキテクト

### 入力

- `requirements.md`
- Steering ファイル（tech.md, structure.md）
- 既存の Contracts（参考）

### 作業内容

1. `design.md` を作成
2. `packages/contracts/` に DTO/Error を定義

### design.md 必須セクション

```markdown
# Design: <Feature Name>

## 1. Overview
[設計概要]

## 2. Architecture Pattern
[4層アーキテクチャの責務]

## 3. Contracts Summary

### 3.1 BFF Contracts
| Endpoint | Method | Request DTO | Response DTO |
|----------|--------|-------------|--------------|

### 3.2 API Contracts
| Endpoint | Method | Request DTO | Response DTO |
|----------|--------|-------------|--------------|

### 3.3 Error Codes
| Code | HTTP Status | Description |
|------|-------------|-------------|

## 4. Architecture Responsibilities

### 4.1 BFF Layer
- 責務: [UI最適化、集約、変換]
- Error Policy: [Pass-through / Minimal shaping]
- Paging: page/pageSize → offset/limit 変換

### 4.2 Domain API Layer
- 責務: [ビジネスロジック、権限判断]
- tenant_id: 必須

### 4.3 Repository Layer
- 責務: [DB アクセス、RLS 連携]
- tenant_id double-guard: 必須

## 5. Data Model
[Prisma Schema / ER図]

## 6. Requirements Traceability
| Requirement | Components | Interfaces |
|-------------|------------|------------|
```

### design.md 必須記載事項（省略禁止）

- DTO 命名: camelCase
- DB カラム: snake_case
- sortBy: DTO キー名を使用
- Error Policy: Pass-through または Minimal shaping を選択
- Paging 正規化: BFF で page/pageSize → offset/limit 変換

### 出力

- `.kiro/specs/<context>/<feature>/design.md`
- `packages/contracts/src/bff/<feature>/index.ts`
- `packages/contracts/src/api/<feature>/index.ts`
- `packages/contracts/src/api/errors/<feature>-error.ts`

### 完了条件

- 全ての Requirements が Contracts にマッピングされている
- BFF/API/Repository の責務が明確
- Error Policy が選択されている

---

## STEP 3: Design Review

### 目的

設計品質を確認し、実装可否を判断する。

### 実施者

- レビュアー（人間 / AI）
- 設計者

### 入力

- `requirements.md`
- `design.md`
- Steering ファイル

### 作業内容

設計レビューを実施し、GO/NO-GO を判断する。

### レビュー観点

1. **既存アーキテクチャとの整合性**
2. **設計の一貫性と標準準拠**
3. **拡張性と保守性**
4. **型安全性とインターフェース設計**

### 出力フォーマット

```markdown
# Design Review: <Feature Name>

## Summary
[2-3文で全体評価]

## Critical Issues (≤3)

### Issue 1: [タイトル]
- **Concern**: [問題点]
- **Impact**: [影響]
- **Suggestion**: [改善案]
- **Traceability**: [要件ID]
- **Evidence**: [design.md のセクション]

## Strengths
- [良い点1]
- [良い点2]

## Final Assessment
- **Decision**: GO / NO-GO
- **Rationale**: [理由]
- **Next Steps**: [次のアクション]
```

### 出力

- `.kiro/specs/<context>/<feature>/design-review.md`

### 完了条件

- Critical Issues が 3 件以下
- GO 判定の場合のみ次 STEP へ進む
- NO-GO の場合は STEP 2 へ戻り design.md を修正

---

## STEP 4: Tasks 作成

### 目的

実装手順を明確化し、Gate を設定する。

### 実施者

- AI エージェント（Kiro / Cursor）

### 入力

- `requirements.md`
- `design.md`
- `design-review.md`（GO 判定済み）

### 作業内容

`tasks.md` を作成する。

### tasks.md 必須順序（Contracts-first / 逸脱禁止）

```markdown
# Tasks: <Feature Name>

## Design Completeness Gate
- [ ] design.md が完成している
- [ ] design-review.md で GO 判定されている
- [ ] Contracts が定義されている

## 1. Decisions
- [ ] 1.1 技術選定・方針決定

## 2. Contracts（bff → api → shared）
- [ ] 2.1 BFF Contracts 実装
- [ ] 2.2 API Contracts 実装
- [ ] 2.3 Shared types（必要な場合）

## 3. DB / Migration / RLS
- [ ] 3.1 Prisma Schema 更新
- [ ] 3.2 Migration 実行
- [ ] 3.3 RLS Policy 確認

## 4. Domain API（apps/api）
- [ ] 4.1 Repository 実装
- [ ] 4.2 Service 実装
- [ ] 4.3 Controller 実装
- [ ] 4.4 Module 登録

## 5. BFF（apps/bff）
- [ ] 5.1 Mapper 実装
- [ ] 5.2 Service 実装
- [ ] 5.3 Controller 実装
- [ ] 5.4 Module 登録

## 6. UI（apps/web）
- [ ] 6.1 v0 Prompt 作成
- [ ] 6.2 v0 実行
- [ ] 6.3 Structure Guard 検証
- [ ] 6.4 features 移植
- [ ] 6.5 HttpBffClient 接続
```

### タスク記述ルール

- 自然言語で機能・成果を記述（ファイルパスは書かない）
- 各タスクに `_Requirements: X.X_` でトレーサビリティを記載
- 並列可能なタスクには `(P)` マーカーを付与

### 出力

- `.kiro/specs/<context>/<feature>/tasks.md`

### 完了条件

- 全 Requirements がタスクにマッピングされている
- Contracts-first 順序が守られている
- Design Completeness Gate が設定されている

---

## STEP 5: Contracts 実装

### 目的

UI/BFF/API 間の契約を先に確定する。

### 実施者

- AI エージェント（Cursor）

### 入力

- `design.md`
- `tasks.md`

### 作業内容

1. BFF Contracts を実装
2. API Contracts を実装
3. Error Codes を実装

### 実装順序（必須）

```
packages/contracts/src/bff/<feature>/index.ts    # ← 最初
packages/contracts/src/api/<feature>/index.ts
packages/contracts/src/api/errors/<feature>-error.ts
packages/contracts/src/api/errors/index.ts       # ← export 追加
```

### BFF DTO 例

```typescript
// packages/contracts/src/bff/<feature>/index.ts

export interface List<Feature>Request {
  page?: number           // UI向け（1-based）
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface List<Feature>Response {
  items: <Feature>ListItem[]
  totalCount: number
  page: number
  pageSize: number
}
```

### API DTO 例

```typescript
// packages/contracts/src/api/<feature>/index.ts

export interface List<Feature>ApiRequest {
  offset?: number        // API向け（0-based）
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface List<Feature>ApiResponse {
  items: <Feature>ApiItem[]
  total: number
  offset: number
  limit: number
}
```

### 出力

- `packages/contracts/src/bff/<feature>/index.ts`
- `packages/contracts/src/api/<feature>/index.ts`
- `packages/contracts/src/api/errors/<feature>-error.ts`

### 完了条件

- BFF DTO と API DTO の差異が明確
- Error Codes が定義されている
- index.ts から正しく export されている

---

## STEP 6: v0 Prompt 作成

### 目的

v0 に渡すプロンプトを作成する。

### 実施者

- AI エージェント（Cursor）

### 入力

- `design.md`
- `packages/contracts/src/bff/<feature>/`
- `.kiro/steering/v0-prompt-template.md`

### 作業内容

1. v0 Prompt Template を埋める
2. `v0-prompt.md` として保存

### v0 Prompt 必須セクション

```markdown
# v0 Prompt: <Feature Name>

## Context
EPM SaaS の <feature> 画面を生成する。

## Non-Negotiable Rules
- UI は BFF のみを呼び出す（Domain API 直接呼び出し禁止）
- UI は `packages/contracts/src/bff` の DTO のみ使用
- `packages/contracts/src/api` の参照禁止
- 業務ロジックは UI に持たない

## Feature
<feature-name>: <短い説明>

## Screens to build
- <screen-1>: [目的、主な操作]

## BFF Specification

### Endpoints
| Method | Endpoint | Purpose | Request DTO | Response DTO |
|--------|----------|---------|-------------|--------------|

### DTOs
[BFF DTO の内容をコピー]

## Design System
Use the EPM Design System from: https://epm-registry-xxx.vercel.app

## Output Requirements
1. `page.tsx` のみ生成（layout.tsx 禁止）
2. `BffClient` interface
3. `MockBffClient` 実装
4. `HttpBffClient` 雛形

## Output Path
apps/web/_v0_drop/<context>/<feature>/src
```

### 禁止事項の明記（必須）

- layout.tsx 生成禁止
- 生カラーリテラル禁止（`bg-[#...]` など）
- 直接 fetch 禁止（HttpBffClient 経由のみ）
- 基盤 UI コンポーネント作成禁止

### 出力

- `.kiro/specs/<context>/<feature>/v0-prompt.md`

### 完了条件

- BFF Specification が完全に記載されている
- 禁止事項が明記されている
- Design System 参照が設定されている

---

## STEP 7: v0 実行 & UI 生成

### 目的

v0 で UI を高速生成する。

### 実施者

- 開発者（人間）

### 入力

- `v0-prompt.md`

### 作業内容

1. v0.dev にアクセス
2. `v0-prompt.md` の内容を貼り付け
3. 生成されたコードを確認
4. 必要に応じて修正を依頼

### v0 操作手順

```
1. https://v0.dev にアクセス
2. 新規チャットを開始
3. v0-prompt.md の内容を貼り付け
4. 生成結果を確認
5. 問題があれば追加指示で修正
6. 完成したら URL を控える
```

### 確認ポイント

- [ ] `page.tsx` が生成されている
- [ ] `BffClient` interface がある
- [ ] `MockBffClient` がある
- [ ] `HttpBffClient` 雛形がある
- [ ] layout.tsx が生成されていない
- [ ] 生カラーリテラルがない

### 出力

- v0 生成コード（v0.dev 上）
- v0 Chat URL

### 完了条件

- 必要な画面が生成されている
- 禁止事項に違反していない

---

## STEP 8: v0 ファイル取得

### 目的

v0 生成物をローカルの隔離ゾーンに取得する。

### 実施者

- 開発者（人間）
- スクリプト

### 入力

- v0 Chat URL
- Feature パス（`<context>/<feature>`）

### 作業内容

```bash
# 方法1: v0-fetch.sh スクリプト
./scripts/v0-fetch.sh '<v0_url>' '<context>/<feature>'

# 方法2: 手動
cd apps/web
npx v0 add '<v0_url>'
# → 生成されたファイルを _v0_drop に移動
```

### v0-fetch.sh の動作

1. v0 から npx v0 add でコンポーネント取得
2. `apps/web/_v0_drop/<context>/<feature>/src/` に格納
3. `OUTPUT.md` テンプレートを生成

### 出力先（隔離ゾーン）

```
apps/web/_v0_drop/<context>/<feature>/src/
├── components/
│   └── <Component>.tsx
├── api/
│   ├── BffClient.ts
│   ├── MockBffClient.ts
│   └── HttpBffClient.ts
├── page.tsx
└── OUTPUT.md
```

### 出力

- `apps/web/_v0_drop/<context>/<feature>/src/` 配下のファイル
- `OUTPUT.md`（移植ガイド）

### 完了条件

- 全ファイルが `_v0_drop` に格納されている
- `apps/web/src` には何も書かれていない

---

## STEP 9: Structure Guard 検証

### 目的

ルール違反を自動検出する。

### 実施者

- スクリプト
- 開発者（確認）

### 入力

- `apps/web/_v0_drop/<context>/<feature>/src/`

### 作業内容

```bash
npx tsx scripts/structure-guards.ts
```

### 検出内容

| 違反                           | 説明                                     |
| ------------------------------ | ---------------------------------------- |
| UI → Domain API 直接呼び出し   | `/api/...` への直接アクセス              |
| UI direct fetch                | HttpBffClient 外での fetch()             |
| UI による api 契約参照         | `contracts/src/api` の import            |
| BFF の DB 直アクセス           | BFF から Prisma 直接使用                 |
| layout.tsx 存在                | 禁止されたファイル                       |
| 生カラーリテラル               | `bg-[#...]`, `text-[#...]` など          |

### 違反発見時の対応

1. 該当ファイルを手動修正
2. 再度 `structure-guards.ts` を実行
3. 全 PASS するまで繰り返す

### 出力

- Guard 結果（PASS / FAIL）
- 違反箇所のリスト

### 完了条件

- 全 Guard が PASS
- 違反が 0 件

---

## STEP 10: v0 → features 移植

### 目的

検証済みの v0 生成物を本実装ディレクトリに移植する。

### 実施者

- 開発者（人間）
- AI エージェント（Cursor）

### 入力

- `apps/web/_v0_drop/<context>/<feature>/src/`
- Structure Guard PASS

### 作業内容

```bash
# 方法1: v0-migrate.ts スクリプト
npx tsx scripts/v0-migrate.ts <context> <feature>

# 方法2: 手動移動
mv apps/web/_v0_drop/<context>/<feature>/src \
   apps/web/src/features/<context>/<feature>
```

### 移植後の修正（必須）

1. **import パス修正**
   ```typescript
   // Before
   import { Button } from "./components/button"

   // After
   import { Button } from "@/shared/ui"
   ```

2. **DTO import 修正**
   ```typescript
   // Before (v0 生成の仮定義)
   interface Employee { ... }

   // After
   import type { EmployeeMasterListItem } from "@contracts/bff/employee-master"
   ```

3. **App Router 登録**
   ```typescript
   // apps/web/src/app/<context>/<feature>/page.tsx
   import Page from '@/features/<context>/<feature>/page'
   export default Page
   ```

4. **Navigation 登録**
   ```typescript
   // apps/web/src/shared/navigation/menu.ts
   {
     id: '<feature>',
     label: '<Label>',
     labelJa: '<日本語ラベル>',
     path: '/<context>/<feature>',
     icon: <IconComponent>,
   }
   ```

### 出力

- `apps/web/src/features/<context>/<feature>/`
- `apps/web/src/app/<context>/<feature>/page.tsx`
- `apps/web/src/shared/navigation/menu.ts`（更新）

### 完了条件

- ファイルが `features/` に移植されている
- import パスが修正されている
- ルーティングが登録されている
- Navigation メニューに追加されている
- MockBffClient で画面が動作する

---

## STEP 11: Backend 実装（API / BFF）

### 目的

Domain API と BFF を実装し、実データで動作させる。

### 実施者

- AI エージェント（Cursor）

### 入力

- `design.md`
- `tasks.md`
- `packages/contracts/`

### 作業内容

実装順序（必須）：

### 11.1 Prisma Schema 更新

```prisma
// packages/db/prisma/schema.prisma

model <Feature> {
  id         String   @id @default(cuid())
  tenant_id  String
  // ... 他のフィールド

  @@index([tenant_id])
}
```

### 11.2 Migration 実行

```bash
DATABASE_URL="..." npx prisma db push
# または
DATABASE_URL="..." npx prisma migrate dev --name add_<feature>
```

### 11.3 Domain API Repository

```typescript
// apps/api/src/modules/<context>/<feature>/<feature>.repository.ts

@Injectable()
export class <Feature>Repository {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, params: List<Feature>ApiRequest) {
    // tenant_id double-guard: WHERE 句で必ずフィルタ
    return this.prisma.<feature>.findMany({
      where: { tenant_id: tenantId },
      skip: params.offset,
      take: params.limit,
    })
  }
}
```

### 11.4 Domain API Service

```typescript
// apps/api/src/modules/<context>/<feature>/<feature>.service.ts

@Injectable()
export class <Feature>Service {
  constructor(private repository: <Feature>Repository) {}

  async list(tenantId: string, params: List<Feature>ApiRequest) {
    // ビジネスロジック・検証
    return this.repository.findAll(tenantId, params)
  }
}
```

### 11.5 Domain API Controller

```typescript
// apps/api/src/modules/<context>/<feature>/<feature>.controller.ts

@Controller('<context>/<feature>')
export class <Feature>Controller {
  constructor(private service: <Feature>Service) {}

  @Get()
  async list(
    @Headers('x-tenant-id') tenantId: string,
    @Query() params: List<Feature>ApiRequest,
  ) {
    return this.service.list(tenantId, params)
  }
}
```

### 11.6 BFF Mapper

```typescript
// apps/bff/src/modules/<context>/<feature>/mappers/<feature>.mapper.ts

export function mapApiToBff(
  apiResponse: List<Feature>ApiResponse,
  page: number,
  pageSize: number,
): List<Feature>Response {
  return {
    items: apiResponse.items.map(mapItemApiToBff),
    totalCount: apiResponse.total,
    page,
    pageSize,
  }
}
```

### 11.7 BFF Service

```typescript
// apps/bff/src/modules/<context>/<feature>/<feature>.service.ts

@Injectable()
export class <Feature>BffService {
  constructor(private apiClient: DomainApiClient) {}

  async list(tenantId: string, params: List<Feature>Request) {
    // page/pageSize → offset/limit 変換
    const offset = ((params.page || 1) - 1) * (params.pageSize || 50)
    const limit = params.pageSize || 50

    const apiResponse = await this.apiClient.list(tenantId, {
      offset,
      limit,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    })

    return mapApiToBff(apiResponse, params.page || 1, limit)
  }
}
```

### 11.8 BFF Controller

```typescript
// apps/bff/src/modules/<context>/<feature>/<feature>.controller.ts

@Controller('bff/<context>/<feature>')
export class <Feature>BffController {
  constructor(private service: <Feature>BffService) {}

  @Get()
  async list(
    @Headers('x-tenant-id') tenantId: string,
    @Query() params: List<Feature>Request,
  ) {
    return this.service.list(tenantId, params)
  }
}
```

### 11.9 HttpBffClient 接続

```typescript
// apps/web/src/features/<context>/<feature>/api/HttpBffClient.ts

export class HttpBffClient implements BffClient {
  private baseUrl = '/api/bff/<context>/<feature>'

  async list(params: List<Feature>Request): Promise<List<Feature>Response> {
    const response = await fetch(`${this.baseUrl}?${new URLSearchParams(...)}`, {
      headers: {
        'x-tenant-id': '<tenant-id>',  // TODO: 認証から取得
        'x-user-id': '<user-id>',
      },
    })
    return response.json()
  }
}
```

### 11.10 UI で HttpBffClient に切替

```typescript
// apps/web/src/features/<context>/<feature>/page.tsx

// Before
const bffClient = new MockBffClient()

// After
const bffClient = new HttpBffClient()
```

### 出力

- `apps/api/src/modules/<context>/<feature>/`
- `apps/bff/src/modules/<context>/<feature>/`
- `packages/db/prisma/schema.prisma`（更新）

### 完了条件

- DB にデータが保存できる
- API エンドポイントが動作する
- BFF エンドポイントが動作する
- UI が実データを表示する

---

## STEP 12: 統合テスト & 完了

### 目的

全レイヤーが正しく連携することを確認する。

### 実施者

- 開発者（人間）
- AI エージェント

### 入力

- 実装済みコード
- `requirements.md`

### 作業内容

### 12.1 手動テスト

```bash
# 1. API サーバー起動
pnpm run build:api && node dist/apps/api/src/main.js

# 2. BFF サーバー起動（別ターミナル）
pnpm run build:bff && node dist/apps/bff/src/main.js

# 3. Web 起動（別ターミナル）
cd apps/web && pnpm dev
```

### 12.2 API テスト（curl）

```bash
# 一覧取得
curl -H "x-tenant-id: tenant-001" \
     "http://localhost:3002/<context>/<feature>"

# 作成
curl -X POST -H "Content-Type: application/json" \
     -H "x-tenant-id: tenant-001" \
     -d '{"field": "value"}' \
     "http://localhost:3002/<context>/<feature>"
```

### 12.3 BFF テスト（curl）

```bash
# 一覧取得（BFF 経由）
curl -H "x-tenant-id: tenant-001" \
     "http://localhost:3001/bff/<context>/<feature>?page=1&pageSize=50"
```

### 12.4 DB 確認

```bash
docker exec -it <container> psql -U postgres -d epm_trial
SELECT * FROM "<Feature>" WHERE tenant_id = 'tenant-001';
```

### 12.5 チェックリスト

- [ ] CRUD 全操作が動作する
- [ ] tenant_id によるフィルタが効いている
- [ ] エラーハンドリングが正しい
- [ ] ページネーションが動作する
- [ ] ソートが動作する
- [ ] 検索が動作する

### 出力

- テスト結果レポート
- tasks.md の完了マーク

### 完了条件

- 全 Requirements が実装されている
- 全テストが PASS
- tasks.md の全タスクが完了

---

## 参考: スクリプト一覧

| スクリプト                      | 用途                           |
| ------------------------------- | ------------------------------ |
| `scripts/scaffold-feature.ts`   | Feature 骨格生成               |
| `scripts/structure-guards.ts`   | 境界違反検出                   |
| `scripts/v0-fetch.sh`           | v0 生成物取得                  |
| `scripts/v0-integrate.sh`       | v0 取得 + 検証 + 移植 (一括)   |
| `scripts/v0-migrate.ts`         | v0_drop → features 移植        |

---

## 参考: ディレクトリ構造

```
repo/
├── .kiro/
│   ├── steering/           # プロジェクト憲法
│   │   ├── tech.md
│   │   ├── structure.md
│   │   ├── product.md
│   │   ├── v0-workflow.md
│   │   ├── v0-prompt-template.md
│   │   └── development-process.md
│   │
│   ├── settings/
│   │   ├── rules/          # レビュー・生成ルール
│   │   └── templates/      # テンプレート
│   │
│   └── specs/              # Feature 仕様
│       └── <context>/<feature>/
│           ├── requirements.md
│           ├── design.md
│           ├── design-review.md
│           ├── tasks.md
│           └── v0-prompt.md
│
├── packages/
│   ├── contracts/          # 契約 SSoT
│   │   └── src/
│   │       ├── bff/        # UI → BFF 契約
│   │       ├── api/        # BFF → API 契約
│   │       └── shared/     # 共通定義
│   │
│   └── db/                 # DB スキーマ
│       └── prisma/
│
├── apps/
│   ├── api/                # Domain API
│   ├── bff/                # BFF
│   └── web/                # Frontend
│       ├── _v0_drop/       # v0 隔離ゾーン
│       └── src/
│           ├── features/   # Feature 実装
│           └── shared/     # 共通 UI
│
└── scripts/                # 自動化スクリプト
```

---

## 最重要原則（再掲）

1. **Spec が正、コードは従属**
2. **Contracts-first**: UI より先に契約を確定
3. **v0 は隔離**: 直接 src に入れない
4. **境界を守る**: UI → BFF → API → DB
5. **tenant_id double-guard**: Repository + RLS
6. **判断は ADR に残す**

---

## 付録: Cursor / Kiro への指示プロンプト集

各 STEP で AI エージェント（Cursor / Kiro / Claude）に指示する際のプロンプト例。

---

### A. Spec ディレクトリ初期化

**使用タイミング**: 新しい Feature の開発を開始する時

```
新しい Feature「<feature-name>」の Spec ディレクトリを作成してください。

Context: <context>（例: master-data, transactions, reporting）
Feature: <feature>（例: employee-master, budget-entry）

以下のファイルを作成:
1. .kiro/specs/<context>/<feature>/requirements.md（空テンプレート）

テンプレートは .kiro/settings/templates/specs/requirements.md を参照してください。
```

---

### B. Requirements 作成

**使用タイミング**: STEP 1 - 要件定義

```
<feature-name> の requirements.md を作成してください。

## 業務要求
<ここに業務要求を記載>

## 指示
1. EARS 形式（When/If/While/Where/The system shall）で記述
2. 各要件に一意の ID（1.1, 1.2, 2.1, 2.2...）を付与
3. UI・技術詳細は書かない（業務視点のみ）
4. Acceptance Criteria を明確に記載

## 参照ファイル
- .kiro/settings/templates/specs/requirements.md
- .kiro/settings/rules/ears-format.md
- .kiro/steering/product.md

## 出力先
.kiro/specs/<context>/<feature>/requirements.md
```

---

### C. Design 作成

**使用タイミング**: STEP 2 - 設計

```
<feature-name> の design.md を作成してください。

## 入力
- .kiro/specs/<context>/<feature>/requirements.md

## 指示
1. Architecture Responsibilities を必ず埋める（省略禁止）:
   - BFF Specification（Endpoints, Paging正規化, Error Policy）
   - Service Specification（Transaction境界, 監査ポイント）
   - Repository Specification（tenant_id double-guard）
2. Contracts Summary を記載（bff/api の DTO 一覧）
3. 以下を必ず明記（省略禁止）:
   - DTO 命名: camelCase
   - DB カラム: snake_case
   - sortBy: DTO キー名を使用
   - Error Policy: Pass-through または Minimal shaping を選択
   - Paging 正規化: BFF で page/pageSize → offset/limit 変換
4. Requirements Traceability を記載

## 参照ファイル
- .kiro/settings/templates/specs/design.md
- .kiro/settings/rules/design-principles.md
- .kiro/steering/tech.md
- .kiro/steering/structure.md

## 出力先
.kiro/specs/<context>/<feature>/design.md
```

---

### D. Design Review 実施

**使用タイミング**: STEP 3 - 設計レビュー

```
<feature-name> の設計レビューを実施してください。

## 入力
- .kiro/specs/<context>/<feature>/requirements.md
- .kiro/specs/<context>/<feature>/design.md

## 指示
1. 以下の観点でレビュー:
   - 既存アーキテクチャとの整合性
   - 設計の一貫性と標準準拠
   - 拡張性と保守性
   - 型安全性とインターフェース設計
2. Critical Issues は最大 3 件に絞る
3. 各 Issue に Traceability（要件ID）と Evidence（design.md のセクション）を記載
4. GO / NO-GO を明確に判定

## 参照ファイル
- .kiro/settings/rules/design-review.md
- .kiro/steering/tech.md
- .kiro/steering/structure.md

## 出力フォーマット
# Design Review: <Feature Name>

## Summary
[2-3文で全体評価]

## Critical Issues (≤3)
### Issue 1: [タイトル]
- **Concern**: [問題点]
- **Impact**: [影響]
- **Suggestion**: [改善案]
- **Traceability**: [要件ID]
- **Evidence**: [design.md のセクション]

## Strengths
- [良い点1]
- [良い点2]

## Final Assessment
- **Decision**: GO / NO-GO
- **Rationale**: [理由]
- **Next Steps**: [次のアクション]

## 出力先
.kiro/specs/<context>/<feature>/design-review.md
```

---

### E. Tasks 作成

**使用タイミング**: STEP 4 - タスク分解（Design Review で GO 判定後）

```
<feature-name> の tasks.md を作成してください。

## 入力
- .kiro/specs/<context>/<feature>/requirements.md
- .kiro/specs/<context>/<feature>/design.md
- .kiro/specs/<context>/<feature>/design-review.md（GO 判定済み）

## 指示
1. 必ず以下の順序でタスクを記載（Contracts-first / 逸脱禁止）:
   - 0. Design Completeness Gate
   - 1. Decisions
   - 2. Contracts（bff → api → shared）
   - 3. DB / Migration / RLS
   - 4. Domain API（apps/api）
   - 5. BFF（apps/bff）
   - 6. UI（apps/web）
2. 各タスクに _Requirements: X.X_ でトレーサビリティを記載
3. 並列可能なタスクには (P) マーカーを付与
4. 自然言語で機能・成果を記述（ファイルパスは書かない）

## 参照ファイル
- .kiro/settings/templates/specs/tasks.md
- .kiro/settings/rules/tasks-generation.md
- .kiro/steering/structure.md

## 出力先
.kiro/specs/<context>/<feature>/tasks.md
```

---

### F. Contracts 実装

**使用タイミング**: STEP 5 - 契約実装

```
<feature-name> の Contracts を実装してください。

## 入力
- .kiro/specs/<context>/<feature>/design.md

## 指示
1. 実装順序（必須）:
   - packages/contracts/src/bff/<feature>/index.ts（最初）
   - packages/contracts/src/api/<feature>/index.ts
   - packages/contracts/src/api/errors/<feature>-error.ts
   - packages/contracts/src/api/errors/index.ts（export 追加）
2. BFF DTO: page/pageSize（1-based）
3. API DTO: offset/limit（0-based）
4. Error Codes を定義

## 参照ファイル
- .kiro/specs/<context>/<feature>/design.md（Contracts Summary）
- packages/contracts/src/bff/（既存の参考）
- packages/contracts/src/api/（既存の参考）
```

---

### G. v0 Prompt 作成

**使用タイミング**: STEP 6 - v0 プロンプト作成

```
<feature-name> の v0-prompt.md を作成してください。

## 入力
- .kiro/specs/<context>/<feature>/design.md
- packages/contracts/src/bff/<feature>/index.ts
- .kiro/steering/v0-prompt-template.md

## 指示
1. v0-prompt-template.md の <...> を埋める
2. BFF Specification を完全に記載
3. 禁止事項を明記:
   - layout.tsx 生成禁止
   - 生カラーリテラル禁止
   - 直接 fetch 禁止
   - 基盤 UI コンポーネント作成禁止
4. Design System 参照を設定

## 出力先
.kiro/specs/<context>/<feature>/v0-prompt.md
```

---

### H. Backend 実装（Domain API）

**使用タイミング**: STEP 11 - Domain API 実装

```
<feature-name> の Domain API を実装してください。

## 入力
- .kiro/specs/<context>/<feature>/design.md
- .kiro/specs/<context>/<feature>/tasks.md
- packages/contracts/src/api/<feature>/index.ts

## 指示
1. 実装順序:
   - Repository（tenant_id double-guard 必須）
   - Service（ビジネスロジック）
   - Controller（REST エンドポイント）
   - Module（NestJS 登録）
2. 全メソッドで tenant_id を WHERE 句に含める
3. Error は contracts/api/errors を使用

## 出力先
apps/api/src/modules/<context>/<feature>/
├── <feature>.repository.ts
├── <feature>.service.ts
├── <feature>.controller.ts
└── <feature>.module.ts
```

---

### I. Backend 実装（BFF）

**使用タイミング**: STEP 11 - BFF 実装

```
<feature-name> の BFF を実装してください。

## 入力
- .kiro/specs/<context>/<feature>/design.md
- .kiro/specs/<context>/<feature>/tasks.md
- packages/contracts/src/bff/<feature>/index.ts
- packages/contracts/src/api/<feature>/index.ts

## 指示
1. 実装順序:
   - Mapper（api DTO ↔ bff DTO 変換）
   - Domain API Client（HTTP クライアント）
   - Service（page/pageSize → offset/limit 変換）
   - Controller（BFF エンドポイント）
   - Module（NestJS 登録）
2. page/pageSize → offset/limit 変換を Service で実施
3. Error Policy: design.md で選択した方針に従う

## 出力先
apps/bff/src/modules/<context>/<feature>/
├── mappers/<feature>.mapper.ts
├── domain-api.client.ts
├── <feature>.service.ts
├── <feature>.controller.ts
└── <feature>.module.ts
```

---

### J. HttpBffClient 接続

**使用タイミング**: STEP 11 - UI と BFF の接続

```
<feature-name> の UI を HttpBffClient に接続してください。

## 入力
- apps/web/src/features/<context>/<feature>/api/HttpBffClient.ts
- apps/web/src/features/<context>/<feature>/page.tsx

## 指示
1. HttpBffClient に以下を実装:
   - baseUrl を設定
   - x-tenant-id, x-user-id ヘッダーを追加（MVP: ハードコード可）
   - 各メソッドで fetch + JSON パース
2. page.tsx で MockBffClient → HttpBffClient に切替
3. BFF サーバーが動作することを確認

## 出力
- HttpBffClient が実装済み
- page.tsx が HttpBffClient を使用
```

---

### K. コードレビュー依頼

**使用タイミング**: 実装完了後

```
<feature-name> の実装をレビューしてください。

## レビュー対象
- packages/contracts/src/bff/<feature>/
- packages/contracts/src/api/<feature>/
- apps/api/src/modules/<context>/<feature>/
- apps/bff/src/modules/<context>/<feature>/
- apps/web/src/features/<context>/<feature>/

## レビュー観点
1. 境界ルール違反がないか
   - UI → BFF → API → DB の順序
   - UI が contracts/api を参照していないか
2. tenant_id double-guard が全 Repository メソッドにあるか
3. Paging 正規化（page/pageSize ↔ offset/limit）が正しいか
4. Error Policy が design.md 通りか
5. セキュリティ懸念がないか

## 出力
- 問題点のリスト（ファイル:行番号）
- 改善提案
```

---

## 付録: クイックリファレンス

### よく使うコマンド

```bash
# Scaffold 生成
npx tsx scripts/scaffold-feature.ts <context> <feature>

# Structure Guard
npx tsx scripts/structure-guards.ts

# v0 ファイル取得
./scripts/v0-fetch.sh '<v0_url>' '<context>/<feature>'

# v0 統合（取得 + 検証 + 移植）
./scripts/v0-integrate.sh '<v0_url>' '<context>/<feature>'

# v0 移植のみ
npx tsx scripts/v0-migrate.ts <context> <feature>

# API ビルド & 起動
pnpm run build:api && node dist/apps/api/src/main.js

# BFF ビルド & 起動
pnpm run build:bff && node dist/apps/bff/src/main.js

# Web 起動
cd apps/web && pnpm dev

# Prisma DB Push
DATABASE_URL="..." npx prisma db push

# Prisma Generate
DATABASE_URL="..." npx prisma generate
```

### ファイル配置早見表

| 種別 | 配置先 |
|------|--------|
| Requirements | `.kiro/specs/<context>/<feature>/requirements.md` |
| Design | `.kiro/specs/<context>/<feature>/design.md` |
| Design Review | `.kiro/specs/<context>/<feature>/design-review.md` |
| Tasks | `.kiro/specs/<context>/<feature>/tasks.md` |
| v0 Prompt | `.kiro/specs/<context>/<feature>/v0-prompt.md` |
| BFF Contracts | `packages/contracts/src/bff/<feature>/index.ts` |
| API Contracts | `packages/contracts/src/api/<feature>/index.ts` |
| Error Codes | `packages/contracts/src/api/errors/<feature>-error.ts` |
| Domain API | `apps/api/src/modules/<context>/<feature>/` |
| BFF | `apps/bff/src/modules/<context>/<feature>/` |
| v0 隔離 | `apps/web/_v0_drop/<context>/<feature>/src/` |
| UI 本実装 | `apps/web/src/features/<context>/<feature>/` |
| App Router | `apps/web/src/app/<context>/<feature>/page.tsx` |
| Navigation | `apps/web/src/shared/navigation/menu.ts` |

---

（以上）
