# Design Document: Permission Settings

---

## Spec Reference（INPUT情報）

本設計を作成するにあたり、以下の情報を確認した：

### Requirements（直接INPUT）
- **参照ファイル**: `.kiro/specs/admin/permission-settings/requirements.md`
- **要件バージョン**: 2026-01-13

### 仕様概要（確定済み仕様）
- **参照ファイル**: `.kiro/specs/仕様概要/権限設定.md`
- **設計に影響する仕様ポイント**:
  - 会社単位の権限管理（1社員1会社、1社員1ロール）
  - アクセスレベル3段階（A/B/C）とデータスコープ3種類（ALL/HIERARCHY/ASSIGNED）
  - 連結機能は主会社のみ使用可能（tenants.primary_company_id）
  - ASSIGNED時のinclude_childrenオプション

### エンティティ定義（Data Model 正本）
- **参照ファイル**: `.kiro/specs/entities/01_各種マスタ.md`
- **対象エンティティ**:
  - tenants (セクション 1.1)
  - roles (セクション 5.4)
  - employee_roles (セクション 5.4)
  - menus (セクション 5.5)
  - role_menu_permissions (セクション 5.6)
  - role_menu_department_assignments (セクション 5.7)

### 仕様検討（経緯・背景）
- **参照ファイル**: `.kiro/specs/仕様検討/20260113_権限設定.md`
- **設計判断に影響した経緯**: QA壁打ちにより、会社スコープ・権限モデル・アクセスレベル・データスコープの方針を決定

---

## INPUT整合性チェック

| チェック項目 | 確認結果 |
|-------------|---------|
| requirements.md との整合性 | 設計が全要件をカバーしている: ✅ |
| 仕様概要との整合性 | 設計が仕様概要と矛盾しない: ✅ |
| エンティティとの整合性 | Data Model がエンティティ定義に準拠: ✅ |
| 仕様検討の背景理解 | 設計判断の背景を確認した: ✅ |

---

## Overview

本機能は、EPM SaaSにおける「機能ベースの権限管理」を実現する。会社単位でロールを定義し、ロールごとに各機能（メニュー）へのアクセスレベル（A/B/C）とデータスコープ（ALL/HIERARCHY/ASSIGNED）を設定する。社員にロールを割り当てることでアクセス制御を実現する。

主要な画面として「ロール管理」「権限設定」「社員ロール割当」の3画面を提供し、ログイン時にユーザー権限情報を返却するAPIを提供する。社員ロール割当画面では、ロールを選択して複数社員に一括で割り当てる機能も提供する。連結機能（is_consolidation=true）は主会社（tenants.primary_company_id）の社員のみがアクセス可能とする。

---

## Architecture

### Architecture Pattern & Boundary Map

**Pattern (fixed)**:
- UI（apps/web） → BFF（apps/bff） → Domain API（apps/api） → DB（PostgreSQL + RLS）
- UI直APIは禁止

**Contracts (SSoT)**:
- UI ↔ BFF: `packages/contracts/src/bff/permission-settings`
- BFF ↔ Domain API: `packages/contracts/src/api/permission-settings`
- Enum/Error: `packages/contracts/src/bff/permission-settings`（Error含む）
- UI は `packages/contracts/src/api` を参照してはならない

**Sequence Diagram**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                     Permission Settings - Architecture                  │
└────────────────────────────────────────────────────────────────────────┘

    UI (apps/web)              BFF (apps/bff)           Domain API (apps/api)         DB (PostgreSQL)
         │                          │                           │                           │
         │ GET /roles               │                           │                           │
         ├─────────────────────────>│ GET /api/admin/           │                           │
         │                          │    permission/roles       │                           │
         │                          ├──────────────────────────>│ SELECT roles              │
         │                          │                           ├──────────────────────────>│
         │                          │                           │<──────────────────────────┤
         │                          │<──────────────────────────┤                           │
         │<─────────────────────────┤                           │                           │
         │                          │                           │                           │
