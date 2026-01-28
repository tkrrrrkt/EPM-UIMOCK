# Implementation Plan

> CCSDD / SDD 前提：**contracts-first**（bff → api → shared）を最優先し、境界違反を guard で止める。
> UI は最後。v0 は **Phase 1（統制テスト）→ Phase 2（本実装）** の二段階で扱う。

---

## 0. Design Completeness Gate（Blocking）

> Implementation MUST NOT start until all items below are checked.

- [x] 0.1 Designの「BFF Specification（apps/bff）」が埋まっている
  - BFF endpoints（UIが叩く）が記載されている
  - Request/Response DTO（packages/contracts/src/bff）が列挙されている
  - **Paging/Sorting正規化（必須）が明記されている**
  - 変換（api DTO → bff DTO）の方針が記載されている
  - エラー整形方針（**contracts/bff/errors** に準拠）が記載されている
  - tenant_id/user_id の取り回し（解決・伝搬ルール）が記載されている

- [x] 0.2 Designの「Service Specification（Domain / apps/api）」が埋まっている
  - Usecase（Create/Update/SoftDelete/Duplicate等）が列挙されている
  - 主要ビジネスルールの所在（システムテンプレート削除禁止等）が記載されている
  - トランザクション境界が記載されている
  - 監査ログ記録ポイントが記載されている

- [x] 0.3 Designの「Repository Specification（apps/api）」が埋まっている
  - 取得・更新メソッド一覧が記載されている（tenant_id必須）
  - where句二重ガードの方針（tenant_id常時指定）が記載されている
  - RLS前提（set_config前提）が記載されている
  - 論理削除方式（deleted_at）が記載されている

- [x] 0.4 Designの「Contracts Summary（This Feature）」が埋まっている
  - packages/contracts/src/bff 側の追加・変更DTOが列挙されている
  - packages/contracts/src/api 側の追加・変更DTOが列挙されている
  - **Enum / Error の配置ルールが明記されている**
  - 「UIは packages/contracts/src/api を参照しない」ルールが明記されている

- [x] 0.5 Requirements Traceability が更新されている
  - 全20要件がBFF/API/Flows等の設計要素に紐づいている

- [ ] 0.6 v0生成物の受入・移植ルールが確認されている
  - v0生成物は必ず `apps/web/_v0_drop/reporting/dashboard/src` に一次格納
  - UIは MockBffClient で動作確認（BFF未接続状態）

- [ ] 0.7 Structure / Boundary Guard がパスしている
  - `npx tsx scripts/structure-guards.ts` が成功している

---

## 1. Scaffold / Structure Setup

- [ ] 1.1 Feature骨格生成
  - `npx tsx scripts/scaffold-feature.ts reporting dashboard` を実行
  - `apps/web/src/features/reporting/dashboard` が作成されていることを確認
  - `apps/bff/src/modules/reporting/dashboard` が作成されていることを確認
  - `apps/api/src/modules/reporting/dashboard` が作成されていることを確認
  - `apps/web/_v0_drop/reporting/dashboard` が作成されていることを確認
  - _Requirements: 1.1, 2.1, 3.1_

---

## 2. Contracts - Shared Enums & Errors

- [ ] 2.1 (P) ダッシュボード用Enum定義
  - WidgetType enum（KPI_CARD, LINE_CHART, BAR_CHART, PIE_CHART, GAUGE, TABLE, TEXT, COMPOSITE_CHART）を定義
  - DataSourceType enum（FACT, KPI, METRIC）を定義
  - OwnerType enum（SYSTEM, USER）を定義
  - DisplayGranularity, ScenarioType は既存を再利用
  - `packages/contracts/src/shared/enums/dashboard/` に配置
  - _Requirements: 6.1, 7.1, 8.1, 9.1, 10.1, 11.1, 12.1, 13.1, 14.1_

- [ ] 2.2 (P) ダッシュボード用Error定義
  - DashboardNotFoundError（404）を定義
  - DashboardAccessDeniedError（403）を定義
  - DashboardDeleteForbiddenError（400）を定義
  - WidgetDataError（500）を定義
  - InvalidFilterConfigError（400）を定義
  - `packages/contracts/src/shared/errors/` に配置
  - _Requirements: 2.6, 17.3, 20.3, 20.4_

