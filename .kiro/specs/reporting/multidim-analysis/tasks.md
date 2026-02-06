# Implementation Plan

> CCSDD / SDD 前提：**contracts-first**（bff → api → shared）を最優先し、境界違反を guard で止める。
> UI は最後。v0 は **Phase 1（統制テスト）→ Phase 2（本実装）** の二段階で扱う。

---

## 0. Design Completeness Gate（Blocking）

> Implementation MUST NOT start until all items below are checked.

- [x] 0.1 Designの「BFF Specification（apps/bff）」が埋まっている
  - BFF endpoints（UIが叩く）が記載されている
  - Request/Response DTO（packages/contracts/src/bff）が列挙されている
  - Paging/Sorting正規化が明記されている
  - 変換（api DTO → bff DTO）の方針が記載されている
  - エラー整形方針（Pass-through）が記載されている
  - tenant_id/user_id の取り回しが記載されている

- [x] 0.2 Designの「Service Specification（Domain / apps/api）」が埋まっている
  - Service Methods が列挙されている
  - Business Rules（DimX相互排他等）が記載されている
  - Transaction Boundary（読み取り専用）が記載されている
  - Audit Points が記載されている

- [x] 0.3 Designの「Repository Specification（apps/api）」が埋まっている
  - 取得メソッド一覧が記載されている（tenant_id必須）
  - where句二重ガードの方針が記載されている
  - RLS前提が記載されている

- [x] 0.4 Designの「Contracts Summary（This Feature）」が埋まっている
  - packages/contracts/src/bff 側の追加DTOが列挙されている
  - packages/contracts/src/api 側の追加DTOが列挙されている
  - Enum / Error の配置ルールが明記されている
  - 「UIは packages/contracts/src/api を参照しない」ルールが明記されている

- [x] 0.5 Requirements Traceability が更新されている
  - 主要Requirementが設計要素に紐づいている

- [ ] 0.6 v0生成物の受入・移植ルールが確認されている
  - v0生成物は参照のみ（直接移植しない）
  - AG Grid Enterprise Pivot ベースで再実装する

- [ ] 0.7 Structure / Boundary Guard がパスしている
  - Contracts作成後に実行する

---

## 1. Contracts（BFF/API DTO定義）

- [ ] 1. Shared Enums / Errors 定義
- [ ] 1.1 (P) 多次元分析用 Enum を定義する
  - AnalysisMode（standard / project）を定義
  - UnitType（yen / thousand / million）を定義
  - ScenarioType（BUDGET / FORECAST / ACTUAL）を定義
  - 配置先: `packages/contracts/src/shared/enums/multidim-analysis.ts`
  - _Requirements: 2.2, 2.4, 4.1, 4.2_

- [ ] 1.2 (P) 多次元分析用 Error Code を定義する
  - MultidimErrorCode を定義（INVALID_LAYOUT, DIMX_CONFLICT, MODE_CONFLICT 等）
  - 配置先: `packages/contracts/src/shared/errors/multidim-analysis.ts`
  - _Requirements: 1.5, 4.3, 4.4, 5.1, 10.4_

- [ ] 2. BFF Contracts 定義
- [ ] 2.1 フィールド定義 DTO を作成する
  - BffFieldDef（id, name, nameJa, category, allowedZones）を定義
  - BffMeasureDef（id, name, nameJa, format）を定義
  - BffFieldListDto を定義
  - 配置先: `packages/contracts/src/bff/multidim-analysis/index.ts`
  - _Requirements: 1.7_

- [ ] 2.2 ピボットクエリ DTO を作成する
  - BffPivotLayoutDto（mode, rows, cols, values, filters）を定義
  - BffPivotQueryRequestDto を定義
  - BffPivotQueryResponseDto（rowHeaders, colHeaders, cells, meta）を定義
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.6, 3.7_

- [ ] 2.3 ドリルダウン DTO を作成する
  - BffDrillConditionsDto を定義
  - BffDrilldownRequestDto（conditions, drillDimension, topN）を定義
  - BffDrilldownItemDto（label, value, percentage）を定義
  - BffDrilldownResponseDto を定義
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 2.4 ドリルスルー DTO を作成する
  - BffDrillthroughRequestDto（conditions, page, pageSize）を定義
  - BffDrillthroughItemDto を定義
  - BffDrillthroughResponseDto（items, total, page, pageSize, totalPages）を定義
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 2.5 プリセット DTO を作成する
  - BffLayoutPresetDto（id, name, nameJa, description, layout）を定義
  - BffPresetListDto を定義
  - _Requirements: 8.1, 8.2, 8.3_

