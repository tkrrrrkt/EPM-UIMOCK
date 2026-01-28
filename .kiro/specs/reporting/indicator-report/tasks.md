# 財務指標分析レポート - Tasks

## Design Completeness Gate

- [x] requirements.md 完成
- [x] design.md 完成
- [x] design-review.md GO判定

---

## Phase 1: Decisions

### Task 1.1: ADR - 指標計算エンジン方針
_Requirements: FR-3.3_

- [ ] 評価エンジン候補の比較検討
  - mathjs（機能豊富、サイズ大）
  - expr-eval（軽量、基本機能）
  - 独自パーサー（完全制御、開発コスト高）
- [ ] セキュリティ要件の確認（eval禁止、サンドボックス評価）
- [ ] `docs/adr/XXXX-metric-evaluation-engine.md` 作成
- [ ] 選定結果をdesign.mdに反映

---

## Phase 2: Contracts

### Task 2.1: BFF Contracts - Enums
_Requirements: FR-2.1〜2.5, FR-4.1〜4.4_

- [ ] `packages/contracts/src/bff/indicator-report/enums.ts` 作成
  - ScenarioType（既存確認、なければ定義）
  - DisplayGranularity
  - LayoutLineType
  - ItemRefType

### Task 2.2: BFF Contracts - DTOs
_Requirements: FR-1.1〜1.3, FR-3.1〜3.4, FR-7.1〜7.2_

- [ ] `packages/contracts/src/bff/indicator-report/index.ts` 作成
  - BffSelectorOptionsRequest
  - BffIndicatorReportDataRequest
  - BffIndicatorReportLayoutResponse
  - BffLayoutLine
  - BffSelectorOptionsResponse
  - BffPlanEventOption
  - BffPlanVersionOption
  - BffDepartmentNode
  - BffIndicatorReportDataResponse
  - BffReportRow

### Task 2.3: BFF Contracts - Errors
_Requirements: FR-1.2, FR-8.1_

- [ ] `packages/contracts/src/bff/indicator-report/errors.ts` 作成
  - IndicatorReportErrorCode
  - IndicatorReportError

### Task 2.4: BFF Contracts - Export
- [ ] `packages/contracts/src/bff/index.ts` に export 追加

### Task 2.5: API Contracts（並列可）
_Requirements: FR-3.1〜3.4_

(P) Task 2.1〜2.4 と並列実行可能

- [ ] `packages/contracts/src/api/indicator-report/index.ts` 作成
  - ApiIndicatorReportLayoutRequest
  - ApiIndicatorReportDataRequest
  - ApiIndicatorReportLayoutResponse
  - ApiLayout
  - ApiLayoutLine
  - ApiIndicatorReportDataResponse
  - ApiReportRow
- [ ] `packages/contracts/src/api/index.ts` に export 追加

---

## Phase 3: DB / Migration / RLS

### Task 3.1: Prisma Schema 確認・更新
_Requirements: FR-1.1_

- [ ] `packages/db/prisma/schema.prisma` 確認
  - IndicatorReportLayout モデル存在確認
  - IndicatorReportLayoutLine モデル存在確認
  - Company.indicatorReportLayoutId 存在確認
- [ ] 不足があれば追加
- [ ] `npx prisma generate`

### Task 3.2: Migration 実行（必要な場合）
_Requirements: FR-1.1_

- [ ] 変更がある場合のみ: `npx prisma migrate dev --name add-indicator-report-layouts`
- [ ] migration ファイル確認

### Task 3.3: RLS Policy 確認・追加
_Requirements: NFR-2_

- [ ] indicator_report_layouts に tenant_id RLS 確認/追加
- [ ] indicator_report_layout_lines に tenant_id RLS 確認/追加

---

## Phase 4: Domain API (apps/api)

### Task 4.1: Repository 実装
_Requirements: FR-1.1, FR-3.1〜3.4_

(P) 以下は並列実装可能:

