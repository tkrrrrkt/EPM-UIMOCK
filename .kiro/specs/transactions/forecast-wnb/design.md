# Design Document: 見込シナリオ機能（W/N/B）

---

**Purpose**: 見込シナリオ機能（W/N/B）の技術設計。実装済みコードからのリバースエンジニアリングにより作成。

---

## Spec Reference（INPUT情報）

本設計を作成するにあたり、以下の情報を確認した：

### Requirements（直接INPUT）
- **参照ファイル**: `.kiro/specs/transactions/forecast-wnb/requirements.md`
- **要件バージョン**: 2026-01-12

### 仕様概要（確定済み仕様）
- **参照ファイル**: `.kiro/specs/仕様概要/見込シナリオ機能.md`
- **設計に影響する仕様ポイント**:
  - W/N/Bは科目の「合計」に対して入力
  - ノーマル = グリッドの値と連動

### 実装ソース（リバース参照）
- **BFF Contracts**: `packages/contracts/src/bff/forecast-wnb/index.ts`
- **W/N/Bダイアログ**: `apps/web/src/features/transactions/forecast-entry/dialogs/wnb-input-dialog.tsx`
- **イベント作成**: `apps/web/src/features/transactions/forecast-entry/dialogs/create-event-dialog.tsx`

---

## INPUT整合性チェック

| チェック項目 | 確認結果 |
|-------------|---------|
| requirements.md との整合性 | 設計が全要件をカバーしている: ✅ |
| 仕様概要との整合性 | 設計が仕様概要と矛盾しない: ✅ |
| 実装との整合性 | 設計が実装済みコードと整合する: ✅ |

---

## Overview

見込シナリオ機能（W/N/B）は、見込入力においてワースト/ノーマル/ベストの3シナリオを管理する機能である。

主要コンポーネント：
1. **レイアウト設定拡張**: 科目ごとのW/N/B対象ON/OFF設定
2. **イベント設定拡張**: W/N/B開始月の設定
3. **W/N/B入力ダイアログ**: シナリオ一括入力UI
4. **グリッド統合**: 📊アイコン表示とダイアログ連携

---

## Architecture

### Architecture Pattern & Boundary Map

**Pattern (fixed)**:
- UI（apps/web） → BFF（apps/bff） → Domain API（apps/api） → DB（PostgreSQL + RLS）
- UI直APIは禁止

**Contracts (SSoT)**:
- UI ↔ BFF: `packages/contracts/src/bff/forecast-wnb`
- BFF ↔ Domain API: `packages/contracts/src/api` （未実装、Phase 2）
- UI は `packages/contracts/src/api` を参照してはならない

---

## Architecture Responsibilities（Mandatory）

### BFF Specification（apps/bff）

**Purpose**
- W/N/Bダイアログデータの取得
- W/N/B値の保存
- グリッド連動（ノーマル値の同期）

**BFF Endpoints（UIが叩く）**

| Method | Endpoint | Purpose | Request DTO | Response DTO |
| ------ | -------- | ------- | ----------- | ------------ |
| GET | /api/bff/forecast-wnb/dialog | W/N/Bダイアログデータ取得 | BffWnbDialogRequest | BffWnbDialogResponse |
| POST | /api/bff/forecast-wnb | W/N/B保存 | BffWnbSaveRequest | BffWnbSaveResponse |

**Naming Convention（必須）**
- DTO / Contracts: camelCase（例: `periodNo`, `scenarioCase`）
- DB columns: snake_case（例: `period_no`, `scenario_case`）

**Error Handling**

```typescript
export const WnbErrorCode = {
  SUBJECT_NOT_WNB_ENABLED: "SUBJECT_NOT_WNB_ENABLED",
  PERIOD_BEFORE_WNB_START: "PERIOD_BEFORE_WNB_START",
  PERIOD_IS_CLOSED: "PERIOD_IS_CLOSED",
  INVALID_AMOUNT: "INVALID_AMOUNT",
  VERSION_IS_FIXED: "VERSION_IS_FIXED",
  NOT_FOUND: "WNB_NOT_FOUND",
  VALIDATION_ERROR: "WNB_VALIDATION_ERROR",
} as const
```

