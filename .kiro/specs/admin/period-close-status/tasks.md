# Implementation Tasks: period-close-status 配賦拡張

## Overview

月次締処理状況管理機能に配賦処理連携を追加するための実装タスク。
Requirements 8-11（入力ロック、配賦イベント選択、配賦結果VIEW、入力ロック解除）を実装する。

---

## Phase 1: Contracts & DB Schema

### Task 1.1: BFF Contracts 拡張

**Requirements Coverage**: 8, 9, 10, 11

**Files to modify**:
- `packages/contracts/src/bff/period-close-status/index.ts`

**Changes**:
1. `BffPeriodCloseStatus` に `inputLocked`, `inputLockedAt`, `inputLockedBy`, `canUnlockInput`, `hasAllocationResult` フィールド追加
2. `BffAllocationEvent` 型追加（id, eventCode, eventName, scenarioType, executionOrder, stepCount, isActive）
3. `BffAllocationExecuteRequest` を `eventIds: string[]` 配列に変更
4. `BffAllocationExecuteResponse` に実行結果詳細を追加
5. `BffAllocationResultResponse` 型追加（階層構造のツリーデータ）
6. `BffAllocationTreeNode` 型追加（AG Grid Tree Data用）
7. `BffUnlockInputRequest` / `BffUnlockInputResponse` 型追加

**Acceptance Test**:
- [ ] TypeScript コンパイルが通ること
- [ ] 既存の型との後方互換性があること

---

### Task 1.2: API Contracts 追加

**Requirements Coverage**: 9, 10, 11

**Files to create**:
- `packages/contracts/src/api/period-close-allocation/index.ts`

**Changes**:
1. `ApiListAllocationEventsRequest` / `Response` 型定義
2. `ApiAllocationExecuteRequest` / `Response` 型定義
3. `ApiGetAllocationResultRequest` / `Response` 型定義
4. `ApiUnlockInputRequest` / `Response` 型定義

**Acceptance Test**:
- [ ] TypeScript コンパイルが通ること
- [ ] BFF Contracts と API Contracts の型が整合すること

---

## Phase 2: UI Implementation

### Task 2.1: PeriodCloseStatusList コンポーネント更新

**Requirements Coverage**: 8, 11

**Files to modify**:
- `apps/web/src/features/admin/period-close-status/ui/components/PeriodCloseStatusList.tsx`

**Changes**:
1. `inputLocked` バッジ表示追加（🔒 ロック中）
2. 「配賦結果」ボタン追加（input_locked=true かつ hasAllocationResult=true の場合）
3. 「入力ロック解除」ボタン追加（input_locked=true の場合）
4. STATUS_CONFIG にロック状態の表示設定追加

**Acceptance Test**:
- [ ] OPEN/unlocked 状態で配賦実行ボタンのみ表示
- [ ] OPEN/locked 状態でロックバッジ、配賦結果、入力ロック解除ボタン表示
- [ ] SOFT_CLOSED 状態で配賦結果ボタン表示

---

### Task 2.2: AllocationExecuteDialog コンポーネント作成

**Requirements Coverage**: 9

**Files to create**:
- `apps/web/src/features/admin/period-close-status/ui/components/AllocationExecuteDialog.tsx`

**Changes**:
1. 配賦イベント一覧取得・表示（チェックボックス付き）
2. execution_order 順でソート表示
3. 選択イベントの配賦実行
4. 警告メッセージ表示（前回結果削除、入力ロック）
5. 実行結果サマリ表示

**Acceptance Test**:
- [ ] イベント一覧が execution_order 順で表示される
- [ ] 複数イベント選択・実行ができる
- [ ] 実行後に配賦結果VIEW画面に遷移する

---

### Task 2.3: AllocationResultPage コンポーネント作成

**Requirements Coverage**: 10

**Files to create**:
- `apps/web/src/features/admin/period-close-status/ui/components/AllocationResultPage.tsx`
- `apps/web/src/features/admin/period-close-status/ui/components/AllocationResultGrid.tsx`

**Changes**:
1. AG Grid Enterprise Tree Data 設定
2. 階層表示（イベント → ステップ → 明細）
3. Excel 出力機能
4. CSV 出力機能
5. 戻るボタン（月次締め画面へ）

**Acceptance Test**:
- [ ] 配賦結果が階層構造で表示される
- [ ] 行を展開/折りたたみできる
- [ ] Excel 出力で階層構造が維持される
- [ ] CSV 出力でフラットデータがダウンロードできる

---

### Task 2.4: UnlockInputDialog コンポーネント作成

**Requirements Coverage**: 11

**Files to create**:
- `apps/web/src/features/admin/period-close-status/ui/components/UnlockInputDialog.tsx`

