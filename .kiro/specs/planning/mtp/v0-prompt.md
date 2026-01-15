# v0 Prompt: planning/mtp（中期経営計画）

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
**planning/mtp**: 中期経営計画（MTP）機能 - 3〜5年スパンの経営目標値と戦略テーマを一元管理

### 主要ユースケース
1. 中期経営計画イベントの一覧表示・検索・フィルタリング
2. イベントの作成・複製・削除
3. PL科目の目標数値を組織ディメンション（事業部等）単位で入力・管理
4. 実績データ（N年分）と計画データ（N年分）を横並び表示してシミュレーション
5. 全社俯瞰：全事業部の数値を横並びで比較
6. 推移表示：グラフと表で実績→計画の推移を確認
7. 戦略テーマ（全社↔事業部カスケード）の作成・編集・削除
8. ステータス管理（DRAFT → CONFIRMED）とCONFIRMED時の編集制限
```

---

## 4. Screens

```markdown
### Screen 1: 一覧画面（/planning/mtp）
- **Purpose**: 中計イベントの一覧表示・管理
- **Layout**:
  - ヘッダー（タイトル + 新規作成ボタン）
  - フィルターパネル（ステータスフィルター）
  - データテーブル + ページネーション
- **Table Columns**:
  - イベントコード（eventCode）
  - イベント名（eventName）
  - 開始年度（startFiscalYear）
  - 計画年数（planYears）
  - ステータス（status）- Badge表示
  - 更新日時（updatedAt）
- **Interactions**:
  - 行クリック → 詳細画面へ遷移
  - 「新規作成」ボタン → CreateEventDialog
  - 行ホバー時アクションメニュー → 複製・削除

### Screen 2: 詳細画面（/planning/mtp/:eventId）
- **Purpose**: 数値入力・全社俯瞰・推移表示・戦略テーマの統合管理
- **Layout**: タブ構成（Tabs コンポーネント使用）
  - [入力] タブ（デフォルト表示）
  - [全社俯瞰] タブ
  - [推移] タブ
  - [戦略テーマ] タブ
- **Header（全タブ共通）**:
  - イベント名表示
  - ステータスBadge
  - 「ステータス変更」ボタン（DRAFT時のみ）
  - 「戻る」リンク

---

#### タブ1: 入力（MtpInputTab）

**Purpose**: 事業部別に実績+計画数値を入力・シミュレーション

**Layout**:
- 上部: ディメンション値セレクター（全社 / A事業部 / B事業部...）
- 下部: 数値入力グリッド

**数値入力グリッド仕様**:
- **行**: 科目（subjectName）- レイアウト順
- **列構成（planYears=3の場合）**:
  - 実績列: FY2023実績, FY2024実績, FY2025実績（グレー背景、読み取り専用）
  - 計画列: FY2026計画, FY2027計画, FY2028計画（白背景、編集可能）
  - 年計列: 計画合計（集計表示）
- **実績列の数**: 計画年数と同じ（planYears=3なら3年分実績）
- **セル状態**:
  - 実績列: bg-muted（グレー）、編集不可
  - 計画列（編集可能）: 白背景、フォーカス時ボーダーハイライト
  - 計画列（読み取り専用）: bg-muted/50（CONFIRMED時 or 全社選択時）
  - 集計行: bg-muted/50、太字、編集不可
- **Interactions**:
  - セルクリック → 編集モード（計画列のみ）
  - Tab: 右セルへ移動
  - Enter: 下セルへ移動
  - 矢印キー: 各方向へ移動
  - Escape: 編集キャンセル
  - 500msデバウンス → 自動保存
- **States**:
  - 通常: 編集可能（白背景）
  - 読み取り専用: CONFIRMED時 or 全社選択時（グレー背景）
  - 保存中: ローディングインジケーター

---

#### タブ2: 全社俯瞰（MtpOverviewTab）

**Purpose**: 全事業部の数値を横並びで比較

**Layout**:
- フィルターなし（固定表示、スクロールで対応）
- グリッド形式

**グリッド構成**:
```
| 科目/年度       | 全社合計 | A事業部 | B事業部 | C事業部 |
|----------------|---------|--------|--------|--------|
| FY2026 売上高   | 30,000  | 12,000 | 10,000 | 8,000  |
| FY2026 営業利益 | 4,500   | 2,000  | 1,500  | 1,000  |
| FY2027 売上高   | 33,000  | 13,000 | 11,000 | 9,000  |
| FY2027 営業利益 | 5,000   | 2,200  | 1,700  | 1,100  |
| FY2028 売上高   | 36,000  | 14,000 | 12,000 | 10,000 |
| FY2028 営業利益 | 5,500   | 2,400  | 1,900  | 1,200  |
```

- **列**: 全社合計（左端） + 全事業部（横並び）
- **行**: 年度 × 科目（全計画年度を展開）
- **読み取り専用**: 編集不可
- **構成比・差異**を一覧で把握

---

#### タブ3: 推移（MtpTrendTab）

