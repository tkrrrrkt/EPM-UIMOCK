# v0 Prompt: action-plan-gantt

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

**特記事項（ガントチャート）:**
- 本番環境では有償ガントチャートライブラリ（dhtmlxGantt/Bryntum/Syncfusion）を使用予定
- v0 ではライブラリ非依存のラッパーコンポーネントと周辺UIを生成
- ガントチャート本体は簡易実装（CSSベースのタイムライン表示）でOK
```

---

## 3. Feature

```markdown
**kpi/action-plan-gantt**: アクションプラン配下のWBSをガントチャート形式で管理

### 主要ユースケース
1. ガントチャート表示（WBS階層 + タイムラインバー）
2. WBS階層管理（ツリー展開/折りたたみ）
3. WBS新規作成・編集・削除
4. スケジュール編集（バー操作による日程変更）
5. 依存関係管理（先行タスク設定）
6. 進捗率管理
7. マイルストーン表示
8. カンバンボードへの遷移
9. フィルタリング
```

---

## 4. Screens

```markdown
### Screen 1: ガントチャート画面
- **Purpose**: WBSを階層構造とタイムラインバーで表示・編集
- **Layout**:
  - ヘッダー（アクションプラン名、表示期間切替、フィルタボタン、WBS追加ボタン）
  - 左側パネル: WBSツリー（階層表示、展開/折りたたみ）
  - 右側パネル: タイムライン（日付軸 + ガントバー）
  - フッター: 凡例（通常バー、マイルストーン、進捗）
- **Interactions**:
  - WBS行クリック → 編集パネル表示
  - WBS行ダブルクリック → カンバン遷移オプション
  - ガントバーのドラッグ → スケジュール変更（即時保存）
  - 表示期間切替（月/四半期/年）

### Screen 2: WBSツリー（左側パネル）
- **Purpose**: WBSを階層構造で表示
- **Content**:
  - WBSコード
  - WBS名
  - 担当者
  - 進捗率バー
  - 展開/折りたたみボタン
  - カンバン遷移リンク
- **Interactions**:
  - 展開/折りたたみ
  - 行クリック → 編集パネル
  - カンバンアイコンクリック → カンバン遷移

### Screen 3: タイムライン（右側パネル）
- **Purpose**: スケジュールをビジュアル表示
- **Content**:
  - 日付軸（表示期間に応じた粒度）
  - ガントバー（開始日〜終了日）
  - 進捗表示（バー内の塗りつぶし）
  - マイルストーン（菱形アイコン）
  - 依存線（矢印）
- **Interactions**:
  - バー左右ドラッグ → 日程移動
  - バー端ドラッグ → 期間変更
  - バークリック → 編集パネル

### Screen 4: WBS作成/編集パネル（スライドオーバー）
- **Purpose**: WBSの作成・編集
- **Trigger**: WBS追加ボタン / WBS行クリック
- **Form Fields**:
  - WBSコード* (required, text, 自動採番可)
  - WBS名* (required, text)
  - 説明 (optional, textarea)
  - 親WBS (optional, select)
  - 担当部門 (optional, select)
  - 担当者 (optional, select)
  - 開始日 (optional, date)
  - 終了日 (optional, date)
  - 進捗率 (number, 0-100)
  - マイルストーン (checkbox)
  - 先行WBS (optional, select)
- **Actions**: 保存 / キャンセル / 削除（編集時）
- **Validation**:
  - WBSコード: 必須、50文字以内
  - WBS名: 必須、200文字以内
  - 進捗率: 0-100
  - 開始日 <= 終了日

### Screen 5: 削除確認ダイアログ
- **Purpose**: WBS削除前の確認と警告
- **Trigger**: 編集パネルの削除ボタン
- **Content**:
  - 「このWBSを削除しますか？」
  - 「配下のWBS・タスクも削除されます。」（警告）
  - 配下のWBS件数・タスク件数表示
- **Actions**: 削除 / キャンセル

### Screen 6: フィルタパネル
- **Purpose**: 表示するWBSを絞り込み
- **Trigger**: フィルタボタン
- **Filters**:
  - 担当部門 (select)
  - マイルストーンのみ (checkbox)
- **Actions**: 適用 / クリア
```

---

## 5. BFF Contract（design.md からコピー）

```markdown
### Endpoints

