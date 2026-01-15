# v0 完全セットアップガイド - EPM SaaS開発

v0.dev を基盤としたフロントエンド開発の完全ガイド

---

## 📋 このガイドで実現できること

✅ v0.dev で生成したUIコンポーネントを **CLI経由で自動取得**
✅ EPM Design System (Deep Teal/Royal Indigo) を v0 に適用
✅ CCSDD ルールに準拠した `_v0_drop` → `features` への統合
✅ Cursor との自動連携による効率的な開発ワークフロー

---

## 🎯 アーキテクチャ全体像

```
┌─────────────────────────────────────────────────────────────┐
│ v0.dev (AI UI Generation)                                   │
│ - EPM Registry から Theme/Components を取得                 │
│ - BFF Contracts に基づいた Props 定義                       │
│ - Pure Presentation Layer のみ生成                          │
└────────────────┬────────────────────────────────────────────┘
                 │ npx v0 add <url>
                 ↓
┌─────────────────────────────────────────────────────────────┐
│ ./scripts/v0-fetch.sh または v0-integrate.sh               │
│ - 自動的に _v0_drop に配置                                  │
│ - OUTPUT.md 自動生成                                        │
│ - Cursor で自動オープン                                     │
└────────────────┬────────────────────────────────────────────┘
                 │ Cursor で Review & Fix
                 ↓
┌─────────────────────────────────────────────────────────────┐
│ apps/web/_v0_drop/<context>/<feature>/src                  │
│ - 隔離された出力ディレクトリ                                 │
│ - OUTPUT.md で Migration ガイド提供                         │
└────────────────┬────────────────────────────────────────────┘
                 │ Missing Components 実装
                 ↓
┌─────────────────────────────────────────────────────────────┐
│ apps/web/src/shared/ui                                      │
│ - Missing Components 実装 (Tier 2)                          │
│ - Barrel export 作成 (index.ts)                             │
└────────────────┬────────────────────────────────────────────┘
                 │ mv → features/
                 ↓
┌─────────────────────────────────────────────────────────────┐
│ apps/web/src/features/<context>/<feature>                  │
│ - v0 出力を統合                                              │
│ - Imports を @/shared/ui に変更                              │
│ - Contracts を @contracts/bff から import                   │
└────────────────┬────────────────────────────────────────────┘
                 │ Route 登録
                 ↓
┌─────────────────────────────────────────────────────────────┐
│ apps/web/src/app/<context>/<feature>/page.tsx              │
│ - Next.js App Router で公開                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 セットアップ手順 (初回のみ)

### 1. 前提条件のインストール

```bash
# v0 CLI にログイン
npx v0 login
# ブラウザが開くので Vercel アカウントでログイン

# Cursor インストール (推奨)
brew install --cask cursor

# pnpm (既にインストール済みの場合はスキップ)
npm install -g pnpm
```

### 2. EPM Design System Registry の確認

デプロイ済みの Registry URL:
```
https://epm-registry-6xtkaywr0-tkoizumi-hira-tjps-projects.vercel.app
```

ブラウザでアクセスして、Deep Teal/Royal Indigo のコンポーネントが表示されることを確認。

### 3. v0.dev での設定 (オプション)

**現時点では v0.dev の Custom Registry 設定画面が見つからない場合**:

→ プロンプトの冒頭に Registry URL を明記することで代替可能:

```markdown
Use the EPM Design System from: https://epm-registry-6xtkaywr0-tkoizumi-hira-tjps-projects.vercel.app

[以下、Feature の要件を記載]
```

---

## 📝 日常の開発ワークフロー

### Step 1: v0.dev で UI 生成

#### プロンプト作成

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

#### v0.dev で実行

1. https://v0.dev にアクセス
2. 新しいチャット開始
3. 上記プロンプトを貼り付け
4. 生成完了を待つ (30秒〜2分)

---

### Step 2: CLI でローカルに取得

#### 方法 A: 基本 - v0-fetch.sh

生成完了後、v0.dev で **Share → Copy URL** をクリック:

```
https://v0.dev/chat/abc123xyz
```

ローカルで実行:

```bash
./scripts/v0-fetch.sh "https://v0.dev/chat/abc123xyz" master-data/employee-master
```

**結果**:
```
apps/web/_v0_drop/master-data/employee-master/src/
├── OUTPUT.md
├── components/
│   └── employee-list.tsx
├── api/
│   ├── BffClient.ts
│   ├── MockBffClient.ts
│   └── HttpBffClient.ts
└── types/
    └── index.ts
