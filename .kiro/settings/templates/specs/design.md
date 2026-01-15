# Design Document Template

---

**Purpose**: Provide sufficient detail to ensure implementation consistency across different implementers, preventing interpretation drift.

---

## Spec Reference（INPUT情報）

本設計を作成するにあたり、以下の情報を確認した：

### Requirements（直接INPUT）
- **参照ファイル**: `.kiro/specs/{{CONTEXT}}/{{FEATURE}}/requirements.md`
- **要件バージョン**: {{REQ_VERSION_OR_DATE}}

### 仕様概要（確定済み仕様）
- **参照ファイル**: `.kiro/specs/仕様概要/{{SPEC_SUMMARY_FILE}}.md`
- **設計に影響する仕様ポイント**:
  - {{SPEC_POINT_1}}
  - {{SPEC_POINT_2}}

### エンティティ定義（Data Model 正本）
- **参照ファイル**: `.kiro/specs/entities/{{ENTITY_FILE}}.md`
- **対象エンティティ**: {{ENTITY_NAMES}}

### 仕様検討（経緯・背景）※参考
- **参照ファイル**: `.kiro/specs/仕様検討/{{DISCUSSION_FILE}}.md`（任意）
- **設計判断に影響した経緯**: {{BACKGROUND_NOTES}}

---

## INPUT整合性チェック

| チェック項目 | 確認結果 |
|-------------|---------|
| requirements.md との整合性 | 設計が全要件をカバーしている: ✅ / ❌ |
| 仕様概要との整合性 | 設計が仕様概要と矛盾しない: ✅ / ❌ |
| エンティティとの整合性 | Data Model がエンティティ定義に準拠: ✅ / ❌ |
| 仕様検討の背景理解 | 設計判断の背景を確認した: ✅ / N/A |

---

## Overview
2-3 paragraphs max

---

## Architecture

### Architecture Pattern & Boundary Map

**Pattern (fixed)**:
- UI（apps/web） → BFF（apps/bff） → Domain API（apps/api） → DB（PostgreSQL + RLS）
- UI直APIは禁止

**Contracts (SSoT)**:
- UI ↔ BFF: `packages/contracts/src/bff`
- BFF ↔ Domain API: `packages/contracts/src/api`
- Enum/Error: 原則 `packages/contracts/src/shared/**`
- UI は `packages/contracts/src/api` を参照してはならない

---

## Architecture Responsibilities（Mandatory）

### BFF Specification（apps/bff）

**Purpose**
- UI要件に最適化したAPI（Read Model / ViewModel）
- Domain APIのレスポンスを集約・変換（ビジネスルールの正本は持たない）

**BFF Endpoints（UIが叩く）**
| Method | Endpoint | Purpose | Request DTO (contracts/bff) | Response DTO (contracts/bff) | Notes |
| ------ | -------- | ------- | --------------------------- | ---------------------------- | ----- |

**Naming Convention（必須）**
- DTO / Contracts: camelCase（例: `employeeCode`, `employeeName`）
- DB columns: snake_case（例: `employee_code`, `employee_name`）
- `sortBy` は **DTO側キー**を採用する（例: `employeeCode | employeeName`）。
- DB列名（snake_case）を UI/BFF へ露出させない。

**Paging / Sorting Normalization（必須・BFF責務）**
 - UI/BFF: page / pageSize（page-based）
 - Domain API: offset / limit（DB-friendly）
 - BFFは必ず以下を実施する（省略禁止）：
   - defaults: page=1, pageSize=50, sortBy=<default>, sortOrder=asc
   - clamp: pageSize <= 200
   - whitelist: sortBy は許可リストのみ（設計で明記）
   - normalize: keyword trim、空→undefined
   - transform: offset=(page-1)*pageSize, limit=pageSize
 - Domain APIに渡すのは offset/limit（page/pageSizeは渡さない）
 - BFFレスポンスには page/pageSize を含める（UIへ返すのはBFF側の値）