- [ ] 3. API Contracts 定義
- [ ] 3.1 (P) API 側 DTO を作成する
  - ApiPivotQueryRequestDto（offset/limit 使用）を定義
  - ApiPivotQueryResponseDto を定義
  - ApiDrilldownRequestDto / ApiDrilldownResponseDto を定義
  - ApiDrillthroughRequestDto（offset/limit 使用）/ ApiDrillthroughResponseDto を定義
  - 配置先: `packages/contracts/src/api/multidim-analysis/index.ts`
  - _Requirements: 3.1, 6.1, 7.1_

- [ ] 4. Contracts 再エクスポート設定
- [ ] 4.1 Contracts index ファイルを更新する
  - `packages/contracts/src/bff/index.ts` に multidim-analysis を追加
  - `packages/contracts/src/api/index.ts` に multidim-analysis を追加
  - `packages/contracts/src/shared/enums/index.ts` に multidim-analysis を追加
  - _Requirements: -_

---

## 2. Domain API（apps/api）

- [ ] 5. Repository 実装
- [ ] 5.1 MultidimRepository を作成する
  - findFactsForPivot メソッドを実装（tenant_id 必須）
  - ピボット集計SQL生成ロジックを実装
  - RLS 適用（set_config 前提）
  - where句二重ガード（tenant_id）
  - _Requirements: 3.1, 10.2, 10.3_

- [ ] 5.2 ドリルダウン/ドリルスルー クエリを実装する
  - findDrilldownData メソッドを実装（Top N 対応）
  - findDrillthroughData メソッドを実装（offset/limit 対応）
  - _Requirements: 6.2, 6.4, 7.1, 7.3, 7.4, 7.5_

- [ ] 6. PivotAggregationAdapter 実装
- [ ] 6.1 ピボット集計アダプターを作成する
  - fact_amounts と fact_dimension_links を結合した集計クエリを生成
  - dimension_values からグループ情報を取得
  - パフォーマンス最適化（インデックス利用）
  - _Requirements: 3.1, 3.6, 3.7, 3.8_

- [ ] 7. Service 実装
- [ ] 7.1 MultidimService を作成する
  - getAvailableFields メソッドを実装
  - executePivotQuery メソッドを実装
  - executeDrilldown メソッドを実装
  - executeDrillthrough メソッドを実装
  - getPresets メソッドを実装（システム定義プリセット）
  - _Requirements: 1.7, 3.1, 6.2, 7.1, 8.2_

- [ ] 7.2 ビジネスルールバリデーションを実装する
  - DimX相互排他ルールバリデーション
  - 分析モード制約バリデーション（standard/project）
  - 行軸最大2つ制約バリデーション
  - _Requirements: 1.5, 4.3, 4.4, 5.1, 5.3_

- [ ] 7.3 監査ログ記録を実装する
  - ピボットクエリ実行時のログ記録
  - tenant_id, user_id, 実行時刻, クエリ条件をログ出力
  - _Requirements: 10.2_

- [ ] 8. Controller 実装
- [ ] 8.1 MultidimController を作成する
  - GET /api/reporting/multidim/fields エンドポイントを実装
  - POST /api/reporting/multidim/query エンドポイントを実装
  - POST /api/reporting/multidim/drilldown エンドポイントを実装
  - POST /api/reporting/multidim/drillthrough エンドポイントを実装
  - GET /api/reporting/multidim/presets エンドポイントを実装
  - _Requirements: 1.7, 3.1, 6.2, 7.1, 8.2_

- [ ] 8.2 権限チェックを実装する
  - `epm.multidim.read` 権限の検証
  - 権限不足時の 403 エラー返却
  - _Requirements: 10.1, 10.4_

- [ ] 9. Module 登録
- [ ] 9.1 MultidimModule を作成し登録する
  - Controller, Service, Repository をモジュールに登録
  - ReportingModule に MultidimModule をインポート
  - _Requirements: -_

---

## 3. BFF（apps/bff）

