# Implementation Plan: Permission Settings

> CCSDD / SDD 前提：**contracts-first**（bff → api → shared）を最優先し、境界違反を guard で止める。
> UI は最後。v0 は **Phase 1（統制テスト）→ Phase 2（本実装）** の二段階で扱う。

---

## 0. Design Completeness Gate（Blocking）

> Implementation MUST NOT start until all items below are checked.

- [x] 0.1 Designの「BFF Specification（apps/bff）」が埋まっている
  - BFF endpoints（13エンドポイント）が記載されている
  - Request/Response DTOが列挙されている
  - Paging/Sorting正規化が明記されている（page/pageSize、clamp≤200、whitelist）
  - 変換（api DTO → bff DTO）の方針が記載されている
  - エラー整形方針（Pass-through）が記載されている
  - tenant_id/user_id の取り回しが記載されている

- [x] 0.2 Designの「Service Specification（Domain / apps/api）」が埋まっている
  - 5つのService（Role, Menu, RolePermission, EmployeeRole, UserPermission）が列挙されている
  - トランザクション境界が記載されている
  - 監査ログ記録ポイントが記載されている

- [x] 0.3 Designの「Repository Specification（apps/api）」が埋まっている
  - 5つのRepositoryとメソッドが列挙されている
  - tenant_id必須、where句二重ガードが記載されている
  - RLS前提が記載されている

- [x] 0.4 Designの「Contracts Summary（This Feature）」が埋まっている
  - BFF DTOが詳細に列挙されている
  - API DTOはtasks.mdで詳細化（Contracts-first）
  - Error codesが定義されている

- [x] 0.5 Requirements Traceabilityが更新されている
  - 全14要件がComponent/Implementation Pointに紐づいている

- [ ] 0.6 v0生成物の受入・移植ルールが確認されている
  - v0生成は本タスクで実施

- [ ] 0.7 Structure / Boundary Guard がパスしている
  - 実装後に確認

---

## 1. Scaffold / Structure Setup

- [ ] 1.1 Feature骨格生成
  - `npx tsx scripts/scaffold-feature.ts admin permission-settings` を実行
  - 以下のディレクトリが作成されていることを確認:
    - `apps/web/src/features/admin/permission-settings`
    - `apps/bff/src/modules/admin/permission-settings`
    - `apps/api/src/modules/admin/permission-settings`
    - `apps/web/_v0_drop/admin/permission-settings`
  - _Requirements: 12.1, 12.2_

---

## 2. Contracts（BFF / API）

- [ ] 2.1 BFF Contracts 定義
  - アクセスレベル・データスコープの型定義（AccessLevel, DataScope）
  - ロール関連DTO（BffRoleListRequest/Response, BffCreateRoleRequest, BffUpdateRoleRequest, BffRoleSummary, BffRoleResponse, BffRoleDetailResponse）
  - メニュー関連DTO（BffMenuListResponse, BffMenuSummary）
  - 権限設定DTO（BffRolePermissionsResponse, BffRoleMenuPermission, BffUpdatePermissionsRequest, BffPermissionInput, BffAssignedDepartment, BffAssignedDepartmentInput）
  - 社員ロール割当DTO（BffEmployeeAssignmentListRequest/Response, BffEmployeeAssignment, BffAssignRoleRequest, BffEmployeeRoleResponse）
  - ユーザー権限DTO（BffUserPermissionsResponse, BffUserMenuPermission）
  - エラーコード定義（PermissionSettingsErrorCode, PermissionSettingsError）
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 3.1, 3.2, 5.1, 6.1, 6.2, 8.1, 9.1, 10.1_