---

## 3. Contracts - BFF DTOs

- [ ] 3.1 ダッシュボード一覧・詳細用DTO
  - BffDashboardDto（id, name, description, ownerType, updatedAt等）を定義
  - BffDashboardListDto（items, total, page, pageSize）を定義
  - BffDashboardDetailDto（BffDashboardDto + widgets配列）を定義
  - BffWidgetDto（id, widgetType, title, layout, dataConfig, filterConfig, displayConfig）を定義
  - _Requirements: 1.1, 1.2, 2.1, 2.3_

- [ ] 3.2 (P) ダッシュボード作成・更新用DTO
  - BffCreateDashboardDto（name, description, templateId?, globalFilterConfig, widgets）を定義
  - BffUpdateDashboardDto（name?, description?, globalFilterConfig?, widgets?）を定義
  - BffTemplateListDto（templates配列）を定義
  - _Requirements: 3.7, 15.1, 15.2, 15.3_

- [ ] 3.3 (P) ウィジェットデータ用DTO
  - BffWidgetDataRequestDto（globalFilter適用後のフィルター条件）を定義
  - BffWidgetDataResponseDto（values, compareValues, labels, unit等）を定義
  - _Requirements: 2.2, 6.2, 7.4, 8.4, 9.3, 10.2, 11.3_

- [ ] 3.4 (P) フィルター選択肢用DTO
  - BffDashboardSelectorsRequestDto（fiscalYear?, scenarioType?）を定義
  - BffDashboardSelectorsResponseDto（fiscalYears, departments, planEvents, planVersions）を定義
  - _Requirements: 4.1, 4.6, 4.7_

- [ ] 3.5 JSONB Config型定義
  - GlobalFilterConfig interface（fiscalYear, departmentStableId, periodStart/End, primary, compare等）を定義
  - WidgetLayoutConfig interface（row, col, sizeX, sizeY）を定義
  - WidgetDataConfig interface（sources配列）を定義
  - WidgetFilterConfig interface（useGlobal, overrides）を定義
  - 各ウィジェット種別のDisplayConfig interface を定義
  - _Requirements: 4.1, 5.1, 5.4, 14.1, 14.2_

---

## 4. Contracts - API DTOs

- [x] 4.1 Domain API用DTO定義
  - ApiDashboardDto, ApiDashboardDetailDto, ApiWidgetDto を定義
  - ApiCreateDashboardDto, ApiUpdateDashboardDto を定義
  - ApiWidgetDataRequestDto, ApiWidgetDataResponseDto を定義
  - BFF DTOとの対応関係を維持（snake_case ↔ camelCase）
  - _Requirements: 1.1, 2.1, 3.7, 15.1_

---

## 5. Database - Schema & Migration

- [x] 5.1 Prisma Schema追加
  - dashboards テーブル（id, tenant_id, name, description, owner_type, owner_id, global_filter_config, is_active, sort_order, deleted_at, deleted_by, created_at/by, updated_at/by）を定義
  - dashboard_widgets テーブル（id, dashboard_id, widget_type, title, layout, data_config, filter_config, display_config, sort_order）を定義
  - インデックス（tenant_id, tenant_id+owner_type, tenant_id+deleted_at, dashboard_id）を定義
  - _Requirements: 1.4, 2.1, 3.7, 17.2_

- [x] 5.2 RLS Policy作成
  - dashboards テーブルに tenant_isolation ポリシーを作成
  - dashboard_widgets テーブルに dashboard経由の tenant_isolation ポリシーを作成
  - マイグレーション SQL を作成
  - _Requirements: 20.1_

- [x] 5.3 初期テンプレートシードデータ作成
  - 「経営サマリー」テンプレート（owner_type=SYSTEM）を定義
  - KPIカード4枚（売上高、営業利益、営業利益率、ROE）を配置
  - 売上推移折れ線チャート、部門別売上棒グラフ、主要指標テーブルを配置
  - シードスクリプトを作成
  - _Requirements: 19.1, 19.2, 19.3_

---

## 6. Domain API - Repository

