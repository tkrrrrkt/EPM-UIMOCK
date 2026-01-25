# Research & Design Decisions Template

---
**Purpose**: Capture discovery findings, architectural investigations, and rationale that inform the technical design.

**Usage**:
- Log research activities and outcomes during the discovery phase.
- Document design decision trade-offs that are too detailed for `design.md`.
- Provide references and evidence for future audits or reuse.
---

## Summary
- **Feature**: kpi/kpi-master
- **Discovery Scope**: Complex Integration / New Feature
- **Key Findings**:
  - 既存action-plan機能との統合が必要（subject_id → kpi_master_item_id移行）
  - 5新規エンティティ + 3既存エンティティ修正が必要
  - 指標の自動計算ロジックは設計フェーズで方式決定が必要（High Risk）
  - MockBffClient → HttpBffClient の段階的実装パターンが確立済み
  - パネル開閉式UIは既存のCollapsible/Accordionコンポーネントで実現可能

## Research Log
Document notable investigation steps and their outcomes. Group entries by topic for readability.

### [既存アーキテクチャパターンの調査]
- **Context**: KPI管理マスタ機能は既存のaction-plan機能と統合する必要があるため、既存パターンを調査
- **Sources Consulted**:
  - `/apps/web/src/features/kpi/action-plan-core/` - 既存APの実装パターン
  - `/packages/contracts/src/bff/action-plan-core/index.ts` - BFF契約の標準構造
  - `gap-analysis.md` - 実装ギャップ分析結果
- **Findings**:
  - Contracts-first フローが確立: contracts → DB → API → BFF → UI の順
  - UI開発パターン: MockBffClient（開発用）→ HttpBffClient（本番用）の差し替え
  - 状態管理: useState/useEffect（TanStack Query未使用）
  - 命名規則: DTO=camelCase, DB=snake_case
  - 既存action-plan機能は `subjectId` ベースで実装されており、新規は `kpi_master_item_id` を推奨
- **Implications**:
  - 新規Feature（features/kpi/kpi-master）を作成し、既存action-plan機能とは責務分離
  - action_plansテーブルに kpi_master_item_id カラム追加（nullable、subject_idと排他制約）
  - 段階的移行戦略が必要（Phase 1: 新規機能、Phase 2: 既存AP統合）

### [指標の自動計算ロジック]
- **Context**: 指標KPI（kpi_type='METRIC'）は構成要素から実績を自動計算する必要がある
- **Sources Consulted**:
  - `.kiro/specs/entities/02_KPI管理マスタ.md` - メトリクスエンティティ定義
  - Gap analysis - "Research Needed" として記録済み
- **Findings**:
  - metricsテーブルに計算式定義フィールドが存在しない
  - 計算ロジックの実装方式は未確定（DSL / TypeScript関数 / SQL View の3選択肢）
- **Implications**:
  - Phase 1では指標KPIの目標値管理のみ実装（自動計算は Phase 2）
  - 設計フェーズで計算方式を決定し、ADRに記録する必要がある

### [パネル開閉式UIのパフォーマンス]
- **Context**: KPI一覧画面で1000件規模のKPI項目を階層表示する場合のレンダリング性能
- **Sources Consulted**:
  - `/apps/web/src/shared/ui/components/` - 既存UIコンポーネント
  - Gap analysis - "Medium Risk" として記録済み
- **Findings**:
  - Accordion, Collapsible コンポーネントは shadcn/ui ベースで実装済み
  - 仮想化（react-window等）は未導入
  - 既存のaction-plan-listでは100件規模で性能問題なし
- **Implications**:
  - Phase 1ではシンプルな全レンダリング方式を採用
  - 1000件超える場合はサーバーサイドページングまたは仮想化を Phase 2で検討

### [部門階層の権限伝播ロジック]
- **Context**: control_department_stable_ids による部門別閲覧権限の実装方式
- **Sources Consulted**:
  - requirements.md Req 10 - 部門別閲覧権限制御
  - `.kiro/steering/tech.md` - 権限モデル
- **Findings**:
  - 社員マスタの control_department_stable_ids は配列形式で部門IDリストを保持
  - 上位部門が下位部門を自動的に閲覧できるかは要件で未明示
  - RBACベースの権限モデルが確立（epm.kpi.admin / write / read）
