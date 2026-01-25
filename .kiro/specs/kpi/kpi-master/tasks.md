# Implementation Tasks

> **Feature**: kpi/kpi-master
> **Phase**: Phase 1 MVP
> **Generated**: 2026-01-25
> **Task Ordering**: Contracts → DB → Domain API → BFF → UI (MockBffClient → HttpBffClient)

---

## Task Overview

本タスクリストは、KPI管理マスタ機能のPhase 1 MVP実装に必要なすべての作業を記載する。Contracts-first原則に基づき、契約定義から開始し、DB、Domain API、BFF、UIの順に実装を進める。

**Total Tasks**: 7 major tasks, 39 sub-tasks
**Estimated Effort**: 1-3 hours per sub-task
**Parallelization**: (P)マーカーで並列実行可能タスクを明記

---

## 0. Design Completeness Gate（Blocking）

実装開始前に、design.mdの完全性を確認する。

- [x] 0.1 BFF Specification（apps/bff）が埋まっている
- [x] 0.2 Service Specification（Domain / apps/api）が埋まっている
- [x] 0.3 Repository Specification（apps/api）が埋まっている
- [x] 0.4 Contracts Summary（This Feature）が埋まっている
- [x] 0.5 Requirements Traceability（必要な場合）が更新されている
- [x] 0.6 v0生成物の受入・移植ルールが確認されている
- [x] 0.7 Structure / Boundary Guard がパスしている（実装後に確認）

---

## 1. Scaffold / Structure Setup

- [ ] 1.1 (P) Feature骨格生成
  - 実行: `npx tsx scripts/scaffold-feature.ts kpi kpi-master`
  - 確認事項:
    - `apps/web/src/features/kpi/kpi-master` ディレクトリが作成される
    - `apps/bff/src/modules/kpi/kpi-master` ディレクトリが作成される
    - `apps/api/src/modules/kpi/kpi-master` ディレクトリが作成される
    - `apps/web/_v0_drop/kpi/kpi-master` ディレクトリが作成される
  - _Requirements: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11_

---

## 2. Contracts Definition（最優先・順序厳守）

- [ ] 2. Contracts定義（BFF → API → Shared Enums/Errors）

- [ ] 2.1 (P) Shared Enums定義（packages/contracts/src/shared/enums/kpi）
  - KpiMasterEventStatus enum作成（DRAFT | CONFIRMED）
  - KpiType enum作成（FINANCIAL | NON_FINANCIAL | METRIC）
  - HierarchyLevel enum作成（1 | 2）
  - AggregationMethod enum作成（SUM | EOP | AVG | MAX | MIN）
  - Direction enum作成（higher_is_better | lower_is_better）
  - _Requirements: 1, 2, 3_

- [ ] 2.2 (P) Shared Errors定義（packages/contracts/src/shared/errors）
  - KpiMasterEventNotFoundError作成
  - KpiMasterEventAlreadyConfirmedError作成
  - KpiMasterItemNotFoundError作成
  - KpiMasterItemTypeImmutableError作成
  - KpiMasterItemDeleteForbiddenError作成
  - KpiMasterItemAccessDeniedError作成（部門権限エラー）
  - KpiDefinitionDuplicateError作成
  - KpiFactAmountDuplicateError作成
  - KpiTargetValueDuplicateError作成
  - KpiManagedSubjectNotFoundError作成
  - KpiManagedMetricNotFoundError作成
  - _Requirements: 9, 10, 11_

- [ ] 2.3 BFF Contracts定義（packages/contracts/src/bff/kpi-master）
  - KPI管理イベント関連DTO作成（CreateKpiMasterEventDto, KpiMasterEventDto, GetKpiMasterEventsQueryDto）
  - KPI項目関連DTO作成（CreateKpiMasterItemDto, UpdateKpiMasterItemDto, KpiMasterItemDto, KpiMasterItemDetailDto, KpiMasterItemTreeDto, GetKpiMasterItemsQueryDto）
  - 選択肢関連DTO作成（SelectableSubjectListDto, SelectableMetricListDto）
  - 非財務KPI定義DTO作成（CreateKpiDefinitionDto, KpiDefinitionDto, GetKpiDefinitionsQueryDto）
  - 非財務KPI予実DTO作成（CreateKpiFactAmountDto, UpdateKpiFactAmountDto, KpiFactAmountDto）
  - 指標目標値DTO作成（CreateKpiTargetValueDto, UpdateKpiTargetValueDto, KpiTargetValueDto）
  - Paging/Sorting正規化ルール明記（page/pageSize、defaults、clamp、whitelist、normalize）
  - camelCase命名規則適用
  - _Requirements: 1, 2, 3, 4, 5, 6, 7, 8, 9_