- [x] 6.1 DashboardRepository実装
  - findAll（tenant_id必須、deleted_at IS NULL フィルタ）を実装
  - findById（tenant_id + id、deleted_at IS NULL フィルタ）を実装
  - findByIdWithWidgets（ウィジェット含む詳細取得）を実装
  - create（ダッシュボード + ウィジェット一括作成）を実装
  - update（ダッシュボード + ウィジェット一括更新、トランザクション）を実装
  - softDelete（deleted_at, deleted_by を設定）を実装
  - findTemplates（owner_type=SYSTEM、deleted_at IS NULL）を実装
  - where句二重ガード（tenant_id常時指定）を適用
  - _Requirements: 1.1, 2.1, 3.7, 15.3, 17.2, 19.1_

---

## 7. Domain API - Services

- [x] 7.1 DashboardService実装
  - findAll（テナント内ダッシュボード一覧取得）を実装
  - findById（詳細取得、存在チェック）を実装
  - create（新規作成、owner_id設定、監査ログ）を実装
  - update（更新、監査ログ）を実装
  - delete（システムテンプレート削除禁止チェック、論理削除、監査ログ）を実装
  - duplicate（全設定コピー、名前に「（コピー）」付与、owner_id変更）を実装
  - findTemplates（システムテンプレート一覧）を実装
  - _Requirements: 1.1, 2.1, 3.7, 15.1, 16.1, 16.2, 16.3, 17.2, 17.3, 19.1_

- [x] 7.2 WidgetDataService実装
  - getData（ウィジェット種別 + フィルター条件に基づくデータ取得）を実装
  - Factデータ取得（subjects + facts テーブルから集計）を実装
  - KPIデータ取得（kpi_definitions + kpi_fact_amounts から取得）を実装
  - Metricデータ取得（metrics + 計算式評価）を実装
  - フィルター適用（グローバル or ウィジェット固有を解決）を実装
  - 比較データ取得（Compare ON時の差異計算）を実装
  - _Requirements: 2.2, 4.2, 4.3, 5.3, 6.2, 6.3, 7.3, 8.4, 9.3, 10.2, 11.3, 13.2, 14.3, 14.4, 14.5_

- [x] 7.3 権限チェック実装
  - epm.dashboard.read 権限チェックを一覧・詳細取得に適用
  - epm.dashboard.manage 権限チェックを作成・更新・削除・複製に適用
  - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5_

---

## 8. Domain API - Controller

- [x] 8.1 DashboardApiController実装
  - GET /api/reporting/dashboards（一覧取得）を実装
  - GET /api/reporting/dashboards/:id（詳細取得）を実装
  - POST /api/reporting/dashboards（新規作成）を実装
  - PUT /api/reporting/dashboards/:id（更新）を実装
  - DELETE /api/reporting/dashboards/:id（削除）を実装
  - POST /api/reporting/dashboards/:id/duplicate（複製）を実装
  - POST /api/reporting/dashboards/:id/widgets/:widgetId/data（ウィジェットデータ取得）を実装
  - GET /api/reporting/dashboards/templates（テンプレート一覧）を実装
  - GET /api/reporting/dashboards/selectors（選択肢取得）を実装
  - tenant_id/user_id をヘッダーから取得
  - _Requirements: 1.1, 2.1, 2.2, 3.7, 4.1, 15.1, 16.1, 17.1, 19.1_

---

## 9. BFF - Service & Mapper

- [x] 9.1 DashboardMapper実装
  - ApiDashboardDto → BffDashboardDto 変換（snake_case → camelCase）を実装
  - ApiWidgetDto → BffWidgetDto 変換を実装
  - JSONB config → 型付き interface 変換を実装
  - _Requirements: 1.2, 2.1_