- [ ] 2.2 (P) API Contracts 定義
  - ロール関連DTO（ApiRoleListRequest/Response, ApiCreateRoleRequest, ApiUpdateRoleRequest）
  - メニュー関連DTO（ApiMenuListResponse）
  - 権限設定DTO（ApiRolePermissionsResponse, ApiUpdatePermissionsRequest）
  - 社員ロール割当DTO（ApiEmployeeAssignmentListRequest/Response, ApiAssignRoleRequest）
  - ユーザー権限DTO（ApiUserPermissionsResponse）
  - ページング形式はoffset/limit（BFFがpage/pageSizeから変換）
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 3.1, 3.2, 5.1, 6.1, 6.2, 8.1, 9.1, 10.1_

---

## 3. DB / Migration / RLS

- [ ] 3.1 Prisma Schema 定義
  - Roleモデル（id, tenantId, companyId, roleCode, roleName, roleDescription, isActive）
  - Menuモデル（id, tenantId, companyId, menuCode, menuName, menuCategory, menuType, parentMenuId, urlPath, iconName, sortOrder, isConsolidation, isActive）
  - RoleMenuPermissionモデル（id, tenantId, companyId, roleId, menuId, accessLevel, dataScope）
  - RoleMenuDepartmentAssignmentモデル（id, tenantId, companyId, roleMenuPermissionId, departmentStableId, includeChildren）
  - EmployeeRoleモデル（id, tenantId, companyId, employeeId, roleId）
  - リレーション定義とインデックス設定
  - _Requirements: 13.1, 13.2, 14.1, 14.2, 14.3_

- [ ] 3.2 Migration 実行
  - `pnpm db:generate` でマイグレーションファイル生成
  - `pnpm db:migrate` でマイグレーション適用
  - 1社員1ロール制約（UNIQUE tenant_id, employee_id）が設定されていることを確認
  - _Requirements: 9.3, 13.1, 13.2_

- [ ] 3.3 (P) RLS Policy 設定
  - roles, menus, role_menu_permissions, role_menu_department_assignments, employee_roles の各テーブルにRLSを有効化
  - tenant_isolation ポリシーを作成（tenant_id による行レベルセキュリティ）
  - _Requirements: 12.3, 12.4_

---

## 4. Domain API（apps/api）

- [ ] 4.1 Repository 実装
  - RoleRepository（findMany, findById, create, update, countAssignedEmployees）
  - MenuRepository（findMany, findById）
  - RoleMenuPermissionRepository（findByRole, upsertMany, deleteByRole）
  - RoleMenuDepartmentAssignmentRepository（findByPermission, upsertMany, deleteByPermission）
  - EmployeeRoleRepository（findMany, findByEmployee, create, update, delete）
  - 全メソッドでtenant_id必須、where句二重ガード
  - _Requirements: 12.1, 12.2_

- [ ] 4.2 RoleService 実装
  - ロール一覧取得（キーワード検索、有効/無効フィルタ、ソート）
  - ロール詳細取得（割当社員数含む）
  - ロール新規作成（is_active=true初期化、コード重複チェック）
  - ロール更新（コード重複チェック）
  - ロール無効化（割当社員存在チェック）
  - ロール再有効化
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4_

- [ ] 4.3 (P) MenuService 実装
  - メニュー一覧取得（会社単位）
  - カテゴリ情報を含めて返却
  - 連結フラグ（is_consolidation）を返却
  - _Requirements: 5.1, 5.2_

- [ ] 4.4 RolePermissionService 実装
  - ロール権限一覧取得（メニュー情報含む）
  - ロール権限一括更新（role_menu_permissions + role_menu_department_assignments）
  - 連結メニュー権限設定時の主会社チェック
  - ASSIGNED選択時の部門必須チェック
  - トランザクション境界（権限一括更新）
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 11.1, 11.2_

