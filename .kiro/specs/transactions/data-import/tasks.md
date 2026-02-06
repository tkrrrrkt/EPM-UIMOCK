# Implementation Plan: Data Import（データ取込機能）

> CCSDD / SDD 前提：**contracts-first**（bff → api → shared）を最優先し、境界違反を guard で止める。
> UI は最後。v0 は **Phase 1（統制テスト）→ Phase 2（本実装）** の二段階で扱う。

---

## 0. Design Completeness Gate（Blocking）

> Implementation MUST NOT start until all items below are checked.

- [ ] 0.1 Designの「BFF Specification（apps/bff）」が埋まっている
  - BFF endpoints（20エンドポイント）が記載されている
  - Request/Response DTOが列挙されている
  - Paging/Sorting正規化が明記されている（page/pageSize → offset/limit）
  - Error Policy: Pass-through が選択されている
  - tenant_id/user_id の取り回しが記載されている

- [ ] 0.2 Designの「Service Specification（Domain / apps/api）」が埋まっている
  - 6サービス（Batch, Staging, Validation, Execution, Template, History）が定義されている
  - トランザクション境界が記載されている
  - 監査ログ記録ポイントが記載されている

- [ ] 0.3 Designの「Repository Specification（apps/api）」が埋まっている
  - 4リポジトリが記載されている（tenant_id必須）
  - where句二重ガードの方針が記載されている

- [ ] 0.4 Designの「Contracts Summary（This Feature）」が埋まっている
  - Domain API契約（新規作成）が定義されている
  - FileStorageAdapterインターフェースが定義されている
  - Enum/Errorは shared に集約されている

- [ ] 0.5 Requirements Traceability が更新されている
  - 10要件がBFF/API/Flows等に紐づいている

- [ ] 0.6 v0生成物の受入・移植ルールが確認されている
  - UI Phase 1（MockBffClient）が既存
  - v0_drop 配下に layout.tsx が存在しない

- [ ] 0.7 Structure / Boundary Guard がパスしている
  - `npx tsx scripts/structure-guards.ts` が成功している

---

## 1. Scaffold / Structure Setup

- [ ] 1.1 Feature骨格の確認と補完
  - 既存の `apps/web/src/features/transactions/data-import` を確認
  - 不足ディレクトリ（BFF, API）を scaffold で生成
  - `apps/bff/src/modules/transactions/data-import` を作成
  - `apps/api/src/modules/transactions/data-import` を作成
  - _Requirements: N/A（インフラ準備）_

---

## 2. Contracts Definition（BFF → API → Shared）

- [ ] 2.1 (P) 共通Enum・Errorを shared に移動・定義
  - ImportCategory, ImportType, ImportSourceType, ImportBatchStatus を `packages/contracts/src/shared/enums/data-import` に定義
  - MappingConfidence, ValidationStatus を同ファイルに追加
  - DataImportErrorCode を `packages/contracts/src/shared/errors/data-import.ts` に定義
  - 既存 BFF 契約からの参照を shared に切り替え
  - _Requirements: 1.1, 1.2, 5.1, 6.1_

- [ ] 2.2 (P) Domain API契約を定義
  - `packages/contracts/src/api/data-import/index.ts` を作成
  - Batch Management DTOs（CreateBatch, GetBatch, UpdateBatchStatus）
  - File Storage DTOs（SaveFile, DownloadFile）
  - Mapping & Analysis DTOs（AnalyzeFile, ApplyMapping）
  - Staging DTOs（GetStagingRows, UpdateStagingRows）
  - Aggregation DTOs（AggregateRows）
  - Validation DTOs（Validate）
  - Execution DTOs（ExecuteImport）
  - History DTOs（ListHistory）
  - Template DTOs（ListTemplates, CreateTemplate, DeleteTemplate）
  - _Requirements: 1.1-1.6, 2.1-2.6, 3.1-3.7, 6.1-6.7, 7.1-7.6, 8.1-8.5_

- [ ] 2.3 (P) FileStorageAdapter契約を定義
  - `packages/contracts/src/api/data-import/file-storage.ts` を作成
  - FileStorageAdapter インターフェース（upload, download, delete, exists, getSignedUrl）
  - FileUploadResult, FileDownloadResult 型
  - FileStorageConfig 型
  - FileStorageError, FileStorageErrorCode
  - _Requirements: 2.1-2.3, 7.4-7.5_

