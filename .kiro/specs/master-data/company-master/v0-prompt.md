# v0 Prompt: Company Master（法人マスタ）

## Context

You are generating UI for an EPM SaaS. The project uses SDD/CCSDD.
UI must follow boundary rules and must be easy to hand off to Cursor for implementation.

---

## EPM Design System (MANDATORY - READ FIRST)

### Design System Source of Truth

You MUST follow the EPM Design System defined in `.kiro/steering/epm-design-system.md`.

**Key Design Principles:**
- **Modern, clean, minimalist** aesthetic
- **Accessibility-first** (WCAG 2.1 AA compliant)
- **Consistent spacing** (0.25rem/4px base unit)
- **Dark mode support** (automatic theme switching)

### Color Palette (MANDATORY)

**Primary - Deep Teal:**
```css
--primary-500: oklch(0.52 0.13 195); /* Main Deep Teal */
```

**Secondary - Royal Indigo:**
```css
--secondary-500: oklch(0.48 0.15 280); /* Main Royal Indigo */
```

**Semantic Colors:**
```css
--success: oklch(0.65 0.18 150);  /* Green for success states */
--warning: oklch(0.75 0.15 70);   /* Amber for warnings */
--error: oklch(0.6 0.22 25);      /* Red for errors */
--info: oklch(0.6 0.15 240);      /* Blue for info */
```

**Color Usage Rules:**
- Use CSS variables: `bg-primary`, `text-secondary`, `border-error`
- Use semantic tokens: `bg-background`, `text-foreground`, `border-input`
- NEVER use raw color literals: `bg-[#14b8a6]`, `text-[oklch(...)]`
- NEVER use arbitrary Tailwind colors: `bg-teal-500`, `text-indigo-600`

### Typography System

**Font Family:**
- Sans: `Geist`, `Geist Fallback` (default)
- Mono: `Geist Mono`, `Geist Mono Fallback` (code)

**Type Scale:**
```
Heading 1: text-4xl font-bold tracking-tight
Heading 2: text-3xl font-bold tracking-tight
Heading 3: text-2xl font-semibold tracking-tight
Heading 4: text-xl font-semibold
Body:      text-base leading-relaxed
Small:     text-sm leading-relaxed
Muted:     text-sm text-muted-foreground
```

### Spacing System

**Base Unit:** 0.25rem (4px)

**Common Spacing:**
```
gap-2    (8px)   - tight spacing
gap-4    (16px)  - default spacing
gap-6    (24px)  - section spacing
gap-8    (32px)  - major section spacing
```

**DO NOT use arbitrary values:** `p-[16px]`, `gap-[20px]`

### Available Components by Tier

**Tier 1 (MUST Prefer):**
- Button, Input, Textarea, Label, Checkbox, Switch, Radio Group, Select
- Card, Alert, Badge, Separator, Spinner, Skeleton
- Table, Pagination, Tabs, Dialog, Alert Dialog
- Toast/Toaster/Sonner, Popover, Tooltip
- Dropdown Menu, Scroll Area, Breadcrumb

**Tier 2 (Use When Needed):**
- Calendar, Sheet, Drawer, Command, Sidebar, Progress
- Accordion, Collapsible, Navigation Menu, Menubar
- Form (react-hook-form integration)

**Tier 3 (Avoid):**
- Carousel, Aspect Ratio

**Component Import Rules:**
```typescript
// CORRECT - Use barrel export
import { Button, Table, Card, Dialog, Badge, Input, Select } from '@/shared/ui'

// WRONG - Direct component imports
import { Button } from '@/shared/ui/components/button'
```

---

## Non-Negotiable Rules

* UI must call ONLY BFF endpoints (never call Domain API directly).
* UI must use ONLY `packages/contracts/src/bff` DTOs and errors.
* UI must NOT import or reference `packages/contracts/src/api`.
* Implement UI behavior, state, validation, and UX only. No business rules or domain authority in UI.
* Start with mock data (in the same shape as BFF DTOs). Later we will swap to real BFF calls.

---

## Feature

**法人マスタ（Company Master）**: EPM SaaSにおける法人（会社）の基本情報・連結階層・通貨設定を管理するCRUD機能

### 機能概要
- 法人の一覧表示・検索・ソート・ページング
- 法人の新規登録・編集・詳細表示
- 法人の無効化・再有効化
- 会社階層（親子関係）のツリー表示
- 連結種別・出資比率・議決権比率の管理

