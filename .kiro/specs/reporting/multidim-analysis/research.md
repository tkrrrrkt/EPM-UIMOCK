# Research & Design Decisions

---
**Feature**: `reporting/multidim-analysis`
**Discovery Scope**: New Feature（新規実装）
**Discovery Date**: 2026-02-05

---

## Summary

- **Feature**: reporting/multidim-analysis
- **Discovery Scope**: New Feature（多次元分析UI機能を新規実装）
- **Key Findings**:
  - AG Grid Enterprise 35.0.0 が既にプロジェクトに導入済み（Pivot機能含む）
  - V0プロトタイプのZustand状態管理パターンが参考になる
  - 既存BffClientパターン（Dashboard feature）を踏襲可能

## Research Log

### AG Grid Enterprise Pivot 機能調査

- **Context**: 多次元分析UIのグリッドエンジンとしてAG Grid Enterprise Pivot を使用する決定
- **Sources Consulted**:
  - `apps/web/package.json` - ag-grid-enterprise: ^35.0.0
  - `apps/web/src/shared/ag-grid/` - 既存AG Grid共通設定
  - AG Grid Enterprise Documentation (Pivot Mode)
- **Findings**:
  - AG Grid Enterprise 35.0.0 導入済み
  - `registerAgGridModules` で共通モジュール登録パターンあり
  - 日本語ロケール対応済み（`AG_GRID_LOCALE_JP`）
  - Pivot機能はEnterprise版に含まれる
- **Implications**:
  - 新規ライブラリ追加不要
  - 既存のAG Grid共通設定を活用可能
  - SSRM（Server-Side Row Model）も利用可能

### V0プロトタイプ分析

- **Context**: V0で作成したOLAPワークベンチの設計パターンを確認
- **Sources Consulted**:
  - `/Users/ktkrr/root/99_work/multidimensional-analysis-workbench/lib/stores/pivot-store.ts`
  - `/Users/ktkrr/root/99_work/multidimensional-analysis-workbench/lib/types/pivot.ts`
- **Findings**:
  - Zustandによる状態管理（persist middleware付き）
  - DimX相互排他ルールの実装パターン
  - 分析モード（standard/project）の切替ロジック
  - URL共有用のBase64エンコードパターン
- **Implications**:
  - V0の状態管理ロジックを参考に再実装
  - DimX相互排他ルールはUI層（store）で実装
  - API層でも同様のバリデーションが必要

### 既存BffClientパターン調査

- **Context**: Dashboard featureのBffClientパターンを確認し、踏襲する
- **Sources Consulted**:
  - `apps/web/src/features/reporting/dashboard/api/BffClient.ts`
  - `packages/contracts/src/bff/dashboard/index.ts`
- **Findings**:
  - BffClient interface + MockBffClient + HttpBffClient パターン
  - contracts/bff に DTO 定義
  - Query/Response パターンが明確
  - エラーコード定義（DashboardErrorCode）
- **Implications**:
  - 同一パターンで MultidimAnalysis BffClient を設計
  - contracts/bff/multidim-analysis に DTO を定義

### ディメンション・ファクト構造調査

- **Context**: 多次元分析の集計対象となるデータ構造を確認
- **Sources Consulted**:
  - `.kiro/specs/entities/01_各種マスタ.md` - dimensions, dimension_values
  - `.kiro/specs/entities/02_トランザクション・残高.md` - fact_amounts, fact_dimension_links
- **Findings**:
  - 3層ディメンション構造（dimensions → dimension_values → dimension_members）
  - Factへの付与は Group（dimension_values）のみ
  - fact_dimension_links でファクトとディメンションを紐付け
  - tenant_id による RLS 分離
- **Implications**:
  - ピボット集計SQLはdimension_values（Group）レベルで集計
  - tenant_id を全クエリに含める必要あり

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| AG Grid Client-Side Pivot | クライアント側でピボット集計 | 実装シンプル | 大規模データで性能問題 | 1000行以下の場合に適用 |
| AG Grid SSRM + Pivot | サーバーサイドで集計、クライアントは表示のみ | 大規模データ対応、RLS統合容易 | API実装が複雑 | **採用** |
| Cube Cloud連携 | セマンティックレイヤで集計 | 高度な分析機能 | インフラ追加、Phase 3以降 | 将来拡張として検討 |

## Design Decisions

### Decision: AG Grid Enterprise SSRM + Pivot 採用

- **Context**: 100万行を超えるファクトデータに対するピボット集計が要件
- **Alternatives Considered**:
  1. クライアントサイドピボット — 小規模データ向け
  2. SSRM（Server-Side Row Model）— サーバーで集計
  3. Cube Cloud — セマンティックレイヤ経由
- **Selected Approach**: SSRM + Pivot
- **Rationale**:
  - 既にAG Grid Enterprise導入済み
  - RLSによるマルチテナント分離と相性が良い
  - 大規模データでもサーバー側で集計することでブラウザ負荷を軽減
- **Trade-offs**:
  - サーバー側に集計ロジック実装が必要
  - API呼び出しごとにDB負荷が発生
- **Follow-up**:
  - 集計SQLのパフォーマンスチューニング
  - インデックス設計の検討

### Decision: Zustand による状態管理

- **Context**: ピボットレイアウト状態の管理方式
- **Alternatives Considered**:
  1. React Context — シンプルだが大規模状態に不向き
  2. Redux — 過剰な設計
  3. Zustand — 軽量かつpersist対応
- **Selected Approach**: Zustand + persist middleware
- **Rationale**:
  - V0プロトタイプで実証済み
  - localStorageへの永続化が容易
  - URLエンコードによる共有機能と相性が良い
- **Trade-offs**:
  - サーバー側との状態同期は手動管理
- **Follow-up**:
  - persist設定の最適化（保存対象の絞り込み）

### Decision: DimX相互排他ルールの二重実装

- **Context**: DimX系フィールドは同時に1つしか使用できないルール
- **Alternatives Considered**:
  1. UI層のみで実装 — サーバー側で悪意あるリクエストを防げない
  2. API層のみで実装 — UIでの即時フィードバックができない
  3. 両方で実装 — 二重防御
- **Selected Approach**: UI層（Zustand store）とAPI層（Service）の両方で実装
- **Rationale**:
  - UI層での即時フィードバック
  - API層での最終バリデーション（セキュリティ）
- **Trade-offs**:
  - ルール変更時に両方の修正が必要
- **Follow-up**:
  - ルール定義の共通化（shared constants）

## Risks & Mitigations

- **パフォーマンスリスク**: 100万行超のファクトデータでクエリが遅くなる可能性
  - Mitigation: インデックス設計、クエリ最適化、SSRM によるページング
- **RLS適用漏れリスク**: マルチテナント分離の不備
  - Mitigation: Repository層での tenant_id 二重ガード、RLSポリシー必須
- **状態同期リスク**: クライアント状態とサーバーデータの不整合
  - Mitigation: 明示的なリフレッシュ機能、エラー時のフォールバック

## References

- [AG Grid Enterprise Pivot Documentation](https://www.ag-grid.com/javascript-data-grid/pivoting/) — Pivot機能の公式ドキュメント
- [AG Grid Server-Side Row Model](https://www.ag-grid.com/javascript-data-grid/server-side-model/) — SSRM実装ガイド
- [Zustand Documentation](https://zustand-demo.pmnd.rs/) — 状態管理ライブラリ
- V0プロトタイプ: `/Users/ktkrr/root/99_work/multidimensional-analysis-workbench` — UIパターン参考
- 既存BffClientパターン: `apps/web/src/features/reporting/dashboard/api/BffClient.ts`
