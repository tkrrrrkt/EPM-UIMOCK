# Research Log: workflow/approval

## Summary

**Discovery Type**: Light Discovery (Extension)
**Date**: 2026-01-15

### Scope
承認ワークフロー機能の技術設計に先立ち、既存パターンと統合ポイントを分析。

### Key Findings
1. 既存ContractsパターンがBFF/API分離で確立済み
2. permission-settingsの実装パターンが参考になる
3. 新規エンティティ2テーブル + 既存テーブル変更2件
4. 状態遷移ロジックはDomain APIに集約

---

## Research Log

### Topic 1: 既存Contractsパターンの確認

**Investigation**: `packages/contracts/src/bff/permission-settings/index.ts` を分析

**Findings**:
- Request/Response DTOの命名規則: `Bff{Action}{Entity}{Request|Response}`
- Enum定義はcontractsファイル内に配置
- Error Codes は `const + type` パターンで定義
- camelCaseでDTO、snake_caseはDB層に閉じ込め

**Implications**:
- 承認ワークフローも同パターンを踏襲
- `BffApprovalListRequest`, `BffApprovalDetailResponse` 等の命名

---

### Topic 2: 状態遷移の設計方針

**Investigation**: エンティティ定義の状態遷移図を分析

**Findings**:
- 5ステータス: DRAFT → PENDING → APPROVED / REJECTED / WITHDRAWN
- 再提出時は常に第1段階からリスタート
- 垂直代理承認（上位者スキップ）の考慮が必要

**Design Decision**:
- 状態遷移の正当性チェックはDomain API Serviceに集約
- BFFは入力正規化とDTO変換のみ
- 履歴テーブルへの書き込みはトランザクション内で実行

---

### Topic 3: 通知機能の統合

**Investigation**: メール通知の実装方針

**Findings**:
- employees.email を宛先として使用
- 固定文言 + 変数埋め込み（テンプレートカスタマイズ画面は作らない）

**Design Decision**:
- NotificationService（仮）をDomain API内に配置
- 非同期送信（キュー）は将来拡張として設計
- Phase 1 は同期送信で実装（シンプル優先）

---

### Topic 4: 承認権限判定ロジック

**Investigation**: 垂直代理承認の実装パターン

**Findings**:
- 第N承認者は第1〜第N段階を承認可能
- 本人・代理の両方をチェック
- departments テーブルの10カラムを参照

**Design Decision**:
- `ApprovalPermissionChecker` をService層に実装
- 判定ロジック:
  1. 操作者のemployee_idを取得
  2. 対象部門のapprover_N_employee_id / approver_N_deputy_employee_id と照合
  3. current_step ≤ N であれば承認可能

---

## Architecture Pattern Evaluation

### Pattern: 固定段階承認（Fixed-Stage Approval）

**Pros**:
- シンプルで運用しやすい
- 設定・監査が容易
- 状態遷移が明確

**Cons**:
- 柔軟性は低い（可変ルート不可）
- 組織改編時のメンテナンスコスト

**Decision**: 採用（MVP要件に合致）

---

## Technology Alignment

| Layer | Technology | Alignment |
|-------|------------|-----------|
| API | NestJS | 既存パターン踏襲 |
| BFF | NestJS | 既存パターン踏襲 |
| UI | Next.js + React | 既存パターン踏襲 |
| Contracts | TypeScript DTO | 既存パターン踏襲 |
| DB | PostgreSQL + Prisma | 既存パターン踏襲 |

**新規依存**: なし（既存スタックで実装可能）

---

## Integration Points

### 1. departments テーブル
- **変更**: 10カラム追加（承認者設定）
- **影響**: 部門マスタ Feature に設定UIが必要

### 2. plan_events テーブル
- **変更**: purpose_type カラム追加
- **影響**: イベント作成 Feature でCORPORATE/DIVISIONAL選択が必要

### 3. employees テーブル
- **参照**: email カラムを通知で使用
- **影響**: なし（既存カラム）

---

## Identified Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| 承認ループ（再帰的承認） | Medium | 自己承認禁止ロジック |
| 組織改編時の承認者設定 | Low | stable_id での追跡、コピー機能 |
| メール送信失敗 | Low | リトライ + 監査ログ記録 |
| 同時承認操作 | Medium | 楽観的ロック（version カラム） |

---

## Open Questions

1. **Q**: 同一人物が複数段階の承認者になれるか？
   - **A**: 可能（上位段階で一括承認として扱う）

2. **Q**: 代理承認者不在時の動作は？
   - **A**: 本人承認のみ有効（代理はNULL許容）

---

## Next Steps

1. design.md の生成
2. Contracts（BFF/API）の詳細定義
3. Prisma Schema の追加
4. UI コンポーネント設計