---

## Screens to build

* **一覧画面（List View）**: テーブル形式で法人一覧を表示。検索・フィルタ・ソート・ページング対応。上部にツリービューを配置。
* **詳細/編集ダイアログ（Detail/Edit Dialog）**: 法人選択時にダイアログ形式で詳細表示・編集。全項目の表示・編集が可能。
* **新規登録ダイアログ（Create Dialog）**: 新規作成ボタンからダイアログ形式で法人登録。
* **ツリービュー（Tree View）**: 一覧画面上部に親子階層を表示（1階層のみ、有効法人のみ）。

---

## BFF Specification (from design.md)

### Endpoints (UI -> BFF)

| Method | Endpoint | Purpose | Request DTO | Response DTO | Notes |
|--------|----------|---------|-------------|--------------|-------|
| GET | /api/bff/master-data/company-master | 法人一覧取得 | BffListCompaniesRequest | BffListCompaniesResponse | 検索・ページング・ソート |
| GET | /api/bff/master-data/company-master/tree | 法人階層ツリー取得 | - | BffCompanyTreeResponse | 連結階層表示用 |
| GET | /api/bff/master-data/company-master/:id | 法人詳細取得 | - | BffCompanyDetailResponse | UUID パス |
| POST | /api/bff/master-data/company-master | 法人新規登録 | BffCreateCompanyRequest | BffCompanyDetailResponse | - |
| PATCH | /api/bff/master-data/company-master/:id | 法人情報更新 | BffUpdateCompanyRequest | BffCompanyDetailResponse | 部分更新 |
| POST | /api/bff/master-data/company-master/:id/deactivate | 法人無効化 | - | BffCompanyDetailResponse | is_active → false |
| POST | /api/bff/master-data/company-master/:id/reactivate | 法人再有効化 | - | BffCompanyDetailResponse | is_active → true |

### DTOs to use (contracts/bff)

**Enum:**
```typescript
export const ConsolidationType = {
  FULL: 'full',
  EQUITY: 'equity',
  NONE: 'none',
} as const;
export type ConsolidationType = typeof ConsolidationType[keyof typeof ConsolidationType];
```

**Request DTOs:**
* `BffListCompaniesRequest` - 一覧取得（page, pageSize, sortBy, sortOrder, keyword, isActive, consolidationType）
* `BffCreateCompanyRequest` - 新規登録（companyCode, companyName, consolidationType, currencyCode, fiscalYearEndMonth, etc.）
* `BffUpdateCompanyRequest` - 更新（部分更新、全フィールドoptional）

**Response DTOs:**
* `BffCompanySummary` - 一覧表示用（id, companyCode, companyName, consolidationType, currencyCode, fiscalYearEndMonth, isActive）
* `BffListCompaniesResponse` - 一覧レスポンス（items, totalCount, page, pageSize）
* `BffCompanyDetailResponse` - 詳細（全フィールド + parentCompanyName解決済み）
* `BffCompanyTreeNode` - ツリーノード（id, companyCode, companyName, consolidationType, isActive, children[]）
* `BffCompanyTreeResponse` - ツリー（roots[]）

### DTO import example (MANDATORY)

```typescript
import type {
  BffListCompaniesRequest,
  BffListCompaniesResponse,
  BffCompanySummary,
  BffCompanyDetailResponse,
  BffCreateCompanyRequest,
  BffUpdateCompanyRequest,
  BffCompanyTreeResponse,
  BffCompanyTreeNode,
  ConsolidationType,
} from '@contracts/bff/company-master';
```

### Error Codes

| Error Code | 表示メッセージ | 発生場面 |
|------------|---------------|---------|
| COMPANY_NOT_FOUND | 法人が見つかりません | 詳細/更新/無効化/再有効化 |
| COMPANY_CODE_DUPLICATE | 法人コードが重複しています | 登録/更新 |
| COMPANY_ALREADY_INACTIVE | この法人は既に無効化されています | 無効化 |
| COMPANY_ALREADY_ACTIVE | この法人は既に有効です | 再有効化 |
| PARENT_COMPANY_NOT_FOUND | 親法人が見つかりません | 親法人設定 |
| SELF_REFERENCE_NOT_ALLOWED | 自身を親法人に設定することはできません | 親法人設定 |
| VALIDATION_ERROR | 入力内容に誤りがあります | 全バリデーション |