| Method | Endpoint | Purpose | Request DTO | Response DTO |
|--------|----------|---------|-------------|--------------|
| GET | /api/bff/action-plan/gantt/:planId | ガントデータ取得 | - | BffGanttData |
| POST | /api/bff/action-plan/gantt/wbs | WBS作成 | BffCreateWbsRequest | BffWbsResponse |
| PATCH | /api/bff/action-plan/gantt/wbs/:id | WBS編集 | BffUpdateWbsRequest | BffWbsResponse |
| PATCH | /api/bff/action-plan/gantt/wbs/:id/schedule | スケジュール更新 | BffUpdateWbsScheduleRequest | BffWbsResponse |
| PATCH | /api/bff/action-plan/gantt/wbs/:id/progress | 進捗率更新 | BffUpdateWbsProgressRequest | BffWbsResponse |
| PATCH | /api/bff/action-plan/gantt/wbs/:id/dependency | 依存関係更新 | BffUpdateWbsDependencyRequest | BffWbsResponse |
| DELETE | /api/bff/action-plan/gantt/wbs/:id | WBS削除 | - | void |
| GET | /api/bff/action-plan/gantt/wbs/:id/next-code | 次のWBSコード取得 | - | BffNextWbsCodeResponse |

### DTOs

```typescript
// === ガントチャートデータ ===
export interface BffGanttData {
  planId: string;
  planName: string;
  wbsItems: BffGanttWbs[];
  links: BffGanttLink[];
}

export interface BffGanttWbs {
  id: string;
  parentWbsId: string | null;
  wbsCode: string;
  wbsName: string;
  description: string | null;
  assigneeDepartmentStableId: string | null;
  assigneeDepartmentName: string | null;
  assigneeEmployeeId: string | null;
  assigneeEmployeeName: string | null;
  startDate: string | null;
  dueDate: string | null;
  actualStartDate: string | null;
  actualEndDate: string | null;
  progressRate: number | null;
  isMilestone: boolean;
  sortOrder: number;
  taskCount: number;
  updatedAt: string;
}

export interface BffGanttLink {
  id: string;
  sourceWbsId: string;
  targetWbsId: string;
  type: 'finish_to_start';
}

// === Request DTOs ===
export interface BffCreateWbsRequest {
  actionPlanId: string;
  parentWbsId?: string;
  wbsCode?: string; // 空の場合自動採番
  wbsName: string;
  description?: string;
  assigneeDepartmentStableId?: string;
  assigneeEmployeeId?: string;
  startDate?: string;
  dueDate?: string;
  isMilestone?: boolean;
}

export interface BffUpdateWbsRequest {
  wbsCode?: string;
  wbsName?: string;
  description?: string;
  assigneeDepartmentStableId?: string;
  assigneeEmployeeId?: string;
  startDate?: string;
  dueDate?: string;
  isMilestone?: boolean;
  updatedAt: string;
}

export interface BffUpdateWbsScheduleRequest {
  startDate: string | null;
  dueDate: string | null;
}

export interface BffUpdateWbsProgressRequest {
  progressRate: number;
}

export interface BffUpdateWbsDependencyRequest {
  predecessorWbsId: string | null;
}

export interface BffWbsResponse {
  wbs: BffGanttWbs;
}

export interface BffNextWbsCodeResponse {
  nextCode: string;
}
```

### Errors → UI Messages

| Error Code | UI Message |
|------------|-----------|
| WBS_NOT_FOUND | 「WBSが見つかりません」 |
| WBS_CODE_DUPLICATE | 「WBSコードが重複しています」 |
| CIRCULAR_DEPENDENCY | 「循環依存は設定できません」 |
| OPTIMISTIC_LOCK_ERROR | 「他のユーザーが更新しました。画面を更新してください」 |
| FORBIDDEN | 「この操作を行う権限がありません」 |

### DTO Import（MANDATORY）

```typescript
import type {
  BffGanttData,
  BffGanttWbs,
  BffGanttLink,
  BffCreateWbsRequest,
  BffUpdateWbsRequest,
  BffUpdateWbsScheduleRequest,
  BffUpdateWbsProgressRequest,
  BffUpdateWbsDependencyRequest,
  BffWbsResponse,
  BffNextWbsCodeResponse,
} from "@epm/contracts/bff/action-plan-gantt";
```
```

---

## 6. UI Components

```markdown
### Tier 1（使用必須 - @/shared/ui から）
- Button, Input, Textarea, Select, Checkbox
- Card, Dialog, Alert, Badge, Sheet
- Toast/Sonner, Progress

### Tier 2（必要時のみ）
- Calendar (日付選択)
- Form (react-hook-form)

### Feature-specific Components（v0 が生成）
- GanttChartPage.tsx（ガントチャート親コンポーネント）
- GanttHeader.tsx（ヘッダー: 表示期間切替、フィルタ、WBS追加）
- WbsTree.tsx（左側: WBS階層ツリー）
- WbsTreeRow.tsx（WBS行）
- GanttTimeline.tsx（右側: タイムライン表示）
- GanttBar.tsx（ガントバー）
- GanttMilestone.tsx（マイルストーン菱形）
- GanttDependencyLine.tsx（依存線）
- WbsEditSheet.tsx（WBS作成/編集スライドオーバー）
- FilterPanel.tsx（フィルタパネル）
- DeleteConfirmDialog.tsx（削除確認）
- PeriodSelector.tsx（表示期間切替: 月/四半期/年）
- api/BffClient.ts, MockBffClient.ts, HttpBffClient.ts

