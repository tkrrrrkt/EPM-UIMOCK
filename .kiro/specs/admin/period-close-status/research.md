# Research & Design Decisions: admin/period-close-status

---
**Purpose**: 月次締処理状況管理機能の設計判断とリサーチログ

---

## Summary
- **Feature**: `admin/period-close-status`
- **Discovery Scope**: Extension（既存accounting_periodsエンティティへの機能追加）
- **Key Findings**:
  - 締めステータスは既存 accounting_periods.close_status で管理済み（OPEN/SOFT_CLOSED/HARD_CLOSED）
  - period_close_logs は新規エンティティとして追加（INSERT-only監査ログ）
  - 状態遷移は OPEN → SOFT_CLOSED → HARD_CLOSED の一方向が基本（SOFT_CLOSED → OPEN の差し戻しのみ許可）

## Research Log

### 既存エンティティ構造の確認
- **Context**: accounting_periods の締め状態管理カラムとその制約を確認
- **Sources Consulted**: `.kiro/specs/entities/01_各種マスタ.md` セクション 2.1, 2.2
- **Findings**:
  - `close_status`: varchar(20), NOT NULL, DEFAULT 'OPEN'
  - `closed_at`: timestamptz, NULL（本締め日時）
  - CHECK制約: `close_status IN ('OPEN','SOFT_CLOSED','HARD_CLOSED')`
- **Implications**: 既存スキーマを変更する必要なし。period_close_logs のみ新規追加

### 締め状態遷移ルールの確認
- **Context**: 仕様概要から状態遷移の業務ルールを確認
- **Sources Consulted**: `.kiro/specs/仕様概要/月次締処理状況管理.md`
- **Findings**:
  - HARD_CLOSED は不可逆（差し戻し不可）
  - 仮締め実行時は前月 HARD_CLOSED チェック必須
  - 差し戻し（SOFT_CLOSED → OPEN）は理由記録推奨
- **Implications**: 状態遷移バリデーションは Domain API で集約実装

### BFF Contracts の事前定義確認
- **Context**: 仕様概要で定義された BFF Contracts が既に実装済みか確認
- **Sources Consulted**: `packages/contracts/src/bff/period-close-status/index.ts`
- **Findings**:
  - 全 DTO（Request/Response）が仕様概要に準拠して定義済み
  - エラーコードも定義済み（PeriodCloseStatusErrorCode）
  - checkResults 配列でチェック結果を返却する設計
- **Implications**: Contracts は変更不要。設計は既存 Contracts に準拠

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| 標準 3-tier | UI → BFF → Domain API → DB | 既存パターン踏襲、実績あり | 特になし | **採用** |

## Design Decisions

### Decision: Error Policy の選択
- **Context**: BFF の Error Policy として Pass-through と Minimal shaping のどちらを採用するか
- **Alternatives Considered**:
  1. Option A: Pass-through（Domain API エラーをそのまま返却）
  2. Option B: Minimal shaping（UI表示用に最小整形）
- **Selected Approach**: Option A: Pass-through
- **Rationale**:
  - 締め処理はシンプルな状態遷移でエラーパターンが限定的
  - Domain API のエラーメッセージがそのまま UI 表示に適している
  - BFF での追加判断は不要
- **Trade-offs**: エラーメッセージの国際化対応が Domain API 依存になる
- **Follow-up**: 将来の国際化要件時に再検討

### Decision: 監査ログのテーブル設計
- **Context**: 締め操作の監査ログをどのように記録するか
- **Alternatives Considered**:
  1. 汎用 audit_logs テーブルに統合
  2. 専用 period_close_logs テーブルを新設
- **Selected Approach**: 専用テーブル（period_close_logs）
- **Rationale**:
  - 締め処理固有の項目（from_status, to_status, notes）を明示的に管理
  - 監査クエリが簡潔になる
  - 将来の部門単位締め拡張時にも対応しやすい
- **Trade-offs**: テーブル数の増加
- **Follow-up**: 実績取込完了判定のフィールド追加は Phase 2 で検討

## Risks & Mitigations
- **Risk 1**: 前月チェックのパフォーマンス → 期間データは年度内12件程度のため問題なし
- **Risk 2**: 並行締め操作による競合 → 楽観ロック（updated_at チェック）で対応

## References
- [仕様概要](/.kiro/specs/仕様概要/月次締処理状況管理.md) — 業務仕様の正本
- [エンティティ定義](/.kiro/specs/entities/01_各種マスタ.md) — accounting_periods, period_close_logs の定義
- [Steering/tech.md](/.kiro/steering/tech.md) — 技術憲法（RLS、監査ログ要件）