- **Implications**:
  - UseCase層で control_department_stable_ids の包含チェックを実装
  - 階層トラバースは Phase 2で検討（Phase 1は明示的登録のみ）

### [非財務KPIの期間コード管理]
- **Context**: 期間コードの自由入力とプリセット選択のバランス
- **Sources Consulted**:
  - requirements.md Req 6 - 非財務KPIの目標・実績入力
  - `.kiro/specs/entities/02_KPI管理マスタ.md` - kpi_fact_amountsエンティティ
- **Findings**:
  - period_code は varchar(32) で自由入力（制約なし）
  - 推奨フォーマット: "2026-Q1", "2026-04", "2026-H1", "2026-ANNUAL"
  - period_start_date / period_end_date は任意項目
- **Implications**:
  - UIではプリセット選択肢（Q1〜Q4, 01月〜12月, H1〜H2, ANNUAL）を提供
  - フリーテキスト入力も許可（カスタム期間対応）

### [データベース層の実装戦略]
- **Context**: 5新規エンティティ + 3既存エンティティ修正の実装順序
- **Sources Consulted**:
  - `/packages/db/prisma/schema.prisma` - 現状は空（generator/datasource のみ）
  - `.kiro/specs/entities/02_KPI管理マスタ.md` - 完全なSQL定義
- **Findings**:
  - Prisma 5.x はCHECK制約の限定的サポート（マイグレーションSQLで直接記述必要）
  - RLSポリシーはマイグレーションSQLで別途定義
- **Implications**:
  - Prismaモデル定義とマイグレーションSQLを分離管理
  - CHECK制約はマイグレーションファイルに raw SQL で記述

## Architecture Pattern Evaluation
List candidate patterns or approaches that were considered. Use the table format where helpful.

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| Option A: 既存拡張 | 既存action-plan-*機能を拡張し、kpi_master_item_id を追加 | 既存機能との統合が容易、段階的移行可能 | 新旧モデル混在による複雑化、tech debt増加 | 責務分離が不明確になる |
| Option B: 新規作成 | KPI管理マスタ専用の新規Feature作成、既存とは責務分離 | 責務分離が明確、既存機能への影響なし、テスト容易性向上 | ファイル数増加（20-30ファイル）、統合インターフェース設計が必要 | 推奨されるが単独では不十分 |
| Option C: ハイブリッド | 新規Feature作成 + 既存Feature連携（段階的統合） | 段階的価値提供、リスク分散、既存機能への影響最小化 | 複数フェーズの計画・調整コスト、一時的な新旧共存期間 | **推奨**: バランスの取れたアプローチ |

**選択**: Option C（ハイブリッドアプローチ）

**理由**:
- Phase 1で新規KPI管理マスタ機能を独立開発し、早期価値提供
- Phase 2で既存action-plan機能との統合を段階的に実施
- 新旧モデルの共存期間を短期間に限定し、tech debtを最小化
- 責務境界が明確で、テスト・保守が容易

## Design Decisions
Record major decisions that influence `design.md`. Focus on choices with significant trade-offs.

### Decision: BFF Error Policy - Pass-through方式を採用

- **Context**: BFFのエラーハンドリング方針を決定する必要がある（tech.md 13.8の必須要件）
- **Alternatives Considered**:
  1. Option A: Pass-through — Domain APIのエラーを原則そのまま返す
  2. Option B: Minimal shaping — UI表示に必要な最小整形のみ許可
- **Selected Approach**: Option A: Pass-through
- **Rationale**:
  - KPI管理マスタ機能のエラーは主にビジネスルール検証（権限、状態遷移、一意制約違反）
  - UI側でエラーコードに基づく表示制御を行うため、Domain APIのエラー情報をそのまま伝達する方が明確
  - BFF側で独自のエラー解釈を持つ必要性がない
- **Trade-offs**:
  - Benefits: シンプルで保守しやすい、Domain APIの権限チェックが明確に機能
  - Compromises: UI側でエラーコード→メッセージ変換が必要
- **Follow-up**: contracts/bff/errors に Domain API のエラーコードを再定義（型定義のみ、意味は変えない）

### Decision: 指標の自動計算はPhase 2へ延期

