# v0 Prompt: ROIC分析（ROIC Analysis）

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

**既存UIとの統一感:**
このROIC分析画面は、既に実装済みの「CVP損益分岐分析」(`apps/web/src/features/report/cvp-analysis/`)と同じフレームワーク・レイアウトパターンを採用すること。
- フィルター（年度/Primary/Compare/期間/粒度）の配置・操作感を統一
- 部門ツリーの左サイドバー配置
- KPIカードのグリッドレイアウト
- グラフとツリーの配置パターン
```

---

## 3. Feature

```markdown
**report/roic-analysis**: ROIC（投下資本利益率）分析機能

企業の資本効率を分析し、NOPAT率×資本回転率の分解を通じてROIC改善のシミュレーションを行う機能。

### 主要ユースケース
1. **ROIC分析確認** - 11のKPI指標（ROIC, NOPAT, WACC, ROICスプレッド等）を一覧で確認
2. **ROIC vs WACC比較** - 折れ線/バレットチャートでROICとWACCを比較表示
3. **ROIC分解** - NOPAT率と資本回転率の分解でROICの構成要素を可視化
4. **What-Ifシミュレーション** - ROICツリーを編集して指標変化をリアルタイム確認
5. **簡易入力（簡易モード）** - BS未整備会社向けに半期の営業資産/営業負債を直接入力

### 2つの動作モード
- **標準モード**: 月次BS実績が存在する場合。全粒度（月次/四半期/半期/年度）、全Primary（予算/見込/実績）が利用可能
- **簡易モード**: BS未整備の場合。粒度は半期/年度のみ、Primaryは実績のみ、簡易入力パネルが利用可能
```

---

## 4. Screens

```markdown
### Screen 1: ROIC分析ダッシュボード（メイン画面）

- **Purpose**: ROICと関連KPIを一覧表示し、シミュレーションを行う
- **Layout**:
  - ヘッダー: フィルターパネル（年度/Primary/Compare/期間/粒度）+ モードバッジ（標準/簡易）
  - 左サイドバー: 部門ツリー（単独/配下集約切替）+ 簡易入力ボタン（簡易モード時）
  - メインエリア上部: 警告バナー（BS実績代替時のみ、閉じられない固定表示）
  - メインエリア: KPIカード（11指標を3ティア配置）→ グラフ2種（ROIC vs WACC, ROIC分解バー）→ ROICツリー
- **Interactions**:
  - フィルター変更 → データ再取得
  - 部門選択 → その部門のデータ表示
  - ROICツリー編集 → KPIカード・グラフがリアルタイム更新
  - リセットボタン → シミュレーション値を元値に戻す

### Screen 2: 簡易入力パネル（スライドインSheet）

- **Purpose**: 簡易モード時に半期の営業資産/営業負債を入力
- **Trigger**: 左サイドバーの「簡易入力」ボタンクリック
- **Layout**:
  - タイトル: 「{年度}年度 営業資産・営業負債」
  - 営業資産セクション: 科目ツリー（集計科目は見出し、BASE科目のみ編集可）
  - 営業負債セクション: 同上
  - 入力列: 上期(H1) | 下期(H2) | 通期（平均、読取専用）
- **Form Fields**:
  - 各科目の上期値（number, optional）
  - 各科目の下期値（number, optional）
- **Actions**: 保存 / キャンセル
- **Note**: 配下集約ONの場合は入力不可（案内メッセージ表示）

### Screen 3: 設定未完了ブロック画面

- **Purpose**: ROIC設定が未完了の場合に画面全体をブロック
- **Trigger**: `options.isConfigComplete === false`
- **Layout**: 中央配置のアラートカード
  - アイコン（AlertCircle）
  - 「ROIC設定が未完了です」
  - 不足設定項目リスト（missingConfigItems）
  - 「管理者に設定を依頼してください」

### Screen 4: データなしブロック画面

- **Purpose**: PLまたはBS実績が0件の場合
- **Trigger**: `data === null` または KPI/ツリーが空
- **Layout**: 中央配置のアラートカード
  - 「データが見つかりません」