### 注意: ガントチャート本体
- v0 では簡易実装（CSS Grid/Flexbox ベース）
- 本番環境では有償ライブラリに差し替え予定
- ラッパーコンポーネント（GanttTimeline）のインターフェースを明確に
```

---

## 7. Mock Data

```markdown
### Sample Data（BFF Response 形状と一致必須）

```typescript
const mockGanttData: BffGanttData = {
  planId: "plan-001",
  planName: "売上拡大施策",
  wbsItems: [
    {
      id: "wbs-001",
      parentWbsId: null,
      wbsCode: "1",
      wbsName: "企画フェーズ",
      description: "市場調査と戦略立案",
      assigneeDepartmentStableId: "dept-planning",
      assigneeDepartmentName: "企画部",
      assigneeEmployeeId: "emp-001",
      assigneeEmployeeName: "山田太郎",
      startDate: "2026-01-01",
      dueDate: "2026-01-31",
      actualStartDate: "2026-01-01",
      actualEndDate: null,
      progressRate: 80,
      isMilestone: false,
      sortOrder: 1,
      taskCount: 5,
      updatedAt: "2026-01-09T10:00:00.000Z",
    },
    {
      id: "wbs-002",
      parentWbsId: "wbs-001",
      wbsCode: "1.1",
      wbsName: "市場調査",
      description: null,
      assigneeDepartmentStableId: null,
      assigneeDepartmentName: null,
      assigneeEmployeeId: "emp-002",
      assigneeEmployeeName: "佐藤花子",
      startDate: "2026-01-01",
      dueDate: "2026-01-15",
      actualStartDate: "2026-01-01",
      actualEndDate: "2026-01-14",
      progressRate: 100,
      isMilestone: false,
      sortOrder: 1,
      taskCount: 3,
      updatedAt: "2026-01-09T10:00:00.000Z",
    },
    {
      id: "wbs-003",
      parentWbsId: "wbs-001",
      wbsCode: "1.2",
      wbsName: "戦略立案",
      description: null,
      assigneeDepartmentStableId: null,
      assigneeDepartmentName: null,
      assigneeEmployeeId: "emp-001",
      assigneeEmployeeName: "山田太郎",
      startDate: "2026-01-16",
      dueDate: "2026-01-31",
      actualStartDate: "2026-01-16",
      actualEndDate: null,
      progressRate: 60,
      isMilestone: false,
      sortOrder: 2,
      taskCount: 2,
      updatedAt: "2026-01-09T10:00:00.000Z",
    },
    {
      id: "wbs-004",
      parentWbsId: null,
      wbsCode: "2",
      wbsName: "実行フェーズ",
      description: "営業活動の実行",
      assigneeDepartmentStableId: "dept-sales",
      assigneeDepartmentName: "営業部",
      assigneeEmployeeId: "emp-003",
      assigneeEmployeeName: "鈴木一郎",
      startDate: "2026-02-01",
      dueDate: "2026-03-15",
      actualStartDate: null,
      actualEndDate: null,
      progressRate: 0,
      isMilestone: false,
      sortOrder: 2,
      taskCount: 10,
      updatedAt: "2026-01-09T10:00:00.000Z",
    },
    {
      id: "wbs-005",
      parentWbsId: null,
      wbsCode: "M1",
      wbsName: "中間レビュー",
      description: "進捗確認と方針調整",
      assigneeDepartmentStableId: null,
      assigneeDepartmentName: null,
      assigneeEmployeeId: "emp-001",
      assigneeEmployeeName: "山田太郎",
      startDate: "2026-02-15",
      dueDate: "2026-02-15",
      actualStartDate: null,
      actualEndDate: null,
      progressRate: null,
      isMilestone: true,
      sortOrder: 3,
      taskCount: 0,
      updatedAt: "2026-01-09T10:00:00.000Z",
    },
    {
      id: "wbs-006",
      parentWbsId: null,
      wbsCode: "3",
      wbsName: "評価フェーズ",
      description: "成果測定と報告",
      assigneeDepartmentStableId: "dept-planning",
      assigneeDepartmentName: "企画部",
      assigneeEmployeeId: "emp-001",
      assigneeEmployeeName: "山田太郎",
      startDate: "2026-03-16",
      dueDate: "2026-03-31",
      actualStartDate: null,
      actualEndDate: null,
      progressRate: 0,
      isMilestone: false,
      sortOrder: 4,
      taskCount: 3,
      updatedAt: "2026-01-09T10:00:00.000Z",
    },
  ],
  links: [
    {
      id: "link-001",
      sourceWbsId: "wbs-002",
      targetWbsId: "wbs-003",
      type: "finish_to_start",
    },
    {
      id: "link-002",
      sourceWbsId: "wbs-001",
      targetWbsId: "wbs-004",
      type: "finish_to_start",
    },
    {
      id: "link-003",
      sourceWbsId: "wbs-004",
      targetWbsId: "wbs-006",
      type: "finish_to_start",
    },
  ],
};
```