- [ ] 4.5 (P) EmployeeRoleService 実装
  - 社員ロール割当一覧取得（部門フィルタ、ロールフィルタ、未割当フィルタ）
  - 社員ロール割当（1社員1ロール制約チェック）
  - 社員ロール変更
  - 社員ロール解除
  - 無効ロール割当不可チェック
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 4.6 UserPermissionService 実装
  - ログインユーザー権限情報取得
  - アクセスレベルCのメニュー除外
  - ASSIGNED部門リスト展開（include_children考慮）
  - 連結メニュー除外（非主会社の場合）
  - 未割当時は空の権限リストを返却
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 11.3_

- [ ] 4.7 Controller 実装
  - RoleController（GET/POST/PATCH/POST deactivate/POST activate）
  - MenuController（GET）
  - RolePermissionController（GET/PUT permissions）
  - EmployeeRoleController（GET/POST/DELETE assignments）
  - UserPermissionController（GET /user/permissions）
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 4.2, 5.1, 6.1, 6.2, 8.1, 9.1, 9.4, 10.1_

- [ ] 4.8 Module 登録
  - PermissionSettingsModule を作成し、AppModuleに登録
  - 各Controller, Service, Repositoryを適切にimport/export
  - _Requirements: 12.1_

---

## 5. BFF（apps/bff）

- [ ] 5.1 Domain API Client 実装
  - Domain APIへのHTTPリクエストを行うクライアント
  - tenant_id, user_idのヘッダー伝搬
  - エラーレスポンスの透過（Pass-through）
  - _Requirements: 12.1, 12.2_

- [ ] 5.2 BFF Mapper 実装
  - API DTO → BFF DTO の変換
  - page/pageSize → offset/limit 変換
  - レスポンスにpage/pageSize/totalCountを含める
  - _Requirements: 1.1, 6.1, 8.1_

- [ ] 5.3 BFF Service 実装
  - ロール一覧取得（ページング正規化、ソートwhitelist）
  - 連結メニューフィルタリング（主会社チェック）
  - 権限設定取得・更新
  - 社員ロール割当一覧取得（ページング正規化）
  - ユーザー権限情報取得
  - _Requirements: 1.1, 5.3, 5.4, 6.1, 8.1, 10.1, 11.3_

- [ ] 5.4 BFF Controller 実装
  - 13エンドポイントの実装
  - リクエストバリデーション
  - エラーハンドリング（Pass-through）
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 4.2, 5.1, 6.1, 6.2, 7.1, 8.1, 9.1, 9.4, 10.1_

- [ ] 5.5 Module 登録
  - PermissionBffModule を作成し、AppModuleに登録
  - _Requirements: 12.1_

---

## 6. UI Phase 1: v0 統制テスト

- [ ] 6.1 v0 Prompt 作成
  - design.mdのBFF Specificationを基にプロンプト作成
  - 禁止事項（layout.tsx生成禁止、生カラーリテラル禁止、直接fetch禁止）を明記
  - MockBffClientの使用を指示
  - _Requirements: 1.1, 5.1, 8.1_

- [ ] 6.2 v0 UI 生成・受入
  - ロール管理画面（一覧、新規作成ダイアログ、編集ダイアログ、無効化/再有効化）
  - 権限設定画面（メニュー一覧、アクセスレベル/データスコープ選択、部門選択ダイアログ）
  - 社員ロール割当画面（社員一覧、ロール割当ドロップダウン、フィルタ）
  - v0生成物を `_v0_drop/admin/permission-settings/src` に配置
  - MockBffClientで動作確認
  - _Requirements: 1.1, 2.1, 5.1, 6.1, 7.1, 8.1, 9.1_

- [ ] 6.3 Structure Guard 実行
  - `npx tsx scripts/structure-guards.ts` を実行
  - UI → Domain API直接呼び出しがないこと確認
  - UI → contracts/api参照がないこと確認
  - _Requirements: 12.1_

---

## 7. UI Phase 2: 本実装・統合

- [ ] 7.1 v0 UI 移植
  - `_v0_drop` から `features/admin/permission-settings` へ移植
  - import パス修正（@/shared/ui）
  - DTO import修正（@contracts/bff/permission-settings）
  - _Requirements: 1.1, 5.1, 8.1_

