# Research & Design Decisions: Budget Entry

---
**Purpose**: 予算入力機能の設計決定とディスカバリー記録

**Usage**:
- 設計フェーズでの調査結果と根拠を記録
- design.md では詳細すぎる情報の保管場所
---

## Summary
- **Feature**: `planning/budget-entry`
- **Discovery Scope**: Extension（既存システムの拡張）
- **Key Findings**:
  - fact_amounts + fact_dimension_links のエンティティ構造を活用し、ディメンション別予算入力を実現
  - 既存のBFF Contractsパターン（employee-master等）を踏襲
  - Excel風グリッドUIはBFFでのデータ変換が必須（フラット→グリッド構造）

## Research Log

### [fact_amounts エンティティ構造の確認]
- **Context**: 予算データの格納先と一意キーの確認
- **Sources Consulted**:
  - `.kiro/specs/entities/02_トランザクション・残高.md`
  - `.kiro/specs/entities/01_各種マスタ.md` セクション 12.1
- **Findings**:
  - 一意キー: `(tenant_id, company_id, accounting_period_id, scenario_type, plan_version_id, source_type, subject_id, org_version_id, department_stable_id, project_key, ir_segment_key)`
  - ディメンションは fact_dimension_links で縦持ち（1ファクト1ディメンション1値）
  - source_type で入力/配賦/調整を区別（INPUT/ALLOC/ADJUST）
- **Implications**:
  - Upsertロジックは一意キーで検索 → 存在すればUPDATE、なければINSERT
  - ディメンション付き予算は fact_amounts + fact_dimension_links の2テーブル操作が必要

### [既存BFF Contractsパターンの分析]
- **Context**: 新機能のContractsを既存パターンに合わせる
- **Sources Consulted**:
  - `packages/contracts/src/bff/employee-master/index.ts`
  - `packages/contracts/src/bff/project-master/index.ts`
- **Findings**:
  - Request/Response DTO は camelCase
  - エラーコードは const オブジェクト + type で定義
  - ページング: page/pageSize/totalCount 形式
  - 日付は string（ISO形式）、金額は string（Decimal）
- **Implications**:
  - 同パターンでBudgetEntry用DTOを定義
  - エラーコードは BudgetEntryErrorCode として定義

### [集計科目（AGGREGATE）の計算ロジック]
- **Context**: 売上総利益・営業利益等の自動計算方式
- **Sources Consulted**:
  - `.kiro/specs/entities/01_各種マスタ.md` セクション 6.3（subject_rollup_items）
- **Findings**:
  - subject_rollup_items で親科目→子科目の関係を定義
  - coefficient（係数）で加減算を制御（+1: 加算, -1: 減算）
  - 例: 売上総利益 = 売上高(+1) + 売上原価(-1)
- **Implications**:
  - AGGREGATE科目の値はBFFで計算（DBには保存しない）
  - セル更新時に関連するAGGREGATE科目を再計算してUIに返却

### [ディメンション展開入力の設計]
- **Context**: 科目をディメンション値別に展開して入力する機能
- **Sources Consulted**:
  - 既存の `department_dimension_mappings` 分析
  - 壁打ちでの要件確認
- **Findings**:
  - 既存の `department_dimension_mappings` は配賦/アサイン用（目的が異なる）
  - 予算入力用には新規エンティティ `budget_input_axis_settings` が必要
  - 科目×部門×ディメンションの組み合わせで設定
  - fiscal_year = NULL で全年度適用、department_stable_id = NULL で全部門適用
- **Implications**:
  - 新規エンティティの追加が必要
  - UIはツリー形式で展開表示（科目→ディメンション値）

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| BFFでグリッド構造変換 | フラットなfact_amounts → 行×列のグリッド構造 | UIシンプル化、計算ロジック集約 | BFFの処理負荷 | 採用：本機能に最適 |
| UIでグリッド構造変換 | UIでフラットデータをグリッドに変換 | BFF軽量化 | UI複雑化、計算ロジック分散 | 不採用 |

## Design Decisions

### Decision: BFFでAGGREGATE科目を計算
- **Context**: 集計科目の値をどこで計算するか
- **Alternatives Considered**:
  1. DBでView/Triggerで計算 — リアルタイム性低い
  2. UIで計算 — ビジネスロジックがUIに漏れる
  3. BFFで計算 — UIに最適化されたデータを提供
- **Selected Approach**: BFFで計算
- **Rationale**:
  - subject_rollup_itemsの参照が必要で、これはDomain API/BFFで行うべき
  - UIにビジネスロジックを持たせない原則に従う
  - セル更新時に即座に再計算結果を返せる
- **Trade-offs**: BFFの処理が複雑になる vs UIのシンプルさ
- **Follow-up**: パフォーマンステストで大量科目時の応答時間を確認

### Decision: 自動保存（debounce）採用
- **Context**: 保存タイミングをどうするか
- **Alternatives Considered**:
  1. 保存ボタン方式 — 明示的だがユーザー操作が増える
  2. 自動保存（debounce） — Excel感覚で操作可能
  3. フォーカス移動時保存 — 中間的なアプローチ
- **Selected Approach**: 自動保存（500ms debounce）
- **Rationale**:
  - Excel風操作の要件に合致
  - 保存忘れを防止
  - 連続入力時のAPIコール削減
- **Trade-offs**:
  - ネットワークエラー時の対応が必要
  - 未保存警告の実装が必要
- **Follow-up**: beforeunload での未保存チェック実装

### Decision: 新規エンティティ budget_input_axis_settings
- **Context**: ディメンション展開入力の設定をどう管理するか
- **Alternatives Considered**:
  1. 既存の department_dimension_mappings を拡張 — 目的が異なり不適切
  2. 新規エンティティを作成 — 目的に合った設計が可能
- **Selected Approach**: 新規エンティティ作成
- **Rationale**:
  - department_dimension_mappings は配賦/アサイン用で目的が異なる
  - 予算入力固有の設定（is_required等）を持てる
  - 科目×部門×ディメンション×年度の柔軟な設定が可能
- **Trade-offs**: テーブル増加 vs 設計の明確さ
- **Follow-up**: Phase 1ではシードデータで運用、CRUD画面は将来実装

## Risks & Mitigations
- **大量科目時のパフォーマンス** — BFFでのストリーミング or 仮想スクロール検討
- **同時編集の競合** — 楽観ロック（updated_atチェック）で対応
- **ディメンション展開時のデータ整合性** — トランザクションで fact_amounts + fact_dimension_links を同時操作

## References
- [tech.md](.kiro/steering/tech.md) — 技術憲法（BFF運用ルール）
- [fact_amounts エンティティ](.kiro/specs/entities/02_トランザクション・残高.md) — ファクトデータ構造
- [subjects エンティティ](.kiro/specs/entities/01_各種マスタ.md) — 科目マスタ（AGGREGATE/BASE）