- [ ] 10. Mapper 実装
- [ ] 10.1 MultidimMapper を作成する
  - API DTO → BFF DTO の変換ロジックを実装
  - page/pageSize → offset/limit 変換を実装
  - offset/limit → page/pageSize/totalPages 逆変換を実装
  - _Requirements: 7.3, 7.5_

- [ ] 11. BFF Service 実装
- [ ] 11.1 MultidimBffService を作成する
  - Domain API 呼び出しとレスポンス変換を実装
  - page/pageSize のデフォルト値適用（page=1, pageSize=50）
  - pageSize の clamp 処理（max 200）
  - _Requirements: 7.3_

- [ ] 12. BFF Controller 実装
- [ ] 12.1 MultidimBffController を作成する
  - GET /api/bff/reporting/multidim/fields エンドポイントを実装
  - POST /api/bff/reporting/multidim/query エンドポイントを実装
  - POST /api/bff/reporting/multidim/drilldown エンドポイントを実装
  - POST /api/bff/reporting/multidim/drillthrough エンドポイントを実装
  - GET /api/bff/reporting/multidim/presets エンドポイントを実装
  - tenant_id/user_id を認証情報から解決
  - _Requirements: 1.7, 3.1, 6.2, 7.1, 8.2, 10.2_

- [ ] 13. BFF Module 登録
- [ ] 13.1 MultidimBffModule を作成し登録する
  - Controller, Service, Mapper をモジュールに登録
  - ReportingBffModule に MultidimBffModule をインポート
  - _Requirements: -_

---

## 4. UI-MOCK（apps/web）

- [ ] 14. BffClient インターフェース・Mock 実装
- [ ] 14.1 MultidimBffClient インターフェースを作成する
  - getFields, executePivotQuery, executeDrilldown, executeDrillthrough, getPresets メソッドを定義
  - 配置先: `apps/web/src/features/reporting/multidim-analysis/api/BffClient.ts`
  - _Requirements: 1.7, 3.1, 6.2, 7.1, 8.2_

- [ ] 14.2 MockBffClient を作成する
  - モックデータでBffClient インターフェースを実装
  - フィールド定義のモックデータを作成
  - ピボット集計結果のモックデータを作成
  - ドリルダウン/ドリルスルーのモックデータを作成
  - プリセットのモックデータを作成
  - _Requirements: 1.7, 3.1, 6.2, 7.1, 8.2_

- [ ] 15. pivot-store（Zustand）実装
- [ ] 15.1 pivot-store を作成する
  - レイアウト状態（mode, rows, cols, values, filters）を管理
  - グローバルフィルター状態（periodFrom, periodTo, scenarioType, unit）を管理
  - UI状態（selectedCell, isLoading, error）を管理
  - persist middleware でローカルストレージ永続化
  - 配置先: `apps/web/src/features/reporting/multidim-analysis/store/pivot-store.ts`
  - _Requirements: 1.6, 2.5, 2.6, 2.7_

- [ ] 15.2 レイアウト操作アクションを実装する
  - addFieldToZone アクション（DimX相互排他ルール付き）
  - removeFieldFromZone アクション
  - reorderFieldsInZone アクション
  - setMode アクション（モード切替時の無効フィールド除去）
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 4.5, 5.1, 5.2, 5.3_

- [ ] 15.3 URL共有機能を実装する
  - getLayoutForUrl アクション（Base64エンコード）
  - loadLayoutFromUrl アクション（Base64デコード）
  - resetLayout アクション
  - _Requirements: 9.1, 9.2, 9.3_

- [ ] 16. UIコンポーネント実装
- [ ] 16.1 FieldPalette コンポーネントを作成する
  - 利用可能フィールドを一覧表示
  - dnd-kit でドラッグ可能にする
  - フィールドカテゴリ（basic/dimx/option）でグループ化
  - 日本語名を表示
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.7_

- [ ] 16.2 PivotDropZones コンポーネントを作成する
  - 行ゾーン、列ゾーン、値ゾーン、フィルターゾーンを作成
  - dnd-kit でドロップ可能にする
  - 配置されたフィールドを表示
  - ドロップ時のバリデーションエラー表示
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 16.3 GlobalFilterBar コンポーネントを作成する
  - 期間範囲（From/To）セレクターを作成
  - シナリオ（BUDGET/FORECAST/ACTUAL）セレクターを作成
  - 表示単位（円/千円/百万円）セレクターを作成
  - デフォルト値の適用
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