- [ ] 2.4 BFF契約の整合性確認
  - 既存 `packages/contracts/src/bff/data-import/index.ts` と API契約の整合性を確認
  - shared への参照を更新
  - _Requirements: 1.1-1.6, 2.1-2.6, 3.1-3.7, 4.1-4.7, 5.1-5.7, 6.1-6.7, 7.1-7.6, 8.1-8.5_

---

## 3. Database / Migration / RLS

- [ ] 3.1 Prismaスキーマを定義
  - `ImportMappingTemplate` モデルを追加（tenant_id, company_id, name, columnMappings等）
  - `ImportBatch` モデルを拡張（company_id, import_category, original_file_path, excluded_rows, mapping_template_id）
  - `ImportStagingRow` モデルを追加（batch_id, row_index, cells, validation_status等）
  - UNIQUE制約（tenant_id, company_id, name on ImportMappingTemplate）
  - FK制約（batch_id → import_batches ON DELETE CASCADE）
  - _Requirements: 3.7, 7.6, 8.3_

- [ ] 3.2 Migrationを実行
  - `npx prisma migrate dev --name add_data_import_tables`
  - マイグレーション成功を確認
  - _Requirements: N/A（インフラ）_

- [ ] 3.3 RLSポリシーを設定
  - `import_mapping_templates` に tenant_isolation ポリシーを追加
  - `import_batches` に tenant_isolation ポリシーを追加
  - `import_staging_rows` に tenant_isolation ポリシーを追加
  - set_config による tenant_id 設定を確認
  - _Requirements: 9.5_

---

## 4. Infrastructure（FileStorageAdapter）

- [ ] 4.1 LocalFileStorageAdapter を実装
  - `apps/api/src/infrastructure/storage/local-file-storage.adapter.ts` を作成
  - upload メソッド（パス規約: tenants/{tenantId}/batches/{batchId}/original/{filename}）
  - download メソッド
  - delete メソッド
  - exists メソッド
  - getSignedUrl メソッド（ローカルは null を返す）
  - MD5チェックサム計算
  - _Requirements: 2.1-2.3, 7.4-7.5, 7.6_

- [ ] 4.2 FileStorageModule を設定
  - `apps/api/src/infrastructure/storage/file-storage.module.ts` を作成
  - DI設定（FILE_STORAGE_ADAPTER トークン）
  - ConfigService による type 切り替え（local/s3）
  - デフォルト basePath 設定（./storage）
  - _Requirements: 7.6_

---

## 5. Domain API Services（apps/api）

- [ ] 5.1 ImportBatchService を実装
  - バッチ作成（createBatch）
  - バッチ取得（getBatch）
  - ステータス更新（updateStatus）
  - ファイル保存（saveUploadedFile）- FileStorageAdapter を使用
  - トランザクション境界の設定
  - 監査ログ記録（バッチ作成、状態変更）
  - _Requirements: 1.1-1.6, 2.1-2.6_

- [ ] 5.2 (P) ImportStagingService を実装
  - ステージング行作成（createStagingRows）
  - ステージング行取得（getStagingRows）- ページング対応
  - ステージング行更新（updateStagingRows）
  - 集計実行（aggregateRows）- 5000行超の大量データ対応
  - 除外フラグ更新
  - _Requirements: 4.1-4.7_

- [ ] 5.3 (P) ImportValidationService を実装
  - バリデーション実行（validate）
  - 勘定科目コードのマスタ存在チェック
  - 部門コードのマスタ存在チェック
  - 金額フィールドの数値検証
  - 重複キー検出（警告）
  - 自動修正提案取得（getAutoFixSuggestions）
  - 自動修正適用（applyAutoFix）
  - バリデーション結果サマリ生成
  - _Requirements: 5.1-5.7_

- [ ] 5.4 ImportExecutionService を実装
  - 取込実行（execute）
  - ステージングから fact_amounts への反映
  - 冪等性の実装（同一バッチの再実行で重複登録しない）
  - エラー行除外オプション
  - 上書きオプション
  - トランザクション管理（アトミック）
  - 監査ログ記録（取込実行、件数）
  - _Requirements: 6.1-6.7_

- [ ] 5.5 (P) MappingTemplateService を実装
  - テンプレート一覧取得（listTemplates）- カンパニー単位
  - テンプレート作成（createTemplate）
  - テンプレート更新（updateTemplate）
  - テンプレート削除（deleteTemplate）
  - デフォルトフラグ管理（カンパニー単位で1つのみ）
  - 自動検出マッピング（autoDetectMapping）- エイリアス辞書 + パターンマッチ
  - _Requirements: 3.1-3.7, 8.1-8.5, 10.1-10.5_

