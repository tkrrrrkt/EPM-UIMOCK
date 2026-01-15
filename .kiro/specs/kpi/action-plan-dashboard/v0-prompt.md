# v0 Prompt: KPI Action Plan Dashboard

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
**kpi/action-plan-dashboard**: KPI予実・アクションプラン進捗ダッシュボード

### 主要ユースケース
1. KPI科目一覧と紐づくアクションプランの進捗を俯瞰表示
2. 組織・期間・進捗状況でのフィルタリング
3. KPI予実詳細の展開表示（月次予算・実績・差異）
4. 遅延・警告アラートの視覚的表示
5. ガントチャート・カンバンボードへのドリルダウン
```

---

## 4. Screens

```markdown
### Screen 1: ダッシュボードメイン画面
- **Purpose**: KPIとアクションプランの進捗を一覧で俯瞰
- **Layout**:
  - サマリーカード（総KPI数、総プラン数、遅延件数、全体進捗率）
  - フィルタパネル（組織、期間、進捗状況）
  - KPIグループ一覧（アコーディオン形式）
    - 各KPIにアクションプランサマリーカードを含む
- **Interactions**:
  - フィルタ変更で即時再取得
  - KPI行クリックで予実詳細パネル展開
  - 更新ボタンで最新データ取得

### Screen 2: KPI予実詳細パネル（インライン展開）
- **Purpose**: KPIの月次予実データを表示
- **Trigger**: KPI行クリック
- **Contents**:
  - KPIコード・名称
  - 月次テーブル（年月、予算、実績、差異、達成率）
  - 合計行（総予算、総実績、総達成率）
- **Actions**: 閉じる

### Screen 3: アクションプランサマリーカード
- **Purpose**: 各アクションプランの進捗サマリーを表示
- **Contents**:
  - プラン名・担当部門・担当者
  - 期間（開始日〜終了日）
  - WBS進捗率（プログレスバー）
  - タスク完了率（プログレスバー）
  - ステータスバッジ（遅延/正常/完了）
  - アラートアイコン（期限超過、進捗遅れ）
- **Actions**:
  - クリックでドリルダウンメニュー表示
  - ガントチャートへ遷移
  - カンバンボードへ遷移
```

---

## 5. BFF Contract（design.md からコピー）

```markdown
### Endpoints

| Method | Endpoint | Purpose | Request DTO | Response DTO |
|--------|----------|---------|-------------|--------------|
| GET | /api/bff/action-plan/dashboard | ダッシュボードデータ取得 | BffDashboardQuery | BffDashboardData |
| GET | /api/bff/action-plan/dashboard/kpi/:subjectId | KPI予実詳細取得 | - | BffKpiDetail |

### DTOs

```typescript
// === ダッシュボードデータ ===
export interface BffDashboardData {
  summary: BffDashboardSummary;
  kpiGroups: BffKpiGroup[];
  lastUpdatedAt: string;
}

export interface BffDashboardSummary {
  totalKpiCount: number;
  totalPlanCount: number;
  delayedPlanCount: number;
  completedPlanCount: number;
  overallProgressRate: number;
}

export interface BffKpiGroup {
  kpiId: string;
  kpiCode: string;
  kpiName: string;
  organizationName: string | null;
  budgetAmount: number | null;
  actualAmount: number | null;
  achievementRate: number | null;
  plans: BffPlanSummary[];
}

export interface BffPlanSummary {
  id: string;
  planCode: string;
  planName: string;
  departmentName: string | null;
  responsibleEmployeeName: string | null;
  startDate: string | null;
  dueDate: string | null;
  wbsProgressRate: number | null;
  taskCompletionRate: number | null;
  status: 'delayed' | 'normal' | 'completed';
  isOverdue: boolean;
}

// === KPI予実詳細 ===
export interface BffKpiDetail {
  kpiId: string;
  kpiCode: string;
  kpiName: string;
  monthlyData: BffKpiMonthlyData[];
  totalBudget: number;
  totalActual: number;
  totalAchievementRate: number;
}

export interface BffKpiMonthlyData {
  yearMonth: string;
  budgetAmount: number;
  actualAmount: number;
  variance: number;
  achievementRate: number;
}

// === Request DTOs ===
export interface BffDashboardQuery {
  organizationId?: string;
  periodFrom?: string;
  periodTo?: string;
  progressStatus?: 'delayed' | 'normal' | 'completed';
}
```

### Errors → UI Messages

| Error Code | UI Message |
|------------|-----------|
| SUBJECT_NOT_FOUND | 「KPI科目が見つかりません」 |
| FORBIDDEN | 「このダッシュボードへのアクセス権限がありません」 |

### DTO Import（MANDATORY）

