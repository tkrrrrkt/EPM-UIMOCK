# v0 Prompt: Budget Entry (予算入力)

---

## 1. Design System

```
Use the EPM Design System from: https://epm-registry-6xtkaywr0-tkoizumi-hira-tjps-projects.vercel.app

Theme: Deep Teal & Royal Indigo
- Primary: oklch(0.52 0.13 195) - Deep Teal
- Secondary: oklch(0.48 0.15 280) - Royal Indigo
```

---

## 2. Context

```markdown
You are generating UI for an EPM (Enterprise Performance Management) SaaS.

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
**planning/budget-entry**: 予算入力画面 - Excel風グリッドで月次×科目の予算を入力

### 主要ユースケース
1. 部門責任者が月次予算を科目ごとにグリッド形式で入力
2. ディメンション展開（得意先別等）による明細入力
3. 集計科目（売上総利益、営業利益）の自動計算・表示
4. セル編集後の自動保存（500ms debounce）
5. バージョン比較（当初予算 vs 修正予算）の差異表示
```

---

## 4. Screens

```markdown
### Screen 1: Budget Entry Grid（メイン画面）

- **Purpose**: 月次予算をExcel風グリッドで入力
- **Layout**:
  - ContextSelector（上部）: 年度/部門/シナリオ/バージョン/比較バージョン選択
  - BudgetGrid（中央）: 行=科目、列=月（4月〜3月）+ 年計
  - StatusBar（下部）: コンテキスト情報表示

- **Grid Layout**:
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [年度: 2026 ▼] [部門: 営業1課 ▼] [バージョン: 第1回 ▼] [比較: 当初 ▼]        │
├─────────────────────────────────────────────────────────────────────────────┤
│ 科目           │ 4月    │ 5月    │ ... │ 3月    │ 年計     │
├─────────────────────────────────────────────────────────────────────────────┤
│ ▼ 売上高       │ 1,000  │ 1,200  │     │ 1,500  │ 15,000   │
│   └ 得意先A    │   400  │   500  │     │   600  │  6,000   │
│   └ 得意先B    │   350  │   400  │     │   500  │  5,000   │
│   └ 得意先C    │   250  │   300  │     │   400  │  4,000   │
│ 売上原価       │   600  │   700  │     │   900  │  9,000   │
│ 【売上総利益】 │   400  │   500  │     │   600  │  6,000   │
│ 販管費         │   300  │   350  │     │   400  │  4,200   │
│ 【営業利益】   │   100  │   150  │     │   200  │  1,800   │
└─────────────────────────────────────────────────────────────────────────────┘

凡例:
- ▼: 展開可能アイコン（クリックで子行表示/非表示）
- 【】: 集計科目（AGGREGATE）- 背景色 bg-muted/30、編集不可
- インデント: 子行は16px左インデント
```

- **Interactions**:
  - セルクリック → 編集モード（Input表示）
  - Tab → 右のセルへ移動
  - Shift+Tab → 左のセルへ移動
  - Enter → 下のセルへ移動
  - Shift+Enter → 上のセルへ移動
  - 矢印キー → 該当方向のセルへ移動
  - Escape → 編集キャンセル（元の値に戻す）
  - 展開アイコン(▼/▶)クリック → ディメンション子行の表示/非表示

- **Auto-save Behavior**:
  1. セル値変更を検知
  2. 500ms debounce（連続入力中は保存しない）
  3. BFF `/cell` エンドポイント呼び出し
  4. 保存中: セル横に Loader2 spinner (h-3 w-3)
  5. 成功: Check アイコン表示（1.5秒後消去）
  6. 失敗: AlertCircle + ツールチップでエラーメッセージ

- **Cell States**:
  - 通常: 数値表示（右揃え、font-mono）
  - 編集中: Input表示（border-0、focus-visible:ring-2）
  - 保存中: spinner + 数値
  - 保存完了: check + 数値（一時的）
  - エラー: AlertCircle + 数値、背景 bg-destructive/10

### Screen 2: Compare View（比較モード）

- **Purpose**: 2つのバージョン間の差異を表示
- **Trigger**: 比較バージョンセレクトで値を選択
- **Layout**: 各月に3列（当初/現行/差異）
- **Variance Colors**:
  - 正の差異: text-info（青）
  - 負の差異: text-destructive（赤）
  - ゼロ: text-foreground