- [ ] `apps/api/src/modules/reporting/indicator-report/repositories/indicator-report-layout.repository.ts`
  - findLayoutByCompanyId(tenantId, companyId): レイアウト取得
  - findLayoutLinesById(tenantId, layoutId): 行一覧取得

- [ ] `apps/api/src/modules/reporting/indicator-report/repositories/fact-amount.repository.ts`（既存拡張 or 新規）
  - findByFilters(params): 財務科目データ取得

- [ ] `apps/api/src/modules/reporting/indicator-report/repositories/kpi-fact-amount.repository.ts`
  - findLatestConfirmedEvent(tenantId, companyId, fiscalYear): 最新KPIイベント取得
  - findByFilters(params): KPIデータ取得

### Task 4.2: Service 実装
_Requirements: FR-3.1〜3.4, FR-5.1〜5.3, FR-6.1〜6.4_

- [ ] `apps/api/src/modules/reporting/indicator-report/services/layout.service.ts`
  - getLayoutForCompany(tenantId, companyId)
  - getLayoutLines(tenantId, layoutId)

- [ ] `apps/api/src/modules/reporting/indicator-report/services/fact-amount-synthesis.service.ts`
  - getFinancialData(params): 財務科目データ取得・集計
  - applyAggregationMethod(data, method): 集計メソッド適用

- [ ] `apps/api/src/modules/reporting/indicator-report/services/kpi-fact-amount-synthesis.service.ts`
  - getNonFinancialData(params): 非財務KPIデータ取得・集計
  - resolveKpiEvent(tenantId, companyId, fiscalYear): 最新CONFIRMEDイベント解決

- [ ] `apps/api/src/modules/reporting/indicator-report/services/metric-evaluation.service.ts`
  - evaluateMetric(tenantId, metricId, params): 指標計算
  - parseFormula(expr): 式パース（ADRで決定したエンジン使用）
  - evaluateFormula(parsed, context): 評価実行

- [ ] `apps/api/src/modules/reporting/indicator-report/services/data-synthesis.service.ts`（統合）
  - getReportData(request): 全データ合成
  - synthesizeRow(line, primaryData, compareData): 行データ合成

### Task 4.3: Controller 実装
_Requirements: FR-1.1〜1.3, FR-3.1〜3.4_

- [ ] `apps/api/src/modules/reporting/indicator-report/indicator-report.controller.ts`
  - GET /api/indicator-report/layout
  - GET /api/indicator-report/selector-options
  - GET /api/indicator-report/data

### Task 4.4: Module 登録
- [ ] `apps/api/src/modules/reporting/indicator-report/indicator-report.module.ts` 作成
- [ ] `apps/api/src/app.module.ts` に import 追加

---

## Phase 5: BFF (apps/bff)

### Task 5.1: Mapper 実装
_Requirements: FR-7.1, FR-7.2_

- [ ] `apps/bff/src/modules/reporting/indicator-report/mappers/indicator-report.mapper.ts`
  - toLayoutResponse(apiLayout, apiLines): BffIndicatorReportLayoutResponse
  - toSelectorOptionsResponse(apiOptions): BffSelectorOptionsResponse
  - toReportDataResponse(apiData, request): BffIndicatorReportDataResponse
  - calculateDifference(primary, compare): 差分計算
  - calculateDifferenceRate(primary, compare): 差分率計算

### Task 5.2: Service 実装
- [ ] `apps/bff/src/modules/reporting/indicator-report/indicator-report.service.ts`
  - getLayout(tenantId, companyId): レイアウト取得
  - getSelectorOptions(tenantId, companyId, request): 選択肢取得
  - getReportData(tenantId, companyId, request): レポートデータ取得

### Task 5.3: Controller 実装
- [ ] `apps/bff/src/modules/reporting/indicator-report/indicator-report.controller.ts`
  - GET /api/bff/indicator-report/layout
  - GET /api/bff/indicator-report/selector-options
  - GET /api/bff/indicator-report/data
  - ヘッダーから x-tenant-id, x-user-id 抽出