- [x] 9.2 DashboardBffService実装
  - getDashboards（ページング正規化、Domain API呼び出し、変換）を実装
  - getDashboard（詳細取得、変換）を実装
  - createDashboard（入力検証、Domain API呼び出し）を実装
  - updateDashboard（入力検証、Domain API呼び出し）を実装
  - deleteDashboard（Domain API呼び出し）を実装
  - duplicateDashboard（Domain API呼び出し）を実装
  - getWidgetData（フィルター解決、Domain API呼び出し）を実装
  - getSelectors（選択肢取得）を実装
  - getTemplates（テンプレート一覧取得）を実装
  - Paging正規化（page→offset/limit、defaults、clamp、whitelist）を適用
  - _Requirements: 1.1, 2.1, 2.2, 3.7, 4.1, 15.1, 16.1, 17.1, 19.1_

---

## 10. BFF - Controller

- [x] 10.1 DashboardBffController実装
  - GET /api/bff/reporting/dashboards（一覧取得）を実装
  - GET /api/bff/reporting/dashboards/:id（詳細取得）を実装
  - POST /api/bff/reporting/dashboards（新規作成）を実装
  - PUT /api/bff/reporting/dashboards/:id（更新）を実装
  - DELETE /api/bff/reporting/dashboards/:id（削除）を実装
  - POST /api/bff/reporting/dashboards/:id/duplicate（複製）を実装
  - POST /api/bff/reporting/dashboards/:id/widgets/:widgetId/data（ウィジェットデータ取得）を実装
  - GET /api/bff/reporting/dashboards/selectors（選択肢取得）を実装
  - GET /api/bff/reporting/dashboards/templates（テンプレート一覧取得）を実装
  - Clerk認証からtenant_id/user_id解決
  - x-tenant-id / x-user-id ヘッダーで Domain API に伝搬
  - _Requirements: 1.1, 2.1, 2.2, 3.7, 4.1, 15.1, 16.1, 17.1, 19.1_

---

## 11. UI Phase 1 - BffClient & Core Components

- [x] 11.1 BffClient interface定義
  - getDashboards, getDashboard, createDashboard, updateDashboard, deleteDashboard を定義
  - duplicateDashboard, getWidgetData, getSelectors, getTemplates を定義
  - MockBffClient を実装（ハードコードデータ）
  - HttpBffClient のスタブを作成
  - _Requirements: 1.1, 2.1, 3.7_

- [x] 11.2 ダッシュボード一覧画面
  - DashboardListPage コンポーネントを作成
  - ダッシュボード名・説明・最終更新日時を一覧表示
  - sort_order順でソート
  - ダッシュボード選択で詳細画面に遷移
  - epm.dashboard.manage 権限時のみ新規作成ボタン表示
  - TanStack Query で一覧データ取得
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 11.3 ダッシュボード表示画面（View Mode）
  - DashboardViewPage コンポーネントを作成
  - SyncFusion Dashboard Layout でウィジェット配置
  - グローバルフィルターパネルを画面上部に配置
  - epm.dashboard.manage 権限時のみ編集ボタン表示
  - 手動リフレッシュボタンを配置
  - _Requirements: 2.1, 2.3, 2.7, 2.8_

- [x] 11.4 グローバルフィルターパネル
  - GlobalFilterPanel コンポーネントを作成
  - 年度、部門、期間範囲、表示粒度、Primary/Compare シナリオ選択を実装
  - 部門選択に「配下を含む」オプションを追加
  - シナリオ種別に応じたイベント/バージョン選択表示制御
  - フィルター変更時に全ウィジェット再取得をトリガー
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

---

## 12. UI Phase 1 - Edit Mode & Widget Settings

- [x] 12.1 ダッシュボード編集モード ✅
  - DashboardEditPage コンポーネントを作成
  - SyncFusion Dashboard Layout の allowDragging/allowResizing を有効化
  - ウィジェットドラッグ時のリアルタイムプレビュー
  - 新規ウィジェット追加ボタン → ウィジェット種別選択パネル表示
  - 保存ボタン（serialize() → API更新）を実装
  - キャンセルボタン（未保存変更破棄）を実装
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.7, 3.8_

- [ ] 12.2 ウィジェット設定サイドパネル
  - WidgetSettingsPanel コンポーネントを作成
  - ウィジェット選択時にサイドパネル表示
  - タイトル編集、データソース設定、表示設定を配置
  - 「グローバルフィルターを使用」トグルを実装
  - フィルターオーバーライド項目選択を実装
  - 設定変更時のリアルタイムプレビュー更新
  - _Requirements: 3.5, 3.6, 3.9, 5.1, 5.2, 5.4, 14.1, 14.2, 14.6_