- [ ] 2.4 API Contracts定義（packages/contracts/src/api/kpi-master）
  - KPI管理イベント関連DTO作成（CreateKpiMasterEventApiDto, KpiMasterEventApiDto, GetKpiMasterEventsApiQueryDto）
  - KPI項目関連DTO作成（CreateKpiMasterItemApiDto, UpdateKpiMasterItemApiDto, KpiMasterItemApiDto, GetKpiMasterItemsApiQueryDto）
  - 非財務KPI定義DTO作成（CreateKpiDefinitionApiDto, KpiDefinitionApiDto）
  - 非財務KPI予実DTO作成（CreateKpiFactAmountApiDto, KpiFactAmountApiDto）
  - 指標目標値DTO作成（CreateKpiTargetValueApiDto, KpiTargetValueApiDto）
  - offset/limit形式のページング定義
  - camelCase命名規則適用
  - _Requirements: 1, 2, 3, 4, 5, 6, 7, 8, 9_

- [ ] 2.5 (P) 既存Action Plan Contracts拡張（packages/contracts/src/bff/action-plan-core、src/api/action-plan-core）
  - CreateActionPlanDto に `kpiMasterItemId?: string` フィールドを追加
  - CreateActionPlanApiDto に `kpiMasterItemId?: string` フィールドを追加
  - subjectId と kpiMasterItemId の排他制約ルールをコメント記載
  - _Requirements: 8_

---

## 3. Database Implementation（Contracts完了後）

- [ ] 3. Database層実装（Prisma Schema → Migration → RLS）

- [ ] 3.1 Prisma Schema定義（packages/db/prisma/schema.prisma）
  - kpi_master_events モデル追加（UUID PK、tenant_id、event_code、fiscal_year、status）
  - kpi_master_items モデル追加（kpi_type、hierarchy_level、ref_subject_id/ref_kpi_definition_id/ref_metric_id）
  - kpi_definitions モデル追加（kpi_code、aggregation_method、direction）
  - kpi_fact_amounts モデル追加（period_code、target_value、actual_value）
  - kpi_target_values モデル追加（period_code、target_value）
  - subjects モデル拡張（kpi_managed Boolean追加）
  - metrics モデル拡張（kpi_managed Boolean追加）
  - action_plans モデル拡張（kpi_master_item_id追加、subject_id nullable化）
  - Relation定義（parent-child、company、employee、kpi_definition、subjects、metrics）
  - 複合UNIQUE制約適用（design.md Constraints参照）
  - Index定義（tenant_id、company_id、event_id、department_stable_id）
  - _Requirements: 1, 2, 3, 4, 5, 6, 7, 8, 11_

- [ ] 3.2 Migration生成・CHECK制約追加（packages/db/prisma/migrations）
  - Prismaマイグレーション生成（`npx prisma migrate dev --name add_kpi_master`）
  - CHECK制約をraw SQLで追加:
    - kpi_master_events.status IN ('DRAFT', 'CONFIRMED')
    - kpi_master_items.kpi_type IN ('FINANCIAL', 'NON_FINANCIAL', 'METRIC')
    - kpi_master_items.hierarchy_level IN (1, 2)
    - kpi_master_items.kpi_type別の参照ID排他制約
    - kpi_definitions.aggregation_method IN ('SUM', 'EOP', 'AVG', 'MAX', 'MIN')
    - kpi_definitions.direction IS NULL OR IN ('higher_is_better', 'lower_is_better')
    - kpi_fact_amounts.period_start_date <= period_end_date
    - action_plans.subject_id IS NOT NULL OR kpi_master_item_id IS NOT NULL
  - マイグレーションファイルを実行してDBスキーマを確定
  - _Requirements: 1, 2, 6, 7, 9, 11_

- [ ] 3.3 RLS Policy定義（Migration SQL内）
  - kpi_master_events テーブルでRLS有効化
  - kpi_master_items テーブルでRLS有効化
  - kpi_definitions テーブルでRLS有効化
  - kpi_fact_amounts テーブルでRLS有効化
  - kpi_target_values テーブルでRLS有効化
  - tenant_isolation policyを各テーブルに作成（tenant_id::text = current_setting('app.tenant_id')）
  - _Requirements: 11_

---

## 4. Domain API Implementation（DB完了後）

- [ ] 4. Domain API実装（Repository → Service → Controller → 権限チェック → 監査ログ）

