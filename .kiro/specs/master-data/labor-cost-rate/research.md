# Research Log: labor-cost-rate

## Summary

**Discovery Type**: Light（既存パターン踏襲型）

労務費予算単価マスタは、既存のemployee-masterと同様のCRUDパターンで実装可能なシンプルなマスタ管理機能である。有効期間（effective_date / expiry_date）による時系列管理と、基準日検索が特徴的な要素。

---

## Discovery Scope

- 既存マスタ機能（employee-master）のパターン分析
- エンティティ定義（labor_cost_rates）の確認
- 有効期間フィルタリングロジックの設計
- 金額表示フォーマット（¥ / 桁区切り / /時）の実装方針

---

## Research Log

### Topic 1: 既存マスタパターンの踏襲

**Source**: `.kiro/specs/master-data/employee-master/design.md`

**Findings**:
- UI → BFF → Domain API → DB の4層構造
- BFFでpage/pageSize → offset/limit変換
- Error Policy: Pass-through
- tenant_id + company_id による複合キー
- is_active による論理削除

**Implications**:
- 同一パターンで実装可能
- 追加要素は有効期間フィルタリング（asOfDate）のみ

### Topic 2: 有効期間フィルタリング

**Decision**:
- BFFで `asOfDate`（基準日）パラメータを受け取る
- Domain APIで `effective_date <= asOfDate AND (expiry_date IS NULL OR expiry_date > asOfDate)` でフィルタ
- デフォルト基準日は当日（BFFで設定）

**Rationale**:
- 将来単価の事前登録・参照を許容するため、基準日は変更可能とする
- 有効期間の重複チェックは不要（rate_codeが一意のため）

### Topic 3: 金額フォーマット

**Decision**:
- フォーマット処理はUI責務（BFF/APIは生の数値を返す）
- planned_rate: Decimal型（Prismaで`Decimal`、TypeScriptで`string`として扱う）
- 表示形式はUIで制御：
  - MONTHLY: `¥{number.toLocaleString()}`
  - HOURLY: `¥{number.toLocaleString()}/時`

**Rationale**:
- tech.md により金額はDecimal型必須
- フォーマットはロケール依存のためUI責務が適切

### Topic 4: sortBy ホワイトリスト

**Decision**:
- 許可リスト: `rateCode | jobCategory | grade | effectiveDate | plannedRate`
- employee-masterと同様のパターン

---

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Error Policy | Option A: Pass-through | 標準CRUDであり特別な整形不要 |
| 金額型 | Decimal (Prisma) / string (DTO) | tech.md準拠、精度保証 |
| 基準日デフォルト | 当日（BFF責務） | 初期表示で有効単価のみ表示 |
| フォーマット | UI責務 | ロケール依存、BFF/APIは生値返却 |

---

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| 大量データでの性能劣化 | 低 | 中 | インデックス設計、pageSize上限200 |
| Decimal精度問題 | 低 | 高 | Prisma Decimal型、文字列でDTO伝搬 |

---

## Open Questions

- 特になし（employee-masterパターン踏襲で解決）

---