```

---

## Architecture Responsibilities（Mandatory）

### BFF Specification（apps/bff）

**Purpose**
- UI要件に最適化したAPI（Read Model / ViewModel）
- Domain APIのレスポンスを集約・変換（ビジネスルールの正本は持たない）
- 連結メニューのフィルタリング（主会社チェック）

**BFF Endpoints（UIが叩く）**

| Method | Endpoint | Purpose | Request DTO | Response DTO | Notes |
|--------|----------|---------|-------------|--------------|-------|
| GET | /api/bff/admin/permission/roles | ロール一覧取得 | BffRoleListRequest | BffRoleListResponse | クエリパラメータ |
| POST | /api/bff/admin/permission/roles | ロール新規作成 | BffCreateRoleRequest | BffRoleResponse | - |
| GET | /api/bff/admin/permission/roles/:id | ロール詳細取得 | - | BffRoleDetailResponse | - |
| PATCH | /api/bff/admin/permission/roles/:id | ロール編集 | BffUpdateRoleRequest | BffRoleResponse | - |
| POST | /api/bff/admin/permission/roles/:id/deactivate | ロール無効化 | - | BffRoleResponse | - |
| POST | /api/bff/admin/permission/roles/:id/activate | ロール再有効化 | - | BffRoleResponse | - |
| GET | /api/bff/admin/permission/menus | メニュー一覧取得 | - | BffMenuListResponse | 連結メニューフィルタ |
| GET | /api/bff/admin/permission/roles/:id/permissions | ロール権限取得 | - | BffRolePermissionsResponse | - |
| PUT | /api/bff/admin/permission/roles/:id/permissions | ロール権限一括更新 | BffUpdatePermissionsRequest | BffRolePermissionsResponse | - |
| GET | /api/bff/admin/permission/employee-assignments | 社員ロール割当一覧 | BffEmployeeAssignmentListRequest | BffEmployeeAssignmentListResponse | - |
| POST | /api/bff/admin/permission/employee-assignments | 社員ロール割当 | BffAssignRoleRequest | BffEmployeeRoleResponse | - |
| DELETE | /api/bff/admin/permission/employee-assignments/:employeeId | 社員ロール解除 | - | void | - |
| GET | /api/bff/user/permissions | ユーザー権限情報取得 | - | BffUserPermissionsResponse | ログイン時取得 |

**Naming Convention（必須）**
- DTO / Contracts: camelCase（例: `roleCode`, `roleName`, `accessLevel`）
- DB columns: snake_case（例: `role_code`, `role_name`, `access_level`）
- `sortBy` は **DTO側キー**を採用する（例: `roleCode | roleName`）
- DB列名（snake_case）を UI/BFF へ露出させない

**Paging / Sorting Normalization（必須・BFF責務）**

ロール一覧・社員ロール割当一覧で使用：
- UI/BFF: page / pageSize（page-based）
- Domain API: offset / limit（DB-friendly）
- BFFは必ず以下を実施する：
  - defaults: page=1, pageSize=50, sortBy=roleCode, sortOrder=asc
  - clamp: pageSize <= 200
  - whitelist: sortBy は許可リストのみ
    - ロール一覧: `roleCode`, `roleName`, `assignedEmployeeCount`
    - 社員割当一覧: `employeeCode`, `employeeName`, `departmentName`, `roleName`
  - normalize: keyword trim、空→undefined
  - transform: offset=(page-1)*pageSize, limit=pageSize
- Domain APIに渡すのは offset/limit（page/pageSizeは渡さない）
- BFFレスポンスには page/pageSize/totalCount を含める

**Transformation Rules（api DTO → bff DTO）**
- field rename: なし（統一命名）
- omit: なし
- default: アクセスレベル未設定のメニューは `accessLevel: 'C'`, `dataScope: 'ALL'`
- 連結メニュー: 主会社でない場合は一覧から除外

**Error Handling（contracts errorに準拠）**

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| ROLE_NOT_FOUND | 404 | 指定されたロールが存在しない |
| ROLE_CODE_DUPLICATE | 409 | 同一会社内でロールコードが重複 |
| ROLE_HAS_EMPLOYEES | 409 | 社員が割り当てられているため無効化不可 |
| ROLE_ALREADY_INACTIVE | 409 | 既に無効化されている |
| ROLE_ALREADY_ACTIVE | 409 | 既に有効である |
| ROLE_INACTIVE | 400 | 無効なロールは割り当て不可 |
| EMPLOYEE_NOT_FOUND | 404 | 指定された社員が存在しない |
| EMPLOYEE_ALREADY_ASSIGNED | 409 | 既にロールが割り当て済み（1社員1ロール制約） |
| MENU_NOT_FOUND | 404 | 指定されたメニューが存在しない |
| CONSOLIDATION_MENU_RESTRICTED | 403 | 連結機能は主会社でのみ使用可能 |
| ASSIGNED_DEPARTMENTS_REQUIRED | 400 | ASSIGNED選択時は部門を1件以上指定必須 |
| VALIDATION_ERROR | 400 | 入力値バリデーションエラー |

**Error Policy（必須）**
- 採用方針：**Option A: Pass-through**
- 採用理由：
  - 権限設定は管理者向け機能であり、エラーメッセージの詳細表示が有用
  - Domain APIのエラーをそのまま返却することで、デバッグ・運用が容易
  - UI側でエラーコードに基づく表示制御を行う

**Authentication / Tenant Context**
- tenant_id: 認証ミドルウェアで解決し、ヘッダー `x-tenant-id` でDomain APIに伝搬
- user_id: 認証ミドルウェアで解決し、ヘッダー `x-user-id` でDomain APIに伝搬
- company_id: BFFがユーザーの所属会社を解決し、クエリパラメータまたはBodyで伝搬

---

### Service Specification（Domain / apps/api）

**Purpose**
- ビジネスルールの正本
- ロール管理、権限設定、社員ロール割当のビジネスロジック
- 監査ログ記録

**Services**

| Service | Responsibility |
|---------|----------------|
| RoleService | ロールCRUD、無効化/再有効化、割当社員数カウント |
| MenuService | メニュー一覧取得（連結フィルタはBFF責務） |
| RolePermissionService | ロール×メニュー権限設定、部門指定管理 |
| EmployeeRoleService | 社員ロール割当、解除、1社員1ロール制約チェック |
| UserPermissionService | ログインユーザー権限情報取得 |

**Transaction Boundary**
- ロール作成/更新: 単一トランザクション
- 権限一括更新: 単一トランザクション（role_menu_permissions + role_menu_department_assignments）
- 社員ロール割当: 単一トランザクション

**Audit Points**
- ロールの作成・更新・無効化・再有効化: created_at/updated_at 自動記録
- 権限設定の変更: created_at/updated_at 自動記録
- 社員ロール割当の変更: created_at/updated_at 自動記録

**Business Rules**
- 1社員1ロール制約: employee_roles に UNIQUE(tenant_id, employee_id) でDB制約
- ロール無効化前チェック: 割当社員が存在する場合はエラー
- 連結メニュー権限設定: 主会社以外での設定はエラー（Domain APIで拒否）
- ASSIGNED部門必須: data_scope=ASSIGNED の場合、部門指定が1件以上必要

---

### Repository Specification（apps/api）

**Repositories**

| Repository | Table | Methods |
|------------|-------|---------|
| RoleRepository | roles | findMany, findById, create, update, countByCompany |
| MenuRepository | menus | findMany, findById, findByCompany |
| RoleMenuPermissionRepository | role_menu_permissions | findByRole, upsertMany, deleteByRole |
| RoleMenuDepartmentAssignmentRepository | role_menu_department_assignments | findByPermission, upsertMany, deleteByPermission |
| EmployeeRoleRepository | employee_roles | findMany, findByEmployee, create, update, delete |

**tenant_id 必須ルール**
- すべてのメソッドで tenant_id を必須パラメータとして受け取る
- where句に tenant_id を必ず含める（二重ガード）

**RLS前提**
- set_config('app.tenant_id', ...) でセッション変数設定
- RLS無効化禁止

---

### Contracts Summary（This Feature）

**BFF Contracts（packages/contracts/src/bff/permission-settings）**

```typescript
// ============================================================
// Enums
// ============================================================
export type AccessLevel = 'A' | 'B' | 'C';
export type DataScope = 'ALL' | 'HIERARCHY' | 'ASSIGNED';

