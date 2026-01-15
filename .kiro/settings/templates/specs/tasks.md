# Implementation Plan

> CCSDD / SDD 前提：**contracts-first**（bff → api → shared）を最優先し、境界違反を guard で止める。  
> UI は最後。v0 は **Phase 1（統制テスト）→ Phase 2（本実装）** の二段階で扱う。

---

## 0. Design Completeness Gate（Blocking）

> Implementation MUST NOT start until all items below are checked.
> These checks are used to prevent “empty design sections” from being silently interpreted by implementers/AI.

- [ ] 0.1 Designの「BFF Specification（apps/bff）」が埋まっている
  - BFF endpoints（UIが叩く）が記載されている
  - Request/Response DTO（packages/contracts/src/bff）が列挙されている
  - **Paging/Sorting正規化（必須）が明記されている**
    - UI/BFF: page/pageSize、Domain API: offset/limit
    - defaults（例: page=1, pageSize=50）
    - clamp（例: pageSize≤200）
    - whitelist（sortBy許可リスト）
    - normalize（keyword trim、空→undefined）
    - transform（page→offset/limit）
  - 変換（api DTO → bff DTO）の方針が記載されている
  - エラー整形方針（**contracts/bff/errors** に準拠）が記載されている
  - tenant_id/user_id の取り回し（解決・伝搬ルール）が記載されている

- [ ] 0.2 Designの「Service Specification（Domain / apps/api）」が埋まっている
  - Usecase（Create/Update/Inactivate等）が列挙されている
  - 主要ビジネスルールの所在（Domainに置く／置かない）が記載されている
  - トランザクション境界が記載されている
  - 監査ログ記録ポイントが記載されている

- [ ] 0.3 Designの「Repository Specification（apps/api）」が埋まっている
  - 取得・更新メソッド一覧が記載されている（tenant_id必須）
  - where句二重ガードの方針（tenant_id常時指定）が記載されている
  - RLS前提（set_config前提）が記載されている

- [ ] 0.4 Designの「Contracts Summary（This Feature）」が埋まっている
  - packages/contracts/src/bff 側の追加・変更DTOが列挙されている
  - packages/contracts/src/api 側の追加・変更DTOが列挙されている
  - **Enum / Error の配置ルールが明記されている**
    - 原則 `packages/contracts/src/shared/**` に集約
    - 再定義禁止（feature配下に置かない）
  - 「UIは packages/contracts/src/api を参照しない」ルールが明記されている

- [ ] 0.5 Requirements Traceability（必要な場合）が更新されている
  - 主要Requirementが、BFF/API/Repo/Flows等の設計要素に紐づいている

- [ ] 0.6 v0生成物の受入・移植ルールが確認されている
  - v0生成物は必ず `apps/web/_v0_drop/<context>/<feature>/src` に一次格納されている
  - v0出力はそのまま `apps/web/src` に配置されていない
  - v0_drop 配下に **layout.tsx が存在しない**（AppShell以外の殻禁止）
  - UIは MockBffClient で動作確認されている（BFF未接続状態）
  - 移植時に以下を確認している
    - UIはBFFのみを呼び出している
    - `packages/contracts/src/api` をUIが参照していない
    - UIは `packages/contracts/src/bff` のみ参照している
    - 画面ロジックが Feature 配下に閉じている

- [ ] 0.7 Structure / Boundary Guard がパスしている
  - `npx tsx scripts/structure-guards.ts` が成功している
  - UI → Domain API の直接呼び出しが存在しない
  - UIでの直接 fetch() が存在しない（HttpBffClient 例外のみ）
  - BFFがDBへ直接アクセスしていない

---

## 1. Scaffold / Structure Setup（最初に実施）

- [ ] 1.0 Feature骨格生成（Scaffold）
  - 実行: `npx tsx scripts/scaffold-feature.ts <context> <feature>`
  - 例: `npx tsx scripts/scaffold-feature.ts master-data employee-master`
  - 目的: 正しい配置先を先に確定させる（v0混入防止）
  - 確認:
    - `apps/web/src/features/<context>/<feature>` が作成されている
    - `apps/bff/src/modules/<context>/<feature>` が作成されている
    - `apps/api/src/modules/<context>/<feature>` が作成されている
    - `apps/web/_v0_drop/<context>/<feature>` が作成されている

---

## 2. Work Breakdown Rules（タスク分解の規約）

- **Order（必須）**: Decisions → Contracts → DB → Domain API → BFF → UI
- **Contracts-first（必須）**:
  - 先に `packages/contracts/src/bff` を確定
  - 次に `packages/contracts/src/api` を確定
  - Enum / Error は原則 `packages/contracts/src/shared/**`
- **UI Two-Phase（推奨）**:
  - Phase 1: v0統制テスト（MockBffClientで動作、見た目完成は目的外）
  - Phase 2: 本実装（URL state / debounce / 実BFF接続 / E2E）

---

## 3. Task Format Template

Use whichever pattern fits the work breakdown.

### Major task only
- [ ] {{NUMBER}}. {{TASK_DESCRIPTION}}{{PARALLEL_MARK}}
  - {{DETAIL_ITEM_1}} *(Include details only when needed. If the task stands alone, omit bullet items.)*
  - _Requirements: {{REQUIREMENT_IDS}}_

### Major + Sub-task structure
- [ ] {{MAJOR_NUMBER}}. {{MAJOR_TASK_SUMMARY}}
- [ ] {{MAJOR_NUMBER}}.{{SUB_NUMBER}} {{SUB_TASK_DESCRIPTION}}{{SUB_PARALLEL_MARK}}
  - {{DETAIL_ITEM_1}}
  - {{DETAIL_ITEM_2}}
  - _Requirements: {{REQUIREMENT_IDS}}_ *(IDs only; do not add descriptions or parentheses.)*

> **Parallel marker**: Append ` (P)` only to tasks that can be executed in parallel. Omit the marker when running in `--sequential` mode.
>
> **Optional test coverage**: When a sub-task is deferrable test work tied to acceptance criteria, mark the checkbox as `- [ ]*` and explain the referenced requirements in the detail bullets.
