# Implementation Tasks

## Feature: master-data/kpi-definitions

---

## Chapter 1: BFF Contracts

### Task 1.1: Create BFF Contracts

**File**: `packages/contracts/src/bff/kpi-definitions/index.ts`

**Description**: BFF契約（DTO、Enum、ErrorCode）を定義する

**Implementation Details**:
1. Enumsを定義
   - `AggregationMethod`: SUM, EOP, AVG, MAX, MIN
   - `Direction`: higher_is_better, lower_is_better
2. Request DTOsを定義
   - `BffListKpiDefinitionsRequest`
   - `BffCreateKpiDefinitionRequest`
   - `BffUpdateKpiDefinitionRequest`
3. Response DTOsを定義
   - `BffKpiDefinitionSummary`
   - `BffListKpiDefinitionsResponse`
   - `BffKpiDefinitionDetailResponse`
4. Error Codesを定義
   - `KpiDefinitionsErrorCode`
   - `KpiDefinitionsError`

**Acceptance Criteria**:
- [ ] design.md のContracts Summaryと完全一致
- [ ] TypeScriptの型定義が正しい
- [ ] exportが正しく設定されている

---

## Chapter 2: UI Feature Structure

### Task 2.1: Create Feature Directory Structure

**Description**: UI Feature のディレクトリ構造を作成する

**Directories**:
```
apps/web/src/features/master-data/kpi-definitions/
├── api/
│   ├── BffClient.ts
│   ├── MockBffClient.ts
│   ├── HttpBffClient.ts
│   └── client.ts
├── components/
│   ├── KpiDefinitionsListPage.tsx
│   └── KpiDefinitionDetailDialog.tsx
└── page.tsx
```

**Acceptance Criteria**:
- [ ] ディレクトリ構造がmetrics-masterと同一パターン
- [ ] 必要なファイルがすべて作成されている

---

### Task 2.2: Create BffClient Interface

**File**: `apps/web/src/features/master-data/kpi-definitions/api/BffClient.ts`

**Description**: BffClient interfaceを定義する

**Methods**:
- `listKpiDefinitions(request): Promise<BffListKpiDefinitionsResponse>`
- `getKpiDefinition(id): Promise<BffKpiDefinitionDetailResponse>`
- `createKpiDefinition(request): Promise<BffKpiDefinitionDetailResponse>`
- `updateKpiDefinition(id, request): Promise<BffKpiDefinitionDetailResponse>`
- `deactivateKpiDefinition(id): Promise<BffKpiDefinitionDetailResponse>`
- `reactivateKpiDefinition(id): Promise<BffKpiDefinitionDetailResponse>`

**Acceptance Criteria**:
- [ ] design.md のBFF Endpointsと対応
- [ ] BFF Contractsの型を使用
- [ ] メソッド名がエンドポイントと対応

---

### Task 2.3: Create MockBffClient

**File**: `apps/web/src/features/master-data/kpi-definitions/api/MockBffClient.ts`

**Description**: MockBffClientを実装する（サンプルデータ含む）

**Sample Data（5件）**:
1. CO2-001: CO2排出量削減率（%, AVG, lower_is_better）
2. CSAT-001: 顧客満足度スコア（pt, AVG, higher_is_better）
3. EMP-001: 従業員エンゲージメントスコア（pt, AVG, higher_is_better）
4. SAFETY-001: 労働災害発生件数（件, SUM, lower_is_better）
5. TRAIN-001: 研修受講率（%, EOP, higher_is_better）

**Implementation Details**:
- in-memoryでCRUD操作を模倣
- 遅延シミュレーション（100ms）
- エラーシミュレーション（重複チェック等）
- ページング・ソート・フィルタリング対応

**Acceptance Criteria**:
- [ ] BffClient interfaceを実装
- [ ] サンプルデータが現実的
- [ ] CRUD操作が正しく動作
- [ ] エラーケースをシミュレート

---

### Task 2.4: Create HttpBffClient (Stub)

**File**: `apps/web/src/features/master-data/kpi-definitions/api/HttpBffClient.ts`

**Description**: HttpBffClientのスタブを作成する

**Implementation Details**:
- Phase 1ではスタブのみ（実装は将来）
- メソッドはNotImplementedErrorをthrow
- 将来のBFF実装時に置き換え

**Acceptance Criteria**:
- [ ] BffClient interfaceを実装
- [ ] 全メソッドがNotImplementedErrorをthrow

---

### Task 2.5: Create Client Export

**File**: `apps/web/src/features/master-data/kpi-definitions/api/client.ts`

**Description**: BffClientのシングルトンexportを作成する

**Implementation Details**:
- 環境変数でMock/Httpを切り替え
- デフォルトはMockBffClient

**Acceptance Criteria**:
- [ ] `bffClient`をexport
- [ ] MockBffClientがデフォルト

---

## Chapter 3: UI Components

### Task 3.1: Create KpiDefinitionsListPage

**File**: `apps/web/src/features/master-data/kpi-definitions/components/KpiDefinitionsListPage.tsx`

**Description**: KPI定義一覧ページを実装する

**UI Elements**:
- ヘッダー（タイトル、新規登録ボタン、更新ボタン）
- 検索フィルタ（キーワード、集計方法、有効/無効）
- テーブル（KPIコード、KPI名、単位、集計方法、方向性、状態、操作）
- ページネーション

