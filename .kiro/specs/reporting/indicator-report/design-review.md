# 財務指標分析レポート - Design Review

## Review Summary

| 項目 | 結果 |
|------|------|
| **判定** | **GO** |
| レビュー日 | 2026-01-26 |
| レビュアー | Claude Code |
| 対象ドキュメント | design.md v1.0 |

---

## 1. レビュー観点

### 1.1 既存アーキテクチャとの整合性

| チェック項目 | 結果 | コメント |
|-------------|------|---------|
| BFF/API分離 | OK | UI → BFF → Domain API の境界が明確 |
| Contracts-first | OK | BFF/API契約を先に定義、実装は契約に従属 |
| tenant_id double-guard | OK | Repository + RLS の二重防御を明記 |
| Error Policy | OK | Pass-through を選択、理由を明記 |

### 1.2 設計の一貫性と標準準拠

| チェック項目 | 結果 | コメント |
|-------------|------|---------|
| DTO命名規則 | OK | camelCase（DTO）/ snake_case（DB）を遵守 |
| Enum定義 | OK | const + type パターンに準拠 |
| Error定義 | OK | ErrorCode const + Error interface パターンに準拠 |
| 既存パターン参照 | OK | budget-actual-report の契約パターンを踏襲 |

### 1.3 拡張性と保守性

| チェック項目 | 結果 | コメント |
|-------------|------|---------|
| 責務分離 | OK | Layout/FactAmount/KpiFactAmount/Metric の各サービスに分離 |
| データ合成ロジック | OK | 各データソースの取得・集計ロジックを明確に分離 |
| 式評価 | WARN | formula_expr の評価エンジン選定はADRで検討推奨 |

### 1.4 型安全性とインターフェース設計

| チェック項目 | 結果 | コメント |
|-------------|------|---------|
| Request/Response型 | OK | 全エンドポイントにDTO定義あり |
| null許容 | OK | 欠損値はnullで表現、UI側で「-」表示 |
| Enum型安全 | OK | as const + type で型安全を確保 |

---

## 2. Critical Issues

**なし** - 設計に重大な問題は見つかりませんでした。

---

## 3. Recommendations（推奨事項）

### 3.1 ADR作成推奨: 指標計算エンジン

| 項目 | 内容 |
|------|------|
| 対象 | metrics.formula_expr の評価エンジン |
| 理由 | セキュリティ（eval禁止）と拡張性の観点で方針を明確化すべき |
| 候補 | mathjs / expr-eval / 独自パーサー |
| Traceability | FR-3.3 |
| Evidence | design.md Section 5.3 |

**対応**: tasks.md の Decisions フェーズで ADR 作成タスクを追加済み

### 3.2 パフォーマンス考慮

| 項目 | 内容 |
|------|------|
| 対象 | 大量部門の配下集約時のクエリ |
| 理由 | 100部門以上の配下集約時にクエリが遅くなる可能性 |
| 対応案 | 部門階層のマテリアライズドビュー検討（将来課題） |

**対応**: NFR-1（3秒以内）を満たせない場合に検討。初期実装では通常のクエリで対応。

---

## 4. エンティティ整合性確認

### 4.1 確認済みエンティティ

| エンティティ | entities/*.md | design.md | 整合性 |
|------------|---------------|-----------|--------|
| indicator_report_layouts | Section 7.3 | Section 4.1 | OK |
| indicator_report_layout_lines | Section 7.4 | Section 4.1 | OK |
| companies.indicator_report_layout_id | Section 1.2 | Section 4.1 | OK |
| fact_amounts | 02_トランザクション | Section 5.1 | OK |
| kpi_master_events | 02_KPI管理マスタ | Section 5.2 | OK |
| kpi_fact_amounts | 02_KPI管理マスタ | Section 5.2 | OK |
| metrics | Section 3.4 | Section 5.3 | OK |

### 4.2 DTO-DBマッピング確認

| 項目 | 結果 |
|------|------|
| camelCase/snake_case変換 | OK |
| 型変換（varchar→String, uuid→String等） | OK |
| NULL許可の反映 | OK |

---

## 5. Requirements Traceability 確認

| Requirement | Design対応 | 確認結果 |
|-------------|-----------|---------|
| FR-1.1 〜 FR-1.3 | Section 3.1 Layout Response | OK |
| FR-2.1 〜 FR-2.5 | Section 3.1 LayoutLineType | OK |
| FR-3.1 〜 FR-3.4 | Section 5 データ合成ロジック | OK |
| FR-4.1 〜 FR-4.4 | Section 3.1 Request DTOs | OK |
| FR-5.1 〜 FR-5.3 | Section 5.2 非財務KPI | OK |
| FR-6.1 〜 FR-6.4 | Section 5.2 期間コード変換 | OK |
| FR-7.1, FR-7.2 | Section 5.4 差分計算 | OK |
| FR-8.1 | Section 3.1 Response (null = 欠損) | OK |
| NFR-1 〜 NFR-4 | Section 2 Architecture Responsibilities | OK |

---

## 6. 判定結果

### GO 判定理由

1. **アーキテクチャ整合性**: 既存パターン（budget-actual-report等）と一貫した設計
2. **Contracts-first準拠**: BFF/API契約が明確に定義されている
3. **エンティティ整合性**: entities/*.md との整合性を確認済み
4. **Requirements Traceability**: 全要件に対応する設計セクションが存在
5. **Critical Issuesなし**: 重大な設計問題は見つからず

### 条件付き事項

- 指標計算エンジンの選定は tasks.md Phase 1（Decisions）で ADR 作成

---

## 7. 次のステップ

1. **tasks.md 作成** - Contracts-first順序でタスク分解
2. **ADR作成** - 指標計算エンジン方針決定
3. **Contracts実装** - BFF/API契約をコードに落とし込み
4. **以降、tasks.mdに従い実装**

---

## 変更履歴

| 日付 | 変更内容 | 担当 |
|------|---------|------|
| 2026-01-26 | 初版作成・GO判定 | Claude Code |