**Error Policy**: Option A: Pass-through
- Domain APIのエラーを原則そのまま返す

---

### UI Specification（apps/web）

#### W/N/B入力ダイアログ

**ファイル**: `apps/web/src/features/transactions/forecast-entry/dialogs/wnb-input-dialog.tsx`

**コンポーネント構成**:
```typescript
interface WnbInputDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: BffWnbDialogResponse | null
  onSave: (values: BffWnbValue[]) => Promise<{ success: boolean; error?: string }>
}
```

**UI構造**:
```
┌─────────────────────────────────────────────────────────────┐
│ {科目名} - シナリオ入力                              [×]     │
├─────────────────────────────────────────────────────────────┤
│  エラーメッセージ（ある場合）                               │
├─────────────────────────────────────────────────────────────┤
│ Table                                                       │
│  Header: シナリオ | 期間1 | 期間2 | ... | 通期              │
│  Row1: ●ワースト | [入力] | [入力] | ... | 自動計算         │
│  Row2: ●ノーマル | [入力] | [入力] | ... | 自動計算         │
│  Row3: ●ベスト   | [入力] | [入力] | ... | 自動計算         │
│  Row4: 予算（参考）| 表示 | 表示  | ... | 表示              │
├─────────────────────────────────────────────────────────────┤
│  ※ 注釈テキスト                                            │
├─────────────────────────────────────────────────────────────┤
│                              [キャンセル] [保存]            │
└─────────────────────────────────────────────────────────────┘
```

**状態管理**:
```typescript
interface EditableValues {
  [periodNo: number]: {
    worst: string
    normal: string
    best: string
  }
}

const [editableValues, setEditableValues] = useState<EditableValues>({})
const [saving, setSaving] = useState(false)
const [error, setError] = useState<string | null>(null)
```

**通期計算ロジック**:
```typescript
const calculateAnnual = (field: "worst" | "normal" | "best"): string => {
  let sum = 0
  data.periods.forEach((period) => {
    if (period.isWnbEnabled) {
      const edited = editableValues[period.periodNo]
      const value = edited?.[field] || (field === "normal" ? period.normal : null)
      if (value) {
        sum += parseFloat(value) || 0
      }
    } else {
      // W/N/B対象外の月はノーマル値を使用
      sum += parseFloat(period.normal) || 0
    }
  })
  return sum.toLocaleString("ja-JP")
}
```

#### イベント作成ダイアログ拡張

**ファイル**: `apps/web/src/features/transactions/forecast-entry/dialogs/create-event-dialog.tsx`

**追加状態**:
```typescript
const [wnbEnabled, setWnbEnabled] = useState(false)
const [wnbStartPeriodNo, setWnbStartPeriodNo] = useState<string>("")
```

**W/N/B開始月選択肢**:
```typescript
const wnbMonths = [
  { value: "4", label: "4月" },
  { value: "5", label: "5月" },
  // ... 12月まで
  { value: "1", label: "1月" },
  { value: "2", label: "2月" },
  { value: "3", label: "3月" },
]
```

#### グリッドへの📊アイコン統合

**ファイル**: `apps/web/src/features/transactions/forecast-entry/ui/ForecastGridWithConfidence.tsx`

**表示条件**:
- `row.isWnbEnabled === true`
- `period.isWnbPeriod === true`（開始月以降）
- 確度展開時は「合計」行のセルに表示

**アイコンクリック処理**:
```typescript
const handleWnbIconClick = (row: BffGridRowWithConfidence, periodId: string) => {
  // W/N/Bダイアログを開く
  setWnbDialogData({
    subjectId: row.subjectId,
    subjectName: row.subjectName,
    // ...
  })
  setWnbDialogOpen(true)
}
```

---

### Contracts Summary（This Feature）

#### Enum

```typescript
export const ScenarioCase = {
  WORST: "WORST",
  NORMAL: "NORMAL",
  BEST: "BEST",
} as const
export type ScenarioCase = (typeof ScenarioCase)[keyof typeof ScenarioCase]
```

#### 主要DTO

