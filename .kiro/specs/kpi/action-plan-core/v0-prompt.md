# v0 Prompt: action-plan-core

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
**kpi/action-plan-core**: KPI目標達成のためのアクションプラン（施策）管理画面

### 主要ユースケース
1. アクションプラン一覧表示（検索・フィルタ・ソート・ページング）
2. アクションプラン詳細表示
3. アクションプラン新規作成
4. アクションプラン編集
5. アクションプラン削除（論理削除）
6. KPI科目との連携表示
```

---

## 4. Screens

```markdown
### Screen 1: アクションプラン一覧画面
- **Purpose**: 登録されているアクションプランを一覧で確認・管理
- **Layout**:
  - 検索パネル（キーワード検索、ステータスフィルタ、優先度フィルタ）
  - テーブル（プランコード、プラン名、紐付きKPI、責任者、期限、ステータス、進捗率）
  - ページネーション
  - 新規作成ボタン
- **Interactions**:
  - 行クリック → 詳細パネル表示
  - 検索・フィルタ → 一覧更新
  - ソート（プランコード、プラン名、期限、ステータス）
  - 新規作成ボタン → 作成ダイアログ

### Screen 2: アクションプラン詳細パネル（スライドオーバー）
- **Purpose**: アクションプランの詳細情報を確認
- **Trigger**: 一覧行クリック
- **Content**:
  - 基本情報（プランコード、プラン名、説明、紐付きKPI、責任部門、責任者）
  - スケジュール（開始日、期限）
  - ステータス・進捗率・優先度
  - 配下のWBS件数・タスク件数サマリ
  - KPI科目へのリンク
  - ガントチャート・カンバンボードへの遷移リンク
- **Actions**: 編集ボタン / 削除ボタン / 閉じる

### Screen 3: アクションプラン作成ダイアログ
- **Purpose**: 新しいアクションプランを登録
- **Trigger**: 新規作成ボタン
- **Form Fields**:
  - プランコード* (required, text)
  - プラン名* (required, text)
  - 説明 (optional, textarea)
  - 紐付きKPI科目* (required, select - KPI科目のみ)
  - 責任部門 (optional, select)
  - 責任者 (optional, select)
  - 開始日 (optional, date)
  - 期限 (optional, date)
  - 優先度 (optional, select - HIGH/MEDIUM/LOW)
- **Actions**: 作成 / キャンセル
- **Validation**:
  - プランコード: 必須、50文字以内
  - プラン名: 必須、200文字以内
  - 紐付きKPI: 必須

### Screen 4: アクションプラン編集ダイアログ
- **Purpose**: 既存アクションプランの情報を変更
- **Trigger**: 詳細パネルの編集ボタン
- **Form Fields**: 作成ダイアログと同じ + ステータス・進捗率
  - ステータス (select - NOT_STARTED/IN_PROGRESS/COMPLETED/CANCELLED)
  - 進捗率 (number, 0-100)
- **Actions**: 保存 / キャンセル

### Screen 5: 削除確認ダイアログ
- **Purpose**: 削除前の確認と警告
- **Trigger**: 詳細パネルの削除ボタン
- **Content**:
  - 「このアクションプランを削除しますか？」
  - 「配下のWBS・タスクも削除されます。」（警告）
  - 配下のWBS件数・タスク件数表示
- **Actions**: 削除 / キャンセル
```

---

## 5. BFF Contract（design.md からコピー）

```markdown
### Endpoints

| Method | Endpoint | Purpose | Request DTO | Response DTO |
|--------|----------|---------|-------------|--------------|
| GET | /api/bff/action-plan/plans | 一覧取得 | BffListPlansRequest | BffListPlansResponse |
| GET | /api/bff/action-plan/plans/:id | 詳細取得 | - | BffPlanDetailResponse |
| POST | /api/bff/action-plan/plans | 新規作成 | BffCreatePlanRequest | BffPlanDetailResponse |
| PATCH | /api/bff/action-plan/plans/:id | 編集 | BffUpdatePlanRequest | BffPlanDetailResponse |
| DELETE | /api/bff/action-plan/plans/:id | 削除（論理） | - | void |
| GET | /api/bff/action-plan/kpi-subjects | KPI科目一覧（選択用） | - | BffKpiSubjectsResponse |

### DTOs