**Changes**:
1. 警告メッセージ表示（配賦結果削除の明示）
2. 確認ボタン
3. 成功時のトースト表示

**Acceptance Test**:
- [ ] 警告メッセージが表示される
- [ ] 実行後に配賦結果が削除される
- [ ] input_locked が false になる

---

### Task 2.5: page.tsx 更新

**Requirements Coverage**: 8, 9, 10, 11

**Files to modify**:
- `apps/web/src/features/admin/period-close-status/ui/page.tsx`

**Changes**:
1. AllocationExecuteDialog の状態管理追加
2. AllocationResultPage への遷移ロジック追加
3. UnlockInputDialog の状態管理追加
4. onAllocationResult, onUnlockInput コールバック追加

**Acceptance Test**:
- [ ] 配賦実行ダイアログが開閉できる
- [ ] 配賦結果画面に遷移できる
- [ ] 入力ロック解除ダイアログが開閉できる

---

## Phase 3: BFF Client Implementation

### Task 3.1: BffClient インターフェース更新

**Requirements Coverage**: 9, 10, 11

**Files to modify**:
- `apps/web/src/features/admin/period-close-status/ui/api/BffClient.ts`

**Changes**:
1. `listAllocationEvents(companyId, scenarioType?)` メソッド追加
2. `executeAllocation(req)` メソッド更新（eventIds 配列対応）
3. `getAllocationResult(companyId, accountingPeriodId)` メソッド追加
4. `unlockInput(accountingPeriodId)` メソッド追加

**Acceptance Test**:
- [ ] インターフェース定義が Contracts と一致すること

---

### Task 3.2: MockBffClient 更新

**Requirements Coverage**: 9, 10, 11

**Files to modify**:
- `apps/web/src/features/admin/period-close-status/ui/api/MockBffClient.ts`

**Changes**:
1. `listAllocationEvents` モック実装
2. `executeAllocation` モック実装（eventIds 対応）
3. `getAllocationResult` モック実装（階層データ）
4. `unlockInput` モック実装
5. モック期間データに inputLocked フィールド追加

**Acceptance Test**:
- [ ] モックデータで UI 動作確認ができること

---

## Phase 4: BFF Implementation

### Task 4.1: BFF Controller 更新

**Requirements Coverage**: 9, 10, 11

**Files to modify**:
- `apps/bff/src/modules/admin/period-close-status/period-close-status.controller.ts`

**Changes**:
1. `GET /events` エンドポイント追加（配賦イベント一覧）
2. `POST /execute-allocation` エンドポイント更新
3. `GET /allocation-result` エンドポイント追加
4. `POST /unlock-input` エンドポイント追加

**Acceptance Test**:
- [ ] エンドポイントが正しくルーティングされること

---

### Task 4.2: BFF Service 更新

**Requirements Coverage**: 8, 9, 10, 11

**Files to modify**:
- `apps/bff/src/modules/admin/period-close-status/period-close-status.service.ts`

**Changes**:
1. `listAllocationEvents` メソッド追加
2. `executeAllocation` メソッド更新
3. `getAllocationResult` メソッド追加
4. `unlockInput` メソッド追加
5. `listPeriodCloseStatus` を更新して inputLocked 情報を含める

**Acceptance Test**:
- [ ] Domain API との通信が正しく行われること

---

### Task 4.3: AllocationResultMapper 作成

**Requirements Coverage**: 10

**Files to create**:
- `apps/bff/src/modules/admin/period-close-status/mappers/allocation-result.mapper.ts`

**Changes**:
1. API レスポンスから BFF レスポンスへの変換
2. 階層構造（ツリーデータ）への変換ロジック
3. orgHierarchy パス生成

**Acceptance Test**:
- [ ] フラットな API データが階層構造に変換されること

---

## Phase 5: Domain API Implementation（別タスク）

> Note: Domain API の実装は別の tasks.md で管理。
> 本タスクでは BFF までを MockBffClient で動作確認可能な状態にする。

---

## Dependencies

```
Task 1.1 (Contracts)
    ↓
Task 1.2 (API Contracts)
    ↓
Task 2.1-2.5 (UI Components) ← 並列実行可能
    ↓
Task 3.1-3.2 (BFF Client) ← UI と並列実行可能
    ↓
Task 4.1-4.3 (BFF Implementation)
```

---

## Completion Criteria

- [ ] 全タスクの Acceptance Test がパス
- [ ] TypeScript コンパイルエラーなし
- [ ] 既存機能（仮締め/本締め/差し戻し）が壊れていないこと
- [ ] MockBffClient で UI 動作確認完了
