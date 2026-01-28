# ROIC分析 - Tasks

## Design Completeness Gate

- [x] requirements.md 完成
- [x] design.md 完成
- [x] design-review.md GO判定

---

## Phase 1: Contracts（BFF） ✅ COMPLETED

### Task 1.1: BFF Contracts - Enums
_Requirements: Req1, Req3_

- [x] `packages/contracts/src/bff/roic-analysis/index.ts` に Enums 定義
  - RoicPrimaryType
  - RoicGranularity
  - RoicMode
  - RoicLineType
  - RoicTreeSection
  - RoicKpiFormat

### Task 1.2: BFF Contracts - DTOs
_Requirements: Req1〜Req8_

- [x] `packages/contracts/src/bff/roic-analysis/index.ts` に DTOs 定義
  - BffRoicOptionsRequest / BffRoicOptionsResponse
  - BffRoicFiscalYearOption
  - BffRoicEventOption
  - BffRoicVersionOption
  - BffRoicDepartmentNode
  - BffRoicDataRequest / BffRoicDataResponse
  - BffRoicKpiItem
  - BffRoicTreeLine
  - BffRoicChartPoint
  - BffRoicVsWaccChartData
  - BffRoicDecompositionBar / BffRoicDecompositionChartData
  - BffRoicWarning
  - BffRoicSimpleInputRequest / BffRoicSimpleInputResponse
  - BffRoicSimpleInputLine
  - BffRoicSimpleInputSaveRequest / BffRoicSimpleInputSaveResponse

### Task 1.3: BFF Contracts - Errors
_Requirements: Req9_

- [x] `packages/contracts/src/bff/roic-analysis/index.ts` に Errors 定義
  - RoicAnalysisErrorCode
  - BffRoicAnalysisError
  - RoicWarningCode
  - RoicKpiId

### Task 1.4: BFF Contracts - Export
- [x] wildcard export により自動エクスポート（`@epm/contracts/bff/roic-analysis`）

---

## Phase 2: UI-MOCK（MockBffClient + UI Components）

### Task 2.1: Scaffold 生成
- [ ] `apps/web/src/features/report/roic-analysis/` ディレクトリ作成
- [ ] 基本ファイル構成の作成

### Task 2.2: BffClient Interface
_Requirements: 全Req_

- [ ] `apps/web/src/features/report/roic-analysis/api/BffClient.ts` 作成
  - getOptions(request): Promise<BffRoicOptionsResponse>
  - getData(request): Promise<BffRoicDataResponse>
  - getSimpleInput(request): Promise<BffRoicSimpleInputResponse>
  - saveSimpleInput(request): Promise<BffRoicSimpleInputSaveResponse>

### Task 2.3: MockBffClient 実装
_Requirements: 全Req_

- [ ] `apps/web/src/features/report/roic-analysis/api/MockBffClient.ts` 作成
  - モックデータ定義（標準モード用）
  - モックデータ定義（簡易モード用）
  - 各メソッドのモック実装

### Task 2.4: Calculation Library
_Requirements: Req5, Req6, Req7_

- [ ] `apps/web/src/features/report/roic-analysis/lib/roic-calculator.ts` 作成
  - calculateRoicKpis(): 11指標計算
  - calculateAverageInvestedCapital(): 平均投下資本計算
  - getSimplifiedInvestedCapital(): 簡易モード投下資本

- [ ] `apps/web/src/features/report/roic-analysis/lib/tree-utils.ts` 作成
  - calculateAdjustment(): 調整差分計算
  - recalculateParent(): 親科目再計算
  - resetSimulation(): シミュレーションリセット

### Task 2.5: Hooks 実装
_Requirements: 全Req_

(P) 以下は並列実装可能:

- [ ] `apps/web/src/features/report/roic-analysis/hooks/useRoicOptions.ts` 作成
  - オプションデータ取得
  - モード判定結果の管理

- [ ] `apps/web/src/features/report/roic-analysis/hooks/useRoicData.ts` 作成
  - ROICデータ取得
  - 警告状態の管理

- [ ] `apps/web/src/features/report/roic-analysis/hooks/useRoicSimulation.ts` 作成
  - シミュレーション値の状態管理
  - 変更検知
  - リセット機能

