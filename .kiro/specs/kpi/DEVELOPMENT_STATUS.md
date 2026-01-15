# KPI機能 開発状況レポート

> 最終更新: 2026-01-11

## 概要

KPIアクションプラン管理機能は、4つのFeatureで構成されています。
現在、**UI層（apps/web）の実装が完了**しており、MockBffClientによる動作確認が可能な状態です。

---

## 完成状況サマリー

| Feature | UI実装 | Contracts | MockBffClient | HttpBffClient | BFF | API | DB |
|---------|:------:|:---------:|:-------------:|:-------------:|:---:|:---:|:--:|
| action-plan-core | ✅ | ✅ | ✅ | 🔲 | 🔲 | 🔲 | 🔲 |
| action-plan-kanban | ✅ | ✅ | ✅ | 🔲 | 🔲 | 🔲 | 🔲 |
| action-plan-gantt | ✅ | ✅ | ✅ | 🔲 | 🔲 | 🔲 | 🔲 |
| action-plan-dashboard | ✅ | ✅ | ✅ | 🔲 | 🔲 | 🔲 | 🔲 |

**凡例**: ✅ 完了 / 🔲 未着手 / 🟡 一部完了

---

## Feature別詳細

### 1. action-plan-core（アクションプラン一覧・詳細CRUD）

**概要**: KPI目標達成のための施策（アクションプラン）を管理するCRUD機能

#### 完成済み
- ✅ BFF Contracts定義（`packages/contracts/src/bff/action-plan-core`）
- ✅ UI types/api SSoT re-export構成
- ✅ MockBffClient（全6メソッド実装）
- ✅ **Fixed Split View レイアウト**（2026-01-11改善）
  - 左側: 一覧テーブル（コンパクト化、選択行ハイライト）
  - 右側: 詳細パネル（380px固定）
- ✅ UIコンポーネント
  - `ActionPlanListPage.tsx` - メインページ（Split View対応）
  - `ActionPlanSearchPanel.tsx` - 検索パネル
  - `ActionPlanTable.tsx` - 一覧テーブル（7列コンパクト化）
  - `ActionPlanDetailPanel.tsx` - **新規** 詳細パネル（Split View右側）
  - `ActionPlanDetailSheet.tsx` - 詳細シート（レガシー）
  - `ActionPlanCreateDialog.tsx` - 新規作成ダイアログ
  - `ActionPlanEditDialog.tsx` - 編集ダイアログ
  - `DeleteConfirmDialog.tsx` - 削除確認ダイアログ
  - `StatusBadge.tsx` / `PriorityBadge.tsx` - ステータス・優先度バッジ

#### 未着手
- 🔲 HttpBffClient（BFF実装後に対応）
- 🔲 BFF実装（apps/bff）
- 🔲 Domain API実装（apps/api）
- 🔲 DB Migration（Prisma schema更新）

#### 要件トレーサビリティ（7要件）
| Req | 内容 | 状態 |
|-----|------|:----:|
| 1 | アクションプラン一覧表示 | ✅ |
| 2 | アクションプラン詳細表示 | ✅ |
| 3 | アクションプラン新規作成（初期ステータス・ラベル自動生成） | ✅ |
| 4 | アクションプラン編集（楽観的ロック） | ✅ |
| 5 | アクションプラン削除（論理削除） | ✅ |
| 6 | KPI科目連携 | ✅ |
| 7 | 権限制御 | ✅ |

---

### 2. action-plan-kanban（カンバンボード）

**概要**: Trello準拠のカンバンボード。@dnd-kit/coreによるD&D実装

#### 完成済み
- ✅ BFF Contracts定義（`packages/contracts/src/bff/action-plan-kanban`）
  - 26メソッドのBffClientインターフェース
  - Per-Action-Plan Statuses/Labels対応
- ✅ UI types/api SSoT re-export構成
- ✅ MockBffClient（全26メソッド実装）
- ✅ UIコンポーネント
  - `KanbanBoardPage.tsx` - メインページ（DndContext統合）
  - `KanbanColumn.tsx` - ステータス列
  - `TaskCard.tsx` - タスクカード
  - `TaskDetailModal.tsx` - タスク詳細モーダル
  - `TaskCreateInput.tsx` - タスク追加入力
  - `ChecklistSection.tsx` - チェックリストセクション
  - `CommentsSection.tsx` - コメントセクション
  - `LabelSelector.tsx` - ラベル選択
  - `AssigneeSelector.tsx` - 担当者選択
  - `StatusEditPopover.tsx` - ステータス編集ポップオーバー
  - `LabelEditPopover.tsx` - ラベル編集ポップオーバー
  - `FilterPanel.tsx` - フィルタパネル
  - `ColorPicker.tsx` - 色選択

