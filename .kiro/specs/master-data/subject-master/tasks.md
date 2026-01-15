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
  - **ツリー構造変換（BFF責務）が明記されている**
    - フラットデータ → SubjectTreeNode[] への変換
    - ルートノード（親なし）と子ノード（rollup紐づき）の分類
  - フィルタリング正規化（keyword trim、空→undefined）が明記されている
  - エラー整形方針（Pass-through）が記載されている
  - tenant_id/user_id の取り回し（ヘッダー伝搬）が記載されている

- [ ] 0.2 Designの「Service Specification（Domain / apps/api）」が埋まっている
  - Usecase（Create/Update/Deactivate/Reactivate/Rollup CRUD/Move）が列挙されている
  - 主要ビジネスルール（循環参照チェック、科目コード重複チェック、AGGREGATE→posting_allowed=false）が記載されている
  - トランザクション境界（無効化時のrollup削除、移動時の複数操作）が記載されている
  - 監査ログ記録ポイント（created_by/at, updated_by/at）が記載されている

- [ ] 0.3 Designの「Repository Specification（apps/api）」が埋まっている
  - 取得・更新メソッド一覧が記載されている（SubjectRepository + RollupRepository）
  - where句二重ガードの方針（tenant_id常時指定）が記載されている
  - RLS前提（set_config前提）が記載されている

- [ ] 0.4 Designの「Contracts Summary（This Feature）」が埋まっている
  - packages/contracts/src/bff/subject-master のDTOが列挙されている
  - packages/contracts/src/api/subject-master のDTOが列挙されている
  - Error Codes（SubjectMasterErrorCode）が列挙されている
  - 「UIは packages/contracts/src/api を参照しない」ルールが明記されている

- [ ] 0.5 Requirements Traceability が更新されている
  - 全14要件が設計要素に紐づいている

- [ ] 0.6 v0生成物の受入・移植ルールが確認されている
  - v0生成物は `apps/web/_v0_drop/master-data/subject-master/src` に一次格納
  - layout.tsx 生成禁止が確認されている
  - UIは MockBffClient で動作確認される

- [ ] 0.7 Structure / Boundary Guard がパスしている
  - UI → Domain API の直接呼び出しが存在しない
  - UIでの直接 fetch() が存在しない

---

## 1. Contracts 定義（BFF → API → Error）

- [ ] 1.1 (P) BFF Contracts を定義する
  - ツリー取得・詳細取得・新規登録・更新・無効化・再有効化のリクエスト/レスポンス型を定義
  - BffSubjectTreeRequest, BffCreateSubjectRequest, BffUpdateSubjectRequest を作成
  - BffSubjectTreeNode（再帰構造）、BffSubjectTreeResponse、BffSubjectDetailResponse を作成
  - ツリーノードに科目コード、科目名、科目クラス、科目タイプ、有効状態、係数を含める
  - _Requirements: 1, 2_

- [ ] 1.2 (P) BFF Rollup Contracts を定義する
  - 構成科目追加・更新・削除・移動のリクエスト/レスポンス型を定義
  - BffAddRollupRequest, BffUpdateRollupRequest, BffMoveSubjectRequest を作成
  - 係数（coefficient）としてプラス/マイナス値を許可する型定義
  - _Requirements: 5, 6, 7_

- [ ] 1.3 (P) API Contracts を定義する
  - 科目一覧取得・詳細取得・新規登録・更新のリクエスト/レスポンス型を定義
  - ApiListSubjectsRequest, ApiCreateSubjectRequest, ApiUpdateSubjectRequest を作成
  - ApiSubjectResponse, ApiListSubjectsResponse を作成
  - _Requirements: 1, 2, 3, 4_

- [ ] 1.4 (P) API Rollup Contracts を定義する
  - rollup一覧取得・追加・更新・削除・移動のリクエスト/レスポンス型を定義
  - ApiAddRollupRequest, ApiUpdateRollupRequest, ApiMoveSubjectRequest を作成
  - ApiRollupItemResponse, ApiListRollupsResponse を作成
  - _Requirements: 5, 6, 7_

- [ ] 1.5 Error Codes を定義する
  - SubjectMasterErrorCode 定義（SUBJECT_NOT_FOUND, SUBJECT_CODE_DUPLICATE, SUBJECT_ALREADY_INACTIVE, SUBJECT_ALREADY_ACTIVE, ROLLUP_ALREADY_EXISTS, ROLLUP_NOT_FOUND, CIRCULAR_REFERENCE_DETECTED, CANNOT_ADD_CHILD_TO_BASE, VALIDATION_ERROR）
  - SubjectMasterError インターフェース定義
  - 日本語エラーメッセージのマッピング定義
  - errors/index.ts への export 追加
  - _Requirements: 3, 4, 5, 8, 9, 14_

