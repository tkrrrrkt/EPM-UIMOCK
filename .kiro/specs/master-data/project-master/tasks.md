# Implementation Plan

> CCSDD / SDD 前提：**contracts-first**（bff → api → shared）を最優先し、境界違反を guard で止める。
> UI は最後。v0 は **Phase 1（統制テスト）→ Phase 2（本実装）** の二段階で扱う。

---

## 0. Design Completeness Gate（Blocking）

> Implementation MUST NOT start until all items below are checked.

- [ ] 0.1 Designの「BFF Specification（apps/bff）」が埋まっている
  - BFF endpoints（UIが叩く）が記載されている
  - Request/Response DTO（packages/contracts/src/bff）が列挙されている
  - Paging/Sorting正規化（defaults, clamp, whitelist, normalize, transform）が明記されている
  - 変換（api DTO → bff DTO）の方針が記載されている
  - エラー整形方針（Pass-through）が記載されている
  - tenant_id/user_id の取り回しが記載されている

- [ ] 0.2 Designの「Service Specification（Domain / apps/api）」が埋まっている
  - Usecase（Create/Update/Deactivate/Reactivate）が列挙されている
  - ビジネスルールの所在が記載されている
  - トランザクション境界が記載されている
  - 監査ログ記録ポイントが記載されている

- [ ] 0.3 Designの「Repository Specification（apps/api）」が埋まっている
  - 取得・更新メソッド一覧（findMany, findById, findByCode, create, update）が記載されている
  - where句二重ガードの方針（tenant_id常時指定）が記載されている
  - RLS前提（setTenantContext）が記載されている

- [ ] 0.4 Designの「Contracts Summary（This Feature）」が埋まっている
  - packages/contracts/src/bff/project-master のDTOが列挙されている
  - packages/contracts/src/api/project-master のDTOが列挙されている
  - Enum / Error の配置ルール（packages/contracts/src/api/errors）が明記されている
  - UIは packages/contracts/src/api を参照しないルールが明記されている

- [ ] 0.5 Requirements Traceability が更新されている
  - 全9要件がBFF/API/Repo/Flowsに紐づいている

---

## 1. Contracts 定義（BFF / API / Errors）

- [ ] 1.1 BFF用契約の定義
  - プロジェクト一覧取得のリクエスト・レスポンス型を定義する
  - プロジェクト詳細取得のレスポンス型を定義する
  - プロジェクト登録・更新のリクエスト型を定義する
  - ページング（page/pageSize）とソート（sortBy/sortOrder）のパラメータを含める
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 3.1, 3.2, 4.1, 4.2, 5.2, 6.2_

- [ ] 1.2 (P) Domain API用契約の定義
  - プロジェクト一覧取得のリクエスト・レスポンス型を定義する（offset/limit形式）
  - プロジェクト詳細のレスポンス型を定義する
  - プロジェクト登録・更新のリクエスト型を定義する
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 3.1, 3.2, 4.1, 4.2_

- [ ] 1.3 (P) エラー契約の定義
  - プロジェクト不存在エラーコードを定義する
  - プロジェクトコード重複エラーコードを定義する
  - 既無効化・既有効化エラーコードを定義する
  - バリデーションエラーコードを定義する
  - _Requirements: 2.3, 3.3, 3.4, 4.3, 4.4, 5.3, 5.4, 6.3, 6.4_

---

## 2. データベース（Prisma Schema / RLS）

- [ ] 2.1 Prisma Schema の定義
  - Projectモデルを追加する（id, tenantId, companyId, projectCode, projectName, description, startDate, endDate, isActive, createdBy, createdAt, updatedBy, updatedAt）
  - 複合一意制約（tenantId + companyId + projectCode）を設定する
  - インデックス（tenantId + companyId, tenantId + isActive）を設定する
  - _Requirements: 8.1, 8.2, 9.2, 9.3_

- [ ] 2.2 RLS ポリシーの設定
  - projects テーブルに対して RLS を有効化する
  - tenant_id によるテナント分離ポリシーを作成する
  - _Requirements: 7.3, 7.4_

---

## 3. Domain API（apps/api）

- [ ] 3.1 Repository 層の実装
  - 一覧取得機能を実装する（ページング・フィルタ・ソート対応）
  - ID指定での詳細取得機能を実装する
  - プロジェクトコードでの重複チェック機能を実装する
  - 新規登録機能を実装する（監査情報含む）
  - 更新機能を実装する（監査情報更新）
  - 全メソッドで tenant_id を第一引数として受け取り、where句に含める
  - PrismaService.setTenantContext() を呼び出してからクエリを実行する
  - _Requirements: 7.1, 7.2, 7.3, 9.1, 9.2, 9.3_

