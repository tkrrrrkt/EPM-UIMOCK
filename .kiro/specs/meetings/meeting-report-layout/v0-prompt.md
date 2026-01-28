# V0 Prompt: レポートレイアウト設定（A4）

> **Feature**: `meetings/meeting-report-layout`
> **Generated**: 2026-01-27
> **Status**: UI-MOCK Phase

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
**meetings/meeting-report-layout**: 経営会議レポートレイアウト設定

会議種別ごとに経営層が閲覧する「レポート」の表示構成を定義する管理画面。
3階層構造（レイアウト → ページ → コンポーネント）で管理し、
ドラッグ＆ドロップによる直感的な並べ替え機能を提供する。

### 対象ユーザー
- システム管理者
- 経営企画部（会議設計担当）

### 主要ユースケース
1. レイアウト管理：レポート全体構成の作成・編集・削除・並べ替え
2. ページ管理：タブ単位のページ追加・編集・削除・並べ替え（ドラッグ＆ドロップ）
3. コンポーネント管理：KPIカード・表・グラフ等の追加・編集・削除・並べ替え
4. コンポーネント設定：9種類のコンポーネントタイプ別の詳細設定UI
5. レイアウトプレビュー：設定したレイアウトの見た目確認
6. テンプレート：標準テンプレートからレイアウトを初期化
```

---

## 4. Screens

### Screen 1: LayoutSettingsPage（メイン画面）

- **Purpose**: 3階層構造（レイアウト/ページ/コンポーネント）の設定画面
- **Layout**: 2カラム構成
  - **左ペイン (1/3)**: LayoutTree（階層構造ツリー）
  - **右ペイン (2/3)**: DetailPanel（選択項目の詳細設定）
- **Header**:
  - 戻るボタン（ChevronLeft）
  - タイトル「レポートレイアウト設定」
  - サブタイトル「{会議種別名} のレポートレイアウトを設定してください」
  - プレビューボタン（Eye icon）
- **Interactions**:
  - ツリーでアイテム選択 → 右ペインに詳細表示
  - ページ/コンポーネントをドラッグ＆ドロップで並べ替え
  - 「+ レイアウト追加」ボタン → CreateLayoutDialog
  - 「テンプレートから作成」ボタン → TemplateSelectDialog
  - 未選択時は「レイアウト、ページ、またはコンポーネントを選択してください」プレースホルダー

### Screen 2: LayoutTree（左ペイン）

- **Purpose**: 階層構造の表示と操作
- **Layout**:
  ```
  ┌─────────────────────────┐
  │ 📋 月次標準レイアウト ★ │  ← レイアウト（★=デフォルト）
  │   ├─ 📄 サマリー (4)    │  ← ページ（数字=コンポーネント数）
  │   │   ├─ □ 主要KPI      │  ← コンポーネント
  │   │   ├─ □ ウォーター... │
  │   │   ├─ □ 予実対比表   │
  │   │   └─ □ 差異コメント │
  │   ├─ 📄 部門報告 (1)    │
  │   │   └─ □ 報告一覧     │
  │   └─ 📄 KPI (2)         │
  │       ├─ □ KPI一覧      │
  │       └─ □ AP進捗       │
  │                         │
  │ 📋 簡易レイアウト       │
  │   └─ ...                │
  └─────────────────────────┘
  [+ レイアウト追加]
  [テンプレートから作成]
  ```
- **Interactions**:
  - レイアウト行クリック → 展開/折りたたみ＋選択
  - ページ行クリック → 展開/折りたたみ＋選択
  - コンポーネント行クリック → 選択
  - ページ「+」ボタン → CreatePageDialog
  - コンポーネント「+」ボタン → CreateComponentDialog
  - ドラッグハンドル（GripVertical）でページ/コンポーネント並べ替え
  - デフォルトレイアウトは★バッジ
  - 無効アイテム（isActive=false）はグレーアウト

### Screen 3: LayoutDetailPanel（右ペイン - レイアウト選択時）

- **Purpose**: レイアウト基本情報の編集
- **Form Fields**:
  - レイアウトコード* (readonly if editing, required)
  - レイアウト名* (required)
  - 説明 (optional, textarea)
  - デフォルトフラグ (checkbox)
  - 有効 (checkbox)
- **Actions**: 保存 / キャンセル / 削除
- **Validation**: コード重複チェック

### Screen 4: PageDetailPanel（右ペイン - ページ選択時）

- **Purpose**: ページ基本情報の編集
- **Form Fields**:
  - ページコード* (required)
  - ページ名* (required)
  - ページタイプ* (select: FIXED/PER_DEPARTMENT/PER_BU)
  - 展開軸 (select, PER_DEPARTMENT/PER_BU時のみ表示)
  - 有効 (checkbox)
- **Actions**: 保存 / キャンセル / 削除

### Screen 5: ComponentDetailPanel（右ペイン - コンポーネント選択時）

- **Purpose**: コンポーネント基本情報＋タイプ別設定の編集
- **Layout**:
  ```
  ┌──────────────────────────────────────────┐
  │ コンポーネント設定                       │
  ├──────────────────────────────────────────┤
  │ コンポーネントコード *                   │
  │ [KPI_CARDS              ]               │
  │                                          │
  │ コンポーネント名 *                       │
  │ [主要KPIカード          ]               │
  │                                          │
  │ コンポーネントタイプ *                   │
  │ [v] KPI_CARD                             │
  │                                          │
  │ データソース *                           │
  │ [v] FACT                                 │
  │                                          │
  │ 幅 *                                     │
  │ (●) FULL  ( ) HALF  ( ) THIRD           │
  │                                          │
  │ ────────────────────────────────         │
  │ [KPI_CARD固有設定]                       │
  │                                          │
  │ 表示科目                                 │
  │ [売上高] [x] [営業利益] [x] ...          │
  │                                          │
  │ レイアウト                               │
  │ (●) グリッド  ( ) リスト                │
  │                                          │
  │ グリッド列数                             │
  │ ( ) 2列  (●) 3列  ( ) 4列               │
  │                                          │
  │ 表示オプション                           │
  │ [x] 目標値  [x] 差異  [ ] トレンド      │
  │                                          │
  │           [保存] [キャンセル] [削除]     │
  └──────────────────────────────────────────┘
  ```
- **Form Fields (基本)**:
  - コンポーネントコード* (required)
  - コンポーネント名* (required)
  - コンポーネントタイプ* (select: 9種類)
  - データソース* (select: FACT/KPI/SUBMISSION/SNAPSHOT/EXTERNAL)
  - 幅* (radio: FULL/HALF/THIRD)
  - 高さ (select: AUTO/SMALL/MEDIUM/LARGE, optional)
- **Dynamic Config Panel**: コンポーネントタイプに応じて切り替え
- **Actions**: 保存 / キャンセル / 削除

### Screen 6: Component Config Panels（9種類）

#### 6.1 KpiCardConfigPanel
- 表示科目（multi-select chips）
- レイアウト（grid/list radio）
- グリッド列数（2/3/4 radio）
- 表示オプション（checkboxes: 目標値/差異/トレンド/スパークライン）
- 閾値設定（danger/warning number inputs）

#### 6.2 TableConfigPanel
- 行軸（organization/subject/period select）
- 比較モード（BUDGET_VS_ACTUAL等 select）
- 表示列（multi-select checkboxes）
- 合計行/小計行（checkboxes）
- 差異ハイライト（checkbox）

#### 6.3 ChartConfigPanel
- チャートタイプ（waterfall/bar/line/area/pie/donut select with icons）
- X軸（period/organization/subject select）
- 凡例/データラベル/グリッド線（checkboxes）
- ウォーターフォール設定（startLabel/endLabel inputs, color pickers）

#### 6.4 SubmissionDisplayConfigPanel
- 表示モード（tree/flat/card radio）
- セクション選択（multi-select）
- 組織階層表示/提出状況表示（checkboxes）
- デフォルト展開（checkbox）

#### 6.5 ReportLinkConfigPanel
- リンク一覧（dynamic list: label/url/description/icon/category）
- レイアウト（grid/list radio）
- 列数（2/3/4 radio）

#### 6.6 ActionListConfigPanel
- ステータスフィルタ（multi-select chips）
- 優先度フィルタ（multi-select chips）
- 表示列（checkboxes: 担当者/期日/ステータス）
- ステータス変更許可（checkbox）
- ソート設定（sortBy select, sortOrder asc/desc）

#### 6.7 SnapshotCompareConfigPanel
- 比較対象（previous_meeting/specific_snapshot radio）
- 特定スナップショット選択（select, 条件付き表示）
- 比較メトリクス（multi-select）
- 変更ハイライト/方向表示/パーセント表示（checkboxes）
- 閾値設定（significantChange/majorChange inputs）

#### 6.8 KpiDashboardConfigPanel
- KPI定義選択（multi-select）
- レイアウト（grid/list radio）
- 列数（2/3/4 radio）
- チャート表示/アクション表示（checkboxes）
- チャート期間数（number input）
- ステータスフィルタ（ON_TRACK/AT_RISK/OFF_TRACK checkboxes）

#### 6.9 ApProgressConfigPanel
- アクションプラン選択（multi-select）
- 表示モード（checkboxes: ガント/カンバン/進捗/マイルストーン）
- ステータスフィルタ（multi-select chips）
- グループ化（kpi/assignee/status select）

### Screen 7: Dialogs

#### CreateLayoutDialog
- **Trigger**: 「+ レイアウト追加」ボタン
- **Form Fields**:
  - レイアウトコード* (required, pattern: ^[a-zA-Z0-9_]+$)
  - レイアウト名* (required)
  - 説明 (optional)
  - デフォルト (checkbox)
- **Actions**: 作成 / キャンセル

#### CreatePageDialog
- **Trigger**: ツリー内ページ「+」ボタン
- **Form Fields**:
  - ページコード* (required)
  - ページ名* (required)
  - ページタイプ* (select)
  - 展開軸 (select, 条件付き)
- **Actions**: 作成 / キャンセル

#### CreateComponentDialog
- **Trigger**: ツリー内コンポーネント「+」ボタン
- **Form Fields**:
  - コンポーネントコード* (required)
  - コンポーネント名* (required)
  - コンポーネントタイプ* (select with icons/descriptions)
  - データソース* (select)
  - 幅* (radio)
- **Actions**: 作成 / キャンセル

#### TemplateSelectDialog
- **Trigger**: 「テンプレートから作成」ボタン
- **Layout**:
  - テンプレート一覧（card形式）
  - 各カードに：テンプレート名、説明、ページ数、コンポーネント数
  - 選択時にレイアウト情報入力フォームを表示
- **Form Fields**:
  - テンプレート選択* (required)
  - レイアウトコード* (required)
  - レイアウト名* (required)
- **Actions**: 作成 / キャンセル

#### DeleteConfirmDialog
- **Trigger**: 詳細パネルの「削除」ボタン
- **Content**:
  - レイアウト削除時：「このレイアウトには [N] 個のページがあります。レイアウトと関連データをすべて削除しますか？」
  - ページ削除時：「このページには [N] 個のコンポーネントがあります。ページとコンポーネントをすべて削除しますか？」
  - コンポーネント削除時：「[名前] を削除しますか？」
  - エラー時：デフォルトレイアウト削除不可、使用中レイアウト削除不可
- **Actions**: 削除（destructive） / キャンセル

### Screen 8: LayoutPreview（別ルート）

- **Route**: `/meetings/report-layout/:meetingTypeId/preview/:layoutId`
- **Purpose**: 設定したレイアウトの見た目確認
- **Layout**:
  - タブ構成（ページ単位）
  - 各コンポーネントのサンプルデータ表示
  - 幅表示（FULL/HALF/THIRD）の反映
- **Data**: モックデータ使用（実データは使用しない）
- **Header**:
  - 戻るボタン
  - タイトル「レイアウトプレビュー」
  - サブタイトル「{レイアウト名}」

---

## 5. BFF Contract

### Endpoints

| Method | Endpoint | Purpose | Request DTO | Response DTO |
|--------|----------|---------|-------------|--------------|
| GET | `/bff/meetings/report-layouts/:meetingTypeId` | レイアウト一覧取得 | - | ReportLayoutListDto |
| POST | `/bff/meetings/report-layouts` | レイアウト作成 | CreateReportLayoutDto | ReportLayoutDto |
| PUT | `/bff/meetings/report-layouts/:id` | レイアウト更新 | UpdateReportLayoutDto | ReportLayoutDto |
| DELETE | `/bff/meetings/report-layouts/:id` | レイアウト削除 | - | void |
| PUT | `/bff/meetings/report-layouts/reorder` | レイアウト並べ替え | ReorderLayoutsDto | ReportLayoutListDto |
| GET | `/bff/meetings/report-pages/:layoutId` | ページ一覧取得 | - | ReportPageListDto |
| POST | `/bff/meetings/report-pages` | ページ作成 | CreateReportPageDto | ReportPageDto |
| PUT | `/bff/meetings/report-pages/:id` | ページ更新 | UpdateReportPageDto | ReportPageDto |
| DELETE | `/bff/meetings/report-pages/:id` | ページ削除 | - | void |
| PUT | `/bff/meetings/report-pages/reorder` | ページ並べ替え | ReorderPagesDto | ReportPageListDto |
| GET | `/bff/meetings/report-components/:pageId` | コンポーネント一覧取得 | - | ReportComponentListDto |
| POST | `/bff/meetings/report-components` | コンポーネント作成 | CreateReportComponentDto | ReportComponentDto |
| PUT | `/bff/meetings/report-components/:id` | コンポーネント更新 | UpdateReportComponentDto | ReportComponentDto |
| DELETE | `/bff/meetings/report-components/:id` | コンポーネント削除 | - | void |
| PUT | `/bff/meetings/report-components/reorder` | コンポーネント並べ替え | ReorderComponentsDto | ReportComponentListDto |
| GET | `/bff/meetings/report-layout-templates` | テンプレート一覧取得 | - | LayoutTemplateListDto |
| POST | `/bff/meetings/report-layouts/from-template` | テンプレートからレイアウト作成 | CreateLayoutFromTemplateDto | ReportLayoutDto |

### DTOs

```typescript
// ===========================
// Layout DTOs
// ===========================
interface ReportLayoutDto {
  id: string;
  meetingTypeId: string;
  layoutCode: string;
  layoutName: string;
  description?: string;
  isDefault: boolean;
  sortOrder: number;
  isActive: boolean;
  pageCount: number;
}