```

---

## 5. BFF Contract

### Endpoints

| Method | Endpoint | Purpose | Request DTO | Response DTO |
|--------|----------|---------|-------------|--------------|
| GET | /api/bff/planning/budget-entry/grid | グリッドデータ取得 | BffBudgetGridRequest | BffBudgetGridResponse |
| GET | /api/bff/planning/budget-entry/context | コンテキスト取得 | - | BffBudgetContextResponse |
| PUT | /api/bff/planning/budget-entry/cell | セル値更新（単一） | BffUpdateCellRequest | BffUpdateCellResponse |
| PUT | /api/bff/planning/budget-entry/cells | セル値一括更新 | BffUpdateCellsRequest | BffUpdateCellsResponse |
| GET | /api/bff/planning/budget-entry/compare | バージョン比較取得 | BffBudgetCompareRequest | BffBudgetCompareResponse |

### DTOs

```typescript
// === Request DTOs ===

export interface BffBudgetGridRequest {
  fiscalYear: number;
  departmentId: string;
  planEventId: string;
  planVersionId: string;
}

export interface BffUpdateCellRequest {
  subjectId: string;
  periodId: string;
  dimensionValueId?: string;  // ディメンション展開時
  value: string | null;       // Decimal string or null (クリア)
}

export interface BffUpdateCellsRequest {
  cells: BffUpdateCellRequest[];
}

export interface BffBudgetCompareRequest {
  fiscalYear: number;
  departmentId: string;
  planEventId: string;
  baseVersionId: string;      // 比較元
  currentVersionId: string;   // 現行
}

// === Response DTOs ===

export interface BffBudgetContext {
  fiscalYear: number;
  departmentId: string;
  departmentName: string;
  planEventId: string;
  planEventName: string;
  planVersionId: string;
  planVersionName: string;
  planVersionStatus: PlanVersionStatus;
  isEditable: boolean;
}

export interface BffPeriodColumn {
  periodId: string;
  periodNo: number;        // 1-12
  periodLabel: string;     // "4月", "5月", ...
  isOpen: boolean;
  isEditable: boolean;
}

export interface BffBudgetCell {
  periodId: string;
  value: string | null;    // Decimal string or null
  isEditable: boolean;
  isDirty: boolean;
}

export interface BffBudgetRow {
  rowId: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  subjectClass: SubjectClass;  // 'BASE' | 'AGGREGATE'
  indentLevel: number;         // 0=科目, 1=ディメンション値
  isExpandable: boolean;
  isExpanded: boolean;
  isEditable: boolean;
  parentRowId: string | null;
  dimensionValueId: string | null;
  dimensionValueName: string | null;
  cells: BffBudgetCell[];
  annualTotal: string;
}

export interface BffBudgetGridResponse {
  context: BffBudgetContext;
  periods: BffPeriodColumn[];
  rows: BffBudgetRow[];
}

export interface BffBudgetContextResponse {
  fiscalYears: { value: number; label: string }[];
  departments: { id: string; code: string; name: string }[];
  planEvents: { id: string; code: string; name: string; scenarioType: string }[];
  planVersions: { id: string; code: string; name: string; status: string }[];
}

export interface BffAffectedRow {
  rowId: string;
  cells: BffBudgetCell[];
  annualTotal: string;
}

export interface BffUpdateCellResponse {
  success: boolean;
  updatedCell: BffBudgetCell;
  affectedRows: BffAffectedRow[];  // 集計科目の再計算結果
}

export interface BffUpdateCellsResponse {
  success: boolean;
  updatedCells: BffBudgetCell[];
  affectedRows: BffAffectedRow[];
}

// Compare View DTOs

export interface BffVarianceCell {
  periodId: string;
  value: string | null;
  isPositive: boolean;
}

export interface BffBudgetCompareRow extends BffBudgetRow {
  baseCells: BffBudgetCell[];
  currentCells: BffBudgetCell[];
  varianceCells: BffVarianceCell[];
}

export interface BffBudgetCompareResponse {
  context: BffBudgetContext;
  periods: BffPeriodColumn[];
  rows: BffBudgetCompareRow[];
}

// === Enums ===

export const PlanVersionStatus = {
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED",
  APPROVED: "APPROVED",
  FIXED: "FIXED",
} as const;
export type PlanVersionStatus = (typeof PlanVersionStatus)[keyof typeof PlanVersionStatus];