```

---

## 5. BFF Contract（design.md からコピー）

### Endpoints

| Method | Endpoint | Purpose | Request DTO | Response DTO |
|--------|----------|---------|-------------|--------------|
| GET | /api/bff/roic-analysis/options | フィルター選択肢・モード判定 | BffRoicOptionsRequest | BffRoicOptionsResponse |
| POST | /api/bff/roic-analysis/data | ROIC分析データ取得 | BffRoicDataRequest | BffRoicDataResponse |
| GET | /api/bff/roic-analysis/simple-input | 簡易入力データ取得 | BffRoicSimpleInputRequest | BffRoicSimpleInputResponse |
| POST | /api/bff/roic-analysis/simple-input | 簡易入力データ保存 | BffRoicSimpleInputSaveRequest | BffRoicSimpleInputSaveResponse |

### DTOs

```typescript
// ============================================
// Enums
// ============================================

export const RoicPrimaryType = {
  BUDGET: 'BUDGET',
  FORECAST: 'FORECAST',
  ACTUAL: 'ACTUAL',
} as const;
export type RoicPrimaryType = (typeof RoicPrimaryType)[keyof typeof RoicPrimaryType];

export const RoicGranularity = {
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY',
  SEMI_ANNUAL: 'SEMI_ANNUAL',
  ANNUAL: 'ANNUAL',
} as const;
export type RoicGranularity = (typeof RoicGranularity)[keyof typeof RoicGranularity];

export const RoicMode = {
  STANDARD: 'STANDARD',
  SIMPLIFIED: 'SIMPLIFIED',
} as const;
export type RoicMode = (typeof RoicMode)[keyof typeof RoicMode];

export const RoicLineType = {
  HEADER: 'header',
  ACCOUNT: 'account',
  NOTE: 'note',
  BLANK: 'blank',
  ADJUSTMENT: 'adjustment',
} as const;
export type RoicLineType = (typeof RoicLineType)[keyof typeof RoicLineType];

export const RoicTreeSection = {
  ROIC: 'roic',
  NOPAT: 'nopat',
  INVESTED_CAPITAL: 'invested_capital',
  DECOMPOSITION: 'decomposition',
} as const;
export type RoicTreeSection = (typeof RoicTreeSection)[keyof typeof RoicTreeSection];

export const RoicKpiFormat = {
  CURRENCY: 'currency',
  PERCENT: 'percent',
  RATE: 'rate',
} as const;
export type RoicKpiFormat = (typeof RoicKpiFormat)[keyof typeof RoicKpiFormat];

export const RoicKpiId = {
  ROIC: 'roic',
  NOPAT: 'nopat',
  EBIT: 'ebit',
  EFFECTIVE_TAX_RATE: 'effectiveTaxRate',
  INVESTED_CAPITAL: 'investedCapital',
  OPERATING_ASSETS: 'operatingAssets',
  OPERATING_LIABILITIES: 'operatingLiabilities',
  NOPAT_RATE: 'nopatRate',
  CAPITAL_TURNOVER: 'capitalTurnover',
  WACC: 'wacc',
  ROIC_SPREAD: 'roicSpread',
} as const;
export type RoicKpiId = (typeof RoicKpiId)[keyof typeof RoicKpiId];

// ============================================
// Options Request/Response
// ============================================

export interface BffRoicOptionsRequest {
  companyId: string;
}

export interface BffRoicFiscalYearOption {
  fiscalYear: number;
  label: string;
}

export interface BffRoicEventOption {
  id: string;
  eventCode: string;
  eventName: string;
  scenarioType: RoicPrimaryType;
  fiscalYear: number;
  hasFixedVersion: boolean;
}

export interface BffRoicVersionOption {
  id: string;
  versionCode: string;
  versionName: string;
  versionNo: number;
  status: 'DRAFT' | 'FIXED';
}

export interface BffRoicDepartmentNode {
  id: string;
  stableId: string;
  name: string;
  code: string;
  level: number;
  hasChildren: boolean;
  children?: BffRoicDepartmentNode[];
}

export interface BffRoicOptionsResponse {
  mode: RoicMode;
  fiscalYears: BffRoicFiscalYearOption[];
  budgetEvents: BffRoicEventOption[];
  forecastEvents: BffRoicEventOption[];
  versions: Record<string, BffRoicVersionOption[]>;
  departments: BffRoicDepartmentNode[];
  roicPlLayoutId: string | null;
  roicPlLayoutName: string | null;
  roicBsLayoutId: string | null;
  roicBsLayoutName: string | null;
  waccRate: number | null;
  effectiveTaxRate: number | null;
  isConfigComplete: boolean;
  missingConfigItems: string[];
}

// ============================================
// Data Request/Response
// ============================================

