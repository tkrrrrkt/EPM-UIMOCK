# v0 Prompt: Subject Master（科目マスタ）

Use the EPM Design System from: https://epm-registry-6xtkaywr0-tkoizumi-hira-tjps-projects.vercel.app

---

## Context

You are generating UI for an EPM SaaS. The project uses SDD/CCSDD.
UI must follow boundary rules and must be easy to hand off to Cursor for implementation.

---

## Non-Negotiable Rules

* UI must call ONLY BFF endpoints (never call Domain API directly).
* UI must use ONLY `packages/contracts/src/bff` DTOs and errors.
* UI must NOT import or reference `packages/contracts/src/api`.
* Implement UI behavior, state, validation, and UX only. No business rules or domain authority in UI.
* Start with mock data (in the same shape as BFF DTOs). Later we will swap to real BFF calls.

---

## Feature

**master-data/subject-master**: 勘定科目（財務科目・KPI）とその集計構造（Rollup）を管理するCRUD機能。通常科目（BASE）と集計科目（AGGREGATE）を統一インターフェースで管理し、ツリー形式のUIで集計構造を視覚的に把握・編集する。

---

## Screens to build

### Screen 1: 科目ツリー画面（メイン画面）
- **Purpose**: 科目を階層ツリー形式で表示し、集計構造を視覚的に把握・編集
- **Layout**: 左側にツリーパネル、右側に詳細パネル（2ペインレイアウト）
- **Main Interactions**:
  - 科目をツリー形式で表示（AGGREGATE を親ノード、構成科目を子ノード）
  - ルートレベルに未割当科目とトップレベル集計科目を表示
  - ツリーノードの展開/折りたたみ
  - ノードクリックで右側詳細パネルに科目情報を表示
  - 検索・フィルタリング（キーワード、科目タイプ、科目クラス、有効フラグ）
  - 検索ヒット時に親ノードを自動展開してハイライト表示
  - ドラッグ＆ドロップで構成科目を移動（rollup 関係の変更）
  - コピー＆ペーストで科目を別の集計科目に追加
  - 無効化/再有効化アクション（ツールバーまたはコンテキストメニュー）

### Screen 2: 科目詳細パネル（右ペイン）
- **Purpose**: 選択した科目の詳細情報を表示・編集
- **Main Interactions**:
  - 全項目の表示（コード、名前、名前略称、科目クラス、科目タイプ、計上可否、メジャー種別、単位、スケール、集計方法、方向性、負値許可、有効フラグ、備考、作成日時、更新日時）
  - 表示モード/編集モードの切り替え
  - 編集内容の保存
  - AGGREGATE 科目の場合、構成科目リストを表示（係数付き）
  - 構成科目の追加/削除/係数変更

### Screen 3: 通常科目（BASE）新規登録ダイアログ
- **Purpose**: 新しい通常科目を登録
- **Main Interactions**:
  - 必須項目入力（科目コード、科目名、科目タイプ、メジャー種別、集計方法）
  - オプション項目入力（名前略称、単位、スケール、方向性、負値許可、備考）
  - バリデーションエラー表示
  - 登録実行

### Screen 4: 集計科目（AGGREGATE）新規登録ダイアログ
- **Purpose**: 新しい集計科目を登録
- **Main Interactions**:
  - 必須項目入力（科目コード、科目名、科目タイプ、メジャー種別、集計方法）
  - オプション項目入力（名前略称、単位、スケール、方向性、負値許可、備考）
  - posting_allowed は自動的に false に設定（UI で変更不可）
  - バリデーションエラー表示
  - 登録実行

### Screen 5: 構成科目追加ダイアログ
- **Purpose**: 集計科目に構成科目を追加
- **Main Interactions**:
  - 追加対象の科目を選択（ドロップダウンまたは検索可能リスト）
  - 係数（coefficient）を入力（+1, -1 など、小数点4桁まで）
  - 表示順（sortOrder）を入力
  - 循環参照エラー時のメッセージ表示
  - 追加実行

---

## BFF Specification (from design.md)

### Endpoints (UI -> BFF) - Subject