**Purpose**: 実績→計画の推移をグラフ+表で確認

**Layout**:
- 上部: グラフエリア
- 下部: 表エリア

**グラフエリア**:
- 科目セレクター（売上高、営業利益など）
- 表示切替: 全社 / 選択事業部（セレクトボックス）
- グラフタイプ: 折れ線グラフ（Recharts使用）
- X軸: 年度（実績期間 + 計画期間）
- Y軸: 金額
- 実績と計画を色分け表示（実績: solid、計画: dashed）

**表エリア**:
- 全社のみ表示（事業部は入力タブで確認）
- 実績 + 計画を横並び
- 集計行あり

---

#### タブ4: 戦略テーマ（MtpStrategyTab）

**Purpose**: 戦略テーマのツリー表示・CRUD

**Layout**:
- ヘッダー（「戦略テーマ」+ 「新規作成」ボタン）
- ツリー表示（全社テーマ → 事業部テーマ）

**Tree Node Content**:
- テーマ名
- 戦略種別Badge
- 責任者
- 関連KPI（チップ表示）

**Interactions**:
- ノードクリック → EditThemeDialog
- 削除ボタン → 確認ダイアログ
- 親テーマに子を追加可能

---

### Screen 3: CreateEventDialog
- **Purpose**: 新規イベント作成
- **Trigger**: 一覧画面「新規作成」ボタン
- **Form Fields**:
  - イベントコード* (required, unique)
  - イベント名* (required)
  - 計画年数* (required, Select: 3年/5年)
  - 開始年度* (required, Select: 年度リスト)
  - 組織ディメンション* (required, Select)
  - レイアウト* (required, Select)
  - 説明 (optional, Textarea)
- **Actions**: 作成 / キャンセル
- **Validation**:
  - イベントコード重複チェック（サーバーサイド）

### Screen 4: DuplicateEventDialog
- **Purpose**: 既存イベントの複製
- **Trigger**: 一覧行アクションメニュー「複製」
- **Form Fields**:
  - 新イベントコード* (required, unique)
  - 新イベント名* (required)
- **Actions**: 複製 / キャンセル

### Screen 5: CreateThemeDialog / EditThemeDialog
- **Purpose**: 戦略テーマの作成・編集
- **Trigger**: テーマタブ「新規作成」ボタン / ツリーノードクリック
- **Form Fields**:
  - テーマコード* (required, 作成時のみ)
  - テーマ名* (required)
  - 親テーマ (optional, Select - 全社テーマのみ)
  - 対象ディメンション値 (required if 事業部テーマ)
  - 戦略種別 (optional, Text)
  - 概要 (optional, Textarea)
  - 責任者 (optional, Select - 従業員マスタから)
  - 期限 (optional, DatePicker)
  - 関連KPI (optional, MultiSelect - 科目マスタから)
- **Actions**: 保存 / キャンセル / 削除（編集時のみ）

### Screen 6: ConfirmStatusDialog
- **Purpose**: ステータス変更確認
- **Content**: 「ステータスを{CONFIRMED}に変更しますか？変更後は数値・テーマの編集ができなくなります。」
- **Actions**: 変更する / キャンセル
```

---

## 5. BFF Contract

### Endpoints

| Method | Endpoint | Purpose | Request DTO | Response DTO |
|--------|----------|---------|-------------|--------------|
| GET | /api/bff/planning/mtp | イベント一覧取得 | BffListMtpEventsRequest | BffListMtpEventsResponse |
| GET | /api/bff/planning/mtp/:eventId | イベント詳細取得 | - | BffMtpEventDetailResponse |
| POST | /api/bff/planning/mtp | イベント作成 | BffCreateMtpEventRequest | BffMtpEventResponse |
| PUT | /api/bff/planning/mtp/:eventId | イベント更新 | BffUpdateMtpEventRequest | BffMtpEventResponse |
| POST | /api/bff/planning/mtp/:eventId/duplicate | イベント複製 | BffDuplicateMtpEventRequest | BffMtpEventResponse |
| DELETE | /api/bff/planning/mtp/:eventId | イベント削除 | - | void |
| GET | /api/bff/planning/mtp/:eventId/amounts | 入力タブ用数値取得 | BffGetMtpAmountsRequest | BffMtpAmountsResponse |
| PUT | /api/bff/planning/mtp/:eventId/amounts | 数値保存 | BffSaveMtpAmountsRequest | BffSaveMtpAmountsResponse |
| GET | /api/bff/planning/mtp/:eventId/overview | 全社俯瞰タブ用数値取得 | - | BffMtpOverviewResponse |
| GET | /api/bff/planning/mtp/:eventId/trend | 推移タブ用数値取得 | BffGetMtpTrendRequest | BffMtpTrendResponse |
| GET | /api/bff/planning/mtp/:eventId/themes | 戦略テーマ一覧取得 | - | BffListStrategyThemesResponse |
| POST | /api/bff/planning/mtp/:eventId/themes | 戦略テーマ作成 | BffCreateStrategyThemeRequest | BffStrategyThemeResponse |
| PUT | /api/bff/planning/mtp/:eventId/themes/:themeId | 戦略テーマ更新 | BffUpdateStrategyThemeRequest | BffStrategyThemeResponse |
| DELETE | /api/bff/planning/mtp/:eventId/themes/:themeId | 戦略テーマ削除 | - | void |

### DTOs

```typescript
// ============================================
// Enums
// ============================================
export const MtpEventStatus = {
  DRAFT: 'DRAFT',
  CONFIRMED: 'CONFIRMED',
} as const;
export type MtpEventStatus = (typeof MtpEventStatus)[keyof typeof MtpEventStatus];