### Error UI behavior

* Show validation errors inline per field
* Show API/business errors in a top alert panel
* Map error codes to user-friendly Japanese messages

---

## UI Specification（詳細）

### 一覧画面

**表示カラム:**
| カラム | 表示名 | 備考 |
|--------|--------|------|
| companyCode | 法人コード | ソート可能 |
| companyName | 法人名 | ソート可能 |
| consolidationType | 連結種別 | 完全連結/持分法/非連結 で表示 |
| currencyCode | 通貨 | - |
| fiscalYearEndMonth | 決算月 | 「3月決算」形式 |
| isActive | 状態 | Badge表示（有効/無効） |

**検索・フィルタ:**
- keyword: 法人コード・法人名の部分一致検索
- isActive: 有効/無効/すべて の切替
- consolidationType: 完全連結/持分法/非連結/すべて の切替

**無効法人の表示:**
- 一覧には無効法人も表示する
- 無効法人の行は**グレーアウト**（opacity-50等）
- isActive=false の行は text-muted-foreground で表示

### 詳細/編集ダイアログ

**フォーム項目:**
| 項目 | 入力形式 | 必須 | バリデーション | 備考 |
|------|---------|------|---------------|------|
| companyCode | Input | ✅ | 最大20文字 | - |
| companyName | Input | ✅ | 最大200文字 | - |
| companyNameShort | Input | - | 最大100文字 | 法人名略称 |
| parentCompanyId | Select | - | - | 有効法人のみ、自身除外 |
| consolidationType | Select | ✅ | full/equity/none | - |
| ownershipRatio | Input + % | - | 0-100、小数1桁 | 非連結時はdisabled |
| votingRatio | Input + % | - | 0-100、小数1桁 | 非連結時はdisabled |
| currencyCode | Select | ✅ | ISO 4217 | ドロップダウン |
| reportingCurrencyCode | Select | - | ISO 4217 | レポート通貨 |
| fiscalYearEndMonth | Select | ✅ | 1-12 | 「3月決算」形式 |
| timezone | Select | - | IANA形式 | - |

**連結種別のラベル:**
| 値 | 表示ラベル |
|----|-----------|
| full | 完全連結 |
| equity | 持分法 |
| none | 非連結 |

**決算月の選択肢:**
「1月決算」「2月決算」...「12月決算」

**比率入力の条件付き制御:**
- 連結種別が「非連結（none）」の場合、出資比率・議決権比率は**disabled**
- 連結種別を「非連結」に変更した場合、入力済みの比率は**クリア**される

**通貨コード選択肢:**
| コード | 表示名 |
|--------|--------|
| JPY | 日本円 (JPY) |
| USD | 米ドル (USD) |
| EUR | ユーロ (EUR) |
| CNY | 人民元 (CNY) |
| GBP | 英ポンド (GBP) |
| KRW | 韓国ウォン (KRW) |
| TWD | 台湾ドル (TWD) |
| SGD | シンガポールドル (SGD) |
| THB | タイバーツ (THB) |
| VND | ベトナムドン (VND) |

**タイムゾーン選択肢:**
| 値 | 表示名 |
|----|--------|
| Asia/Tokyo | 日本標準時 (JST) |
| Asia/Shanghai | 中国標準時 (CST) |
| Asia/Singapore | シンガポール標準時 (SGT) |
| Asia/Bangkok | タイ標準時 (ICT) |
| Asia/Ho_Chi_Minh | ベトナム標準時 (ICT) |
| America/New_York | 米国東部時間 (EST/EDT) |
| America/Los_Angeles | 米国太平洋時間 (PST/PDT) |
| Europe/London | 英国標準時 (GMT/BST) |
| Europe/Paris | 中央ヨーロッパ時間 (CET/CEST) |

### ツリービュー

**表示形式:**
- 一覧画面の上部に配置
- 親子1階層のみ（孫会社は想定しない）
- 親なし法人がルートノードとして表示
- 折りたたみ機能は不要（常に展開表示）
- **無効法人はツリーに表示しない**（有効法人のみ）

**ツリーノード表示:**
- 法人コード + 法人名
- 連結種別をBadgeで表示