// ============================================================
// Request DTOs
// ============================================================

// ロール一覧
export interface BffRoleListRequest {
  page?: number;
  pageSize?: number;
  sortBy?: 'roleCode' | 'roleName' | 'assignedEmployeeCount';
  sortOrder?: 'asc' | 'desc';
  keyword?: string;
  isActive?: boolean;
}

// ロール作成
export interface BffCreateRoleRequest {
  roleCode: string;
  roleName: string;
  roleDescription?: string;
}

// ロール更新
export interface BffUpdateRoleRequest {
  roleCode?: string;
  roleName?: string;
  roleDescription?: string;
}

// 権限一括更新
export interface BffUpdatePermissionsRequest {
  permissions: BffPermissionInput[];
}

export interface BffPermissionInput {
  menuId: string;
  accessLevel: AccessLevel;
  dataScope: DataScope;
  assignedDepartments?: BffAssignedDepartmentInput[];
}

export interface BffAssignedDepartmentInput {
  departmentStableId: string;
  includeChildren: boolean;
}

// 社員ロール割当一覧
export interface BffEmployeeAssignmentListRequest {
  page?: number;
  pageSize?: number;
  sortBy?: 'employeeCode' | 'employeeName' | 'departmentName' | 'roleName';
  sortOrder?: 'asc' | 'desc';
  keyword?: string;
  departmentStableId?: string;
  roleId?: string;
  hasRole?: boolean;  // true=割当済み, false=未割当, undefined=全て
}