### States to Cover
- 通常状態（WBSあり）
- 空状態（WBSなし）
- ローディング状態
- エラー状態
- フィルタ適用状態
- 展開/折りたたみ状態
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
app/kpi/action-plan-gantt/
├── page.tsx
└── components/
    ├── GanttChartPage.tsx
    ├── GanttHeader.tsx
    ├── WbsTree.tsx
    ├── WbsTreeRow.tsx
    ├── GanttTimeline.tsx
    ├── GanttBar.tsx
    ├── GanttMilestone.tsx
    ├── GanttDependencyLine.tsx
    ├── WbsEditSheet.tsx
    ├── FilterPanel.tsx
    ├── DeleteConfirmDialog.tsx
    ├── PeriodSelector.tsx
    └── api/
        ├── BffClient.ts
        ├── MockBffClient.ts
        └── HttpBffClient.ts
```

---

### 2. 移植用モジュール（DL して本番環境へ移植）

v0 プロジェクトの `_v0_drop/` に配置（移植用、プレビュー用と同期）:

```
_v0_drop/kpi/action-plan-gantt/src/
├── app/
│   └── page.tsx
├── components/
│   ├── GanttChartPage.tsx
│   ├── GanttHeader.tsx
│   ├── WbsTree.tsx
│   ├── WbsTreeRow.tsx
│   ├── GanttTimeline.tsx
│   ├── GanttBar.tsx
│   ├── GanttMilestone.tsx
│   ├── GanttDependencyLine.tsx
│   ├── WbsEditSheet.tsx
│   ├── FilterPanel.tsx
│   ├── DeleteConfirmDialog.tsx
│   ├── PeriodSelector.tsx
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
   - `@epm/contracts/bff/action-plan-gantt` → `@epm/contracts/bff/action-plan-gantt`（そのまま）

---

### OUTPUT.md（必須生成 - _v0_drop 内）

v0 は `_v0_drop/kpi/action-plan-gantt/src/OUTPUT.md` に以下を含めること:

1. **Generated Files Tree** - 生成したファイル一覧
2. **Imports Used** - @/shared/ui から使用したコンポーネント、DTO インポート
3. **Missing Components (TODO)** - 不足している shared component があれば記載
4. **Migration Steps** - 移植手順:
   - コピー先: `apps/web/src/features/kpi/action-plan-gantt/ui/`
   - インポートパス変更（必要な場合）
   - page.tsx 接続方法
   - **有償ガントライブラリへの差し替え手順**
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
### ガントチャート簡易実装（v0版）
- CSS Grid を使用したタイムライン表示
- 各WBS行に対応するバーを position: absolute で配置
- 期間に応じた幅を計算（例: 1日 = 30px）
- スクロール可能なタイムラインコンテナ

### WBSツリー
- インデントレベルに応じた padding-left
- 展開/折りたたみアイコン（子がある場合のみ表示）
- 行ホバーでハイライト

### ガントバー
- 通常バー: bg-primary（進捗部分を塗りつぶし）
- マイルストーン: 菱形（◆）アイコン表示
- 進捗表示: バー内を進捗率に応じて塗りつぶし

### 依存線
- SVG または CSS で矢印線を描画
- sourceWbsId の終端 → targetWbsId の始端

### 表示期間
- 月表示: 日付を列に
- 四半期表示: 週を列に
- 年表示: 月を列に

### カンバン遷移
- WBS行にカンバンアイコンボタン
- クリックで `/kpi/action-plan-kanban/:planId?wbsId=:wbsId` へ遷移

### 権限制御
- epm.actionplan.create: WBS作成許可
- epm.actionplan.update: WBS編集・スケジュール変更許可
- epm.actionplan.delete: WBS削除許可
- Mock段階ではすべてtrue固定でOK

### 有償ライブラリ差し替え準備
- GanttTimeline コンポーネントのpropsを明確に定義
- data, onBarDrag, onBarResize, onLinkCreate 等のコールバック
- 本番環境でライブラリのラッパーに差し替え可能な設計
```