interface ReportLayoutListDto {
  items: ReportLayoutDto[];
  total: number;
}

interface CreateReportLayoutDto {
  meetingTypeId: string;
  layoutCode: string;
  layoutName: string;
  description?: string;
  isDefault?: boolean;
}

interface UpdateReportLayoutDto {
  layoutCode?: string;
  layoutName?: string;
  description?: string;
  isDefault?: boolean;
  isActive?: boolean;
}

interface ReorderLayoutsDto {
  meetingTypeId: string;
  orderedIds: string[];
}

// ===========================
// Page DTOs
// ===========================
type ReportPageType = 'FIXED' | 'PER_DEPARTMENT' | 'PER_BU';

interface ReportPageDto {
  id: string;
  layoutId: string;
  pageCode: string;
  pageName: string;
  pageType: ReportPageType;
  expandDimensionId?: string;
  sortOrder: number;
  isActive: boolean;
  componentCount: number;
}

interface ReportPageListDto {
  items: ReportPageDto[];
  total: number;
}

interface CreateReportPageDto {
  layoutId: string;
  pageCode: string;
  pageName: string;
  pageType: ReportPageType;
  expandDimensionId?: string;
}

interface UpdateReportPageDto {
  pageCode?: string;
  pageName?: string;
  pageType?: ReportPageType;
  expandDimensionId?: string | null;
  isActive?: boolean;
}

