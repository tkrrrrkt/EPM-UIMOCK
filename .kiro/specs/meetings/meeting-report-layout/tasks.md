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
  - **Paging/Sorting正規化（必須）が明記されている**
    - 本Featureは全件取得・sortOrder昇順固定
  - 変換（api DTO → bff DTO）の方針が記載されている
  - エラー整形方針（**contracts/bff/errors** に準拠）が記載されている
  - tenant_id/user_id の取り回し（解決・伝搬ルール）が記載されている

- [x] 0.2 Designの「Service Specification（Domain / apps/api）」が埋まっている
  - Phase 1はMock、Phase 2以降でDomain API実装と明記されている
  - Usecase（Create/Update/Inactivate等）が列挙されている

- [x] 0.3 Designの「Repository Specification（apps/api）」が埋まっている
  - Phase 2以降の責務として明記されている
  - tenant_id必須、where句二重ガード方針が記載されている

- [x] 0.4 Designの「Contracts Summary（This Feature）」が埋まっている
  - packages/contracts/src/bff 側の追加・変更DTOが列挙されている
  - packages/contracts/src/shared/enums 側のEnumが列挙されている
  - packages/contracts/src/shared/errors 側のErrorが列挙されている
  - 「UIは packages/contracts/src/api を参照しない」ルールが明記されている

- [x] 0.5 Requirements Traceability（必要な場合）が更新されている
  - FR-1〜FR-21の全要件がdesign.mdのトレーサビリティ表に紐づいている

- [x] 0.6 v0生成物の受入・移植ルールが確認されている
  - Phase 1はMockBffClientで動作確認
  - Phase 2でHttpBffClientに切り替え

- [x] 0.7 Structure / Boundary Guard がパスしている
  - 実装後に `npx tsx scripts/structure-guards.ts` で確認

---

## 1. Contracts: Enum/Error定義

- [x] 1.1 (P) 会議レポート関連Enumを定義する
  - ReportComponentType（9種類: KPI_CARD, TABLE, CHART, SUBMISSION_DISPLAY, REPORT_LINK, ACTION_LIST, SNAPSHOT_COMPARE, KPI_DASHBOARD, AP_PROGRESS）
  - ReportPageType（FIXED, PER_DEPARTMENT, PER_BU）
  - ReportDataSource（FACT, KPI, SUBMISSION, SNAPSHOT, EXTERNAL）
  - ComponentWidth（FULL, HALF, THIRD）
  - ComponentHeight（AUTO, SMALL, MEDIUM, LARGE）
  - 配置先: `packages/contracts/src/shared/enums/meetings/`
  - _Requirements: 6.1, 11.1, 12.1_

- [x] 1.2 (P) 会議レポート関連Errorを定義する
  - ReportLayoutNotFoundError（404）
  - ReportLayoutDuplicateCodeError（409）
  - ReportLayoutDefaultDeleteError（422）
  - ReportLayoutInUseError（422）
  - ReportPageNotFoundError（404）
  - ReportPageDuplicateCodeError（409）
  - ReportComponentNotFoundError（404）
  - ReportComponentDuplicateCodeError（409）
  - 配置先: `packages/contracts/src/shared/errors/meetings/`
  - _Requirements: 2.3, 3.2, 4.4, 4.5, 6.3, 7.2, 7.3, 8.4, 11.3, 17.2, 18.3_

---

## 2. Contracts: BFF DTO定義

- [x] 2.1 (P) レイアウト関連DTOを定義する
  - ReportLayoutDto（id, meetingTypeId, layoutCode, layoutName, description, isDefault, sortOrder, isActive, pageCount）
  - ReportLayoutListDto（items, total）
  - CreateReportLayoutDto（meetingTypeId, layoutCode, layoutName, description, isDefault）
  - UpdateReportLayoutDto（layoutCode, layoutName, description, isDefault, isActive）
  - ReorderLayoutsDto（meetingTypeId, orderedIds）
  - 配置先: `packages/contracts/src/bff/meetings/`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 3.1_

