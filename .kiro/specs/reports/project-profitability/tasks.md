# Implementation Plan

> CCSDD / SDD 前提：**contracts-first**（bff → api → shared）を最優先し、境界違反を guard で止める。
> UI は最後。v0 は **Phase 1（統制テスト）→ Phase 2（本実装）** の二段階で扱う。

---

## 0. Design Completeness Gate（Blocking）

> Implementation MUST NOT start until all items below are checked.
> These checks are used to prevent "empty design sections" from being silently interpreted by implementers/AI.

- [ ] 0.1 Designの「BFF Specification（apps/bff）」が埋まっている
  - BFF endpoints（UIが叩く）が記載されている
  - Request/Response DTO（packages/contracts/src/bff）が列挙されている
  - **Paging/Sorting正規化（必須）が明記されている**
    - UI/BFF: page/pageSize、Domain API: offset/limit
    - defaults（page=1, pageSize=20, sortBy=projectName, sortOrder=asc）
    - clamp（pageSize≤100）
    - whitelist（sortBy許可リスト）
    - normalize（keyword trim、空→undefined）
    - transform（page→offset/limit）
  - 変換（api DTO → bff DTO）の方針が記載されている
  - エラー整形方針（Pass-through）が記載されている
  - tenant_id/user_id の取り回し（解決・伝搬ルール）が記載されている

- [ ] 0.2 Designの「Service Specification（Domain / apps/api）」が埋まっている
  - Usecase（listProjects, getProjectDetail, getMonthlyTrend）が列挙されている
  - 主要ビジネスルール（着地予測算出、警告判定）が記載されている
  - トランザクション境界（READ ONLY）が記載されている
  - 監査ログ記録ポイント（アクセスログ）が記載されている

- [ ] 0.3 Designの「Repository Specification（apps/api）」が埋まっている
  - 取得メソッド一覧（findProjectsWithSummary, findProjectDetail, findMonthlyAmounts）が記載されている
  - where句二重ガードの方針（tenant_id常時指定）が記載されている
  - RLS前提（set_config前提）が記載されている

- [ ] 0.4 Designの「Contracts Summary（This Feature）」が埋まっている
  - packages/contracts/src/bff/project-profitability 側のDTOが列挙されている
  - Error Codes（ProjectProfitabilityErrorCode）が列挙されている
  - 「UIは packages/contracts/src/api を参照しない」ルールが明記されている

- [ ] 0.5 Requirements Traceability が更新されている
  - 全6要件（28件のAC）が設計要素に紐づいている

- [ ] 0.6 v0生成物の受入・移植ルールが確認されている
  - v0生成物は `apps/web/_v0_drop/reports/project-profitability/src` に一次格納
  - layout.tsx 生成禁止が確認されている
  - UIは MockBffClient で動作確認される

- [ ] 0.7 Structure / Boundary Guard がパスしている
  - UI → Domain API の直接呼び出しが存在しない
  - UIでの直接 fetch() が存在しない

---

## 1. Contracts 定義（BFF → Error）

- [ ] 1.1 (P) BFF Contracts を定義する
  - PJ一覧取得のリクエスト/レスポンス型を定義
  - BffProjectListRequest（page, pageSize, sortBy, sortOrder, keyword, departmentStableId, status）を作成
  - BffProjectListResponse, BffProjectSummary を作成
  - ソートキーとして projectName, departmentName, revenueBudget, revenueProjection, grossProfitRate を許可
  - ProjectStatus 列挙型を定義（PLANNED, ACTIVE, ON_HOLD, CLOSED）
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_

- [ ] 1.2 (P) BFF Detail Contracts を定義する
  - PJ詳細取得のレスポンス型を定義
  - BffProjectDetailResponse（基本情報、主要指標、KPI、警告フラグ）を作成
  - BffProjectMetrics（売上高/売上原価/粗利/営業利益の予算・実績・見込・着地予測・差異）を作成
  - BffDirectCostingMetrics（変動費/限界利益/固定費/貢献利益）を作成
  - BffProjectKpis（売上進捗率、予算消化率、粗利率、限界利益率）を作成
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 3.1, 3.2, 3.3_

- [ ] 1.3 (P) BFF Filter/Trend Contracts を定義する
  - フィルター選択肢取得のレスポンス型を定義
  - BffProjectFiltersResponse, BffDepartmentOption, BffStatusOption を作成
  - 月別推移のレスポンス型を定義
  - BffProjectMonthlyTrendResponse, BffMonthlyValues を作成
  - _Requirements: 1.3, 1.4, 4.1, 4.2_