interface ReorderPagesDto {
  layoutId: string;
  orderedIds: string[];
}

// ===========================
// Component DTOs
// ===========================
type ReportComponentType =
  | 'KPI_CARD'
  | 'TABLE'
  | 'CHART'
  | 'SUBMISSION_DISPLAY'
  | 'REPORT_LINK'
  | 'ACTION_LIST'
  | 'SNAPSHOT_COMPARE'
  | 'KPI_DASHBOARD'
  | 'AP_PROGRESS';

type ReportDataSource = 'FACT' | 'KPI' | 'SUBMISSION' | 'SNAPSHOT' | 'EXTERNAL';
type ComponentWidth = 'FULL' | 'HALF' | 'THIRD';
type ComponentHeight = 'AUTO' | 'SMALL' | 'MEDIUM' | 'LARGE';

interface ReportComponentDto {
  id: string;
  pageId: string;
  componentCode: string;
  componentName: string;
  componentType: ReportComponentType;
  dataSource: ReportDataSource;
  width: ComponentWidth;
  height?: ComponentHeight;
  configJson: ComponentConfig; // 下記参照
  sortOrder: number;
  isActive: boolean;
}

interface ReportComponentListDto {
  items: ReportComponentDto[];
  total: number;
}

interface CreateReportComponentDto {
  pageId: string;
  componentCode: string;
  componentName: string;
  componentType: ReportComponentType;
  dataSource: ReportDataSource;
  width: ComponentWidth;
  height?: ComponentHeight;
  configJson?: Partial<ComponentConfig>;
}