- [x] 2.2 (P) ページ関連DTOを定義する
  - ReportPageDto（id, layoutId, pageCode, pageName, pageType, expandDimensionId, sortOrder, isActive, componentCount）
  - ReportPageListDto（items, total）
  - CreateReportPageDto（layoutId, pageCode, pageName, pageType, expandDimensionId）
  - UpdateReportPageDto（pageCode, pageName, pageType, expandDimensionId, isActive）
  - ReorderPagesDto（layoutId, orderedIds）
  - 配置先: `packages/contracts/src/bff/meetings/`
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 6.1, 7.1_

- [x] 2.3 (P) コンポーネント関連DTOを定義する
  - ReportComponentDto（id, pageId, componentCode, componentName, componentType, dataSource, width, height, configJson, sortOrder, isActive）
  - ReportComponentListDto（items, total）
  - CreateReportComponentDto（pageId, componentCode, componentName, componentType, dataSource, width, height, configJson）
  - UpdateReportComponentDto（componentCode, componentName, componentType, dataSource, width, height, configJson, isActive）
  - ReorderComponentsDto（pageId, orderedIds）
  - 配置先: `packages/contracts/src/bff/meetings/`
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 11.1, 17.1_

- [x] 2.4 (P) テンプレート関連DTOを定義する
  - LayoutTemplateDto（id, templateCode, templateName, description, pageCount, componentCount）
  - LayoutTemplateListDto（items, total）
  - CreateLayoutFromTemplateDto（meetingTypeId, templateId, layoutCode, layoutName）
  - 配置先: `packages/contracts/src/bff/meetings/`
  - _Requirements: 21.1, 21.2, 21.3_

- [x] 2.5 config_json型定義を実装する
  - BaseConfig（共通: title, showHeader, collapsible, defaultCollapsed, hideWhenEmpty, emptyMessage）
  - KpiCardConfig（subjectIds, layout, columns, showTarget, showVariance, showTrend, showSparkline, thresholds）
  - TableConfig（rowAxis, compareMode, columns, showTotal, showSubtotal, highlightVariance等）
  - ChartConfig（chartType, xAxis, series, showLegend, showDataLabels, showGrid, waterfallConfig）
  - SubmissionDisplayConfig（displayMode, sectionIds, showOrganizationHierarchy等）
  - ReportLinkConfig（links, layout, columns）
  - ActionListConfig（filterStatus, filterPriority, showAssignee, showDueDate, showStatus, allowStatusChange, sortBy, sortOrder）
  - SnapshotCompareConfig（compareTarget, specificSnapshotId, metrics, highlightChanges, thresholds, showDirection, showPercentage）
  - KpiDashboardConfig（kpiDefinitionIds, layout, columns, showChart, chartPeriods, showActions, filterByStatus）
  - ApProgressConfig（actionPlanIds, showGantt, showKanban, showProgress, showMilestones, filterByStatus, groupBy）
  - ComponentConfig Union型とType Guard関数
  - 配置先: `packages/contracts/src/bff/meetings/ComponentConfig.ts`
  - Task 2.3に依存（ComponentType参照）
  - _Requirements: 13.1, 13.2, 14.1, 14.2, 14.3, 14.4, 14.5, 15.1, 15.2, 15.3, 15.4, 15.5, 16.1, 16.2, 16.3, 16.4_

---

## 3. UI: BffClient層の実装

- [ ] 3.1 BffClient Interfaceを定義する
  - レイアウトCRUD（getLayouts, createLayout, updateLayout, deleteLayout, reorderLayouts）
  - ページCRUD（getPages, createPage, updatePage, deletePage, reorderPages）
  - コンポーネントCRUD（getComponents, createComponent, updateComponent, deleteComponent, reorderComponents）
  - テンプレート（getTemplates, createFromTemplate）
  - 配置先: `apps/web/src/features/meetings/meeting-report-layout/api/bff-client.ts`
  - Task 2完了に依存（DTO型参照）
  - _Requirements: 1.1, 2.1, 3.1, 4.3, 5.1, 6.1, 7.1, 8.3, 9.1, 10.1, 11.1, 17.1, 18.2, 19.1, 21.2, 21.3_