```typescript
import type {
  BffDashboardData,
  BffDashboardSummary,
  BffKpiGroup,
  BffPlanSummary,
  BffKpiDetail,
  BffKpiMonthlyData,
  BffDashboardQuery,
} from "@epm/contracts/bff/action-plan-dashboard";
```
```

---

## 6. UI Components

```markdown
### Tier 1（使用必須 - @/shared/ui から）
- Button, Select
- Card, Badge, Progress
- Table
- Accordion / Collapsible
- Popover, Tooltip
- Toast/Sonner

### Tier 2（必要時のみ）
- Calendar / DatePicker（期間フィルタ用）

### Feature-specific Components（v0 が生成）
- DashboardPage.tsx - メイン画面
- DashboardSummaryCards.tsx - サマリーカード群
- DashboardFilterPanel.tsx - フィルタパネル
- KpiGroupList.tsx - KPIグループ一覧（アコーディオン）
- KpiGroupItem.tsx - 個別KPIグループ
- KpiDetailPanel.tsx - KPI予実詳細パネル
- PlanSummaryCard.tsx - アクションプランサマリーカード
- StatusBadge.tsx - ステータスバッジ（遅延/正常/完了）
- AlertIcon.tsx - アラートアイコン
- DrilldownMenu.tsx - ドリルダウンメニュー（ガント/カンバン遷移）
- api/BffClient.ts, MockBffClient.ts, HttpBffClient.ts
```

---

## 7. Mock Data

```markdown
### Sample Data（BFF Response 形状と一致必須）

```typescript
const mockDashboardData: BffDashboardData = {
  summary: {
    totalKpiCount: 5,
    totalPlanCount: 12,
    delayedPlanCount: 2,
    completedPlanCount: 3,
    overallProgressRate: 65,
  },
  kpiGroups: [
    {
      kpiId: "kpi-001",
      kpiCode: "KPI-SALES-001",
      kpiName: "売上高",
      organizationName: "営業本部",
      budgetAmount: 100000000,
      actualAmount: 85000000,
      achievementRate: 85,
      plans: [
        {
          id: "plan-001",
          planCode: "AP-2026-001",
          planName: "新規顧客開拓施策",
          departmentName: "営業1部",
          responsibleEmployeeName: "山田 太郎",
          startDate: "2026-01-01",
          dueDate: "2026-06-30",
          wbsProgressRate: 70,
          taskCompletionRate: 65,
          status: "normal",
          isOverdue: false,
        },
        {
          id: "plan-002",
          planCode: "AP-2026-002",
          planName: "既存顧客深耕施策",
          departmentName: "営業2部",
          responsibleEmployeeName: "佐藤 花子",
          startDate: "2026-02-01",
          dueDate: "2026-03-31",
          wbsProgressRate: 40,
          taskCompletionRate: 35,
          status: "delayed",
          isOverdue: true,
        },
      ],
    },
    {
      kpiId: "kpi-002",
      kpiCode: "KPI-COST-001",
      kpiName: "コスト削減率",
      organizationName: "管理本部",
      budgetAmount: 50000000,
      actualAmount: 45000000,
      achievementRate: 90,
      plans: [
        {
          id: "plan-003",
          planCode: "AP-2026-003",
          planName: "省エネ設備導入",
          departmentName: "総務部",
          responsibleEmployeeName: "鈴木 一郎",
          startDate: "2026-01-15",
          dueDate: "2026-09-30",
          wbsProgressRate: 100,
          taskCompletionRate: 100,
          status: "completed",
          isOverdue: false,
        },
      ],
    },
    {
      kpiId: "kpi-003",
      kpiCode: "KPI-HR-001",
      kpiName: "従業員満足度",
      organizationName: "人事本部",
      budgetAmount: null,
      actualAmount: null,
      achievementRate: null,
      plans: [],
    },
  ],
  lastUpdatedAt: "2026-01-09T10:30:00Z",
};

const mockKpiDetail: BffKpiDetail = {
  kpiId: "kpi-001",
  kpiCode: "KPI-SALES-001",
  kpiName: "売上高",
  monthlyData: [
    { yearMonth: "2026-01", budgetAmount: 8000000, actualAmount: 7500000, variance: -500000, achievementRate: 93.75 },
    { yearMonth: "2026-02", budgetAmount: 8500000, actualAmount: 8200000, variance: -300000, achievementRate: 96.47 },
    { yearMonth: "2026-03", budgetAmount: 9000000, actualAmount: 8800000, variance: -200000, achievementRate: 97.78 },
    { yearMonth: "2026-04", budgetAmount: 8500000, actualAmount: 7000000, variance: -1500000, achievementRate: 82.35 },
  ],
  totalBudget: 34000000,
  totalActual: 31500000,
  totalAchievementRate: 92.65,
};
```