#### 未着手
- 🔲 HttpBffClient
- 🔲 BFF実装
- 🔲 Domain API実装
- 🔲 DB Migration

#### 要件トレーサビリティ（13要件）
| Req | 内容 | 状態 |
|-----|------|:----:|
| 1 | カンバンボード表示 | ✅ |
| 2 | タスクD&D（ステータス変更） | ✅ |
| 3 | タスクD&D（並び順変更） | ✅ |
| 4 | タスク新規作成 | ✅ |
| 5 | タスク詳細モーダル | ✅ |
| 6 | チェックリスト機能 | ✅ |
| 7 | コメント機能 | ✅ |
| 8 | ラベル付与 | ✅ |
| 9 | 複数担当者アサイン | ✅ |
| 10 | タスク削除 | ✅ |
| 11 | 権限制御 | ✅ |
| 12 | ステータス編集（カンバン内） | ✅ |
| 13 | ラベル編集（カンバン内） | ✅ |

---

### 3. action-plan-gantt（ガントチャート）

**概要**: WBS階層構造とスケジュールをガントチャート形式で表示・編集

#### 完成済み
- ✅ BFF Contracts定義（`packages/contracts/src/bff/action-plan-gantt`）
- ✅ UI types/api SSoT re-export構成
- ✅ MockBffClient（全8メソッド実装）
- ✅ **DHTMLX Gantt（Trial版）統合**
  - `DhtmlxGanttWrapper.tsx` - React wrapper、EPMテーマ適用
  - インライン編集（タスク名、開始日、終了日）
  - イベントハンドリング（クリック、ダブルクリック）
- ✅ UIコンポーネント
  - `GanttChartPage.tsx` - メインページ（Quick Edit Panel統合）
  - `WbsQuickEditPanel.tsx` - **新規** フローティングパネル
  - `WbsTree.tsx` - WBSツリー（左ペイン）- フォールバック用
  - `WbsTreeRow.tsx` - WBSツリー行 - フォールバック用
  - `GanttTimeline.tsx` - タイムライン（右ペイン）- フォールバック用
  - `GanttHeader.tsx` - タイムラインヘッダー
  - `GanttBar.tsx` - ガントバー - フォールバック用
  - `GanttMilestone.tsx` - マイルストーン（菱形）
  - `GanttDependencyLine.tsx` - 依存線
  - `PeriodSelector.tsx` - 表示期間選択
  - `FilterPanel.tsx` - フィルタパネル
  - `WbsEditSheet.tsx` - WBS詳細編集シート
  - `DeleteConfirmDialog.tsx` - 削除確認ダイアログ

#### 未着手
- 🔲 HttpBffClient
- 🔲 BFF実装
- 🔲 Domain API実装
- 🔲 DB Migration
- 🔲 **DHTMLX Gantt有償版移行**（バードラッグ、依存線ドラッグ機能）

#### 要件トレーサビリティ（11要件）
| Req | 内容 | 状態 | 備考 |
|-----|------|:----:|------|
| 1 | ガントチャート表示 | ✅ | DHTMLX Gantt Trial統合済み |
| 2 | WBS階層管理 | ✅ | |
| 3 | WBS新規作成 | ✅ | |
| 4 | WBS編集 | ✅ | インライン編集＋Floating Panel |
| 5 | スケジュール編集（バー操作） | 🟡 | Trial版で基本動作可、有償版で完全対応 |
| 6 | 依存関係管理 | 🟡 | 依存線表示済み、ドラッグ作成は有償版 |
| 7 | 進捗率管理 | ✅ | Floating Panelでスライダー編集 |
| 8 | WBS削除 | ✅ | |
| 9 | カンバン遷移 | ✅ | |
| 10 | フィルタリング | ✅ | |
| 11 | 権限制御 | ✅ | |

**注**: DHTMLX Gantt Trial版を統合済み。バードラッグ操作（Req 5）と依存線ドラッグ作成（Req 6）の完全対応には有償版が必要。