- [ ] 16.4 PivotResultGrid コンポーネントを作成する
  - AG Grid Enterprise Pivot の設定と描画
  - 行ヘッダー・列ヘッダーの階層表示
  - 数値フォーマット（3桁カンマ区切り）
  - 小計・総計の自動計算表示
  - ローディングインジケーター
  - 空データ時のメッセージ表示
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [ ] 16.5 DrillPanel コンポーネントを作成する
  - 選択セル情報の表示
  - ドリルダウンディメンション選択UI
  - ドリルダウン結果表示（金額・構成比率）
  - ドリルスルー結果表示（明細テーブル）
  - ページング操作
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 16.6 PresetSelector コンポーネントを作成する
  - プリセット一覧表示
  - プリセット選択でレイアウト適用
  - リセットボタン
  - _Requirements: 8.1, 8.2, 8.3_

- [ ] 17. メインページ実装
- [ ] 17.1 MultidimAnalysisPage を作成する
  - FieldPalette, PivotDropZones, GlobalFilterBar, PivotResultGrid, DrillPanel, PresetSelector を統合
  - 3カラムレイアウト（左:フィールドパレット、中央:グリッド、右:ドリルパネル）
  - URL共有ボタンの配置
  - URLパラメータからのレイアウト復元
  - _Requirements: 1.1, 2.1, 3.1, 6.1, 7.1, 8.1, 9.1, 9.2_

- [ ] 17.2 ルーティングを設定する
  - `/reporting/multidim-analysis` ルートを追加
  - ナビゲーションメニューに追加
  - _Requirements: -_

---

## 5. UI-BFF統合（HttpBffClient）

- [ ] 18. HttpBffClient 実装
- [ ] 18.1 HttpBffClient を作成する
  - BffClient インターフェースの HTTP 実装
  - BFF エンドポイントへの fetch 呼び出し
  - エラーハンドリング
  - _Requirements: 1.7, 3.1, 6.2, 7.1, 8.2_

- [ ] 18.2 Mock から Http への切り替えを実装する
  - 環境変数による Mock/Http 切り替え
  - client.ts でのエクスポート設定
  - _Requirements: -_

- [ ] 19. TanStack Query hooks 実装
- [ ] 19.1 use-pivot-query フックを作成する
  - ピボットクエリの TanStack Query 実装
  - キャッシュ設定
  - エラーハンドリング
  - _Requirements: 3.1, 3.4, 3.5_

- [ ] 19.2 use-drilldown, use-drillthrough フックを作成する
  - ドリルダウン/ドリルスルーの TanStack Query 実装
  - _Requirements: 6.2, 7.1_

---

## 6. テスト・検証

- [ ] 20. ユニットテスト
- [ ] 20.1 pivot-store のユニットテストを作成する
  - レイアウト操作のテスト
  - DimX相互排他ルールのテスト
  - 分析モード切替のテスト
  - URL エンコード/デコードのテスト
  - _Requirements: 1.5, 4.5, 5.1, 9.1, 9.2, 9.3_

- [ ] 20.2 MultidimService のユニットテストを作成する
  - バリデーションロジックのテスト
  - _Requirements: 1.5, 4.3, 4.4, 5.1_

- [ ] 21. 統合テスト
- [ ] 21.1 BFF → API → DB の統合テストを作成する
  - ピボットクエリの E2E テスト
  - RLS によるテナント分離テスト
  - _Requirements: 10.2, 10.3_

- [ ] 22. Structure Guards 実行
- [ ] 22.1 境界違反チェックを実行する
  - `npx tsx scripts/structure-guards.ts` を実行
  - UI → Domain API 直接呼び出しがないことを確認
  - UI での直接 fetch がないことを確認
  - _Requirements: -_

---

## Requirements Coverage Summary

