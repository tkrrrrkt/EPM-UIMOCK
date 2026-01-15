# v0 × Cursor 統合ワークフロー (CCSDD)

プロ IT アーキテクト向け - EPM SaaS 開発における v0.dev と Cursor の統合手順

---

## 📋 前提条件

- ✅ EPM Design System Registry がデプロイ済み
- ✅ Registry URL: https://epm-registry-6xtkaywr0-tkoizumi-hira-tjps-projects.vercel.app
- ✅ v0-prompt-template.md が更新済み
- ✅ BFF contracts が定義済み (packages/contracts/src/bff)

---

## 🎯 ワークフロー全体像

```
[1. Design (Spec)]
    ↓
[2. v0 でUI生成] → _v0_drop/<context>/<feature>/src
    ↓
[3. OUTPUT.md 確認]
    ↓
[4. Missing Components 実装] (Cursor)
    ↓
[5. features へ移行] → apps/web/src/features/<context>/<feature>
    ↓
[6. Imports/Contracts 修正] (Cursor)
    ↓
[7. Route/Menu 登録] (Cursor)
    ↓
[8. BFF 接続・テスト]
```

---

## 1️⃣ v0 へのプロンプト作成

### テンプレート使用

`.kiro/steering/v0-prompt-template.md` をベースに、具体的な Feature 情報を埋める:

```markdown
Use the EPM Design System from: https://epm-registry-6xtkaywr0-tkoizumi-hira-tjps-projects.vercel.app

## Context
You are generating UI for an EPM SaaS. The project uses SDD/CCSDD.
UI must follow boundary rules and must be easy to hand off to Cursor for implementation.

## Feature
Employee Master: CRUD operations for employee master data with search and pagination.

## Screens to build
* Employee List: Display all employees in a table with search, filter, pagination
* Employee Create Dialog: Form to add new employee
* Employee Edit Dialog: Form to edit existing employee

## BFF Specification (from design.md)

### Endpoints (UI -> BFF)

| Method | Endpoint | Purpose | Request DTO | Response DTO |
|--------|----------|---------|-------------|--------------|
| GET | /api/bff/master-data/employees | List employees | EmployeeListRequest | EmployeeListResponse |
| POST | /api/bff/master-data/employees | Create employee | EmployeeCreateRequest | EmployeeCreateResponse |
| PUT | /api/bff/master-data/employees/:id | Update employee | EmployeeUpdateRequest | EmployeeUpdateResponse |
| DELETE | /api/bff/master-data/employees/:id | Delete employee | - | EmployeeDeleteResponse |

### DTOs to use (contracts/bff)

```typescript
import type {
  EmployeeListRequest,
  EmployeeListResponse,
  EmployeeCreateRequest,
  EmployeeCreateResponse,
  EmployeeUpdateRequest,
  EmployeeUpdateResponse,
  EmployeeDeleteResponse
} from '@contracts/bff/master-data/employee'
```

### Available Tier 1 Components
Use: Button, Table, Card, Input, Dialog, Badge, Alert, Separator, Pagination

### Output Location
Write all code to: apps/web/_v0_drop/master-data/employee-master/src

### NO Layout, NO BFF Implementation
- Do NOT generate layout.tsx
- Do NOT implement actual fetch() calls (use MockBffClient)
- Do NOT include business logic
```

---

## 2️⃣ v0.dev でコード生成

### v0.dev での操作

1. **v0.dev にログイン**: https://v0.dev
2. **新しいチャット開始**
3. **作成したプロンプトを貼り付け**
4. **生成完了を待つ** (通常 30秒～2分)
5. **Code タブをクリック**してファイルを確認

### v0 が生成するファイル構成 (期待値)

```
apps/web/_v0_drop/master-data/employee-master/src/
├── OUTPUT.md                    # ✅ 移行ガイド
├── page.tsx                     # Next.js App Router ページ
├── components/
│   ├── EmployeeList.tsx        # テーブル表示
│   ├── EmployeeForm.tsx        # フォーム (Create/Edit共通)
│   └── EmployeeFilters.tsx     # 検索・フィルタ
├── api/
│   ├── BffClient.ts            # Interface
│   ├── MockBffClient.ts        # モック実装
│   └── HttpBffClient.ts        # 本番実装 (未使用)
└── types/
    └── index.ts                # ローカル型定義 (あれば)
```