- [ ] 4.1 KpiMasterEventRepository実装（apps/api/src/modules/kpi/kpi-master）
  - findAll メソッド実装（tenant_id、filters、offset/limit）
  - findById メソッド実装（tenant_id、id）
  - create メソッド実装（tenant_id、data、DRAFT状態で作成）
  - update メソッド実装（tenant_id、id、data、DRAFT→CONFIRMED状態遷移）
  - findByEventCode メソッド実装（event_code重複チェック）
  - WHERE句に必ずtenant_id含める（二重ガード）
  - Prisma set_config前提（RLS有効化確認）
  - _Requirements: 1, 11_

- [ ] 4.2 KpiMasterItemRepository実装（apps/api/src/modules/kpi/kpi-master）
  - findAll メソッド実装（tenant_id、filters、階層取得対応）
  - findById メソッド実装（tenant_id、id、予実データJOIN）
  - create メソッド実装（tenant_id、data、kpi_type別参照ID設定）
  - update メソッド実装（tenant_id、id、data、種別・参照先変更禁止検証）
  - delete メソッド実装（tenant_id、id、論理削除 is_active=false）
  - findByEventId メソッド実装（イベント内KPI項目一覧取得）
  - WHERE句に必ずtenant_id含める（二重ガード）
  - _Requirements: 2, 3, 4, 9, 11_

- [ ] 4.3 (P) KpiDefinitionRepository実装（apps/api/src/modules/kpi/kpi-master）
  - findAll メソッド実装（tenant_id、filters、offset/limit）
  - findById メソッド実装（tenant_id、id）
  - create メソッド実装（tenant_id、data）
  - findByKpiCode メソッド実装（kpi_code重複チェック）
  - WHERE句に必ずtenant_id含める
  - _Requirements: 2, 6, 11_

- [ ] 4.4 (P) KpiFactAmountRepository実装（apps/api/src/modules/kpi/kpi-master）
  - findByItemId メソッド実装（tenant_id、kpi_definition_id、event_id、期間別取得）
  - create メソッド実装（tenant_id、data）
  - update メソッド実装（tenant_id、id、data）
  - findByUnique メソッド実装（期間重複チェック: event_id + kpi_definition_id + period_code + department_stable_id）
  - WHERE句に必ずtenant_id含める
  - _Requirements: 6, 11_

- [ ] 4.5 (P) KpiTargetValueRepository実装（apps/api/src/modules/kpi/kpi-master）
  - findByItemId メソッド実装（tenant_id、kpi_master_item_id、期間別取得）
  - create メソッド実装（tenant_id、data）
  - update メソッド実装（tenant_id、id、data）
  - findByUnique メソッド実装（期間重複チェック: kpi_master_item_id + period_code）
  - WHERE句に必ずtenant_id含める
  - _Requirements: 7, 11_

- [ ] 4.6 KpiMasterEventService実装（apps/api/src/modules/kpi/kpi-master）
  - createEvent メソッド実装（DRAFT状態で作成、event_code重複チェック）
  - confirmEvent メソッド実装（DRAFT→CONFIRMED遷移、CONFIRMED時は拒否）
  - findAllEvents メソッド実装（filters適用、ページング対応）
  - findEventById メソッド実装（詳細取得）
  - 監査ログ記録（created_by、updated_by、audit_logs INSERT）
  - エラースロー（KpiMasterEventNotFoundError、KpiMasterEventAlreadyConfirmedError）
  - _Requirements: 1, 11_

- [ ] 4.7 KpiMasterItemService実装（apps/api/src/modules/kpi/kpi-master）
  - createItem メソッド実装（kpi_type別参照ID検証、kpi_managed=trueチェック）
  - updateItem メソッド実装（kpi_type・参照先変更禁止検証）
  - deleteItem メソッド実装（論理削除、CONFIRMED時は禁止、is_active=false設定）
  - findAllItems メソッド実装（階層取得、部門フィルタ適用）
  - findItemById メソッド実装（詳細取得、予実データ結合）
  - 部門別閲覧権限チェック実装:
    - admin権限チェック（epm.kpi.admin → 全社閲覧可能）
    - 全社KPIチェック（department_stable_id=NULL → 全ユーザー閲覧可能）
    - 部門IDチェック（control_department_stable_ids.includes(department_stable_id)）
    - 編集権限チェック（epm.kpi.write → 編集可能、epm.kpi.read → 閲覧のみ）
  - 監査ログ記録（created_by、updated_by）
  - エラースロー（KpiMasterItemNotFoundError、KpiMasterItemTypeImmutableError、KpiMasterItemDeleteForbiddenError、KpiMasterItemAccessDeniedError、KpiManagedSubjectNotFoundError、KpiManagedMetricNotFoundError）
  - _Requirements: 2, 3, 4, 9, 10, 11_