```

---

#### 方法 B: 推奨 - v0-integrate.sh (完全自動化)

```bash
./scripts/v0-integrate.sh "https://v0.dev/chat/abc123xyz" master-data/employee-master
```

**何が起こるか**:
1. v0-fetch.sh を自動実行
2. OUTPUT.md を表示
3. Cursor で自動オープン
4. Missing Components の実装を待機
5. CCSDD 制約をチェック
6. features/ へ移行 (確認後)

---

### Step 3: OUTPUT.md を確認 (Cursor)

Cursor が自動で開くので、OUTPUT.md を確認:

#### セクション 3: Missing Shared Component / Pattern

```markdown
### Missing Shared Component / Pattern (TODO)

- [ ] DataTable wrapper (apps/web/src/shared/ui/components/data-table.tsx)
- [ ] SearchInput with debounce (apps/web/src/shared/ui/components/search-input.tsx)
- [ ] @/shared/ui barrel export (apps/web/src/shared/ui/index.ts)
```

**これらを実装します**:

```bash
# Cursor に依頼
"Create a DataTable wrapper component at apps/web/src/shared/ui/components/data-table.tsx
that wraps the Table component with sorting, pagination, and loading states.
Follow the Tier 2 pattern from README.md."
```

#### Barrel export を作成

```typescript
// apps/web/src/shared/ui/index.ts
// Tier 1 - Base Components
export { Button } from './components/button'
export { Table, TableHeader, TableBody, TableRow, TableCell } from './components/table'
export { Card, CardHeader, CardTitle, CardContent } from './components/card'
export { Input } from './components/input'
export { Dialog, DialogTrigger, DialogContent } from './components/dialog'
export { Tabs, TabsList, TabsTrigger, TabsContent } from './components/tabs'
export { Badge } from './components/badge'
export { Alert, AlertTitle, AlertDescription } from './components/alert'
export { Separator } from './components/separator'
export { Pagination } from './components/pagination'

// Tier 2 - Composite (v0で必要になったもの)
export { DataTable } from './components/data-table'
export { SearchInput } from './components/search-input'
```

---

### Step 4: features/ へ移行

v0-integrate.sh を使っている場合は、プロンプトに従って `y` を入力。

手動の場合:

```bash
mv apps/web/_v0_drop/master-data/employee-master/src \
   apps/web/src/features/master-data/employee-master
```

---

### Step 5: Imports を修正 (Cursor)

Cursor で開いた状態で、以下のプロンプトを実行:

```
Update all imports in apps/web/src/features/master-data/employee-master
to use @/shared/ui barrel exports instead of direct component imports.

Also replace all local type definitions with imports from @contracts/bff/master-data/employee.
```

**Before**:
```typescript
import { Button } from '../../../shared/ui/components/button'
import type { EmployeeListResponse } from '../types'
```

**After**:
```typescript
import { Button, Table, Card } from '@/shared/ui'
import type { EmployeeListResponse } from '@contracts/bff/master-data/employee'
```

---

### Step 6: Route を登録

```bash
# ディレクトリ作成
mkdir -p apps/web/src/app/master-data/employee-master

# page.tsx 作成
cat > apps/web/src/app/master-data/employee-master/page.tsx << 'EOF'
import EmployeeListPage from '@/features/master-data/employee-master/page'

export default EmployeeListPage
EOF
```

---

### Step 7: Navigation Menu に追加

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

### Step 8: テスト実行

```bash
cd apps/web
pnpm dev

# ブラウザで確認
# http://localhost:3000/master-data/employee-master
```

**確認ポイント**:
- ✅ Deep Teal (primary) と Royal Indigo (secondary) が適用されている
- ✅ Table, Button, Dialog などが EPM デザインシステムに従っている
- ✅ Mock データが表示される
- ✅ AppShell (Sidebar, Header) が表示されている
- ✅ エラーが出ていない

---

### Step 9: BFF 接続 (BFF 実装後)

```typescript
// apps/web/src/features/master-data/employee-master/page.tsx

// Before (Mock)
import { MockBffClient } from './api/MockBffClient'
const bffClient = new MockBffClient()