```typescript
// === Enums ===
export type ActionPlanStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type ActionPlanPriority = 'HIGH' | 'MEDIUM' | 'LOW';

// === DTOs ===
export interface BffActionPlanSummary {
  id: string;
  planCode: string;
  planName: string;
  subjectId: string;
  subjectName: string;
  ownerEmployeeId: string | null;
  ownerEmployeeName: string | null;
  dueDate: string | null;
  status: ActionPlanStatus;
  progressRate: number | null;
  priority: ActionPlanPriority | null;
}

export interface BffActionPlanDetail extends BffActionPlanSummary {
  description: string | null;
  ownerDepartmentStableId: string | null;
  ownerDepartmentName: string | null;
  startDate: string | null;
  isActive: boolean;
  wbsCount: number;
  taskCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BffListPlansRequest {
  page?: number;
  pageSize?: number;
  sortBy?: 'planCode' | 'planName' | 'dueDate' | 'status';
  sortOrder?: 'asc' | 'desc';
  keyword?: string;
  status?: ActionPlanStatus;
  priority?: ActionPlanPriority;
}

export interface BffListPlansResponse {
  plans: BffActionPlanSummary[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface BffCreatePlanRequest {
  planCode: string;
  planName: string;
  description?: string;
  subjectId: string;
  ownerDepartmentStableId?: string;
  ownerEmployeeId?: string;
  startDate?: string;
  dueDate?: string;
  priority?: ActionPlanPriority;
}

export interface BffUpdatePlanRequest {
  planCode?: string;
  planName?: string;
  description?: string;
  subjectId?: string;
  ownerDepartmentStableId?: string;
  ownerEmployeeId?: string;
  startDate?: string;
  dueDate?: string;
  status?: ActionPlanStatus;
  progressRate?: number;
  priority?: ActionPlanPriority;
  updatedAt: string; // 楽観的ロック用
}

export interface BffPlanDetailResponse {
  plan: BffActionPlanDetail;
}

export interface BffKpiSubject {
  id: string;
  subjectCode: string;
  subjectName: string;
}

export interface BffKpiSubjectsResponse {
  subjects: BffKpiSubject[];
}
```

### Errors → UI Messages

| Error Code | UI Message |
|------------|-----------|
| PLAN_NOT_FOUND | 「アクションプランが見つかりません」 |
| PLAN_CODE_DUPLICATE | 「プランコードが重複しています」 |
| INVALID_SUBJECT_TYPE | 「KPI科目のみ選択可能です」 |
| OPTIMISTIC_LOCK_ERROR | 「他のユーザーが更新しました。画面を更新してください」 |
| FORBIDDEN | 「この操作を行う権限がありません」 |

### DTO Import（MANDATORY）

```typescript
import type {
  ActionPlanStatus,
  ActionPlanPriority,
  BffActionPlanSummary,
  BffActionPlanDetail,
  BffListPlansRequest,
  BffListPlansResponse,
  BffCreatePlanRequest,
  BffUpdatePlanRequest,
  BffPlanDetailResponse,
  BffKpiSubject,
  BffKpiSubjectsResponse,
} from "@epm/contracts/bff/action-plan-core";
```
```

---

## 6. UI Components

```markdown
### Tier 1（使用必須 - @/shared/ui から）
- Button, Input, Textarea, Select
- Table, Pagination, Card, Dialog, Alert, Badge
- Toast/Sonner, Sheet

### Tier 2（必要時のみ）
- Calendar (日付選択)
- Form (react-hook-form)
- Progress (進捗バー)

### Feature-specific Components（v0 が生成）
- ActionPlanListPage.tsx（一覧画面の親コンポーネント）
- ActionPlanSearchPanel.tsx（検索・フィルタパネル）
- ActionPlanTable.tsx（一覧テーブル）
- ActionPlanDetailSheet.tsx（詳細スライドオーバー）
- ActionPlanCreateDialog.tsx（作成ダイアログ）
- ActionPlanEditDialog.tsx（編集ダイアログ）
- DeleteConfirmDialog.tsx（削除確認ダイアログ）
- StatusBadge.tsx（ステータス表示バッジ）
- PriorityBadge.tsx（優先度表示バッジ）
- api/BffClient.ts, MockBffClient.ts, HttpBffClient.ts
```

---

## 7. Mock Data

```markdown
### Sample Data（BFF Response 形状と一致必須）