- [ ] 4.8 (P) KpiDefinitionService実装（apps/api/src/modules/kpi/kpi-master）
  - createDefinition メソッド実装（kpi_code重複チェック）
  - findAllDefinitions メソッド実装（company_id、keyword検索）
  - 監査ログ記録（created_by）
  - エラースロー（KpiDefinitionDuplicateError）
  - _Requirements: 2, 6, 11_

- [ ] 4.9 (P) KpiFactAmountService実装（apps/api/src/modules/kpi/kpi-master）
  - createFactAmount メソッド実装（期間重複チェック）
  - updateFactAmount メソッド実装（target_value、actual_value更新）
  - findByItemId メソッド実装（期間別取得）
  - 監査ログ記録（created_by、updated_by）
  - エラースロー（KpiFactAmountDuplicateError）
  - _Requirements: 6, 11_

- [ ] 4.10 (P) KpiTargetValueService実装（apps/api/src/modules/kpi/kpi-master）
  - createTargetValue メソッド実装（期間重複チェック）
  - updateTargetValue メソッド実装（target_value更新）
  - findByItemId メソッド実装（期間別取得）
  - 監査ログ記録（created_by）
  - エラースロー（KpiTargetValueDuplicateError）
  - _Requirements: 7, 11_

- [ ] 4.11 KpiMasterController実装（apps/api/src/modules/kpi/kpi-master）
  - KPI管理イベント操作エンドポイント実装:
    - POST /api/kpi-master/events（イベント作成）
    - PATCH /api/kpi-master/events/:id/confirm（イベント確定）
    - GET /api/kpi-master/events（イベント一覧）
    - GET /api/kpi-master/events/:id（イベント詳細）
  - KPI項目操作エンドポイント実装:
    - POST /api/kpi-master/items（KPI項目作成）
    - PATCH /api/kpi-master/items/:id（KPI項目更新）
    - DELETE /api/kpi-master/items/:id（論理削除）
    - GET /api/kpi-master/items（KPI項目一覧）
    - GET /api/kpi-master/items/:id（KPI項目詳細）
    - GET /api/kpi-master/selectable-subjects（選択可能財務科目）
    - GET /api/kpi-master/selectable-metrics（選択可能指標）
  - 非財務KPI定義エンドポイント実装:
    - POST /api/kpi-master/kpi-definitions（定義作成）
    - GET /api/kpi-master/kpi-definitions（定義一覧）
  - 非財務KPI予実エンドポイント実装:
    - POST /api/kpi-master/fact-amounts（予実作成）
    - PUT /api/kpi-master/fact-amounts/:id（予実更新）
  - 指標目標値エンドポイント実装:
    - POST /api/kpi-master/target-values（目標値作成）
    - PUT /api/kpi-master/target-values/:id（目標値更新）
  - ヘッダーからtenant_id、user_id取得（x-tenant-id、x-user-id）
  - API Contracts（2.4）との整合性確保
  - _Requirements: 1, 2, 3, 4, 5, 6, 7, 9, 11_

- [ ] 4.12 (P) Action Plan Service拡張（apps/api/src/modules/action-plan-core）
  - ActionPlanService の createActionPlan メソッド拡張
  - kpiMasterItemId パラメータ受け取り対応
  - subjectId と kpiMasterItemId の排他制約検証（どちらか1つは必須）
  - kpiMasterItemId が指定された場合、kpi_master_itemsテーブルの存在確認
  - 監査ログ記録（kpi_master_item_id記録）
  - エラースロー（KpiMasterItemNotFoundError）
  - _Requirements: 8, 11_

---

## 5. BFF Implementation（Domain API完了後）

- [ ] 5. BFF実装（Controller → Service → Mapper → Paging/Sorting正規化）

