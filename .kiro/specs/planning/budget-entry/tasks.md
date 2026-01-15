# Implementation Plan

> CCSDD / SDD 前提：**contracts-first**（bff → api → shared）を最優先し、境界違反を guard で止める。
> UI は最後。v0 は **Phase 1（統制テスト）→ Phase 2（本実装）** の二段階で扱う。

---

## 0. Design Completeness Gate（Blocking）

> Implementation MUST NOT start until all items below are checked.
> These checks are used to prevent "empty design sections" from being silently interpreted by implementers/AI.

- [x] 0.1 Designの「BFF Specification（apps/bff）」が埋まっている
  - BFF endpoints（UIが叩く）が記載されている
  - Request/Response DTO（packages/contracts/src/bff）が列挙されている
  - **Paging/Sorting正規化**: 本機能はグリッド一括取得のためページング不要（設計に明記済み）
  - 変換（api DTO → bff DTO）の方針が記載されている
  - エラー整形方針（**Pass-through**）が記載されている
  - tenant_id/user_id の取り回しが記載されている

- [x] 0.2 Designの「Service Specification（Domain / apps/api）」が埋まっている
  - Usecase（GET/PUT）が列挙されている
  - 主要ビジネスルール（VERSION_FIXED拒否、PERIOD_CLOSED拒否、AGGREGATE入力不可）が記載されている
  - トランザクション境界（単一Fact/複数Facts）が記載されている
  - 監査ログ記録ポイント（updated_by/at）が記載されている

- [x] 0.3 Designの「Repository Specification（apps/api）」が埋まっている
  - 取得・更新メソッド一覧（findByContext, upsertFact, upsertFacts）が記載されている
  - where句二重ガードの方針が記載されている
  - RLS前提が記載されている

- [x] 0.4 Designの「Contracts Summary（This Feature）」が埋まっている
  - packages/contracts/src/bff/budget-entry の追加DTOが列挙されている
  - packages/contracts/src/api/budget-entry は将来対応と明記されている
  - Enum / Error の配置ルール（shared集約）が明記されている
  - 「UIは packages/contracts/src/api を参照しない」ルールが明記されている

- [x] 0.5 Requirements Traceability が更新されている
  - 全7要件がBFF/API/UI設計要素に紐づけ済み

- [ ] 0.6 v0生成物の受入・移植ルールが確認されている
  - 本機能はClaude Codeで直接実装（v0不使用）
  - ただしMockBffClientでの動作確認は実施する

- [ ] 0.7 Structure / Boundary Guard がパスしている
  - `npx tsx scripts/structure-guards.ts` が成功している

---

## 1. Scaffold / Structure Setup（最初に実施）

- [ ] 1.0 Feature骨格生成（Scaffold）
  - 実行: `npx tsx scripts/scaffold-feature.ts transactions budget-entry`
  - 確認:
    - `apps/web/src/features/planning/budget-entry` が作成されている
    - `apps/bff/src/modules/planning/budget-entry` が作成されている
    - `apps/api/src/modules/planning/budget-entry` が作成されている

---

## 2. Contracts（SSoT確定）

- [ ] 2.1 BFF Contracts 作成
  - ファイル: `packages/contracts/src/bff/budget-entry/index.ts`
  - 内容:
    - BffBudgetGridRequest / BffBudgetGridResponse
    - BffBudgetContextResponse
    - BffUpdateCellRequest / BffUpdateCellResponse
    - BffUpdateCellsRequest / BffUpdateCellsResponse
    - BffBudgetCompareRequest / BffBudgetCompareResponse
    - BffBudgetRow, BffBudgetCell, BffPeriodColumn 等
  - _Requirements: 1.1, 1.2, 2.1, 3.1, 5.1, 7.1_

- [ ] 2.2 Shared Errors 追加（必要な場合）
  - ファイル: `packages/contracts/src/shared/errors/budget-entry-error.ts`
  - 内容:
    - VERSION_IS_FIXED
    - PERIOD_IS_CLOSED
    - INVALID_AMOUNT
    - NEGATIVE_NOT_ALLOWED
  - _Requirements: 2.2, 2.3, 2.4, 2.5, 6.1, 6.2, 6.3_

---

## 3. Database（エンティティ追加）