---

## 2. DB / Migration / RLS

- [ ] 2.1 Prisma Schema を更新する
  - Subject モデル定義（全カラム、インデックス、@@unique制約）
  - SubjectRollupItem モデル定義（全カラム、リレーション、@@unique制約）
  - tenant_id + company_id + subject_code の複合一意制約
  - tenant_id + company_id + parent_subject_id + component_subject_id の複合一意制約
  - _Requirements: 11, 12_

- [ ] 2.2 Migration を実行する
  - prisma migrate dev でマイグレーション作成・適用
  - subjects テーブル作成確認
  - subject_rollup_items テーブル作成確認
  - インデックス作成確認
  - _Requirements: 11, 12_

- [ ] 2.3 RLS Policy を設定する
  - subjects テーブルに RLS 有効化
  - subject_rollup_items テーブルに RLS 有効化
  - tenant_isolation ポリシー作成（app.tenant_id 設定値でフィルタ）
  - _Requirements: 11_

---

## 3. Domain API 実装

- [ ] 3.1 Subject Repository を実装する
  - findMany（フィルタリング対応：keyword, subjectType, subjectClass, isActive）
  - findById（UUID指定）
  - findByCode（重複チェック用：tenant_id + company_id + subject_code）
  - create（監査情報含む）
  - update（監査情報更新）
  - 全メソッドで tenant_id を第一引数として必須化
  - PrismaService.setTenantContext 呼び出し
  - _Requirements: 11, 12, 13_

- [ ] 3.2 Rollup Repository を実装する
  - findByCompany（会社内全rollup取得）
  - findByParent（親科目指定）
  - findOne（特定の親子関係取得）
  - create / update / delete
  - deleteByParent（親の全子rollup削除）
  - 全メソッドで tenant_id を第一引数として必須化
  - _Requirements: 5, 11, 13_

- [ ] 3.3 Subject Service を実装する
  - 科目一覧取得（フィルタリング対応）
  - 科目詳細取得
  - 科目新規登録（BASE: posting_allowed=true 初期化、AGGREGATE: posting_allowed=false 強制）
  - 科目更新（科目コード重複チェック含む）
  - 科目無効化（既無効チェック、集計科目の子rollup削除）
  - 科目再有効化（既有効チェック）
  - 監査情報記録（created_by/at, updated_by/at）
  - _Requirements: 2, 3, 4, 8, 9, 12, 13_

- [ ] 3.4 Circular Reference Checker を実装する
  - DFS アルゴリズムによる循環参照検出
  - 親科目ID と 追加予定の構成科目ID を入力として受け取り
  - 既存の rollup 関係を辿って循環を検出
  - 循環検出時は true を返却
  - 直接循環（A→B→A）、間接循環（A→B→C→A）、自己参照（A→A）を全て検出
  - _Requirements: 14_

- [ ] 3.5 Rollup Service を実装する
  - 構成科目追加（循環参照チェック、重複チェック、BASE科目下への追加禁止）
  - 構成科目更新（係数・順序変更）
  - 構成科目削除
  - 科目移動（旧rollup削除 + 新rollup作成、循環参照チェック、トランザクション制御）
  - sortOrder による表示順序管理
  - _Requirements: 5, 6, 7, 14_

- [ ] 3.6 Domain API Controller を実装する
  - 科目 CRUD エンドポイント（GET/POST/PATCH）
  - 無効化/再有効化エンドポイント（POST）
  - Rollup CRUD エンドポイント（GET/POST/PATCH/DELETE）
  - 移動エンドポイント（POST /move）
  - x-tenant-id / x-user-id ヘッダーから認証情報取得
  - _Requirements: 1, 2, 3, 4, 5, 6, 7, 8, 9_

- [ ] 3.7 Domain API Module を登録する
  - SubjectMasterModule 作成
  - Controller, Service, Repository を providers/controllers に登録
  - PrismaModule をインポート
  - AppModule への登録
  - _Requirements: 1_

---

## 4. BFF 実装

- [ ] 4.1 Domain API Client を実装する
  - Domain API の各エンドポイントを呼び出すクライアント
  - x-tenant-id / x-user-id ヘッダー付与
  - エラーレスポンスのハンドリング（Pass-through）
  - _Requirements: 11_

- [ ] 4.2 Subject Tree Builder を実装する
  - フラットな科目一覧と rollup 関係からツリー構造を構築
  - ルートノード識別（親を持たない科目）
  - 子ノード配置（rollup 関係に基づく）
  - 未割当科目の分離（unassigned配列）
  - フィルタ適用時の親ノード自動展開
  - _Requirements: 1, 10_

- [ ] 4.3 Subject Mapper を実装する
  - API DTO → BFF DTO 変換
  - BffSubjectTreeNode 変換（係数含む）
  - BffSubjectDetailResponse 変換
  - _Requirements: 1, 2_