---

## 3️⃣ v0 出力をローカルに保存

### 方法: 手動コピー (CLI 未提供のため)

1. v0.dev の **Code タブ** で各ファイルを開く
2. ファイル内容をコピー
3. ローカルで該当パスにファイル作成・保存

```bash
# ディレクトリ作成
mkdir -p apps/web/_v0_drop/master-data/employee-master/src/{components,api,types}

# ファイルを1つずつ作成
touch apps/web/_v0_drop/master-data/employee-master/src/page.tsx
touch apps/web/_v0_drop/master-data/employee-master/src/OUTPUT.md
touch apps/web/_v0_drop/master-data/employee-master/src/components/EmployeeList.tsx
# ... 以下同様
```

4. v0 からコピーした内容を各ファイルに貼り付け

---

## 4️⃣ OUTPUT.md を確認 (Cursor)

```bash
# Cursor で OUTPUT.md を開く
cursor apps/web/_v0_drop/master-data/employee-master/src/OUTPUT.md
```

### OUTPUT.md の構成

```markdown
# v0 Generated Output - Employee Master

## 1) Generated files (tree)
├── page.tsx
├── components/
│   ├── EmployeeList.tsx
│   ├── EmployeeForm.tsx
│   └── EmployeeFilters.tsx
├── api/
│   ├── BffClient.ts
│   ├── MockBffClient.ts
│   └── HttpBffClient.ts
└── OUTPUT.md

## 2) Key imports / dependency notes
- @/shared/ui: Button, Table, Card, Input, Dialog, Badge, Alert
- @contracts/bff/master-data/employee: DTO types
- BffClient: Interface for all BFF calls

## 3) Missing Shared Component / Pattern (TODO)
- [ ] DataTable wrapper with sorting/pagination (Tier 2)
- [ ] SearchInput with debounce (Tier 2)
- [ ] @/shared/ui barrel export (apps/web/src/shared/ui/index.ts)

## 4) Migration notes (_v0_drop → features)
1. Implement missing shared components first
2. Create @/shared/ui barrel export
3. Move src/ to apps/web/src/features/master-data/employee-master
4. Update imports to use @/shared/ui
5. Replace mock DTOs with @contracts/bff imports
6. Register route in apps/web/src/app/master-data/employee-master/page.tsx
7. Add menu entry in apps/web/src/shared/navigation/menu.ts

## 5) Constraint compliance checklist
- [x] Code written ONLY under apps/web/_v0_drop/<context>/<feature>/src
- [x] UI components imported ONLY from @/shared/ui
- [x] DTO types imported from packages/contracts/src/bff
- [x] No imports from packages/contracts/src/api
- [x] No Domain API direct calls (/api/)
- [x] No direct fetch() outside api/HttpBffClient.ts
- [x] No layout.tsx generated
- [x] No base UI components created under features
- [x] No raw color literals (bg-[#...], etc.)
- [x] No new sidebar/header/shell created inside the feature
```

---

## 5️⃣ Missing Shared Components を実装 (Cursor)

### Step 1: OUTPUT.md の TODO を確認

```markdown
### Missing Shared Component / Pattern (TODO)
- [ ] DataTable wrapper (apps/web/src/shared/ui/components/data-table.tsx)
- [ ] SearchInput with debounce (apps/web/src/shared/ui/components/search-input.tsx)
- [ ] @/shared/ui barrel export (apps/web/src/shared/ui/index.ts)
```

### Step 2: Cursor に依頼して実装

**Cursor プロンプト例**:

```
Create a DataTable wrapper component at apps/web/src/shared/ui/components/data-table.tsx
that wraps the Table component with:
- Sorting functionality
- Pagination controls
- Loading states
- Empty state handling

Follow the Tier 2 pattern defined in apps/web/src/shared/ui/README.md.
Use only Tier 1 components (Table, Button, Pagination) from the same directory.
```