interface UpdateReportComponentDto {
  componentCode?: string;
  componentName?: string;
  componentType?: ReportComponentType;
  dataSource?: ReportDataSource;
  width?: ComponentWidth;
  height?: ComponentHeight;
  configJson?: Partial<ComponentConfig>;
  isActive?: boolean;
}

interface ReorderComponentsDto {
  pageId: string;
  orderedIds: string[];
}

// ===========================
// Template DTOs
// ===========================
interface LayoutTemplateDto {
  id: string;
  templateCode: string;
  templateName: string;
  description: string;
  pageCount: number;
  componentCount: number;
}

interface LayoutTemplateListDto {
  items: LayoutTemplateDto[];
  total: number;
}

interface CreateLayoutFromTemplateDto {
  meetingTypeId: string;
  templateId: string;
  layoutCode: string;
  layoutName: string;
}

// ===========================
// ComponentConfig Types (9種類)
// ===========================
interface BaseConfig {
  title?: string;
  showHeader?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  hideWhenEmpty?: boolean;
  emptyMessage?: string;
}

interface KpiCardConfig extends BaseConfig {
  subjectIds: string[];
  layout: 'grid' | 'list';
  columns?: 2 | 3 | 4;
  showTarget?: boolean;
  showVariance?: boolean;
  showTrend?: boolean;
  showSparkline?: boolean;
  thresholds?: { danger?: number; warning?: number; };
}