- **Context**: 指標KPI（kpi_type='METRIC'）の実績値自動計算ロジックが未確定
- **Alternatives Considered**:
  1. Option A: Phase 1で実装（DSL方式） — 計算式を文字列で保存し、ランタイム評価
  2. Option B: Phase 1で実装（TypeScript関数方式） — metrics_id でルーティング
  3. Option C: Phase 2へ延期 — Phase 1は目標値管理のみ
- **Selected Approach**: Option C: Phase 2へ延期
- **Rationale**:
  - metricsテーブルの計算式定義方法が未確定（スキーマ変更が必要）
  - Phase 1では指標KPIの目標値管理のみ実装し、早期リリース優先
  - 計算ロジックの要件を Phase 2で詳細化してから実装する方が品質高い
- **Trade-offs**:
  - Benefits: Phase 1のスコープを絞り、リスク低減、早期リリース可能
  - Compromises: Phase 1では指標KPIの実績値が表示されない（目標値のみ）
- **Follow-up**: Phase 2で metrics テーブルに calculation_expression カラム追加を検討

### Decision: MockBffClient先行開発パターンを踏襲

- **Context**: UI開発時にBFF実装を待たずに進める方式
- **Alternatives Considered**:
  1. Option A: BFF先行 — BFF実装完了後にUI開発開始
  2. Option B: Mock先行 — MockBffClientで動作確認後、HttpBffClientで本番接続
  3. Option C: 並行開発 — UI/BFF/APIを同時並行
- **Selected Approach**: Option B: Mock先行（既存パターン踏襲）
- **Rationale**:
  - 既存action-plan-*機能で実績あるパターン
  - UI側で早期に動作確認・仕様フィードバック獲得可能
  - BFF/API実装との並行作業が可能（開発効率向上）
- **Trade-offs**:
  - Benefits: 開発速度向上、仕様変更への柔軟性、早期フィードバック
  - Compromises: MockとHttpの2実装が必要（ただし差し替え点は明確）
- **Follow-up**: api/BffClient.ts（interface）, MockBffClient.ts, HttpBffClient.ts の3ファイルを標準化

### Decision: パネル開閉UIはシンプル実装（仮想化は Phase 2）

- **Context**: KPI一覧画面で大量KPI項目を表示する場合のパフォーマンス最適化
- **Alternatives Considered**:
  1. Option A: 全レンダリング — シンプル実装、1000件まで許容
  2. Option B: 仮想化 — react-window等の導入
  3. Option C: サーバーサイドページング — 階層表示との相性検証必要
- **Selected Approach**: Option A: 全レンダリング（Phase 1）
- **Rationale**:
  - 既存action-plan-listで100件規模は性能問題なし
  - Phase 1では500件以下を想定（初期運用）
  - パフォーマンス問題が顕在化してから最適化する方が合理的
- **Trade-offs**:
  - Benefits: 実装シンプル、階層表示との相性良い、開発速度向上
  - Compromises: 1000件超える場合は性能劣化の可能性
- **Follow-up**: Phase 2でユーザーフィードバックに基づき、仮想化またはページングを検討

## Risks & Mitigations
- Risk 1: 指標の自動計算ロジックが未確定（High） — Phase 2へ延期し、要件詳細化後に実装
- Risk 2: 既存action-plan機能との統合コスト（Medium） — ハイブリッドアプローチで段階的移行
- Risk 3: 部門階層の権限伝播ロジックが未明確（Medium） — Phase 1は明示的登録のみ、Phase 2で階層トラバース検討
- Risk 4: 大量KPI項目でのパネルUI性能（Medium） — Phase 1は全レンダリング、Phase 2で最適化
- Risk 5: Prisma CHECK制約の限界（Low） — マイグレーションSQLで直接記述（技術的には既知の対応方法）

## References
Provide canonical links and citations (official docs, standards, ADRs, internal guidelines).
- [Prisma CHECK Constraints](https://www.prisma.io/docs/concepts/components/prisma-schema/data-model#defining-check-constraints) — Prisma 5.x でのCHECK制約サポート
- [Gap Analysis](gap-analysis.md) — 実装ギャップ分析結果
- [Entity Definitions](.kiro/specs/entities/02_KPI管理マスタ.md) — 完全なエンティティ定義
- [Steering: tech.md](.kiro/steering/tech.md) — 技術憲法（マルチテナント、権限、BFF）
- [Steering: structure.md](.kiro/steering/structure.md) — 構造憲法（Contracts-first、責務分離）