- [ ] 3.2 MockBffClientを実装する
  - 3階層構造のモックデータ（月次経営会議レイアウト）
  - レイアウト/ページ/コンポーネントのCRUD処理
  - 並べ替え処理（sortOrder再計算）
  - ビジネスルール検証（コード重複、デフォルト制約、使用中チェック）
  - 月次経営会議レイアウトテンプレートをハードコード定義
  - Task 3.1に依存（Interface実装）
  - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6, 3.3, 3.4, 4.4, 4.5, 6.2, 6.3, 6.4, 6.5, 6.6, 7.3, 7.4, 9.3, 11.2, 11.3, 11.4, 11.5, 11.6, 17.3, 17.4, 19.3, 19.4, 21.4_

---

## 4. UI: 階層構造ツリーの実装

- [ ] 4.1 LayoutTreeコンポーネントを実装する
  - レイアウト一覧表示（sortOrder順）
  - 各レイアウトの展開/折りたたみ
  - ページ一覧のネスト表示
  - コンポーネント一覧のネスト表示
  - デフォルトレイアウトのバッジ表示
  - 無効項目のグレーアウト
  - 選択状態の管理
  - Task 3.2に依存（データ取得）
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 5.1, 5.2, 5.3, 5.4, 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 4.2 ページ並べ替え機能を実装する
  - @dnd-kit/coreと@dnd-kit/sortableを使用
  - 同一レイアウト内でのドラッグ＆ドロップ
  - ドロップ可能位置のビジュアルフィードバック
  - sortOrder再計算APIコール
  - Task 4.1に依存（ツリー構造内での実装）
  - _Requirements: 9.1, 9.2, 9.3_

- [ ] 4.3 コンポーネント並べ替え機能を実装する
  - 同一ページ内でのドラッグ＆ドロップ
  - ページ間移動の禁止
  - ドロップ可能位置のビジュアルフィードバック
  - sortOrder再計算APIコール
  - Task 4.1に依存（ツリー構造内での実装）
  - _Requirements: 19.1, 19.2, 19.3, 19.4_

---

## 5. UI: 詳細パネルの実装

- [ ] 5.1 LayoutDetailPanelを実装する
  - レイアウト基本情報フォーム（layoutCode, layoutName, description, isDefault, isActive）
  - バリデーション（必須、文字数、フォーマット）
  - 保存・キャンセル・削除ボタン
  - Task 4.1に依存（選択状態連携）
  - _Requirements: 2.1, 3.1, 3.3, 3.4_

- [ ] 5.2 PageDetailPanelを実装する
  - ページ基本情報フォーム（pageCode, pageName, pageType, expandDimensionId, isActive）
  - ページタイプ選択によるexpandDimensionId入力制御
  - バリデーション
  - 保存・キャンセル・削除ボタン
  - Task 4.1に依存（選択状態連携）
  - _Requirements: 6.1, 6.4, 7.1, 7.4_

- [ ] 5.3 ComponentDetailPanelを実装する
  - コンポーネント基本情報フォーム（componentCode, componentName, componentType, dataSource, width, height）
  - コンポーネントタイプ変更時のconfig_jsonリセット確認
  - config設定UIの動的切り替え
  - 保存・キャンセル・削除ボタン
  - Task 4.1に依存（選択状態連携）
  - _Requirements: 11.1, 11.6, 17.1, 17.3, 17.4_

---

## 6. UI: コンポーネントタイプ別config設定UIの実装

