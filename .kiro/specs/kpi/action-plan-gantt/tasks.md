# Implementation Tasks

## Feature: kpi/action-plan-gantt

---

## Overview

本タスクリストは、アクションプランのWBS/ガントチャート機能をSyncfusion Ganttコンポーネントで実装するためのタスクを定義する。

**実装方針**:
- Phase 1: UI先行（MockBffClient）
- ライブラリ: Syncfusion EJ2 Gantt（Kanbanと統一）
- 即時保存方式

---

## Chapter 1: UI実装（Phase 1優先）

### Task 1.1: Syncfusion Ganttパッケージ追加
- [ ] `@syncfusion/ej2-gantt` パッケージ追加
- [ ] `@syncfusion/ej2-react-gantt` パッケージ追加
- [ ] Syncfusion Gantt CSSインポート設定

### Task 1.2: 型定義・BffClient Interface
- [ ] `apps/web/src/features/kpi/action-plan-gantt/lib/types.ts` 作成
  - BffGanttData, BffGanttWbs, BffGanttLink
  - Request DTOs
  - Syncfusion Gantt用データ変換関数
- [ ] `apps/web/src/features/kpi/action-plan-gantt/api/BffClient.ts` 作成
  - design.md準拠のインターフェース定義

### Task 1.3: MockBffClient実装
- [ ] `apps/web/src/features/kpi/action-plan-gantt/api/MockBffClient.ts` 作成
  - モックWBSデータ（階層構造）
  - モック依存関係データ
  - CRUD操作のモック実装
- [ ] `apps/web/src/features/kpi/action-plan-gantt/api/client.ts` 作成
  - Factory関数

### Task 1.4: ガントチャートUI実装
- [ ] `apps/web/src/features/kpi/action-plan-gantt/styles/syncfusion-gantt.ts` 作成
- [ ] `apps/web/src/features/kpi/action-plan-gantt/components/gantt-chart.tsx` 作成
  - Syncfusion GanttComponent使用
  - WBSツリー表示（左側）
  - タイムラインバー表示（右側）
  - 進捗率のバー内表示
  - マイルストーン表示（菱形）
  - 依存関係線表示
  - 表示期間切り替え（月/四半期/年）
  - Req 1.1-1.6 対応

### Task 1.5: バー操作機能実装
- [ ] ドラッグによるスケジュール変更
- [ ] バー端ドラッグによる期間変更
- [ ] 即時保存処理
- [ ] Req 5.1-5.3 対応

### Task 1.6: 依存関係操作実装
- [ ] 依存線のドラッグ作成
- [ ] 依存関係の解除
- [ ] Req 6.1-6.3 対応

### Task 1.7: WBS作成ダイアログ実装
- [ ] `apps/web/src/features/kpi/action-plan-gantt/components/create-wbs-dialog.tsx` 作成
  - WBSコード（自動採番対応）
  - WBS名
  - 説明
  - 担当部門/担当者
  - 開始日/終了日
  - マイルストーンフラグ
  - Req 3.1-3.4 対応

### Task 1.8: WBS編集ダイアログ実装
- [ ] `apps/web/src/features/kpi/action-plan-gantt/components/edit-wbs-dialog.tsx` 作成
  - 全項目編集
  - 進捗率編集
  - 削除ボタン
  - Req 4.1-4.4, 7.1-7.2, 8.1-8.3 対応

### Task 1.9: フィルタリング機能実装
- [ ] 担当部門フィルタ
- [ ] マイルストーンのみ表示
- [ ] Req 10.1-10.2 対応

### Task 1.10: カンバン遷移機能
- [ ] WBS行からカンバンへのリンク
- [ ] WBS絞り込みパラメータ付き遷移
- [ ] Req 9.1-9.2 対応

### Task 1.11: コンポーネントIndex作成
- [ ] `apps/web/src/features/kpi/action-plan-gantt/components/index.ts` 作成

### Task 1.12: ページ・ルーティング設定
- [ ] `apps/web/src/features/kpi/action-plan-gantt/pages/gantt-page.tsx` 作成
- [ ] `apps/web/src/app/kpi/gantt/[planId]/page.tsx` 作成

### Task 1.13: 動作確認
- [ ] TypeScriptコンパイルエラーなし
- [ ] `/kpi/gantt/{planId}` でアクセス可能
- [ ] ガントチャート表示確認
- [ ] WBS作成/編集/削除確認
- [ ] バー操作確認
- [ ] 依存関係操作確認

---

## Chapter 2: Contracts（Phase 2）

### Task 2.1: BFF DTOs定義
- [ ] `packages/contracts/src/bff/action-plan-gantt/index.ts` 作成

### Task 2.2: Error Codes定義
- [ ] `packages/contracts/src/shared/errors/ActionPlanGanttError.ts` 作成

---

## Chapter 3: Backend（Phase 2）

### Task 3.1: Domain API実装
- [ ] WbsController
- [ ] WbsService
- [ ] WbsRepository

### Task 3.2: BFF実装
- [ ] GanttBffController
- [ ] GanttBffService

### Task 3.3: HttpBffClient実装
- [ ] `apps/web/src/features/kpi/action-plan-gantt/api/HttpBffClient.ts` 作成
- [ ] MockBffClient → HttpBffClient 切替

---

## Dependencies

- action-plan-core: アクションプランCRUD
- action-plan-kanban: カンバンへの遷移

---

## 変更履歴

| 日付 | 変更内容 | 担当 |
|------|---------|------|
| 2026-01-27 | 初版作成 - Syncfusion Gantt採用 | Claude Code |