interface TableConfig extends BaseConfig {
  rowAxis: 'organization' | 'subject' | 'period';
  compareMode: 'BUDGET_VS_ACTUAL' | 'BUDGET_VS_ACTUAL_FORECAST' | 'YOY' | 'MOM';
  columns: ('budget' | 'actual' | 'forecast' | 'variance' | 'varianceRate')[];
  showTotal?: boolean;
  showSubtotal?: boolean;
  highlightVariance?: boolean;
}

interface ChartConfig extends BaseConfig {
  chartType: 'waterfall' | 'bar' | 'line' | 'area' | 'pie' | 'donut';
  xAxis: 'period' | 'organization' | 'subject';
  series: { dataKey: string; name: string; color?: string; }[];
  showLegend?: boolean;
  showDataLabels?: boolean;
  showGrid?: boolean;
  waterfallConfig?: {
    startLabel?: string;
    endLabel?: string;
    positiveColor?: string;
    negativeColor?: string;
    totalColor?: string;
  };
}

// ... 他のConfig型も同様
type ComponentConfig =
  | KpiCardConfig
  | TableConfig
  | ChartConfig
  | SubmissionDisplayConfig
  | ReportLinkConfig
  | ActionListConfig
  | SnapshotCompareConfig
  | KpiDashboardConfig
  | ApProgressConfig;