- [ ] 6.1 (P) KpiCardConfigパネルを実装する
  - 表示科目選択（複数選択）
  - レイアウト選択（grid/list）
  - グリッド列数選択（2/3/4）
  - 表示オプション（目標値、差異、トレンド、スパークライン）
  - 閾値設定（danger/warning）
  - Task 5.3に依存（ComponentDetailPanel内での呼び出し）
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [ ] 6.2 (P) TableConfigパネルを実装する
  - 行軸選択（organization/subject/period）
  - 比較モード選択（BUDGET_VS_ACTUAL等）
  - 表示列選択（budget, actual, forecast, variance, varianceRate）
  - 合計行・小計行表示設定
  - 差異ハイライト設定
  - Task 5.3に依存（ComponentDetailPanel内での呼び出し）
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [ ] 6.3 (P) ChartConfigパネルを実装する
  - チャートタイプ選択（waterfall/bar/line/area/pie/donut）
  - X軸選択（period/organization/subject）
  - 凡例・データラベル・グリッド線の表示設定
  - ウォーターフォール固有設定（開始/終了ラベル、色）
  - Task 5.3に依存（ComponentDetailPanel内での呼び出し）
  - _Requirements: 16.1, 16.2, 16.3, 16.4_

- [ ] 6.4 (P) SubmissionDisplayConfigパネルを実装する
  - 表示モード選択（tree/flat/card）
  - セクション選択
  - 組織階層表示設定
  - 提出状況表示設定
  - デフォルト展開設定
  - Task 5.3に依存（ComponentDetailPanel内での呼び出し）
  - _Requirements: 12.4_

- [ ] 6.5 (P) ReportLinkConfigパネルを実装する
  - リンク一覧の追加・編集・削除
  - 各リンク項目（label, url, description, icon, category）
  - レイアウト選択（grid/list）
  - 列数設定
  - Task 5.3に依存（ComponentDetailPanel内での呼び出し）
  - _Requirements: 12.5_

- [ ] 6.6 (P) ActionListConfigパネルを実装する
  - ステータスフィルタ設定
  - 優先度フィルタ設定
  - 表示列設定（担当者、期日、ステータス）
  - ステータス変更許可設定
  - ソート設定
  - Task 5.3に依存（ComponentDetailPanel内での呼び出し）
  - _Requirements: 12.6_

- [ ] 6.7 (P) SnapshotCompareConfigパネルを実装する
  - 比較対象選択（前回会議/特定スナップショット）
  - 比較メトリクス選択
  - 変更ハイライト設定
  - 閾値設定
  - 方向・パーセント表示設定
  - Task 5.3に依存（ComponentDetailPanel内での呼び出し）
  - _Requirements: 12.7_

- [ ] 6.8 (P) KpiDashboardConfigパネルを実装する
  - KPI定義選択
  - レイアウト選択（grid/list）
  - 列数設定
  - チャート表示設定
  - アクション表示設定
  - ステータスフィルタ設定
  - Task 5.3に依存（ComponentDetailPanel内での呼び出し）
  - _Requirements: 12.8_

- [ ] 6.9 (P) ApProgressConfigパネルを実装する
  - アクションプラン選択
  - ガント/カンバン/進捗/マイルストーン表示設定
  - ステータスフィルタ設定
  - グループ化設定
  - Task 5.3に依存（ComponentDetailPanel内での呼び出し）
  - _Requirements: 12.9_

---

## 7. UI: ダイアログの実装

- [ ] 7.1 (P) CreateLayoutDialogを実装する
  - レイアウト基本情報入力（layoutCode, layoutName, description, isDefault）
  - バリデーション（必須、文字数、フォーマット）
  - 作成API呼び出し
  - Task 3.2に依存（API呼び出し）
  - _Requirements: 2.1_

- [ ] 7.2 (P) CreatePageDialogを実装する
  - ページ基本情報入力（pageCode, pageName, pageType, expandDimensionId）
  - ページタイプ選択による入力制御
  - バリデーション
  - 作成API呼び出し
  - Task 3.2に依存（API呼び出し）
  - _Requirements: 6.1_

