# Implementation Plan

> CCSDD / SDD 前提：**contracts-first**（bff → api → shared）を最優先し、境界違反を guard で止める。
> UI は最後。v0 は **Phase 1（統制テスト）→ Phase 2（本実装）** の二段階で扱う。
>
> **本機能はUI-MOCK先行アプローチ**：基盤テーブル（fact_amounts等）未実装のため、Phase 1でContracts + MockBffClient + UIを先行実装。Phase 2（Backend実装）は基盤テーブル実装後に実施。

---

## 0. Design Completeness Gate（Blocking）

> Implementation MUST NOT start until all items below are checked.
> These checks are used to prevent "empty design sections" from being silently interpreted by implementers/AI.

- [x] 0.1 Designの「BFF Specification（apps/bff）」が埋まっている
  - BFF endpoints（UIが叩く）が記載されている: GET /api/bff/cvp-analysis/options, POST /api/bff/cvp-analysis/data
  - Request/Response DTO（packages/contracts/src/bff）が列挙されている
  - **Paging/Sorting正規化**: 本機能はリスト画面ではないため不使用（明記済み）
  - 変換（api DTO → bff DTO）の方針が記載されている
  - エラー整形方針（Pass-through）が記載されている
  - tenant_id/user_id の取り回し（解決・伝搬ルール）が記載されている

- [x] 0.2 Designの「Service Specification（Domain / apps/api）」が埋まっている
  - 主要責務（概要）が記載されている: データ取得、データ合成、権限・可視範囲適用
  - **Phase 2で詳細化**（UI-MOCK先行のため）と明記されている

- [x] 0.3 Designの「Repository Specification（apps/api）」が埋まっている
  - tenant_id必須、where句二重ガード、RLS前提が記載されている
  - **Phase 2で詳細化**（UI-MOCK先行のため）と明記されている

- [x] 0.4 Designの「Contracts Summary（This Feature）」が埋まっている
  - packages/contracts/src/bff/cvp-analysis 側の追加DTOが列挙されている
  - Enum（CvpPrimaryType, CvpGranularity, CvpLineType）が定義されている
  - Error Codes（CvpAnalysisErrorCode）が定義されている
  - 「UIは packages/contracts/src/api を参照しない」ルールが明記されている

- [x] 0.5 Requirements Traceability が更新されている
  - 全7要件がTraceability Matrixで設計要素に紐づいている

- [x] 0.6 v0生成物の受入・移植ルールが確認されている
  - v0生成物は `apps/web/_v0_drop/reports/cvp-analysis/src` に一次格納
  - layout.tsx 生成禁止が確認されている
  - UIは MockBffClient で動作確認される

- [ ] 0.7 Structure / Boundary Guard がパスしている
  - UI → Domain API の直接呼び出しが存在しない
  - UIでの直接 fetch() が存在しない
  - **Phase 1完了後に実行**

---

## Phase 1: UI-MOCK（Contracts + MockBffClient + UI）

### 1. Contracts 定義

- [ ] 1.1 (P) BFF Contracts エントリファイルを作成する
  - `packages/contracts/src/bff/cvp-analysis/index.ts` を作成
  - Enum定義（CvpPrimaryType, CvpGranularity, CvpLineType）を実装
  - Error Codes定義（CvpAnalysisErrorCode）を実装
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 1.2 (P) Options Request/Response DTO を定義する
  - BffCvpOptionsRequest（companyId）を実装
  - BffCvpFiscalYearOption, BffCvpEventOption, BffCvpVersionOption を実装
  - BffCvpDepartmentNode（ツリー構造）を実装
  - BffCvpOptionsResponse を実装
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 1.3 (P) Data Request/Response DTO を定義する
  - BffCvpDataRequest（フィルター条件）を実装
  - BffCvpKpiItem（8指標のKPIカード）を実装
  - BffCvpTreeLine（CVPツリー行）を実装
  - BffCvpBreakevenChartData, BffCvpWaterfallData を実装
  - BffCvpDataResponse を実装
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 5.11, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9_

- [ ] 1.4 Contracts エクスポートを設定する
  - `packages/contracts/src/bff/index.ts` に cvp-analysis を追加
  - TypeScript コンパイル確認
  - _Requirements: 全要件_

