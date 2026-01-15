# Research & Design Decisions

---
**Purpose**: プロジェクトマスタ機能の設計調査および意思決定記録

---

## Summary
- **Feature**: `master-data/project-master`
- **Discovery Scope**: Extension（既存基盤への CRUD マスタ追加、社員マスタと同一パターン）
- **Key Findings**:
  - 社員マスタ（employee-master）と同一アーキテクチャパターンを採用可能
  - NestJS + Prisma 既存基盤が整備済み（PrismaService に tenant context 設定機能あり）
  - マルチテナント RLS パターンは `setTenantContext()` で確立済み

## Research Log

### 社員マスタとの共通パターン分析
- **Context**: プロジェクトマスタを社員マスタと同一パターンで実装するための確認
- **Sources Consulted**:
  - `.kiro/specs/master-data/employee-master/design.md`
  - `.kiro/specs/master-data/employee-master/research.md`
  - `apps/api/src/prisma/prisma.service.ts`
- **Findings**:
  - 社員マスタと同一の 3 層アーキテクチャ（UI → BFF → API → DB）
  - tenant_id + company_id + project_code の複合一意制約
  - is_active による無効化運用（FK 参照のため物理削除禁止）
  - Error Policy: Pass-through（標準 CRUD）
- **Implications**:
  - 社員マスタの設計をベースにプロジェクト固有属性（description, startDate, endDate）を追加
  - sortBy ホワイトリストをプロジェクト固有に変更（projectCode, projectName, startDate, endDate）

### プロジェクト固有属性の設計
- **Context**: プロジェクトマスタ特有の属性定義
- **Sources Consulted**: requirements.md
- **Findings**:
  - 必須項目: projectCode, projectName
  - オプション項目: description（説明）, startDate（開始日）, endDate（終了日）
  - 社員マスタの hireDate/leaveDate に相当する startDate/endDate
- **Implications**:
  - description は Text 型（長文対応）
  - startDate/endDate は Date 型（時刻不要）

### データモデル整合性
- **Context**: 将来の FK 参照を考慮したデータモデル設計
- **Sources Consulted**: requirements.md Out of Scope
- **Findings**:
  - project_budgets, project_actuals, project_members が projects.id を FK 参照予定
  - 物理削除は禁止、is_active による無効化運用
- **Implications**:
  - id は UUID
  - FK 参照元への影響を考慮し、無効化/再有効化操作を提供

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| 社員マスタ同一パターン | Controller → Service → Repository 3層 | 既存パターン踏襲、学習コスト低 | 特になし | 採用 |
| 独自パターン | プロジェクト固有設計 | 柔軟性 | 一貫性欠如、保守コスト増 | 不採用 |

## Design Decisions

### Decision: DTO 命名規則（社員マスタ踏襲）
- **Context**: UI/BFF/API 間の型定義における命名規則
- **Alternatives Considered**:
  1. snake_case 統一 — DB カラムと一致
  2. camelCase 統一 — JavaScript/TypeScript 慣例
- **Selected Approach**: camelCase（DTO）/ snake_case（DB）の分離
- **Rationale**: 社員マスタと同一、steering tech.md で規定済み
- **Trade-offs**: Mapper での変換が必要だが、層間の責務が明確化
- **Follow-up**: BFF Mapper で snake_case → camelCase 変換を実装

### Decision: Error Policy（社員マスタ踏襲）
- **Context**: BFF でのエラーハンドリング方針
- **Alternatives Considered**:
  1. Option A: Pass-through — Domain API エラーをそのまま返却
  2. Option B: Minimal shaping — UI 表示用に最小整形
- **Selected Approach**: Option A: Pass-through
- **Rationale**:
  - プロジェクトマスタは標準的な CRUD 操作であり、特別な UI 整形不要
  - 社員マスタと同一方針で一貫性確保
- **Trade-offs**: UI 側でエラーコードに基づく表示制御が必要
- **Follow-up**: contracts/api/errors に PROJECT_NOT_FOUND 等を定義

### Decision: ページング正規化（社員マスタ踏襲）
- **Context**: 一覧取得時のページング パラメータ変換
- **Selected Approach**: BFF で page/pageSize → offset/limit 変換
- **Rationale**: 社員マスタと同一、steering で規定済み
- **Follow-up**:
  - defaults: page=1, pageSize=50
  - clamp: pageSize <= 200
  - transform: offset = (page - 1) * pageSize

### Decision: sortBy ホワイトリスト
- **Context**: ソート対象カラムの制限
- **Selected Approach**: ホワイトリスト方式（projectCode, projectName, startDate, endDate）
- **Rationale**: 社員マスタと同一方針、SQL インジェクション防止
- **Trade-offs**: 新規ソート対象追加時に BFF 変更必要
- **Follow-up**: 許可リスト: projectCode, projectName, startDate, endDate

## Risks & Mitigations
- **Risk 1**: RLS 設定漏れによるテナント間データ漏洩
  - **Mitigation**: Repository 全メソッドで tenant_id 必須化、統合テストで検証（社員マスタと同一）
- **Risk 2**: プロジェクトコード重複エラーの UX 低下
  - **Mitigation**: 登録前に DB 確認、明確なエラーメッセージ提供
- **Risk 3**: 大量データでのページング性能劣化
  - **Mitigation**: インデックス設計、pageSize 上限制限

## References
- [employee-master/design.md](../employee-master/design.md) — 社員マスタ設計（ベースパターン）
- [NestJS Documentation](https://docs.nestjs.com/) — モジュール構成、DI パターン
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference) — モデル定義、制約
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) — 行レベルセキュリティ設定
- `.kiro/steering/tech.md` — 技術憲法（マルチテナント、Contracts-first）
- `.kiro/steering/structure.md` — 構造憲法（SSoT、レイヤー分離）