- [ ] 5.6 (P) ImportHistoryService を実装
  - 履歴一覧取得（listHistory）- フィルタリング・ページング対応
  - 履歴詳細取得（getHistoryDetail）
  - 元ファイルダウンロード（downloadOriginalFile）- FileStorageAdapter 使用
  - _Requirements: 7.1-7.6_

- [ ] 5.7 DataImportController を実装
  - 全サービスのエンドポイント公開
  - tenant_id / user_id ヘッダー処理
  - 権限デコレータ適用（epm.import.*）
  - エラーハンドリング
  - _Requirements: 9.1-9.5_

---

## 6. Domain API Repositories（apps/api）

- [ ] 6.1 (P) ImportBatchRepository を実装
  - CRUD操作（tenant_id 必須）
  - where句二重ガード
  - ステータス更新メソッド
  - _Requirements: 1.1-1.6, 6.1-6.7_

- [ ] 6.2 (P) ImportStagingRowRepository を実装
  - 一括挿入（createMany）
  - ページング取得
  - ステータスフィルタ
  - 一括更新
  - 集計クエリ（GROUP BY）
  - _Requirements: 4.1-4.7, 5.1-5.7_

- [ ] 6.3 (P) MappingTemplateRepository を実装
  - CRUD操作
  - カンパニー単位のフィルタリング
  - デフォルトフラグ管理
  - _Requirements: 8.1-8.5_

- [ ] 6.4 FactAmountRepository を拡張
  - 取込用の一括挿入メソッド追加
  - 上書き用の upsert メソッド追加
  - _Requirements: 6.1-6.7_

---

## 7. BFF Implementation（apps/bff）

- [ ] 7.1 DataImportBffService を実装
  - Domain API呼び出し（HttpService + firstValueFrom）
  - Paging正規化（page/pageSize → offset/limit）
  - ヘッダー伝搬（x-tenant-id, x-user-id, x-company-id）
  - Error Policy: Pass-through 適用
  - _Requirements: 1.1-1.6, 2.1-2.6, 3.1-3.7, 4.1-4.7, 5.1-5.7, 6.1-6.7, 7.1-7.6, 8.1-8.5_

- [ ] 7.2 DataImportMapper を実装
  - API DTO → BFF DTO 変換
  - カラム名変換（snake_case → camelCase）
  - ページング結果のラッピング
  - _Requirements: 1.1-1.6, 4.1-4.7, 7.1-7.6_

- [ ] 7.3 DataImportBffController を実装
  - 20エンドポイントの公開
  - Clerk認証連携（tenant_id / user_id 解決）
  - ファイルアップロード処理（multipart/form-data）
  - バイナリダウンロード処理
  - _Requirements: 1.1-1.6, 2.1-2.6, 3.1-3.7, 4.1-4.7, 5.1-5.7, 6.1-6.7, 7.1-7.6, 8.1-8.5, 9.1-9.5_

---

## 8. UI Phase 1: AG-Grid Migration（Mock継続）

- [ ] 8.1 ImportPreviewGrid コンポーネントを実装
  - AG-Grid Enterprise を使用（既存 EditableAmountGrid を参考）
  - 行チェックボックス（取込対象/除外）
  - セル単位編集
  - クリップボードペースト（Ctrl+V）
  - エラーのみ表示フィルタ
  - ステータス列（OK/エラー/警告）
  - エラー内容ツールチップ
  - _Requirements: 4.1-4.7_

- [ ] 8.2 LargeDataWarningDialog を実装
  - 5000行超検出時のダイアログ
  - 「集計して続行」「そのまま続行」「キャンセル」選択肢
  - 警告メッセージ表示
  - _Requirements: 4.1（大量データ対応）_

- [ ] 8.3 MappingPanel コンポーネントを実装
  - 自動検出結果表示（完全一致/パターン一致/要確認/未マッピング）
  - 手動マッピング選択（ドロップダウン）
  - テンプレート選択UI
  - マッピング保存チェックボックス
  - _Requirements: 3.1-3.7, 10.1-10.5_

- [ ] 8.4 ValidationSummary コンポーネントを実装
  - バリデーション結果サマリ（正常/エラー/警告件数）
  - エラー詳細リスト（折畳み可能）
  - エラー行へのジャンプ
  - _Requirements: 5.1-5.7_

- [ ] 8.5 HistoryList コンポーネントを実装
  - 履歴一覧表示
  - フィルタリング（カンパニー/種別/期間）
  - 元ファイルダウンロードボタン
  - 除外行詳細ダウンロード
  - _Requirements: 7.1-7.6_