- [ ] 1.4 Error Codes を定義する
  - ProjectProfitabilityErrorCode 定義（PROJECT_NOT_FOUND, NO_DATA_FOUND, INVALID_FILTER, PERMISSION_DENIED）
  - ProjectProfitabilityError インターフェース定義
  - packages/contracts/src/bff/project-profitability/index.ts に配置
  - _Requirements: 6.3_

---

## 2. Domain API 実装

- [ ] 2.1 ProjectProfitability Repository を実装する
  - findProjectsWithSummary（サマリ集計付きPJ一覧取得）
  - findProjectDetail（主要指標・KPI集計付きPJ詳細取得）
  - findMonthlyAmounts（月別金額取得）
  - 会社マスタから主要科目IDを取得して集計
  - fact_amounts の scenario_type で BUDGET/ACTUAL/FORECAST をピボット
  - 全メソッドで tenant_id を第一引数として必須化
  - _Requirements: 1.1, 1.8, 2.3, 5.1, 5.2, 6.1, 6.2_

- [ ] 2.2 ProjectProfitability Service を実装する
  - PJ一覧取得（フィルタリング・ソート・ページング対応）
  - PJ詳細取得（指標集計・KPI算出）
  - 着地予測の算出（実績累計 + 残期間見込）
  - 予算差異の算出（着地予測 - 予算）
  - KPI算出（売上進捗率、予算消化率、粗利率、限界利益率）
  - 警告判定（粗利マイナス→isWarning、営業利益マイナス→isProjectionNegative）
  - 直接原価計算指標の算出（会社設定に応じてオプション）
  - _Requirements: 2.4, 2.5, 2.6, 2.7, 3.1, 3.2, 3.3_

- [ ] 2.3 Domain API Controller を実装する
  - PJ一覧エンドポイント（GET /api/reports/project-profitability）
  - PJ詳細エンドポイント（GET /api/reports/project-profitability/:id）
  - x-tenant-id / x-user-id ヘッダーから認証情報取得
  - RLS set_config 呼び出し
  - _Requirements: 6.1, 6.2_

- [ ] 2.4 Domain API Module を登録する
  - ProjectProfitabilityModule 作成
  - Controller, Service, Repository を providers/controllers に登録
  - PrismaModule をインポート
  - AppModule への登録
  - _Requirements: 5.1, 5.2, 5.3_

---

## 3. BFF 実装

- [ ] 3.1 Domain API Client を実装する
  - Domain API の各エンドポイントを呼び出すクライアント
  - x-tenant-id / x-user-id ヘッダー付与
  - エラーレスポンスのハンドリング（Pass-through）
  - _Requirements: 6.2_

- [ ] 3.2 Paging/Filter Normalizer を実装する
  - page/pageSize → offset/limit 変換
  - defaults 適用（page=1, pageSize=20, sortBy=projectName, sortOrder=asc）
  - clamp 処理（pageSize ≤ 100）
  - sortBy whitelist 検証
  - keyword 正規化（trim、空→undefined）
  - _Requirements: 1.6, 1.8, 5.3_

- [ ] 3.3 Response Mapper を実装する
  - API DTO → BFF DTO 変換
  - snake_case → camelCase 変換
  - Decimal(string) → number 変換
  - BffProjectSummary, BffProjectDetailResponse への変換
  - _Requirements: 1.2, 2.2, 2.3_

- [ ] 3.4 BFF Service を実装する
  - PJ一覧取得（正規化・変換・レスポンス整形）
  - PJ詳細取得（指標・KPI・直接原価計算の整形）
  - フィルター選択肢取得（部門・ステータス）
  - 月別推移取得
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 4.1, 4.2_

- [ ] 3.5 BFF Controller を実装する
  - PJ一覧エンドポイント（GET /api/bff/reports/project-profitability）
  - PJ詳細エンドポイント（GET /api/bff/reports/project-profitability/:id）
  - フィルター選択肢エンドポイント（GET /api/bff/reports/project-profitability/filters）
  - 認証ミドルウェアから tenant_id / user_id 取得
  - _Requirements: 1.1, 2.1, 6.2_

- [ ] 3.6 BFF Module を登録する
  - ProjectProfitabilityModule 作成
  - Controller, Service, Mapper, Normalizer, DomainApiClient を登録
  - AppModule への登録
  - _Requirements: 5.1, 5.2_