- [ ] 12.3 データソース設定UI
  - DataSourceSelector コンポーネントを作成
  - データソースタイプ（Fact/KPI/Metric）選択
  - Fact選択時：勘定科目ツリー選択
  - KPI選択時：KPI定義リスト選択
  - Metric選択時：指標マスタリスト選択
  - 複数データソース追加・削除
  - 各ソースのラベル（凡例名）設定
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6_

---

## 13. UI Phase 1 - Widget Components

- [x] 13.1 WidgetRenderer実装
  - widget_type に応じたコンポーネント振り分け
  - ローディングインジケーター表示
  - エラー時の該当ウィジェットのみエラー表示
  - ウィジェット単位のリフレッシュボタン
  - _Requirements: 2.2, 2.5, 2.6_

- [ ] 13.2 (P) KPIカードウィジェット
  - KpiCardWidget コンポーネントを作成
  - 指標名、現在値、単位を表示
  - Compare ON時：差異率をパーセンテージ表示、正/負を色分け
  - スパークライン表示オプション（SyncFusion Sparkline）
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 13.3 (P) 折れ線チャートウィジェット
  - LineChartWidget コンポーネントを作成
  - SyncFusion Line Chart を使用
  - 複数系列描画、Compare ON時の比較系列
  - X軸：期間、Y軸：値
  - ホバー時ツールチップ、凡例表示/非表示切替
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [ ] 13.4 (P) 棒グラフウィジェット
  - BarChartWidget コンポーネントを作成
  - SyncFusion Bar Chart を使用
  - 縦棒/横棒切替、積み上げ表示オプション
  - Compare ON時のグループ化棒グラフ
  - データラベル表示ON/OFF
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 13.5 (P) 円グラフウィジェット
  - PieChartWidget コンポーネントを作成
  - SyncFusion Pie Chart を使用
  - ドーナツチャートオプション
  - セグメントラベル（項目名・割合）表示
  - クリック時ツールチップ
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ] 13.6 (P) ゲージウィジェット
  - GaugeWidget コンポーネントを作成
  - SyncFusion Circular Gauge を使用
  - 現在値・目標値・達成率表示
  - 達成率に応じた色分け（閾値設定可）
  - 半円/全円スタイル切替
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ] 13.7 (P) テーブルウィジェット
  - TableWidget コンポーネントを作成
  - SyncFusion DataGrid を使用
  - 列ヘッダーソート
  - Compare ON時の差異列表示
  - Excelエクスポートボタン（SyncFusion標準機能）
  - 数値フォーマット（カンマ区切り・小数桁数）
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 13.8 (P) テキストウィジェット
  - TextWidget コンポーネントを作成
  - マークダウン入力フォーム
  - マークダウンレンダリング表示
  - _Requirements: 12.1, 12.2, 12.3_

- [ ] 13.9 (P) 複合チャートウィジェット
  - CompositeChartWidget コンポーネントを作成
  - SyncFusion Chart の複合チャート機能を使用
  - 系列ごとに折れ線/棒を選択
  - 主軸/副軸（2軸）表示
  - _Requirements: 13.1, 13.2, 13.3, 13.4_

---

## 14. UI Phase 1 - CRUD Dialogs

- [x] 14.1 ダッシュボード新規作成ダイアログ ✅
  - CreateDashboardDialog コンポーネントを作成
  - ダッシュボード名・説明入力フォーム
  - 「空白から作成」/「テンプレートから作成」選択
  - テンプレート選択時：テンプレート一覧表示
  - 作成後は編集モードで表示
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [x] 14.2 (P) ダッシュボード削除確認ダイアログ ✅
  - DeleteConfirmDialog コンポーネントを作成
  - 削除確認メッセージ表示
  - システムテンプレート削除時のエラー表示
  - _Requirements: 17.1, 17.2, 17.3_

- [x] 14.3 (P) PDFエクスポート機能 ✅
  - PdfExportButton コンポーネントを作成
  - html2canvas でダッシュボード画面をキャプチャ
  - jsPDF でPDF生成
  - タイムスタンプをPDFに含める
  - エクスポート中の進捗インジケーター
  - _Requirements: 18.1, 18.2, 18.3, 18.4_