```

### Errors → UI Messages

| Error Code | UI Message |
|------------|-----------|
| ReportLayoutNotFoundError | 「レイアウトが見つかりません」 |
| ReportLayoutDuplicateCodeError | 「レイアウトコードが重複しています」 |
| ReportLayoutDefaultDeleteError | 「デフォルトレイアウトは削除できません」 |
| ReportLayoutInUseError | 「使用中のレイアウトは削除できません」 |
| ReportPageNotFoundError | 「ページが見つかりません」 |
| ReportPageDuplicateCodeError | 「ページコードが重複しています」 |
| ReportComponentNotFoundError | 「コンポーネントが見つかりません」 |
| ReportComponentDuplicateCodeError | 「コンポーネントコードが重複しています」 |
| VALIDATION_ERROR | フィールド別インラインエラー |

### DTO Import（MANDATORY）

```typescript
import type {
  ReportLayoutDto,
  ReportLayoutListDto,
  CreateReportLayoutDto,
  UpdateReportLayoutDto,
  ReorderLayoutsDto,
  ReportPageDto,
  ReportPageListDto,
  CreateReportPageDto,
  UpdateReportPageDto,
  ReorderPagesDto,
  ReportComponentDto,
  ReportComponentListDto,
  CreateReportComponentDto,
  UpdateReportComponentDto,
  ReorderComponentsDto,
  LayoutTemplateDto,
  LayoutTemplateListDto,
  CreateLayoutFromTemplateDto,
  ComponentConfig,
  KpiCardConfig,
  TableConfig,
  ChartConfig,
} from "@epm/contracts/bff/meetings";
```

---

## 6. UI Components

### Tier 1（使用必須 - @/shared/ui から）
- Button, Input, Textarea, Select, Checkbox, Label
- Card, Badge, Tabs, TabsList, TabsTrigger, TabsContent
- Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
- Toast/Sonner, Popover, Tooltip
- Skeleton, Separator

### Tier 2（必要時のみ）
- Collapsible, ScrollArea
- Form (react-hook-form with zod)
- RadioGroup, RadioGroupItem

### Tier 3（ドラッグ＆ドロップ用）
- @dnd-kit/core: DndContext, closestCenter, DragEndEvent
- @dnd-kit/sortable: SortableContext, verticalListSortingStrategy, useSortable
- @dnd-kit/utilities: CSS (transform)

### Feature-specific Components（v0 が生成）
```
components/
├── layout-settings-page.tsx      # メインページ
├── layout-tree.tsx               # 階層構造ツリー（左ペイン）
├── layout-item.tsx               # レイアウトアイテム
├── page-item.tsx                 # ページアイテム（DnD対応）
├── component-item.tsx            # コンポーネントアイテム（DnD対応）
├── layout-detail-panel.tsx       # レイアウト詳細（右ペイン）
├── page-detail-panel.tsx         # ページ詳細（右ペイン）
├── component-detail-panel.tsx    # コンポーネント詳細（右ペイン）
├── component-config-panels/
│   ├── kpi-card-config.tsx       # KPI_CARD設定UI
│   ├── table-config.tsx          # TABLE設定UI
│   ├── chart-config.tsx          # CHART設定UI
│   ├── submission-display-config.tsx
│   ├── report-link-config.tsx
│   ├── action-list-config.tsx
│   ├── snapshot-compare-config.tsx
│   ├── kpi-dashboard-config.tsx
│   └── ap-progress-config.tsx
├── dialogs/
│   ├── create-layout-dialog.tsx
│   ├── create-page-dialog.tsx
│   ├── create-component-dialog.tsx
│   ├── template-select-dialog.tsx
│   └── delete-confirm-dialog.tsx
└── preview/
    └── layout-preview.tsx
api/
├── bff-client.ts                 # BffClient interface
├── mock-bff-client.ts            # MockBffClient
└── http-bff-client.ts            # HttpBffClient
```

---

## 7. Mock Data

### Sample Data（BFF Response 形状と一致必須）

```typescript
// Mock Layouts
const mockLayouts: ReportLayoutDto[] = [
  {
    id: 'layout-1',
    meetingTypeId: 'mt-1',
    layoutCode: 'MONTHLY_STD',
    layoutName: '月次標準レイアウト',
    description: '月次経営会議の標準的なレポート構成',
    isDefault: true,
    sortOrder: 10,
    isActive: true,
    pageCount: 5,
  },
  {
    id: 'layout-2',
    meetingTypeId: 'mt-1',
    layoutCode: 'MONTHLY_SIMPLE',
    layoutName: '月次簡易レイアウト',
    description: 'エグゼクティブ向け簡易版',
    isDefault: false,
    sortOrder: 20,
    isActive: true,
    pageCount: 2,
  },
];

// Mock Pages
const mockPages: ReportPageDto[] = [
  {
    id: 'page-1',
    layoutId: 'layout-1',
    pageCode: 'SUMMARY',
    pageName: 'エグゼクティブサマリー',
    pageType: 'FIXED',
    sortOrder: 10,
    isActive: true,
    componentCount: 4,
  },
  {
    id: 'page-2',
    layoutId: 'layout-1',
    pageCode: 'DEPT_REPORT',
    pageName: '部門報告',
    pageType: 'PER_DEPARTMENT',
    expandDimensionId: 'dim-org',
    sortOrder: 20,
    isActive: true,
    componentCount: 1,
  },
  {
    id: 'page-3',
    layoutId: 'layout-1',
    pageCode: 'KPI_ACTION',
    pageName: 'KPI・アクション',
    pageType: 'FIXED',
    sortOrder: 30,
    isActive: true,
    componentCount: 2,
  },
];

