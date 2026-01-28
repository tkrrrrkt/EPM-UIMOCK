# Research & Design Decisions

---
**Purpose**: ダッシュボード機能の技術設計に必要な調査結果と設計判断を記録する。

---

## Summary
- **Feature**: `reporting/dashboard`
- **Discovery Scope**: Complex Integration（新規エンティティ＋外部ライブラリ統合）
- **Key Findings**:
  - SyncFusion Dashboard Layout は React/Next.js 対応、`serialize()` メソッドでレイアウト永続化可能
  - SyncFusion Charts は 50+ チャートタイプをサポート、SVG/Canvas レンダリング対応
  - SyncFusion DataGrid は Excel エクスポート標準機能を提供（`allowExcelExport`）
  - 既存 ComponentConfig パターン（meetings/report-component）を参考に JSONB スキーマ設計可能

## Research Log

### SyncFusion Dashboard Layout

- **Context**: ダッシュボードのドラッグ&ドロップ・リサイズ機能の実現方法
- **Sources Consulted**:
  - [SyncFusion React Dashboard Layout](https://www.syncfusion.com/react-components/react-dashboard-layout)
  - [Dragging Panels Documentation](https://ej2.syncfusion.com/react/documentation/dashboard-layout/interaction-with-panels/dragging-moving-of-panels)
  - [API Reference](https://helpej2.syncfusion.com/react/documentation/api/dashboard-layout/)
- **Findings**:
  - `@syncfusion/ej2-react-layouts` パッケージで提供
  - `allowDragging: true` でドラッグ有効化
  - `allowFloating: true` で空きセルへの自動移動
  - `serialize()` メソッドでレイアウト状態をJSONとして取得可能
  - `panels` プロパティでプログラム的に配置設定
  - 各パネルは `row`, `col`, `sizeX`, `sizeY` で位置・サイズ定義
- **Implications**:
  - レイアウト情報（x, y, w, h）は `serialize()` 出力形式に準拠してJSONBに保存
  - View/Edit モード切替は `allowDragging` / `allowResizing` のフラグ制御で実現

### SyncFusion Charts

- **Context**: 各種チャートウィジェット（折れ線、棒、円、ゲージ等）の実現
- **Sources Consulted**:
  - [SyncFusion React Charts](https://www.syncfusion.com/react-components/react-charts)
  - [React Sparkline Charts](https://www.syncfusion.com/react-components/react-sparkline)
  - [Sparkline Getting Started](https://ej2.syncfusion.com/react/documentation/sparkline/getting-started)
- **Findings**:
  - `@syncfusion/ej2-react-charts` パッケージで 50+ チャートタイプ
  - Line, Bar, Column, Pie, Doughnut, Gauge はすべてサポート
  - 複合チャート（Line + Bar）は同一 ChartComponent 内で series type 指定
  - Sparkline は `@syncfusion/ej2-react-charts` の SparklineComponent
  - ツールチップ、凡例、アニメーションは標準サポート
  - SVG/Canvas 両対応（パフォーマンス調整可能）
- **Implications**:
  - 9 種類のウィジェットはすべて SyncFusion コンポーネントで実現可能
  - widget_type enum で種別管理、display_config JSONB でチャート固有設定を保持

### SyncFusion DataGrid Excel Export

- **Context**: テーブルウィジェットの Excel エクスポート機能
- **Sources Consulted**:
  - [Excel Exporting in React Grid](https://ej2.syncfusion.com/react/documentation/grid/excel-export/excel-exporting)
  - [React Data Grid Excel Export](https://www.syncfusion.com/react-components/react-data-grid/excel-export)
- **Findings**:
  - `allowExcelExport: true` で機能有効化
  - `ExcelExport` モジュールの inject が必要
  - `excelExport()` メソッドでエクスポート実行
  - `excelExportProperties` でカスタマイズ（ファイル名、ヘッダー、フッター等）
  - セルスタイル、画像、数式のエクスポートも可能
- **Implications**:
  - テーブルウィジェットに標準 Excel エクスポートボタンを配置
  - BFF/API 側の処理不要（クライアントサイド完結）

### 既存 ComponentConfig パターン

- **Context**: JSONB 設定スキーマの設計パターン
- **Sources Consulted**:
  - `packages/contracts/src/bff/meetings/report-component/ComponentConfig.ts`
- **Findings**:
  - BaseConfig インターフェースで共通設定を定義
  - 各コンポーネント固有設定は BaseConfig を extends
  - Union Type で ComponentConfig を定義
  - Type Guard 関数で型安全な判別を提供
- **Implications**:
  - 同様のパターンを DashboardWidgetConfig に適用
  - WidgetType enum と対応する Config インターフェースを定義

### 既存 indicator-report パターン

- **Context**: レポート系機能の BffClient / Contracts パターン
- **Sources Consulted**:
  - `packages/contracts/src/bff/indicator-report/index.ts`
  - `apps/web/src/features/reporting/indicator-report/api/BffClient.ts`
- **Findings**:
  - BffClient は interface として定義、MockBffClient / HttpBffClient で実装
  - Request DTO / Response DTO を明確に分離
  - エラーコードは const enum パターン
  - ScenarioType, DisplayGranularity 等の共有 enum は contracts で一元管理
- **Implications**:
  - Dashboard 機能も同様の BffClient パターンを採用
  - 既存の ScenarioType, DisplayGranularity は再利用

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| SyncFusion Dashboard Layout | グリッドベースの標準ダッシュボードコンポーネント | ドラッグ&ドロップ・リサイズ・レイアウト永続化が標準機能 | ライセンスコスト、学習コスト | ダッシュボード機能に限定して採用 |
| カスタム Grid 実装 | CSS Grid + react-dnd での自前実装 | 柔軟性高、ライセンス不要 | 開発工数大、安定性リスク | 工数対効果で不採用 |
| @dnd-kit/core | 汎用ドラッグ&ドロップライブラリ | 軽量、柔軟 | リサイズ機能別途必要、レイアウト計算自前 | 部分的活用可能だが SyncFusion 優先 |

**採用**: SyncFusion Dashboard Layout（ダッシュボード機能限定）

## Design Decisions

### Decision: JSONB スキーマ設計

- **Context**: Dashboard と DashboardWidget の設定情報をどのように永続化するか
- **Alternatives Considered**:
  1. Option A — 全設定を正規化テーブルで管理（多数の子テーブル）
  2. Option B — 設定を JSONB カラムで柔軟に保持
- **Selected Approach**: Option B（JSONB カラム）
- **Rationale**:
  - ウィジェット種別ごとに異なる設定項目があり、正規化は複雑化を招く
  - 既存 meetings/report-component が同様パターンで安定稼働
  - PostgreSQL の JSONB は検索・更新性能が十分
- **Trade-offs**:
  - スキーマ検証はアプリケーション層で実施（DB 制約なし）
  - マイグレーション時の JSONB フィールド変更は慎重に実施
- **Follow-up**: Zod スキーマで Contracts 側のバリデーションを厳密に定義

### Decision: グローバルフィルター vs ウィジェットフィルターの優先度

- **Context**: フィルター適用時の優先順位と実装方式
- **Alternatives Considered**:
  1. Option A — グローバルフィルターのみ（シンプル）
  2. Option B — ウィジェット単位のみ（柔軟だが煩雑）
  3. Option C — ハイブリッド（グローバル + オーバーライド）
- **Selected Approach**: Option C（ハイブリッド）
- **Rationale**:
  - 要件 4, 5 で明確に定義済み
  - 経営ダッシュボードでは「基本は同じ期間で、一部だけ前年比較」等のユースケースが多い
- **Trade-offs**:
  - フィルター適用ロジックの複雑化
  - UI での「どのフィルターが適用されているか」の明示が必要
- **Follow-up**: ウィジェット設定パネルに「グローバルを使用 / オーバーライド」の明示的なトグルを配置

### Decision: データ取得方式

- **Context**: ウィジェットごとに異なるデータソース（Fact/KPI/Metric）をどう取得するか
- **Alternatives Considered**:
  1. Option A — 1 API で全ウィジェットデータ一括取得
  2. Option B — ウィジェットごとに個別 API 呼び出し
- **Selected Approach**: Option B（ウィジェット単位 API）
- **Rationale**:
  - 部分エラー時に他ウィジェットの表示継続が可能（要件 2.6）
  - 並列取得でパフォーマンス確保
  - 編集中のリアルタイムプレビューにも対応しやすい
- **Trade-offs**:
  - API 呼び出し回数増加（N 個のウィジェットで N 回）
  - キャッシュ戦略が重要
- **Follow-up**: TanStack Query で個別クエリキーを設定し、invalidation を制御

## Risks & Mitigations

- **Risk 1**: SyncFusion ライセンスコスト増
  - Mitigation: ダッシュボード機能のみに限定、他機能への波及を防ぐ
- **Risk 2**: JSONB スキーマの Breaking Change
  - Mitigation: バージョニング（schema_version フィールド）を config に含める
- **Risk 3**: 大量ウィジェットでのパフォーマンス劣化
  - Mitigation: ウィジェット数上限（20 個程度）、仮想化検討

## References

- [SyncFusion React Dashboard Layout](https://www.syncfusion.com/react-components/react-dashboard-layout) — ドラッグ&ドロップレイアウト
- [SyncFusion React Charts](https://www.syncfusion.com/react-components/react-charts) — 50+ チャートタイプ
- [SyncFusion React Data Grid](https://www.syncfusion.com/react-components/react-data-grid) — Excel エクスポート
- [Dragging Panels Documentation](https://ej2.syncfusion.com/react/documentation/dashboard-layout/interaction-with-panels/dragging-moving-of-panels) — パネル操作 API
- [Excel Exporting in React Grid](https://ej2.syncfusion.com/react/documentation/grid/excel-export/excel-exporting) — Excel エクスポート API
