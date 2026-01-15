# Design Document: 確度管理機能

---

**Purpose**: 確度管理機能の技術設計。実装済みコードからのリバースエンジニアリングにより作成。

---

## Spec Reference（INPUT情報）

本設計を作成するにあたり、以下の情報を確認した：

### Requirements（直接INPUT）
- **参照ファイル**: `.kiro/specs/transactions/confidence-management/requirements.md`
- **要件バージョン**: 2026-01-12

### 仕様概要（確定済み仕様）
- **参照ファイル**: `.kiro/specs/仕様概要/確度管理機能.md`
- **設計に影響する仕様ポイント**:
  - 確度ランク（S/A/B/C/D/Z）別に金額を入力
  - 期待値 = Σ(確度×金額) を自動計算

### 実装ソース（リバース参照）
- **BFF Contracts**: `packages/contracts/src/bff/confidence-master/index.ts`
- **UI Components**: `apps/web/src/features/master-data/confidence-master/`
- **グリッド統合**: `apps/web/src/features/transactions/forecast-entry/ui/ForecastGridWithConfidence.tsx`

---

## INPUT整合性チェック

| チェック項目 | 確認結果 |
|-------------|---------|
| requirements.md との整合性 | 設計が全要件をカバーしている: ✅ |
| 仕様概要との整合性 | 設計が仕様概要と矛盾しない: ✅ |
| 実装との整合性 | 設計が実装済みコードと整合する: ✅ |

---

## Overview

確度管理機能は、見込入力において売上等の特定科目に確度ランク別の金額入力を可能にする機能である。

主要コンポーネント：
1. **確度マスタ管理**: 会社ごとの確度ランク（S/A/B/C/D/Z）の定義・編集
2. **レイアウト設定拡張**: 科目ごとの確度管理ON/OFF設定
3. **見込グリッド統合**: 確度別行の展開表示と期待値自動計算

---

## Architecture

### Architecture Pattern & Boundary Map

**Pattern (fixed)**:
- UI（apps/web） → BFF（apps/bff） → Domain API（apps/api） → DB（PostgreSQL + RLS）
- UI直APIは禁止

**Contracts (SSoT)**:
- UI ↔ BFF: `packages/contracts/src/bff/confidence-master`
- BFF ↔ Domain API: `packages/contracts/src/api` （未実装、Phase 2）
- UI は `packages/contracts/src/api` を参照してはならない

---

## Architecture Responsibilities（Mandatory）

### BFF Specification（apps/bff）

**Purpose**
- 確度マスタのCRUD操作
- 確度別金額の取得・更新
- 期待値計算のサポート

**BFF Endpoints（UIが叩く）**

| Method | Endpoint | Purpose | Request DTO | Response DTO |
| ------ | -------- | ------- | ----------- | ------------ |
| GET | /api/bff/confidence-levels | 確度マスタ一覧取得 | BffConfidenceLevelListRequest | BffConfidenceLevelListResponse |
| POST | /api/bff/confidence-levels | 確度マスタ保存 | BffConfidenceLevelSaveRequest | BffConfidenceLevelSaveResponse |
| DELETE | /api/bff/confidence-levels/:id | 確度マスタ削除 | BffConfidenceLevelDeleteRequest | { success: boolean } |
| POST | /api/bff/confidence-values | 確度別金額更新 | BffConfidenceValueUpdateRequest | BffConfidenceValueUpdateResponse |
| POST | /api/bff/confidence-values/bulk | 確度別金額一括更新 | BffConfidenceValueBulkUpdateRequest | BffConfidenceValueUpdateResponse |

**Naming Convention（必須）**
- DTO / Contracts: camelCase（例: `levelCode`, `levelName`）
- DB columns: snake_case（例: `level_code`, `level_name`）

**Error Handling**

```typescript
export const ConfidenceErrorCode = {
  LEVEL_CODE_DUPLICATE: "CONFIDENCE_LEVEL_CODE_DUPLICATE",
  LEVEL_NOT_FOUND: "CONFIDENCE_LEVEL_NOT_FOUND",
  LEVEL_IN_USE: "CONFIDENCE_LEVEL_IN_USE",
  SUBJECT_NOT_CONFIDENCE_ENABLED: "SUBJECT_NOT_CONFIDENCE_ENABLED",
  INVALID_AMOUNT: "CONFIDENCE_INVALID_AMOUNT",
  VERSION_IS_FIXED: "CONFIDENCE_VERSION_IS_FIXED",
  PERIOD_IS_CLOSED: "CONFIDENCE_PERIOD_IS_CLOSED",
  VALIDATION_ERROR: "CONFIDENCE_VALIDATION_ERROR",
} as const
```

**Error Policy**: Option A: Pass-through
- Domain APIのエラーを原則そのまま返す

---

### UI Specification（apps/web）

#### 確度マスタ管理画面

**ファイル構成**:
```
apps/web/src/features/master-data/confidence-master/
├── api/
│   ├── BffClient.ts           # インターフェース
│   ├── HttpBffClient.ts       # 実装（未実装）
│   └── MockBffClient.ts       # モック実装
├── components/
│   └── ConfidenceLevelTable.tsx  # インライン編集テーブル
├── page.tsx                   # フィーチャーページ
└── index.ts                   # エクスポート
```