- [ ] 4.4 BFF Service を実装する
  - ツリー取得（フィルタリング、ツリー構築）
  - 詳細取得
  - 科目登録・更新
  - 無効化・再有効化
  - Rollup CRUD・移動
  - フィルタ正規化（keyword trim、空→undefined）
  - _Requirements: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10_

- [ ] 4.5 BFF Controller を実装する
  - ツリー取得エンドポイント（GET /api/bff/master-data/subject-master/tree）
  - 詳細取得エンドポイント（GET /api/bff/master-data/subject-master/:id）
  - 科目 CRUD エンドポイント（POST/PATCH）
  - 無効化/再有効化エンドポイント
  - Rollup エンドポイント
  - 認証ミドルウェアから tenant_id / user_id 取得
  - _Requirements: 1, 2, 3, 4, 5, 6, 7, 8, 9_

- [ ] 4.6 BFF Module を登録する
  - SubjectMasterModule 作成
  - Controller, Service, Mapper, TreeBuilder, DomainApiClient を登録
  - AppModule への登録
  - _Requirements: 1_

---

## 5. UI 実装（Phase 1: v0 統制テスト）

- [ ] 5.1 v0 Prompt を使用して UI を生成する
  - v0-prompt.md の内容を v0.dev に投入
  - ツリーパネル + 詳細パネルの2ペインレイアウト生成
  - BASE科目作成ダイアログ生成
  - AGGREGATE科目作成ダイアログ生成
  - 構成科目追加ダイアログ生成
  - _Requirements: 1, 2, 3, 4, 5_

- [ ] 5.2 v0 生成物を隔離ゾーンに取得する
  - v0-fetch.sh で `_v0_drop/master-data/subject-master/src` に取得
  - OUTPUT.md 確認
  - layout.tsx が存在しないことを確認
  - _Requirements: 1_

- [ ] 5.3 MockBffClient を実装する
  - BffClient インターフェース定義
  - MockBffClient でダミーデータを返却
  - ツリー構造のモックデータ作成（AGGREGATE親、BASE子のサンプル）
  - エラーケースのシミュレーション
  - _Requirements: 1, 2_

- [ ] 5.4 Structure Guard を実行する
  - structure-guards.ts を実行
  - UI → Domain API 直接呼び出しがないことを確認
  - packages/contracts/src/api への参照がないことを確認
  - 直接 fetch() がないことを確認
  - _Requirements: 11_

---

## 6. UI 実装（Phase 2: 本実装・移植）

- [ ] 6.1 v0 生成物を features に移植する
  - v0-migrate.ts で `apps/web/src/features/master-data/subject-master/` に移植
  - import パス修正（@/shared/ui を使用）
  - DTO import 修正（@contracts/bff/subject-master を使用）
  - _Requirements: 1_

- [ ] 6.2 ツリーパネルコンポーネントを実装する
  - 展開/折りたたみ機能
  - ノード選択機能（詳細パネル連携）
  - ドラッグ＆ドロップ機能（dnd-kit または react-beautiful-dnd）
  - ドロップ可能位置の視覚フィードバック
  - コピー＆ペースト機能（クリップボード管理）
  - _Requirements: 1, 6, 7_

- [ ] 6.3 詳細パネルコンポーネントを実装する
  - 選択科目の全属性表示
  - 編集モード切替
  - フォーム入力・バリデーション
  - 保存処理
  - 無効化/再有効化ボタン
  - _Requirements: 2, 8, 9_

- [ ] 6.4 科目作成ダイアログを実装する
  - BASE科目作成フォーム
  - AGGREGATE科目作成フォーム
  - 必須項目バリデーション
  - 登録処理
  - _Requirements: 3, 4_

- [ ] 6.5 構成科目管理機能を実装する
  - 構成科目追加ダイアログ（科目選択、係数入力）
  - 係数編集機能
  - 構成科目削除機能
  - sortOrder 並べ替え
  - _Requirements: 5_

- [ ] 6.6 フィルタリング・検索機能を実装する
  - キーワード検索（科目コード/科目名の部分一致ハイライト）
  - 科目タイプフィルタ（FIN/KPI）
  - 科目クラスフィルタ（BASE/AGGREGATE）
  - 有効フラグフィルタ
  - 複数フィルタの AND 結合
  - フィルタ該当時の親ノード自動展開
  - _Requirements: 10_

- [ ] 6.7 HttpBffClient を実装して BFF に接続する
  - HttpBffClient 実装
  - 全エンドポイントへの接続
  - エラーハンドリング（コードに基づく表示切替）
  - _Requirements: 1, 2, 3, 4, 5, 6, 7, 8, 9_