| Method | Endpoint | Purpose | Request DTO | Response DTO |
|--------|----------|---------|-------------|--------------|
| GET | /api/bff/master-data/subject-master/tree | 科目ツリー取得 | BffSubjectTreeRequest | BffSubjectTreeResponse |
| GET | /api/bff/master-data/subject-master/:id | 科目詳細取得 | - | BffSubjectDetailResponse |
| POST | /api/bff/master-data/subject-master | 科目新規登録 | BffCreateSubjectRequest | BffSubjectDetailResponse |
| PATCH | /api/bff/master-data/subject-master/:id | 科目更新 | BffUpdateSubjectRequest | BffSubjectDetailResponse |
| POST | /api/bff/master-data/subject-master/:id/deactivate | 科目無効化 | - | BffSubjectDetailResponse |
| POST | /api/bff/master-data/subject-master/:id/reactivate | 科目再有効化 | - | BffSubjectDetailResponse |

### Endpoints (UI -> BFF) - Rollup

| Method | Endpoint | Purpose | Request DTO | Response DTO |
|--------|----------|---------|-------------|--------------|
| POST | /api/bff/master-data/subject-master/:parentId/rollup | 構成科目追加 | BffAddRollupRequest | BffSubjectTreeResponse |
| PATCH | /api/bff/master-data/subject-master/:parentId/rollup/:componentId | 構成科目更新 | BffUpdateRollupRequest | BffSubjectTreeResponse |
| DELETE | /api/bff/master-data/subject-master/:parentId/rollup/:componentId | 構成科目削除 | - | BffSubjectTreeResponse |
| POST | /api/bff/master-data/subject-master/move | ドラッグ＆ドロップ移動 | BffMoveSubjectRequest | BffSubjectTreeResponse |

### DTOs to use (contracts/bff)

**Subject DTOs:**

```typescript
// Request DTOs
export interface BffSubjectTreeRequest {
  keyword?: string;
  subjectType?: 'FIN' | 'KPI';
  subjectClass?: 'BASE' | 'AGGREGATE';
  isActive?: boolean;
}

export interface BffCreateSubjectRequest {
  subjectCode: string;
  subjectName: string;
  subjectNameShort?: string;
  subjectClass: 'BASE' | 'AGGREGATE';
  subjectType: 'FIN' | 'KPI';
  postingAllowed?: boolean;     // BASE default: true, AGGREGATE forced: false
  measureKind: string;
  unit?: string;
  scale?: number;
  aggregationMethod: 'SUM' | 'EOP' | 'AVG' | 'MAX' | 'MIN';
  direction?: string;
  allowNegative?: boolean;
  notes?: string;
}

export interface BffUpdateSubjectRequest {
  subjectCode?: string;
  subjectName?: string;
  subjectNameShort?: string;
  measureKind?: string;
  unit?: string;
  scale?: number;
  aggregationMethod?: 'SUM' | 'EOP' | 'AVG' | 'MAX' | 'MIN';
  direction?: string;
  allowNegative?: boolean;
  notes?: string;
}

// Response DTOs
export interface BffSubjectTreeNode {
  id: string;
  subjectCode: string;
  subjectName: string;
  subjectClass: 'BASE' | 'AGGREGATE';
  subjectType: 'FIN' | 'KPI';
  isActive: boolean;
  coefficient?: number;         // rollup 関係の係数（子ノードのみ）
  children: BffSubjectTreeNode[];
}

export interface BffSubjectTreeResponse {
  nodes: BffSubjectTreeNode[];
  unassigned: BffSubjectTreeNode[];  // どの集計科目にも属さない科目
}

export interface BffSubjectDetailResponse {
  id: string;
  subjectCode: string;
  subjectName: string;
  subjectNameShort: string | null;
  subjectClass: 'BASE' | 'AGGREGATE';
  subjectType: 'FIN' | 'KPI';
  postingAllowed: boolean;
  measureKind: string;
  unit: string | null;
  scale: number;
  aggregationMethod: string;
  direction: string | null;
  allowNegative: boolean;
  isActive: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
```

**Rollup DTOs:**

```typescript
export interface BffAddRollupRequest {
  componentSubjectId: string;
  coefficient: number;          // +1, -1, etc.
  validFrom?: string;           // ISO 8601
  validTo?: string;             // ISO 8601
  sortOrder?: number;
}

export interface BffUpdateRollupRequest {
  coefficient?: number;
  validFrom?: string;
  validTo?: string;
  sortOrder?: number;
}

export interface BffMoveSubjectRequest {
  subjectId: string;
  fromParentId?: string;        // null = ルートから
  toParentId?: string;          // null = ルートへ
  coefficient?: number;         // default: +1
}
```

**Errors:**