- [ ] 5.1 KpiMasterController実装（apps/bff/src/modules/kpi/kpi-master）
  - KPI管理イベント操作エンドポイント実装:
    - GET /api/bff/kpi-master/events（イベント一覧）
    - GET /api/bff/kpi-master/events/:id（イベント詳細）
    - POST /api/bff/kpi-master/events（イベント作成）
    - PATCH /api/bff/kpi-master/events/:id/confirm（イベント確定）
  - KPI項目操作エンドポイント実装:
    - GET /api/bff/kpi-master/items（KPI項目一覧）
    - GET /api/bff/kpi-master/items/:id（KPI項目詳細）
    - POST /api/bff/kpi-master/items（KPI項目作成）
    - PATCH /api/bff/kpi-master/items/:id（KPI項目更新）
    - DELETE /api/bff/kpi-master/items/:id（論理削除）
    - GET /api/bff/kpi-master/selectable-subjects（選択可能財務科目）
    - GET /api/bff/kpi-master/selectable-metrics（選択可能指標）
  - 非財務KPI定義・予実エンドポイント実装:
    - GET /api/bff/kpi-master/kpi-definitions（定義一覧）
    - POST /api/bff/kpi-master/kpi-definitions（定義作成）
    - PUT /api/bff/kpi-master/fact-amounts/:id（予実更新）
    - POST /api/bff/kpi-master/fact-amounts（予実作成）
  - 指標目標値エンドポイント実装:
    - POST /api/bff/kpi-master/target-values（目標値作成）
    - PUT /api/bff/kpi-master/target-values/:id（目標値更新）
  - Clerkミドルウェアからtenant_id、user_id取得
  - BFF Contracts（2.3）との整合性確保
  - _Requirements: 1, 2, 3, 4, 5, 6, 7, 9_

- [ ] 5.2 KpiMasterService実装（apps/bff/src/modules/kpi/kpi-master）
  - Paging/Sorting正規化実装:
    - defaults設定（page=1、pageSize=50、sortBy="eventCode"、sortOrder="asc"）
    - clamp実装（pageSize <= 200）
    - whitelist検証（sortBy許可リスト: "eventCode", "kpiCode", "kpiName", "fiscalYear", "createdAt"）
    - keyword normalize実装（trim、空→undefined）
    - page/pageSize → offset/limit変換（offset=(page-1)*pageSize）
  - Domain API呼び出し（HTTPクライアント、x-tenant-id/x-user-idヘッダー設定）
  - Error Pass-through実装（Domain APIのエラーをそのまま返す）
  - _Requirements: 1, 2, 3, 4, 5, 6, 7, 9_

- [ ] 5.3 BFF Mapper実装（API DTO → BFF DTO変換）
  - 階層構造組み立て（parent_kpi_item_id → children配列）
  - 予実データ期間別整形（fact_amounts配列 → periodMapオブジェクト）
  - 達成率計算実装（actual/target × 100、小数第1位まで）
  - 部門名・責任者名マスタ結合（department_stable_id → departmentName、owner_employee_id → ownerName）
  - ページング情報付与（page、pageSize、totalCount）
  - camelCase命名規則適用（DB snake_case → DTO camelCase）
  - _Requirements: 3, 4, 5, 6, 7_

- [ ] 5.4 (P) Action Plan BFF Controller拡張（apps/bff/src/modules/action-plan-core）
  - POST /api/bff/action-plan-core/plans エンドポイント拡張
  - CreateActionPlanDto（BFF）の kpiMasterItemId フィールド対応
  - Domain API CreateActionPlanApiDto へのマッピング追加
  - エラーハンドリング（KpiMasterItemNotFoundError）
  - _Requirements: 8_

---

## 6. UI Implementation（MockBffClient → HttpBffClient段階実装）

- [ ] 6. UI実装（v0 Mock → Migration → 本番BFF接続）

- [ ] 6.1 MockBffClient実装（apps/web/src/features/kpi/kpi-master/api）
  - BffClient interface定義（全メソッドシグネチャ）
  - MockBffClient実装（サンプルデータ返却）:
    - getEvents メソッド（KPI管理イベント一覧、DRAFT/CONFIRMED混在データ）
    - getEventById メソッド（イベント詳細、KPI項目5件含む）
    - createEvent メソッド（サンプルイベント返却）
    - confirmEvent メソッド（status更新）
    - getItems メソッド（階層構造データ、Level 1/2混在）
    - getItemById メソッド（KPI項目詳細、予実データ3期間分、AP 2件）
    - createItem、updateItem、deleteItem メソッド
    - getSelectableSubjects メソッド（kpi_managed=true の科目5件）
    - getSelectableMetrics メソッド（kpi_managed=true の指標3件）
    - getKpiDefinitions、createKpiDefinition メソッド
    - updateFactAmount、createFactAmount メソッド
    - createTargetValue、updateTargetValue メソッド
  - サンプルデータは財務・非財務・指標の3種別を含む
  - _Requirements: 1, 2, 3, 4, 5, 6, 7, 8, 9_