- [ ] 3.1 Prisma Schema 追加: budget_input_axis_settings
  - ファイル: `packages/db/prisma/schema.prisma`
  - モデル: BudgetInputAxisSetting
  - カラム: id, tenant_id, company_id, subject_id, department_stable_id, dimension_id, fiscal_year, is_required, is_active, created_at, updated_at, created_by, updated_by
  - UNIQUE制約: (tenant_id, company_id, subject_id, department_stable_id, dimension_id, fiscal_year)
  - _Requirements: 3.1_

- [ ] 3.2 Migration 実行
  - 実行: `pnpm --filter @epm/db db:migrate:dev --name add_budget_input_axis_settings`
  - 確認: マイグレーションファイルが生成されている

- [ ] 3.3 RLS Policy 追加
  - テーブル: budget_input_axis_settings
  - ポリシー: tenant_isolation

- [ ] 3.4 Seed Data 作成（開発用）
  - budget_input_axis_settings のサンプルデータ
  - 例: 売上高科目 × 得意先グループディメンション

---

## 4. Domain API（apps/api）

- [ ] 4.1 Repository 作成: BudgetEntryRepository
  - ファイル: `apps/api/src/modules/planning/budget-entry/budget-entry.repository.ts`
  - メソッド:
    - findByContext(tenantId, companyId, fiscalYear, departmentStableId, planVersionId)
    - upsertFact(tenantId, companyId, fact)
    - upsertFacts(tenantId, companyId, facts[])
  - tenant_id 二重ガード必須
  - _Requirements: 2.1, 2.6_

- [ ] 4.2 Service 作成: BudgetEntryService
  - ファイル: `apps/api/src/modules/planning/budget-entry/budget-entry.service.ts`
  - ビジネスルール:
    - plan_version.status == 'FIXED' → 拒否
    - accounting_period.close_status != 'OPEN' → 拒否
    - subject.subject_class == 'AGGREGATE' → 拒否
    - subject.posting_allowed == false → 拒否
    - subject.allow_negative == false && value < 0 → 拒否
  - _Requirements: 2.2, 2.3, 2.4, 2.5, 6.1, 6.2_

- [ ] 4.3 Controller 作成: BudgetEntryController
  - ファイル: `apps/api/src/modules/planning/budget-entry/budget-entry.controller.ts`
  - エンドポイント:
    - GET /api/planning/budget-entry
    - GET /api/planning/budget-entry/context
    - PUT /api/planning/budget-entry/fact
    - PUT /api/planning/budget-entry/facts
  - _Requirements: 1.1, 2.1, 7.1_

- [ ] 4.4 Module 作成: BudgetEntryModule
  - ファイル: `apps/api/src/modules/planning/budget-entry/budget-entry.module.ts`
  - app.module.ts への登録

---

## 5. BFF（apps/bff）

- [ ] 5.1 Domain API Client 作成
  - ファイル: `apps/bff/src/modules/planning/budget-entry/domain-api.client.ts`
  - tenant_id / user_id ヘッダー伝搬
  - _Requirements: 1.1, 2.1_

- [ ] 5.2 Mapper 作成: BudgetEntryMapper
  - ファイル: `apps/bff/src/modules/planning/budget-entry/mappers/budget-entry.mapper.ts`
  - 変換ロジック:
    - フラットな fact_amounts → BffBudgetRow[] (グリッド構造)
    - subject_rollup_items に基づく AGGREGATE 計算
    - budget_input_axis_settings に基づくディメンション展開行生成
  - _Requirements: 1.3, 3.1, 3.3, 4.1, 4.2_

- [ ] 5.3 Service 作成: BudgetEntryService
  - ファイル: `apps/bff/src/modules/planning/budget-entry/budget-entry.service.ts`
  - グリッドデータ取得
  - セル更新 + 影響行（AGGREGATE）再計算
  - バージョン比較計算
  - _Requirements: 1.1, 2.1, 4.3, 5.2, 5.3_

- [ ] 5.4 Controller 作成: BudgetEntryController
  - ファイル: `apps/bff/src/modules/planning/budget-entry/budget-entry.controller.ts`
  - エンドポイント:
    - GET /api/bff/planning/budget-entry/grid
    - GET /api/bff/planning/budget-entry/context
    - PUT /api/bff/planning/budget-entry/cell
    - PUT /api/bff/planning/budget-entry/cells
    - GET /api/bff/planning/budget-entry/compare
  - _Requirements: 1.1, 2.1, 5.1, 7.1_