---

### 2. UI 実装（Phase 1: v0 統制テスト）

- [ ] 2.1 BffClient インターフェースを定義する
  - `apps/web/src/features/report/cvp-analysis/api/BffClient.ts` を作成
  - getOptions, getData メソッドを定義
  - _Requirements: 全要件_

- [ ] 2.2 MockBffClient を実装する
  - `apps/web/src/features/report/cvp-analysis/api/MockBffClient.ts` を作成
  - getOptions: 年度・イベント・バージョン・部門のモックデータ
  - getData: KPI・CVPツリー・チャートデータのモック
  - 8指標のKPIモックデータ（売上、変動費、限界利益、限界利益率、固定費、損益分岐売上、安全余裕額、安全余裕率）
  - CVPツリーのモックデータ（header/account/adjustment行）
  - 損益分岐チャート・ウォーターフォールのモックデータ
  - _Requirements: 全要件_

- [ ] 2.3 CVP計算ロジックを実装する
  - `apps/web/src/features/report/cvp-analysis/lib/cvp-calculator.ts` を作成
  - 限界利益 = 売上 − 変動費
  - 限界利益率 = 限界利益 / 売上
  - 損益分岐売上 = 固定費 / 限界利益率
  - 安全余裕額 = 売上 − 損益分岐売上
  - 安全余裕率 = 安全余裕額 / 売上
  - 売上=0 または 限界利益率=0 の場合のエッジケース処理
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [ ] 2.4 ツリー操作ユーティリティを実装する
  - `apps/web/src/features/report/cvp-analysis/lib/tree-utils.ts` を作成
  - 調整差分行の計算（集計値 − 配下合計）
  - 親科目の再計算（配下 + 調整差分）
  - 変更検出（元値とシミュ後の比較）
  - _Requirements: 5.5, 5.6, 5.7, 5.8_

- [ ] 2.5 シミュレーション状態管理フックを実装する
  - `apps/web/src/features/report/cvp-analysis/hooks/useCvpSimulation.ts` を作成
  - シミュレーション値のReact state管理
  - 行編集時のKPI再計算
  - 全体リセット機能
  - 変更行追跡
  - _Requirements: 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 5.11_

- [ ] 2.6 (P) v0 Prompt を作成する
  - `apps/web/_v0_drop/reports/cvp-analysis/PROMPT.md` を作成
  - 画面レイアウト仕様（フィルター、部門ツリー、KPIカード、グラフ、CVPツリー）
  - コンポーネント構成指示
  - デザインシステム準拠指示
  - _Requirements: 全要件_

- [ ] 2.7 v0 を使用して UI を生成する
  - フィルターコンポーネント（年度/Primary/Compare/期間/粒度）
  - 部門ツリーコンポーネント（単独/配下集約切替）
  - KPIカードコンポーネント（8指標）
  - 損益分岐チャートコンポーネント
  - ウォーターフォールチャートコンポーネント
  - CVPツリーコンポーネント（編集可能、調整差分行自動生成）
  - _Requirements: 1.1〜6.9_

- [ ] 2.8 v0 生成物を隔離ゾーンに配置する
  - `apps/web/_v0_drop/reports/cvp-analysis/src` に配置
  - `OUTPUT.md` に生成メモを記録
  - layout.tsx が存在しないことを確認
  - _Requirements: 全要件_

- [ ] 2.9 features ディレクトリにコンポーネントを移植する
  - `apps/web/src/features/report/cvp-analysis/` にコンポーネントを移植
  - import パス修正（@/shared/ui を使用）
  - DTO import 修正（@epm/contracts/bff/cvp-analysis を使用）
  - _Requirements: 全要件_

- [ ] 2.10 ダッシュボードコンポーネントを統合する
  - `CvpDashboard.tsx` でフィルター・部門ツリー・KPIカード・グラフ・CVPツリーを統合
  - useCvpSimulation でシミュレーション状態を管理
  - フィルター変更時のデータ再取得
  - _Requirements: 全要件_

- [ ] 2.11 App Router・Navigation を登録する
  - `apps/web/src/app/reports/cvp-analysis/page.tsx` を作成
  - `apps/web/src/shared/navigation/menu.ts` に追加
  - _Requirements: 7.1_