---

### 4. action-plan-dashboard（KPI予実ダッシュボード）

**概要**: KPI予実データとアクションプラン進捗を統合表示するダッシュボード

#### 完成済み
- ✅ BFF Contracts定義（`packages/contracts/src/bff/action-plan-dashboard`）
- ✅ UI types/api SSoT re-export構成
- ✅ MockBffClient（全2メソッド実装）
- ✅ UIコンポーネント
  - `DashboardPage.tsx` - メインページ
  - `DashboardSummaryCards.tsx` - サマリーカード
  - `DashboardFilterPanel.tsx` - フィルタパネル
  - `KpiGroupList.tsx` - KPIグループリスト
  - `KpiGroupItem.tsx` - KPIグループ項目
  - `PlanSummaryCard.tsx` - プランサマリーカード
  - `KpiDetailPanel.tsx` - KPI詳細パネル
  - `DrilldownMenu.tsx` - ドリルダウンメニュー
  - `StatusBadge.tsx` - ステータスバッジ
  - `AlertIcon.tsx` - アラートアイコン

#### 未着手
- 🔲 HttpBffClient
- 🔲 BFF実装
- 🔲 Domain API実装
- 🔲 DB Migration

#### 要件トレーサビリティ（8要件）
| Req | 内容 | 状態 |
|-----|------|:----:|
| 1 | ダッシュボード表示 | ✅ |
| 2 | 進捗集計 | ✅ |
| 3 | フィルタリング | ✅ |
| 4 | KPI予実詳細 | ✅ |
| 5 | ドリルダウン（詳細画面遷移） | ✅ |
| 6 | アラートインジケーター | ✅ |
| 7 | データ更新 | ✅ |
| 8 | 権限制御 | ✅ |

---

## 技術仕様準拠状況

| 項目 | 仕様 | 実装状態 |
|------|------|:--------:|
| SSoT構成 | types/apiがcontracts re-export | ✅ |
| ページング | page/pageSize (1-based) | ✅ |
| 楽観的ロック | updatedAtフィールド | ✅ |
| Error Policy | Pass-through | ✅ |
| Naming Convention | DTO: camelCase | ✅ |
| D&D Library | @dnd-kit/core (Kanban) | ✅ |
| Per-Plan Status/Label | アクションプラン単位 | ✅ |

---

## ファイル構成