- [ ] 5.5 Module 作成: BudgetEntryModule
  - ファイル: `apps/bff/src/modules/planning/budget-entry/budget-entry.module.ts`
  - app.module.ts への登録

---

## 6. UI（apps/web）- Phase 1: Mock動作確認

- [ ] 6.1 MockBffClient 作成
  - ファイル: `apps/web/src/features/planning/budget-entry/api/MockBffClient.ts`
  - サンプルグリッドデータ返却
  - _Requirements: 1.1, 3.1_

- [ ] 6.2 BffClient Interface 作成
  - ファイル: `apps/web/src/features/planning/budget-entry/api/BffClient.ts`
  - getGrid, updateCell, updateCells, getContext, getCompare
  - _Requirements: 1.1, 2.1, 5.1, 7.1_

- [ ] 6.3 グリッドコンポーネント作成: BudgetGrid
  - ファイル: `apps/web/src/features/planning/budget-entry/ui/BudgetGrid.tsx`
  - 機能:
    - 行=科目、列=月（4月〜3月）+ 年計
    - セルクリックで編集モード
    - Tab/Enter/矢印キーによるセル移動
    - AGGREGATE科目は背景色グレー、編集不可
  - _Requirements: 1.1, 1.2, 1.4, 2.2_

- [ ] 6.4 ディメンション展開機能: ExpandableRow
  - ファイル: `apps/web/src/features/planning/budget-entry/ui/ExpandableRow.tsx`
  - 展開アイコン（▶/▼）
  - 子行（ディメンション値別）の表示/非表示
  - _Requirements: 3.1, 3.3, 3.4_

- [ ] 6.5 自動保存機能: useAutoSave hook
  - ファイル: `apps/web/src/features/planning/budget-entry/hooks/useAutoSave.ts`
  - 500ms debounce
  - 保存中/成功/エラー状態管理
  - _Requirements: 2.6_

- [ ] 6.6 コンテキストセレクター: ContextSelector
  - ファイル: `apps/web/src/features/planning/budget-entry/ui/ContextSelector.tsx`
  - 年度/部門/バージョン選択
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 6.7 バージョン比較表示: CompareView
  - ファイル: `apps/web/src/features/planning/budget-entry/ui/CompareView.tsx`
  - 比較元/現行/差異の3列表示
  - 差異の色分け（正=青、負=赤）
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 6.8 ページコンポーネント作成
  - ファイル: `apps/web/src/features/planning/budget-entry/page.tsx`
  - ContextSelector + BudgetGrid + CompareView の統合
  - _Requirements: 1.1, 7.4_

- [ ] 6.9 ルーティング設定
  - ファイル: `apps/web/src/app/planning/budget-entry/page.tsx`
  - Feature配下のpageをre-export

---

## 7. UI（apps/web）- Phase 2: BFF接続・本実装

- [ ] 7.1 HttpBffClient 作成
  - ファイル: `apps/web/src/features/planning/budget-entry/api/HttpBffClient.ts`
  - 実BFF接続
  - エラーハンドリング
  - _Requirements: 2.1, 6.3_

- [ ] 7.2 未保存警告機能
  - beforeunload イベント
  - ダーティセル検知
  - _Requirements: 2.6_

- [ ] 7.3 エラー表示改善
  - セルレベルエラーハイライト
  - ツールチップによるエラーメッセージ表示
  - _Requirements: 6.3_

---

## 8. Integration Test

- [ ] 8.1 BFF Integration Test
  - グリッドデータ取得
  - セル更新 + AGGREGATE再計算
  - バージョン比較
  - _Requirements: 1.1, 2.1, 4.3, 5.2_

- [ ] 8.2 Domain API Unit Test
  - ビジネスルール検証（VERSION_FIXED, PERIOD_CLOSED等）
  - Upsertロジック
  - _Requirements: 2.2, 2.3, 2.4, 2.5, 6.1, 6.2_

---

## 9. Structure Guard / Final Check

- [ ] 9.1 Structure Guard 実行
  - `npx tsx scripts/structure-guards.ts`
  - UI → Domain API 直接呼び出しがないこと
  - UI が api contracts を参照していないこと

- [ ] 9.2 spec.json status 更新
  - status: "requirements" → "implemented"