```typescript
export const SubjectMasterErrorCode = {
  SUBJECT_NOT_FOUND: 'SUBJECT_NOT_FOUND',
  SUBJECT_CODE_DUPLICATE: 'SUBJECT_CODE_DUPLICATE',
  SUBJECT_ALREADY_INACTIVE: 'SUBJECT_ALREADY_INACTIVE',
  SUBJECT_ALREADY_ACTIVE: 'SUBJECT_ALREADY_ACTIVE',
  ROLLUP_ALREADY_EXISTS: 'ROLLUP_ALREADY_EXISTS',
  ROLLUP_NOT_FOUND: 'ROLLUP_NOT_FOUND',
  CIRCULAR_REFERENCE_DETECTED: 'CIRCULAR_REFERENCE_DETECTED',
  CANNOT_ADD_CHILD_TO_BASE: 'CANNOT_ADD_CHILD_TO_BASE',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;
```

### DTO import example (MANDATORY)

```ts
import type {
  BffSubjectTreeRequest,
  BffSubjectTreeResponse,
  BffSubjectTreeNode,
  BffSubjectDetailResponse,
  BffCreateSubjectRequest,
  BffUpdateSubjectRequest,
  BffAddRollupRequest,
  BffUpdateRollupRequest,
  BffMoveSubjectRequest,
} from "packages/contracts/src/bff/subject-master";
```

### Error UI behavior

* Show validation errors inline per field
* Show API/business errors in a top alert panel
* Map error codes to user-friendly messages:
  - SUBJECT_NOT_FOUND → 「科目が見つかりません」
  - SUBJECT_CODE_DUPLICATE → 「科目コードが重複しています」
  - SUBJECT_ALREADY_INACTIVE → 「この科目は既に無効化されています」
  - SUBJECT_ALREADY_ACTIVE → 「この科目は既に有効です」
  - ROLLUP_ALREADY_EXISTS → 「この構成科目は既に追加されています」
  - ROLLUP_NOT_FOUND → 「構成科目が見つかりません」
  - CIRCULAR_REFERENCE_DETECTED → 「循環参照が発生するため、この構成を追加できません」
  - CANNOT_ADD_CHILD_TO_BASE → 「通常科目の下には配置できません」
  - VALIDATION_ERROR → フィールド別にインラインエラー表示

---

## UI Output Requirements

Generate Next.js (App Router) + TypeScript + Tailwind UI.
Include:

1. Routes/pages for the screens (**page.tsx only; see "No layout.tsx" rule below**)
2. A typed `BffClient` interface (methods correspond to endpoints above)
3. `MockBffClient` returning sample DTO-shaped data
4. `HttpBffClient` with fetch wrappers (but keep it unused initially, easy to switch)
5. Data models in UI must be the DTO types from contracts/bff
6. Minimal but production-like UI (tree view, detail panel, forms, dialogs)

---

## Mock Data Requirements

Provide mock data sets that:

* cover empty state, typical state, and error state
* use realistic values for EPM domain:
  - 科目タイプ: FIN（財務科目）, KPI（非財務指標）
  - 科目クラス: BASE（通常科目）, AGGREGATE（集計科目）
  - 集計方法: SUM, EOP, AVG, MAX, MIN
  - メジャー種別: AMOUNT, COUNT, WEIGHT, RATIO
  - 科目コード例: 4010（売上高）, 5010（売上原価）, 6010（販管費）, GP01（粗利）, OP01（営業利益）
  - 科目名例: 売上高, 売上原価, 粗利益, 販管費, 営業利益, 経常利益
  - 集計構造例:
    - 粗利益(AGGREGATE) = 売上高(BASE, +1) - 売上原価(BASE, -1)
    - 営業利益(AGGREGATE) = 粗利益(AGGREGATE, +1) - 販管費(BASE, -1)
* strictly match the BFF response DTO shape

---

## Authentication / Tenant

* UI only attaches auth token to BFF requests.
* UI must not handle tenant_id directly.

---

# 🔒 REQUIRED: Design System & Repository Constraints (DO NOT REMOVE)

## EPM Design System Registry

You MUST use the EPM Design System from the custom registry:

* Registry URL: https://epm-registry-6xtkaywr0-tkoizumi-hira-tjps-projects.vercel.app
* Theme: EPM Theme - Deep Teal & Royal Indigo
* Primary Color: Deep Teal (oklch(0.52 0.13 195))
* Secondary Color: Royal Indigo (oklch(0.48 0.15 280))

---

## Source of Truth (SSoT)