---

## 4. UI 実装（Phase 1: v0 統制テスト）

- [ ] 4.1 v0 Prompt を使用して UI を生成する
  - Split View形式（左: PJ一覧、右: PJ詳細）のレイアウト生成
  - 検索・フィルターパネル生成
  - PJ一覧テーブル生成（警告アイコン、ソート対応）
  - PJ詳細パネル生成（基本情報、指標テーブル、KPIカード）
  - 月別推移テーブル生成
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 4.1_

- [ ] 4.2 v0 生成物を隔離ゾーンに取得する
  - `_v0_drop/reports/project-profitability/src` に取得
  - OUTPUT.md 確認
  - layout.tsx が存在しないことを確認
  - _Requirements: 1.1_

- [ ] 4.3 MockBffClient を実装する
  - BffClient インターフェース定義
  - MockBffClient でダミーデータを返却
  - PJ一覧のモックデータ作成（警告PJ含む）
  - PJ詳細のモックデータ作成（主要指標・KPI含む）
  - 直接原価計算指標のモックデータ作成
  - _Requirements: 1.1, 1.7, 2.1, 3.1_

- [ ] 4.4 Structure Guard を実行する
  - structure-guards.ts を実行
  - UI → Domain API 直接呼び出しがないことを確認
  - packages/contracts/src/api への参照がないことを確認
  - 直接 fetch() がないことを確認
  - _Requirements: 6.2_

---

## 5. UI 実装（Phase 2: 本実装・移植）

- [ ] 5.1 v0 生成物を features に移植する
  - v0-migrate.ts で `apps/web/src/features/reports/project-profitability/` に移植
  - import パス修正（@/shared/ui を使用）
  - DTO import 修正（@contracts/bff/project-profitability を使用）
  - _Requirements: 1.1_

- [ ] 5.2 PJ一覧コンポーネントを実装する
  - 検索・フィルターパネル（キーワード、部門、ステータス）
  - PJ一覧テーブル（ソート切替、警告アイコン表示）
  - ページネーションコンポーネント
  - PJ選択時の詳細パネル連携
  - 粗利マイナスPJへの警告アイコン表示
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_

- [ ] 5.3 PJ詳細コンポーネントを実装する
  - 基本情報表示（PJコード、PJ名、部門、責任者、期間、ステータス）
  - 主要指標サマリテーブル（予算・実績・見込・着地予測・差異）
  - マイナス差異の赤字表示
  - 営業利益マイナス時の赤字警告表示
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.7_

- [ ] 5.4 KPI・直接原価計算コンポーネントを実装する
  - KPIカード表示（売上進捗率、予算消化率、粗利率）
  - 直接原価計算指標テーブル（会社設定に応じて表示/非表示）
  - 限界利益率のKPI表示（直接原価計算有効時のみ）
  - _Requirements: 2.6, 3.1, 3.2, 3.3_

- [ ] 5.5 月別推移コンポーネントを実装する
  - 月別推移テーブル（行: 科目、列: 月）
  - 予算・実績・見込の3行表示
  - 展開/折りたたみ機能
  - _Requirements: 4.1, 4.2_

- [ ] 5.6 HttpBffClient を実装して BFF に接続する
  - HttpBffClient 実装
  - 全エンドポイントへの接続
  - エラーハンドリング（コードに基づく表示切替）
  - 権限エラー時のアクセス拒否表示
  - _Requirements: 1.1, 2.1, 5.1, 5.2, 5.3, 6.3_

- [ ] 5.7 App Router・Navigation を登録する
  - `apps/web/src/app/reports/project-profitability/page.tsx` 作成
  - `apps/web/src/shared/navigation/menu.ts` に追加
  - 権限チェック（epm.project.read）の適用
  - _Requirements: 6.3, 6.4_

---

## 6. 統合テスト

- [ ] 6.1 PJ一覧表示の統合テストを実施する
  - PJ一覧取得が動作する
  - フィルタリング（部門、ステータス、キーワード）が動作する
  - ソート切替が動作する
  - ページネーションが動作する
  - 警告アイコンが粗利マイナスPJに表示される
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_

- [ ] 6.2 PJ詳細表示の統合テストを実施する
  - PJ詳細取得が動作する
  - 基本情報が正しく表示される
  - 主要指標サマリが正しく表示される
  - 着地予測・予算差異が正しく算出・表示される
  - KPIが正しく表示される
  - 赤字警告が営業利益マイナス時に表示される
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