// Mock Components
const mockComponents: ReportComponentDto[] = [
  {
    id: 'comp-1',
    pageId: 'page-1',
    componentCode: 'KPI_CARDS',
    componentName: '主要KPIカード',
    componentType: 'KPI_CARD',
    dataSource: 'FACT',
    width: 'FULL',
    configJson: {
      subjectIds: ['sub-sales', 'sub-profit', 'sub-cost'],
      layout: 'grid',
      columns: 3,
      showTarget: true,
      showVariance: true,
      showTrend: true,
    } as KpiCardConfig,
    sortOrder: 10,
    isActive: true,
  },
  {
    id: 'comp-2',
    pageId: 'page-1',
    componentCode: 'WATERFALL',
    componentName: '損益ウォーターフォール',
    componentType: 'CHART',
    dataSource: 'FACT',
    width: 'FULL',
    configJson: {
      chartType: 'waterfall',
      xAxis: 'subject',
      series: [{ dataKey: 'variance', name: '差異', color: '#14b8a6' }],
      showLegend: false,
      showDataLabels: true,
      waterfallConfig: {
        startLabel: '予算',
        endLabel: '実績',
        positiveColor: '#22c55e',
        negativeColor: '#ef4444',
        totalColor: '#14b8a6',
      },
    } as ChartConfig,
    sortOrder: 20,
    isActive: true,
  },
  {
    id: 'comp-3',
    pageId: 'page-1',
    componentCode: 'BA_TABLE',
    componentName: '予実対比表',
    componentType: 'TABLE',
    dataSource: 'FACT',
    width: 'FULL',
    configJson: {
      rowAxis: 'subject',
      compareMode: 'BUDGET_VS_ACTUAL',
      columns: ['budget', 'actual', 'variance', 'varianceRate'],
      showTotal: true,
      highlightVariance: true,
    } as TableConfig,
    sortOrder: 30,
    isActive: true,
  },
];

// Mock Templates
const mockTemplates: LayoutTemplateDto[] = [
  {
    id: 'template-1',
    templateCode: 'MONTHLY_MEETING',
    templateName: '月次経営会議レイアウト',
    description: '月次経営会議向けの標準テンプレート。エグゼクティブサマリー、部門報告、KPI・アクション、アクション管理、前回比較の5ページ構成。',
    pageCount: 5,
    componentCount: 9,
  },
];
```

### States to Cover
- 通常状態（データあり、複数レイアウト）
- 空状態（データなし、「テンプレートから作成」を促す）
- エラー状態（バリデーション、ビジネスエラー）
- ローディング状態（Skeleton）
- 選択なし状態（プレースホルダー表示）

---

## 8. Output Structure（二重出力：プレビュー用 + 移植用）

### 重要：2つの出力先に同期して生成すること（MANDATORY）

v0 は以下の **2箇所に同じ内容を出力** すること：

---

### 1. プレビュー用（v0 内で動作確認）

v0 プロジェクトの `app/` に配置（プレビュー・調整用）:

```
app/meetings/meeting-report-layout/
├── page.tsx
├── preview/
│   └── [layoutId]/
│       └── page.tsx
└── components/
    ├── layout-settings-page.tsx
    ├── layout-tree.tsx
    ├── layout-item.tsx
    ├── page-item.tsx
    ├── component-item.tsx
    ├── layout-detail-panel.tsx
    ├── page-detail-panel.tsx
    ├── component-detail-panel.tsx
    ├── component-config-panels/
    │   ├── kpi-card-config.tsx
    │   ├── table-config.tsx
    │   ├── chart-config.tsx
    │   ├── submission-display-config.tsx
    │   ├── report-link-config.tsx
    │   ├── action-list-config.tsx
    │   ├── snapshot-compare-config.tsx
    │   ├── kpi-dashboard-config.tsx
    │   └── ap-progress-config.tsx
    ├── dialogs/
    │   ├── create-layout-dialog.tsx
    │   ├── create-page-dialog.tsx
    │   ├── create-component-dialog.tsx
    │   ├── template-select-dialog.tsx
    │   └── delete-confirm-dialog.tsx
    ├── preview/
    │   └── layout-preview.tsx
    └── api/
        ├── bff-client.ts
        ├── mock-bff-client.ts
        └── http-bff-client.ts