- [ ] 3.2 Service 層の実装
  - プロジェクト一覧取得のビジネスロジックを実装する
  - プロジェクト詳細取得を実装する（存在チェック含む）
  - プロジェクト新規登録を実装する（重複チェック、isActive初期化）
  - プロジェクト更新を実装する（存在チェック、重複チェック）
  - プロジェクト無効化を実装する（存在チェック、既無効化チェック）
  - プロジェクト再有効化を実装する（存在チェック、既有効チェック）
  - _Requirements: 1.1, 1.2, 2.1, 2.3, 3.1, 3.3, 3.4, 3.5, 4.1, 4.3, 4.4, 5.1, 5.3, 5.4, 6.1, 6.3, 6.4_

- [ ] 3.3 Controller 層の実装
  - 一覧取得エンドポイントを実装する（GET /api/master-data/project-master）
  - 詳細取得エンドポイントを実装する（GET /api/master-data/project-master/:id）
  - 新規登録エンドポイントを実装する（POST /api/master-data/project-master）
  - 更新エンドポイントを実装する（PATCH /api/master-data/project-master/:id）
  - 無効化エンドポイントを実装する（POST /api/master-data/project-master/:id/deactivate）
  - 再有効化エンドポイントを実装する（POST /api/master-data/project-master/:id/reactivate）
  - _Requirements: 1.1, 2.1, 3.1, 3.2, 4.1, 4.2, 5.1, 5.2, 6.1, 6.2_

- [ ] 3.4 Module 登録
  - ProjectMasterModule を作成し、Controller/Service/Repository を登録する
  - AppModule に ProjectMasterModule をインポートする
  - _Requirements: 1.1_

---

## 4. BFF（apps/bff）

- [ ] 4.1 Domain API クライアントの実装
  - Domain API への HTTP 通信を行うクライアントを実装する
  - x-tenant-id / x-user-id ヘッダーの付与を実装する
  - _Requirements: 7.1_

- [ ] 4.2 Mapper の実装
  - API DTO から BFF DTO への変換ロジックを実装する
  - 日付フィールドの ISO 8601 文字列変換を実装する
  - _Requirements: 1.5, 2.2_

- [ ] 4.3 Service 層の実装
  - ページング正規化を実装する（page/pageSize → offset/limit 変換）
  - ソート正規化を実装する（sortBy ホワイトリスト検証）
  - キーワード正規化を実装する（trim、空→undefined）
  - デフォルト値適用を実装する（page=1, pageSize=50, sortBy=projectCode）
  - pageSize の上限制限を実装する（max: 200）
  - _Requirements: 1.2, 1.3, 1.4_

- [ ] 4.4 Controller 層の実装
  - 一覧取得エンドポイントを実装する（GET /api/bff/master-data/project-master）
  - 詳細取得エンドポイントを実装する（GET /api/bff/master-data/project-master/:id）
  - 新規登録エンドポイントを実装する（POST /api/bff/master-data/project-master）
  - 更新エンドポイントを実装する（PATCH /api/bff/master-data/project-master/:id）
  - 無効化エンドポイントを実装する（POST /api/bff/master-data/project-master/:id/deactivate）
  - 再有効化エンドポイントを実装する（POST /api/bff/master-data/project-master/:id/reactivate）
  - Error Policy: Pass-through（Domain API エラーをそのまま返却）
  - _Requirements: 1.1, 2.1, 3.1, 3.2, 4.1, 4.2, 5.1, 5.2, 6.1, 6.2_

- [ ] 4.5 Module 登録
  - ProjectMasterModule を作成し、Controller/Service/Mapper を登録する
  - AppModule に ProjectMasterModule をインポートする
  - _Requirements: 1.1_

---

## 5. UI Phase 1（v0 統制テスト）

- [ ] 5.1 v0 プロンプト作成
  - design.md と contracts/bff を参照してプロンプトを作成する
  - 禁止事項（layout.tsx生成禁止、生カラーリテラル禁止、直接fetch禁止）を明記する
  - _Requirements: 1.5, 2.2_

- [ ] 5.2 v0 UI 生成・取得
  - v0.dev でプロンプトを投入し UI を生成する
  - v0-fetch.sh で _v0_drop/master-data/project-master/src に取得する
  - _Requirements: 1.1, 1.5, 2.1, 2.2, 3.1, 4.1, 5.1, 6.1_

- [ ] 5.3 MockBffClient での動作確認
  - 一覧表示が正しく動作することを確認する
  - 検索・ソート・ページングが動作することを確認する
  - 詳細表示ダイアログが動作することを確認する
  - 登録・更新・無効化・再有効化の操作が動作することを確認する
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 3.1, 4.1, 5.1, 6.1_

- [ ] 5.4 Structure Guard 実行
  - structure-guards.ts を実行して境界違反がないことを確認する
  - UI が Domain API を直接呼び出していないことを確認する
  - UI が packages/contracts/src/api を参照していないことを確認する
  - _Requirements: 7.1_

---

## 6. UI Phase 2（本実装・統合）

- [ ] 6.1 v0 出力の移植
  - _v0_drop から apps/web/src/features/master-data/project-master へ移植する
  - import パスを修正する（@/shared/ui, @contracts/bff/project-master）
  - _Requirements: 1.1_