**期待される出力**:

```typescript
// apps/web/src/shared/ui/components/data-table.tsx
import { Table, TableHeader, TableBody, TableRow, TableCell } from './table'
import { Button } from './button'
import { Pagination } from './pagination'

export interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  pagination?: PaginationState
  onPaginationChange?: (pagination: PaginationState) => void
  isLoading?: boolean
}

export function DataTable<T>({ data, columns, pagination, onPaginationChange, isLoading }: DataTableProps<T>) {
  // ... 実装
}
```

### Step 3: Barrel export を作成

```typescript
// apps/web/src/shared/ui/index.ts
// Tier 1 - Base Components
export { Button, type ButtonProps } from './components/button'
export { Table, TableHeader, TableBody, TableRow, TableCell, TableCaption } from './components/table'
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './components/card'
export { Input, type InputProps } from './components/input'
export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from './components/dialog'
export { Tabs, TabsList, TabsTrigger, TabsContent } from './components/tabs'
export { Badge, type BadgeProps } from './components/badge'
export { Alert, AlertTitle, AlertDescription } from './components/alert'
export { Separator } from './components/separator'
export { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationEllipsis } from './components/pagination'

// Tier 2 - Composite Components
export { DataTable, type DataTableProps } from './components/data-table'
export { SearchInput, type SearchInputProps } from './components/search-input'
```

---

## 6️⃣ _v0_drop から features へ移行

```bash
# ディレクトリ移動
mv apps/web/_v0_drop/master-data/employee-master/src \
   apps/web/src/features/master-data/employee-master

# 確認
ls -la apps/web/src/features/master-data/employee-master
```

---

## 7️⃣ Imports を修正 (Cursor)

### Cursor プロンプト:

```
Update all imports in apps/web/src/features/master-data/employee-master
to use @/shared/ui barrel exports instead of direct component imports.

Also replace all local type definitions with imports from @contracts/bff/master-data/employee.
```

### 修正内容 (Before → After)

**Before** (v0 生成):
```typescript
// apps/web/src/features/master-data/employee-master/components/EmployeeList.tsx
import { Button } from '@/shared/ui/components/button'
import { Table } from '@/shared/ui/components/table'
import type { EmployeeListResponse } from '../types'
```

**After** (Cursor 修正後):
```typescript
import { Button, Table, Card } from '@/shared/ui'
import type { EmployeeListResponse } from '@contracts/bff/master-data/employee'
```

---

## 8️⃣ Route を登録

```bash
# ディレクトリ作成
mkdir -p apps/web/src/app/master-data/employee-master

# page.tsx 作成
touch apps/web/src/app/master-data/employee-master/page.tsx
```

```typescript
// apps/web/src/app/master-data/employee-master/page.tsx
import EmployeeListPage from '@/features/master-data/employee-master/page'

export default EmployeeListPage
```

---

## 9️⃣ Navigation Menu に追加

```typescript
// apps/web/src/shared/navigation/menu.ts
export const menu = [
  {
    id: 'master-data',
    label: 'マスタデータ',
    items: [
      {
        id: 'employee-master',
        label: '従業員マスタ',
        href: '/master-data/employee-master',  // ← 追加
        icon: 'Users'
      }
    ]
  }
]
```

---

## 🔟 MockBffClient → HttpBffClient 切り替え

### 初期状態 (モック使用)

```typescript
// apps/web/src/features/master-data/employee-master/page.tsx
import { MockBffClient } from './api/MockBffClient'

const bffClient = new MockBffClient()
```

### BFF 実装後 (本番接続)

```typescript
import { HttpBffClient } from './api/HttpBffClient'

const bffClient = new HttpBffClient(
  process.env.NEXT_PUBLIC_BFF_URL || 'http://localhost:4000'
)
```

---

## 1️⃣1️⃣ テスト実行