- [ ] `apps/web/src/features/report/roic-analysis/hooks/useSimpleInput.ts` 作成
  - 簡易入力パネルの状態管理
  - 入力値の一時保存
  - 保存処理

### Task 2.6: UI Components 実装
_Requirements: 全Req_

(P) 以下は並列実装可能:

- [ ] `apps/web/src/features/report/roic-analysis/components/RoicDashboard.tsx` 作成
  - メインコンテナ
  - モード表示
  - レイアウト管理

- [ ] `apps/web/src/features/report/roic-analysis/components/RoicFilters.tsx` 作成
  - 年度/Primary/Compare選択
  - 期間/粒度選択
  - モードによる選択肢制限

- [ ] `apps/web/src/features/report/roic-analysis/components/DepartmentTree.tsx` 作成
  - 部門ツリー表示
  - 単独/配下集約切替
  - （CVPと共通パターン）

- [ ] `apps/web/src/features/report/roic-analysis/components/RoicKpiCards.tsx` 作成
  - 11指標のカード表示
  - 3ティア構成
  - 元値/シミュ後/Compare表示

- [ ] `apps/web/src/features/report/roic-analysis/components/RoicVsWaccChart.tsx` 作成
  - ROIC vs WACC折れ線グラフ
  - 単一点時のバレットチャート
  - シミュ後/元値/Compare表示

- [ ] `apps/web/src/features/report/roic-analysis/components/RoicDecompositionBar.tsx` 作成
  - NOPAT率 × 資本回転率 分解バー
  - 元値/シミュ後並列表示

- [ ] `apps/web/src/features/report/roic-analysis/components/RoicTree.tsx` 作成
  - ROICツリー表示
  - 編集可能セル
  - 調整差分行自動生成
  - 変更行ハイライト
  - 全体リセットボタン

- [ ] `apps/web/src/features/report/roic-analysis/components/SimpleInputPanel.tsx` 作成
  - スライドインパネル
  - 営業資産/営業負債ツリー
  - 上期/下期入力
  - 保存ボタン

- [ ] `apps/web/src/features/report/roic-analysis/components/WarningBanner.tsx` 作成
  - BS実績代替警告
  - 固定表示（閉じない）

- [ ] `apps/web/src/features/report/roic-analysis/components/ConfigErrorBlock.tsx` 作成
  - ROIC設定未完了メッセージ
  - 画面ブロック表示

### Task 2.7: Error Messages
_Requirements: Req9_

- [ ] `apps/web/src/features/report/roic-analysis/lib/error-messages.ts` 作成
  - RoicAnalysisErrorCode → 日本語メッセージ

### Task 2.8: Page Entry
- [ ] `apps/web/src/app/report/roic-analysis/page.tsx` 作成
- [ ] `apps/web/src/shared/navigation/menu.ts` にメニュー登録

### Task 2.9: Structure Guard 実行
- [ ] `npx tsx scripts/structure-guards.ts` 実行
- [ ] 違反があれば修正:
  - UI → Domain API 直接呼び出し禁止
  - contracts/api 参照禁止
  - 生カラーリテラル禁止
  - layout.tsx 禁止

---

## Phase 3: Backend（Domain API / BFF）— Deferred

**Note**: 基盤テーブル実装後に着手。

### Task 3.1: Prisma Schema 確認・更新
_Requirements: Req3, Req4_

- [ ] `packages/db/prisma/schema.prisma` 確認
  - Company.roicPlLayoutId 存在確認
  - Company.roicBsLayoutId 存在確認
  - Company.roicEbitSubjectId 存在確認
  - Company.roicOperatingAssetsSubjectId 存在確認
  - Company.roicOperatingLiabilitiesSubjectId 存在確認
  - Company.effectiveTaxRate 存在確認
  - Company.waccRate 存在確認
  - Company.revenueSubjectId 存在確認
- [ ] 不足があれば追加
- [ ] `npx prisma generate`

### Task 3.2: Migration 実行（必要な場合）
- [ ] 変更がある場合のみ migration 作成

### Task 3.3: API Contracts
- [ ] `packages/contracts/src/api/roic-analysis/index.ts` 作成