```
apps/web/src/features/kpi/
├── DEVELOPMENT_STATUS.md    # 本ファイル
├── action-plan-core/
│   ├── api/
│   │   ├── index.ts
│   │   ├── BffClient.ts      # re-export from contracts
│   │   ├── MockBffClient.ts  # ✅ 実装済み
│   │   └── HttpBffClient.ts  # 🔲 スタブ
│   ├── types/
│   │   └── index.ts          # re-export from contracts
│   ├── lib/
│   │   └── error-messages.ts
│   └── ui/
│       ├── index.ts
│       ├── ActionPlanListPage.tsx      # Split View対応
│       ├── ActionPlanSearchPanel.tsx
│       ├── ActionPlanTable.tsx         # コンパクト化、選択行ハイライト
│       ├── ActionPlanDetailSheet.tsx
│       ├── ActionPlanDetailPanel.tsx   # ✅ 新規 - Split View右パネル
│       ├── ActionPlanCreateDialog.tsx
│       ├── ActionPlanEditDialog.tsx
│       ├── DeleteConfirmDialog.tsx
│       ├── StatusBadge.tsx
│       └── PriorityBadge.tsx
├── action-plan-kanban/
│   ├── api/
│   │   ├── index.ts
│   │   ├── BffClient.ts
│   │   ├── MockBffClient.ts  # ✅ 26メソッド実装
│   │   └── HttpBffClient.ts
│   ├── types/
│   │   └── index.ts
│   ├── lib/
│   │   └── error-messages.ts
│   └── ui/
│       ├── index.ts
│       ├── KanbanBoardPage.tsx
│       ├── KanbanColumn.tsx
│       ├── TaskCard.tsx
│       ├── TaskDetailModal.tsx
│       ├── TaskCreateInput.tsx
│       ├── ChecklistSection.tsx
│       ├── CommentsSection.tsx
│       ├── LabelSelector.tsx
│       ├── AssigneeSelector.tsx
│       ├── StatusEditPopover.tsx
│       ├── LabelEditPopover.tsx
│       ├── FilterPanel.tsx
│       └── ColorPicker.tsx
├── action-plan-gantt/
│   ├── api/
│   │   ├── index.ts
│   │   ├── BffClient.ts
│   │   ├── MockBffClient.ts  # ✅ 8メソッド実装
│   │   └── HttpBffClient.ts
│   ├── types/
│   │   └── index.ts
│   ├── lib/
│   │   ├── error-messages.ts
│   │   └── gantt-data-converter.ts  # DHTMLX形式変換
│   └── ui/
│       ├── index.ts
│       ├── GanttChartPage.tsx       # Quick Edit Panel統合
│       ├── DhtmlxGanttWrapper.tsx   # インライン編集、イベント処理
│       ├── WbsQuickEditPanel.tsx    # ✅ 新規 - Floating Panel
│       ├── WbsTree.tsx
│       ├── WbsTreeRow.tsx
│       ├── GanttTimeline.tsx
│       ├── GanttHeader.tsx
│       ├── GanttBar.tsx
│       ├── GanttMilestone.tsx
│       ├── GanttDependencyLine.tsx
│       ├── PeriodSelector.tsx
│       ├── FilterPanel.tsx
│       ├── WbsEditSheet.tsx
│       └── DeleteConfirmDialog.tsx
└── action-plan-dashboard/
    ├── api/
    │   ├── index.ts
    │   ├── BffClient.ts
    │   ├── MockBffClient.ts  # ✅ 2メソッド実装
    │   └── HttpBffClient.ts
    ├── types/
    │   └── index.ts
    ├── lib/
    │   └── error-messages.ts
    └── ui/
        ├── index.ts
        ├── DashboardPage.tsx
        ├── DashboardSummaryCards.tsx
        ├── DashboardFilterPanel.tsx
        ├── KpiGroupList.tsx
        ├── KpiGroupItem.tsx
        ├── PlanSummaryCard.tsx
        ├── KpiDetailPanel.tsx
        ├── DrilldownMenu.tsx
        ├── StatusBadge.tsx
        └── AlertIcon.tsx
```

---

## 次のステップ（残作業）

### Phase 1: BFF/API実装
1. **Prisma Schema更新** - action_plans, wbs_items, action_plan_tasks等のモデル定義
2. **DB Migration実行**
3. **Domain API実装**（apps/api）
   - ActionPlanService, WbsService, TaskService等
   - ビジネスルール（楽観的ロック、重複チェック、論理削除連動）
4. **BFF実装**（apps/bff）
   - Controller, Service, Mapper
   - ページング変換（page→offset）、名前解決
5. **HttpBffClient実装** - 各Feature

### Phase 2: 商用ライブラリ導入
1. ガントチャートライブラリ選定（dhtmlxGantt / Bryntum Gantt / Syncfusion）
2. バードラッグ操作実装
3. 依存線ドラッグ操作実装

### Phase 2+: 追加機能
- リアルタイム同期（WebSocket）
- 添付ファイル
- アクティビティログ
- エクスポート機能（PDF/Excel）
- 進捗率自動計算（配下タスクから集計）

---

## UI改善履歴（2026-01-11）

### 背景・検討経緯

UI改善の検討は、以下の観点から行われました：

1. **編集UXの課題**: 従来のSheet（サイドパネル）ベースの編集は、画面全体がオーバーレイで覆われ、一覧との文脈が失われる
2. **モダンUIパターンの検討**: Notion、Figma、Linear等のモダンアプリケーションで採用されているパターンを参考に
3. **機能特性に応じた最適化**: ガントチャート（頻繁なマイクロ編集）とアクションプラン一覧（詳細確認重視）で異なるアプローチを採用

### 検討したUIパターン

| パターン | 特徴 | 採用判断 |
|---------|------|---------|
| Split View | 左右固定分割、文脈維持 | ✅ アクションプラン一覧に採用 |
| Floating Panel | クリック位置にポップアップ、素早い編集 | ✅ ガントチャートに採用 |
| Inline Editing | グリッドセル直接編集 | ✅ ガントチャートに採用 |
| Sheet（従来） | サイドからスライドイン | 詳細編集用に残す |
| Modal Dialog | 中央オーバーレイ | 新規作成・削除確認に継続使用 |