---

## 15. UI Phase 2 - Integration

- [x] 15.1 HttpBffClient実装
  - MockBffClient から HttpBffClient に切替
  - 全APIエンドポイントへの実接続を実装
  - エラーハンドリング（contracts/bff/errors準拠）を実装
  - _Requirements: 1.1, 2.1, 3.7_

- [x] 15.2 ルーティング設定
  - `/reporting/dashboard` → 一覧画面
  - `/reporting/dashboard/:id` → 表示画面
  - 権限ガード（epm.dashboard.read）を適用
  - メニュー登録（shared/navigation/menu.ts）
  - _Requirements: 1.3, 20.3_

- [x] 15.3 Structure Guard 検証
  - `npx tsx scripts/structure-guards.ts` を実行
  - UI → Domain API 直接呼び出しがないことを確認
  - UI が packages/contracts/src/api を参照していないことを確認
  - fetch直書きがないことを確認（HttpBffClient経由のみ）
  - _Requirements: 20.5_

---

## 16. Integration Testing

- [ ] 16.1 API統合テスト
  - ダッシュボード CRUD の E2E テスト
  - ウィジェットデータ取得の E2E テスト
  - 権限チェックのテスト（read/manage）
  - テナント分離のテスト
  - _Requirements: 1.1, 2.1, 3.7, 15.1, 17.1, 20.1, 20.2_

- [ ] 16.2 UI統合テスト
  - 一覧 → 詳細 → 編集 フローのE2Eテスト
  - ウィジェット追加・編集・削除フローのテスト
  - グローバルフィルター変更時のウィジェット更新テスト
  - _Requirements: 1.3, 2.4, 3.1, 4.2_

---

## Requirements Coverage

| Requirement | Task(s) |
|-------------|---------|
| 1.1-1.5 | 1.1, 3.1, 6.1, 7.1, 8.1, 9.2, 10.1, 11.1, 11.2, 15.1, 16.1 |
| 2.1-2.8 | 3.1, 3.3, 6.1, 7.1, 7.2, 8.1, 9.2, 10.1, 11.1, 11.3, 13.1, 15.1, 16.2 |
| 3.1-3.9 | 3.2, 4.1, 6.1, 7.1, 8.1, 9.2, 10.1, 11.1, 12.1, 12.2, 15.1, 16.2 |
| 4.1-4.7 | 3.4, 3.5, 7.2, 8.1, 9.2, 10.1, 11.4 |
| 5.1-5.5 | 3.5, 7.2, 12.2 |
| 6.1-6.5 | 2.1, 3.3, 7.2, 13.2 |
| 7.1-7.6 | 2.1, 3.3, 7.2, 13.3 |
| 8.1-8.5 | 2.1, 3.3, 7.2, 13.4 |
| 9.1-9.4 | 2.1, 3.3, 7.2, 13.5 |
| 10.1-10.4 | 2.1, 3.3, 7.2, 13.6 |
| 11.1-11.5 | 2.1, 3.3, 7.2, 13.7 |
| 12.1-12.3 | 2.1, 13.8 |
| 13.1-13.4 | 2.1, 3.3, 7.2, 13.9 |
| 14.1-14.6 | 2.1, 3.5, 7.2, 12.2, 12.3 |
| 15.1-15.5 | 3.2, 5.3, 6.1, 7.1, 8.1, 9.2, 10.1, 14.1, 16.1 |
| 16.1-16.3 | 7.1, 8.1, 9.2, 10.1 |
| 17.1-17.3 | 2.2, 5.1, 6.1, 7.1, 8.1, 9.2, 10.1, 14.2, 16.1 |
| 18.1-18.4 | 14.3 |
| 19.1-19.4 | 5.3, 6.1, 7.1, 8.1, 9.2, 10.1 |
| 20.1-20.5 | 2.2, 5.2, 7.3, 8.1, 10.1, 15.2, 15.3, 16.1 |

**Total**: 16 major tasks, 42 sub-tasks
**All 20 requirements covered**