```

---

### 2. 移植用モジュール（DL して本番環境へ移植）

v0 プロジェクトの `_v0_drop/` に配置（移植用、プレビュー用と同期）:

```
_v0_drop/meetings/meeting-report-layout/src/
├── app/
│   ├── page.tsx
│   └── preview/
│       └── [layoutId]/
│           └── page.tsx
├── components/
│   ├── layout-settings-page.tsx
│   ├── layout-tree.tsx
│   ├── layout-item.tsx
│   ├── page-item.tsx
│   ├── component-item.tsx
│   ├── layout-detail-panel.tsx
│   ├── page-detail-panel.tsx
│   ├── component-detail-panel.tsx
│   ├── component-config-panels/
│   │   ├── kpi-card-config.tsx
│   │   ├── table-config.tsx
│   │   ├── chart-config.tsx
│   │   ├── submission-display-config.tsx
│   │   ├── report-link-config.tsx
│   │   ├── action-list-config.tsx
│   │   ├── snapshot-compare-config.tsx
│   │   ├── kpi-dashboard-config.tsx
│   │   └── ap-progress-config.tsx
│   ├── dialogs/
│   │   ├── create-layout-dialog.tsx
│   │   ├── create-page-dialog.tsx
│   │   ├── create-component-dialog.tsx
│   │   ├── template-select-dialog.tsx
│   │   └── delete-confirm-dialog.tsx
│   ├── preview/
│   │   └── layout-preview.tsx
│   └── index.ts              # barrel export
├── api/
│   ├── bff-client.ts          # interface
│   ├── mock-bff-client.ts     # mock implementation
│   ├── http-bff-client.ts     # HTTP implementation
│   └── index.ts              # barrel export + factory
├── lib/
│   └── error-messages.ts     # エラーコード → UIメッセージ
├── types/
│   └── index.ts              # 型定義（contracts からの re-export）
└── OUTPUT.md                 # 移植手順・チェックリスト
```

---

### OUTPUT.md（必須生成 - _v0_drop 内）

v0 は `_v0_drop/meetings/meeting-report-layout/src/OUTPUT.md` に以下を含めること:

1. **Generated Files Tree** - 生成したファイル一覧
2. **Imports Used** - @/shared/ui から使用したコンポーネント、DTO インポート
3. **External Dependencies** - @dnd-kit等の追加パッケージ
4. **Missing Components (TODO)** - 不足している shared component があれば記載
5. **Migration Steps** - 移植手順:
   - コピー先: `apps/web/src/features/meetings/meeting-report-layout/`
   - インポートパス変更（必要な場合）
   - page.tsx 接続方法
   - ルーティング設定
6. **Compliance Checklist**:
   - [ ] Components from @/shared/ui only
   - [ ] DTOs from @epm/contracts/bff only
   - [ ] No raw colors (bg-[#...]) - semantic tokens only
   - [ ] No layout.tsx
   - [ ] No base UI recreated in feature
   - [ ] MockBffClient returns DTO-shaped data
   - [ ] Error codes mapped to user messages
   - [ ] _v0_drop と app が同期している
   - [ ] @dnd-kit dependencies listed

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
- @dnd-kit を使用したドラッグ＆ドロップ（独自実装禁止）
- OUTPUT.md 生成
```

---

## 10. UX/UI ベストプラクティス

### 参考実装：meeting-form-settings（A3）

本機能は A3（報告フォーム設定）と同様の2カラム構成を採用する。

**共通パターン**:
- ヘッダー：戻るボタン + タイトル + サブタイトル + アクションボタン
- 左ペイン：階層構造ツリー（展開/折りたたみ、選択、D&D）
- 右ペイン：詳細パネル（フォーム、保存/キャンセル/削除）
- 未選択時：プレースホルダー表示
- ローディング：Skeleton
- トースト：成功/エラー通知

**A4 固有の考慮点**:
- 3階層（レイアウト→ページ→コンポーネント）
- 9種類のコンポーネントタイプ別設定UI
- プレビュー機能（別ルート）
- テンプレート選択UI（カード形式）

### ドラッグ＆ドロップ UX

- ドラッグハンドル（GripVertical アイコン）を使用
- ドラッグ中はアイテムを半透明化
- ドロップ可能位置をハイライト表示
- 同一親内でのみ並べ替え可能（ページ間移動は不可）
- 並べ替え完了時に即時API更新

### コンポーネントタイプ選択 UX

- セレクトボックスにアイコン + ラベル + 説明を表示
- タイプ変更時は config_json リセット確認ダイアログ
- タイプ別設定UIは動的に切り替え

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
- [x] @dnd-kit 依存を明記
- [x] A3 との UX 一貫性を説明

## 📋 v0 生成後チェックリスト

v0 生成物を DL する前に確認:

- [ ] `app/meetings/meeting-report-layout/` でプレビュー動作確認
- [ ] `_v0_drop/meetings/meeting-report-layout/src/` が生成されている
- [ ] `_v0_drop/` 内に OUTPUT.md が存在する
- [ ] プレビュー用と移植用のコンポーネントが同期している
- [ ] インポートパスが本番環境想定になっている
- [ ] @dnd-kit によるドラッグ＆ドロップが動作している
- [ ] 9種類のコンポーネント設定UIが全て生成されている
