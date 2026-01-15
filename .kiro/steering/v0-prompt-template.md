# v0 Prompt Template

> **使い方**: `<...>` 部分を requirements.md / design.md から埋めて v0 に貼る

---

## 1. Design System（冒頭に必ず記載）

```
Use the EPM Design System from: https://epm-registry-6xtkaywr0-tkoizumi-hira-tjps-projects.vercel.app

Theme: Deep Teal & Royal Indigo
- Primary: oklch(0.52 0.13 195) - Deep Teal
- Secondary: oklch(0.48 0.15 280) - Royal Indigo
```

---

## 2. Context（簡潔に）

```markdown
You are generating UI for an EPM SaaS.

**Boundary Rules (MUST FOLLOW):**
- UI → BFF only（Domain API 直接呼び出し禁止）
- Use `packages/contracts/src/bff` DTOs only（api 参照禁止）
- Components from `@/shared/ui` only（base UI を feature 内に作成禁止）
- No layout.tsx（AppShell 内で描画）
- No raw colors（semantic tokens のみ: bg-primary, text-foreground, etc.）
- Start with MockBffClient → later switch to HttpBffClient
```

---

## 3. Feature

```markdown
**<context>/<feature>**: <短い説明>

### 主要ユースケース
1. <ユースケース1>
2. <ユースケース2>
3. ...
```

---

## 4. Screens

```markdown
### Screen 1: <画面名>
- **Purpose**: <目的>
- **Layout**: <レイアウト説明（例: 検索パネル + テーブル + ページネーション）>
- **Interactions**:
  - <操作1>
  - <操作2>

### Screen 2: <画面名>（ダイアログ等）
- **Purpose**: <目的>
- **Trigger**: <開くトリガー（例: 一覧行クリック、新規ボタン）>
- **Form Fields**:
  - <フィールド1>* (required)
  - <フィールド2> (optional)
- **Actions**: 保存 / キャンセル / 無効化
```

---

## 5. BFF Contract（design.md からコピー）

```markdown
### Endpoints

| Method | Endpoint | Purpose | Request DTO | Response DTO |
|--------|----------|---------|-------------|--------------|
| GET | /api/bff/<path> | <目的> | <Bff...Request> | <Bff...Response> |
| POST | /api/bff/<path> | <目的> | <Bff...Request> | <Bff...Response> |
| PATCH | /api/bff/<path>/:id | <目的> | <Bff...Request> | <Bff...Response> |

### DTOs

```typescript
// Request
interface Bff<Feature>ListRequest {
  page?: number;
  pageSize?: number;
  sortBy?: '<field1>' | '<field2>';
  sortOrder?: 'asc' | 'desc';
  keyword?: string;
  // filters...
}

// Response
interface Bff<Feature>ListResponse {
  items: Bff<Feature>Summary[];
  totalCount: number;
  page: number;
  pageSize: number;
}

interface Bff<Feature>Summary {
  id: string;
  // fields...
}

interface Bff<Feature>DetailResponse {
  id: string;
  // all fields...
  createdAt: string;
  updatedAt: string;
}
```

### Errors → UI Messages

| Error Code | UI Message |
|------------|-----------|
| <CODE>_NOT_FOUND | 「<対象>が見つかりません」 |
| <CODE>_DUPLICATE | 「<対象>コードが重複しています」 |
| VALIDATION_ERROR | フィールド別インラインエラー |

### DTO Import（MANDATORY）

```typescript
import type {
  Bff<Feature>ListRequest,
  Bff<Feature>ListResponse,
  Bff<Feature>DetailResponse,
} from "@epm/contracts/bff/<feature>";
```
```

---

## 6. UI Components

```markdown
### Tier 1（使用必須 - @/shared/ui から）
- Button, Input, Textarea, Select, Checkbox
- Table, Pagination, Card, Dialog, Alert, Badge, Tabs
- Toast/Sonner, Popover, Tooltip

### Tier 2（必要時のみ）
- Calendar, Sheet, Drawer, Accordion, Progress
- Form (react-hook-form)

### Feature-specific Components（v0 が生成）
- <Feature>List.tsx
- <Feature>SearchPanel.tsx
- <Feature>CreateDialog.tsx / <Feature>EditDialog.tsx
- api/BffClient.ts, MockBffClient.ts, HttpBffClient.ts
```

---

## 7. Mock Data

```markdown
### Sample Data（BFF Response 形状と一致必須）

```typescript
const mock<Feature>s: Bff<Feature>Summary[] = [
  {
    id: "<id-001>",
    <field>: "<realistic-value>",
    // ...
    isActive: true,
  },
  // 3-5 件のリアルなデータ
];
```

### States to Cover
- 通常状態（データあり）
- 空状態（データなし）
- エラー状態（バリデーション、ビジネスエラー）
```

---

## 8. Output Structure（二重出力：プレビュー用 + 移植用）