- [ ] 6.3 直接原価計算の統合テストを実施する
  - 直接原価計算科目が設定された会社で指標が表示される
  - 未設定の会社で指標が非表示になる
  - 限界利益率が正しく表示される
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 6.4 月別推移の統合テストを実施する
  - 月別推移データが取得・表示される
  - テーブル形式で予算・実績・見込が表示される
  - _Requirements: 4.1, 4.2_

- [ ] 6.5 性能要件の統合テストを実施する
  - PJ一覧の初期表示が3秒以内に完了する（100件以下）
  - PJ詳細の表示が1秒以内に完了する
  - フィルター・ソート操作が1秒以内に応答する
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 6.6 マルチテナント・権限制御の統合テストを実施する
  - 自テナント・会社のPJのみ表示される
  - 異なるテナントのPJにアクセスできない
  - 権限なしユーザーがアクセス拒否される
  - 部門フィルターに閲覧可能範囲の部門のみ表示される
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

---

## Requirements Coverage

| Requirement | Task |
|-------------|------|
| 1.1 PJ一覧表示 | 1.1, 2.1, 3.4, 3.5, 4.1, 4.2, 4.3, 5.1, 5.2, 5.6, 6.1 |
| 1.2 サマリ情報表示 | 1.1, 3.3, 5.2, 6.1 |
| 1.3 部門フィルター | 1.3, 3.4, 5.2, 6.1 |
| 1.4 ステータスフィルター | 1.3, 3.4, 5.2, 6.1 |
| 1.5 キーワード検索 | 1.1, 3.2, 5.2, 6.1 |
| 1.6 ソート | 1.1, 3.2, 5.2, 6.1 |
| 1.7 警告アイコン | 1.1, 4.3, 5.2, 6.1 |
| 1.8 ページネーション | 1.1, 2.1, 3.2, 5.2, 6.1 |
| 2.1 PJ詳細表示 | 1.2, 3.4, 3.5, 4.1, 4.3, 5.3, 5.6, 6.2 |
| 2.2 基本情報表示 | 1.2, 3.3, 4.1, 5.3, 6.2 |
| 2.3 主要指標サマリ | 1.2, 2.1, 3.3, 5.3, 6.2 |
| 2.4 着地予測算出 | 1.2, 2.2, 5.3, 6.2 |
| 2.5 予算差異算出 | 1.2, 2.2, 5.3, 6.2 |
| 2.6 KPI表示 | 1.2, 2.2, 5.4, 6.2 |
| 2.7 赤字警告 | 1.2, 2.2, 5.3, 6.2 |
| 3.1 直接原価計算表示判定 | 1.2, 2.2, 4.3, 5.4, 6.3 |
| 3.2 直接原価指標表示 | 1.2, 2.2, 5.4, 6.3 |
| 3.3 限界利益率表示 | 1.2, 2.2, 5.4, 6.3 |
| 4.1 月別推移表示 | 1.3, 3.4, 4.1, 5.5, 6.4 |
| 4.2 テーブル形式表示 | 1.3, 5.5, 6.4 |
| 5.1 一覧表示性能 | 2.1, 2.4, 3.6, 5.6, 6.5 |
| 5.2 詳細表示性能 | 2.1, 2.4, 3.6, 5.6, 6.5 |
| 5.3 操作応答性能 | 2.4, 3.2, 5.6, 6.5 |
| 6.1 テナント・会社フィルタ | 2.1, 2.3, 6.6 |
| 6.2 tenant_id/user_id伝搬 | 2.3, 3.1, 3.5, 4.4, 6.6 |
| 6.3 権限チェック | 1.4, 5.6, 5.7, 6.6 |
| 6.4 部門閲覧制限 | 5.7, 6.6 |

---

## Notes

- **Contracts-first** 順序を厳守：1（Contracts）→ 2（API）→ 3（BFF）→ 4/5（UI）→ 6（統合テスト）
- タスク 1.1〜1.3 は並列実行可能（(P) マーカー付き）
- UI は Phase 1（v0 統制テスト）→ Phase 2（本実装）の2段階で進行
- 本機能は照会専用のため、DB Migration / RLS追加タスクは不要（既存テーブル使用）
- 着地予測・警告判定は Domain API の責務（ビジネスルール）
- 直接原価計算指標は会社設定に応じてオプション表示