**State Management**:
- `kpiDefinitions: BffKpiDefinitionSummary[]`
- `totalCount: number`
- `loading: boolean`
- `searchRequest: BffListKpiDefinitionsRequest`
- `dialogOpen: boolean`
- `selectedKpiDefinition: BffKpiDefinitionSummary | null`
- `dialogMode: 'create' | 'edit'`

**Event Handlers**:
- `handleSearch()`: 検索実行
- `handlePageChange(page)`: ページ変更
- `handleSort(sortBy, sortOrder)`: ソート変更
- `handleOpenCreateDialog()`: 新規登録ダイアログ
- `handleOpenEditDialog(item)`: 編集ダイアログ
- `handleDeactivate(id)`: 無効化
- `handleReactivate(id)`: 再有効化

**Reference**: `metrics-master/components/MetricsListPage.tsx`

**Acceptance Criteria**:
- [ ] design.md のUI Designと一致
- [ ] metrics-masterと同一パターン
- [ ] 全機能が動作

---

### Task 3.2: Create KpiDefinitionDetailDialog

**File**: `apps/web/src/features/master-data/kpi-definitions/components/KpiDefinitionDetailDialog.tsx`

**Description**: KPI定義詳細/編集ダイアログを実装する

**Props**:
- `open: boolean`
- `onOpenChange: (open: boolean) => void`
- `mode: 'create' | 'edit'`
- `kpiDefinition: BffKpiDefinitionSummary | null`
- `onSave: () => void`

**Form Fields**:
- KPIコード（テキスト、必須）
- KPI名（テキスト、必須）
- 説明（テキストエリア）
- 単位（テキスト）
- 集計方法（セレクト、必須）
- 方向性（セレクト）

**Validation**:
- KPIコード: 必須、最大50文字
- KPI名: 必須、最大200文字
- 説明: 最大1000文字
- 単位: 最大30文字
- 集計方法: 必須

**Reference**: `metrics-master/components/MetricDetailDialog.tsx`（存在する場合）

**Acceptance Criteria**:
- [ ] design.md のフォームフィールドと一致
- [ ] バリデーションが正しく動作
- [ ] 新規登録/編集モードが切り替わる

---

### Task 3.3: Create Feature Page Export

**File**: `apps/web/src/features/master-data/kpi-definitions/page.tsx`

**Description**: Featureのpage.tsxを作成する

**Implementation**:
```tsx
export { default } from './components/KpiDefinitionsListPage'
```

**Acceptance Criteria**:
- [ ] KpiDefinitionsListPageをdefault export

---

## Chapter 4: Routing & Navigation

### Task 4.1: Create App Route

**File**: `apps/web/src/app/master-data/kpi-definitions/page.tsx`

**Description**: App Routerのページを作成する

**Implementation**:
```tsx
import KpiDefinitionsPage from '@/features/master-data/kpi-definitions/page'
export default function Page() {
  return <KpiDefinitionsPage />
}
```

**Acceptance Criteria**:
- [ ] `/master-data/kpi-definitions` でアクセス可能
- [ ] Featureページが表示される

---

### Task 4.2: Add Navigation Menu Item

**File**: `apps/web/src/shared/navigation/menu.ts`

**Description**: ナビゲーションメニューにKPI定義マスタを追加する

**Implementation**:
- マスタデータカテゴリにKPI定義を追加
- icon: `Target` または適切なアイコン
- path: `/master-data/kpi-definitions`

**Acceptance Criteria**:
- [ ] サイドメニューにKPI定義マスタが表示される
- [ ] クリックで一覧ページに遷移

---

## Chapter 5: Verification

### Task 5.1: Manual Testing

**Description**: ブラウザで動作確認を行う

**Test Cases**:
1. 一覧表示
   - [ ] サンプルデータが表示される
   - [ ] ページネーションが動作する
2. 検索・フィルタ
   - [ ] キーワード検索が動作する
   - [ ] 集計方法フィルタが動作する
   - [ ] 有効/無効フィルタが動作する
3. ソート
   - [ ] KPIコードでソートできる
   - [ ] KPI名でソートできる
   - [ ] 集計方法でソートできる
4. 新規登録
   - [ ] ダイアログが開く
   - [ ] フォームが入力できる
   - [ ] 保存が成功する
   - [ ] 一覧に追加される
5. 編集
   - [ ] ダイアログが開く
   - [ ] 既存データが表示される
   - [ ] 更新が成功する
   - [ ] 一覧が更新される
6. 無効化/再有効化
   - [ ] 無効化が成功する
   - [ ] 再有効化が成功する

**Acceptance Criteria**:
- [ ] 全テストケースがパス

---

## Summary

| Chapter | Tasks | Priority |
|---------|-------|----------|
| 1. BFF Contracts | 1 | High |
| 2. UI Feature Structure | 5 | High |
| 3. UI Components | 3 | High |
| 4. Routing & Navigation | 2 | High |
| 5. Verification | 1 | High |
| **Total** | **12** | |

---

## Implementation Order

1. Task 1.1: BFF Contracts
2. Task 2.1: Directory Structure
3. Task 2.2: BffClient Interface
4. Task 2.3: MockBffClient
5. Task 2.4: HttpBffClient (Stub)
6. Task 2.5: Client Export
7. Task 3.1: KpiDefinitionsListPage
8. Task 3.2: KpiDefinitionDetailDialog
9. Task 3.3: Feature Page Export
10. Task 4.1: App Route
11. Task 4.2: Navigation Menu
12. Task 5.1: Manual Testing