- [ ] 6.8 App Router・Navigation を登録する
  - `apps/web/src/app/master-data/subject-master/page.tsx` 作成
  - `apps/web/src/shared/navigation/menu.ts` に追加
  - _Requirements: 1_

---

## 7. 統合テスト

- [ ] 7.1 科目 CRUD の統合テストを実施する
  - 科目一覧取得（ツリー表示）が動作する
  - 科目詳細取得が動作する
  - BASE 科目登録が動作する（posting_allowed=true 初期化確認）
  - AGGREGATE 科目登録が動作する（posting_allowed=false 強制確認）
  - 科目更新が動作する（重複エラー確認含む）
  - _Requirements: 1, 2, 3, 4, 12_

- [ ] 7.2 無効化・再有効化の統合テストを実施する
  - 無効化が動作する
  - 既無効化科目の無効化エラーを確認
  - 再有効化が動作する
  - 既有効科目の再有効化エラーを確認
  - 集計科目無効化時の子rollup削除を確認
  - _Requirements: 8, 9_

- [ ] 7.3 Rollup 操作の統合テストを実施する
  - 構成科目追加が動作する（循環参照チェック含む）
  - 構成科目の係数・順序更新が動作する
  - 構成科目削除が動作する
  - 重複rollupエラーを確認
  - BASE科目下への追加エラーを確認
  - _Requirements: 5, 14_

- [ ] 7.4 ドラッグ＆ドロップ・コピー＆ペーストの統合テストを実施する
  - 科目移動が動作する（旧rollup削除 + 新rollup作成）
  - ルートへの移動が動作する
  - コピー＆ペーストが動作する（デフォルト係数+1）
  - 循環参照エラーを確認
  - _Requirements: 6, 7, 14_

- [ ] 7.5 フィルタリング・検索の統合テストを実施する
  - キーワード検索が動作する
  - 各種フィルタが動作する
  - AND結合が動作する
  - 親ノード自動展開が動作する
  - _Requirements: 10_

- [ ] 7.6 マルチテナント分離の統合テストを実施する
  - 異なるテナントのデータにアクセスできないことを確認
  - tenant_id によるフィルタが効いていることを確認
  - RLS が正しく動作していることを確認
  - _Requirements: 11_

---

## Requirements Coverage

| Requirement | Task |
|-------------|------|
| 1. 科目ツリーの表示 | 1.1, 3.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 6.1, 6.2, 6.7, 6.8, 7.1 |
| 2. 科目の詳細表示・編集 | 1.1, 3.3, 4.3, 4.4, 4.5, 5.1, 5.3, 6.3, 6.7, 7.1 |
| 3. 通常科目（BASE）の新規登録 | 1.3, 1.5, 3.3, 4.4, 4.5, 5.1, 6.4, 6.7, 7.1 |
| 4. 集計科目（AGGREGATE）の新規登録 | 1.3, 1.5, 3.3, 4.4, 4.5, 5.1, 6.4, 6.7, 7.1 |
| 5. 集計構造（Rollup）の定義 | 1.2, 1.4, 1.5, 3.2, 3.5, 4.4, 4.5, 5.1, 6.5, 6.7, 7.3 |
| 6. ドラッグ＆ドロップによる構造編集 | 1.2, 3.5, 4.4, 4.5, 6.2, 6.7, 7.4 |
| 7. 科目のコピー＆ペースト | 1.2, 3.5, 4.4, 4.5, 6.2, 6.7, 7.4 |
| 8. 科目の無効化 | 1.5, 3.3, 4.4, 4.5, 6.3, 6.7, 7.2 |
| 9. 科目の再有効化 | 1.5, 3.3, 4.4, 4.5, 6.3, 6.7, 7.2 |
| 10. 科目のフィルタリング・検索 | 4.2, 4.4, 6.6, 7.5 |
| 11. マルチテナント・データ分離 | 2.1, 2.2, 2.3, 3.1, 3.2, 4.1, 5.4, 7.6 |
| 12. 会社単位の一意性制約 | 2.1, 2.2, 3.1, 3.3, 7.1 |
| 13. 監査ログ | 3.1, 3.2, 3.3 |
| 14. 循環参照の防止 | 1.5, 3.4, 3.5, 7.3, 7.4 |

---

## Notes

- **Contracts-first** 順序を厳守：1（Contracts）→ 2（DB）→ 3（API）→ 4（BFF）→ 5/6（UI）→ 7（統合テスト）
- タスク 1.1〜1.4 は並列実行可能（(P) マーカー付き）
- UI は Phase 1（v0 統制テスト）→ Phase 2（本実装）の2段階で進行
- ツリー構造は BFF 責務（フラット → ツリー変換）
- 循環参照チェックは Domain API の責務（DFS アルゴリズム）