```typescript
// ダイアログリクエスト
export interface BffWnbDialogRequest {
  forecastEventId: string
  forecastVersionId: string
  departmentId: string
  subjectId: string
  projectId?: string
}

// ダイアログレスポンス
export interface BffWnbDialogResponse {
  subjectId: string
  subjectCode: string
  subjectName: string
  wnbStartPeriodNo: number
  periods: BffWnbPeriod[]
  annualSummary: BffWnbAnnualSummary
}

// 期間別データ
export interface BffWnbPeriod {
  periodId: string
  periodNo: number
  periodLabel: string
  isWnbEnabled: boolean
  isEditable: boolean
  worst: string | null
  normal: string
  best: string | null
  budget: string
}

// 保存リクエスト
export interface BffWnbSaveRequest {
  forecastEventId: string
  forecastVersionId: string
  departmentId: string
  subjectId: string
  projectId?: string
  values: BffWnbValue[]
}

// 保存値
export interface BffWnbValue {
  periodNo: number
  worst: string | null
  normal: string
  best: string | null
}
```

---

## Responsibility Clarification（Mandatory）

### UIの責務
- W/N/B入力ダイアログの表示・編集
- 📊アイコンの表示制御
- 通期の合計計算（表示用）
- 入力値のローカル状態管理

### BFFの責務
- W/N/Bダイアログデータの組み立て
- W/N/B保存時のグリッド連動処理
- Domain API DTOからUI DTO への変換

### Domain APIの責務（未実装）
- W/N/B値のビジネスルール検証
- scenario_caseの整合性保証
- グリッド（ノーマル）との連動更新
- 監査ログ記録

---

## Data Model

### Extension: fact_amounts

```sql
-- scenario_caseカラムを追加
ALTER TABLE fact_amounts ADD COLUMN scenario_case varchar(20);
-- NULL: 通常（ノーマル）, 'WORST', 'BEST'

-- 一意制約の更新（scenario_caseを含める）
-- 既存: (tenant_id, company_id, accounting_period_id, subject_id, ...)
-- 新規: (tenant_id, company_id, accounting_period_id, subject_id, ..., scenario_case)
```

### Extension: report_layout_items

```sql
ALTER TABLE report_layout_items ADD COLUMN wnb_enabled boolean DEFAULT false;
```

### Extension: plan_events

```sql
ALTER TABLE plan_events ADD COLUMN wnb_start_period_no smallint;
-- NULL: W/N/B機能を使用しない
-- 1-12: W/N/B入力開始月（period_no）
```

---

## UI/UX Design Decisions

### W/N/Bダイアログの保存方式

**選択**: 手動保存（保存ボタン）
**理由**:
- 複数期間の入力を一括で行うため、途中状態での保存は不適切
- グリッドの自動保存（debounce）と区別するため
- ユーザーの明示的な確定アクションを要求

### 確度管理との関係

**設計判断**: W/N/Bは「合計」に対して適用
**理由**:
- 確度管理 = 案件の確実性（詳細レベル）
- W/N/B = 経営向けの幅（集約レベル）
- 両者は異なる目的のため、組み合わせ爆発を回避
- 確度別×W/N/Bの9パターン入力は現実的でない

### アイコン表示位置

**設計**: セル値の右側
**理由**:
- セルクリック（編集開始）と区別するため
- 視覚的に見込値とシナリオの関係を示す

---

## Requirements Traceability

| 要件ID | 設計セクション |
|--------|--------------|
| 1.1-1.5 | Data Model > Extension: report_layout_items |
| 2.1-2.5 | Data Model > Extension: plan_events, UI Specification > イベント作成 |
| 3.1-3.4 | UI Specification > グリッドへのアイコン統合 |
| 4.1-4.7 | UI Specification > W/N/B入力ダイアログ |
| 5.1-5.4 | UI Specification > 通期計算ロジック |
| 6.1-6.4 | Data Model > Extension: fact_amounts |

---

## 変更履歴

| 日付 | 変更内容 | 担当 |
|------|---------|------|
| 2026-01-12 | リバースエンジニアリングにより初版作成 | Claude Code |