- [ ] 7.2 HttpBffClient 実装
  - MockBffClientをHttpBffClientに切り替え
  - 実BFFエンドポイントへの接続
  - エラーハンドリング
  - _Requirements: 1.1, 2.1, 5.1, 6.1, 8.1, 9.1, 10.1_

- [ ] 7.3 App Router 登録
  - `apps/web/src/app/admin/permission-settings/page.tsx` 作成
  - サブルート（roles, employee-assignments）の設定
  - _Requirements: 1.1, 5.1, 8.1_

- [ ] 7.4 Navigation 登録
  - `apps/web/src/shared/navigation/menu.ts` にメニュー追加
  - 管理者向けメニューとして配置
  - _Requirements: 1.1_

---

## 8. Integration Test

- [ ] 8.1 E2E 動作確認
  - ロール作成 → 権限設定 → 社員割当 の一連フロー
  - 連結メニューの主会社フィルタ確認
  - 1社員1ロール制約の動作確認
  - ASSIGNED部門指定の動作確認
  - _Requirements: 1.1, 2.1, 5.1, 6.1, 7.1, 8.1, 9.1, 9.3, 11.1_

- [ ] 8.2 ユーザー権限取得確認
  - ログインユーザーの権限情報取得APIの動作確認
  - アクセスレベルCのメニュー除外確認
  - ASSIGNED部門リストの展開確認
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 8.3 (P) マルチテナント分離確認
  - 異なるテナントのデータが分離されていること確認
  - RLSが正しく動作していること確認
  - _Requirements: 12.1, 12.3, 12.4_

---

## Requirements Coverage

| Requirement | Tasks |
|-------------|-------|
| 1.1, 1.2, 1.3, 1.4 | 2.1, 2.2, 4.2, 4.7, 5.2, 5.3, 5.4, 6.2, 7.1, 7.2, 7.3, 7.4, 8.1 |
| 2.1, 2.2, 2.3, 2.4, 2.5 | 2.1, 2.2, 4.2, 4.7, 5.4, 6.2, 7.2, 8.1 |
| 3.1, 3.2, 3.3, 3.4 | 2.1, 2.2, 4.2, 4.7, 5.4 |
| 4.1, 4.2, 4.3, 4.4 | 2.1, 4.2, 4.7, 5.4, 8.1 |
| 5.1, 5.2, 5.3, 5.4 | 2.1, 2.2, 4.3, 4.7, 5.3, 5.4, 6.2, 7.1, 8.1 |
| 6.1, 6.2, 6.3, 6.4, 6.5, 6.6 | 2.1, 2.2, 4.4, 4.7, 5.3, 5.4, 6.2, 7.2, 8.1 |
| 7.1, 7.2, 7.3, 7.4, 7.5, 7.6 | 2.1, 4.4, 5.4, 6.2, 8.1 |
| 8.1, 8.2, 8.3, 8.4, 8.5 | 2.1, 2.2, 4.5, 4.7, 5.2, 5.3, 5.4, 6.2, 7.1, 8.1 |
| 9.1, 9.2, 9.3, 9.4, 9.5 | 2.1, 2.2, 3.2, 4.5, 4.7, 5.4, 6.2, 7.2, 8.1 |
| 10.1, 10.2, 10.3, 10.4, 10.5 | 2.1, 2.2, 4.6, 4.7, 5.3, 5.4, 7.2, 8.2 |
| 11.1, 11.2, 11.3 | 4.4, 4.6, 5.3, 8.1, 8.2 |
| 12.1, 12.2, 12.3, 12.4 | 1.1, 3.3, 4.1, 4.8, 5.1, 5.5, 6.3, 8.3 |
| 13.1, 13.2, 13.3 | 3.1, 3.2, 4.2 |
| 14.1, 14.2, 14.3, 14.4 | 3.1 |