export interface BffRoicDataRequest {
  companyId: string;
  fiscalYear: number;
  primaryType: RoicPrimaryType;
  primaryEventId?: string;
  primaryVersionId?: string;
  compareEnabled: boolean;
  compareFiscalYear?: number;
  compareType?: RoicPrimaryType;
  compareEventId?: string;
  compareVersionId?: string;
  periodFrom: number;
  periodTo: number;
  granularity: RoicGranularity;
  departmentStableId: string;
  includeSubDepartments: boolean;
}

export interface BffRoicKpiItem {
  id: string;
  name: string;
  originalValue: number | null;
  simulatedValue: number | null;
  compareValue: number | null;
  unit: string;
  isCalculable: boolean;
  format: RoicKpiFormat;
  displayPriority: number;
}

export interface BffRoicTreeLine {
  lineId: string;
  lineNo: number;
  lineType: RoicLineType;
  displayName: string;
  subjectId: string | null;
  indentLevel: number;
  isEditable: boolean;
  isAdjustment: boolean;
  originalValue: number | null;
  compareValue: number | null;
  parentLineId: string | null;
  childLineIds: string[];
  rollupCoefficient: number;
  section: RoicTreeSection;
}

export interface BffRoicChartPoint {
  period: string;
  label: string;
  roicOriginal: number | null;
  roicSimulated: number | null;
  roicCompare: number | null;
  wacc: number | null;
}

export interface BffRoicVsWaccChartData {
  points: BffRoicChartPoint[];
  isSinglePoint: boolean;
  waccRate: number | null;
}

export interface BffRoicDecompositionBar {
  nopatRate: number | null;
  capitalTurnover: number | null;
  roic: number | null;
}

export interface BffRoicDecompositionChartData {
  original: BffRoicDecompositionBar;
  simulated: BffRoicDecompositionBar;
  compare: BffRoicDecompositionBar | null;
}

export interface BffRoicWarning {
  code: string;
  message: string;
}

export interface BffRoicDataResponse {
  mode: RoicMode;
  kpis: BffRoicKpiItem[];
  tree: BffRoicTreeLine[];
  roicVsWaccChart: BffRoicVsWaccChartData;
  decompositionChart: BffRoicDecompositionChartData;
  warnings: BffRoicWarning[];
  bsSubstitutedWithActual: boolean;
}

// ============================================
// Simple Input Request/Response
// ============================================

export interface BffRoicSimpleInputRequest {
  companyId: string;
  fiscalYear: number;
  departmentStableId: string;
}

export interface BffRoicSimpleInputLine {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  indentLevel: number;
  isEditable: boolean;
  isAggregate: boolean;
  parentSubjectId: string | null;
  h1Value: number | null;
  h2Value: number | null;
  annualValue: number | null;
}

export interface BffRoicSimpleInputResponse {
  operatingAssets: BffRoicSimpleInputLine[];
  operatingLiabilities: BffRoicSimpleInputLine[];
  eventId: string | null;
  versionId: string | null;
}

export interface BffRoicSimpleInputSaveItem {
  subjectId: string;
  h1Value: number | null;
  h2Value: number | null;
}

export interface BffRoicSimpleInputSaveRequest {
  companyId: string;
  fiscalYear: number;
  departmentStableId: string;
  operatingAssets: BffRoicSimpleInputSaveItem[];
  operatingLiabilities: BffRoicSimpleInputSaveItem[];
}

export interface BffRoicSimpleInputSaveResponse {
  success: boolean;
  eventId: string;
  versionId: string;
}

// ============================================
// Error Codes
// ============================================

export const RoicAnalysisErrorCode = {
  ROIC_CONFIG_NOT_SET: 'ROIC_CONFIG_NOT_SET',
  PRIMARY_NOT_SELECTED: 'PRIMARY_NOT_SELECTED',
  NO_DATA_FOUND: 'NO_DATA_FOUND',
  NO_BS_DATA: 'NO_BS_DATA',
  DEPARTMENT_NOT_FOUND: 'DEPARTMENT_NOT_FOUND',
  PERIOD_INVALID: 'PERIOD_INVALID',
  EVENT_NOT_FOUND: 'EVENT_NOT_FOUND',
  VERSION_NOT_FOUND: 'VERSION_NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SIMPLE_INPUT_NOT_ALLOWED: 'SIMPLE_INPUT_NOT_ALLOWED',
  NO_SIMPLE_INPUT_SUBJECTS: 'NO_SIMPLE_INPUT_SUBJECTS',
} as const;

export type RoicAnalysisErrorCode = (typeof RoicAnalysisErrorCode)[keyof typeof RoicAnalysisErrorCode];

