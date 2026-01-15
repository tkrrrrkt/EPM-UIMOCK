# Research & Design Decisions: allocation-master

---
**Purpose**: 配賦マスタ機能の設計判断に関する調査結果・検討事項を記録する。

---

## Summary
- **Feature**: allocation-master
- **Discovery Scope**: Extension（既存のマスタ系パターンを踏襲）
- **Key Findings**:
  - 4エンティティ（events/steps/targets/drivers）の階層構造でCRUDを実現
  - 既存BFF Contractsパターン（subject-master等）を踏襲可能
  - UI/UX は階層的一画面構成（イベント詳細にステップ一覧埋め込み）が最適

## Research Log

### 既存マスタ系機能のパターン分析
- **Context**: 配賦マスタの設計にあたり、既存のマスタ系機能のContractsパターンを調査
- **Sources Consulted**:
  - `packages/contracts/src/bff/subject-master/index.ts`
  - `packages/contracts/src/bff/project-master/index.ts`
  - `.kiro/steering/tech.md`
  - `.kiro/steering/structure.md`
- **Findings**:
  - Request/Response DTOはcamelCaseで定義
  - ErrorCodesはas constパターンで型安全に定義
  - 階層構造（Tree）を持つエンティティはTreeNode型で表現
- **Implications**:
  - allocation-masterも同様のパターンを採用
  - ステップ一覧はイベント詳細レスポンスに含める

### エンティティ構造の調査
- **Context**: 配賦マスタの4エンティティの関係性と制約を確認
- **Sources Consulted**:
  - `.kiro/specs/entities/01_各種マスタ.md` セクション13
- **Findings**:
  - allocation_events: 配賦処理の「束」（会社別、シナリオタイプ別）
  - allocation_steps: 多段階配賦の「段」（step_no順で実行）
  - allocation_step_targets: 配賦先（部門 or ディメンション値）
  - allocation_drivers: 配賦基準の定義（独立マスタ）
  - 制約:
    - UNIQUE(tenant_id, company_id, event_code)
    - UNIQUE(tenant_id, company_id, event_id, step_no)
    - UNIQUE(tenant_id, company_id, driver_code)
- **Implications**:
  - ステップ削除時はターゲット存在チェック必須
  - イベント削除時はステップ存在チェック必須
  - ドライバ削除時は参照ステップ存在チェック必須

### driver_type と source_type の組み合わせ
- **Context**: 配賦基準の設定パターンを整理
- **Sources Consulted**: エンティティ定義、Phase 1 スコープ
- **Findings**:
  | driver_type | 説明 | source_type | 必須参照 |
  |-------------|------|-------------|----------|
  | FIXED | 固定比率 | MASTER | - |
  | HEADCOUNT | 人員比 | MASTER | - |
  | SUBJECT_AMOUNT | 科目金額比 | FACT | driver_subject_id |
  | MEASURE | 物量比 | MASTER/FACT | measure_key |
  | KPI | KPI比 | KPI | kpi_subject_id |
- **Implications**:
  - UIでdriver_type選択時に必須入力項目を動的切替
  - バリデーションはServiceで実施

### UIパターンの検討
- **Context**: 最適なUI構成を決定
- **Sources Consulted**: requirements.md Req.9, 既存v0生成物
- **Findings**:
  - 階層的一画面構成が効率的
  - イベント一覧 → イベント詳細（ステップ一覧埋め込み）→ ステップダイアログ
  - ステップ順序はドラッグ＆ドロップ + 上下ボタン
  - インクリメンタルサーチ（部門・ディメンション値選択）
- **Implications**:
  - BFFレスポンスはネストした構造（Event with Steps）を返す
  - ステップ順序変更APIは別エンドポイント

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| Flat CRUD | 4エンティティを独立APIで提供 | シンプル、実装容易 | UIからのAPI呼び出し増加 | 却下 |
| Nested Response | イベント詳細にステップ・ターゲットを含める | UIに最適化、リクエスト削減 | レスポンス肥大化の可能性 | **採用** |
| GraphQL | クエリで必要なフィールドのみ取得 | 柔軟性 | 既存スタックと不整合 | 却下（スタック外） |

## Design Decisions

### Decision: BFFレスポンス構造
- **Context**: 階層的なエンティティ構造をUIにどう提供するか
- **Alternatives Considered**:
  1. 個別API（events, steps, targets を別々に取得）
  2. ネストレスポンス（event詳細にsteps配列を含める）
- **Selected Approach**: ネストレスポンス（Option 2）
- **Rationale**:
  - UI操作の流れ（イベント選択→ステップ一覧表示）に最適
  - APIコール数を削減
  - 既存パターン（TreeNode等）と整合
- **Trade-offs**:
  - レスポンスサイズは大きくなる（許容範囲）
  - ステップ数が多い場合のページネーションは将来検討
- **Follow-up**: ステップ数上限の設定（運用ガイドライン）

### Decision: ステップ順序変更API
- **Context**: step_no の更新方法
- **Alternatives Considered**:
  1. 個別更新（step_no を直接PATCH）
  2. 一括更新（step順序配列を送信）
- **Selected Approach**: 一括更新（Option 2）
- **Rationale**:
  - ドラッグ＆ドロップ後に複数step_noが変わる
  - トランザクション整合性を保証
- **Trade-offs**:
  - リクエストサイズ増（許容範囲）
- **Follow-up**: なし

### Decision: Error Policy
- **Context**: BFFのエラーハンドリング方針
- **Selected Approach**: Option A: Pass-through
- **Rationale**:
  - Domain APIエラーをそのまま透過
  - マスタCRUDの標準パターン
  - UI表示用の変換は不要
- **Trade-offs**: なし

### Decision: ドライバ運用（独立マスタ + インライン）
- **Context**: 配賦ドライバをどう管理するか
- **Selected Approach**: 両方をサポート
  - 独立マスタ: allocation_drivers テーブルで事前定義
  - インライン: step内に直接設定（driver_ref_id = null）
- **Rationale**:
  - 再利用性（同じドライバを複数ステップで使用）
  - 柔軟性（ワンオフの設定も可能）
- **Trade-offs**:
  - UIで2つの入力パターンをサポートする必要
- **Follow-up**: インライン設定からドライバ化する機能（将来）

## Risks & Mitigations

- **Risk 1**: ステップ数が多くなった場合のパフォーマンス
  - **Mitigation**: Phase 1 では運用ガイドラインで制限（50ステップ目安）、Phase 2 でページネーション検討

- **Risk 2**: 配賦先の参照整合性（target_type による分岐FK）
  - **Mitigation**: UseCase層でバリデーション、DB制約は将来検討

- **Risk 3**: 固定比率の合計チェック（FIXED時に合計1.0）
  - **Mitigation**: 警告のみ（保存は許可）、計算時にエラー検出

## References
- [エンティティ定義](../../../specs/entities/01_各種マスタ.md) セクション13 - 配賦マスタ
- [tech.md](../../steering/tech.md) - 技術憲法
- [structure.md](../../steering/structure.md) - 構造・責務分離ルール
- [development-process.md](../../steering/development-process.md) - 開発プロセス