- [ ] 6.2 KPI管理マスタ画面実装（v0統制テスト、apps/web/_v0_drop/kpi/kpi-master/src）
  - KPI管理イベント一覧表示（Table形式、fiscal_year/event_name/status）
  - 新規イベント作成フォーム（fiscal_year、event_code、event_name入力）
  - イベント確定ボタン実装（DRAFT→CONFIRMED）
  - KPI項目追加モーダル実装（KPI種別選択: 財務/非財務/指標）
  - 財務科目選択UI（kpi_managed=trueの科目一覧、Select形式）
  - 非財務KPI選択・作成UI（kpi_definitions一覧、新規作成フォーム）
  - 指標選択UI（kpi_managed=trueの指標一覧、Select形式）
  - KPI基本情報入力（kpi_code、kpi_name、hierarchy_level、department、owner）
  - MockBffClient使用（BFF未接続）
  - _Requirements: 1, 2_

- [ ] 6.3 KPI一覧画面実装（パネル開閉式UI、v0統制テスト、apps/web/_v0_drop/kpi/kpi-master/src）
  - 階層表示実装（Accordion/Collapsible使用、Level 1 → Level 2 → Level 3ツリー）
  - 部門フィルタUI実装（Checkbox複数選択、デフォルト全選択）
  - KPIパネル実装（クリックで開閉、予実表示エリア）
  - 財務科目KPI予実表示（月次12期間、予算/見込/実績カラム、達成率カラム）
  - 非財務KPI予実表示（期間動的、目標/実績カラム、達成率カラム）
  - 指標KPI目標値表示（期間動的、目標カラム、実績は「自動計算（Phase 2）」表示）
  - アクションプラン一覧表示（パネル内、プラン名/担当者/期限/進捗率）
  - MockBffClient使用
  - _Requirements: 3, 4, 5, 7_

- [ ] 6.4 非財務KPI予実インライン編集実装（v0統制テスト、apps/web/_v0_drop/kpi/kpi-master/src）
  - セルクリック→編集モード切替
  - 目標値・実績値入力フォーム（Decimal型、0以上）
  - 保存ボタンクリック→updateFactAmount呼び出し
  - 達成率自動再計算（actual/target × 100）
  - 期間追加モーダル実装（period_code入力、プリセット選択肢: 2026-Q1〜Q4、2026-01〜12、2026-H1/H2、2026-ANNUAL）
  - フリーテキスト入力対応（カスタム期間）
  - 期間開始日・終了日入力（Optional）
  - MockBffClient使用
  - _Requirements: 6_

- [ ] 6.5 アクションプラン追加モーダル実装（v0統制テスト、apps/web/_v0_drop/kpi/kpi-master/src）
  - モーダル表示（KPIパネル内のAP追加ボタンクリック）
  - AP基本情報入力フォーム（plan_name、department、owner、deadline）
  - kpiMasterItemId自動設定（親KPI項目IDを渡す）
  - 既存 /api/bff/action-plan-core/plans エンドポイント呼び出し（kpiMasterItemId指定）
  - WBSボタン・かんばんボタン実装（画面遷移、URLパラメータにaction_plan_id）
  - MockBffClient使用
  - _Requirements: 8_

- [ ] 6.6 v0統制テスト・検証（apps/web/_v0_drop/kpi/kpi-master）
  - MockBffClientで全画面動作確認
  - KPI種別（財務/非財務/指標）の切り替え動作確認
  - 階層表示（Level 1/2/3）の開閉動作確認
  - インライン編集（セル編集・保存・キャンセル）動作確認
  - 部門フィルタ（複数選択・解除）動作確認
  - APモーダル（表示・登録・キャンセル）動作確認
  - エラーハンドリング（重複エラー、権限エラー）UI表示確認
  - _v0_drop配下のコードが apps/web/src を参照していないことを確認
  - layout.tsx が存在しないことを確認（AppShell以外の殻禁止）
  - _Requirements: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10_

- [ ] 6.7 UI Migration（v0_drop → src/features）
  - v0統制テスト合格後、apps/web/src/features/kpi/kpi-master へ移植
  - MockBffClient → HttpBffClient 差し替え
  - packages/contracts/src/bff/kpi-master のみ参照（packages/contracts/src/api参照禁止確認）
  - BFF未実装時点では一時的にMockBffClientを使用可能（段階的移行）
  - メニュー登録（menu.ts、既存タスクで完了済み）
  - _Requirements: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10_