export interface BffRoicAnalysisError {
  code: RoicAnalysisErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

export const RoicWarningCode = {
  BS_SUBSTITUTED_WITH_ACTUAL: 'BS_SUBSTITUTED_WITH_ACTUAL',
  WACC_NOT_SET: 'WACC_NOT_SET',
  PARTIAL_DATA_MISSING: 'PARTIAL_DATA_MISSING',
} as const;
```

### Errors → UI Messages

| Error Code | UI Message |
|------------|-----------|
| ROIC_CONFIG_NOT_SET | 「ROIC設定が未完了です」 |
| PRIMARY_NOT_SELECTED | 「データソースを選択してください」 |
| NO_DATA_FOUND | 「データが見つかりません」 |
| NO_BS_DATA | 「貸借対照表データがありません」 |
| DEPARTMENT_NOT_FOUND | 「部門が見つかりません」 |
| PERIOD_INVALID | 「期間の指定が不正です」 |
| EVENT_NOT_FOUND | 「イベントが見つかりません」 |
| VERSION_NOT_FOUND | 「バージョンが見つかりません」 |
| VALIDATION_ERROR | フィールド別インラインエラー |
| SIMPLE_INPUT_NOT_ALLOWED | 「配下集約時は簡易入力できません」 |
| NO_SIMPLE_INPUT_SUBJECTS | 「簡易入力の対象科目がありません」 |

### Warning → UI Messages

| Warning Code | UI Message |
|--------------|-----------|
| BS_SUBSTITUTED_WITH_ACTUAL | 「BS予算/見込データがないため、実績で代替表示しています」 |
| WACC_NOT_SET | 「WACCが設定されていません」 |
| PARTIAL_DATA_MISSING | 「一部期間のデータが欠損しています」 |

### DTO Import（MANDATORY）

```typescript
import type {
  RoicPrimaryType,
  RoicGranularity,
  RoicMode,
  RoicKpiId,
  BffRoicOptionsRequest,
  BffRoicOptionsResponse,
  BffRoicDataRequest,
  BffRoicDataResponse,
  BffRoicKpiItem,
  BffRoicTreeLine,
  BffRoicVsWaccChartData,
  BffRoicDecompositionChartData,
  BffRoicSimpleInputRequest,
  BffRoicSimpleInputResponse,
  BffRoicSimpleInputSaveRequest,
  BffRoicSimpleInputSaveResponse,
  RoicAnalysisErrorCode,
} from "@epm/contracts/bff/roic-analysis";
```

---

## 6. UI Components

```markdown
### Tier 1（使用必須 - @/shared/ui から）
- Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue
- Label, Switch, Badge
- Card, CardContent, CardHeader, CardTitle
- Alert, AlertDescription
- ScrollArea, Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger
- Skeleton
- ChartContainer, ChartTooltip, ChartTooltipContent（recharts wrapper）

### Tier 2（必要時のみ）
- Tabs, TabsContent, TabsList, TabsTrigger（グラフ切替があれば）
- Separator

### Feature-specific Components（v0 が生成）
- RoicDashboard.tsx（メインコンテナ）
- RoicFilters.tsx（フィルターパネル + モードバッジ）
- DepartmentTree.tsx（部門ツリー + 配下集約切替）
- RoicKpiCards.tsx（11指標の3ティアカード表示）
- RoicVsWaccChart.tsx（折れ線/バレットチャート）
- RoicDecompositionBar.tsx（NOPAT率×資本回転率の分解バー）
- RoicTree.tsx（編集可能ツリー + リセットボタン）
- SimpleInputPanel.tsx（Sheet内の簡易入力フォーム）
- WarningBanner.tsx（固定警告バナー）
- ConfigErrorBlock.tsx（設定未完了ブロック）
- NoDataBlock.tsx（データなしブロック）
- RequiredFieldsBlock.tsx（必須項目未選択ブロック）
- api/BffClient.ts, MockBffClient.ts, HttpBffClient.ts
- lib/roic-calculator.ts（KPI計算ロジック）
- lib/tree-utils.ts（ツリー操作ユーティリティ）
- lib/error-messages.ts
```

---

## 7. Mock Data

```typescript
// Options Response
const mockOptions: BffRoicOptionsResponse = {
  mode: 'STANDARD',
  fiscalYears: [
    { fiscalYear: 2025, label: '2025年度' },
    { fiscalYear: 2024, label: '2024年度' },
  ],
  budgetEvents: [
    { id: 'evt-001', eventCode: 'BUDGET_2025', eventName: '2025年度当初予算', scenarioType: 'BUDGET', fiscalYear: 2025, hasFixedVersion: true },
  ],
  forecastEvents: [
    { id: 'evt-002', eventCode: 'FC_2025_Q3', eventName: '2025年度Q3見込', scenarioType: 'FORECAST', fiscalYear: 2025, hasFixedVersion: true },
  ],
  versions: {
    'evt-001': [
      { id: 'ver-001', versionCode: 'V1', versionName: 'V1 確定版', versionNo: 1, status: 'FIXED' },
    ],
  },
  departments: [
    {
      id: 'dept-001', stableId: 'CORP', name: '全社', code: '0000', level: 0, hasChildren: true,
      children: [
        { id: 'dept-002', stableId: 'DIV_A', name: '事業部A', code: '1000', level: 1, hasChildren: true, children: [
          { id: 'dept-003', stableId: 'SALES_1', name: '営業1課', code: '1100', level: 2, hasChildren: false },
          { id: 'dept-004', stableId: 'SALES_2', name: '営業2課', code: '1200', level: 2, hasChildren: false },
        ]},
        { id: 'dept-005', stableId: 'DIV_B', name: '事業部B', code: '2000', level: 1, hasChildren: false },
      ],
    },
  ],
  roicPlLayoutId: 'layout-pl-001',
  roicPlLayoutName: 'ROIC用PLレイアウト',
  roicBsLayoutId: 'layout-bs-001',
  roicBsLayoutName: 'ROIC用BSレイアウト',
  waccRate: 0.08,
  effectiveTaxRate: 0.30,
  isConfigComplete: true,
  missingConfigItems: [],
};

// Data Response (11 KPIs)
const mockData: BffRoicDataResponse = {
  mode: 'STANDARD',
  kpis: [
    // Tier 1 (displayPriority: 1) - 最重要指標
    { id: 'roic', name: 'ROIC', originalValue: 0.085, simulatedValue: 0.085, compareValue: 0.075, unit: '%', isCalculable: true, format: 'percent', displayPriority: 1 },
    { id: 'wacc', name: 'WACC', originalValue: 0.08, simulatedValue: 0.08, compareValue: 0.08, unit: '%', isCalculable: true, format: 'percent', displayPriority: 1 },
    { id: 'roicSpread', name: 'ROICスプレッド', originalValue: 0.005, simulatedValue: 0.005, compareValue: -0.005, unit: '%', isCalculable: true, format: 'percent', displayPriority: 1 },
    { id: 'nopat', name: 'NOPAT', originalValue: 85000000, simulatedValue: 85000000, compareValue: 75000000, unit: '円', isCalculable: true, format: 'currency', displayPriority: 1 },
    // Tier 2 (displayPriority: 2) - 重要指標
    { id: 'nopatRate', name: 'NOPAT率', originalValue: 0.085, simulatedValue: 0.085, compareValue: 0.075, unit: '%', isCalculable: true, format: 'percent', displayPriority: 2 },
    { id: 'capitalTurnover', name: '資本回転率', originalValue: 1.0, simulatedValue: 1.0, compareValue: 1.0, unit: '回', isCalculable: true, format: 'rate', displayPriority: 2 },
    { id: 'investedCapital', name: '投下資本', originalValue: 1000000000, simulatedValue: 1000000000, compareValue: 1000000000, unit: '円', isCalculable: true, format: 'currency', displayPriority: 2 },
    { id: 'ebit', name: 'EBIT', originalValue: 121428571, simulatedValue: 121428571, compareValue: 107142857, unit: '円', isCalculable: true, format: 'currency', displayPriority: 2 },
    // Tier 3 (displayPriority: 3) - 補足指標
    { id: 'operatingAssets', name: '営業資産', originalValue: 1500000000, simulatedValue: 1500000000, compareValue: 1500000000, unit: '円', isCalculable: true, format: 'currency', displayPriority: 3 },
    { id: 'operatingLiabilities', name: '営業負債', originalValue: 500000000, simulatedValue: 500000000, compareValue: 500000000, unit: '円', isCalculable: true, format: 'currency', displayPriority: 3 },
    { id: 'effectiveTaxRate', name: '実効税率', originalValue: 0.30, simulatedValue: 0.30, compareValue: 0.30, unit: '%', isCalculable: true, format: 'percent', displayPriority: 3 },
  ],
  tree: [
    { lineId: 'roic', lineNo: 1, lineType: 'header', displayName: 'ROIC', subjectId: null, indentLevel: 0, isEditable: false, isAdjustment: false, originalValue: 0.085, compareValue: 0.075, parentLineId: null, childLineIds: ['nopat', 'invested_capital'], rollupCoefficient: 1, section: 'roic' },
    { lineId: 'nopat', lineNo: 2, lineType: 'account', displayName: 'NOPAT', subjectId: 'subj-nopat', indentLevel: 1, isEditable: false, isAdjustment: false, originalValue: 85000000, compareValue: 75000000, parentLineId: 'roic', childLineIds: ['ebit', 'tax_factor'], rollupCoefficient: 1, section: 'nopat' },
    { lineId: 'ebit', lineNo: 3, lineType: 'account', displayName: 'EBIT', subjectId: 'subj-ebit', indentLevel: 2, isEditable: true, isAdjustment: false, originalValue: 121428571, compareValue: 107142857, parentLineId: 'nopat', childLineIds: [], rollupCoefficient: 1, section: 'nopat' },
    { lineId: 'tax_factor', lineNo: 4, lineType: 'note', displayName: '(1 - 実効税率)', subjectId: null, indentLevel: 2, isEditable: false, isAdjustment: false, originalValue: 0.70, compareValue: 0.70, parentLineId: 'nopat', childLineIds: [], rollupCoefficient: 1, section: 'nopat' },
    { lineId: 'invested_capital', lineNo: 5, lineType: 'account', displayName: '投下資本', subjectId: 'subj-ic', indentLevel: 1, isEditable: false, isAdjustment: false, originalValue: 1000000000, compareValue: 1000000000, parentLineId: 'roic', childLineIds: ['operating_assets', 'operating_liabilities'], rollupCoefficient: 1, section: 'invested_capital' },
    { lineId: 'operating_assets', lineNo: 6, lineType: 'account', displayName: '営業資産', subjectId: 'subj-oa', indentLevel: 2, isEditable: true, isAdjustment: false, originalValue: 1500000000, compareValue: 1500000000, parentLineId: 'invested_capital', childLineIds: [], rollupCoefficient: 1, section: 'invested_capital' },
    { lineId: 'operating_liabilities', lineNo: 7, lineType: 'account', displayName: '営業負債', subjectId: 'subj-ol', indentLevel: 2, isEditable: true, isAdjustment: false, originalValue: 500000000, compareValue: 500000000, parentLineId: 'invested_capital', childLineIds: [], rollupCoefficient: -1, section: 'invested_capital' },
  ],
  roicVsWaccChart: {
    points: [
      { period: 'Q1', label: 'Q1', roicOriginal: 0.082, roicSimulated: 0.082, roicCompare: 0.072, wacc: 0.08 },
      { period: 'Q2', label: 'Q2', roicOriginal: 0.084, roicSimulated: 0.084, roicCompare: 0.074, wacc: 0.08 },
      { period: 'Q3', label: 'Q3', roicOriginal: 0.086, roicSimulated: 0.086, roicCompare: 0.076, wacc: 0.08 },
      { period: 'Q4', label: 'Q4', roicOriginal: 0.088, roicSimulated: 0.088, roicCompare: 0.078, wacc: 0.08 },
    ],
    isSinglePoint: false,
    waccRate: 0.08,
  },
  decompositionChart: {
    original: { nopatRate: 0.085, capitalTurnover: 1.0, roic: 0.085 },
    simulated: { nopatRate: 0.085, capitalTurnover: 1.0, roic: 0.085 },
    compare: { nopatRate: 0.075, capitalTurnover: 1.0, roic: 0.075 },
  },
  warnings: [],
  bsSubstitutedWithActual: false,
};

// Simple Input Response
const mockSimpleInput: BffRoicSimpleInputResponse = {
  operatingAssets: [
    { subjectId: 'oa-001', subjectCode: '1100', subjectName: '営業資産計', indentLevel: 0, isEditable: false, isAggregate: true, parentSubjectId: null, h1Value: 750000000, h2Value: 800000000, annualValue: 775000000 },
    { subjectId: 'oa-002', subjectCode: '1110', subjectName: '売掛金', indentLevel: 1, isEditable: true, isAggregate: false, parentSubjectId: 'oa-001', h1Value: 300000000, h2Value: 320000000, annualValue: 310000000 },
    { subjectId: 'oa-003', subjectCode: '1120', subjectName: '棚卸資産', indentLevel: 1, isEditable: true, isAggregate: false, parentSubjectId: 'oa-001', h1Value: 450000000, h2Value: 480000000, annualValue: 465000000 },
  ],
  operatingLiabilities: [
    { subjectId: 'ol-001', subjectCode: '2100', subjectName: '営業負債計', indentLevel: 0, isEditable: false, isAggregate: true, parentSubjectId: null, h1Value: 250000000, h2Value: 280000000, annualValue: 265000000 },
    { subjectId: 'ol-002', subjectCode: '2110', subjectName: '買掛金', indentLevel: 1, isEditable: true, isAggregate: false, parentSubjectId: 'ol-001', h1Value: 200000000, h2Value: 220000000, annualValue: 210000000 },
    { subjectId: 'ol-003', subjectCode: '2120', subjectName: '未払費用', indentLevel: 1, isEditable: true, isAggregate: false, parentSubjectId: 'ol-001', h1Value: 50000000, h2Value: 60000000, annualValue: 55000000 },
  ],
  eventId: 'evt-simple-001',
  versionId: 'ver-simple-001',
};

### States to Cover
- 通常状態（データあり、標準モード）
- 簡易モード状態（粒度・Primary制限あり）
- シミュレーション中状態（ツリー編集後、KPIカードにハイライト）
- 警告状態（BS実績代替バナー表示）
- 設定未完了状態（ブロック表示）
- データなし状態（ブロック表示）
- 必須項目未選択状態（案内表示）
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
app/report/roic-analysis/
├── page.tsx
└── components/
    ├── RoicDashboard.tsx
    ├── RoicFilters.tsx
    ├── DepartmentTree.tsx
    ├── RoicKpiCards.tsx
    ├── RoicVsWaccChart.tsx
    ├── RoicDecompositionBar.tsx
    ├── RoicTree.tsx
    ├── SimpleInputPanel.tsx
    ├── WarningBanner.tsx
    ├── ConfigErrorBlock.tsx
    ├── NoDataBlock.tsx
    ├── RequiredFieldsBlock.tsx
    └── api/
        ├── BffClient.ts
        ├── MockBffClient.ts
        └── HttpBffClient.ts
```

---

### 2. 移植用モジュール（DL して本番環境へ移植）

v0 プロジェクトの `_v0_drop/` に配置（移植用、プレビュー用と同期）:

```
_v0_drop/report/roic-analysis/src/
├── app/
│   └── page.tsx
├── components/
│   ├── RoicDashboard.tsx
│   ├── RoicFilters.tsx
│   ├── DepartmentTree.tsx
│   ├── RoicKpiCards.tsx
│   ├── RoicVsWaccChart.tsx
│   ├── RoicDecompositionBar.tsx
│   ├── RoicTree.tsx
│   ├── SimpleInputPanel.tsx
│   ├── WarningBanner.tsx
│   ├── ConfigErrorBlock.tsx
│   ├── NoDataBlock.tsx
│   ├── RequiredFieldsBlock.tsx
│   └── index.ts              # barrel export
├── api/
│   ├── BffClient.ts          # interface
│   ├── MockBffClient.ts      # mock implementation
│   ├── HttpBffClient.ts      # HTTP implementation
│   └── index.ts              # barrel export + factory
├── hooks/
│   ├── useRoicOptions.ts
│   ├── useRoicData.ts
│   ├── useRoicSimulation.ts
│   └── useSimpleInput.ts
├── lib/
│   ├── roic-calculator.ts    # ROIC/KPI計算ロジック
│   ├── tree-utils.ts         # ツリー操作
│   └── error-messages.ts     # エラーコード → UIメッセージ
├── types/
│   └── index.ts              # 型定義（contracts からの re-export）
└── OUTPUT.md                 # 移植手順・チェックリスト
```

---

### OUTPUT.md（必須生成 - _v0_drop 内）

v0 は `_v0_drop/report/roic-analysis/src/OUTPUT.md` に以下を含めること:

1. **Generated Files Tree** - 生成したファイル一覧
2. **Imports Used** - @/shared/ui から使用したコンポーネント、DTO インポート
3. **Missing Components (TODO)** - 不足している shared component があれば記載
4. **Migration Steps** - 移植手順:
   - コピー先: `apps/web/src/features/report/roic-analysis/`
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

## 9. UX/UIデザイン指針（ROIC分析固有）

```markdown
### KPIカードのレイアウト（3ティア構成）

KPIカードは11指標を3段のティアに分けて配置し、視覚的な重要度を明示する：

**Tier 1（最重要）**: ROIC, WACC, ROICスプレッド, NOPAT
- 4カードを1行に配置
- カードサイズ：大（他より高さを20%増）
- ROICスプレッドは正負で色分け（正=chart-3, 負=destructive）

**Tier 2（重要）**: NOPAT率, 資本回転率, 投下資本, EBIT
- 4カードを1行に配置
- カードサイズ：標準

**Tier 3（補足）**: 営業資産, 営業負債, 実効税率
- 3カードを1行に配置
- カードサイズ：小（他より高さを20%減）

### ROIC vs WACCチャートのUX

**複数期間の場合（折れ線グラフ）**:
- X軸: 期間（Q1, Q2, Q3, Q4 または 月次）
- Y軸: パーセント（0〜15%程度）
- 線の種類：
  - ROICシミュ後: 太線（strokeWidth: 3）、chart-1色
  - ROIC元値: 細線（strokeWidth: 1.5）、chart-1色、opacity: 0.5
  - Compare: 点線（strokeDasharray）、chart-2色
  - WACC: 水平基準線（ReferenceLine）、destructive色、点線

**単一期間の場合（バレットチャート）**:
- 縦型バー：ROICの値
- 水平線：WACCの基準値
- ROIC > WACC: chart-3色（良好）
- ROIC < WACC: destructive色（要改善）

### ROIC分解バーのUX

横並びの2つのバーで「NOPAT率 × 資本回転率 = ROIC」を視覚化：

```
[NOPAT率バー 8.5%] × [資本回転率バー 1.0回] = ROIC 8.5%
```

- 元値とシミュ後を上下に並べて比較可能に
- Compare有効時は3段表示
- バーの長さは正規化（最大値基準）

### ROICツリーのUX（シミュレーション機能）

CVPツリーと同じパターンだが、ROICの階層構造に対応：

```
ROIC [8.5%]
├─ NOPAT [85,000,000円]
│  ├─ EBIT [121,428,571円] ← 編集可能
│  └─ (1-実効税率) [0.70]
└─ 投下資本 [1,000,000,000円]
   ├─ 営業資産 [1,500,000,000円] ← 編集可能
   └─ 営業負債 [500,000,000円] ← 編集可能（マイナス係数）

[分解表示]
NOPAT率 = NOPAT / 売上高 [8.5%]
資本回転率 = 売上高 / 投下資本 [1.0回]
```

- 編集可能セルは枠線でハイライト
- 変更行は背景色でハイライト（bg-primary/10）
- 集計行は太字
- 調整差分行はイタリック

### 警告バナーのUX

BS実績代替時の警告は、KPIカードの直上に固定表示：

```
⚠️ BS予算/見込データがないため、実績で代替表示しています
```

- 黄色系警告色（amber/warning）
- 閉じるボタンなし（固定表示）
- アイコン + メッセージ

### 簡易入力パネルのUX

右からスライドインするSheet：

- 幅: 600px程度
- ヘッダー: 年度 + タイトル
- 2セクション構成（営業資産 / 営業負債）
- 各セクションはツリー形式
- 集計科目は見出し（太字、背景色、読取専用）
- BASE科目のみInput表示
- 通期列は自動計算（平均値、グレーアウト）
- 配下集約ON時は「配下集約時は入力できません」メッセージ
```

---

## 10. 禁止事項（v0 への最終リマインダー）

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
- CVP分析のUIパターンと大きく異なるレイアウト

✅ REQUIRED:
- @/shared/ui からコンポーネント使用
- @epm/contracts/bff/roic-analysis から DTO 使用
- semantic tokens（bg-primary, text-foreground, border-input 等）
- Tailwind scale（p-4, gap-4, rounded-lg 等）
- MockBffClient でモックデータ提供
- OUTPUT.md 生成
- CVP分析のUIパターンとの統一感（フィルター配置、部門ツリー、KPIカード形式等）
- recharts使用（LineChart, BarChart, ReferenceLine等）
```

---

# Template End

---

## 📋 v0 Prompt 作成チェックリスト

v0 に貼る前に確認:

- [x] Design System URL を冒頭に記載
- [x] Feature 説明を記載
- [x] Screens（画面仕様）を記載
- [x] BFF Endpoints table を design.md からコピー
- [x] DTO 定義を design.md からコピー
- [x] Error → UI message マッピングを記載
- [x] Mock data サンプルを記載
- [x] **二重出力（app + _v0_drop）の指示を含める**
- [x] 禁止事項セクションを含める
- [x] ROIC固有のUX/UIデザイン指針を含める