**操作:**
- ノードクリックで詳細ダイアログを開く

---

## UI Output Requirements

Generate Next.js (App Router) + TypeScript + Tailwind UI.
Include:

1. Routes/pages for the screens (**page.tsx only; no layout.tsx**)
2. A typed `BffClient` interface (methods correspond to endpoints above)
3. `MockBffClient` returning sample DTO-shaped data
4. `HttpBffClient` with fetch wrappers (unused initially, easy to switch)
5. Data models in UI must be the DTO types from contracts/bff
6. Production-like UI with Japanese labels

---

## Mock Data Requirements

Provide mock data sets that:
* cover empty state, typical state (5-10 companies), and error state
* use realistic Japanese company names (例: 株式会社〇〇、〇〇ホールディングス)
* include parent-child relationships for tree display
* include both active and inactive companies
* strictly match the BFF response DTO shape

**Mock data examples:**
```typescript
// 親会社（グループ本社）
{
  id: 'company-001',
  companyCode: 'HD001',
  companyName: 'EPMホールディングス株式会社',
  companyNameShort: 'EPM HD',
  parentCompanyId: null,
  parentCompanyName: null,
  consolidationType: 'full',
  ownershipRatio: null,
  votingRatio: null,
  currencyCode: 'JPY',
  reportingCurrencyCode: 'JPY',
  fiscalYearEndMonth: 3,
  timezone: 'Asia/Tokyo',
  isActive: true,
}

// 子会社（完全連結）
{
  id: 'company-002',
  companyCode: 'JP001',
  companyName: 'EPMジャパン株式会社',
  companyNameShort: 'EPM Japan',
  parentCompanyId: 'company-001',
  parentCompanyName: 'EPMホールディングス株式会社',
  consolidationType: 'full',
  ownershipRatio: 100.0,
  votingRatio: 100.0,
  currencyCode: 'JPY',
  reportingCurrencyCode: 'JPY',
  fiscalYearEndMonth: 3,
  timezone: 'Asia/Tokyo',
  isActive: true,
}

// 持分法適用会社
{
  id: 'company-003',
  companyCode: 'CN001',
  companyName: 'EPM上海有限公司',
  companyNameShort: 'EPM Shanghai',
  parentCompanyId: 'company-001',
  parentCompanyName: 'EPMホールディングス株式会社',
  consolidationType: 'equity',
  ownershipRatio: 25.5,
  votingRatio: 30.0,
  currencyCode: 'CNY',
  reportingCurrencyCode: 'JPY',
  fiscalYearEndMonth: 12,
  timezone: 'Asia/Shanghai',
  isActive: true,
}

// 無効法人
{
  id: 'company-004',
  companyCode: 'OLD01',
  companyName: '旧EPM販売株式会社',
  consolidationType: 'none',
  currencyCode: 'JPY',
  fiscalYearEndMonth: 3,
  isActive: false,
}
```

---

## Authentication / Tenant

* UI only attaches auth token to BFF requests.
* UI must not handle tenant_id directly.

---

# REQUIRED: Repository Constraints

## v0 Isolation Output Path (MANDATORY)

* Write all generated code ONLY under:
  * `apps/web/_v0_drop/master-data/company-master/src`
* Do NOT write to `apps/web/src` directly.
* Do NOT place source files outside the `src/` folder.

**Expected Output Structure:**
```
apps/web/_v0_drop/master-data/company-master/src/
├── OUTPUT.md
├── page.tsx
├── components/
│   ├── CompanyList.tsx
│   ├── CompanyTree.tsx
│   ├── CompanyDetailDialog.tsx
│   ├── CreateCompanyDialog.tsx
│   └── CompanySearchPanel.tsx
├── api/
│   ├── BffClient.ts
│   ├── MockBffClient.ts
│   └── HttpBffClient.ts
└── constants/
    └── options.ts (通貨・タイムゾーン・連結種別の選択肢)
```

## Prohibited Imports / Calls (MANDATORY)

### Imports / Contracts
* UI must NOT import from `packages/contracts/src/api`.
* UI must use `packages/contracts/src/bff` DTOs and errors only.
* Do NOT redefine DTO/Enum/Error types inside feature code.

### Network Access
* UI must NOT call Domain API directly (no `/api/master-data/...` calls).
* Direct `fetch()` is allowed ONLY inside `api/HttpBffClient.ts`.