**Transformation Rules（api DTO → bff DTO）**
- 方針：field rename/omit/default の有無
- BFFレスポンスに page/pageSize を含める（UIに返すのはBFF値）

**Error Handling（contracts errorに準拠）**

**Error Policy（必須・未記載禁止）**
- この Feature における BFF の Error Policy は以下とする：
  - 採用方針：**Option A: Pass-through | Option B: Minimal shaping**
  - 採用理由：

 **Option A: Pass-through（基本・推奨）**
 - Domain APIのエラーを原則そのまま返す（status / code / message / details）
 - BFF側での意味的な再分類・書き換えは禁止（ログ付与等の非機能は除く）
 - UIは `contracts/bff/errors` に基づいて表示制御を行う

 **Option B: Minimal shaping（UI都合の最小整形）**
 - Domain APIのエラーを基本透過しつつ、UI表示に必要な最小整形のみ許可
 - 新たなビジネス判断・エラー分類をBFFに追加してはならない
 - 整形結果は `contracts/bff/errors` に必ず定義する

 **In all cases**
 - 最終拒否権限（403/404/409/422等）は Domain API が持つ

**Authentication / Tenant Context（tenant_id/user_id伝搬）**
- tenant_id/user_id をどこで解決するか
- Domain APIへどう伝搬するか（header/ctx）

---

### Service Specification（Domain / apps/api）
- Domainがビジネスルールの正本（BFF/UIは禁止）
- Transaction boundary / audit points を必ず明記

---

### Repository Specification（apps/api）
- tenant_id 必須（全メソッド）
- where句二重ガード必須
- set_config 前提（RLS無効化禁止）

---

### Contracts Summary（This Feature）
- DTO / Error / Enum は contracts 外に定義してはならない
- Enum/Error は原則 shared に集約
  - shared例: `packages/contracts/src/shared/enums/*`, `packages/contracts/src/shared/errors/*`
- UIは bff のみ参照ß

---

## Responsibility Clarification（Mandatory）

本Featureにおける責務境界を以下に明記する。
未記載の責務は実装してはならない。

### UIの責務
- 表示制御（enable/disable / 文言切替）
- フォーム入力制御・UX最適化
- ビジネス判断は禁止

### BFFの責務
- UI入力の正規化（paging / sorting / filtering）
- Domain API DTO ⇄ UI DTO の変換
- ビジネスルールの正本は持たない

### Domain APIの責務
- ビジネスルールの正本
- 権限・状態遷移の最終判断
- 監査ログ・整合性保証

---

## Data Model（エンティティ整合性確認必須）

### Entity Reference
- 参照元: `.kiro/specs/entities/{{FILE_NAME}}.md` セクション {{SECTION}}

### エンティティ整合性チェックリスト

| チェック項目 | 確認結果 |
|-------------|---------|
| カラム網羅性 | エンティティ定義の全カラムがDTO/Prismaに反映されている: ✅ / ❌ |
| 型の一致 | varchar→String, numeric→Decimal 等の型変換が正確: ✅ / ❌ |
| 制約の反映 | UNIQUE/CHECK制約がPrisma/アプリ検証に反映: ✅ / ❌ |
| ビジネスルール | エンティティ補足のルールがServiceに反映: ✅ / ❌ |
| NULL許可 | NULL/NOT NULLがPrisma?/必須に正しく対応: ✅ / ❌ |

### Prisma Schema

```prisma
model {{MODEL_NAME}} {
  // エンティティ定義に基づいて記載
}
```

### Constraints（エンティティ定義から転記）
- PK: id（UUID）
- UNIQUE: {{UNIQUE_CONSTRAINTS}}
- CHECK: {{CHECK_CONSTRAINTS}}（アプリケーション層で検証）

### RLS Policy
```sql
ALTER TABLE {{TABLE_NAME}} ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON {{TABLE_NAME}}
  USING (tenant_id::text = current_setting('app.tenant_id', true));
```