- [ ] 6.8 HttpBffClient実装（apps/web/src/features/kpi/kpi-master/api）
  - BffClient interface実装（全メソッド）
  - fetch API使用（/api/bff/kpi-master/*エンドポイント呼び出し）
  - tenant_id/user_idはBFF側で解決（UIからヘッダー送信不要）
  - Error handling実装（BFFからのエラーレスポンス→UI表示）
  - BFF Contracts（2.3）との整合性確保
  - _Requirements: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10_

---

## 7. Integration & Validation

- [ ] 7. 統合・検証（Boundary Guard → E2E → 権限テスト）

- [ ] 7.1 Boundary Guard検証（npx tsx scripts/structure-guards.ts）
  - UI → Domain API直接呼び出しが存在しないことを確認
  - UI → packages/contracts/src/api 参照が存在しないことを確認
  - UI → HttpBffClient以外の直接fetch()が存在しないことを確認
  - BFF → DB直接アクセスが存在しないことを確認
  - Contracts-first境界が守られていることを確認
  - _Requirements: 11_

- [ ] 7.2 E2Eテスト実装（apps/web/tests/e2e/kpi-master）
  - KPI管理イベント作成・確定フロー（DRAFT→CONFIRMED）
  - KPI項目登録フロー（財務科目選択→Level 1作成→Level 2作成）
  - 非財務KPI予実入力フロー（期間追加→目標入力→実績入力→達成率確認）
  - 指標目標値入力フロー（期間追加→目標値入力）
  - アクションプラン追加フロー（モーダル表示→AP登録→一覧確認）
  - KPI項目変更・削除フロー（種別変更禁止確認、CONFIRMED削除禁止確認）
  - 階層表示・部門フィルタ動作確認
  - _Requirements: 1, 2, 3, 4, 5, 6, 7, 8, 9_

- [ ] 7.3 権限テストケース実装（apps/api/tests/integration/kpi-master）
  - epm.kpi.admin権限テスト（全社KPI閲覧・編集可能確認）
  - epm.kpi.write権限テスト（所属部門KPI編集可能確認）
  - epm.kpi.read権限テスト（所属部門KPI閲覧のみ確認）
  - 部門別閲覧権限テスト（control_department_stable_ids包含チェック）
  - 全社KPI（department_stable_id=NULL）全ユーザー閲覧確認
  - 権限なし時の403エラー確認（KpiMasterItemAccessDeniedError）
  - _Requirements: 10, 11_

- [ ] 7.4 RLS Policy検証（apps/api/tests/integration/kpi-master）
  - tenant_id境界が強制されることを確認（異テナントデータ非表示）
  - set_config('app.tenant_id')が正しく動作することを確認
  - RLS有効化されていないテーブルが存在しないことを確認
  - _Requirements: 11_

- [ ] 7.5 (P) データ整合性テスト（apps/api/tests/integration/kpi-master）
  - event_code重複禁止確認（同一company内）
  - kpi_code重複禁止確認（同一event内）
  - kpi_type・参照先変更禁止確認
  - CONFIRMED状態でのKPI項目削除禁止確認
  - period_code重複禁止確認（kpi_fact_amounts、kpi_target_values）
  - action_plans.subject_id と kpi_master_item_id 排他制約確認
  - _Requirements: 1, 2, 6, 7, 8, 9_

- [ ] 7.6 (P) 監査ログ検証（apps/api/tests/integration/kpi-master）
  - KPI管理イベント作成・確定時の監査ログ記録確認
  - KPI項目登録・更新・削除時の監査ログ記録確認
  - 非財務KPI予実更新時の監査ログ記録確認
  - アクションプラン登録時の監査ログ記録確認
  - created_by、updated_by記録確認
  - audit_logsテーブルにtenant_id、user_id、action、resource_id記録確認
  - _Requirements: 11_

---

## Requirements Coverage Matrix

| 要件ID | 対応タスク |
|--------|-----------|
| Req 1 | 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 4.1, 4.6, 4.11, 5.1, 5.2, 6.1, 6.2, 6.7, 6.8, 7.2, 7.5 |
| Req 2 | 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 4.2, 4.3, 4.7, 4.8, 4.11, 5.1, 5.2, 6.1, 6.2, 6.7, 6.8, 7.2, 7.5 |
| Req 3 | 2.1, 2.3, 2.4, 3.1, 4.2, 4.7, 4.11, 5.1, 5.2, 5.3, 6.1, 6.3, 6.7, 6.8, 7.2 |
| Req 4 | 2.3, 2.4, 3.1, 4.2, 4.7, 4.11, 5.1, 5.2, 5.3, 6.1, 6.3, 6.6, 6.7, 6.8, 7.2 |
| Req 5 | 2.3, 2.4, 3.1, 5.1, 5.2, 5.3, 6.1, 6.3, 6.7, 6.8, 7.2 |
| Req 6 | 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 4.3, 4.4, 4.8, 4.9, 4.11, 5.1, 5.2, 5.3, 6.1, 6.3, 6.4, 6.6, 6.7, 6.8, 7.2, 7.5 |
| Req 7 | 2.1, 2.3, 2.4, 3.1, 3.2, 4.5, 4.10, 4.11, 5.1, 5.2, 5.3, 6.1, 6.3, 6.7, 6.8, 7.2, 7.5 |
| Req 8 | 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 4.11, 4.12, 5.1, 5.4, 6.1, 6.5, 6.6, 6.7, 6.8, 7.2, 7.5 |
| Req 9 | 2.2, 2.3, 2.4, 3.1, 4.2, 4.7, 4.11, 5.1, 5.2, 6.1, 6.2, 6.7, 6.8, 7.2, 7.5 |
| Req 10 | 2.2, 3.1, 4.7, 6.6, 6.7, 6.8, 7.3 |
| Req 11 | 2.2, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11, 4.12, 7.1, 7.3, 7.4, 7.6 |

**全11要件すべてカバー済み** ✅

---

## Quality Checklist

実装完了前に以下を確認する：

- [ ] すべてのContracts定義が完了している（BFF + API + Shared）
- [ ] Prisma Schema + Migration + RLS Policyが適用されている
- [ ] Domain APIがビジネスルールの正本を持っている（BFF/UIは禁止）
- [ ] BFFがPaging/Sorting正規化を実施している（省略禁止）
- [ ] BFFがError Pass-throughを実施している（独自解釈禁止）
- [ ] UIがBFF Contractsのみを参照している（API Contracts参照禁止）
- [ ] MockBffClient → HttpBffClient 段階実装が完了している
- [ ] Boundary Guardがパスしている（npx tsx scripts/structure-guards.ts）
- [ ] RLS Policyが有効化されている（tenant_id境界強制）
- [ ] 監査ログが記録されている（created_by、updated_by、audit_logs）
- [ ] 全11要件がテストでカバーされている

---

## Notes

### Contracts-first Order（厳守）
1. Shared Enums/Errors（2.1, 2.2）
2. BFF Contracts（2.3）
3. API Contracts（2.4）
4. Action Plan拡張（2.5）
5. DB（3.1 → 3.2 → 3.3）
6. Domain API（4.1〜4.12）
7. BFF（5.1〜5.4）
8. UI（6.1〜6.8）
9. Integration（7.1〜7.6）

### Parallel Execution Opportunities
- タスク 2.1, 2.2, 2.5 は並列実行可能（独立したContracts定義）
- タスク 4.3, 4.4, 4.5, 4.8, 4.9, 4.10, 4.12 は並列実行可能（Repository/Service独立）
- タスク 7.5, 7.6 は並列実行可能（独立したテストケース）

### Dependencies（実行順序制約）
- 2.3（BFF Contracts）は 2.1（Shared Enums）完了後
- 2.4（API Contracts）は 2.1（Shared Enums）完了後
- 3.1（Prisma Schema）は 2.4（API Contracts）完了後
- 4.1〜4.12（Domain API）は 3.3（RLS）完了後
- 5.1〜5.4（BFF）は 4.11（API Controller）完了後
- 6.2〜6.6（UI v0）は 6.1（MockBffClient）完了後
- 6.7（UI Migration）は 6.6（v0統制テスト）合格後
- 6.8（HttpBffClient）は 5.1（BFF Controller）完了後
- 7.1〜7.6（Integration）は 6.8（HttpBffClient）完了後

### Phase 1 Constraints
- 指標の実績値自動計算はPhase 2へ延期（Phase 1は目標値管理のみ）
- 部門階層の自動権限伝播はPhase 2へ延期（Phase 1は明示的登録のみ）
- KPI項目コピー機能はPhase 2へ延期
- パネルUIの仮想化はPhase 2へ延期（Phase 1は全レンダリング）

---

## Task Execution Guidance

**推奨実行方式**:
1. タスクを1つずつ実行する（`/kiro:spec-impl kpi/kpi-master 2.1`）
2. 並列実行可能タスク（(P)マーク）は同時実行可能（`/kiro:spec-impl kpi/kpi-master 2.1,2.2,2.5`）
3. 各タスク完了後、コミット推奨（変更単位の明確化）
4. Boundary Guard（7.1）は全実装完了後に必ず実行

**実装前の必須読み込み**:
- `.kiro/specs/kpi/kpi-master/requirements.md`
- `.kiro/specs/kpi/kpi-master/design.md`
- `.kiro/specs/kpi/kpi-master/research.md`
- `.kiro/steering/tech.md`
- `.kiro/steering/structure.md`

**コンテキスト管理**:
- タスク間でコンテキストクリア推奨（履歴肥大化防止）
- 特に UI実装前にコンテキストクリア（v0生成時）