---

### 3. 検証（Phase 1）

- [ ] 3.1 Structure Guard を実行する
  - `npx tsx scripts/structure-guards.ts` を実行
  - UI → Domain API 直接呼び出しがないことを確認
  - packages/contracts/src/api への参照がないことを確認
  - 直接 fetch() がないことを確認
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 3.2 TypeScript コンパイルを確認する
  - `pnpm build:web` が成功する
  - Contracts の型エラーがない
  - _Requirements: 全要件_

- [ ] 3.3 MockBffClient での動作確認を行う
  - フィルター選択が動作する
  - 部門ツリー選択が動作する
  - KPIカードが表示される
  - CVPツリーが表示される
  - シミュレーション編集が動作する
  - 全体リセットが動作する
  - グラフが表示される
  - _Requirements: 全要件_

---

## Phase 2: Backend 実装（基盤テーブル実装後に実施）

> **NOTE**: 以下のタスクは基盤テーブル（fact_amounts, plan_events, plan_versions, accounting_periods, report_layouts, report_layout_lines 等）がPrismaに実装された後に実施する。

### 4. Domain API 実装

- [ ] 4.1 CvpAnalysis Repository を実装する
  - findOptions（年度・イベント・バージョン・部門の選択肢取得）
  - findFactAmounts（fact_amountsからのデータ取得）
  - findReportLayout（CVPレイアウト取得）
  - findAccountingPeriods（会計期間・締め状態取得）
  - 全メソッドで tenant_id を第一引数として必須化
  - _Requirements: 1.1〜3.7_

- [ ] 4.2 CvpAnalysis Service を実装する
  - データ合成（予算/見込/実績）
  - 見込 = HARD_CLOSEDなら実績、そうでなければ見込
  - KPI初期値計算
  - CVPツリー組み立て
  - チャートデータ生成
  - _Requirements: 3.1〜6.9_

- [ ] 4.3 Domain API Controller を実装する
  - OPTIONS エンドポイント（GET /api/reports/cvp-analysis/options）
  - DATA エンドポイント（POST /api/reports/cvp-analysis/data）
  - x-tenant-id / x-user-id ヘッダーから認証情報取得
  - RLS set_config 呼び出し
  - _Requirements: 7.1, 7.2_

- [ ] 4.4 Domain API Module を登録する
  - CvpAnalysisModule 作成
  - Controller, Service, Repository を providers/controllers に登録
  - PrismaModule をインポート
  - AppModule への登録
  - _Requirements: 全要件_

---

### 5. BFF 実装

- [ ] 5.1 Domain API Client を実装する
  - Domain API の各エンドポイントを呼び出すクライアント
  - x-tenant-id / x-user-id ヘッダー付与
  - エラーレスポンスのハンドリング（Pass-through）
  - _Requirements: 7.1, 7.2_

- [ ] 5.2 Response Mapper を実装する
  - API DTO → BFF DTO 変換
  - snake_case → camelCase 変換
  - Decimal(string) → number 変換
  - _Requirements: 3.1〜6.9_

- [ ] 5.3 BFF Service を実装する
  - getOptions: フィルター選択肢取得
  - getData: CVP分析データ取得（KPI・ツリー・チャート）
  - _Requirements: 全要件_

- [ ] 5.4 BFF Controller を実装する
  - OPTIONS エンドポイント（GET /api/bff/cvp-analysis/options）
  - DATA エンドポイント（POST /api/bff/cvp-analysis/data）
  - 認証ミドルウェアから tenant_id / user_id 取得
  - _Requirements: 7.1, 7.2_

- [ ] 5.5 BFF Module を登録する
  - CvpAnalysisModule 作成
  - Controller, Service, Mapper, DomainApiClient を登録
  - AppModule への登録
  - _Requirements: 全要件_

---

### 6. UI 実装（Phase 2: 本実装・BFF接続）

- [ ] 6.1 HttpBffClient を実装する
  - `apps/web/src/features/report/cvp-analysis/api/HttpBffClient.ts` を作成
  - getOptions: GET /api/bff/cvp-analysis/options
  - getData: POST /api/bff/cvp-analysis/data
  - エラーハンドリング（コードに基づく表示切替）
  - _Requirements: 全要件_