```typescript
const mockKpiSubjects: BffKpiSubject[] = [
  { id: "subj-001", subjectCode: "KPI-SALES", subjectName: "売上高KPI" },
  { id: "subj-002", subjectCode: "KPI-COST", subjectName: "コスト削減KPI" },
  { id: "subj-003", subjectCode: "KPI-QUALITY", subjectName: "品質向上KPI" },
];

const mockPlans: BffActionPlanSummary[] = [
  {
    id: "plan-001",
    planCode: "AP-2026-001",
    planName: "売上拡大施策",
    subjectId: "subj-001",
    subjectName: "売上高KPI",
    ownerEmployeeId: "emp-001",
    ownerEmployeeName: "山田太郎",
    dueDate: "2026-03-31",
    status: "IN_PROGRESS",
    progressRate: 45,
    priority: "HIGH",
  },
  {
    id: "plan-002",
    planCode: "AP-2026-002",
    planName: "業務効率化プロジェクト",
    subjectId: "subj-002",
    subjectName: "コスト削減KPI",
    ownerEmployeeId: "emp-002",
    ownerEmployeeName: "佐藤花子",
    dueDate: "2026-06-30",
    status: "NOT_STARTED",
    progressRate: 0,
    priority: "MEDIUM",
  },
  {
    id: "plan-003",
    planCode: "AP-2026-003",
    planName: "品質管理体制構築",
    subjectId: "subj-003",
    subjectName: "品質向上KPI",
    ownerEmployeeId: "emp-003",
    ownerEmployeeName: "鈴木一郎",
    dueDate: "2026-09-30",
    status: "IN_PROGRESS",
    progressRate: 70,
    priority: "LOW",
  },
  {
    id: "plan-004",
    planCode: "AP-2025-012",
    planName: "新規顧客開拓",
    subjectId: "subj-001",
    subjectName: "売上高KPI",
    ownerEmployeeId: "emp-001",
    ownerEmployeeName: "山田太郎",
    dueDate: "2025-12-31",
    status: "COMPLETED",
    progressRate: 100,
    priority: "HIGH",
  },
];

const mockPlanDetail: BffActionPlanDetail = {
  id: "plan-001",
  planCode: "AP-2026-001",
  planName: "売上拡大施策",
  description: "新規市場への進出と既存顧客の深耕により、売上目標を達成する。",
  subjectId: "subj-001",
  subjectName: "売上高KPI",
  ownerDepartmentStableId: "dept-sales",
  ownerDepartmentName: "営業部",
  ownerEmployeeId: "emp-001",
  ownerEmployeeName: "山田太郎",
  startDate: "2026-01-01",
  dueDate: "2026-03-31",
  status: "IN_PROGRESS",
  progressRate: 45,
  priority: "HIGH",
  isActive: true,
  wbsCount: 5,
  taskCount: 23,
  createdAt: "2026-01-01T09:00:00.000Z",
  updatedAt: "2026-01-09T10:30:00.000Z",
};
```

### States to Cover
- 通常状態（データあり）
- 空状態（データなし）
- ローディング状態
- エラー状態（バリデーション、重複エラー、競合エラー）
- 検索・フィルタ適用状態
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
app/kpi/action-plan-core/
├── page.tsx
└── components/
    ├── ActionPlanListPage.tsx
    ├── ActionPlanSearchPanel.tsx
    ├── ActionPlanTable.tsx
    ├── ActionPlanDetailSheet.tsx
    ├── ActionPlanCreateDialog.tsx
    ├── ActionPlanEditDialog.tsx
    ├── DeleteConfirmDialog.tsx
    ├── StatusBadge.tsx
    ├── PriorityBadge.tsx
    └── api/
        ├── BffClient.ts
        ├── MockBffClient.ts
        └── HttpBffClient.ts
```

---

### 2. 移植用モジュール（DL して本番環境へ移植）

v0 プロジェクトの `_v0_drop/` に配置（移植用、プレビュー用と同期）:

```
_v0_drop/kpi/action-plan-core/src/
├── app/
│   └── page.tsx
├── components/
│   ├── ActionPlanListPage.tsx
│   ├── ActionPlanSearchPanel.tsx
│   ├── ActionPlanTable.tsx
│   ├── ActionPlanDetailSheet.tsx
│   ├── ActionPlanCreateDialog.tsx
│   ├── ActionPlanEditDialog.tsx
│   ├── DeleteConfirmDialog.tsx
│   ├── StatusBadge.tsx
│   ├── PriorityBadge.tsx
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
   - `@epm/contracts/bff/action-plan-core` → `@epm/contracts/bff/action-plan-core`（そのまま）

---

### OUTPUT.md（必須生成 - _v0_drop 内）

v0 は `_v0_drop/kpi/action-plan-core/src/OUTPUT.md` に以下を含めること:

1. **Generated Files Tree** - 生成したファイル一覧
2. **Imports Used** - @/shared/ui から使用したコンポーネント、DTO インポート
3. **Missing Components (TODO)** - 不足している shared component があれば記載
4. **Migration Steps** - 移植手順:
   - コピー先: `apps/web/src/features/kpi/action-plan-core/ui/`
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

## 10. 追加実装指示

```markdown
### ステータスバッジの色分け
- NOT_STARTED: グレー（bg-muted）
- IN_PROGRESS: 青（bg-blue-100 text-blue-800）
- COMPLETED: 緑（bg-green-100 text-green-800）
- CANCELLED: 赤（bg-red-100 text-red-800）

### 優先度バッジの色分け
- HIGH: 赤系
- MEDIUM: 黄系
- LOW: グレー系

### 遷移リンク
- 詳細パネルに「ガントチャートを開く」「カンバンボードを開く」リンクを配置
- リンク先: `/kpi/action-plan-gantt/:planId`, `/kpi/action-plan-kanban/:planId`

### 権限制御
- epm.actionplan.create: 作成ボタン表示
- epm.actionplan.update: 編集ボタン表示
- epm.actionplan.delete: 削除ボタン表示
- Mock段階ではすべてtrue固定でOK
```