| Req | Description | Tasks |
|-----|-------------|-------|
| 1.1 | 行ゾーンへのフィールド追加 | 2.2, 15.2, 16.1, 16.2 |
| 1.2 | 列ゾーンへのフィールド追加 | 2.2, 15.2, 16.1, 16.2 |
| 1.3 | 値ゾーンへのフィールド追加 | 2.2, 15.2, 16.1, 16.2 |
| 1.4 | フィルターゾーンへのフィールド追加 | 2.2, 15.2, 16.1, 16.2 |
| 1.5 | 行軸最大2つ制約 | 1.2, 7.2, 15.2, 16.2, 20.1, 20.2 |
| 1.6 | レイアウト状態の永続化 | 15.1 |
| 1.7 | フィールド日本語表示 | 2.1, 7.1, 8.1, 12.1, 14.1, 14.2, 16.1 |
| 2.1 | 期間範囲変更 | 2.2, 16.3 |
| 2.2 | シナリオ変更 | 1.1, 2.2, 16.3 |
| 2.3 | バージョン変更 | 2.2, 16.3 |
| 2.4 | 表示単位変更 | 1.1, 2.2, 16.3 |
| 2.5 | デフォルト期間 | 15.1, 16.3 |
| 2.6 | デフォルトシナリオ | 15.1, 16.3 |
| 2.7 | デフォルト表示単位 | 15.1, 16.3 |
| 3.1 | AG Grid Pivot 描画 | 2.2, 3.1, 5.1, 6.1, 7.1, 8.1, 12.1, 14.1, 14.2, 16.4, 18.1, 19.1 |
| 3.2 | 階層的ヘッダー表示 | 2.2, 16.4 |
| 3.3 | カンマ区切りフォーマット | 2.2, 16.4 |
| 3.4 | ローディングインジケーター | 16.4, 19.1 |
| 3.5 | 空データメッセージ | 16.4, 19.1 |
| 3.6 | 行小計・総計 | 2.2, 6.1, 16.4 |
| 3.7 | 列小計・総計 | 2.2, 6.1, 16.4 |
| 3.8 | SSRM ページング | 6.1 |
| 4.1 | 標準分析モード | 1.1 |
| 4.2 | プロジェクト分析モード | 1.1 |
| 4.3 | 標準モードでのPJ制限 | 1.2, 7.2, 20.2 |
| 4.4 | PJモードでのDimX制限 | 1.2, 7.2, 20.2 |
| 4.5 | モード切替時のフィールド除去 | 15.2, 20.1 |
| 5.1 | DimX相互排他ルール | 1.2, 7.2, 15.2, 20.1, 20.2 |
| 5.2 | 同一DimXの移動 | 15.2 |
| 5.3 | DimX相互排他の全ゾーン適用 | 7.2, 15.2 |
| 6.1 | セルクリック時の情報表示 | 16.5 |
| 6.2 | ドリルダウン実行 | 2.3, 5.2, 7.1, 8.1, 12.1, 14.1, 14.2, 16.5, 18.1, 19.2 |
| 6.3 | ドリルダウン結果表示 | 2.3, 16.5 |
| 6.4 | Top N 制限 | 2.3, 5.2 |
| 6.5 | ドリルダウン再帰実行 | 16.5 |
| 7.1 | ドリルスルー実行 | 2.4, 3.1, 5.2, 7.1, 8.1, 12.1, 14.1, 14.2, 16.5, 18.1, 19.2 |
| 7.2 | ドリルスルー結果表示 | 2.4, 16.5 |
| 7.3 | ドリルスルーページング | 2.4, 5.2, 10.1, 11.1, 16.5 |
| 7.4 | ページング操作 | 2.4, 5.2, 16.5 |
| 7.5 | 総件数表示 | 2.4, 5.2, 10.1, 16.5 |
| 8.1 | プリセット選択 | 2.5, 16.6, 17.1 |
| 8.2 | システム定義プリセット | 2.5, 7.1, 8.1, 12.1, 14.1, 14.2, 16.6, 18.1 |
| 8.3 | レイアウトリセット | 2.5, 16.6 |
| 9.1 | URLコピー | 15.3, 17.1, 20.1 |
| 9.2 | URLからのレイアウト復元 | 15.3, 17.1, 20.1 |
| 9.3 | 不正URL時のフォールバック | 15.3, 20.1 |
| 10.1 | 権限チェック | 8.2 |
| 10.2 | tenant_id 含有 | 5.1, 7.3, 12.1, 21.1 |
| 10.3 | RLS 二重防御 | 5.1, 21.1 |
| 10.4 | 403エラー | 1.2, 8.2 |

---

## 変更履歴

| 日付 | 変更内容 | 担当 |
|------|---------|------|
| 2026-02-05 | 初版作成 | Claude Code |