```bash
# 開発サーバー起動
cd apps/web
pnpm dev

# ブラウザで確認
# http://localhost:3000/master-data/employee-master
```

### 確認ポイント

- ✅ Deep Teal (primary) と Royal Indigo (secondary) が適用されている
- ✅ Table, Button, Dialog などが EPM デザインシステムに従っている
- ✅ Mock データが表示される
- ✅ AppShell (Sidebar, Header) が表示されている
- ✅ エラーが出ていない

---

## 📊 アーキテクチャ整理図

```
┌─────────────────────────────────────────────────────────┐
│ v0.dev (UI Generation)                                  │
│ - EPM Registry から Theme/Components 取得               │
│ - BFF Contracts に基づいた Props 定義                   │
│ - Pure Presentation Layer のみ生成                      │
└─────────────────┬───────────────────────────────────────┘
                  │ (手動コピー)
                  ↓
┌─────────────────────────────────────────────────────────┐
│ apps/web/_v0_drop/<context>/<feature>/src              │
│ - 隔離された出力ディレクトリ                             │
│ - OUTPUT.md で Migration ガイド提供                     │
└─────────────────┬───────────────────────────────────────┘
                  │ (Cursor で Review & Fix)
                  ↓
┌─────────────────────────────────────────────────────────┐
│ apps/web/src/shared/ui                                  │
│ - Missing Components 実装 (Tier 2)                      │
│ - Barrel export 作成 (index.ts)                         │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────────┐
│ apps/web/src/features/<context>/<feature>              │
│ - v0 出力を移行                                          │
│ - Imports を @/shared/ui に変更                          │
│ - Contracts を @contracts/bff から import               │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────────┐
│ apps/web/src/app/<context>/<feature>/page.tsx          │
│ - Next.js App Router で公開                             │
└─────────────────────────────────────────────────────────┘
```

---

## 🚨 よくあるトラブルシューティング

### 1. v0 が Registry を認識しない

**症状**: v0 が標準の shadcn/ui カラーを使ってしまう

**解決**:
- プロンプトの **最初の行** に Registry URL を明記
- "Use the EPM Design System from: [URL]" を忘れずに記載

### 2. v0 が layout.tsx を生成してしまう

**症状**: AppShell が重複する

**解決**:
- プロンプトに "NO layout.tsx" を強調
- v0-prompt-template.md の「App Router / Shell」セクションを必ず含める

### 3. v0 が BFF ロジックを含めてしまう

**症状**: API 実装や fetch() が生成される

**解決**:
- "Use MockBffClient only" を明記
- "NO API calls, NO business logic" を強調

### 4. Cursor で imports が解決できない

**症状**: `@/shared/ui` が見つからない

**解決**:
- tsconfig.json で paths alias 確認
- barrel export (index.ts) が作成されているか確認

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@contracts/*": ["../../packages/contracts/src/*"]
    }
  }
}
```

---

## ✅ チェックリスト (完了後)

- [ ] v0 で UI 生成完了
- [ ] _v0_drop に出力保存
- [ ] OUTPUT.md 確認
- [ ] Missing Components 実装 (Tier 2)
- [ ] Barrel export 作成
- [ ] features ディレクトリに移行
- [ ] Imports 修正 (@/shared/ui, @contracts/bff)
- [ ] Route 登録 (app/)
- [ ] Navigation menu 追加
- [ ] Mock データで動作確認
- [ ] EPM デザインシステム適用確認 (Deep Teal/Royal Indigo)
- [ ] AppShell 表示確認
- [ ] エラーなし確認

---

## 📚 関連ドキュメント

- `.kiro/steering/v0-prompt-template.md` - v0 プロンプトテンプレート
- `.kiro/steering/development-process.md` - CCSDD 開発プロセス
- `apps/web/src/shared/ui/README.md` - Tier 1/2/3 ポリシー
- `docs/V0デザインシステム.md` - v0 Registry 仕様
- Registry URL: https://epm-registry-6xtkaywr0-tkoizumi-hira-tjps-projects.vercel.app