### States to Cover
- 通常状態（KPI・アクションプランあり）
- 一部KPIにアクションプランなし
- 遅延アクションプランあり（警告表示）
- 全て完了状態
- フィルタ適用後の絞り込み状態
- KPI予実詳細パネル展開状態
- 空状態（データなし）
- エラー状態（権限エラー）
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
app/kpi/action-plan-dashboard/
├── page.tsx
└── components/
    ├── DashboardPage.tsx
    ├── DashboardSummaryCards.tsx
    ├── DashboardFilterPanel.tsx
    ├── KpiGroupList.tsx
    ├── KpiGroupItem.tsx
    ├── KpiDetailPanel.tsx
    ├── PlanSummaryCard.tsx
    ├── StatusBadge.tsx
    ├── AlertIcon.tsx
    ├── DrilldownMenu.tsx
    └── api/
        ├── BffClient.ts
        ├── MockBffClient.ts
        └── HttpBffClient.ts
```

---

### 2. 移植用モジュール（DL して本番環境へ移植）

v0 プロジェクトの `_v0_drop/` に配置（移植用、プレビュー用と同期）:

```
_v0_drop/kpi/action-plan-dashboard/src/
├── app/
│   └── page.tsx
├── components/
│   ├── DashboardPage.tsx
│   ├── DashboardSummaryCards.tsx
│   ├── DashboardFilterPanel.tsx
│   ├── KpiGroupList.tsx
│   ├── KpiGroupItem.tsx
│   ├── KpiDetailPanel.tsx
│   ├── PlanSummaryCard.tsx
│   ├── StatusBadge.tsx
│   ├── AlertIcon.tsx
│   ├── DrilldownMenu.tsx
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
   - `@epm/contracts/bff/action-plan-dashboard` → `@epm/contracts/bff/action-plan-dashboard`（そのまま）

---

### OUTPUT.md（必須生成 - _v0_drop 内）

v0 は `_v0_drop/kpi/action-plan-dashboard/src/OUTPUT.md` に以下を含めること:

1. **Generated Files Tree** - 生成したファイル一覧
2. **Imports Used** - @/shared/ui から使用したコンポーネント、DTO インポート
3. **Missing Components (TODO)** - 不足している shared component があれば記載
4. **Migration Steps** - 移植手順:
   - コピー先: `apps/web/src/features/kpi/action-plan-dashboard/ui/`
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
- 集計ロジック・ビジネスルールの実装（BFF/Domain APIの責務）

✅ REQUIRED:
- @/shared/ui からコンポーネント使用
- @epm/contracts/bff/action-plan-dashboard から DTO 使用
- semantic tokens（bg-primary, text-foreground, border-input 等）
- Tailwind scale（p-4, gap-4, rounded-lg 等）
- MockBffClient でモックデータ提供
- OUTPUT.md 生成
- 数値フォーマット（金額のカンマ区切り、%表示）
- 日付フォーマット（YYYY年MM月形式）
```

---

## 10. UI仕様詳細

```markdown
### サマリーカード
4つのカードを横並びで表示:
- **総KPI数**: totalKpiCount（アイコン: BarChart）
- **総プラン数**: totalPlanCount（アイコン: FileText）
- **遅延件数**: delayedPlanCount（アイコン: AlertTriangle、赤系）
- **全体進捗率**: overallProgressRate %（プログレスサークル）

### KPIグループ表示
アコーディオン形式で展開/折りたたみ:
- **ヘッダー部**: KPIコード、KPI名、組織名、予算、実績、達成率
- **展開部**: 紐づくアクションプランサマリーカード群
- **アクションプランなし**: 「アクションプランが登録されていません」メッセージ

### PlanSummaryCard
カード形式で以下を表示:
- **ヘッダー**: プラン名、ステータスバッジ
- **詳細**: 担当部門、担当者、期間
- **進捗**: WBS進捗率バー、タスク完了率バー（ラベル付き）
- **アラート**: isOverdue時に期限超過アイコン、delayed時に遅延アイコン
- **操作**: クリックでPopover（ガント/カンバン遷移）

### StatusBadge
- **delayed**: 赤系バッジ「遅延」
- **normal**: 緑系バッジ「進行中」
- **completed**: 青系バッジ「完了」

### KPI予実詳細パネル
KPIグループヘッダークリックで展開:
- Collapsible内にTableを配置
- 列: 年月、予算（右寄せ）、実績（右寄せ）、差異（右寄せ、負は赤）、達成率（%）
- 合計行: 太字、背景色変更

### フィルタパネル
横並びのフィルタ項目:
- 組織（Select）
- 期間（DateRangePicker or 2つのDatePicker）
- 進捗状況（Select: 全て/遅延/正常/完了）
- 更新ボタン
- 最終更新日時表示
```

---

## 変更履歴

| 日付 | 変更内容 | 担当 |
|------|---------|------|
| 2026-01-09 | 初版作成 | Claude Code |