// After (Production)
import { HttpBffClient } from './api/HttpBffClient'
const bffClient = new HttpBffClient(
  process.env.NEXT_PUBLIC_BFF_URL || 'http://localhost:4000'
)
```

---

## 🎓 高度な使い方

### カスタムプロンプトテンプレートの作成

プロジェクト固有のテンプレートを作成:

```bash
cp .kiro/steering/v0-prompt-template.md \
   .kiro/specs/master-data/employee-master/v0-prompt.md

# Feature 固有の情報を記載
cursor .kiro/specs/master-data/employee-master/v0-prompt.md
```

### 複数 Feature の並行開発

```bash
# Terminal 1
./scripts/v0-integrate.sh "https://v0.dev/chat/abc123" master-data/employee-master

# Terminal 2
./scripts/v0-integrate.sh "https://v0.dev/chat/def456" budget/entry

# Terminal 3
./scripts/v0-integrate.sh "https://v0.dev/chat/ghi789" budget/approval
```

### Git への自動コミット

v0-integrate.sh を拡張:

```bash
# スクリプトの最後に追加
git add apps/web/src/features/$CONTEXT/$FEATURE
git add apps/web/src/app/$CONTEXT/$FEATURE
git commit -m "feat($CONTEXT): add $FEATURE UI (v0-generated)"
```

---

## 🐛 トラブルシューティング

詳細は `scripts/README.md` を参照:

### よくある問題

1. **v0 add が失敗**: `npx v0 login` を実行
2. **Cursor が開かない**: `cursor` コマンドを PATH に追加
3. **依存パッケージ不足**: `pnpm add @radix-ui/react-*` で手動追加
4. **Raw color literals**: v0 プロンプトに CSS variables 使用を明記

---

## 📊 v0 vs 従来開発の比較

| 項目 | 従来 (Figma → 手動実装) | v0 + CLI + Cursor |
|------|-------------------------|-------------------|
| **初期UI作成** | 2-3日 | 30分 |
| **デザイン変更** | 半日〜1日 | 5-10分 |
| **コンポーネント品質** | エンジニア依存 | 一貫して高品質 |
| **デザイン System 適用** | 手動チェック | 自動適用 (Registry) |
| **BFF 分離** | 手動実装 | テンプレート自動生成 |
| **学習コスト** | 高 (Figma + React) | 低 (プロンプトのみ) |

---

## ✅ チェックリスト (初回セットアップ)

- [ ] `npx v0 login` でログイン完了
- [ ] Cursor インストール完了
- [ ] EPM Registry にアクセス可能
- [ ] `v0-fetch.sh` と `v0-integrate.sh` に実行権限付与
- [ ] `.kiro/steering/v0-prompt-template.md` 確認
- [ ] `apps/web/src/shared/ui/index.ts` (barrel export) 作成済み
- [ ] テスト実行: `./scripts/v0-fetch.sh` でサンプル取得成功

---

## ✅ チェックリスト (毎回の Feature 開発)

- [ ] v0 プロンプトに Registry URL を含めた
- [ ] v0.dev で生成完了、URL をコピー
- [ ] `v0-integrate.sh` で取得・統合
- [ ] OUTPUT.md の Missing Components を実装
- [ ] features/ へ移行完了
- [ ] Imports を @/shared/ui に修正
- [ ] Contracts を @contracts/bff に修正
- [ ] Route 登録完了
- [ ] Navigation menu 追加完了
- [ ] Mock データで動作確認完了
- [ ] EPM デザインシステム適用確認 (Deep Teal/Royal Indigo)

---

## 📚 関連ドキュメント

- **CLI 詳細ガイド**: `docs/v0-cli-integration.md`
- **完全ワークフロー**: `docs/v0-cursor-integration-workflow.md`
- **スクリプト使用法**: `scripts/README.md`
- **v0 Prompt Template**: `.kiro/steering/v0-prompt-template.md`
- **Development Process**: `.kiro/steering/development-process.md`
- **EPM Design System Registry**: https://epm-registry-6xtkaywr0-tkoizumi-hira-tjps-projects.vercel.app

---

## 🚀 Next Steps

このセットアップが完了したら:

1. **実際の Feature で試す**: Employee Master または Budget Entry
2. **チーム共有**: 他のメンバーにこのガイドを共有
3. **テンプレート改善**: プロジェクト固有のプロンプトパターンを蓄積
4. **自動化の拡張**: CI/CD パイプラインへの統合

---

**Happy Coding with v0! 🎉**