### Task 3.4: Repository 実装
_Requirements: Req5_

(P) 以下は並列実装可能:

- [ ] `apps/api/src/modules/reporting/roic-analysis/repositories/fact-amount.repository.ts`
  - PL/BSデータ取得
  - 月末残高取得

- [ ] `apps/api/src/modules/reporting/roic-analysis/repositories/plan-event.repository.ts`
  - イベント/バージョン取得
  - 簡易入力用固定イベント管理

- [ ] `apps/api/src/modules/reporting/roic-analysis/repositories/layout.repository.ts`
  - ROIC用PL/BSレイアウト取得

### Task 3.5: Service 実装
_Requirements: Req3, Req4, Req5_

- [ ] `apps/api/src/modules/reporting/roic-analysis/services/mode-determination.service.ts`
  - 標準/簡易モード判定

- [ ] `apps/api/src/modules/reporting/roic-analysis/services/data-synthesis.service.ts`
  - PL/BSデータ合成
  - 平均投下資本計算
  - BS予算/見込の実績代替

- [ ] `apps/api/src/modules/reporting/roic-analysis/services/simple-input.service.ts`
  - 簡易入力データ取得
  - 固定イベント/バージョン自動生成
  - fact_amounts保存

### Task 3.6: Controller 実装
- [ ] `apps/api/src/modules/reporting/roic-analysis/roic-analysis.controller.ts`
  - GET /api/roic-analysis/options
  - POST /api/roic-analysis/data
  - GET /api/roic-analysis/simple-input
  - POST /api/roic-analysis/simple-input

### Task 3.7: Module 登録
- [ ] `apps/api/src/modules/reporting/roic-analysis/roic-analysis.module.ts` 作成
- [ ] `apps/api/src/app.module.ts` に import 追加

### Task 3.8: BFF実装
- [ ] `apps/bff/src/modules/reporting/roic-analysis/roic-analysis.service.ts`
- [ ] `apps/bff/src/modules/reporting/roic-analysis/roic-analysis.controller.ts`
- [ ] `apps/bff/src/modules/reporting/roic-analysis/mappers/roic.mapper.ts`
- [ ] `apps/bff/src/modules/reporting/roic-analysis/roic-analysis.module.ts`
- [ ] `apps/bff/src/app.module.ts` に import 追加

---

## Phase 4: HttpBffClient 切替 — Deferred

### Task 4.1: HttpBffClient 実装
- [ ] `apps/web/src/features/report/roic-analysis/api/HttpBffClient.ts` 作成

### Task 4.2: Client 切替
- [ ] MockBffClient → HttpBffClient に切替
- [ ] 実BFF接続確認

---

## Phase 5: 統合テスト — Deferred

### Task 5.1: E2E 動作確認
_Requirements: 全Req_

- [ ] 標準モード確認
  - フィルター選択（予算/見込/実績）
  - 全粒度（月次/四半期/半期/年度）
  - 部門選択（単独/配下集約）
  - KPIカード11指標表示
  - ROICツリー編集・シミュレーション
  - ROIC vs WACCグラフ
  - ROIC分解バー
  - 全体リセット

- [ ] 簡易モード確認
  - フィルター制限（実績のみ、半期/通期のみ）
  - 簡易入力パネル表示
  - 営業資産/営業負債入力
  - 保存処理

- [ ] エラー表示確認
  - ROIC設定未完了時のブロック
  - データ不足時のメッセージ
  - BS実績代替時の警告バナー

### Task 5.2: 権限確認
- [ ] ロール権限による閲覧可否確認
- [ ] 部門可視範囲制御確認

### Task 5.3: パフォーマンス確認
- [ ] 標準モード：月末残高平均計算の応答時間
- [ ] 大量部門配下集約時の表示速度

---

## 完了条件

- [x] Phase 1 完了（BFF Contracts）
- [ ] Phase 2 完了（UI-MOCK）
- [ ] Structure Guard 違反なし
- [ ] (Deferred) Phase 3〜5 完了

---

## 変更履歴

| 日付 | 変更内容 | 担当 |
|------|---------|------|
| 2026-01-27 | 初版作成 | Claude Code |
| 2026-01-27 | Phase 1 BFF Contracts 完了 | Claude Code |
