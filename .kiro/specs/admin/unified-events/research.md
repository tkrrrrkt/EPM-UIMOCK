# Research & Design Decisions: unified-events

---
**Purpose**: 統一イベント管理機能のディスカバリー結果と設計判断を記録する

---

## Summary
- **Feature**: `unified-events`
- **Discovery Scope**: Extension（既存システムの拡張）
- **Key Findings**:
  - 各イベントタイプは異なるテーブル構造を持つが、BFFアダプターパターンで統一ビューを提供可能
  - 既存の `approval` / `period-close-status` 契約パターンを踏襲できる
  - Phase 1 では Mock データのみで動作確認（Domain API は後回し）

## Research Log

### イベントテーブル構造の調査
- **Context**: 各イベント種別のデータソースと構造を把握する必要がある
- **Sources Consulted**:
  - `.kiro/specs/entities/01_各種マスタ.md`
  - `.kiro/specs/entities/03_承認ワークフロー.md`
  - `.kiro/specs/仕様概要/経営会議レポート機能.md`
- **Findings**:
  - BUDGET/FORECAST: `plan_events` + `plan_versions` + `department_approval_status`
  - MEETING: `meeting_events` + `meeting_submissions`
  - MTP: `mtp_events`（部門別登録なし）
  - GUIDELINE: `guideline_events`（部門別登録なし）
- **Implications**: アダプターパターンで各データソースを統一DTOに変換する設計が適切

### 既存BFF契約パターンの調査
- **Context**: プロジェクト内の契約パターンを踏襲する
- **Sources Consulted**:
  - `packages/contracts/src/bff/approval/index.ts`
  - `packages/contracts/src/bff/period-close-status/index.ts`
- **Findings**:
  - Enum は `as const` + 型エクスポート
  - Request/Response DTO は `Bff` プレフィックス
  - Error Code は専用 const オブジェクト
  - ページネーションは `page` / `pageSize` / `totalCount`
- **Implications**: 既存パターンに完全準拠した契約設計を行う

### 登録状況ステータスマッピングの設計
- **Context**: イベント種別ごとに異なるステータスを統一表現に変換する必要がある
- **Findings**:
  - BUDGET/FORECAST: `department_approval_status.status` (DRAFT/PENDING/APPROVED/REJECTED/WITHDRAWN)
  - MEETING: `meeting_submissions.status` (DRAFT/SUBMITTED/APPROVED)
  - 共通化: NOT_STARTED / IN_PROGRESS / SUBMITTED / APPROVED / REJECTED / OVERDUE
- **Implications**: BFFアダプターで変換ロジックを実装、UIには統一ステータスのみ露出

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| A: 直接クエリ | BFFから各テーブルを直接JOIN | シンプル | BFFにDB接続が必要（禁止） | 却下 |
| B: 個別API呼出 | 既存Domain APIを個別呼出して集約 | 既存APIを活用 | N+1問題、複雑なマッピング | Phase 2向け |
| **C: Mockアダプター** | BFFでMockデータを返却 | 迅速なUI検証 | 実データなし | **Phase 1採用** |

## Design Decisions

### Decision: Phase 1 は BFF + Mock のみ
- **Context**: UI検証を迅速に行いたいが、Domain API の実装は後回し
- **Alternatives Considered**:
  1. 全レイヤー実装 — 時間がかかる
  2. Mock のみ — UI検証に十分
- **Selected Approach**: MockBffClient で UI 検証、HttpBffClient は Phase 2
- **Rationale**: CCSDDのv0ワークフローに準拠し、UI-MOCK フェーズとして実装
- **Trade-offs**: 実データ連携は後回しになるが、UI/UX の早期検証が可能
- **Follow-up**: Phase 2 で Domain API 実装後に HttpBffClient を完成

### Decision: アダプターパターンによるイベント統一
- **Context**: 5種類のイベントを統一インターフェースで表示する
- **Alternatives Considered**:
  1. DBレベル統一 — 大規模改修が必要
  2. BFFアダプター — 既存DB構造を維持
- **Selected Approach**: BFF内でアダプターを用意し、各イベントを統一DTOに変換
- **Rationale**: 既存システムへの影響を最小化しつつ、UIには一貫したインターフェースを提供
- **Trade-offs**: BFF層に変換ロジックが集中するが、責務は明確

### Decision: 登録状況管理は BUDGET/FORECAST/MEETING のみ対象
- **Context**: 部門別の入力・提出が発生するイベントのみ登録状況管理が必要
- **Selected Approach**: MTP/GUIDELINE は一覧表示のみ、登録状況タブは無効化
- **Rationale**: MTP/GUIDELINE は全社単位の管理であり、部門別トラッキングの概念がない

## Risks & Mitigations
- **Risk 1**: Mock と実装の乖離 — Phase 2 開始時に契約を再レビュー
- **Risk 2**: ステータスマッピングの複雑化 — マッピングテーブルを design.md に明記
- **Risk 3**: パフォーマンス（多数イベント取得時）— ページネーション必須

## References
- [承認ワークフロー仕様](../.kiro/specs/entities/03_承認ワークフロー.md)
- [経営会議レポート機能](../.kiro/specs/仕様概要/経営会議レポート機能.md)
- [v0ワークフロー](.kiro/steering/v0-workflow.md)