### Task 5.4: Module 登録
- [ ] `apps/bff/src/modules/reporting/indicator-report/indicator-report.module.ts` 作成
- [ ] `apps/bff/src/app.module.ts` に import 追加

---

## Phase 6: UI (apps/web)

### Task 6.1: Scaffold 生成
- [ ] `npx tsx scripts/scaffold-feature.ts reporting indicator-report`

### Task 6.2: v0 Prompt 作成
_Requirements: 全FR_

- [ ] `.kiro/specs/reporting/indicator-report/v0-prompt.md` 作成
- [ ] `.kiro/steering/v0-prompt-template.md` に従い記載
- [ ] BFF Endpoints / DTOs / Errors を完全に記載
- [ ] 禁止事項を明記

### Task 6.3: v0 UI 生成（Phase 1: 隔離）
- [ ] v0.dev でプロンプト実行
- [ ] `apps/web/_v0_drop/reporting/indicator-report/src/` に格納
- [ ] 生成物確認:
  - IndicatorReportPage.tsx
  - FilterHeader.tsx
  - PeriodGranularitySelector.tsx
  - DepartmentTreePanel.tsx
  - ReportTable.tsx
  - api/BffClient.ts
  - api/MockBffClient.ts
  - api/HttpBffClient.ts
  - lib/error-messages.ts

### Task 6.4: Structure Guard 実行
- [ ] `npx tsx scripts/structure-guards.ts`
- [ ] 違反があれば修正:
  - UI → Domain API 直接呼び出し禁止
  - contracts/api 参照禁止
  - 生カラーリテラル禁止
  - layout.tsx 禁止

### Task 6.5: 移植（Phase 2）
- [ ] `npx tsx scripts/v0-migrate.ts reporting indicator-report`
- [ ] import パス修正（`@/shared/ui`, `@epm/contracts/bff/indicator-report`）
- [ ] `apps/web/src/app/reporting/indicator-report/page.tsx` 作成
- [ ] `apps/web/src/shared/navigation/menu.ts` にメニュー登録

### Task 6.6: HttpBffClient 接続
- [ ] MockBffClient → HttpBffClient 切替
- [ ] 実BFF接続確認

---

## Phase 7: 統合テスト

### Task 7.1: E2E 動作確認
_Requirements: 全FR, NFR_

- [ ] レイアウト表示確認
  - header/item/divider/note/blank 各行種別の表示
  - indent_level によるインデント
  - is_bold による太字表示
- [ ] Primary/Compare 切替確認
  - 予算選択 → イベント+バージョン選択
  - 見込選択 → イベント選択（最新FIXED自動採用）
  - 実績選択 → 年度のみ
- [ ] 期間・粒度変更確認
  - 月次/四半期/半期/年度の切替
  - 期間レンジ変更
- [ ] 部門ツリー選択確認
  - 単独選択
  - 配下集約チェックボックス
- [ ] 差分計算確認
  - 差分（金額）= Primary - Compare
  - 差分率 = 差分 / Compare
  - Compare=0 の場合「-」表示
- [ ] エラー表示確認
  - レイアウト未設定時のブロック表示
  - 各種エラーメッセージ

### Task 7.2: 権限確認
_Requirements: NFR-3, NFR-4_

- [ ] ロール権限による閲覧可否確認
- [ ] 部門可視範囲制御確認（control_department_stable_ids）

### Task 7.3: パフォーマンス確認
_Requirements: NFR-1_

- [ ] 100行レイアウトでの表示速度確認（3秒以内）
- [ ] 大量部門配下集約時の表示速度確認

---

## 完了条件

- [ ] 全タスク完了
- [ ] E2E動作確認完了
- [ ] 権限確認完了
- [ ] パフォーマンス確認完了

---

## 変更履歴

| 日付 | 変更内容 | 担当 |
|------|---------|------|
| 2026-01-26 | 初版作成 | Claude Code |