- [ ] 7.3 (P) CreateComponentDialogを実装する
  - コンポーネント基本情報入力（componentCode, componentName, componentType, dataSource, width）
  - バリデーション
  - 作成API呼び出し（デフォルトconfig_json付与）
  - Task 3.2に依存（API呼び出し）
  - _Requirements: 11.1_

- [ ] 7.4 (P) TemplateSelectDialogを実装する
  - テンプレート一覧表示
  - テンプレート詳細プレビュー（ページ数、コンポーネント数）
  - 選択とレイアウト情報入力
  - 作成API呼び出し
  - Task 3.2に依存（API呼び出し）
  - _Requirements: 21.1, 21.2, 21.3_

- [ ] 7.5 DeleteConfirmDialogを実装する
  - 削除確認メッセージ（関連データ数表示）
  - レイアウト削除時：ページ数表示
  - ページ削除時：コンポーネント数表示
  - エラー表示（デフォルト削除不可、使用中削除不可）
  - Task 4.1に依存（ツリーからの呼び出し）
  - _Requirements: 4.1, 4.2, 4.4, 4.5, 8.1, 8.2, 18.1_

---

## 8. UI: メインページとプレビューの実装

- [ ] 8.1 LayoutSettingsPageを実装する
  - 2カラムレイアウト（左: ツリー、右: 詳細パネル）
  - 会議種別情報のヘッダー表示
  - プレビューボタン
  - レイアウト追加/テンプレートから作成ボタン
  - ローディング・エラー状態の処理
  - Task 4, 5, 7に依存（全コンポーネント統合）
  - _Requirements: 1.1, 5.1, 10.1_

- [ ] 8.2 LayoutPreviewを実装する
  - 別ルート（/meetings/report-layout/:meetingTypeId/preview/:layoutId）
  - タブ構成（ページ単位）
  - 各コンポーネントのサンプルデータ表示
  - 幅表示（FULL/HALF/THIRD）の反映
  - モックデータ使用（実データは使用しない）
  - Task 8.1に依存（ページからの遷移）
  - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5_

---

## 9. UI: ルーティングと統合

- [ ] 9.1 ルーティング設定を追加する
  - /meetings/report-layout/:meetingTypeId → LayoutSettingsPage
  - /meetings/report-layout/:meetingTypeId/preview/:layoutId → LayoutPreview
  - 会議種別設定画面（A2）からの導線確認
  - Task 8に依存（ページコンポーネント）
  - _Requirements: 1.1, 20.1_

- [ ] 9.2 HttpBffClientを実装する
  - BffClient Interfaceの実装
  - 実際のBFF APIエンドポイント呼び出し
  - エラーハンドリング（契約エラーのマッピング）
  - Phase 2以降で使用（Phase 1はMockBffClient）
  - Task 3.1に依存（Interface実装）
  - _Requirements: NFR-1.1_

---

## 10. 検証と品質確認

- [ ] 10.1 Structure Guardを実行して境界違反がないことを確認する
  - `npx tsx scripts/structure-guards.ts` の成功確認
  - UIからDomain APIへの直接参照がないこと
  - UIからapi contractsのimportがないこと
  - 直接fetch()が存在しないこと
  - Task 9完了に依存（全実装完了後）
  - _Requirements: NFR-1.1, NFR-3.3_

- [ ] 10.2 MockBffClientでの動作確認を実施する
  - 全CRUDオペレーションの正常動作
  - バリデーションエラーの表示
  - ドラッグ＆ドロップの動作
  - プレビュー表示
  - Task 9完了に依存（全実装完了後）
  - _Requirements: NFR-2.1, NFR-2.2, NFR-2.3, NFR-2.4, NFR-2.5, NFR-2.6, NFR-2.7_
