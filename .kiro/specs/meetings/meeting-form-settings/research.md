# Research & Design Decisions - 報告フォーム設定

---
**Purpose**: 報告フォーム設定（A3）の設計に影響する調査結果と意思決定を記録する。

---

## Summary

- **Feature**: meetings/meeting-form-settings
- **Discovery Scope**: Extension（既存 meetings モジュールの拡張）
- **Key Findings**:
  1. meeting-type-master（A1/A2）の BffClient パターンを踏襲可能
  2. management-meeting-report BFF Module を拡張して実装
  3. ドラッグ＆ドロップ並べ替えは @dnd-kit/core を採用（既存プロジェクトパターン）

---

## Research Log

### Topic 1: 既存パターン調査

- **Context**: A1/A2（会議種別マスタ）が実装済み。A3 の設計パターンを確認
- **Sources Consulted**:
  - `apps/web/src/features/meetings/meeting-type-master/api/bff-client.ts`
  - `apps/bff/src/modules/meetings/management-meeting-report/`
  - `.kiro/specs/meetings/department-submission/design.md`
- **Findings**:
  - BffClient Interface パターン（BffClient + MockBffClient + HttpBffClient）が確立
  - BFF は Mock Data で動作確認後、HttpBffClient に差し替えるワークフロー
  - 階層構造（Section → Field）は department-submission の Form → FormField に類似
- **Implications**:
  - 同一パターンを適用し、一貫性を保つ
  - プレビューコンポーネントは C1（部門報告登録）と共通化の機会あり

### Topic 2: ドラッグ＆ドロップライブラリ選定

- **Context**: FR-5（セクション並べ替え）、FR-13（項目並べ替え）でドラッグ＆ドロップが必要
- **Sources Consulted**:
  - プロジェクト内の既存実装調査（dnd-kit 使用有無）
  - @dnd-kit/core 公式ドキュメント
- **Findings**:
  - @dnd-kit/core は React 向けモダン DnD ライブラリ
  - accessibility 対応、TypeScript サポート良好
  - sortable プリセット（@dnd-kit/sortable）で並べ替えが容易
- **Implications**:
  - @dnd-kit/core + @dnd-kit/sortable を採用
  - useSortable フックでセクション・項目の並べ替えを実装

### Topic 3: フォームビルダーの UI パターン

- **Context**: A3 はフォームの「構造」を設定するメタ画面
- **Sources Consulted**:
  - 一般的なフォームビルダー UI（Google Forms, Typeform 等）
  - 本プロジェクト UI パターン定義
- **Findings**:
  - 左ペイン（構造ツリー） + 右ペイン（詳細設定）の 2 カラム構成が標準
  - アコーディオン形式でセクションを展開・折りたたみ
  - プレビューは別画面またはモーダルで表示
- **Implications**:
  - 2 カラム構成を採用（ツリー + 詳細）
  - プレビューは別ルートで全画面表示（C1 と共通化）

### Topic 4: options_json / validation_json の UI 設計

- **Context**: SELECT/MULTI_SELECT の選択肢、検証ルールの編集 UI が必要
- **Sources Consulted**:
  - requirements.md FR-9, FR-10 の仕様
  - 仕様検討 5.4 meeting_form_fields
- **Findings**:
  - options_json: `[{value, label}]` 形式
  - validation_json: `{min?, max?, allowedTypes?, maxSize?, pattern?}` 形式
  - 項目タイプによって表示する設定項目が変わる（条件分岐）
- **Implications**:
  - 項目タイプ選択時に動的フォーム切り替えを実装
  - JSON は UI 側で構造化オブジェクトとして扱い、保存時に JSON 化

---

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| Option A: 単一モジュール | 既存 management-meeting-report に追加 | コード集約、共通サービス利用可能 | モジュール肥大化の懸念 | **採用** |
| Option B: 独立モジュール | meeting-form-settings として独立 | 責務分離が明確 | 共通コード重複 | 見送り |

**Decision**: Option A（既存モジュール拡張）を採用。管理系エンドポイント群として cohesion が高い。

---

## Design Decisions

### Decision: BFF エンドポイント配置

- **Context**: フォーム設定 API を既存 BFF にどう追加するか
- **Alternatives Considered**:
  1. `/bff/meetings/form-sections/:typeId` 形式（会議種別起点）
  2. `/bff/meetings/meeting-types/:typeId/form` 形式（リソースネスト）
- **Selected Approach**: Option 1（`/bff/meetings/form-sections/:typeId`）
- **Rationale**: セクション・項目が独立したリソースとして CRUD される。ネストが深くなりすぎない。
- **Trade-offs**: URL パスで関連が見えにくいが、typeId パラメータで明示
- **Follow-up**: OpenAPI スキーマでグルーピング

### Decision: プレビューコンポーネントの共通化

- **Context**: A3 のプレビュー画面と C1（部門報告登録）の入力フォームは同一構造
- **Alternatives Considered**:
  1. A3 専用プレビューコンポーネント
  2. 共通 FormPreview コンポーネントを shared に配置
- **Selected Approach**: Option 2（共通化）
- **Rationale**: 同一フォーム構造を 2 箇所で実装するとメンテナンスコスト増
- **Trade-offs**: 共通化による抽象化コスト
- **Follow-up**: C1 実装時に共通化を適用（本 Spec では A3 側のみ先行実装）

### Decision: Error Policy

- **Context**: BFF の Error Policy 選択（design.md 必須事項）
- **Selected Approach**: **Option A: Pass-through**
- **Rationale**: マスタ CRUD は Domain API のエラーをそのまま返せば十分。UI 側での特別な整形不要。

---

## Risks & Mitigations

- **Risk 1**: セクション・項目の大量削除時のパフォーマンス
  - **Mitigation**: CASCADE DELETE を利用。大量データは想定外（テナント単位で数十件程度）
- **Risk 2**: options_json の不正な形式
  - **Mitigation**: BFF で Zod スキーマ検証を実施
- **Risk 3**: 並べ替え時の sort_order 競合
  - **Mitigation**: 並べ替え API で一括更新（個別 PATCH ではない）

---

## References

- [dnd-kit Documentation](https://docs.dndkit.com/) — ドラッグ＆ドロップライブラリ
- [仕様検討/経営会議レポート機能](../../仕様検討/20260115_経営会議レポート機能.md) — エンティティ定義 5.3, 5.4
- [meeting-type-master bff-client](../../../../apps/web/src/features/meetings/meeting-type-master/api/bff-client.ts) — BffClient パターン参考