### 実装内容

#### 1. ガントチャート: インライン編集 + Floating Panel

**採用理由**: ガントチャートはWBSの日程や進捗を頻繁に微調整する用途が多い。グリッド上での直接編集と、ダブルクリックでの素早い詳細確認が適している。

**実装済みコンポーネント**:

| ファイル | 内容 |
|---------|------|
| `DhtmlxGanttWrapper.tsx` | インライン編集設定（タスク名、開始日、終了日）、ダブルクリックイベントでposition付与 |
| `WbsQuickEditPanel.tsx` | **新規作成** - フローティングパネル（クリック位置に表示） |
| `GanttChartPage.tsx` | Quick Edit Panel状態管理、保存処理統合 |
| `WbsEditSheet.tsx` | パディング調整（px-6追加） |

**技術詳細**:
- DHTMLX Ganttの`attachEvent`を使用してイベントハンドラを登録
- `onTaskDblClick`でマウス位置を取得し、Floating Panelの表示位置を決定
- 楽観的ロック対応のため、BFF APIを3分割（基本情報、スケジュール、進捗率）

**操作フロー**:
```
セル直接クリック → インライン編集（タスク名・日付）
ダブルクリック → Floating Panel表示
  └→ 「詳細編集」ボタン → WbsEditSheet（フル機能）
```

#### 2. アクションプラン一覧: 固定Split View

**採用理由**: アクションプラン一覧は詳細情報の確認が重要。一覧と詳細を同時に表示することで、複数プランの比較や素早い切り替えが可能。

**実装済みコンポーネント**:

| ファイル | 内容 |
|---------|------|
| `ActionPlanListPage.tsx` | Resizableから固定flexレイアウトに変更、右側380px固定 |
| `ActionPlanDetailPanel.tsx` | **新規作成** - 詳細表示パネル（常時表示） |
| `ActionPlanTable.tsx` | カラム最適化（7列にコンパクト化）、選択行ハイライト |

**レイアウト変更**:
```
【変更前】Resizable Split View
- ドラッグで幅調整可能
- パネル開閉トグルボタン

【変更後】Fixed Split View
- 左側: flex-1（残り幅を使用）
- 右側: 380px固定
- パネルは常時表示（選択なし時は「一覧から選択してください」表示）
```

**テーブルカラム最適化**:
```
【変更前】9列
プランコード | プラン名 | 紐付きKPI | 責任者 | 期限 | ステータス | 優先度 | 進捗率 | アクション

【変更後】7列（コンパクト化）
コード | プラン名 | 期限 | 状態 | 優先 | 進捗 | 操作
- 「紐付きKPI」「責任者」は詳細パネルで確認
- ラベル短縮、フォントサイズ縮小
```

### 完成状態

| 機能 | 状態 | 備考 |
|------|:----:|------|
| ガントチャート インライン編集 | ✅ | タスク名、開始日、終了日 |
| ガントチャート Floating Panel | ✅ | ダブルクリックで表示、進捗スライダー含む |
| ガントチャート 詳細編集Sheet連携 | ✅ | 「詳細編集」ボタンから遷移 |
| アクションプラン一覧 Fixed Split View | ✅ | 左:一覧、右:詳細 |
| アクションプラン一覧 選択行ハイライト | ✅ | bg-primary/10、左ボーダー |
| アクションプラン一覧 テーブルコンパクト化 | ✅ | 7列、フォント最適化 |
| パディング調整 | ✅ | 各パネルの左右余白追加 |

### 残作業

| 項目 | 優先度 | 備考 |
|------|:------:|------|
| ガントチャート バードラッグ操作 | 中 | DHTMLX Gantt有償版で対応予定 |
| ガントチャート 依存線ドラッグ操作 | 中 | DHTMLX Gantt有償版で対応予定 |
| キーボードショートカット | 低 | Escape閉じ済み、Enter保存等 |
| アニメーション微調整 | 低 | パネル開閉時のトランジション |

---

## 関連ドキュメント

- 仕様書: `.kiro/specs/kpi/action-plan-*/requirements.md`
- 設計書: `.kiro/specs/kpi/action-plan-*/design.md`
- Contracts: `packages/contracts/src/bff/action-plan-*`
- 仕様概要: `.kiro/specs/仕様概要/KPIアクションプラン管理.md`