export const PlanYears = {
  THREE: 3,
  FIVE: 5,
} as const;
export type PlanYears = (typeof PlanYears)[keyof typeof PlanYears];

// ============================================
// Event DTOs
// ============================================
export interface BffListMtpEventsRequest {
  page?: number;
  pageSize?: number;
  sortBy?: 'eventCode' | 'eventName' | 'startFiscalYear' | 'status' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  status?: MtpEventStatus;
}

export interface BffMtpEventSummary {
  id: string;
  eventCode: string;
  eventName: string;
  planYears: number;
  startFiscalYear: number;
  endFiscalYear: number;
  status: MtpEventStatus;
  updatedAt: string;
}

export interface BffListMtpEventsResponse {
  items: BffMtpEventSummary[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface BffCreateMtpEventRequest {
  eventCode: string;
  eventName: string;
  planYears: PlanYears;
  startFiscalYear: number;
  dimensionId: string;
  layoutId: string;
  description?: string;
}

export interface BffUpdateMtpEventRequest {
  eventName?: string;
  status?: MtpEventStatus;
  description?: string;
}

export interface BffDuplicateMtpEventRequest {
  newEventCode: string;
  newEventName: string;
}

export interface BffMtpEventResponse {
  id: string;
  eventCode: string;
  eventName: string;
  planYears: number;
  startFiscalYear: number;
  endFiscalYear: number;
  dimensionId: string;
  layoutId: string;
  status: MtpEventStatus;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BffMtpEventDetailResponse extends BffMtpEventResponse {
  dimensionName: string;
  layoutName: string;
  dimensionValues: BffDimensionValueSummary[];
}

export interface BffDimensionValueSummary {
  id: string;
  valueCode: string;
  valueName: string;
}

// ============================================
// Amount DTOs（入力タブ用）
// ============================================
export interface BffGetMtpAmountsRequest {
  dimensionValueId?: string;  // null = 全社合計
}

export interface BffAmountColumn {
  fiscalYear: number;
  isActual: boolean;  // true = 実績列（グレー背景）, false = 計画列
}

export interface BffMtpAmountCell {
  subjectId: string;
  fiscalYear: number;
  amount: string;  // Decimal as string
  isActual: boolean;
}

export interface BffMtpAmountsResponse {
  subjects: BffSubjectRow[];
  columns: BffAmountColumn[];  // 実績列 + 計画列の順
  amounts: BffMtpAmountCell[];
  isReadOnly: boolean;  // 全社選択時 or CONFIRMED時
}

export interface BffSubjectRow {
  id: string;
  subjectCode: string;
  subjectName: string;
  sortOrder: number;
  isAggregate: boolean;
}

export interface BffSaveMtpAmountsRequest {
  dimensionValueId: string;
  amounts: BffMtpAmountCell[];  // isActual=false のもののみ
}

export interface BffSaveMtpAmountsResponse {
  savedCount: number;
  updatedAt: string;
}

// ============================================
// Overview DTOs（全社俯瞰タブ用）
// ============================================
export interface BffMtpOverviewResponse {
  subjects: BffSubjectRow[];
  fiscalYears: number[];  // 計画年度のみ
  dimensionValues: BffDimensionValueSummary[];  // 全社 + 各事業部
  amounts: BffOverviewAmountCell[];
}

export interface BffOverviewAmountCell {
  subjectId: string;
  fiscalYear: number;
  dimensionValueId: string | null;  // null = 全社合計
  amount: string;
}

// ============================================
// Trend DTOs（推移タブ用）
// ============================================
export interface BffGetMtpTrendRequest {
  subjectId?: string;  // 指定なしの場合はデフォルト科目
  dimensionValueId?: string;  // null = 全社
}

export interface BffMtpTrendResponse {
  subject: BffSubjectRow;
  dimensionValue: BffDimensionValueSummary | null;  // null = 全社
  dataPoints: BffTrendDataPoint[];
  tableData: BffTrendTableRow[];
}

export interface BffTrendDataPoint {
  fiscalYear: number;
  amount: number;  // グラフ用は number
  isActual: boolean;
}

export interface BffTrendTableRow {
  subjectId: string;
  subjectName: string;
  amounts: { fiscalYear: number; amount: string; isActual: boolean }[];
}

// ============================================
// Strategy Theme DTOs
// ============================================
export interface BffStrategyThemeSummary {
  id: string;
  themeCode: string;
  themeName: string;
  parentThemeId: string | null;
  dimensionValueId: string | null;
  dimensionValueName: string | null;
  strategyCategory: string | null;
  ownerName: string | null;
  targetDate: string | null;
  kpis: BffThemeKpiSummary[];
  children: BffStrategyThemeSummary[];
}

export interface BffThemeKpiSummary {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
}

export interface BffListStrategyThemesResponse {
  themes: BffStrategyThemeSummary[];
}

export interface BffCreateStrategyThemeRequest {
  themeCode: string;
  themeName: string;
  parentThemeId?: string;
  dimensionValueId?: string;
  strategyCategory?: string;
  description?: string;
  ownerEmployeeId?: string;
  targetDate?: string;
  kpiSubjectIds?: string[];
}

export interface BffUpdateStrategyThemeRequest {
  themeName?: string;
  strategyCategory?: string;
  description?: string;
  ownerEmployeeId?: string;
  targetDate?: string;
  kpiSubjectIds?: string[];
}

export interface BffStrategyThemeResponse {
  id: string;
  themeCode: string;
  themeName: string;
  parentThemeId: string | null;
  dimensionValueId: string | null;
  strategyCategory: string | null;
  description: string | null;
  ownerEmployeeId: string | null;
  ownerName: string | null;
  targetDate: string | null;
  kpis: BffThemeKpiSummary[];
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Error Types
// ============================================
export const MtpErrorCode = {
  EVENT_NOT_FOUND: 'MTP_EVENT_NOT_FOUND',
  EVENT_CODE_DUPLICATE: 'MTP_EVENT_CODE_DUPLICATE',
  EVENT_CONFIRMED_IMMUTABLE: 'MTP_EVENT_CONFIRMED_IMMUTABLE',
  EVENT_CONFIRMED_DELETE_DENIED: 'MTP_EVENT_CONFIRMED_DELETE_DENIED',
  THEME_NOT_FOUND: 'MTP_THEME_NOT_FOUND',
  THEME_CODE_DUPLICATE: 'MTP_THEME_CODE_DUPLICATE',
  THEME_HAS_CHILDREN: 'MTP_THEME_HAS_CHILDREN',
  DIMENSION_NOT_FOUND: 'MTP_DIMENSION_NOT_FOUND',
  LAYOUT_NOT_FOUND: 'MTP_LAYOUT_NOT_FOUND',
  DIMENSION_VALUE_REQUIRED: 'MTP_DIMENSION_VALUE_REQUIRED',
  VALIDATION_ERROR: 'MTP_VALIDATION_ERROR',
} as const;

export type MtpErrorCode = (typeof MtpErrorCode)[keyof typeof MtpErrorCode];

export interface MtpError {
  code: MtpErrorCode;
  message: string;
  details?: Record<string, unknown>;
}
```

### Errors → UI Messages

| Error Code | UI Message |
|------------|-----------|
| MTP_EVENT_NOT_FOUND | 「中計イベントが見つかりません」 |
| MTP_EVENT_CODE_DUPLICATE | 「イベントコードが重複しています」 |
| MTP_EVENT_CONFIRMED_IMMUTABLE | 「確定済みイベントは編集できません」 |
| MTP_EVENT_CONFIRMED_DELETE_DENIED | 「確定済みイベントは削除できません」 |
| MTP_THEME_NOT_FOUND | 「戦略テーマが見つかりません」 |
| MTP_THEME_CODE_DUPLICATE | 「テーマコードが重複しています」 |
| MTP_THEME_HAS_CHILDREN | 「子テーマが存在するため削除できません」 |
| MTP_DIMENSION_NOT_FOUND | 「組織ディメンションが見つかりません」 |
| MTP_LAYOUT_NOT_FOUND | 「レイアウトが見つかりません」 |
| MTP_DIMENSION_VALUE_REQUIRED | 「事業部テーマにはディメンション値が必要です」 |
| MTP_VALIDATION_ERROR | フィールド別インラインエラー |

### DTO Import（MANDATORY）

```typescript
import type {
  MtpEventStatus,
  PlanYears,
  BffListMtpEventsRequest,
  BffListMtpEventsResponse,
  BffMtpEventSummary,
  BffMtpEventDetailResponse,
  BffCreateMtpEventRequest,
  BffUpdateMtpEventRequest,
  BffDuplicateMtpEventRequest,
  BffMtpEventResponse,
  BffGetMtpAmountsRequest,
  BffMtpAmountsResponse,
  BffAmountColumn,
  BffMtpAmountCell,
  BffSubjectRow,
  BffSaveMtpAmountsRequest,
  BffSaveMtpAmountsResponse,
  BffMtpOverviewResponse,
  BffOverviewAmountCell,
  BffGetMtpTrendRequest,
  BffMtpTrendResponse,
  BffTrendDataPoint,
  BffTrendTableRow,
  BffStrategyThemeSummary,
  BffThemeKpiSummary,
  BffListStrategyThemesResponse,
  BffCreateStrategyThemeRequest,
  BffUpdateStrategyThemeRequest,
  BffStrategyThemeResponse,
  MtpErrorCode,
  MtpError,
} from "@epm/contracts/bff/mtp";
```

---

## 6. UI Components

```markdown
### Tier 1（使用必須 - @/shared/ui から）
- Button, Input, Textarea, Select, Checkbox, Label
- Table, Pagination, Card, Dialog, Alert, Badge, Tabs
- Toast/Sonner, Popover, Tooltip, Dropdown Menu
- Separator, Skeleton, Spinner

### Tier 2（必要時のみ）
- Calendar (DatePicker)
- Form (react-hook-form)
- Scroll Area (ツリー表示)

### Tier 3（外部ライブラリ - 必須）
- Recharts（グラフ表示 - 推移タブ）

### Feature-specific Components（v0 が生成）

**タブコンポーネント**
- MtpInputTab.tsx（入力タブ - 実績+計画グリッド）
- MtpOverviewTab.tsx（全社俯瞰タブ）
- MtpTrendTab.tsx（推移タブ - グラフ+表）
- MtpStrategyTab.tsx（戦略テーマタブ）

**共通コンポーネント**
- MtpEventListPage.tsx（一覧画面）
- MtpEventDetailPage.tsx（詳細画面 - タブ構成）
- MtpAmountGrid.tsx（数値グリッド - 実績列+計画列対応）
- OverviewGrid.tsx（全社俯瞰グリッド - 読み取り専用）
- TrendChart.tsx（推移グラフ - Recharts）
- TrendTable.tsx（推移表）
- StrategyThemeTree.tsx（ツリー表示）
- DimensionValueSelector.tsx（ディメンション値選択）

**ダイアログ**
- dialogs/
  - CreateEventDialog.tsx
  - DuplicateEventDialog.tsx
  - CreateThemeDialog.tsx
  - EditThemeDialog.tsx
  - ConfirmStatusDialog.tsx
  - DeleteConfirmDialog.tsx

**API層**
- api/
  - BffClient.ts（interface）
  - MockBffClient.ts（mock implementation）
  - HttpBffClient.ts（HTTP implementation）
```

---

## 7. Mock Data

### Sample Data（BFF Response 形状と一致必須）

```typescript
// イベント一覧
const mockEvents: BffMtpEventSummary[] = [
  {
    id: "mtp-001",
    eventCode: "MTP2026",
    eventName: "2026年中期経営計画",
    planYears: 3,
    startFiscalYear: 2026,
    endFiscalYear: 2028,
    status: "DRAFT",
    updatedAt: "2026-01-10T09:00:00Z",
  },
  {
    id: "mtp-002",
    eventCode: "MTP2025",
    eventName: "2025年中期経営計画",
    planYears: 5,
    startFiscalYear: 2025,
    endFiscalYear: 2029,
    status: "CONFIRMED",
    updatedAt: "2025-04-01T10:30:00Z",
  },
  {
    id: "mtp-003",
    eventCode: "MTP2024",
    eventName: "2024年中期経営計画（改定）",
    planYears: 3,
    startFiscalYear: 2024,
    endFiscalYear: 2026,
    status: "CONFIRMED",
    updatedAt: "2024-03-15T14:00:00Z",
  },
];

// ディメンション値（事業部等）
const mockDimensionValues: BffDimensionValueSummary[] = [
  { id: "dv-all", valueCode: "ALL", valueName: "全社合計" },
  { id: "dv-001", valueCode: "DIV_A", valueName: "A事業部" },
  { id: "dv-002", valueCode: "DIV_B", valueName: "B事業部" },
  { id: "dv-003", valueCode: "DIV_C", valueName: "C事業部" },
];

// 科目（レイアウト順）
const mockSubjects: BffSubjectRow[] = [
  { id: "subj-001", subjectCode: "1000", subjectName: "売上高", sortOrder: 1, isAggregate: false },
  { id: "subj-002", subjectCode: "1100", subjectName: "売上原価", sortOrder: 2, isAggregate: false },
  { id: "subj-003", subjectCode: "1200", subjectName: "売上総利益", sortOrder: 3, isAggregate: true },
  { id: "subj-004", subjectCode: "2000", subjectName: "販管費", sortOrder: 4, isAggregate: false },
  { id: "subj-005", subjectCode: "2100", subjectName: "営業利益", sortOrder: 5, isAggregate: true },
];

// 列定義（入力タブ用 - planYears=3の場合）
const mockColumns: BffAmountColumn[] = [
  { fiscalYear: 2023, isActual: true },
  { fiscalYear: 2024, isActual: true },
  { fiscalYear: 2025, isActual: true },
  { fiscalYear: 2026, isActual: false },
  { fiscalYear: 2027, isActual: false },
  { fiscalYear: 2028, isActual: false },
];

// 数値データ（入力タブ用 - 実績+計画）
const mockAmounts: BffMtpAmountCell[] = [
  // 実績データ
  { subjectId: "subj-001", fiscalYear: 2023, amount: "9000000000", isActual: true },
  { subjectId: "subj-001", fiscalYear: 2024, amount: "9500000000", isActual: true },
  { subjectId: "subj-001", fiscalYear: 2025, amount: "10000000000", isActual: true },
  // 計画データ
  { subjectId: "subj-001", fiscalYear: 2026, amount: "10000000000", isActual: false },
  { subjectId: "subj-001", fiscalYear: 2027, amount: "11000000000", isActual: false },
  { subjectId: "subj-001", fiscalYear: 2028, amount: "12000000000", isActual: false },
  // 売上原価
  { subjectId: "subj-002", fiscalYear: 2023, amount: "5500000000", isActual: true },
  { subjectId: "subj-002", fiscalYear: 2024, amount: "5800000000", isActual: true },
  { subjectId: "subj-002", fiscalYear: 2025, amount: "6000000000", isActual: true },
  { subjectId: "subj-002", fiscalYear: 2026, amount: "6000000000", isActual: false },
  { subjectId: "subj-002", fiscalYear: 2027, amount: "6500000000", isActual: false },
  { subjectId: "subj-002", fiscalYear: 2028, amount: "7000000000", isActual: false },
  // 販管費
  { subjectId: "subj-004", fiscalYear: 2023, amount: "2200000000", isActual: true },
  { subjectId: "subj-004", fiscalYear: 2024, amount: "2350000000", isActual: true },
  { subjectId: "subj-004", fiscalYear: 2025, amount: "2500000000", isActual: true },
  { subjectId: "subj-004", fiscalYear: 2026, amount: "2500000000", isActual: false },
  { subjectId: "subj-004", fiscalYear: 2027, amount: "2700000000", isActual: false },
  { subjectId: "subj-004", fiscalYear: 2028, amount: "2900000000", isActual: false },
];

// 全社俯瞰データ
const mockOverviewAmounts: BffOverviewAmountCell[] = [
  // 全社合計
  { subjectId: "subj-001", fiscalYear: 2026, dimensionValueId: null, amount: "30000000000" },
  { subjectId: "subj-001", fiscalYear: 2027, dimensionValueId: null, amount: "33000000000" },
  { subjectId: "subj-001", fiscalYear: 2028, dimensionValueId: null, amount: "36000000000" },
  { subjectId: "subj-005", fiscalYear: 2026, dimensionValueId: null, amount: "4500000000" },
  { subjectId: "subj-005", fiscalYear: 2027, dimensionValueId: null, amount: "5000000000" },
  { subjectId: "subj-005", fiscalYear: 2028, dimensionValueId: null, amount: "5500000000" },
  // A事業部
  { subjectId: "subj-001", fiscalYear: 2026, dimensionValueId: "dv-001", amount: "12000000000" },
  { subjectId: "subj-001", fiscalYear: 2027, dimensionValueId: "dv-001", amount: "13000000000" },
  { subjectId: "subj-001", fiscalYear: 2028, dimensionValueId: "dv-001", amount: "14000000000" },
  { subjectId: "subj-005", fiscalYear: 2026, dimensionValueId: "dv-001", amount: "2000000000" },
  { subjectId: "subj-005", fiscalYear: 2027, dimensionValueId: "dv-001", amount: "2200000000" },
  { subjectId: "subj-005", fiscalYear: 2028, dimensionValueId: "dv-001", amount: "2400000000" },
  // B事業部、C事業部も同様...
];

// 推移グラフデータ
const mockTrendDataPoints: BffTrendDataPoint[] = [
  { fiscalYear: 2023, amount: 9000000000, isActual: true },
  { fiscalYear: 2024, amount: 9500000000, isActual: true },
  { fiscalYear: 2025, amount: 10000000000, isActual: true },
  { fiscalYear: 2026, amount: 10000000000, isActual: false },
  { fiscalYear: 2027, amount: 11000000000, isActual: false },
  { fiscalYear: 2028, amount: 12000000000, isActual: false },
];

// 戦略テーマ（ツリー構造）
const mockThemes: BffStrategyThemeSummary[] = [
  {
    id: "theme-001",
    themeCode: "ST001",
    themeName: "海外事業拡大",
    parentThemeId: null,
    dimensionValueId: null,
    dimensionValueName: null,
    strategyCategory: "売上拡大",
    ownerName: "山田太郎",
    targetDate: "2028-03-31",
    kpis: [
      { subjectId: "subj-001", subjectCode: "1000", subjectName: "売上高" },
    ],
    children: [
      {
        id: "theme-002",
        themeCode: "ST001-A",
        themeName: "北米市場新規開拓",
        parentThemeId: "theme-001",
        dimensionValueId: "dv-001",
        dimensionValueName: "A事業部",
        strategyCategory: "売上拡大",
        ownerName: "鈴木一郎",
        targetDate: "2027-09-30",
        kpis: [],
        children: [],
      },
      {
        id: "theme-003",
        themeCode: "ST001-B",
        themeName: "アジア市場シェア拡大",
        parentThemeId: "theme-001",
        dimensionValueId: "dv-002",
        dimensionValueName: "B事業部",
        strategyCategory: "売上拡大",
        ownerName: "佐藤次郎",
        targetDate: "2028-03-31",
        kpis: [],
        children: [],
      },
    ],
  },
  {
    id: "theme-004",
    themeCode: "ST002",
    themeName: "生産性向上・コスト削減",
    parentThemeId: null,
    dimensionValueId: null,
    dimensionValueName: null,
    strategyCategory: "コスト削減",
    ownerName: "高橋三郎",
    targetDate: "2027-03-31",
    kpis: [
      { subjectId: "subj-002", subjectCode: "1100", subjectName: "売上原価" },
      { subjectId: "subj-004", subjectCode: "2000", subjectName: "販管費" },
    ],
    children: [],
  },
];

// 従業員（責任者選択用）
const mockEmployees = [
  { id: "emp-001", name: "山田太郎" },
  { id: "emp-002", name: "鈴木一郎" },
  { id: "emp-003", name: "佐藤次郎" },
  { id: "emp-004", name: "高橋三郎" },
];

// 組織ディメンション（イベント作成用）
const mockDimensions = [
  { id: "dim-001", dimensionCode: "ORG_MTP", dimensionName: "中計用組織区分" },
  { id: "dim-002", dimensionCode: "ORG_BUDGET", dimensionName: "予算用組織区分" },
];

// レイアウト（イベント作成用）
const mockLayouts = [
  { id: "layout-001", layoutCode: "MTP_PL", layoutName: "中計PL科目レイアウト" },
  { id: "layout-002", layoutCode: "MTP_SIMPLE", layoutName: "中計簡易レイアウト" },
];
```

### States to Cover
- 通常状態（データあり）
- 空状態（データなし - 「中計イベントがありません」）
- 編集可能状態（DRAFT + 事業部選択）
- 読み取り専用状態（CONFIRMED or 全社選択）
- 実績列（常に読み取り専用、グレー背景）
- 計画列（編集可能 or 読み取り専用）
- 保存中状態（グリッド保存インジケーター）
- エラー状態（バリデーション、ビジネスエラー）

---

## 8. Output Structure（二重出力：プレビュー用 + 移植用）

### 重要：2つの出力先に同期して生成すること（MANDATORY）

v0 は以下の **2箇所に同じ内容を出力** すること：

---

### 1. プレビュー用（v0 内で動作確認）

v0 プロジェクトの `app/` に配置（プレビュー・調整用）:

```
app/planning/mtp/
├── page.tsx                              # 一覧画面
├── [eventId]/
│   └── page.tsx                          # 詳細画面（タブ構成）
└── components/
    ├── MtpEventListPage.tsx
    ├── MtpEventDetailPage.tsx
    ├── tabs/
    │   ├── MtpInputTab.tsx               # 入力タブ
    │   ├── MtpOverviewTab.tsx            # 全社俯瞰タブ
    │   ├── MtpTrendTab.tsx               # 推移タブ
    │   └── MtpStrategyTab.tsx            # 戦略テーマタブ
    ├── MtpAmountGrid.tsx                 # 実績+計画グリッド
    ├── OverviewGrid.tsx                  # 全社俯瞰グリッド
    ├── TrendChart.tsx                    # 推移グラフ
    ├── TrendTable.tsx                    # 推移表
    ├── StrategyThemeTree.tsx
    ├── DimensionValueSelector.tsx
    ├── dialogs/
    │   ├── CreateEventDialog.tsx
    │   ├── DuplicateEventDialog.tsx
    │   ├── CreateThemeDialog.tsx
    │   ├── EditThemeDialog.tsx
    │   ├── ConfirmStatusDialog.tsx
    │   └── DeleteConfirmDialog.tsx
    └── api/
        ├── BffClient.ts
        ├── MockBffClient.ts
        └── HttpBffClient.ts
```

---

### 2. 移植用モジュール（DL して本番環境へ移植）

v0 プロジェクトの `_v0_drop/` に配置（移植用、プレビュー用と同期）:

```
_v0_drop/planning/mtp/src/
├── app/
│   ├── page.tsx                          # 一覧画面
│   └── [eventId]/
│       └── page.tsx                      # 詳細画面
├── ui/
│   ├── MtpEventListPage.tsx
│   ├── MtpEventDetailPage.tsx
│   ├── tabs/
│   │   ├── MtpInputTab.tsx
│   │   ├── MtpOverviewTab.tsx
│   │   ├── MtpTrendTab.tsx
│   │   └── MtpStrategyTab.tsx
│   ├── MtpAmountGrid.tsx
│   ├── OverviewGrid.tsx
│   ├── TrendChart.tsx
│   ├── TrendTable.tsx
│   ├── StrategyThemeTree.tsx
│   ├── DimensionValueSelector.tsx
│   ├── dialogs/
│   │   ├── CreateEventDialog.tsx
│   │   ├── DuplicateEventDialog.tsx
│   │   ├── CreateThemeDialog.tsx
│   │   ├── EditThemeDialog.tsx
│   │   ├── ConfirmStatusDialog.tsx
│   │   └── DeleteConfirmDialog.tsx
│   └── index.ts                          # barrel export
├── api/
│   ├── BffClient.ts                      # interface
│   ├── MockBffClient.ts                  # mock implementation
│   ├── HttpBffClient.ts                  # HTTP implementation
│   └── index.ts                          # barrel export + factory
├── lib/
│   └── error-messages.ts                 # エラーコード → UIメッセージ
├── types/
│   └── index.ts                          # 型定義（contracts からの re-export）
└── OUTPUT.md                             # 移植手順・チェックリスト
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
   - `@epm/contracts/bff/mtp` → `@epm/contracts/bff/mtp`（そのまま）

---

### OUTPUT.md（必須生成 - _v0_drop 内）

v0 は `_v0_drop/planning/mtp/src/OUTPUT.md` に以下を含めること:

1. **Generated Files Tree** - 生成したファイル一覧
2. **Imports Used** - @/shared/ui から使用したコンポーネント、DTO インポート
3. **Missing Components (TODO)** - 不足している shared component があれば記載
4. **Migration Steps** - 移植手順:
   - コピー先: `apps/web/src/features/planning/mtp/`
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
   - [ ] タブ構成（入力/全社俯瞰/推移/戦略テーマ）が実装されている
   - [ ] 実績列と計画列の表示が区別されている
   - [ ] Recharts でグラフが実装されている

---

## 9. グリッド操作仕様（MtpAmountGrid）

```markdown
### キーボードナビゲーション（BudgetGrid相当）
- **Tab**: 右セルへ移動（行末で次行先頭へ）
- **Shift+Tab**: 左セルへ移動
- **Enter**: 下セルへ移動
- **Shift+Enter**: 上セルへ移動
- **矢印キー**: 各方向へ移動
- **Escape**: 編集キャンセル

### 自動保存
- 500ms デバウンス後に自動保存
- 保存中インジケーター表示
- 保存失敗時はToastでエラー表示

### セル状態
- **実績列**: bg-muted（グレー背景）、編集不可、太字なし
- **計画列（編集可能）**: 白背景、フォーカス時ボーダーハイライト
- **計画列（読み取り専用）**: bg-muted/50（CONFIRMED時 or 全社選択時）
- **集計行**: bg-muted/50、太字
- **変更済み未保存**: 左上に小さなドット表示

### 数値フォーマット
- 表示: カンマ区切り（例: 10,000,000,000）
- 入力: 数値のみ（カンマ自動除去）
- 単位: 円（表示ラベルで明示）

### 列構成
- 実績列: 計画年数と同じ年数分表示（planYears=3なら3年分）
- 計画列: 計画年数分表示
- 年計列: 計画合計のみ表示
```

---

## 10. グラフ仕様（TrendChart - Recharts）

```markdown
### グラフタイプ
- 折れ線グラフ（LineChart）

### 軸設定
- X軸: 年度（実績期間 + 計画期間を連続表示）
- Y軸: 金額（自動スケール、カンマ区切り）

### データ表示
- 実績: 実線（solid）+ 塗りつぶしマーカー
- 計画: 破線（dashed）+ 中空マーカー
- 実績と計画の境界に縦線（参考線）

### 色分け
- プライマリーカラー（--primary）を使用
- 実績: opacity 100%
- 計画: opacity 70%

### ツールチップ
- ホバー時に年度・金額・実績/計画を表示
- フォーマット: 「FY2026: 100億円（計画）」

### レスポンシブ
- ResponsiveContainer で親要素に追従
```

---

## 11. 禁止事項（v0 への最終リマインダー）

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
- 左右スプリットレイアウト（廃止 → タブ構成に変更）

✅ REQUIRED:
- @/shared/ui からコンポーネント使用
- @epm/contracts/bff/mtp から DTO 使用
- semantic tokens（bg-primary, text-foreground, border-input 等）
- Tailwind scale（p-4, gap-4, rounded-lg 等）
- MockBffClient でモックデータ提供
- OUTPUT.md 生成
- Tabs コンポーネントでタブ構成
- 実績列と計画列の区別（isActual フラグ）
- Recharts で推移グラフ
- グリッドのキーボードナビゲーション実装
- 500msデバウンス自動保存実装
```

---

# 変更履歴

| 日付 | 変更内容 | 担当 |
|------|---------|------|
| 2026-01-11 | 初版作成 | Claude Code |
| 2026-01-11 | UI設計変更：左右スプリット→タブ構成（入力/全社俯瞰/推移/戦略テーマ）、入力タブに実績列追加、新規DTO追加（BffAmountColumn, BffMtpOverviewResponse, BffMtpTrendResponse）、Recharts追加 | Claude Code |