---

## 9. UI Phase 2: BFF Integration

- [ ] 9.1 HttpBffClient を実装
  - BffClient インターフェースの実装
  - 全20エンドポイントの呼び出し
  - エラーハンドリング（DataImportErrorCode マッピング）
  - ファイルアップロード処理
  - _Requirements: 1.1-1.6, 2.1-2.6, 3.1-3.7, 4.1-4.7, 5.1-5.7, 6.1-6.7, 7.1-7.6, 8.1-8.5_

- [ ] 9.2 MockBffClient から HttpBffClient への切り替え
  - クライアントファクトリの更新
  - 環境変数による切り替え設定
  - _Requirements: N/A（統合）_

- [ ] 9.3 権限制御UIの実装
  - epm.import.execute 権限チェック（取込実行ボタン）
  - epm.import.manage-template 権限チェック（テンプレート管理）
  - epm.import.read-history 権限チェック（履歴閲覧）
  - 権限がない場合の非表示/無効化
  - _Requirements: 9.1-9.5_

- [ ] 9.4 SpreadJS から AG-Grid への移行完了
  - StagingGrid.tsx（SpreadJS）を削除
  - ImportPreviewGrid への完全切り替え
  - StagingSection の更新
  - _Requirements: 4.1-4.7_

---

## 10. Integration & Testing

- [ ] 10.1 E2Eテスト: 取込フロー全体
  - ファイルアップロード → マッピング → プレビュー → バリデーション → 取込実行
  - 正常系フロー
  - エラー行除外フロー
  - _Requirements: 1.1-1.6, 2.1-2.6, 3.1-3.7, 4.1-4.7, 5.1-5.7, 6.1-6.7_

- [ ] 10.2 E2Eテスト: 大量データ処理
  - 5000行超のデータ取込
  - 事前集計フロー
  - パフォーマンス確認（30秒以内）
  - _Requirements: 4.1（大量データ）_

- [ ] 10.3 E2Eテスト: 履歴・テンプレート管理
  - 履歴一覧・フィルタリング
  - 元ファイルダウンロード
  - テンプレート作成・削除
  - _Requirements: 7.1-7.6, 8.1-8.5_

- [ ] 10.4 Structure Guard 最終確認
  - `npx tsx scripts/structure-guards.ts` がパス
  - UI → Domain API 直接呼び出しなし
  - fetch直書きなし
  - _Requirements: N/A（品質ゲート）_

---

## Requirements Coverage Summary

| Requirement | Task Coverage |
|-------------|---------------|
| 1. 取込種別・対象選択 (1.1-1.6) | 2.1, 2.2, 5.1, 6.1, 7.1, 7.3, 9.1 |
| 2. ファイルアップロード (2.1-2.6) | 2.3, 4.1, 5.1, 7.1, 7.3, 9.1 |
| 3. マッピング設定 (3.1-3.7) | 2.2, 3.1, 5.5, 7.1, 7.3, 8.3, 9.1 |
| 4. AG-Gridプレビュー・編集 (4.1-4.7) | 5.2, 6.2, 7.1, 7.2, 8.1, 8.2, 9.1, 9.4 |
| 5. バリデーション (5.1-5.7) | 2.1, 5.3, 6.2, 7.1, 8.4, 9.1 |
| 6. 取込実行 (6.1-6.7) | 2.1, 5.4, 6.1, 6.4, 7.1, 7.3, 9.1 |
| 7. 取込履歴管理 (7.1-7.6) | 2.2, 2.3, 4.1, 5.6, 7.1, 7.2, 8.5, 9.1 |
| 8. マッピングテンプレート管理 (8.1-8.5) | 2.2, 3.1, 5.5, 6.3, 7.1, 7.3, 9.1 |
| 9. 権限制御 (9.1-9.5) | 3.3, 5.7, 7.3, 9.3 |
| 10. 自動検出ロジック (10.1-10.5) | 5.5, 8.3 |

---

## Parallel Execution Groups

以下のタスクは並列実行可能：

**Group A（Contracts）**: 2.1, 2.2, 2.3
**Group B（Repositories）**: 6.1, 6.2, 6.3
**Group C（Services - 独立）**: 5.2, 5.3, 5.5, 5.6

---

## Notes

- UI Phase 1 は既存の MockBffClient で動作確認済みの状態から開始
- AG-Grid Enterprise v35.0.0 は既にインストール済み
- BFF契約（585行）は既存活用、API契約は新規作成
- FileStorageAdapter は初期実装としてローカルファイルシステムを使用