You MUST follow these SSoT documents and files:

* apps/web/src/shared/ui/README.md
* apps/web/src/shared/ui/tokens/globals.css
* apps/web/src/shared/shell/AppShell.tsx (and related providers)
* apps/web/src/shared/navigation/menu.ts

---

## Design System Compliance

* Do NOT invent new base UI components (Button/Input/Table/Dialog/Tabs/etc).
* You MUST use Tier policy defined in:
  * apps/web/src/shared/ui/README.md (Tier 1/2/3)
  * apps/web/src/shared/ui/components/*
* v0 MUST use Tier 1 components by default.
  Use Tier 2/3 ONLY when explicitly instructed in the prompt.
* Do NOT create new "base UI" components under `apps/web/src/features/**`
  (e.g., button.tsx, input.tsx, table.tsx, dialog.tsx, tabs.tsx, badge.tsx).

### Available Tier 1 Components (EPM Registry)
* Button (primary=Deep Teal, secondary=Royal Indigo, destructive, outline, ghost, link)
* Table (with Header, Body, Row, Cell, Caption)
* Card (with Header, Title, Description, Content, Footer)
* Input (text, email, password, number, etc.)
* Dialog (with Trigger, Content, Header, Footer, Title, Description)
* Tabs (with List, Trigger, Content)
* Badge (default, secondary, destructive, outline)
* Alert (default, destructive with AlertTitle, AlertDescription)
* Separator (horizontal, vertical)
* Pagination (with Previous, Next, Item, Ellipsis)

### UI component import entrypoint (MANDATORY)
* Direct imports from `apps/web/src/shared/ui/components/*` are prohibited.
  If `@/shared/ui` barrel does not exist yet, add a TODO in OUTPUT.md (do NOT bypass via direct imports).
* UI components MUST be imported ONLY from:
  * `@/shared/ui`

### Missing Shared Component / Pattern policy

* If a needed component/pattern does not exist yet:
  * Do NOT implement it inside feature folders.
  * Instead, add a TODO list titled `Missing Shared Component / Pattern` in OUTPUT.md.

### Colors / spacing

* Do NOT hardcode colors (no `bg-[#...]`, no arbitrary color values).
* Use tokens / CSS variables / existing Tailwind semantic classes.
* Keep spacing and radius consistent:
  * use Tailwind scale (p-4, gap-4, rounded-lg, etc.)
  * avoid arbitrary values like `p-[16px]`.

---

## App Shell / Layout (MANDATORY)

* The screens must render inside the App Shell layout.
* Do NOT create a new sidebar/header layout inside the feature.
* Feature UI should be only the content area (cards/tables/forms/etc).

---

## v0 Isolation Output Path (MANDATORY)

* Write all generated code ONLY under:
  * apps/web/_v0_drop/master-data/subject-master/src
* Assume this `src/` folder will later be moved to:
  * apps/web/src/features/master-data/subject-master/
* Do NOT write to apps/web/src directly.
* Do NOT place source files outside the `src/` folder under `_v0_drop` (src-only).

---

## Prohibited Imports / Calls (MANDATORY)

### Imports / Contracts

* UI must NOT import from `packages/contracts/src/api`.
* UI must use `packages/contracts/src/bff` DTOs and errors only.
* Do NOT redefine DTO/Enum/Error types inside feature code (contracts are SSoT).

### Network Access

* UI must NOT call Domain API directly (no `/api/...` calls).
* UI must NOT create direct `fetch()` calls outside HttpBffClient wrapper.
* Direct `fetch()` is allowed ONLY inside:
  * `apps/web/_v0_drop/master-data/subject-master/src/api/HttpBffClient.ts`

### App Router / Shell

* Do NOT generate `layout.tsx` anywhere under the v0 output.
* Do NOT create a new sidebar/header/shell layout inside the feature.
* All screens MUST render inside the existing AppShell.

### Output Location

* Write ALL generated code ONLY under:
  * `apps/web/_v0_drop/master-data/subject-master/src`
* Do NOT write to `apps/web/src` directly.

---

## 🔻 REQUIRED OUTPUT ARTIFACT (MANDATORY)

You MUST create an `OUTPUT.md` file under:

* apps/web/_v0_drop/master-data/subject-master/src/OUTPUT.md

`OUTPUT.md` MUST include the following sections:

### 1) Generated files (tree)

* Provide a complete tree of everything you generated under the `src/` folder.

### 2) Key imports / dependency notes

* List important imports and where they come from:
  * `@/shared/ui` usage
  * `packages/contracts/src/bff` DTO imports
  * `BffClient` / `MockBffClient` / `HttpBffClient` relationships

### 3) Missing Shared Component / Pattern (TODO)

* A TODO list of any shared UI components/patterns you wanted but did not exist.
* Include suggested filenames and where they should live (shared/ui side).
* Do NOT implement them in the feature.
* **特に Tree View コンポーネントは Tier 2/3 として shared/ui への追加が必要**

### 4) Migration notes (_v0_drop → features)

* Step-by-step migration plan:
  * what folder to move
  * what paths/imports will change
  * what should be refactored into shared/ui (if any)

### 5) Constraint compliance checklist

* Check all items explicitly:
  * [ ] Code written ONLY under `apps/web/_v0_drop/master-data/subject-master/src`
  * [ ] UI components imported ONLY from `@/shared/ui`
  * [ ] DTO types imported from `packages/contracts/src/bff` (no UI re-definition)
  * [ ] No imports from `packages/contracts/src/api`
  * [ ] No Domain API direct calls (/api/)
  * [ ] No direct fetch() outside `api/HttpBffClient.ts`
  * [ ] No layout.tsx generated
  * [ ] No base UI components created under features
  * [ ] No raw color literals (bg-[#...], etc.)
  * [ ] No new sidebar/header/shell created inside the feature

---

## Handoff to Cursor

* Keep code modular and easy to migrate into:
  * apps/web/src/features/master-data/subject-master/
* Add brief migration notes in OUTPUT.md (what to move, what to refactor into shared/ui).

---

## UI Design Notes (EPM Domain Specific)

### 科目ツリー画面（2ペインレイアウト）

**左ペイン（ツリーパネル）**:
- 幅: 約40%（リサイズ可能が望ましい）
- ツリーノードの表示:
  - AGGREGATE 科目: フォルダアイコン + 展開/折りたたみ矢印
  - BASE 科目: ファイルアイコン
  - 係数表示: 子ノードには係数を表示（例: "+1", "-1"）
  - Badge で科目クラス・タイプを表示（FIN=primary, KPI=secondary, AGGREGATE=outline）
  - 無効科目はグレーアウト表示
- 検索・フィルタバー:
  - キーワード入力（インクリメンタルサーチ推奨）
  - 科目タイプ Select（FIN/KPI/All）
  - 科目クラス Select（BASE/AGGREGATE/All）
  - 有効フラグ Select（有効/無効/All）
- ツールバー:
  - 「通常科目を追加」ボタン
  - 「集計科目を追加」ボタン
  - 「すべて展開」/「すべて折りたたみ」ボタン

**右ペイン（詳細パネル）**:
- 幅: 約60%
- 科目未選択時: プレースホルダー表示（「科目を選択してください」）
- 科目選択時:
  - Card でラップ
  - ヘッダー: 科目コード + 科目名 + 編集/保存ボタン
  - ボディ: 2カラムグリッドで属性表示
  - AGGREGATE 科目の場合: 構成科目リストを Table で表示（コード、名前、係数、アクション）

### ドラッグ＆ドロップ

- ドラッグ中: ドラッグハンドル表示、シャドウ効果
- ドロップ可能位置: ハイライト表示（緑のボーダー）
- ドロップ不可位置: 視覚的フィードバック（赤いボーダー、禁止アイコン）
- BASE 科目の下にはドロップ不可
- 循環参照になる位置へはドロップ不可（API でチェック、エラー時ロールバック）

### フォーム

- subjectType は Select で選択（FIN, KPI）
- subjectClass は登録ダイアログ種別で自動決定（BASE or AGGREGATE）
- aggregationMethod は Select で選択（SUM, EOP, AVG, MAX, MIN）
- measureKind は Select または Input（AMOUNT, COUNT, WEIGHT, RATIO 等）
- coefficient は Number Input（-999999.9999 〜 +999999.9999、小数点4桁まで）
- AGGREGATE 登録時は postingAllowed フィールドを非表示または disabled + false 表示

### 色とバッジ

- 科目タイプ Badge:
  - FIN: primary（Deep Teal）
  - KPI: secondary（Royal Indigo）
- 科目クラス Badge:
  - BASE: outline
  - AGGREGATE: default
- 有効状態:
  - 有効: 通常表示
  - 無効: opacity-50 + Badge(destructive)「無効」