export const SubjectClass = {
  BASE: "BASE",
  AGGREGATE: "AGGREGATE",
} as const;
export type SubjectClass = (typeof SubjectClass)[keyof typeof SubjectClass];
```

### Errors → UI Messages

| Error Code | UI Message |
|------------|-----------|
| VERSION_IS_FIXED | 「確定済みバージョンは編集できません」 |
| PERIOD_IS_CLOSED | 「この月は締め済みです」 |
| INVALID_AMOUNT | 「金額が不正です」 |
| NEGATIVE_NOT_ALLOWED | 「この科目はマイナス値を入力できません」 |
| SUBJECT_NOT_FOUND | 「科目が見つかりません」 |
| SUBJECT_NOT_EDITABLE | 「この科目は編集できません」 |
| VALIDATION_ERROR | フィールド別インラインエラー |

### DTO Import（MANDATORY）

```typescript
import type {
  BffBudgetGridRequest,
  BffBudgetGridResponse,
  BffBudgetContextResponse,
  BffUpdateCellRequest,
  BffUpdateCellResponse,
  BffUpdateCellsRequest,
  BffUpdateCellsResponse,
  BffBudgetCompareRequest,
  BffBudgetCompareResponse,
  BffBudgetRow,
  BffPeriodColumn,
  BffBudgetCell,
  BffAffectedRow,
} from "@epm/contracts/bff/budget-entry";
```

---

## 6. UI Components

```markdown
### Tier 1（使用必須 - @/shared/ui から）
- Table, TableHeader, TableBody, TableRow, TableHead, TableCell
- Input, Label, Button, Badge
- Select, SelectTrigger, SelectContent, SelectItem, SelectValue
- Card, CardHeader, CardContent, CardTitle
- Tooltip, TooltipProvider, TooltipTrigger, TooltipContent

### Icons (lucide-react)
- ChevronRight, ChevronDown（行展開）
- Loader2（保存中）
- Check（保存完了）
- AlertCircle（エラー）
- Save（編集可能バッジ）

### Feature-specific Components（v0 が生成）
- BudgetGrid.tsx（メイングリッド）
- ContextSelector.tsx（コンテキスト選択）
- CompareView.tsx（比較表示）
- api/BffClient.ts, MockBffClient.ts, HttpBffClient.ts
```

---

## 7. Mock Data

```typescript
const MONTHS = ["4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月", "1月", "2月", "3月"];

const mockRows: BffBudgetRow[] = [
  {
    rowId: "row-sales",
    subjectId: "sub-sales",
    subjectCode: "1000",
    subjectName: "売上高",
    subjectClass: "BASE",
    indentLevel: 0,
    isExpandable: true,
    isExpanded: false,
    isEditable: true,
    parentRowId: null,
    dimensionValueId: null,
    dimensionValueName: null,
    cells: [
      { periodId: "period-1", value: "1000", isEditable: true, isDirty: false },
      { periodId: "period-2", value: "1200", isEditable: true, isDirty: false },
      // ... 12ヶ月分
    ],
    annualTotal: "15000",
  },
  {
    rowId: "row-sales-cust-a",
    subjectId: "sub-sales",
    subjectCode: "1000",
    subjectName: "得意先A",
    subjectClass: "BASE",
    indentLevel: 1,
    isExpandable: false,
    isExpanded: false,
    isEditable: true,
    parentRowId: "row-sales",
    dimensionValueId: "dim-cust-a",
    dimensionValueName: "得意先A",
    cells: [...], // 12ヶ月分
    annualTotal: "6000",
  },
  // ... 得意先B, 得意先C
  {
    rowId: "row-cogs",
    subjectId: "sub-cogs",
    subjectCode: "2000",
    subjectName: "売上原価",
    subjectClass: "BASE",
    indentLevel: 0,
    isExpandable: false,
    isExpanded: false,
    isEditable: true,
    parentRowId: null,
    dimensionValueId: null,
    dimensionValueName: null,
    cells: [...],
    annualTotal: "9000",
  },
  {
    rowId: "row-gross-profit",
    subjectId: "sub-gross-profit",
    subjectCode: "3000",
    subjectName: "売上総利益",
    subjectClass: "AGGREGATE",  // 集計科目
    indentLevel: 0,
    isExpandable: false,
    isExpanded: false,
    isEditable: false,          // 編集不可
    parentRowId: null,
    dimensionValueId: null,
    dimensionValueName: null,
    cells: [...],  // 売上高 - 売上原価
    annualTotal: "6000",
  },
  {
    rowId: "row-sga",
    subjectId: "sub-sga",
    subjectCode: "4000",
    subjectName: "販管費",
    subjectClass: "BASE",
    indentLevel: 0,
    isExpandable: false,
    isExpanded: false,
    isEditable: true,
    parentRowId: null,
    dimensionValueId: null,
    dimensionValueName: null,
    cells: [...],
    annualTotal: "4200",
  },
  {
    rowId: "row-operating-profit",
    subjectId: "sub-operating-profit",
    subjectCode: "5000",
    subjectName: "営業利益",
    subjectClass: "AGGREGATE",
    indentLevel: 0,
    isExpandable: false,
    isExpanded: false,
    isEditable: false,
    parentRowId: null,
    dimensionValueId: null,
    dimensionValueName: null,
    cells: [...],  // 売上総利益 - 販管費
    annualTotal: "1800",
  },
];