### App Router / Shell
* Do NOT generate `layout.tsx` anywhere.
* Do NOT create a new sidebar/header/shell layout.
* All screens MUST render inside the existing AppShell.

---

## REQUIRED OUTPUT ARTIFACT: OUTPUT.md

Create `apps/web/_v0_drop/master-data/company-master/src/OUTPUT.md` with:

### 1) Generated files (tree)
Complete tree of everything generated under `src/`.

### 2) Key imports / dependency notes
- `@/shared/ui` usage (which Tier 1 components used)
- `packages/contracts/src/bff` DTO imports
- `BffClient` / `MockBffClient` / `HttpBffClient` relationships

### 3) Missing Shared Component / Pattern (TODO)
- Suggested shared components that don't exist yet
- Include filename, props interface, purpose

### 4) Migration notes (_v0_drop → features)
- Step-by-step migration plan
- Path/import changes needed

### 5) Constraint compliance checklist
- [ ] Code written ONLY under `apps/web/_v0_drop/master-data/company-master/src`
- [ ] UI components imported ONLY from `@/shared/ui`
- [ ] DTO types imported from `packages/contracts/src/bff` (no UI re-definition)
- [ ] No imports from `packages/contracts/src/api`
- [ ] No Domain API direct calls (/api/)
- [ ] No direct fetch() outside `api/HttpBffClient.ts`
- [ ] No layout.tsx generated
- [ ] No base UI components created under features
- [ ] No raw color literals (bg-[#...], text-[oklch(...)], etc.)
- [ ] No arbitrary Tailwind colors (bg-teal-500, etc.)
- [ ] No new sidebar/header/shell created inside the feature
- [ ] All spacing uses Tailwind scale (no arbitrary values like p-[16px])
- [ ] Dark mode support via semantic tokens (no manual dark: variants)

---

## Quick Checklist for v0 Execution

Before generating:
- [x] Feature name and description: 法人マスタ（Company Master）
- [x] BFF endpoints table: 7 endpoints defined
- [x] DTO import paths: `@contracts/bff/company-master`
- [x] Mock data requirements: 親子関係、有効/無効、各連結種別
- [x] Output path: `apps/web/_v0_drop/master-data/company-master/src`

After generating, verify:
- [ ] OUTPUT.md created with all 5 sections
- [ ] No raw color literals
- [ ] No layout.tsx created
- [ ] No base UI components recreated
- [ ] All components imported from `@/shared/ui`
- [ ] All DTOs imported from `@contracts/bff`
- [ ] BffClient interface matches 7 endpoints
- [ ] MockBffClient provides realistic Japanese data
- [ ] Dark mode works automatically
- [ ] Spacing uses Tailwind scale

---

## Summary

Use EPM Design System colors and components.
Primary: Deep Teal oklch(0.52 0.13 195)
Secondary: Royal Indigo oklch(0.48 0.15 280)

Feature: Company Master（法人マスタ）CRUD

Screens:
- Company List: table with tree view, search, filter, pagination
- Company Create: dialog form
- Company Detail/Edit: dialog form with conditional controls

BFF Endpoints:
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | /api/bff/master-data/company-master | BffListCompaniesRequest | BffListCompaniesResponse |
| GET | /api/bff/master-data/company-master/tree | - | BffCompanyTreeResponse |
| GET | /api/bff/master-data/company-master/:id | - | BffCompanyDetailResponse |
| POST | /api/bff/master-data/company-master | BffCreateCompanyRequest | BffCompanyDetailResponse |
| PATCH | /api/bff/master-data/company-master/:id | BffUpdateCompanyRequest | BffCompanyDetailResponse |
| POST | /api/bff/master-data/company-master/:id/deactivate | - | BffCompanyDetailResponse |
| POST | /api/bff/master-data/company-master/:id/reactivate | - | BffCompanyDetailResponse |

DTOs:
```typescript
import type { ... } from '@contracts/bff/company-master'
```

Use Tier 1 components: Button, Table, Card, Input, Dialog, Badge, Select, Pagination, Alert, Label
Output to: apps/web/_v0_drop/master-data/company-master/src

Include OUTPUT.md with:
1. File tree
2. Import notes
3. Missing components TODO
4. Migration steps
5. Constraint checklist

---

**End of v0 Prompt**