```markdown
### 重要：2つの出力先に同期して生成すること（MANDATORY）

v0 は以下の **2箇所に同じ内容を出力** すること：

---

### 1. プレビュー用（v0 内で動作確認）

v0 プロジェクトの `app/` に配置（プレビュー・調整用）:

```
app/<context>/<feature>/
├── page.tsx
└── components/
    ├── <Feature>List.tsx
    ├── <Feature>SearchPanel.tsx
    ├── <Feature>Dialog.tsx
    └── api/
        ├── BffClient.ts
        ├── MockBffClient.ts
        └── HttpBffClient.ts
```

---

### 2. 移植用モジュール（DL して本番環境へ移植）

v0 プロジェクトの `_v0_drop/` に配置（移植用、プレビュー用と同期）:

```
_v0_drop/<context>/<feature>/src/
├── app/
│   └── page.tsx
├── components/
│   ├── <Feature>List.tsx
│   ├── <Feature>SearchPanel.tsx
│   ├── <Feature>Dialog.tsx
│   └── index.ts              # barrel export
├── api/
│   ├── BffClient.ts          # interface
│   ├── MockBffClient.ts      # mock implementation
│   ├── HttpBffClient.ts      # HTTP implementation
│   └── index.ts              # barrel export + factory
├── lib/
│   └── error-messages.ts     # エラーコード → UIメッセージ
├── types/
│   └── index.ts              # 型定義（contracts からの re-export）
└── OUTPUT.md                 # 移植手順・チェックリスト
```

---

### 同期ルール（MUST）

1. プレビュー用と移植用のコンポーネント実装は **完全に同一**
2. 移植用は以下を追加：
   - `index.ts`（barrel export）
   - `lib/error-messages.ts`（エラーマッピング）
   - `OUTPUT.md`（移植手順）
3. 移植用のインポートパスは本番環境を想定：
   - `@/shared/ui` → `@/shared/ui`（そのまま）
   - `@epm/contracts/bff/<feature>` → `@epm/contracts/bff/<feature>`（そのまま）

---

### OUTPUT.md（必須生成 - _v0_drop 内）

v0 は `_v0_drop/<context>/<feature>/src/OUTPUT.md` に以下を含めること:

1. **Generated Files Tree** - 生成したファイル一覧
2. **Imports Used** - @/shared/ui から使用したコンポーネント、DTO インポート
3. **Missing Components (TODO)** - 不足している shared component があれば記載
4. **Migration Steps** - 移植手順:
   - コピー先: `apps/web/src/features/<context>/<feature>/ui/`
   - インポートパス変更（必要な場合）
   - page.tsx 接続方法
5. **Compliance Checklist**:
   - [ ] Components from @/shared/ui only
   - [ ] DTOs from @epm/contracts/bff only
   - [ ] No raw colors (bg-[#...]) - semantic tokens only
   - [ ] No layout.tsx
   - [ ] No base UI recreated in feature
   - [ ] MockBffClient returns DTO-shaped data
   - [ ] Error codes mapped to user messages
   - [ ] _v0_drop と app が同期している
```

---

## 9. 禁止事項（v0 への最終リマインダー）

```markdown
❌ PROHIBITED:
- `packages/contracts/src/api` からのインポート
- Domain API 直接呼び出し（/api/domain/...）
- fetch() を HttpBffClient 外で使用
- layout.tsx の生成
- base UI コンポーネント（button.tsx, input.tsx 等）の作成
- 生カラー（bg-[#14b8a6], bg-teal-500 等）
- 任意スペーシング（p-[16px], gap-[20px] 等）
- Sidebar/Header/Shell の独自作成

✅ REQUIRED:
- @/shared/ui からコンポーネント使用
- @epm/contracts/bff から DTO 使用
- semantic tokens（bg-primary, text-foreground, border-input 等）
- Tailwind scale（p-4, gap-4, rounded-lg 等）
- MockBffClient でモックデータ提供
- OUTPUT.md 生成
```

---

# Template End

---

## 📋 v0 Prompt 作成チェックリスト

v0 に貼る前に確認:

- [ ] Design System URL を冒頭に記載
- [ ] Feature 説明を記載
- [ ] Screens（画面仕様）を記載
- [ ] BFF Endpoints table を design.md からコピー
- [ ] DTO 定義を design.md からコピー
- [ ] Error → UI message マッピングを記載
- [ ] Mock data サンプルを記載
- [ ] **二重出力（app + _v0_drop）の指示を含める**
- [ ] 禁止事項セクションを含める

## 📋 v0 生成後チェックリスト

v0 生成物を DL する前に確認:

- [ ] `app/<context>/<feature>/` でプレビュー動作確認
- [ ] `_v0_drop/<context>/<feature>/src/` が生成されている
- [ ] `_v0_drop/` 内に OUTPUT.md が存在する
- [ ] プレビュー用と移植用のコンポーネントが同期している
- [ ] インポートパスが本番環境想定になっている