// 社員ロール割当
export interface BffAssignRoleRequest {
  employeeId: string;
  roleId: string;
}

// ============================================================
// Response DTOs
// ============================================================

// ロール一覧
export interface BffRoleListResponse {
  items: BffRoleSummary[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export interface BffRoleSummary {
  id: string;
  roleCode: string;
  roleName: string;
  roleDescription: string | null;
  assignedEmployeeCount: number;
  isActive: boolean;
}

// ロール詳細
export interface BffRoleResponse {
  id: string;
  roleCode: string;
  roleName: string;
  roleDescription: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BffRoleDetailResponse extends BffRoleResponse {
  assignedEmployeeCount: number;
}

// メニュー一覧
export interface BffMenuListResponse {
  items: BffMenuSummary[];
}

export interface BffMenuSummary {
  id: string;
  menuCode: string;
  menuName: string;
  menuCategory: string | null;
  menuType: string | null;
  parentMenuId: string | null;
  isConsolidation: boolean;
  sortOrder: number;
}

// ロール権限
export interface BffRolePermissionsResponse {
  roleId: string;
  permissions: BffRoleMenuPermission[];
}

export interface BffRoleMenuPermission {
  menuId: string;
  menuCode: string;
  menuName: string;
  menuCategory: string | null;
  accessLevel: AccessLevel;
  dataScope: DataScope;
  assignedDepartments: BffAssignedDepartment[];
}

export interface BffAssignedDepartment {
  departmentStableId: string;
  departmentName: string;
  includeChildren: boolean;
}

// 社員ロール割当一覧
export interface BffEmployeeAssignmentListResponse {
  items: BffEmployeeAssignment[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export interface BffEmployeeAssignment {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  departmentStableId: string | null;
  departmentName: string | null;
  roleId: string | null;
  roleName: string | null;
}

// 社員ロール
export interface BffEmployeeRoleResponse {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  roleId: string;
  roleName: string;
}

// ユーザー権限情報
export interface BffUserPermissionsResponse {
  roleId: string | null;
  roleName: string | null;
  permissions: BffUserMenuPermission[];
}

export interface BffUserMenuPermission {
  menuCode: string;
  menuName: string;
  urlPath: string | null;
  accessLevel: 'A' | 'B';  // Cは返却しない
  dataScope: DataScope;
  assignedDepartmentStableIds: string[];  // ASSIGNEDの場合のみ（include_children考慮済み）
}

// ============================================================
// Error Codes
// ============================================================
export const PermissionSettingsErrorCode = {
  ROLE_NOT_FOUND: 'ROLE_NOT_FOUND',
  ROLE_CODE_DUPLICATE: 'ROLE_CODE_DUPLICATE',
  ROLE_HAS_EMPLOYEES: 'ROLE_HAS_EMPLOYEES',
  ROLE_ALREADY_INACTIVE: 'ROLE_ALREADY_INACTIVE',
  ROLE_ALREADY_ACTIVE: 'ROLE_ALREADY_ACTIVE',
  ROLE_INACTIVE: 'ROLE_INACTIVE',
  EMPLOYEE_NOT_FOUND: 'EMPLOYEE_NOT_FOUND',
  EMPLOYEE_ALREADY_ASSIGNED: 'EMPLOYEE_ALREADY_ASSIGNED',
  MENU_NOT_FOUND: 'MENU_NOT_FOUND',
  CONSOLIDATION_MENU_RESTRICTED: 'CONSOLIDATION_MENU_RESTRICTED',
  ASSIGNED_DEPARTMENTS_REQUIRED: 'ASSIGNED_DEPARTMENTS_REQUIRED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;

export type PermissionSettingsErrorCode =
  (typeof PermissionSettingsErrorCode)[keyof typeof PermissionSettingsErrorCode];

export interface PermissionSettingsError {
  code: PermissionSettingsErrorCode;
  message: string;
  details?: Record<string, unknown>;
}
```

**API Contracts（packages/contracts/src/api/permission-settings）**

Domain API 契約はBFF契約と同様の構造で、offset/limit形式のページングを使用。

---

## Responsibility Clarification（Mandatory）

### UIの責務
- ロール管理・権限設定・社員ロール割当画面の表示
- アクセスレベル（A/B/C）選択時のデータスコープ入力制御（C選択時は非表示）
- ASSIGNED選択時の部門選択ダイアログ表示
- 一括ロール割当ダイアログの表示（2ステップウィザード形式）
  - Step 1: 有効なロール一覧から割当対象ロールを選択
  - Step 2: 社員一覧をフィルタ・選択し、一括割当を実行
- バリデーションエラーの表示
- ビジネス判断は禁止

### BFFの責務
- UI入力の正規化（paging / sorting / filtering）
- 連結メニューのフィルタリング（主会社チェック）
- Domain API DTO ⇄ UI DTO の変換
- ビジネスルールの正本は持たない

### Domain APIの責務
- ビジネスルールの正本（1社員1ロール、コード重複チェック、割当社員チェック等）
- 権限・状態遷移の最終判断
- 監査ログ・整合性保証
- RLS + tenant_id 二重ガード

---

## Data Model（エンティティ整合性確認必須）

### Entity Reference
- 参照元: `.kiro/specs/entities/01_各種マスタ.md`
  - セクション 1.1 (tenants)
  - セクション 5.4 (roles, employee_roles)
  - セクション 5.5 (menus)
  - セクション 5.6 (role_menu_permissions)
  - セクション 5.7 (role_menu_department_assignments)

### エンティティ整合性チェックリスト

| チェック項目 | 確認結果 |
|-------------|---------|
| カラム網羅性 | エンティティ定義の全カラムがDTO/Prismaに反映されている: ✅ |
| 型の一致 | varchar→String, char(1)→String, boolean→Boolean 等の型変換が正確: ✅ |
| 制約の反映 | UNIQUE/CHECK制約がPrisma/アプリ検証に反映: ✅ |
| ビジネスルール | 1社員1ロール制約がDBとServiceに反映: ✅ |
| NULL許可 | NULL/NOT NULLがPrisma?/必須に正しく対応: ✅ |

### ER Diagram

```
┌─────────────────┐
│    tenants      │
│ ──────────────  │
│ id (PK)         │
│ primary_company_id (FK) ──┐
└────────┬────────┘         │
         │                  │
         ▼                  │
┌─────────────────┐         │
│   companies     │ <───────┘
│ ──────────────  │
│ id (PK)         │
│ tenant_id (FK)  │
└────────┬────────┘
         │
    ┌────┴────┬──────────────┐
    ▼         ▼              ▼
┌────────┐ ┌────────┐  ┌────────────┐
│ menus  │ │ roles  │  │ employees  │
│ ────── │ │ ────── │  │ ────────── │
│ id     │ │ id     │  │ id         │
│ ...    │ │ ...    │  │ ...        │
└───┬────┘ └───┬────┘  └─────┬──────┘
    │          │             │
    └────┬─────┘             │
         ▼                   │
┌────────────────────────┐   │
│ role_menu_permissions  │   │
│ ────────────────────── │   │
│ id                     │   │
│ role_id (FK)           │   │
│ menu_id (FK)           │   │
│ access_level           │   │
│ data_scope             │   │
└───────────┬────────────┘   │
            │                │
            ▼                │
┌────────────────────────────┐
│role_menu_department_assign.│
│ ────────────────────────── │
│ id                         │
│ role_menu_permission_id    │
│ department_stable_id       │
│ include_children           │
└────────────────────────────┘
                             │
         ┌───────────────────┘
         ▼
┌──────────────────┐
│ employee_roles   │
│ ──────────────── │
│ id               │
│ employee_id (FK) │
│ role_id (FK)     │
│ UNIQUE(employee_id) ← 1社員1ロール
└──────────────────┘
```

### Prisma Schema

```prisma
model Role {
  id               String   @id @default(uuid())
  tenantId         String   @map("tenant_id")
  companyId        String   @map("company_id")
  roleCode         String   @map("role_code")
  roleName         String   @map("role_name")
  roleDescription  String?  @map("role_description")
  isActive         Boolean  @default(true) @map("is_active")
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")

  employeeRoles      EmployeeRole[]
  roleMenuPermissions RoleMenuPermission[]

  @@unique([tenantId, companyId, roleCode])
  @@index([tenantId, companyId])
  @@index([tenantId, companyId, isActive])
  @@map("roles")
}

model Menu {
  id              String   @id @default(uuid())
  tenantId        String   @map("tenant_id")
  companyId       String   @map("company_id")
  menuCode        String   @map("menu_code")
  menuName        String   @map("menu_name")
  menuCategory    String?  @map("menu_category")
  menuType        String?  @map("menu_type")
  parentMenuId    String?  @map("parent_menu_id")
  urlPath         String?  @map("url_path")
  iconName        String?  @map("icon_name")
  sortOrder       Int      @default(0) @map("sort_order")
  isConsolidation Boolean  @default(false) @map("is_consolidation")
  isActive        Boolean  @default(true) @map("is_active")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  roleMenuPermissions RoleMenuPermission[]
  parentMenu          Menu?  @relation("MenuHierarchy", fields: [parentMenuId], references: [id])
  childMenus          Menu[] @relation("MenuHierarchy")

  @@unique([tenantId, companyId, menuCode])
  @@index([tenantId, companyId])
  @@index([tenantId, companyId, isActive])
  @@map("menus")
}

model RoleMenuPermission {
  id           String   @id @default(uuid())
  tenantId     String   @map("tenant_id")
  companyId    String   @map("company_id")
  roleId       String   @map("role_id")
  menuId       String   @map("menu_id")
  accessLevel  String   @map("access_level")  // 'A' | 'B' | 'C'
  dataScope    String   @map("data_scope")    // 'ALL' | 'HIERARCHY' | 'ASSIGNED'
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  role              Role   @relation(fields: [tenantId, companyId, roleId], references: [tenantId, companyId, id])
  menu              Menu   @relation(fields: [tenantId, companyId, menuId], references: [tenantId, companyId, id])
  departmentAssignments RoleMenuDepartmentAssignment[]

  @@unique([tenantId, roleId, menuId])
  @@index([tenantId, companyId])
  @@index([tenantId, roleId])
  @@map("role_menu_permissions")
}

model RoleMenuDepartmentAssignment {
  id                     String   @id @default(uuid())
  tenantId               String   @map("tenant_id")
  companyId              String   @map("company_id")
  roleMenuPermissionId   String   @map("role_menu_permission_id")
  departmentStableId     String   @map("department_stable_id")
  includeChildren        Boolean  @default(false) @map("include_children")
  createdAt              DateTime @default(now()) @map("created_at")
  updatedAt              DateTime @updatedAt @map("updated_at")

  roleMenuPermission RoleMenuPermission @relation(fields: [roleMenuPermissionId], references: [id], onDelete: Cascade)

  @@unique([tenantId, roleMenuPermissionId, departmentStableId])
  @@index([tenantId, companyId])
  @@index([roleMenuPermissionId])
  @@map("role_menu_department_assignments")
}

model EmployeeRole {
  id          String   @id @default(uuid())
  tenantId    String   @map("tenant_id")
  companyId   String   @map("company_id")
  employeeId  String   @map("employee_id")
  roleId      String   @map("role_id")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  role Role @relation(fields: [tenantId, companyId, roleId], references: [tenantId, companyId, id])

  @@unique([tenantId, employeeId])  // 1社員1ロール制約
  @@index([tenantId, companyId])
  @@index([tenantId, roleId])
  @@map("employee_roles")
}
```

### Constraints（エンティティ定義から転記）

**roles**
- PK: id（UUID）
- UNIQUE: (tenant_id, company_id, role_code)

**menus**
- PK: id（UUID）
- UNIQUE: (tenant_id, company_id, menu_code)
- CHECK: is_consolidation IN (true, false)

**role_menu_permissions**
- PK: id（UUID）
- UNIQUE: (tenant_id, role_id, menu_id)
- CHECK: access_level IN ('A', 'B', 'C')
- CHECK: data_scope IN ('ALL', 'HIERARCHY', 'ASSIGNED')

**role_menu_department_assignments**
- PK: id（UUID）
- UNIQUE: (tenant_id, role_menu_permission_id, department_stable_id)

**employee_roles**
- PK: id（UUID）
- UNIQUE: (tenant_id, employee_id) ← 1社員1ロール制約

### RLS Policy

```sql
-- roles
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON roles
  USING (tenant_id::text = current_setting('app.tenant_id', true));

-- menus
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON menus
  USING (tenant_id::text = current_setting('app.tenant_id', true));

-- role_menu_permissions
ALTER TABLE role_menu_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON role_menu_permissions
  USING (tenant_id::text = current_setting('app.tenant_id', true));

-- role_menu_department_assignments
ALTER TABLE role_menu_department_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON role_menu_department_assignments
  USING (tenant_id::text = current_setting('app.tenant_id', true));

-- employee_roles
ALTER TABLE employee_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON employee_roles
  USING (tenant_id::text = current_setting('app.tenant_id', true));
```

---

## Requirements Traceability

| Req ID | Requirement | Design Component | Implementation Point |
|--------|-------------|------------------|---------------------|
| 1.1 | ロール一覧表示 | GET /roles | RoleService.findMany |
| 1.2 | ロール詳細表示 | GET /roles/:id | RoleService.findById |
| 1.3 | キーワード検索 | BffRoleListRequest.keyword | Repository.findMany |
| 1.4 | 有効/無効フィルタ | BffRoleListRequest.isActive | Repository.findMany |
| 2.1 | 新規作成フォーム | UI component | - |
| 2.2 | ロール作成 | POST /roles | RoleService.create |
| 2.3 | is_active初期値 | Service | is_active: true |
| 2.4 | コード重複エラー | ROLE_CODE_DUPLICATE | Service validation |
| 2.5 | 必須項目バリデーション | VALIDATION_ERROR | Service validation |
| 3.1 | 編集フォーム表示 | UI component | - |
| 3.2 | ロール更新 | PATCH /roles/:id | RoleService.update |
| 3.3 | コード重複エラー | ROLE_CODE_DUPLICATE | Service validation |
| 3.4 | updated_at記録 | Prisma @updatedAt | - |
| 4.1 | 無効化 | POST /roles/:id/deactivate | RoleService.deactivate |
| 4.2 | 再有効化 | POST /roles/:id/activate | RoleService.activate |
| 4.3 | ロール存在チェック | ROLE_NOT_FOUND | Service validation |
| 4.4 | 割当社員チェック | ROLE_HAS_EMPLOYEES | Service validation |
| 5.1 | メニュー一覧取得 | GET /menus | MenuService.findMany |
| 5.2 | カテゴリグルーピング | BffMenuSummary.menuCategory | UI grouping |
| 5.3 | 連結メニュー主会社チェック | BFF filtering | - |
| 5.4 | 非主会社の連結メニュー除外 | BFF filtering | - |
| 6.1 | 権限設定表示 | GET /roles/:id/permissions | RolePermissionService |
| 6.2 | アクセスレベル設定 | PUT /permissions | RolePermissionService.upsertMany |
| 6.3 | データスコープ設定 | PUT /permissions | RolePermissionService.upsertMany |
| 6.4 | C選択時のスコープ無効化 | UI control | - |
| 6.5 | デフォルトC | Service | accessLevel default: 'C' |
| 6.6 | デフォルトALL | Service | dataScope default: 'ALL' |
| 7.1 | ASSIGNED時の部門ダイアログ | UI component | - |
| 7.2 | 部門追加 | PUT /permissions | RolePermissionService |
| 7.3 | include_children設定 | PUT /permissions | RolePermissionService |
| 7.4 | 部門削除 | PUT /permissions | RolePermissionService |
| 7.5 | 複数部門指定 | PUT /permissions | RolePermissionService |
| 7.6 | ASSIGNED部門必須チェック | ASSIGNED_DEPARTMENTS_REQUIRED | Service validation |
| 8.1 | 社員一覧表示 | GET /employee-assignments | EmployeeRoleService.findMany |
| 8.2 | 社員詳細表示 | GET /employee-assignments | Response includes details |
| 8.3 | 部門フィルタ | BffEmployeeAssignmentListRequest.departmentStableId | Repository |
| 8.4 | ロールフィルタ | BffEmployeeAssignmentListRequest.roleId | Repository |
| 8.5 | 未割当フィルタ | BffEmployeeAssignmentListRequest.hasRole | Repository |
| 9.1 | ロール割当 | POST /employee-assignments | EmployeeRoleService.assign |
| 9.2 | ロール変更 | POST /employee-assignments | EmployeeRoleService.update |
| 9.3 | 1社員1ロール制約 | EMPLOYEE_ALREADY_ASSIGNED | DB UNIQUE + Service |
| 9.4 | ロール解除 | DELETE /employee-assignments/:employeeId | EmployeeRoleService.delete |
| 9.5 | 無効ロール割当不可 | ROLE_INACTIVE | Service validation |
| 10.1 | ユーザー権限取得 | GET /user/permissions | UserPermissionService |
| 10.2 | Cメニュー除外 | Service | filter access_level != 'C' |
| 10.3 | A/Bとスコープ返却 | BffUserPermissionsResponse | - |
| 10.4 | ASSIGNED部門リスト返却 | BffUserMenuPermission.assignedDepartmentStableIds | - |
| 10.5 | 未割当時空リスト | BffUserPermissionsResponse | permissions: [] |
| 11.1 | 連結メニュー主会社限定 | Domain API | Service validation |
| 11.2 | 非主会社設定エラー | CONSOLIDATION_MENU_RESTRICTED | Service validation |
| 11.3 | 非主会社ログイン時除外 | GET /user/permissions | Service filter |
| 12.1 | tenant_id絞り込み | Repository | where tenant_id |
| 12.2 | tenant_id必須パラメータ | Repository | method signature |
| 12.3 | RLS併用 | PostgreSQL | RLS Policy |
| 12.4 | 異テナントアクセス拒否 | RLS | - |
| 13.1 | ロールコード一意性 | UNIQUE constraint | Prisma @@unique |
| 13.2 | メニューコード一意性 | UNIQUE constraint | Prisma @@unique |
| 13.3 | 重複エラー | ROLE_CODE_DUPLICATE | Service |
| 14.1 | 操作日時記録 | Prisma | created_at/updated_at |
| 14.2 | 権限変更日時記録 | Prisma | created_at/updated_at |
| 14.3 | 社員割当変更日時記録 | Prisma | created_at/updated_at |
| 14.4 | 自動記録 | Prisma @updatedAt | - |
| 15.1 | 一括割当画面で有効ロール一覧表示 | UI component | BFF Client |
| 15.2 | ロール選択後に社員一覧表示 | UI component | BFF Client |
| 15.3 | 社員一覧フィルタリング | BffEmployeeAssignmentListRequest | Repository |
| 15.4 | 複数社員への一括割当実行 | POST /employee-assignments (複数回) | EmployeeRoleService.assign |
| 15.5 | 同一ロール割当済み社員の選択除外 | UI component | - |
| 15.6 | 選択0人時の割当ボタン無効化 | UI component | - |
| 15.7 | 一括割当進捗状態表示 | UI component | - |

---

## Component Summary

| Component | Domain | Intent | Requirements | Dependencies |
|-----------|--------|--------|--------------|--------------|
| RoleController (API) | Domain API | ロールCRUD REST | 1, 2, 3, 4 | RoleService |
| MenuController (API) | Domain API | メニュー一覧 REST | 5 | MenuService |
| RolePermissionController (API) | Domain API | 権限設定 REST | 6, 7 | RolePermissionService |
| EmployeeRoleController (API) | Domain API | 社員ロール割当 REST | 8, 9 | EmployeeRoleService |
| UserPermissionController (API) | Domain API | ユーザー権限取得 REST | 10 | UserPermissionService |
| RoleService | Domain API | ロールビジネスロジック | 1-4, 11 | RoleRepository |
| MenuService | Domain API | メニュービジネスロジック | 5 | MenuRepository |
| RolePermissionService | Domain API | 権限設定ビジネスロジック | 6, 7, 11 | RoleMenuPermissionRepository |
| EmployeeRoleService | Domain API | 社員割当ビジネスロジック | 8, 9 | EmployeeRoleRepository |
| UserPermissionService | Domain API | ユーザー権限ビジネスロジック | 10, 11 | Multiple Repositories |
| PermissionBffController | BFF | UIエンドポイント | All | API Client |
| PermissionBffService | BFF | 変換・集約 | All | API Client |
| PermissionBffMapper | BFF | DTO変換 | All | - |
| RoleManagementPage | UI | ロール管理画面 | 1, 2, 3, 4 | BFF Client |
| PermissionSettingsPage | UI | 権限設定画面 | 5, 6, 7 | BFF Client |
| EmployeeRoleAssignmentPage | UI | 社員ロール割当画面 | 8, 9 | BFF Client |
| BulkRoleAssignmentDialog | UI | 一括ロール割当ダイアログ | 15 | BFF Client |

---

## References

- [requirements.md](./requirements.md) — 要件定義
- `.kiro/specs/仕様概要/権限設定.md` — 仕様概要
- `.kiro/specs/仕様検討/20260113_権限設定.md` — 仕様検討記録
- `.kiro/specs/entities/01_各種マスタ.md` — エンティティ定義
- `.kiro/steering/tech.md` — 技術憲法
- `.kiro/steering/structure.md` — 構造憲法