- [ ] 6.2 HttpBffClient の実装
  - 実 BFF エンドポイントへの通信を実装する
  - MockBffClient から HttpBffClient への切替を実装する
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1_

- [ ] 6.3 App Router 登録
  - apps/web/src/app/master-data/project-master/page.tsx を作成する
  - Feature コンポーネントを呼び出す
  - _Requirements: 1.1_

- [ ] 6.4 Navigation 登録
  - apps/web/src/shared/navigation/menu.ts にプロジェクトマスタを追加する
  - _Requirements: 1.1_

---

## 7. 統合テスト

- [ ] 7.1 CRUD 動作確認
  - プロジェクトの新規登録が正常に動作することを確認する
  - プロジェクトの一覧表示・検索・ソート・ページングが動作することを確認する
  - プロジェクトの詳細表示が動作することを確認する
  - プロジェクトの更新が動作することを確認する
  - プロジェクトの無効化・再有効化が動作することを確認する
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 3.1, 3.2, 4.1, 4.2, 5.1, 5.2, 6.1, 6.2_

- [ ] 7.2 エラーハンドリング確認
  - 存在しないプロジェクトへのアクセスでエラーが返ることを確認する
  - 重複するプロジェクトコードでの登録・更新でエラーが返ることを確認する
  - 既無効化プロジェクトの再無効化でエラーが返ることを確認する
  - 既有効プロジェクトの再有効化でエラーが返ることを確認する
  - _Requirements: 2.3, 3.3, 3.4, 4.3, 4.4, 5.3, 5.4, 6.3, 6.4_

- [ ] 7.3 マルチテナント分離確認
  - 異なるテナントのプロジェクトにアクセスできないことを確認する
  - tenant_id による絞り込みが正しく機能することを確認する
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 7.4 監査情報確認
  - 登録時に created_by / created_at が記録されることを確認する
  - 更新・無効化・再有効化時に updated_by / updated_at が記録されることを確認する
  - _Requirements: 9.1, 9.2, 9.3_

---

## Requirements Coverage

| Requirement | Tasks |
|-------------|-------|
| 1.1 | 1.1, 1.2, 3.1, 3.2, 3.3, 3.4, 4.1, 4.4, 4.5, 5.2, 5.3, 6.1, 6.2, 6.3, 6.4, 7.1 |
| 1.2 | 1.1, 1.2, 3.2, 4.3, 5.3, 7.1 |
| 1.3 | 1.1, 1.2, 4.3, 5.3, 7.1 |
| 1.4 | 1.1, 1.2, 4.3, 5.3, 7.1 |
| 1.5 | 1.1, 4.2, 5.1, 5.2, 5.3 |
| 2.1 | 1.1, 1.2, 3.2, 3.3, 4.4, 5.2, 5.3, 6.2, 7.1 |
| 2.2 | 1.1, 4.2, 5.1, 5.2, 5.3 |
| 2.3 | 1.3, 3.2, 7.2 |
| 3.1 | 1.1, 1.2, 3.2, 3.3, 4.4, 5.2, 5.3, 6.2, 7.1 |
| 3.2 | 1.1, 1.2, 3.3, 4.4, 7.1 |
| 3.3 | 1.3, 3.2, 7.2 |
| 3.4 | 1.3, 3.2, 7.2 |
| 3.5 | 3.2 |
| 3.6 | 3.1 |
| 4.1 | 1.1, 1.2, 3.2, 3.3, 4.4, 5.2, 5.3, 6.2, 7.1 |
| 4.2 | 1.1, 1.2, 3.3, 4.4, 7.1 |
| 4.3 | 1.3, 3.2, 7.2 |
| 4.4 | 1.3, 3.2, 7.2 |
| 4.5 | 3.1 |
| 5.1 | 3.2, 3.3, 4.4, 5.2, 5.3, 6.2, 7.1 |
| 5.2 | 1.1, 3.3, 4.4, 7.1 |
| 5.3 | 1.3, 3.2, 7.2 |
| 5.4 | 1.3, 3.2, 7.2 |
| 5.5 | 3.1 |
| 6.1 | 3.2, 3.3, 4.4, 5.2, 5.3, 6.2, 7.1 |
| 6.2 | 1.1, 3.3, 4.4, 7.1 |
| 6.3 | 1.3, 3.2, 7.2 |
| 6.4 | 1.3, 3.2, 7.2 |
| 6.5 | 3.1 |
| 7.1 | 1.1, 3.1, 4.1, 5.4, 7.3 |
| 7.2 | 3.1, 7.3 |
| 7.3 | 2.2, 3.1, 7.3 |
| 7.4 | 2.2, 7.3 |
| 8.1 | 2.1 |
| 8.2 | 2.1 |
| 9.1 | 3.1, 7.4 |
| 9.2 | 2.1, 3.1, 7.4 |
| 9.3 | 2.1, 3.1, 7.4 |