const mockContextResponse: BffBudgetContextResponse = {
  fiscalYears: [
    { value: 2026, label: "2026年度" },
    { value: 2025, label: "2025年度" },
  ],
  departments: [
    { id: "dept-sales-1", code: "S01", name: "営業1課" },
    { id: "dept-sales-2", code: "S02", name: "営業2課" },
    { id: "dept-dev", code: "D01", name: "開発部" },
  ],
  planEvents: [
    { id: "event-budget-2026", code: "BUD2026", name: "2026年度予算", scenarioType: "BUDGET" },
  ],
  planVersions: [
    { id: "version-1", code: "V1", name: "第1回", status: "DRAFT" },
    { id: "version-2", code: "V2", name: "第2回", status: "DRAFT" },
  ],
};
```

### States to Cover
- 通常状態（グリッドデータあり、編集可能）
- 読み取り専用状態（バージョン FIXED）
- 展開状態（ディメンション子行表示）
- 比較モード（2バージョン差異表示）
- セル編集中状態
- 保存中状態（spinner表示）
- エラー状態（セルレベルエラー）

---

## 8. Output Structure

### 重要：2つの出力先に同期して生成すること（MANDATORY）

v0 は以下の **2箇所に同じ内容を出力** すること：

---

### 1. プレビュー用（v0 内で動作確認）

v0 プロジェクトの `app/` に配置（プレビュー・調整用）:

```
app/planning/budget-entry/
├── page.tsx
└── components/
    ├── BudgetGrid.tsx
    ├── ContextSelector.tsx
    ├── CompareView.tsx
    └── api/
        ├── BffClient.ts
        ├── MockBffClient.ts
        └── HttpBffClient.ts
```

---

### 2. 移植用モジュール（DL して本番環境へ移植）

v0 プロジェクトの `_v0_drop/` に配置（移植用、プレビュー用と同期）:

```
_v0_drop/planning/budget-entry/src/
├── app/
│   └── page.tsx
├── ui/
│   ├── BudgetGrid.tsx
│   ├── ContextSelector.tsx
│   ├── CompareView.tsx
│   └── index.ts              # barrel export
├── api/
│   ├── BffClient.ts          # interface
│   ├── MockBffClient.ts      # mock implementation
│   ├── HttpBffClient.ts      # HTTP implementation
│   └── index.ts              # barrel export + factory
├── hooks/
│   └── useAutoSave.ts        # auto-save hook
├── lib/
│   └── error-messages.ts     # エラーコード → UIメッセージ
├── types/
│   └── index.ts              # 型定義（contracts からの re-export）
└── OUTPUT.md                 # 移植手順・チェックリスト
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
- @epm/contracts/bff/budget-entry から DTO 使用
- semantic tokens（bg-primary, text-foreground, border-input, bg-muted/30 等）
- Tailwind scale（p-4, gap-4, rounded-lg 等）
- MockBffClient でモックデータ提供
- OUTPUT.md 生成
- AGGREGATE科目は背景色 bg-muted/30 で表示
- 金額は font-mono text-right で表示
- 保存状態インジケーター（Loader2, Check, AlertCircle）
```

---

## 10. Visual Design Notes

```markdown
### グリッドスタイリング
- ヘッダー行: bg-muted/50
- 通常行: hover:bg-muted/50
- AGGREGATE行: bg-muted/30 font-medium
- 年計列: bg-muted/20 font-semibold
- セル: text-right font-mono text-sm
- 科目列: sticky left-0（横スクロール時固定）

### インデント
- indentLevel: 0 → paddingLeft: 0
- indentLevel: 1 → paddingLeft: 16px (子行)

### 展開アイコン
- isExpandable && isExpanded: ChevronDown
- isExpandable && !isExpanded: ChevronRight
- !isExpandable: 空スペース（幅 20px）

### 比較モード差異色
- 正の差異（value > 0）: text-info
- 負の差異（value < 0）: text-destructive
- ゼロ: text-foreground

### バッジ
- DRAFT: variant="outline"
- SUBMITTED: variant="outline"
- APPROVED: variant="default"
- FIXED: variant="secondary"
- 編集可能: variant="outline" + text-success border-success
```