- [ ] 6.2 BffClient を HttpBffClient に切り替える
  - MockBffClient → HttpBffClient に切り替え
  - 実BFFとの接続確認
  - _Requirements: 全要件_

---

### 7. 統合テスト

- [ ] 7.1 フィルター機能の統合テストを実施する
  - 年度選択が動作する
  - Primary（予算/見込/実績）選択が動作する
  - Compare選択が動作する
  - 期間レンジ選択が動作する
  - 表示粒度選択が動作する
  - _Requirements: 1.1〜1.10_

- [ ] 7.2 部門ツリーの統合テストを実施する
  - 部門ツリー展開が動作する
  - 部門選択時にデータ更新される
  - 単独/配下集約切替が動作する
  - 可視範囲制限が適用される
  - _Requirements: 2.1〜2.5_

- [ ] 7.3 データ合成の統合テストを実施する
  - 予算データが正しく取得される
  - 見込データ（実績+見込合成）が正しく取得される
  - 実績データが正しく取得される
  - Compare適用が正しく動作する
  - _Requirements: 3.1〜3.7_

- [ ] 7.4 KPIカードの統合テストを実施する
  - 8指標が正しく表示される
  - シミュレーション後の値が主表示される
  - 元値・差分が併記される
  - Compare差分が正しく表示される
  - 売上=0時のエッジケースが正しく処理される
  - _Requirements: 4.1〜4.10_

- [ ] 7.5 CVPツリーの統合テストを実施する
  - CVPレイアウトに基づくツリーが表示される
  - account行の編集が動作する
  - 調整差分行が自動生成される
  - 親科目が再計算される
  - 変更行がハイライト表示される
  - 全体リセットが動作する
  - _Requirements: 5.1〜5.11_

- [ ] 7.6 グラフの統合テストを実施する
  - 損益分岐チャートが表示される
  - 損益分岐点が強調表示される
  - シミュ後/元値/Compareの線種が正しい
  - ウォーターフォールチャートが表示される
  - _Requirements: 6.1〜6.9_

- [ ] 7.7 エラーハンドリングの統合テストを実施する
  - CVPレイアウト未設定時にブロック表示される
  - 必須項目未選択時にメッセージ表示される
  - データ0件時にメッセージ表示される
  - FIXEDなしイベントが選択不可になる
  - _Requirements: 7.1〜7.4_

---

## Requirements Coverage

| Requirement | Task |
|-------------|------|
| 1.1〜1.10 フィルター選択 | 1.2, 2.2, 2.7, 2.10, 7.1 |
| 2.1〜2.5 部門ツリー | 1.2, 2.2, 2.7, 2.10, 7.2 |
| 3.1〜3.7 データ合成 | 1.3, 4.1, 4.2, 5.2, 5.3, 7.3 |
| 4.1〜4.10 KPIカード | 1.3, 2.2, 2.3, 2.5, 2.7, 2.10, 7.4 |
| 5.1〜5.11 CVPツリー編集 | 1.3, 2.2, 2.4, 2.5, 2.7, 2.10, 7.5 |
| 6.1〜6.9 グラフ表示 | 1.3, 2.2, 2.7, 2.10, 7.6 |
| 7.1〜7.4 エラーハンドリング | 1.1, 2.2, 2.10, 7.7 |

---

## Notes

- **UI-MOCK先行アプローチ**: Phase 1（Contracts + MockBffClient + UI）を先行実装。Phase 2（Backend）は基盤テーブル実装後。
- **Contracts-first** 順序を厳守：1（Contracts）→ 2（UI with Mock）→ 3（検証）→ 4/5（Backend、後日）→ 6/7（本接続・統合テスト）
- タスク 1.1〜1.3, 2.6 は並列実行可能（(P) マーカー付き）
- 本機能は照会専用のため、DB Migration / RLS追加タスクは不要（既存テーブル使用予定）
- シミュレーション計算はUI責務（保存なし、リロードでリセット）
- 変動費/固定費の分類基準はPhase 2設計時に確定（CVPレイアウトの行属性またはパターンで識別）
