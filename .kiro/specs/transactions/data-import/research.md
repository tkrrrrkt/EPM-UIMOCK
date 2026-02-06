# Research & Design Decisions

---

## Summary
- **Feature**: `data-import`
- **Discovery Scope**: Extension（UI Phase 1完了、バックエンド未実装）
- **Key Findings**:
  - BFF契約は既に585行で詳細定義済み（`packages/contracts/src/bff/data-import/index.ts`）
  - AG-Grid Enterprise v35が既にインストール済み、共有ラッパー存在
  - ファイルストレージは未実装、新規設計が必要

---

## Research Log

### AG-Grid vs SpreadJS

- **Context**: 要件でAG-Gridへの移行が決定された
- **Sources Consulted**:
  - `apps/web/package.json` - ag-grid-enterprise v35.0.0 インストール確認
  - `apps/web/src/shared/ag-grid/` - 既存ラッパー実装
- **Findings**:
  - AG-Grid Enterprise版が既にインストール済み
  - EditableAmountGridコンポーネントが存在し、クリップボードペースト対応済み
  - 日本語ロケール（AG_GRID_LOCALE_JP）も設定済み
- **Implications**:
  - 既存のEditableAmountGridを拡張またはImportPreviewGridとして新規作成
  - SpreadJSからの移行コストは低い

### 既存BFF契約の分析

- **Context**: UI Phase 1で定義されたBffClient interfaceの実装設計
- **Sources Consulted**:
  - `packages/contracts/src/bff/data-import/index.ts`
  - `apps/web/src/features/transactions/data-import/api/BffClient.ts`
- **Findings**:
  - 16メソッドのBffClientインターフェースが定義済み
  - Enum: ImportType, ImportSourceType, ImportBatchStatus, MappingType等
  - DTOs: Start, PreMapping, Staging, Validation, Execute, History等
  - Error: DataImportErrorCode（25種類）
  - 定数: LARGE_DATA_THRESHOLD = 5000
- **Implications**:
  - BFFエンドポイントは契約に準拠して実装
  - Domain API契約は新規定義が必要

### BFFパターン分析

- **Context**: 既存BFFサービスの実装パターン確認
- **Sources Consulted**:
  - `apps/bff/src/modules/kpi/kpi-master/kpi-master.service.ts`
- **Findings**:
  - HttpService + firstValueFromパターン
  - Paging正規化: page/pageSize → offset/limit
  - Header伝搬: x-tenant-id, x-user-id, x-company-id
  - Mapper経由でDTO変換
- **Implications**:
  - 同じパターンで実装
  - data-import用Mapperを作成

### ファイルストレージ設計

- **Context**: 元ファイル保存の要件対応
- **Sources Consulted**:
  - `apps/api/src/modules/` 既存ストレージ実装を検索 → 未発見
- **Findings**:
  - 現時点でS3/オブジェクトストレージ実装なし
  - 新規にファイルストレージ基盤の設計が必要
- **Implications**:
  - Phase 1ではローカルファイルシステム or S3互換ストレージ
  - 抽象化レイヤー（FileStorageAdapter）を設計
  - 将来的にS3/MinIO/Cloudflare R2等に差し替え可能な設計

---

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| バッチ処理パターン | import_batchesでステート管理 | 状態追跡可能、再開可能 | 複雑性増加 | 既存契約で採用済み |
| 同期処理 | 即時処理 | シンプル | 大量データでタイムアウト | 却下 |
| キュー処理 | ジョブキュー使用 | スケーラブル | インフラ追加 | Phase 2以降 |

---

## Design Decisions

### Decision: バッチステート管理

- **Context**: 大量データ取込時の状態管理
- **Alternatives Considered**:
  1. セッションベース - メモリ保持
  2. DBバッチテーブル - 永続化
- **Selected Approach**: DBバッチテーブル（import_batches）
- **Rationale**:
  - 再開可能
  - 監査対応
  - 既存契約（ImportBatchStatus enum）と整合
- **Trade-offs**: DB書込み増加、クリーンアップ必要
- **Follow-up**: バッチ有効期限とクリーンアップジョブ設計

### Decision: マッピングテンプレートのスコープ

- **Context**: マッピングをどの単位で保存するか
- **Selected Approach**: カンパニー（company_id）単位
- **Rationale**:
  - 親会社・子会社でERPが異なる
  - QA壁打ちで確定済み
- **Trade-offs**: カンパニー間でのテンプレート共有不可

### Decision: ファイルストレージ抽象化

- **Context**: 元ファイル保存のストレージ選択
- **Selected Approach**: FileStorageAdapterインターフェース + 初期実装はローカルファイル
- **Rationale**:
  - 本番環境でのストレージ選択を遅延
  - 開発時はローカルで動作
- **Trade-offs**: 本番デプロイ時に設定変更必要
- **Follow-up**: S3互換実装の追加

---

## Risks & Mitigations

- **大量データパフォーマンス** — ステージング5000行制限、事前集計機能
- **ファイルストレージ障害** — リトライ機構、トランザクション分離
- **マッピングエラー** — 自動検出の信頼度表示、手動修正UI

---

## References

- [AG-Grid Enterprise Documentation](https://www.ag-grid.com/documentation/)
- `.kiro/specs/仕様検討/work/chat1` - QA壁打ちセッション記録
- `.kiro/specs/仕様概要/データ取込_タグ機能.md` - ステージングアーキテクチャ