**ConfidenceLevelTable コンポーネント**:
- インライン編集によるCRUD
- 掛け率: 0-100%表示（内部は0-1）
- カラーピッカー（Popover + 色選択ボタン）
- 表示順の上下移動
- 行追加・削除

**UI状態管理**:
- `useState` によるローカル状態
- 変更時に即時保存（debounce 500ms）
- 保存成功時にトースト表示

#### 見込グリッド統合（ForecastGridWithConfidence）

**ファイル**: `apps/web/src/features/transactions/forecast-entry/ui/ForecastGridWithConfidence.tsx`

**拡張ポイント**:
1. 確度管理対象科目に▶/▼展開アイコン
2. 展開時に確度別行を表示（色付きバッジ）
3. サマリー行（合計・期待値・予算）の表示
4. セル編集時の期待値リアルタイム再計算

**展開状態管理**:
```typescript
const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

const toggleExpand = (rowId: string) => {
  setExpandedRows((prev) => {
    const newSet = new Set(prev)
    if (newSet.has(rowId)) {
      newSet.delete(rowId)
    } else {
      newSet.add(rowId)
    }
    return newSet
  })
}
```

---

### Contracts Summary（This Feature）

#### 主要DTO

```typescript
// 確度マスタ
export interface BffConfidenceLevel {
  id: string
  levelCode: string       // 'S', 'A', 'B', 'C', 'D', 'Z'
  levelName: string       // '受注', '80%受注', ...
  levelNameShort: string  // 'S', 'A', ...
  probabilityRate: number // 0.0 - 1.0
  colorCode: string       // '#22C55E'
  sortOrder: number
  isActive: boolean
}

// 確度別行
export interface BffConfidenceLevelRow {
  confidenceLevelId: string
  levelCode: string
  levelName: string
  probabilityRate: number
  colorCode: string
  sortOrder: number
  cells: BffConfidenceCell[]
  annualTotal: string
}

// サマリー行
export interface BffConfidenceSummaryRow {
  totalCells: BffConfidenceSummaryCell[]    // 合計
  totalAnnual: string
  expectedCells: BffConfidenceSummaryCell[] // 期待値
  expectedAnnual: string
  budgetCells: BffConfidenceSummaryCell[]   // 予算
  budgetAnnual: string
}
```

#### デフォルト確度ランク

```typescript
export const DEFAULT_CONFIDENCE_LEVELS = [
  { levelCode: "S", levelName: "受注", probabilityRate: 1.0, colorCode: "#22C55E" },
  { levelCode: "A", levelName: "80%受注", probabilityRate: 0.8, colorCode: "#84CC16" },
  { levelCode: "B", levelName: "50%受注", probabilityRate: 0.5, colorCode: "#EAB308" },
  { levelCode: "C", levelName: "20%受注", probabilityRate: 0.2, colorCode: "#F97316" },
  { levelCode: "D", levelName: "0%（案件化）", probabilityRate: 0.0, colorCode: "#EF4444" },
  { levelCode: "Z", levelName: "目安なし", probabilityRate: 0.0, colorCode: "#6B7280" },
]
```

---

## Responsibility Clarification（Mandatory）

### UIの責務
- 確度マスタのインライン編集UI
- 見込グリッドの確度別行展開表示
- 期待値のリアルタイム表示（計算はBFF/Domain API）
- 掛け率の0-100% ↔ 0-1 変換（表示用）

### BFFの責務
- 確度マスタのCRUD操作
- 確度別金額の取得・更新
- Domain API DTOからUI DTO への変換

### Domain APIの責務（未実装）
- 確度マスタのビジネスルール検証
- 確度別金額の整合性保証
- 期待値計算のロジック
- 監査ログ記録

---

## Data Model

### Entity: confidence_levels

```sql
CREATE TABLE confidence_levels (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  company_id uuid NOT NULL,
  level_code varchar(20) NOT NULL,
  level_name varchar(100) NOT NULL,
  level_name_short varchar(20),
  probability_rate numeric(5,2) NOT NULL,
  color_code varchar(7),
  sort_order int NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,

  UNIQUE(tenant_id, company_id, level_code),
  FOREIGN KEY (tenant_id, company_id) REFERENCES companies(tenant_id, id)
);
```

### Extension: fact_amounts

```sql
ALTER TABLE fact_amounts ADD COLUMN confidence_level_id uuid;

ALTER TABLE fact_amounts ADD CONSTRAINT fk_fact_amounts_confidence
  FOREIGN KEY (tenant_id, company_id, confidence_level_id)
  REFERENCES confidence_levels(tenant_id, company_id, id);
```

### Extension: report_layout_items

```sql
ALTER TABLE report_layout_items ADD COLUMN confidence_enabled boolean DEFAULT false;
```

---

## Requirements Traceability

| 要件ID | 設計セクション |
|--------|--------------|
| 1.1-1.5 | Data Model > Entity: confidence_levels |
| 2.1-2.7 | UI Specification > 確度マスタ管理画面 |
| 3.1-3.4 | Data Model > Extension: report_layout_items |
| 4.1-4.5 | UI Specification > 見込グリッド統合 |
| 5.1-5.4 | Contracts Summary > BffConfidenceSummaryRow |
| 6.1-6.4 | Data Model > Extension: fact_amounts |

---

## 変更履歴

| 日付 | 変更内容 | 担当 |
|------|---------|------|
| 2026-01-12 | リバースエンジニアリングにより初版作成 | Claude Code |
